import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

interface MaterialCategory {
  category: string;
  totalCost: number;
  materials: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    supplier?: string;
  }>;
}

interface EstimationResult {
  categories: MaterialCategory[];
  totalCost: number;
}

interface SavedEstimation {
  id: number;
  name: string;
  area: number;
  floors: number;
  projectType: string;
  qualityLevel: string;
  wastageIncluded: boolean;
  totalCost: number;
  createdAt: string;
}

const MaterialIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "gros_oeuvre":
      return <i className="fas fa-cubes text-yellow-600"></i>;
    case "second_oeuvre":
      return <i className="fas fa-paint-roller text-blue-600"></i>;
    case "finition":
      return <i className="fas fa-brush text-green-600"></i>;
    default:
      return <i className="fas fa-box text-neutral-600"></i>;
  }
};

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case "gros_oeuvre":
      return "Gros œuvre";
    case "second_oeuvre":
      return "Second œuvre";
    case "finition":
      return "Finitions";
    default:
      return category;
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case "gros_oeuvre":
      return "bg-yellow-100 border-yellow-200";
    case "second_oeuvre":
      return "bg-blue-100 border-blue-200";
    case "finition":
      return "bg-green-100 border-green-200";
    default:
      return "bg-neutral-100 border-neutral-200";
  }
};

