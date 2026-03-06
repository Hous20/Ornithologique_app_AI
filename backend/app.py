from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine, text
import os
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import requests
import time


app = Flask(__name__)
CORS(app)

# Connexion à la base de données
engine = create_engine('sqlite:///birds.db')

# 1. LISTE DE CRÉATION (L'ordre est vital ici)
# NOTE: if you modify table schemas (e.g. add UNIQUE constraints),
# you must delete the existing birds.db or recreate the affected tables
# because SQLite won't retroactively apply the changes to the file.
# The `CREATE TABLE IF NOT EXISTS` blocks will run, but constraints won't
# be added to an already existing table, so drop the database when
# changing column definitions.
table_creation_list_query = [
    # On crée d'abord la table dont les autres dépendent
    """CREATE TABLE IF NOT EXISTS Taxonomie (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ordre VARCHAR(100),
        famille VARCHAR(100),
        genre VARCHAR(100)
    );""",
    """CREATE TABLE IF NOT EXISTS Espece (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom VARCHAR(100) NOT NULL,
        nombre_individus INTEGER,
        longevite VARCHAR(50),
        taille VARCHAR(50),
        poids VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Stable',
        taxonomie_id INTEGER,
        FOREIGN KEY (taxonomie_id) REFERENCES Taxonomie(id)
    );""",
    """CREATE TABLE IF NOT EXISTS Auteur (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom VARCHAR(100) NOT NULL
    );""",
    """CREATE TABLE IF NOT EXISTS Image (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url VARCHAR(255) NOT NULL,
        espece_id INTEGER,
        auteur_id INTEGER,
        FOREIGN KEY (espece_id) REFERENCES Espece(id),
        FOREIGN KEY (auteur_id) REFERENCES Auteur(id),
        UNIQUE(url, espece_id)
    );"""
]

# On lance la création des tables
with engine.begin() as conn:
    for query in table_creation_list_query:
        conn.execute(text(query))
