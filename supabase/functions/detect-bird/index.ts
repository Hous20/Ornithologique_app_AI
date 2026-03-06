import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type DetectRequest = {
  imageBase64?: string;
  filename?: string;
  contentType?: string;
};

type RoboflowPrediction = {
  class?: string;
  confidence?: number;
};

type RoboflowResponse = {
  top?: string;
  confidence?: number;
  predictions?: RoboflowPrediction[] | Record<string, { confidence?: number }>;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const projectId = Deno.env.get("ROBOFLOW_PROJECT_ID");
  const modelVersion = Deno.env.get("ROBOFLOW_MODEL_VERSION");
  const apiKey = Deno.env.get("ROBOFLOW_API_KEY");

  if (!projectId || !modelVersion || !apiKey) {
    return json(
      {
        error:
          "Roboflow not configured. Set ROBOFLOW_PROJECT_ID, ROBOFLOW_MODEL_VERSION, ROBOFLOW_API_KEY in Supabase secrets.",
      },
      500
    );
  }

  let payload: DetectRequest;

  try {
    payload = (await req.json()) as DetectRequest;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!payload?.imageBase64) {
    return json({ error: "imageBase64 is required" }, 400);
  }

  const roboflowUrl = new URL(`https://classify.roboflow.com/${projectId}/${modelVersion}`);
  roboflowUrl.searchParams.set("api_key", apiKey);

  // Roboflow hosted API accepts base64 body with x-www-form-urlencoded content type.
  const providerResponse = await fetch(roboflowUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.imageBase64,
  });

  let providerData: unknown = null;
  try {
    providerData = await providerResponse.json();
  } catch {
    // Keep null and report readable error below.
  }

  if (!providerResponse.ok) {
    return json(
      {
        error: "Provider request failed",
        status: providerResponse.status,
        details: providerData,
      },
      502
    );
  }

  const data = providerData as RoboflowResponse | null;

  let species: string | null = null;
  let confidence: number | null = null;

  if (data?.top && typeof data.confidence === "number") {
    species = data.top;
    confidence = data.confidence;
  }

  if ((!species || confidence === null) && Array.isArray(data?.predictions) && data?.predictions.length) {
    const sorted = [...data.predictions].sort(
      (a, b) => (b.confidence ?? 0) - (a.confidence ?? 0)
    );
    species = sorted[0]?.class ?? null;
    confidence = sorted[0]?.confidence ?? null;
  }

  if ((!species || confidence === null) && data?.predictions && !Array.isArray(data.predictions)) {
    const entries = Object.entries(data.predictions)
      .map(([label, value]) => ({ label, confidence: value?.confidence ?? 0 }))
      .sort((a, b) => b.confidence - a.confidence);
    if (entries.length) {
      species = entries[0].label;
      confidence = entries[0].confidence;
    }
  }

  if (!species || confidence === null) {
    return json(
      {
        error: "Roboflow response format invalid",
        details: providerData,
      },
      502
    );
  }

  return json({
    species,
    confidence: Number((confidence * 100).toFixed(2)),
    auto_saved: false,
  });
});
