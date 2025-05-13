import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { importMaterialsFromCsv } from "@/lib/data-service";
import { queryClient } from "@/lib/queryClient";

interface MaterialsListProps {
  filters: {
    category: string;
    search: string;
    supplier: string;
    sortBy: string;
  };
}

const MaterialsList = ({ filters }: MaterialsListProps) => {
  const [importStarted, setImportStarted] = useState(false);

  // Fetch materials
  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['/api/materials', filters.category],
    queryFn: () => {
      const url = filters.category 
        ? `/api/materials?category=${filters.category}` 
        : '/api/materials';
      return fetch(url).then(res => res.json());
    }
  });

  // Import materials mutation
  const importMaterials = useMutation({
    mutationFn: importMaterialsFromCsv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      setImportStarted(true);
    }
  });

  // Handle import
  const handleImport = () => {
    importMaterials.mutate();
  };

  // Reset import started state after 3 seconds
  useEffect(() => {
    if (importStarted) {
      const timer = setTimeout(() => setImportStarted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [importStarted]);

  // Filter materials based on search and supplier
  const filteredMaterials = materials ? materials.filter((material: any) => {
    const matchesSearch = !filters.search || 
      material.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (material.description && material.description.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesSupplier = !filters.supplier || 
      material.supplier === filters.supplier;
    
    return matchesSearch && matchesSupplier;
  }) : [];

  // Sort materials
  const sortedMaterials = [...(filteredMaterials || [])].sort((a, b) => {
    switch (filters.sortBy) {
      case "price":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "updated":
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Get category badge
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "gros_oeuvre":
        return <Badge className="bg-yellow-500">Gros œuvre</Badge>;
      case "second_oeuvre":
        return <Badge className="bg-blue-500">Second œuvre</Badge>;
      case "finition":
        return <Badge className="bg-green-500">Finitions</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Erreur lors du chargement des matériaux.</p>
              <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/materials'] })}>
                Réessayer
              </Button>
            </div>
          </div>
        ) : !materials || materials.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-8">
              <i className="fas fa-boxes text-neutral-300 text-4xl mb-4"></i>
              <p className="text-neutral-500 mb-4">Aucun matériau trouvé. Importez des données pour commencer.</p>
              <Button 
                onClick={handleImport}
                disabled={importMaterials.isPending}
              >
                {importMaterials.isPending ? "Importation en cours..." : "Importer des matériaux"}
              </Button>
              {importStarted && (
                <p className="text-green-500 mt-2">
                  Importation réussie ! Les matériaux ont été ajoutés.
                </p>
              )}
            </div>
          </div>
        ) : sortedMaterials.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-8">
              <p className="text-neutral-500">
                Aucun matériau ne correspond à vos critères de recherche.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead className="hidden md:table-cell">Fournisseur</TableHead>
                <TableHead className="hidden md:table-cell">Dernière mise à jour</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMaterials.map((material: any) => (
                <TableRow key={material.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{material.name}</div>
                      {material.description && (
                        <div className="text-sm text-neutral-500 truncate max-w-md">
                          {material.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(material.category)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(material.price, material.priceCurrency)}
                  </TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {material.supplier || "-"}
                    {material.brand && ` (${material.brand})`}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(material.lastUpdated)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <i className="fas fa-history text-neutral-500"></i>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <i className="fas fa-edit text-neutral-500"></i>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialsList;
