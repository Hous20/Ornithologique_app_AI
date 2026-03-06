import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Bird, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addBird } from "../services/api";
import "./AjoutOiseau.css";

export default function AddSpecies() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nomCommun: "",
    ordre: "",
    famille: "",
    genre: "",
    nombreIndividus: "",
    longevite: "",
    taille: "",
    poids: "",
    status: "Stable",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addBird(formData);
      toast.success("Espèce enregistrée !");
      setSubmitted(true);
    } catch {
      toast.error("Connexion au serveur impossible");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="add-page flex-center">
        <Card className="glass-card success-card">
          <CheckCircle2 className="check-icon" size={80} />
          <h2>L'oiseau a pris son envol !</h2>
          <p>{formData.nomCommun} a bien été ajouté à la base de données.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">
            Ajouter un autre oiseau
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="add-page">
      <div className="max-container-form">
        <div className="form-header">
          <div className="icon-circle">
            <Bird className="text-white" size={32} />
          </div>
          <h1>Nouvelle Espèce</h1>
          <p>Remplissez les détails pour enrichir l'encyclopédie.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1 : Identité */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="card_title">Identité de l'oiseau</CardTitle></CardHeader>
            <CardContent className="form-grid">
              <div className="field-group">
                <Label htmlFor="nomCommun">Nom commun</Label>
                <Input name="nomCommun" id="nomCommun" placeholder="Ex: Martin-pêcheur" onChange={handleChange} required />
              </div>
            </CardContent>
          </Card>

          {/* Section 2 : Taxonomie */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="card_title">Classification</CardTitle></CardHeader>
            <CardContent className="form-grid">
              <div className="field-group">
                <Label htmlFor="ordre">Ordre</Label>
                <Input name="ordre" id="ordre" placeholder="Coraciiformes" onChange={handleChange} required />
              </div>
              <div className="field-group">
                <Label htmlFor="famille">Famille</Label>
                <Input name="famille" id="famille" placeholder="Alcedinidae" onChange={handleChange} required />
              </div>
              <div className="field-group">
                <Label htmlFor="genre">Genre</Label>
                <Input name="genre" id="genre" placeholder="Alcedo" onChange={handleChange} required />
              </div>
            </CardContent>
          </Card>

          {/* Section 3 : Morphologie */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="card_title">Morphologie & Population</CardTitle></CardHeader>
            <CardContent className="form-grid">
              <div className="field-group">
                <Label htmlFor="taille">Taille (cm)</Label>
                <Input name="taille" id="taille" type="number" onChange={handleChange} required />
              </div>
              <div className="field-group">
                <Label htmlFor="longevite">Espérance de vie (ans)</Label>
                <Input name="longevite" id="longevite" type="number" onChange={handleChange} required />
              </div>
              <div className="field-group">
                <Label htmlFor="nombreIndividus">Population estimée</Label>
                <Input name="nombreIndividus" id="nombreIndividus" type="number" onChange={handleChange} required />
              </div>
              <div className="field-group">
                <Label htmlFor="poids">Poids (ex: 500-750g)</Label>
                <Input name="poids" id="poids" placeholder="Ex: 500-750g" onChange={handleChange} required />
              </div>
              <div className="field-group">
                <Label htmlFor="status">Statut</Label>
                <Input name="status" id="status" placeholder="Ex: Stable" value={formData.status} onChange={handleChange} required />
              </div>
            </CardContent>
          </Card>

          {/* Section 4 : Notes (non persistées pour l'instant) */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="card_title">Notes complémentaires</CardTitle></CardHeader>
            <CardContent className="field-group">
              <Label htmlFor="notes">Description / habitat (optionnel)</Label>
              <Textarea
                name="notes"
                id="notes"
                rows={3}
                placeholder="Info utile pour toi (pas encore stockée dans la table Espece)."
                onChange={handleChange}
              />
            </CardContent>
          </Card>

          <div className="submit-container">
            <Button type="submit" className="btn-submit-large" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Bird className="mr-2" />}
              Enregistrer l'espèce
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}