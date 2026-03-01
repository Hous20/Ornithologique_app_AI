from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine, text

# Initialiser l'application Flask
app = Flask(__name__)
CORS(app) # Autoriser React à communiquer avec Flask

# Creaction de la base de données SQLite
engine = create_engine('sqlite:///birds.db')

table_creation_list_query = ["""CREATE TABLE IF NOT EXISTS  Espece (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(100) NOT NULL,
    nombre_individus INTEGER,
    longevite VARCHAR(50),
    taille VARCHAR(50),
    poids VARCHAR(50),
    taxonomie_id INTEGER,
    FOREIGN KEY (taxonomie_id) REFERENCES Taxonomie(id)
);""", """CREATE TABLE IF NOT EXISTS Pays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(100) NOT NULL
);""", """CREATE TABLE IF NOT EXISTS Auteur (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(100) NOT NULL
);""", """CREATE TABLE IF NOT EXISTS  Image (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url VARCHAR(255) NOT NULL,
    espece_id INTEGER,
    auteur_id INTEGER,
    FOREIGN KEY (espece_id) REFERENCES Espece(id),
    FOREIGN KEY (auteur_id) REFERENCES Auteur(id)
);"""]

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
for query in table_creation_list_query:
    with engine.begin() as conn:
        # On execute le SQL de création
        conn.execute(text(f"{query}")); 
        
    conn.commit()
# Insertion des données dans la table "birds" en utilisant les requêtes d'insertion sécurisées
for query in table_insert_queries:
    with engine.connect() as conn:
        try:
            conn.execute(text(query))
            conn.commit()
        except Exception as e:
            print(f"Erreur lors de l'insertion : {e}")
            
            
@app.route('/api/birds', methods=['GET'])
def get_birds():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM Taxonomie;"))
        result_map = result.mappings() # Convertir les résultats en dictionnaires
        all_results = [dict(row) for row in result_map.all()] 
    
    return jsonify(all_results), 200 # Retourner les résultats au format JSON 200 signifie succès

if __name__ == '__main__':
    app.run(debug=True)