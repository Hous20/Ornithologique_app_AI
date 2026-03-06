import { supabase } from "../lib/supabaseClient";

const DETECT_FUNCTION_NAME = import.meta.env.VITE_SUPABASE_DETECT_FUNCTION || "detect-bird";
const IMAGE_BUCKET = import.meta.env.VITE_SUPABASE_IMAGE_BUCKET || "bird-images";
const TABLE_TAXONOMIE = "Taxonomie";
const TABLE_ESPECE = "Espece";
const TABLE_IMAGE = "Image";

function formatWithUnit(value, unit) {
  const cleaned = String(value || "").trim();
  if (!cleaned) return null;
  return cleaned.toLowerCase().includes(unit) ? cleaned : `${cleaned} ${unit}`;
}

function normalizeBirdRow(row) {
  const images = row.images || row.Image || row.image || [];
  const firstImage = Array.isArray(images) ? images[0] : null;
  const taxonomie = row.taxonomie || row.Taxonomie || null;

  return {
    id: row.id,
    nom: row.nom,
    nombre_individus: row.nombre_individus,
    longevite: row.longevite,
    taille: row.taille,
    poids: row.poids,
    status: row.status,
    taxonomie_id: row.taxonomie_id,
    ordre: taxonomie?.ordre,
    famille: taxonomie?.famille,
    genre: taxonomie?.genre,
    imageUrl: firstImage?.url || null,
  };
}

export async function getBirds() {
  const { data, error } = await supabase
    .from(TABLE_ESPECE)
    .select(
      `
      id,
      nom,
      nombre_individus,
      longevite,
      taille,
      poids,
      status,
      taxonomie_id,
      taxonomie:${TABLE_TAXONOMIE} (ordre, famille, genre),
      images:${TABLE_IMAGE} (url)
    `
    )
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map(normalizeBirdRow);
}