# Liste des requêtes d'insertion pour peupler la base de données
# Utilise "INSERT OR IGNORE" pour éviter les erreurs "UNIQUE constraint failed"
table_insert_queries = [
    # --- Table Auteur (Donnée de base) ---
    "INSERT OR IGNORE INTO Auteur (id, nom) VALUES (1, 'Contributeur Unsplash');",

    # --- 1. Aigle royal ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (1, 'Accipitriformes', 'Accipitridae', 'Aquila');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (1, 'Aigle royal', 250, '25 ans', '90 cm', '3630-6700g', 1);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (1, 'https://images.unsplash.com/photo-1547371012-b629e5c2a23a', 1, 1);",

    # --- 2. Petit Pingouin ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (2, 'Charadriiformes', 'Alcidae', 'Alca');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (2, 'Petit Pingouin', 300, '20 ans', '39 cm', '500-750g', 2);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (2, 'https://images.unsplash.com/photo-1551316679-9c6ae9dec224', 2, 1);",

    # --- 3. Colibri à gorge rubis ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (3, 'Apodiformes', 'Trochilidae', 'Archilochus');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (3, 'Colibri à gorge rubis', 5000, '5 ans', '9 cm', '2-6g', 3);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (3, 'https://images.unsplash.com/photo-1634519280033-05c55fef26e2', 3, 1);",

    # --- 4. Hibou grand-duc ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (4, 'Strigiformes', 'Strigidae', 'Bubo');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (4, 'Hibou grand-duc', 180, '20 ans', '75 cm', '1500-4200g', 4);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (4, 'https://images.unsplash.com/photo-1581523779871-c5347cba43b7', 4, 1);",

    # --- 5. Martin-pêcheur d'Europe ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (5, 'Coraciiformes', 'Alcedinidae', 'Alcedo');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (5, 'Martin-pêcheur d''Europe', 420, '7 ans', '17 cm', '34-46g', 5);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (5, 'https://images.unsplash.com/photo-1699331868919-f2d508d0c792', 5, 1);",

    # --- 6. Faucon pèlerin ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (6, 'Falconiformes', 'Falconidae', 'Falco');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (6, 'Faucon pèlerin', 350, '15 ans', '48 cm', '600-1300g', 6);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (6, 'https://images.unsplash.com/photo-1643810774784-bd6510664eaa', 6, 1);",

    # --- 7. Flamant rose ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (7, 'Phoenicopteriformes', 'Phoenicopteridae', 'Phoenicopterus');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (7, 'Flamant rose', 8000, '30 ans', '145 cm', '2000-4000g', 7);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (7, 'https://images.unsplash.com/photo-1594069484142-d65c3c816a01', 7, 1);",

    # --- 8. Macareux moine ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (8, 'Charadriiformes', 'Alcidae', 'Fratercula');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (8, 'Macareux moine', 600, '25 ans', '30 cm', '380-550g', 8);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (8, 'https://images.unsplash.com/photo-1700933468562-84f6698c7b2b', 8, 1);",

    # --- 9. Chouette effraie ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (9, 'Strigiformes', 'Tytonidae', 'Tyto');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (9, 'Chouette effraie', 520, '18 ans', '35 cm', '250-480g', 9);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (9, 'https://images.unsplash.com/photo-1719909872111-a199feb6d959', 9, 1);",

    # --- 10. Pic épeiche ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (10, 'Piciformes', 'Picidae', 'Dendrocopos');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (10, 'Pic épeiche', 1200, '11 ans', '24 cm', '70-98g', 10);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (10, 'https://images.unsplash.com/photo-1768985439879-a692f2742149', 10, 1);",

    # --- 11. Mésange bleue ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (11, 'Passeriformes', 'Paridae', 'Cyanistes');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (11, 'Mésange bleue', 3500, '8 ans', '12 cm', '9-13g', 11);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (11, 'https://images.unsplash.com/photo-1647438894842-76386d470ba0', 11, 1);",

    # --- 12. Cygne tuberculé ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (12, 'Ansériformes', 'Anatidae', 'Cygnus');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (12, 'Cygne tuberculé', 900, '20 ans', '152 cm', '8-15kg', 12);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (12, 'https://images.unsplash.com/photo-1662785423038-b25ce7a0c98d', 12, 1);",

    # --- 13. Hirondelle rustique ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (13, 'Passeriformes', 'Hirundinidae', 'Hirundo');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (13, 'Hirondelle rustique', 4500, '6 ans', '19 cm', '16-24g', 13);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (13, 'https://images.unsplash.com/photo-1762090241141-22bbd1f3a293', 13, 1);",

    # --- 14. Perroquet gris du Gabon ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (14, 'Psittaciformes', 'Psittacidae', 'Psittacus');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (14, 'Perroquet gris du Gabon', 150, '50 ans', '33 cm', '400-650g', 14);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (14, 'https://images.unsplash.com/photo-1626133830160-2d463a6b64a7', 14, 1);",

    # --- 15. Albatros hurleur ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (15, 'Procellariiformes', 'Diomedeidae', 'Diomedea');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (15, 'Albatros hurleur', 220, '60 ans', '115 cm', '6-12kg', 15);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (15, 'https://images.unsplash.com/photo-1552243048-431d0c4e1bad', 15, 1);",

    # --- 16. Toucan toco ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (16, 'Piciformes', 'Ramphastidae', 'Ramphastos');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (16, 'Toucan toco', 650, '20 ans', '63 cm', '500-876g', 16);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (16, 'https://images.unsplash.com/photo-1699388423083-91ea640a9af8', 16, 1);",

    # --- 17. Manchot empereur ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (17, 'Sphenisciformes', 'Spheniscidae', 'Aptenodytes');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (17, 'Manchot empereur', 400, '20 ans', '115 cm', '22-45kg', 17);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (17, 'https://images.unsplash.com/photo-1698338008292-9258407b3edd', 17, 1);",

    # --- 18. Geai bleu ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (18, 'Passeriformes', 'Corvidae', 'Cyanocitta');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (18, 'Geai bleu', 2800, '7 ans', '28 cm', '70-100g', 18);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (18, 'https://images.unsplash.com/photo-1725336528757-fe00b819feb0', 18, 1);",

    # --- 19. Ibis rouge ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (19, 'Pelecaniformes', 'Threskiornithidae', 'Eudocimus');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (19, 'Ibis rouge', 1100, '16 ans', '68 cm', '650-950g', 19);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (19, 'https://images.unsplash.com/photo-1612132350804-9b2796775f47', 19, 1);",

    # --- 20. Condor des Andes ---
    "INSERT OR IGNORE INTO Taxonomie (id, ordre, famille, genre) VALUES (20, 'Cathartiformes', 'Cathartidae', 'Vultur');",
    "INSERT OR IGNORE INTO Espece (id, nom, nombre_individus, longevite, taille, poids, taxonomie_id) VALUES (20, 'Condor des Andes', 140, '50 ans', '120 cm', '11-15kg', 20);",
    "INSERT OR IGNORE INTO Image (id, url, espece_id, auteur_id) VALUES (20, 'https://images.unsplash.com/photo-1551316679-9c6ae9dec224', 20, 1);"
]

