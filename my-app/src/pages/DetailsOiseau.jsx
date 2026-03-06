import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react"; // 1. Ajout des hooks
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { ArrowRight, ArrowLeft, MapPin, Calendar, Ruler, Weight, Users, Heart, Utensils, Baby, TreePine } from "lucide-react";
import { getBirdDetails } from "../services/api";
import "./DetailsOiseau.css";

export function DetailsOiseau() {
  const { id } = useParams();
  
  // 2. Création des états pour stocker les données et le chargement
  const [Oiseau, setBird] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. Récupération des données au montage du composant
  useEffect(() => {
    async function loadBird() {
      try {
        const data = await getBirdDetails(id);
        setBird(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadBird();
  }, [id]);

  // 4. Gestion de l'état de chargement
  if (loading) {
    return (
      <div className="error-container">
        <p className="error-title">Chargement des données ornithologiques...</p>
      </div>
    );
  }

  if (!Oiseau) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2 className="error-title">Oiseau non trouvé</h2>
          <Link to="/Oiseau" className="back-link">Retour à la liste</Link>
        </div>
      </div>
    );
  }

  // Fonction pour faire le pont entre tes noms de colonnes SQL et tes classes CSS
  const getStatusClass = (status) => {
    // Note : si ton backend ne renvoie pas de status, tu peux mettre une valeur par défaut
    if (!status) return "status-default";
    if (status.includes("danger")) return "status-danger";
    return "status-stable";
  };

  return (
    <div className="details-page">
      <div className="max-container">
        <Link to="/Oiseau" className="back-link">
          <ArrowLeft size={16} /> Retour à la liste
        </Link>

        <div className="Oiseau-header-card">
          <div className="Oiseau-image-container">
            {/* imageUrl correspond au AS imageUrl de ta requête SQL */}
            <img
              src={Oiseau.imageUrl || 'https://via.placeholder.com/300x200?text=Image+manquante'}
              alt={Oiseau.nom}
              className="Oiseau-image"
              onError={(e)=>{ e.target.src='https://via.placeholder.com/300x200?text=Image+manquante'; }}
            />
          </div>
          <div className="Oiseau-info-main">
            <div className="mb-4">
              <Badge className={getStatusClass(Oiseau.status)}>
                {Oiseau.status || "Espèce répertoriée"}
              </Badge>
            </div>
            {/* Attention : Oiseau.nom (nom de la colonne SQL) au lieu de Oiseau.nomCommun */}
            <h1>{Oiseau.nom}</h1>
            <p className="hero-subtitle">ID Taxonomie : #{Oiseau.taxonomie_id}</p>
          </div>
        </div>

        <div className="info-grid">
           <Card>
            <CardHeader><CardTitle className="CardTitle">Informations Biométriques</CardTitle></CardHeader>
            <CardContent className="card-content">
              <div className="feature-item">
                <div className="icon-box" style={{background: '#ecfeff'}}><Ruler color="#0891b2" /></div>
                <div><span className="label-sm">Taille</span><p className="value-md">{Oiseau.taille}</p></div>
              </div>
              <Separator />
              <div className="feature-item">
                <div className="icon-box" style={{background: '#ecfdf5'}}><Weight color="#059669" /></div>
                <div><span className="label-sm">Poids</span><p className="value-md">{Oiseau.poids}</p></div>
              </div>
              <Separator />
              <div className="feature-item">
                <div className="icon-box" style={{background: '#f5f3ff'}}><Calendar color="#7c3aed" /></div>
                <div><span className="label-sm">Espérance de vie</span><p className="value-md">{Oiseau.longevite}</p></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="feature-item"><Users color="#0891b2" /> Population</CardTitle></CardHeader>
            <CardContent>
              <p className="stat-number emerald">{Oiseau.nombre_individus}</p>
              <p className="label-sm">Individus estimés dans la zone d'étude</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DetailsOiseau;