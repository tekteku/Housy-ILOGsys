import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

interface MaterialEstimationResult {
  categories: Array<{
    category: string;
    totalCost: number;
    materials: Array<{
      id: number;
      name: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
  totalCost: number;
}

const CategoryIcon = ({ category }: { category: string }) => {
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

const CategoryLabel = ({ category }: { category: string }) => {
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

const MaterialCalculator = () => {
  const [formData, setFormData] = useState({
    projectType: "apartment",
    area: 120,
    floors: 1,
    qualityLevel: "PREMIUM",
    includeWastage: true,
  });

  const [estimationResult, setEstimationResult] = useState<MaterialEstimationResult | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/estimation/calculate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setEstimationResult(data);
    },
  });

  const downloadPdfMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would download a PDF
      // Here we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateMutation.mutate(formData);
  };

  return (
    <Card className="shadow-sm border border-neutral-200">
      <div className="p-5 border-b border-neutral-200">
        <h2 className="text-lg font-medium text-neutral-900">Calculateur de matériaux</h2>
        <p className="text-neutral-500 text-sm mt-1">Estimez les coûts pour votre projet</p>
      </div>
      
      <div className="p-5 space-y-4">
        <form onSubmit={handleSubmit}>
          {/* Project Type Selector */}
          <div className="mb-4">
            <Label htmlFor="projectType" className="block text-sm font-medium text-neutral-700 mb-1">
              Type de projet
            </Label>
            <Select
              value={formData.projectType}
              onValueChange={(value) => handleChange("projectType", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez le type de projet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Appartement</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="immeuble">Immeuble</SelectItem>
                <SelectItem value="commercial">Local commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Dimensions Input Group */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="area" className="block text-sm font-medium text-neutral-700 mb-1">
                Surface (m²)
              </Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => handleChange("area", parseFloat(e.target.value))}
                min="1"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="floors" className="block text-sm font-medium text-neutral-700 mb-1">
                Étages
              </Label>
              <Input
                id="floors"
                type="number"
                value={formData.floors}
                onChange={(e) => handleChange("floors", parseInt(e.target.value))}
                min="1"
                className="w-full"
              />
            </div>
          </div>
          
          {/* Quality Level Selector */}
          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-700 mb-1">
              Qualité des finitions
            </Label>
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
          
          {/* Consider Wastage */}
          <div className="flex items-center mb-4">
            <Checkbox
              id="consider-wastage"
              checked={formData.includeWastage}
              onCheckedChange={(checked) => 
                handleChange("includeWastage", checked === true)
              }
            />
            <Label
              htmlFor="consider-wastage"
              className="ml-2 block text-sm text-neutral-700"
            >
              Inclure les pertes (wastage) dans les calculs
            </Label>
          </div>
          
          {/* Calculate Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={calculateMutation.isPending}
          >
            {calculateMutation.isPending ? "Calcul en cours..." : "Calculer l'estimation"}
          </Button>
        </form>
      </div>
      
      {/* Results Section */}
      {(estimationResult || calculateMutation.isPending) && (
        <div className="border-t border-neutral-200 p-5 bg-neutral-50 rounded-b-xl">
          <h3 className="font-medium text-neutral-900 mb-3">Résultats de l'estimation</h3>
          
          {calculateMutation.isPending ? (
            <div className="space-y-2.5">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="w-full h-16" />
              ))}
              <Skeleton className="w-full h-16 mt-4" />
            </div>
          ) : estimationResult ? (
            <div className="space-y-2.5">
              {/* Material Category Results */}
              {estimationResult.categories.map((category) => (
                <div
                  key={category.category}
                  className="bg-white p-3 rounded-lg border border-neutral-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 ${
                        category.category === "gros_oeuvre" 
                          ? "bg-yellow-100" 
                          : category.category === "second_oeuvre"
                            ? "bg-blue-100"
                            : "bg-green-100"
                      }`}>
                        <CategoryIcon category={category.category} />
                      </div>
                      <span className="font-medium text-neutral-800">
                        <CategoryLabel category={category.category} />
                      </span>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      {formatCurrency(category.totalCost)}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Total Result */}
              <div className="bg-primary-50 p-3 rounded-lg border border-primary-200 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-primary-800">Total estimé</span>
                  <span className="font-bold text-primary-900 text-lg">
                    {formatCurrency(estimationResult.totalCost)}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => downloadPdfMutation.mutate()}
                  disabled={downloadPdfMutation.isPending}
                >
                  <i className="fas fa-download mr-1.5"></i>
                  {downloadPdfMutation.isPending ? "Téléchargement..." : "Télécharger PDF"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
};

export default MaterialCalculator;
