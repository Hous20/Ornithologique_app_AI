import { Link, useLocation } from "react-router-dom"; // Assure-toi d'utiliser react-router-dom
import { Bird, Home, Table, Plus, ImagePlus } from "lucide-react";
import "./Navigation.css";

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Accueil", icon: Home },
    { path: "/Oiseau", label: "Tous les oiseaux", icon: Bird },
    { path: "/table", label: "Tableau", icon: Table },
    { path: "/add-species", label: "Ajouter espèce", icon: Plus },
    { path: "/add-image", label: "Ajouter image", icon: ImagePlus },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo / Home link */}
          <Link to="/" className="navbar-logo">
            <Bird className="logo-icon" />
            <span className="logo-text">Guide Ornithologique</span>
          </Link>
          
          {/* Menu Items */}
          <div className="nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}