export async function getBirdDetails(birdId) {
  const { data, error } = await supabase
    .from(TABLE_ESPECE)
    .select(
      `
      id,
      nom,
      nombre_individus,
      longevite,
      taille,
      poids,
      status,
      taxonomie_id,
      taxonomie:${TABLE_TAXONOMIE} (ordre, famille, genre),
      images:${TABLE_IMAGE} (url)
    `
    )
    .eq("id", birdId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const bird = normalizeBirdRow(data);
  return {
    ...bird,
    taxonomie: {
      ordre: bird.ordre,
      famille: bird.famille,
      genre: bird.genre,
    },
  };
}

export async function getBirdsDetailsTable() {
  const { data, error } = await supabase
    .from(TABLE_ESPECE)
    .select("id, nom, nombre_individus, taille")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function addBird(payload) {
  const longevite = formatWithUnit(payload.longevite, "ans");
  const taille = formatWithUnit(payload.taille, "cm");
  const poids = String(payload.poids || "").trim() || null;
  const status = String(payload.status || "").trim() || "Stable";

  const rpcPayload = {
    p_nom: payload.nomCommun,
    p_nombre_individus: Number(payload.nombreIndividus),
    p_longevite: longevite,
    p_taille: taille,
    p_poids: poids,
    p_status: status,
    p_ordre: payload.ordre,
    p_famille: payload.famille,
    p_genre: payload.genre,
  };

  const { data, error } = await supabase.rpc("insert_espece_with_taxonomie", rpcPayload);

  if (!error) {
    return data;
  }

  // Backward compatibility: support previous RPC signature without p_status.
  const legacyRpcPayload = {
    p_nom: payload.nomCommun,
    p_nombre_individus: Number(payload.nombreIndividus),
    p_longevite: longevite,
    p_taille: taille,
    p_poids: poids,
    p_ordre: payload.ordre,
    p_famille: payload.famille,
    p_genre: payload.genre,
  };

  const { data: legacyData, error: legacyError } = await supabase.rpc(
    "insert_espece_with_taxonomie",
    legacyRpcPayload
  );

  if (!legacyError) {
    return legacyData;
  }

  // Fallback for projects where RPC is not yet created.
  let taxId = null;

  const { data: existingTax, error: existingTaxError } = await supabase
    .from(TABLE_TAXONOMIE)
    .select("id")
    .eq("ordre", payload.ordre)
    .eq("famille", payload.famille)
    .eq("genre", payload.genre)
    .maybeSingle();

  if (existingTaxError) throw new Error(existingTaxError.message);

  if (existingTax?.id) {
    taxId = existingTax.id;
  } else {
    const { data: taxData, error: taxError } = await supabase
      .from(TABLE_TAXONOMIE)
      .insert({
        ordre: payload.ordre,
        famille: payload.famille,
        genre: payload.genre,
      })
      .select("id")
      .single();

    if (taxError) {
      if (taxError.code === "23505") {
        // Sequence mismatch or concurrent insert. Re-read row first.
        const { data: raceTax, error: raceTaxError } = await supabase
          .from(TABLE_TAXONOMIE)
          .select("id")
          .eq("ordre", payload.ordre)
          .eq("famille", payload.famille)
          .eq("genre", payload.genre)
          .maybeSingle();

        if (raceTaxError) throw new Error(raceTaxError.message);
        if (raceTax?.id) {
          taxId = raceTax.id;
        } else {
          throw new Error(
            "Conflit Taxonomie (23505): execute backend/supabase_setup.sql pour resynchroniser les sequences."
          );
        }
      } else {
        throw new Error(taxError.message);
      }
    } else {
      taxId = taxData.id;
    }
  }

  const { data: speciesData, error: speciesError } = await supabase
    .from(TABLE_ESPECE)
    .insert({
      nom: payload.nomCommun,
      nombre_individus: Number(payload.nombreIndividus),
      longevite,
      taille,
      poids,
      status,
      taxonomie_id: taxId,
    })
    .select("id")
    .single();

  if (speciesError) throw new Error(speciesError.message);
  return speciesData;
}

export async function addBirdImage({ especeId, imageFile, imageUrl }) {
  let finalUrl = imageUrl?.trim() || "";

  if (imageFile) {
    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectPath = `${especeId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(objectPath, imageFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type || "application/octet-stream",
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(objectPath);
    finalUrl = publicData.publicUrl;
  } else if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
    finalUrl = `https://${finalUrl}`;
  }

  if (!finalUrl) {
    throw new Error("URL image manquante");
  }

  const { data: duplicate, error: duplicateError } = await supabase
    .from(TABLE_IMAGE)
    .select("id")
    .eq("url", finalUrl)
    .eq("espece_id", especeId)
    .maybeSingle();

  if (duplicateError) throw new Error(duplicateError.message);
  if (duplicate) {
    const err = new Error("Image deja enregistree pour cette espece");
    err.code = "DUPLICATE_IMAGE";
    throw err;
  }

  const { error: insertError } = await supabase.from(TABLE_IMAGE).insert({
    url: finalUrl,
    espece_id: especeId,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      const err = new Error("Image deja enregistree pour cette espece");
      err.code = "DUPLICATE_IMAGE";
      throw err;
    }
    throw new Error(insertError.message);
  }
}

export async function detectBird(imageFile) {
  if (!DETECT_FUNCTION_NAME) {
    throw new Error("Fonction IA non configuree (VITE_SUPABASE_DETECT_FUNCTION).");
  }

  const buffer = await imageFile.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";

  // Convert image bytes to base64 payload for Edge Function transport.
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  const imageBase64 = btoa(binary);

  const { data, error } = await supabase.functions.invoke(DETECT_FUNCTION_NAME, {
    body: {
      imageBase64,
      filename: imageFile.name,
      contentType: imageFile.type || "application/octet-stream",
    },
  });

  if (error) {
    throw new Error(error.message || "Erreur lors de l'analyse");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Reponse IA invalide");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