# Creation de la table "birds" si elle n'existe pas déjà

# Insertion des données
with engine.connect() as conn:
    for query in table_insert_queries:
        try:
            conn.execute(text(query))
            conn.commit()
        except Exception as e:
            print(f"Erreur insertion: {e}")    
            
@app.route('/api/Oiseau', methods=['GET'])
def get_birds():
    query = """
        SELECT e.id, e.nom, t.ordre, t.famille, i.url as imageUrl, e.nombre_individus, e.taille, e.longevite
        FROM Espece e
        JOIN Taxonomie t ON e.taxonomie_id = t.id
        LEFT JOIN Image i ON e.id = i.espece_id
    """
    with engine.connect() as conn:
        result = conn.execute(text(query))
        all_birds = [dict(row) for row in result.mappings()] 
    
    return jsonify(all_birds), 200

# Fonction pour récupérer les détails d'un oiseau spécifique par son ID
@app.route('/api/Oiseau/<int:bird_id>', methods=['GET'])
def get_bird_details(bird_id):
    query = """
        SELECT e.*, t.ordre, t.famille, t.genre, i.url as imageUrl
        FROM Espece e
        JOIN Taxonomie t ON e.taxonomie_id = t.id
        LEFT JOIN Image i ON e.id = i.espece_id
        WHERE e.id = :id
    """
    with engine.connect() as conn:
        result = conn.execute(text(query), {"id": bird_id})
        bird = result.mappings().first()
        
        if not bird:
            return jsonify({"error": "Oiseau non trouvé"}), 404
            
        # On reformate un peu pour coller à ta structure React (bird.taxonomie.ordre)
        bird_dict = dict(bird)
        bird_dict['taxonomie'] = {
            "ordre": bird_dict.pop('ordre'),
            "famille": bird_dict.pop('famille'),
            "genre": bird_dict.pop('genre')
        }
        
    return jsonify(bird_dict), 200

@app.route('/api/Oiseau/details', methods=['GET'])
def get_birds_detail_Info_Population_taille():
    query = """
        SELECT e.id, e.nom, e.nombre_individus, e.taille
        FROM Espece e
    """
    with engine.connect() as conn:
        result = conn.execute(text(query))
        birds_info = [dict(row) for row in result.mappings()] 
    
    return jsonify(birds_info), 200

@app.route('/api/birds', methods=['POST'])
def add_bird():
    data = request.json
    
    with engine.begin() as conn:
        # 1. On insère d'abord la Taxonomie
        tax_query = text("""
            INSERT INTO Taxonomie (ordre, famille, genre) 
            VALUES (:ordre, :famille, :genre)
            RETURNING id
        """)
        tax_result = conn.execute(tax_query, {
            "ordre": data['ordre'],
            "famille": data['famille'],
            "genre": data['genre']
        })
        
        tax_id = tax_result.fetchone()[0]

        # 2. On insère l'Espece avec l'ID de taxonomie récupéré
        esp_query = text("""
            INSERT INTO Espece (nom, nombre_individus, longevite, taille, poids, taxonomie_id)
            VALUES (:nom, :nombre, :long, :taille, :poids, :tax_id)
        """)
        conn.execute(esp_query, {
            "nom": data['nomCommun'],
            "nombre": data['nombreIndividus'],
            "long": f"{data['longevite']} ans",
            "taille": f"{data['taille']} cm",
            "poids": f"{data['poidsMin']}-{data['poidsMax']}g",
            "tax_id": tax_id
        })

    return jsonify({"message": "Espèce ajoutée avec succès"}), 201

