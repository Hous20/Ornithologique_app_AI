# Guide technique - Ornithologique_app_AI

Ce document decrit la configuration actuelle du projet et la mise en place deploiement sur Render.

## Architecture cible

Le projet est maintenant organise pour une architecture Supabase-first:

- `my-app/`: frontend React + Vite (application principale).
- `supabase/`: fonctions Edge (dont `detect-bird`) et configuration liee.
- `backend/`: code legacy local (non utilise en production Render).

En production:

- Le frontend est deployee en Static Site sur Render.
- Les donnees et images sont lues/ecrites dans Supabase (`Taxonomie`, `Espece`, `Image`, Storage bucket).
- La detection IA passe par une Supabase Edge Function (pas par Flask).

## Stack technique

- Frontend: React, Vite, React Router, sonner, lucide-react.
- Data layer: `@supabase/supabase-js`.
- Backend logique cloud: Supabase Database + Storage + Edge Functions.
- Hebergement: Render Static Site via `render.yaml`.

## Lancement local (dev)

### Prerequis

- Node.js 20+
- pnpm

### Frontend

```powershell
cd my-app
pnpm install
pnpm dev
```

URL locale: `http://localhost:5173`

### Variables locales frontend

Creer `my-app/.env.local` a partir de `my-app/.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_IMAGE_BUCKET=bird-images
VITE_SUPABASE_DETECT_FUNCTION=detect-bird
```

## Base Supabase

Schema principal:

- `Taxonomie`
- `Espece`
- `Auteur`
- `Image`

Script de setup: `backend/supabase_setup.sql`

Il configure notamment:

- contrainte anti doublon `UNIQUE(url, espece_id)` sur `Image`
- RPC `insert_espece_with_taxonomie`
- reseed des sequences
- policies RLS temporaires pour phase publique

## Detection IA (Supabase Edge Function)

Fichier: `supabase/functions/detect-bird/index.ts`

Contrat d'appel frontend:

- input JSON: `imageBase64`, `filename`, `contentType`
- output JSON attendu: `species`, `confidence`, `auto_saved`

Secrets a definir dans Supabase (pas dans Git):

- `ROBOFLOW_PROJECT_ID`
- `ROBOFLOW_MODEL_VERSION`
- `ROBOFLOW_API_KEY`

Exemple de deploiement fonction (CLI Supabase):

```bash
supabase functions deploy detect-bird
supabase secrets set ROBOFLOW_PROJECT_ID="..."
supabase secrets set ROBOFLOW_MODEL_VERSION="..."
supabase secrets set ROBOFLOW_API_KEY="..."
```

## Deploiement Render

La config est versionnee dans `render.yaml`.

Service configure:

- type: static (`runtime: static`)
- rootDir: `my-app`
- build: `pnpm install && pnpm build`
- publish: `dist`
- route rewrite SPA: `/* -> /index.html`

### Etapes Render (dashboard)

1. Pousser le repo sur GitHub.
2. Dans Render: `New > Blueprint` puis selectionner le repo.
3. Valider la creation du service `ornithologique-web`.
4. Renseigner les variables `sync: false` au premier deploy.

### Variables Render (frontend)

Obligatoires:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Avec valeurs par defaut dans `render.yaml`:

- `VITE_SUPABASE_IMAGE_BUCKET=bird-images`
- `VITE_SUPABASE_DETECT_FUNCTION=detect-bird`

## Verification post deploy

Checklist minimale:

1. Page `/Oiseau` charge les especes.
2. Page detail `/Oiseau/:id` charge taxonomie + image.
3. Ajout espece fonctionne sans 409.
4. Upload image fonctionne dans le bucket Supabase.
5. Page `/detect` retourne une prediction depuis l'Edge Function.

## Notes de securite

- Ne jamais commit de secrets (`.env.local`, tokens provider).
- Les cles `VITE_*` sont publiques par nature (bundle frontend).
- La protection reelle des donnees passe par RLS et policies SQL.

## Legacy

`backend/` est conserve pour reference locale/historique, mais n'est pas requis dans l'architecture Render de production.
