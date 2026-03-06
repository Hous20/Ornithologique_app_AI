# Guide technique - Ornithologique_app_AI

Ce document regroupe les informations principales pour comprendre, exécuter et étendre l'application ornithologique.

---

## Architecture du projet

Le workspace est divisé en deux dossiers :

- `backend/` : serveur Flask (Python) avec base SQLite.
- `my-app/` : frontend React (Vite) écrit en JSX/TSX.

La communication se fait par une API REST exposée par Flask et consommée par le client.

## Technologies utilisées

- **Backend** : Flask, SQLAlchemy, SQLite, CORS, Werkzeug.
- **Frontend** : React (Vite), React Router v6, lucide-react icônes, sonner pour les toasts.
- **Styling** : CSS modulaires avec un thème rem-based (conversion px→rem appliquée).

## Installation & démarrage

### Prérequis

- Python 3.10+ et `pip`.
- Node.js 18+ et `pnpm` (ou npm/yarn).

### Backend

1. Se positionner dans `backend/`.
2. Créer un environnement virtuel :
   ```powershell
   python -m venv .venv
   . .venv/Scripts/Activate.ps1
   ```
3. Installer les dépendances :
   ```powershell
   pip install flask flask-cors sqlalchemy werkzeug
   ```
4. Lancer le serveur :

   ```powershell
   python app.py
   ```

   - L'API écoute sur `http://127.0.0.1:5000`.
   - La base `birds.db` est créée à la première exécution.

> **Remarque** : en cas de modification du schéma (ajout de contrainte), supprimer `birds.db` pour recréer la table.

### Frontend

1. Aller dans `my-app/`.
2. Installer via :
   ```powershell
   pnpm install
   ```
3. Démarrer le serveur de développement :
   ```powershell
   pnpm dev
   ```
4. Ouvrir le navigateur à `http://localhost:5173`.

## API endpoints

- `GET /api/Oiseau` : liste des espèces avec image associée si existante.
- `GET /api/Oiseau/<id>` : détail d'une espèce.
- `POST /api/images` : création d'une image (fichier ou URL) pour une espèce.
- `POST /api/detect` : route d'identification automatisée (IA) utilisée par la page de détection.

## Frontend : navigation et pages principales

Le client utilise un routeur configuré dans `src/routes.js`.

| Route          | Composant         | Description                              |
| -------------- | ----------------- | ---------------------------------------- |
| `/`            | `Home`            | Page d'accueil / fonctionnalités         |
| `/Oiseau`      | `ListOiseau`      | Liste de tous les oiseaux                |
| `/Oiseau/:id`  | `DetailsOiseau`   | Fiche d'une espèce                       |
| `/add-species` | `AjoutOiseau`     | Formulaire de création d'espèce          |
| `/add-image`   | `AjoutImage`      | Formulaire de téléversement d'image      |
| `/detect`      | `OiseauDetection` | Page de reconnaissance IA (upload image) |

Le composant `Navigation` (barre en haut) expose les liens.

## Composants utiles

- `Card`, `CardHeader`, `CardContent`, `CardTitle` : wrapper stylés
- `Input`, `Label`, `Button` : composants formulaire
- `Notification` via `sonner` pour retours utilisateurs

## Schéma de la base de données

4 tables : `Taxonomie`, `Espece`, `Auteur`, `Image`.

- `Image` possède désormais `UNIQUE(url, espece_id)` pour empêcher les doublons.
- `Auteur` est généré automatiquement selon l'agent utilisateur.

## Style & responsive

- Tous les fichiers CSS utilisent des unités `rem` et sont convertis depuis d'anciennes valeurs en pixels.
- Structure flex orientée colonne pour que l'application s'étende en hauteur.

## Historique des fonctionnalités clés

1. Conversion px→rem dans l'ensemble des feuilles de style.
2. Layout corrigé (flex-column + wrappers) pour que la page remplisse l'écran.
3. Formulaire d'ajout d'image avec choix URL ou fichier + preview.
4. Toasts sonner pour succès/erreur et réinitialisation automatique.
5. Validation backend pour URL, unique par espèce et génération d'`auteur_id`.
6. Fallback graphique pour images cassées (placeholder remote).
7. Page de détection IA ajoutée (`/detect`).

## Guide d'extension

- **Ajouter une nouvelle route** : modifier `routes.js`, créer le composant et ajouter un lien dans `Navigation.jsx`.
- **Nouveau champ de formulaire** : modifier le composant, gérer l'état React et adapter l'API backend.
- **Base de données** : mettre à jour la liste `table_creation_list_query` et recréer `birds.db`.

## Licence & crédits

Projet personnel/app pédagogique. Housni

---

Pour toute question ou modification, consultez le code source ou ouvrez une issue sur le dépôt GitHub.