# Dossier où stocker les images
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/images', methods=['POST'])
def add_image():
    # Récupérer les données texte
    bird_id = request.form.get('speciesId')
    # compute a pseudo-author id from User-Agent so each browser gets a stable integer
    ua = request.headers.get('User-Agent', '')
    auteur_id = abs(hash(ua)) % 100000 + 2  # reserve 1 for Unsplash contributor
    
    # ensure this auteur exists in table (name can be truncated UA)
    with engine.begin() as conn:
        exist = conn.execute(text("SELECT id FROM Auteur WHERE id = :id"),{"id": auteur_id}).first()
        if not exist:
            conn.execute(text("INSERT INTO Auteur (id, nom) VALUES (:id, :nom)"),
                         {"id": auteur_id, "nom": ua[:100]})

    # Récupérer le fichier ou le lien
    file = request.files.get('image')
    url = request.form.get('url')

    if file:
        # stocke le fichier et construit l'URL locale
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        url = f"/static/uploads/{filename}"

    if url:
        # check for duplicate for same species
        with engine.connect() as conn:
            dup = conn.execute(text("SELECT id FROM Image WHERE url = :url AND espece_id = :eid"),
                               {"url": url, "eid": bird_id}).first()
            if dup:
                return jsonify({"error": "Image déjà enregistrée pour cette espèce"}), 409
        with engine.begin() as conn:
            img_query = text("""
            INSERT INTO Image (url, espece_id, auteur_id)
            VALUES (:url, :espece_id, :auteur_id)
            """)

            conn.execute(img_query, {
                "url": url,
                "espece_id": bird_id,
                "auteur_id": auteur_id
            })
        
    return jsonify({"message": "Image enregistrée !"}), 201


# token Hugging Face
HF_TOKEN = os.getenv("HF_TOKEN")
# OPTION A : Le plus récent (526 espèces)
# MODEL_ID = "prithivMLmods/Bird-Species-Classifier-526"

# OPTION B : Le classique (525 espèces)
MODEL_ID = "dennisjooo/Birds-Classifier-EfficientNetB2"

# L'URL du Router officielle pour 2026
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL_ID}"
headers = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/json",
    "x-wait-for-model": "true"
}

@app.route('/api/detect', methods=['POST'])
def detect_bird():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "Pas d'image fournie"}), 400
        
        file = request.files['image']
        image_data = file.read()
        
        if not HF_TOKEN:
            return jsonify({"error": "Token HF manquant dans les variables d'environnement"}), 500

        headers = {
            "Authorization": f"Bearer {HF_TOKEN}",
            "x-wait-for-model": "true"
            # ✅ Plus de Content-Type json
        }

        max_retries = 3
        response = None

        for attempt in range(max_retries):
            try:
                response = requests.post(
                    HF_API_URL,
                    headers=headers,
                    data=image_data,   # ✅ bytes bruts, plus de json=
                    timeout=60
                )

                if response.status_code == 503:
                    wait_time = (attempt + 1) * 10
                    print(f"[HF] Modèle en chargement, tentative {attempt + 1}/{max_retries}, attente {wait_time}s...")
                    time.sleep(wait_time)
                    continue

                if response.status_code != 200:
                    print(f"[HF] Erreur {response.status_code} : {response.text}")
                    return jsonify({
                        "error": "L'IA ne répond pas correctement",
                        "details": response.text
                    }), response.status_code

                break

            except requests.exceptions.Timeout:
                print(f"[HF] Timeout tentative {attempt + 1}/{max_retries}")
                if attempt == max_retries - 1:
                    return jsonify({"error": "L'IA ne répond pas (timeout après 3 tentatives)"}), 504
                time.sleep(5)

            except requests.exceptions.RequestException as e:
                print(f"[HF] Erreur réseau : {str(e)}")
                return jsonify({"error": "Erreur réseau", "message": str(e)}), 502

        if response is None or response.status_code == 503:
            return jsonify({
                "error": "Le modèle IA est en cours de démarrage, réessaie dans 30 secondes."
            }), 503

        predictions = response.json()

        if not predictions or not isinstance(predictions, list):
            return jsonify({"error": "Résultat d'analyse vide"}), 500

        best_prediction = predictions[0]
        label = best_prediction['label']
        score = best_prediction['score']

        auto_saved = False
        if score > 0.9:
            filename = secure_filename(file.filename)
            os.makedirs('static/uploads', exist_ok=True)
            upload_path = os.path.join('static/uploads', filename)
            file.seek(0)
            file.save(upload_path)
            auto_saved = True

        return jsonify({
            "species": label,
            "confidence": round(score * 100, 2),
            "auto_saved": auto_saved
        })

    except Exception as e:
        print(f"CRASH SERVEUR : {str(e)}")
        return jsonify({"error": "Erreur interne du serveur", "message": str(e)}), 500
        
if __name__ == '__main__':
    app.run(debug=True)