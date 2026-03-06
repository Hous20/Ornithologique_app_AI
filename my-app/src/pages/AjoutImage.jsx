import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { ImagePlus, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import "./AjoutImage.css";

export default function AddImage() {
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  // no additional metadata needed
  // no supplementary info required anymore

  // Charger la liste des oiseaux au démarrage
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/Oiseau")
      .then(res => res.json())
      .then(data => setBirds(data))
      .catch(() => toast.error("Impossible de charger la liste des oiseaux"));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUrl(""); // clear url when file chosen
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("espece_id", selectedSpecies);
    if (imageFile) {
      data.append("image", imageFile);
    } else if (imageUrl) {
      let finalUrl = imageUrl.trim();
      if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl; // assume https
      }
      data.append("url", finalUrl);
    }
    // no extra metadata

    try {
      const response = await fetch("http://127.0.0.1:5000/api/images", {
        method: "POST",
        body: data, // FormData s'occupe tout seul des Headers
      });

      if (response.ok) {
        toast.success("Image ajoutée !");
        setSubmitted(true);
        // after a short delay, reset form to allow another upload
        setTimeout(() => {
          setSubmitted(false);
          setSelectedSpecies("");
          setImageFile(null);
          setImagePreview("");
          setImageUrl("");
        }, 3000);
      } else {
        toast.error("Erreur lors de l'envoi");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="add-image-page flex items-center justify-center">
        <Card className="form-card p-12 text-center">
          <CheckCircle2 className="text-green-500 mb-4 mx-auto" size={64} />
          <h2>Photo enregistrée !</h2>
          <p>Merci pour votre contribution à la base de données.</p>
          <Button onClick={() => setSubmitted(false)} className="mt-6" variant="outline">
            Ajouter une autre photo
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="add-image-page">
      <div className="max-container-form">
        <div className="form-header">
          <div className="icon-circle" style={{background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'}}>
            <ImagePlus className="text-white" size={32} />
          </div>
          <h1>Ajouter une Image</h1>
          <p>Associez une photographie à une espèce existante.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Sélection de l'oiseau */}
          <Card className="form-card">
            <CardHeader><CardTitle>1. Choisir l'espèce</CardTitle></CardHeader>
            <CardContent>
              <Label htmlFor="species">Oiseau observé</Label>
              <select 
                id="species"
                className="select-ui"
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                required
              >
                <option value="">Sélectionnez un oiseau dans la liste...</option>
                {birds.map(bird => (
                  <option key={bird.id} value={bird.id}>{bird.nom}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Image URL first (prioritaire) */}
          <Card className="form-card">
            <CardHeader><CardTitle>2. Fournir un lien vers l'image</CardTitle></CardHeader>
            <CardContent>
              <Label htmlFor="imageUrl">Adresse de l'image (recommandé)</Label>
              <Input id="imageUrl" placeholder="https://..."
                value={imageUrl}
                onChange={e => {
                  setImageUrl(e.target.value);
                  setImageFile(null);
                  setImagePreview(e.target.value);
                }} required={!(imageFile)} />
            </CardContent>
          </Card>

          {/* Upload Photo alternative */}
          <Card className="form-card">
            <CardHeader><CardTitle>3. (Optionnel) Télécharger la photo</CardTitle></CardHeader>
            <CardContent>
              <label className="upload-label">
                {imagePreview && !imageUrl ? (
                  <img src={imagePreview} alt="Preview" className="preview-img" />
                ) : (
                  <div className="upload-icon-container">
                    <Upload size={48} />
                    <p>Image locale (facultatif)</p>
                    <span>JPG, PNG ou WebP</span>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </CardContent>
          </Card>


          <div className="submit-container">
            <Button type="submit" className="btn-purple" disabled={loading || (!imageFile && !imageUrl)}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <ImagePlus className="mr-2" />}
              Publier la photo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}