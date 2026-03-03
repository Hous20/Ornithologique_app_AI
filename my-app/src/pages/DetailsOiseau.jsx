import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function DetailsOiseau() {
    return (
        <>
            <h1>Détails de l'Oiseau</h1>
            <p>Cette page affichera les détails d'une espèce d'oiseau sélectionnée.</p>
            <Link to="/Oiseau">
                <ArrowRight />
                Retour à la liste des oiseaux
            </Link>
        </>
    );
}

export default DetailsOiseau;