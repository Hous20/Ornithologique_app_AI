# detect-bird (Supabase Edge Function)

This function receives an image payload from the frontend and calls a Roboflow classification model.

## Request body

```json
{
  "imageBase64": "...",
  "filename": "bird.jpg",
  "contentType": "image/jpeg"
}
```

## Roboflow response examples

```json
{
  "top": "European Robin",
  "confidence": 0.93,
  "predictions": [
    { "class": "European Robin", "confidence": 0.93 },
    { "class": "Blackbird", "confidence": 0.05 }
  ]
}
```

## Function response

```json
{
  "species": "European Robin",
  "confidence": 93,
  "auto_saved": false
}
```

## Required Supabase secrets

- `ROBOFLOW_PROJECT_ID` (example: `bird-species-classification-abcde`)
- `ROBOFLOW_MODEL_VERSION` (example: `3`)
- `ROBOFLOW_API_KEY`

## Deploy

```bash
supabase functions deploy detect-bird
supabase secrets set ROBOFLOW_PROJECT_ID="..."
supabase secrets set ROBOFLOW_MODEL_VERSION="..."
supabase secrets set ROBOFLOW_API_KEY="..."
```
