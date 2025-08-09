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
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { EstimationAIModelSelector } from "@/components/estimation/EstimationAIModelSelector";

// Animation imports
import { PageTransition, FadeIn, AnimatedButton, HoverCard, StaggeredList } from "@/components/animations";

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
    projectType: "construction_neuve",
    area: 120,
    floors: 1,
    qualityLevel: "PREMIUM",
    includeWastage: true,
    projectDescription: "",
    estimatedBudget: 0,
  });
  
  const [estimationResult, setEstimationResult] = useState<EstimationResult>({
    totalCost: 0,
    categories: [],
  });

  const [aiEstimationResult, setAiEstimationResult] = useState<{
    response: string;
    recommendations: string[];
    estimatedCost?: number;
    materials?: Array<{
      category: string;
      items: Array<{
        name: string;
        quantity: string;
        estimatedCost: number;
      }>;
    }>;
  } | null>(null);

  const [selectedAIModel, setSelectedAIModel] = useState<string>('openai');
  const [savedEstimationId, setSavedEstimationId] = useState<number | null>(null);

  // Fetch saved estimations
  const { data: savedEstimations, isLoading: isLoadingHistory } = useQuery<SavedEstimation[]>({
    queryKey: ['/api/estimation/history'],
  });

  // Mutation for calculating estimation
  const calculateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/estimation/calculate', data);
      return response.json();
    },
    onSuccess: (data: EstimationResult) => {
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
    onSuccess: (data) => {
      // Sauvegarder l'ID de l'estimation pour permettre l'export PDF
      if (data.estimationId || data.id) {
        setSavedEstimationId(data.estimationId || data.id);
      }
    },
  });

  // Mutation for generating PDF report
  const generateReportMutation = useMutation({
    mutationFn: async (data: { estimationId?: number; format: string; estimationData?: any }) => {
      const endpoint = data.estimationId 
        ? '/api/reports/materials' 
        : '/api/reports/estimation-pdf';
      
      const payload = data.estimationId 
        ? { estimationId: data.estimationId, format: data.format }
        : { 
            format: data.format,
            estimationData: data.estimationData || {
              name: formData.name,
              projectType: formData.projectType,
              area: formData.area,
              floors: formData.floors,
              qualityLevel: formData.qualityLevel,
              wastageIncluded: formData.includeWastage,
              totalCost: estimationResult.totalCost,
              categories: estimationResult.categories
            }
          };
      
      const response = await apiRequest('POST', endpoint, payload);
      
      // Si la réponse est un blob (PDF), on le télécharge directement
      if (response.headers.get('content-type')?.includes('application/pdf')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `estimation-${formData.name || 'sans-nom'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true };
      }
      
      return response.json();
    },
  });

  // Mutation for AI estimation
  const aiEstimationMutation = useMutation({
    mutationFn: async (data: {
      projectDescription: string;
      projectType?: string;
      estimatedBudget?: number;
      preferredModel?: string;
    }) => {
      const response = await apiRequest('POST', '/api/estimation-ai/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('AI Estimation Response:', data);
      // S'assurer que les données sont dans le bon format
      const aiResult = data.data || data;
      setAiEstimationResult(aiResult);
      setActiveTab("ai-results");
    },
    onError: (error) => {
      console.error('Erreur AI Estimation:', error);
      // Optionnel: Afficher un toast d'erreur
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
    if (!estimationResult.categories?.length) return;

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

  const handleAIEstimation = () => {
    if (!formData.projectDescription || formData.projectDescription.length < 20) return;

    const aiData = {
      projectDescription: formData.projectDescription,
      projectType: formData.projectType,
      estimatedBudget: formData.estimatedBudget > 0 ? formData.estimatedBudget : undefined,
      preferredModel: selectedAIModel,
    };

    aiEstimationMutation.mutate(aiData);
  };

  const handleExportPDF = () => {
    if (!estimationResult?.categories?.length) return;

    const exportData = savedEstimationId 
      ? { estimationId: savedEstimationId, format: "pdf" }
      : { format: "pdf", estimationData: null }; // estimationData will be filled in the mutation
    
    generateReportMutation.mutate(exportData);
  };

  return (
    <PageTransition>
      <div className="p-8 md:p-12 space-y-10 bg-[#f4f6fa] min-h-screen">
        {/* Header */}
        <FadeIn direction="down" delay={0.1}>
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#162032]">
              Estimation de matériaux
            </h1>
            <p className="text-[#b0b8c1] mt-2">
              Calculez les quantités et les coûts des matériaux pour vos projets
            </p>
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn direction="up" delay={0.2}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-6 rounded-xl bg-white shadow-sm">
              <TabsTrigger value="calculator">Calculateur</TabsTrigger>
              <TabsTrigger value="ai-estimation">Estimation IA</TabsTrigger>
              <TabsTrigger value="results" disabled={!estimationResult?.categories?.length}>
                Résultats
              </TabsTrigger>
              <TabsTrigger value="ai-results" disabled={!aiEstimationResult}>
                Résultats IA
              </TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator">
          <FadeIn direction="up" delay={0.3}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Form */}              <HoverCard className="rounded-2xl shadow-lg">
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
                        <SelectItem value="construction_neuve">Construction neuve</SelectItem>
                        <SelectItem value="renovation_complete">Rénovation complète</SelectItem>
                        <SelectItem value="renovation_partielle">Rénovation partielle</SelectItem>
                        <SelectItem value="extension_agrandissement">Extension / agrandissement</SelectItem>
                        <SelectItem value="achat_cle_en_main">Achat clé en main</SelectItem>
                        <SelectItem value="amenagement_interieur_exterieur">Aménagement intérieur/extérieur</SelectItem>
                        <SelectItem value="transformation_batiment">Transformation de bâtiment</SelectItem>
                        <SelectItem value="rehabilitation_energetique">Réhabilitation énergétique</SelectItem>
                        <SelectItem value="achat_vente_immeuble">Achat/vente d'immeuble/appartement</SelectItem>
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
                    <StaggeredList className="flex space-x-2">
                      <AnimatedButton
                        type="button"
                        variant={formData.qualityLevel === "STANDARD" ? "secondary" : "outline"}
                        className="flex-1"
                        onClick={() => handleChange("qualityLevel", "STANDARD")}
                      >
                        Standard
                      </AnimatedButton>
                      <AnimatedButton
                        type="button"
                        variant={formData.qualityLevel === "PREMIUM" ? "secondary" : "outline"}
                        className="flex-1"
                        onClick={() => handleChange("qualityLevel", "PREMIUM")}
                      >
                        Premium
                      </AnimatedButton>
                      <AnimatedButton
                        type="button"
                        variant={formData.qualityLevel === "LUXE" ? "secondary" : "outline"}
                        className="flex-1"
                        onClick={() => handleChange("qualityLevel", "LUXE")}
                      >
                        Luxe
                      </AnimatedButton>
                    </StaggeredList>
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
                  <AnimatedButton
                    className="w-full mt-4"
                    onClick={handleCalculate}
                    disabled={calculateMutation.isPending}
                  >
                    {calculateMutation.isPending
                      ? "Calcul en cours..."
                      : "Calculer l'estimation"}
                  </AnimatedButton>
                </CardContent>
              </HoverCard>              {/* Information Card */}
              <HoverCard>
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
              </HoverCard>
            </div>
          </FadeIn>
        </TabsContent>

        {/* AI Estimation Tab */}
        <TabsContent value="ai-estimation">
          <FadeIn direction="up" delay={0.3}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* AI Estimation Form */}
              <HoverCard className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-robot mr-2 text-blue-600"></i>
                    Estimation intelligente par IA
                  </CardTitle>
                  <CardDescription>
                    Utilisez l'intelligence artificielle pour obtenir une estimation personnalisée et des conseils d'experts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* AI Model Selector */}
                  <EstimationAIModelSelector 
                    selectedModel={selectedAIModel}
                    onModelSelect={setSelectedAIModel}
                  />
                  
                  {/* Project Description */}
                  <div className="space-y-2">
                    <Label htmlFor="ai-description">Description détaillée du projet</Label>
                    <textarea
                      id="ai-description"
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Décrivez votre projet en détail : type de construction, surface, matériaux souhaités, budget approximatif, particularités, etc."
                      value={formData.projectDescription || ''}
                      onChange={(e) => handleChange("projectDescription", e.target.value)}
                    />
                  </div>

                  {/* Quick Project Type Selection */}
                  <div className="space-y-2">
                    <Label>Type de projet (optionnel)</Label>
                    <Select
                      value={formData.projectType}
                      onValueChange={(value) => handleChange("projectType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="construction_neuve">Construction neuve</SelectItem>
                        <SelectItem value="renovation_complete">Rénovation complète</SelectItem>
                        <SelectItem value="renovation_partielle">Rénovation partielle</SelectItem>
                        <SelectItem value="extension_agrandissement">Extension / agrandissement</SelectItem>
                        <SelectItem value="achat_cle_en_main">Achat clé en main</SelectItem>
                        <SelectItem value="amenagement_interieur_exterieur">Aménagement intérieur/extérieur</SelectItem>
                        <SelectItem value="transformation_batiment">Transformation de bâtiment</SelectItem>
                        <SelectItem value="rehabilitation_energetique">Réhabilitation énergétique</SelectItem>
                        <SelectItem value="achat_vente_immeuble">Achat/vente d'immeuble/appartement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Budget Range */}
                  <div className="space-y-2">
                    <Label htmlFor="ai-budget">Budget approximatif (optionnel)</Label>
                    <Input
                      id="ai-budget"
                      type="number"
                      placeholder="Ex: 150000"
                      value={formData.estimatedBudget || ''}
                      onChange={(e) => handleChange("estimatedBudget", parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Generate AI Estimation Button */}
                  <AnimatedButton
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={handleAIEstimation}
                    disabled={!formData.projectDescription || formData.projectDescription.length < 20 || aiEstimationMutation.isPending}
                  >
                    <i className="fas fa-magic mr-2"></i>
                    {aiEstimationMutation.isPending ? "Génération en cours..." : "Générer l'estimation IA"}
                  </AnimatedButton>
                </CardContent>
              </HoverCard>

              {/* AI Features Information */}
              <HoverCard>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-lightbulb mr-2 text-yellow-600"></i>
                    Fonctionnalités IA
                  </CardTitle>
                  <CardDescription>
                    Découvrez ce que l'IA peut faire pour votre projet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-chart-line text-blue-600 text-sm"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Estimation personnalisée</h3>
                        <p className="text-sm text-neutral-600">
                          Analyse votre description pour fournir une estimation précise et adaptée à vos besoins spécifiques.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-clipboard-list text-green-600 text-sm"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Liste de matériaux intelligente</h3>
                        <p className="text-sm text-neutral-600">
                          Génère automatiquement une liste détaillée des matériaux nécessaires avec les quantités optimales.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-users text-purple-600 text-sm"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Conseils d'experts</h3>
                        <p className="text-sm text-neutral-600">
                          Recommandations professionnelles sur les meilleures pratiques et alternatives économiques.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-exclamation-triangle text-red-600 text-sm"></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Alertes et optimisations</h3>
                        <p className="text-sm text-neutral-600">
                          Identifie les points d'attention et propose des optimisations pour réduire les coûts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Conseils pour une meilleure estimation</h3>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• Décrivez précisément les dimensions et la surface</li>
                      <li>• Mentionnez le type de finitions souhaité</li>
                      <li>• Indiquez votre budget approximatif si possible</li>
                      <li>• Précisez les particularités du terrain ou du bâtiment</li>
                      <li>• Mentionnez vos préférences en matériaux</li>
                    </ul>
                  </div>
                </CardContent>
              </HoverCard>
            </div>
          </FadeIn>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <FadeIn direction="up" delay={0.3}>
            {estimationResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Summary Card */}
                <HoverCard className="lg:col-span-1">
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
                    {estimationResult?.categories && estimationResult.categories.length > 0 ? (
                      estimationResult.categories.map((category) => (
                        <div key={category.category} className="flex justify-between text-sm">
                          <span className="text-neutral-600 flex items-center">
                            <MaterialIcon category={category.category} />
                            <span className="ml-2">{getCategoryLabel(category.category)}</span>
                          </span>
                          <span className="font-medium">
                            {formatCurrency(category.totalCost)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-neutral-500">
                        Aucune catégorie disponible
                      </div>
                    )}
                  </div>

                  <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-primary-800">Total estimé</span>
                      <span className="font-bold text-primary-900 text-lg">
                        {formatCurrency(Number.isFinite(estimationResult.totalCost) ? estimationResult.totalCost : 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <AnimatedButton onClick={handleSaveEstimation} disabled={saveEstimationMutation.isPending}>
                      {saveEstimationMutation.isPending
                        ? "Enregistrement..."
                        : "Enregistrer l'estimation"}
                    </AnimatedButton>
                    <AnimatedButton variant="outline" className="flex items-center justify-center" onClick={handleExportPDF} disabled={generateReportMutation.isPending}>
                      <i className="fas fa-download mr-2"></i>
                      {generateReportMutation.isPending ? "Génération..." : "Exporter en PDF"}
                    </AnimatedButton>
                  </div>
                </CardContent>
              </HoverCard>

              {/* Detailed Materials Card */}
              <HoverCard className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Liste détaillée des matériaux</CardTitle>
                  <CardDescription>
                    Tous les matériaux nécessaires pour votre projet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StaggeredList>
                    {estimationResult?.categories?.map((category) => (
                      <div key={category.category}>
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
                  </StaggeredList>
                </CardContent>
              </HoverCard>
            </div>
            )}
          </FadeIn>
        </TabsContent>

        {/* AI Results Tab */}
        <TabsContent value="ai-results">
          <FadeIn direction="up" delay={0.3}>
            {aiEstimationMutation.isPending ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Génération de l'estimation IA en cours...</p>
                </div>
              </div>
            ) : aiEstimationResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Response Summary */}
                <HoverCard className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className="fas fa-brain mr-2 text-purple-600"></i>
                      Analyse IA de votre projet
                    </CardTitle>
                    <CardDescription>
                      Estimation et recommandations générées par l'intelligence artificielle
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiEstimationResult.response && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">Réponse de l'IA</h3>
                        <div className="text-blue-800 whitespace-pre-wrap">
                          {aiEstimationResult.response}
                        </div>
                      </div>
                    )}

                    {aiEstimationResult.estimatedCost && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-medium text-green-900 mb-2">Estimation budgétaire</h3>
                        <div className="text-2xl font-bold text-green-800">
                          {formatCurrency(aiEstimationResult.estimatedCost)}
                        </div>
                      </div>
                    )}

                    {aiEstimationResult.recommendations && aiEstimationResult.recommendations.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-medium text-yellow-900 mb-2">Recommandations</h3>
                        <ul className="space-y-1">
                          {aiEstimationResult.recommendations.map((rec, index) => (
                            <li key={index} className="text-yellow-800 flex items-start">
                              <i className="fas fa-lightbulb mr-2 text-yellow-600 mt-0.5 flex-shrink-0"></i>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </HoverCard>

                {/* Materials Breakdown */}
                {aiEstimationResult.materials && aiEstimationResult.materials.length > 0 && (
                  <HoverCard className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Liste des matériaux suggérés</CardTitle>
                      <CardDescription>
                        Matériaux recommandés par l'IA pour votre projet
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StaggeredList className="space-y-4">
                        {aiEstimationResult.materials.map((category, catIndex) => (
                          <div key={catIndex} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                              <MaterialIcon category={category.category} />
                              <span className="ml-2">{getCategoryLabel(category.category)}</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {category.items && category.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="bg-gray-50 rounded p-3">
                                  <div className="font-medium text-gray-800">{item.name}</div>
                                  <div className="text-sm text-gray-600">{item.quantity}</div>
                                  <div className="text-sm font-medium text-green-600 mt-1">
                                    {formatCurrency(item.estimatedCost)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </StaggeredList>
                    </CardContent>
                  </HoverCard>
                )}

                {/* Action Buttons */}
                <HoverCard className="lg:col-span-2">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <AnimatedButton
                        onClick={() => setActiveTab("ai-estimation")}
                        variant="outline"
                        className="flex-1"
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Modifier les paramètres
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={() => setActiveTab("calculator")}
                        variant="outline"
                        className="flex-1"
                      >
                        <i className="fas fa-calculator mr-2"></i>
                        Utiliser le calculateur
                      </AnimatedButton>
                      <AnimatedButton
                        variant="outline"
                        className="flex-1"
                      >
                        <i className="fas fa-download mr-2"></i>
                        Exporter
                      </AnimatedButton>
                    </div>
                  </CardContent>
                </HoverCard>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-robot text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune estimation IA générée</h3>
                <p className="text-gray-600 mb-4">Utilisez l'onglet "Estimation IA" pour générer une estimation.</p>
                <AnimatedButton onClick={() => setActiveTab("ai-estimation")}>
                  Créer une estimation IA
                </AnimatedButton>
              </div>
            )}
          </FadeIn>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <FadeIn direction="up" delay={0.3}>
            <HoverCard>
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
                ) : savedEstimations && savedEstimations.length > 0 ? (
                  <StaggeredList className="space-y-4">
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
                          <AnimatedButton variant="outline" size="sm">
                            Voir détails
                          </AnimatedButton>
                          <AnimatedButton
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
                          </AnimatedButton>
                        </div>
                      </div>
                    ))}
                  </StaggeredList>
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
            </HoverCard>
          </FadeIn>
        </TabsContent>
      </Tabs>
        </FadeIn>
    </div>
  </PageTransition>
);
};

export default Estimation;
