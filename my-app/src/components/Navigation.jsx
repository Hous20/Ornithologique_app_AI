import { Link, useLocation } from "react-router-dom";
import { Bird, Home, Table, PLus, ImagePlus } from "lucide-react";

function Navigation() {
    const location = useLocation();

    const navItems = [
        { name: "Home", path: "/", icon: Home },
        { name: "Oiseaux", path: "/Oiseau", icon: Bird },
        { name: "Tableau comparatif", path: "/table", icon: Table },
        { name: "Ajouter une espèce", path: "/add-species", icon: PLus },
        { name: "Ajouter une image", path: "/add-image", icon: ImagePlus }
    ];
    return (
        <nav className="Navigation">
            <div className="nav-header">
                <div className="nav-logo">
                    <Link to="/" className="nav-link">
                        <Bird className="nav-icon" />
                        <span className="Text_nav">Guide Ornithologique</span>
                    </Link>
                    <div className="nav-items">
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
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;