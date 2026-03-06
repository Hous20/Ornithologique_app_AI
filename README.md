# Ornithologique_app_AI

Application web éducative et collaborative dédiée aux oiseaux du monde. Les utilisateurs peuvent consulter des espèces, comparer des caractéristiques, ajouter de nouvelles espèces et soumettre des photographies. Une page de détection IA permet d'identifier un oiseau à partir d'une image.

Le projet est maintenant orienté **Supabase-first** avec un **frontend React/Vite** déployé en static sur Render. Vous trouverez la documentation technique et le runbook de déploiement dans [DOCS.md](./DOCS.md).

## Démarrage rapide

1. Démarrer le client :
   ```powershell
   cd my-app
   pnpm install
   pnpm dev
   ```
2. Accéder à `http://localhost:5173` dans votre navigateur.

## Déploiement Render

- Le dépôt inclut `render.yaml` pour un déploiement Blueprint.
- Le service Render cible `my-app/` en static site.
- Les variables frontend Supabase sont à renseigner dans Render (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

> Pour plus de détails, reportez-vous au fichier DOCS.md.
```
note : La partie concernant l'ia détéction ne fonctionne pas encore dû à un problème avec hugginface
