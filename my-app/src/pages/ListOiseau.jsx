import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {ArrowRight , List, Loader2 } from "lucide-react";
import "./ListOiseau.css";

export function ListOiseau() {
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/Oiseau")
      .then((res) => res.json())
      .then((data) => {
        setBirds(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "En danger": return "status-danger";
      case "Vulnérable": return "status-vulnerable";
      case "Stable": return "status-stable";
      default: return "status-default";
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <Loader2 className="animate-spin text-cyan-600" size={48} />
        <p>Chargement des espèces...</p>
      </div>
    );
  }

  return (
    <div className="list-page">
      <div className="max-container">
        <div className="list-header">
          <h1>Catalogue des Oiseaux</h1>
          <p className="subtitle">
            Explorez notre collection de {birds.length} espèces répertoriées en base de données.
          </p>
        </div>

        <div className="birds-grid">
          {birds.map((Oiseau) => (
            <Link key={Oiseau.id} to={`/Oiseau/${Oiseau.id}`} className="card-link">
              <Card className="Oiseau-item-card group">
                <div className="card-image-wrapper">
                  <img
                    src={Oiseau.imageUrl || 'https://via.placeholder.com/150x100?text=No+Image'}
                    alt={Oiseau.nom}
                    className="card-image"
                    onError={(e)=>{
                      console.warn('failed loading', Oiseau.imageUrl);
                      e.target.src = 'https://via.placeholder.com/150x100?text=No+Image';
                    }}
                  />
                  <div className="card-badge-overlay">
                    <Badge className={getStatusClass(Oiseau.status)}>
                      {Oiseau.status || "Répertorié"}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="Oiseau-name">{Oiseau.nom}</h3>
                  <p className="scientific-name">{Oiseau.ordre} • {Oiseau.famille}</p>
                  
                  <div className="mini-stats">
                    <div className="stat-row">
                      <span>Taille:</span>
                      <strong>{Oiseau.taille || "--"}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Longévité:</span>
                      <strong>{Oiseau.longevite || "--"}</strong>
                    </div>
                  </div>

                  <div className="card-footer-link">
                    <span>Voir les détails</span>
                    <ArrowRight size={16} className="arrow-icon" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
export default ListOiseau;