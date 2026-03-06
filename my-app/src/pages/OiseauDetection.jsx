import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Upload, Brain, CheckCircle2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { detectBird } from "../services/api";
import "./OiseauDetection.css";

export default function BirdDetection() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const runDetection = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const resData = await detectBird(image);
      setResult(resData);
      
      if (resData.auto_saved) {
        toast.success("IA sûre d'elle : Espèce ajoutée automatiquement !");
      }
    } catch (err) {
      toast.error(err?.message || "Erreur lors de l'analyse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detection-page">
      <div className="max-container-form">
        <div className="form-header">
          <div className="icon-circle ia-gradient">
            <Brain className="text-white" size={32} />
          </div>
          <h1>Identification par IA</h1>
          <p>L'intelligence artificielle analyse votre photo pour identifier l'espèce.</p>
        </div>

        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <label className="detection-upload-zone">
              {preview ? (
                <img src={preview} alt="Aperçu" className="detection-preview" />
              ) : (
                <div className="upload-placeholder">
                  <Upload size={48} className="text-cyan-500 mb-4" />
                  <p>Déposez la photo de l'oiseau ici</p>
                </div>
              )}
              <input type="file" className="hidden" onChange={handleImageChange} />
            </label>

            <div className="mt-8">
              <Button 
                onClick={runDetection} 
                disabled={!image || loading}
                className="btn-ia-scan"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
                Lancer l'identification
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className="result-card animate-slide-up">
            <CardContent className="p-6">
              <div className="result-flex">
                <div className="result-info">
                  <span className="label-text">Espèce identifiée :</span>
                  <h2 className="species-result">{result.species}</h2>
                </div>
                <div className="result-score">
                  <span className="label-text">Confiance :</span>
                  <div className="score-badge">{result.confidence}%</div>
                </div>
              </div>
              {result.auto_saved && (
                <div className="auto-save-tag">
                  <CheckCircle2 size={16} /> Sauvegardé automatiquement
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}