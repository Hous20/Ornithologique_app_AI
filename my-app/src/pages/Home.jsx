import { Link } from 'react-router-dom';
import { Bird, BookOpen, Table, Plus, ImagePlus, Sparkles} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import './Home.css';

function Home() {
  const features = [
    {
      icon: BookOpen,
      title: "Explorer les espèces",
      description: "Découvrez plus de 20 espèces d'oiseaux du monde entier",
      link: "/Oiseau",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Table,
      title: "Tableau comparatif",
      description: "Comparez les oiseaux selon différents critères",
      link: "/table",
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: Plus,
      title: "Ajouter une espèce",
      description: "Contribuez en ajoutant de nouvelles espèces",
      link: "/add-species",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: ImagePlus,
      title: "Ajouter une image",
      description: "Enrichissez la base avec vos photos",
      link: "/add-image",
      color: "from-violet-500 to-purple-500"
    }
  ];
  
  return (
    <div>
      <div className="hero-section">
        <div className="header_content">
          <div className="hero-text-center">
            <div className="IconWrapper">
              <Bird className="bird_icon" />
            </div>
            <h1 className="Title_principal">
              Guide Encyclopédique des Oiseaux du Monde
            </h1>
            <p className="hero-subtitle">
              Explorez la diversité fascinante des oiseaux de notre planète. 
              Découvrez leurs caractéristiques, habitats et comportements.
            </p>
            <Link
              to="/birds"
              className="btn-primary"
            >
              <Sparkles className="w-5 h-5" />
                Commencer l' exploration
            </Link>
          </div>
        </div>
        <div className="wave-decoration">
          <svg viewBox="0 0 1440 120" className="wave-svg">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      <div className="features-container">
        <h2 className="section-title">Fonctionnalités</h2>
        
        <div className="features-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.link} to={feature.link}>
                <Card className="feature-card">
                  <CardContent className="feature-card-content">
                    <div className="feature-icon">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="stats-section">
          <h3 className="stats-title">Quelques chiffres</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number cyan">20+</div>
              <div className="stat-label">Espèces répertoriées</div>
            </div>
            <div className="stat-item">
              <div className="stat-number emerald">15</div>
              <div className="stat-label">Ordres taxonomiques</div>
            </div>
            <div className="stat-item">
              <div className="stat-number orange">6</div>
              <div className="stat-label">Continents</div>
            </div>
            <div className="stat-item">
              <div className="stat-number violet">60 ans</div>
              <div className="stat-label">Longévité max</div>
            </div>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="info-content">
          <h3 className="info-title">Contribuez à notre encyclopédie</h3>
          <p className="info-text">
            Notre guide est collaboratif. Partagez vos connaissances et vos photos pour enrichir 
            notre base de données ornithologique.
          </p>
          <div className="info-buttons">
            <Link to="/add-species" className="btn-secondary">
              <Plus className="w-5 h-5" />
              Ajouter une espèce
            </Link>
            <Link to="/add-image" className="btn-secondary btn-secondary-alt">
              <ImagePlus className="w-5 h-5" />
              Ajouter une image
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
