import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import "./TableauOiseaux.css";

export default function TableauOiseaux() {
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/Oiseau/details")
      .then(res => res.json())
      .then(data => {
        setBirds(data);
        setLoading(false);
      });
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") {
        setSortField(null);
        setSortOrder(null);
      } else setSortOrder("asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedBirds = [...birds].sort((a, b) => {
    if (!sortField || !sortOrder) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];

    // Gestion du tri numérique vs texte
    if (typeof aVal === 'number') {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }
    return sortOrder === "asc" 
      ? String(aVal).localeCompare(String(bVal)) 
      : String(bVal).localeCompare(String(aVal));
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={14} />;
    return sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  if (loading) return <div className="loader-container"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="table-page">
      <div className="max-container">
        <div className="header-section">
          <h1>Tableau Comparatif</h1>
          <p>Analysez les caractéristiques des espèces en base de données</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="Card_title">Données d'observation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="table-wrapper">
              <Table>
                <TableHeader>
                  <TableRow className="table-header-row">
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("nom")} className="sort-btn">
                        Espèce <SortIcon field="nom" />
                      </Button>
                    </TableHead>
                    <TableHead> 
                      <Button variant="ghost" onClick={() => handleSort("nombre_individus")} className="sort-btn">
                        Population <SortIcon field="nombre_individus" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("taille")} className="sort-btn">
                        Taille <SortIcon field="taille" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBirds.map((bird, idx) => (
                    <TableRow key={bird.id} className={idx % 2 === 0 ? "row-even" : "row-odd"}>
                      <TableCell>
                        <span className="primary-text">{bird.nom}</span>
                        <br /><span className="secondary-text">{bird.famille}</span>
                      </TableCell>
                      <TableCell className="text-center">{bird.nombre_individus}</TableCell>
                      <TableCell className="text-center">{bird.taille}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

