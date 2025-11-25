import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { compareMaterialPrices } from "@/lib/data-service";

const PriceComparison = () => {
  const [materialNames, setMaterialNames] = useState<string[]>([
    "Ciment Portland CPJ 45", 
    "Acier a beton HA Fe E400", 
    "Brique creuse 12 trous"
  ]);
  const [newMaterial, setNewMaterial] = useState("");

  // Mutation for comparing prices
  const comparePrices = useMutation({
    mutationFn: compareMaterialPrices,
  });

  // Query for material comparison data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/materials/compare', materialNames.join(',')],
    queryFn: () => compareMaterialPrices(materialNames),
    enabled: materialNames.length > 0,
  });

  // Add new material to comparison
  const handleAddMaterial = () => {
    if (newMaterial && !materialNames.includes(newMaterial)) {
      setMaterialNames([...materialNames, newMaterial]);
      setNewMaterial("");
    }
  };

  // Remove material from comparison
  const handleRemoveMaterial = (name: string) => {
    setMaterialNames(materialNames.filter((m) => m !== name));
  };

  return (
    <div className="space-y-6">
      {/* Add Material Form */}
      <Card>
        <CardHeader>
          <CardTitle>Comparer les prix des matériaux</CardTitle>
          <CardDescription>
            Ajoutez des matériaux pour comparer leurs prix entre différents fournisseurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="new-material" className="sr-only">
                Ajouter un matériau
              </Label>
              <Input
                id="new-material"
                placeholder="Entrez le nom d'un matériau..."
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMaterial()}
              />
            </div>
            <Button 
              onClick={handleAddMaterial}
              disabled={!newMaterial}
            >
              Ajouter à la comparaison
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {materialNames.map((name) => (
              <div
                key={name}
                className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 rounded-full text-sm"
              >
                <span>{name}</span>
                <button
                  onClick={() => handleRemoveMaterial(name)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <i className="fas fa-times-circle"></i>
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      <Card>
        <CardHeader>
          <CardTitle>Résultats de la comparaison</CardTitle>
          <CardDescription>
            Comparez les prix des matériaux entre différents fournisseurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-32 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">
                Erreur lors de la comparaison des prix.
              </p>
              <Button
                variant="outline"
                onClick={() => comparePrices.mutate(materialNames)}
              >
                Réessayer
              </Button>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <p>Aucune donnée de comparaison disponible.</p>
              <p className="text-sm mt-2">
                Ajoutez des matériaux ci-dessus pour comparer leurs prix.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.map((item: any, index: number) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <span className="text-sm text-neutral-500">
                      Unité: {item.unit}
                    </span>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-sm font-medium text-neutral-500 pb-2">
                            Fournisseur
                          </th>
                          <th className="text-right text-sm font-medium text-neutral-500 pb-2">
                            Prix
                          </th>
                          <th className="text-right text-sm font-medium text-neutral-500 pb-2">
                            Comparaison
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {item.suppliers.map((supplier: any, sIndex: number) => {
                          // Calculate price difference percentage from best price
                          const isBestPrice = supplier.supplier === item.bestPrice.supplier;
                          const diffPercentage = isBestPrice
                            ? 0
                            : ((supplier.price - item.bestPrice.price) / item.bestPrice.price) * 100;

                          return (
                            <tr key={sIndex}>
                              <td className="py-2 text-sm">
                                {supplier.supplier}
                              </td>
                              <td className="py-2 text-sm text-right font-medium">
                                {formatCurrency(supplier.price, supplier.currency)}
                              </td>
                              <td className="py-2 text-sm text-right">
                                {isBestPrice ? (
                                  <span className="text-green-600 font-medium flex items-center justify-end">
                                    <i className="fas fa-check-circle mr-1"></i>
                                    Meilleur prix
                                  </span>
                                ) : (
                                  <span className="text-red-500">
                                    +{diffPercentage.toFixed(1)}%
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {index < data.length - 1 && <Separator />}
                </div>
              ))}

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <i className="fas fa-info-circle text-blue-500 mt-0.5 mr-3"></i>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Économies potentielles</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      En choisissant les fournisseurs avec les meilleurs prix pour ces matériaux, vous pourriez économiser jusqu'à 15% sur vos coûts d'approvisionnement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceComparison;