const Estimation = () => {
  // Set document title
  useEffect(() => {
    document.title = "Estimation de matériaux | Housy";
  }, []);

  const [activeTab, setActiveTab] = useState("calculator");
  
  const [formData, setFormData] = useState({
    name: "Nouvelle estimation",
    projectType: "apartment",
    area: 120,
    floors: 1,
    qualityLevel: "PREMIUM",
    includeWastage: true,
  });
  
  const [estimationResult, setEstimationResult] = useState<EstimationResult | null>(null);

  // Fetch saved estimations
  const { data: savedEstimations, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/estimation/history'],
  });

  // Mutation for calculating estimation
  const calculateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/estimation/calculate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setEstimationResult(data);
      setActiveTab("results");
    },
  });

  // Mutation for saving estimation
  const saveEstimationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/estimation/save', data);
      return response.json();
    },
  });

  // Mutation for generating PDF report
  const generateReportMutation = useMutation({
    mutationFn: async (data: { estimationId: number; format: string }) => {
      const response = await apiRequest('POST', '/api/reports/materials', data);
      return response.json();
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCalculate = () => {
    calculateMutation.mutate(formData);
  };

  const handleSaveEstimation = () => {
    if (!estimationResult) return;

    const dataToSave = {
      name: formData.name,
      projectType: formData.projectType,
      area: formData.area,
      floors: formData.floors,
      qualityLevel: formData.qualityLevel,
      wastageIncluded: formData.includeWastage,
      totalCost: estimationResult.totalCost,
      costBreakdown: estimationResult.categories.reduce((obj, cat) => {
        obj[cat.category] = cat.totalCost;
        return obj;
      }, {} as Record<string, number>),
      materialsList: estimationResult.categories.map(cat => ({
        category: cat.category,
        materials: cat.materials,
      })),
      createdBy: 1, // In a real app, this would come from the authenticated user
    };

    saveEstimationMutation.mutate(dataToSave);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">
          Estimation de matériaux
        </h1>
        <p className="text-neutral-500 mt-1">
          Calculez les quantités et les coûts des matériaux pour vos projets
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="calculator">Calculateur</TabsTrigger>
          <TabsTrigger value="results" disabled={!estimationResult}>
            Résultats
          </TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Paramètres d'estimation</CardTitle>
                <CardDescription>
                  Entrez les détails de votre projet pour obtenir une estimation des matériaux
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'estimation</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                {/* Project Type */}
                <div className="space-y-2">
                  <Label htmlFor="projectType">Type de projet</Label>
                  <Select
                    value={formData.projectType}
                    onValueChange={(value) => handleChange("projectType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Appartement</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="immeuble">Immeuble</SelectItem>
                      <SelectItem value="commercial">Local commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Area & Floors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Surface (m²)</Label>
                    <Input
                      id="area"
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleChange("area", parseFloat(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floors">Nombre d'étages</Label>
                    <Input
                      id="floors"
                      type="number"
                      value={formData.floors}
                      onChange={(e) => handleChange("floors", parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>

                {/* Quality Level */}
                <div className="space-y-2">
                  <Label>Qualité des finitions</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={formData.qualityLevel === "STANDARD" ? "secondary" : "outline"}
                      className="flex-1"
                      onClick={() => handleChange("qualityLevel", "STANDARD")}
                    >
                      Standard
                    </Button>
                    <Button
                      type="button"
                      variant={formData.qualityLevel === "PREMIUM" ? "secondary" : "outline"}
                      className="flex-1"
                      onClick={() => handleChange("qualityLevel", "PREMIUM")}
                    >
                      Premium
                    </Button>
                    <Button
                      type="button"
                      variant={formData.qualityLevel === "LUXE" ? "secondary" : "outline"}
                      className="flex-1"
                      onClick={() => handleChange("qualityLevel", "LUXE")}
                    >
                      Luxe
                    </Button>
                  </div>
                </div>

                {/* Wastage */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeWastage"
                    checked={formData.includeWastage}
                    onCheckedChange={(checked) =>
                      handleChange("includeWastage", checked === true)
                    }
                  />
                  <Label htmlFor="includeWastage">
                    Inclure les pertes (wastage) dans les calculs
                  </Label>
                </div>

                {/* Calculate Button */}
                <Button
                  className="w-full mt-4"
                  onClick={handleCalculate}
                  disabled={calculateMutation.isPending}
                >
                  {calculateMutation.isPending
                    ? "Calcul en cours..."
                    : "Calculer l'estimation"}
                </Button>
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Guide d'estimation</CardTitle>
                <CardDescription>
                  Informations sur le calcul des matériaux
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Types de projets</h3>
                  <p className="text-sm text-neutral-600">
                    Différents types de projets nécessitent différentes quantités de matériaux. Les villas et immeubles ont généralement besoin de plus de matériaux de gros œuvre que les appartements.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Niveaux de qualité</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">Standard</span> : Matériaux de base, finitions simples
                    </p>
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">Premium</span> : Matériaux de meilleure qualité, finitions soignées
                    </p>
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">Luxe</span> : Matériaux haut de gamme, finitions exceptionnelles
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Catégories de matériaux</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">Gros œuvre</span> : Ciment, sable, gravier, acier, briques, etc.
                    </p>
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">Second œuvre</span> : Plomberie, électricité, isolation, cloisons, etc.
                    </p>
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">Finitions</span> : Peinture, carrelage, menuiserie, sanitaires, etc.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Pertes (Wastage)</h3>
                  <p className="text-sm text-neutral-600">
                    Les pertes sont inévitables dans les projets de construction. Elles varient généralement entre 5% et 15% selon les matériaux. L'inclusion de ce facteur donne une estimation plus réaliste.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          {estimationResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Résumé de l'estimation</CardTitle>
                  <CardDescription>
                    {formData.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Type de projet:</span>
                      <span className="font-medium">
                        {formData.projectType === "apartment"
                          ? "Appartement"
                          : formData.projectType === "villa"
                          ? "Villa"
                          : formData.projectType === "immeuble"
                          ? "Immeuble"
                          : "Local commercial"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Surface:</span>
                      <span className="font-medium">{formData.area} m²</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Étages:</span>
                      <span className="font-medium">{formData.floors}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Qualité:</span>
                      <span className="font-medium">
                        {formData.qualityLevel === "STANDARD"
                          ? "Standard"
                          : formData.qualityLevel === "PREMIUM"
                          ? "Premium"
                          : "Luxe"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Pertes incluses:</span>
                      <span className="font-medium">
                        {formData.includeWastage ? "Oui" : "Non"}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Coûts par catégorie</h3>
                    {estimationResult.categories.map((category) => (
                      <div key={category.category} className="flex justify-between text-sm">
                        <span className="text-neutral-600 flex items-center">
                          <MaterialIcon category={category.category} />
                          <span className="ml-2">{getCategoryLabel(category.category)}</span>
                        </span>
                        <span className="font-medium">
                          {formatCurrency(category.totalCost)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-primary-800">Total estimé</span>
                      <span className="font-bold text-primary-900 text-lg">
                        {formatCurrency(estimationResult.totalCost)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button onClick={handleSaveEstimation} disabled={saveEstimationMutation.isPending}>
                      {saveEstimationMutation.isPending
                        ? "Enregistrement..."
                        : "Enregistrer l'estimation"}
                    </Button>
                    <Button variant="outline" className="flex items-center justify-center">
                      <i className="fas fa-download mr-2"></i>
                      Exporter en PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Materials Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Liste détaillée des matériaux</CardTitle>
                  <CardDescription>
                    Tous les matériaux nécessaires pour votre projet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {estimationResult.categories.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center">
                        <MaterialIcon category={category.category} />
                        <span className="ml-2">{getCategoryLabel(category.category)}</span>
                      </h3>

                      <div className={`p-3 rounded-lg border ${getCategoryColor(category.category)}`}>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Matériau
                              </th>
                              <th className="px-2 py-1 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Quantité
                              </th>
                              <th className="px-2 py-1 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Prix unitaire
                              </th>
                              <th className="px-2 py-1 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {category.materials.map((material, index) => (
                              <tr key={index}>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-neutral-800">
                                  {material.name}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-neutral-600">
                                  {material.quantity} {material.unit}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-neutral-600">
                                  {formatCurrency(material.unitPrice)}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-sm text-right font-medium text-neutral-800">
                                  {formatCurrency(material.totalPrice)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={3} className="px-2 py-1 text-right text-sm font-medium text-neutral-600">
                                Total {getCategoryLabel(category.category)}
                              </td>
                              <td className="px-2 py-1 text-right text-sm font-bold text-neutral-800">
                                {formatCurrency(category.totalCost)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des estimations</CardTitle>
              <CardDescription>
                Vos estimations précédentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="border border-neutral-200 rounded-lg p-4 animate-pulse"
                    >
                      <div className="h-5 bg-neutral-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/4 mb-1"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/5"></div>
                    </div>
                  ))}
                </div>
              ) : savedEstimations?.length > 0 ? (
                <div className="space-y-4">
                  {savedEstimations.map((estimation: SavedEstimation) => (
                    <div
                      key={estimation.id}
                      className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-neutral-900">
                            {estimation.name}
                          </h3>
                          <p className="text-sm text-neutral-500">
                            {estimation.projectType === "apartment"
                              ? "Appartement"
                              : estimation.projectType === "villa"
                              ? "Villa"
                              : estimation.projectType === "immeuble"
                              ? "Immeuble"
                              : "Local commercial"}{" "}
                            • {estimation.area} m² • {estimation.floors} étage(s)
                          </p>
                          <p className="text-sm text-neutral-500">
                            Qualité:{" "}
                            {estimation.qualityLevel === "STANDARD"
                              ? "Standard"
                              : estimation.qualityLevel === "PREMIUM"
                              ? "Premium"
                              : "Luxe"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-600">
                            {formatCurrency(estimation.totalCost)}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(estimation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2 space-x-2">
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={() =>
                            generateReportMutation.mutate({
                              estimationId: estimation.id,
                              format: "pdf",
                            })
                          }
                          disabled={generateReportMutation.isPending}
                        >
                          <i className="fas fa-download mr-1.5 text-xs"></i>
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <i className="fas fa-calculator text-3xl mb-2"></i>
                  <p>Aucune estimation sauvegardée</p>
                  <p className="text-sm">
                    Utilisez le calculateur pour créer votre première estimation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Estimation;
