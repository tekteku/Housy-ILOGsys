import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";

export default function NotFound() {
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedLinks, setSuggestedLinks] = useState<Array<{path: string, label: string}>>([]);

  // Récupérer la page précédente si disponible
  useEffect(() => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer;
      if (referrer && referrer.includes(window.location.origin)) {
        setPrevPage(referrer);
      }
    }
  }, []);

  // Suggérer des liens en fonction de l'URL actuelle
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const suggestions: Array<{path: string, label: string}> = [];
      
      // Suggestions basées sur le chemin d'URL
      if (path.includes("projet") || path.includes("project")) {
        suggestions.push({path: "/projects", label: "Liste des projets"});
      } 
      if (path.includes("mater") || path.includes("resource")) {
        suggestions.push({path: "/materials", label: "Ressources & Matériaux"});
      }
      if (path.includes("estim") || path.includes("price")) {
        suggestions.push({path: "/estimation", label: "Module d'estimation"});
      }
      
      // Toujours suggérer le tableau de bord
      if (!suggestions.some(s => s.path === "/dashboard")) {
        suggestions.push({path: "/dashboard", label: "Tableau de bord"});
      }
      
      setSuggestedLinks(suggestions);
    }
  }, []);

  const handleSearch = (query: string) => {
    if (query) {
      // Dans un cas réel, cette recherche serait traitée par le backend
      // Ici on simule juste une redirection vers le tableau de bord
      window.location.href = `/dashboard?search=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 py-16 px-4 sm:px-6 lg:px-8 items-center justify-center relative overflow-hidden">
      {/* Fond avec motif de construction */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="z-10 max-w-md w-full space-y-8 text-center">
        {/* Icône d'erreur animée */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center text-red-500 animate-pulse-glow">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <div className="mt-6">
          <h1 className="text-5xl font-extrabold text-neutral-800">404</h1>
          <h2 className="mt-2 text-2xl font-bold text-neutral-700">Page introuvable</h2>
          <p className="mt-4 text-neutral-500">
            La page que vous recherchez semble avoir été déplacée, supprimée ou n'a jamais existé.
          </p>
        </div>
        
        {/* Barre de recherche pour aider l'utilisateur */}
        <div className="mt-8">
          <SearchInput
            placeholder="Rechercher dans l'application..."
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            showSearchButton
          />
        </div>
        
        {/* Liens suggérés */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-neutral-600 mb-4">Vous cherchez peut-être :</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestedLinks.map((link, index) => (
              <Link key={index} to={link.path}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  {link.path === "/dashboard" && <Home className="h-4 w-4" />}
                  {link.path === "/projects" && <i className="fas fa-folder-open text-sm"></i>}
                  {link.path === "/materials" && <i className="fas fa-boxes text-sm"></i>}
                  {link.path === "/estimation" && <i className="fas fa-calculator text-sm"></i>}
                  <span>{link.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Actions de navigation */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          {prevPage ? (
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la page précédente
            </Button>
          ) : (
            <Link to="/dashboard">
              <Button variant="default" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Retour au tableau de bord
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
