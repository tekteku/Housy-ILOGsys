import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaterialsList from "@/components/materials/MaterialsList";
import MaterialFilters from "@/components/materials/MaterialFilters";
import PriceComparison from "@/components/materials/PriceComparison";
import PriceTrends from "@/components/materials/PriceTrends";
import { Button } from "@/components/ui/button";
import { uploadDocument } from "@/lib/mega-data-service";
import { useNotification } from "@/hooks/use-notification";

// Animation imports
import { PageTransition, FadeIn, AnimatedButton } from "@/components/animations";

const Materials = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    supplier: "all",
    sortBy: "name",
  });

  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  // Set document title
  useEffect(() => {
    document.title = "Matériaux de construction | Housy";
  }, []);

  // Handle CSV import
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      return await uploadDocument(file, {
        category: 'materials_import',
        description: 'Import de matériaux depuis CSV'
      });
    },
    onSuccess: () => {
      success('Import réussi', 'Les matériaux ont été importés avec succès');
      queryClient.invalidateQueries({ queryKey: ['enhanced-materials'] });
    },
    onError: () => {
      error('Erreur d\'import', 'Une erreur est survenue lors de l\'import');
    }
  });

  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file import
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importMutation.mutate(file);
      }
    };
    input.click();
  };

  return (
    <PageTransition>
      <div className="p-8 md:p-12 space-y-10 bg-[#f4f6fa] min-h-screen">
        {/* Header */}
        <FadeIn direction="down" delay={0.1}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#162032]">
                Matériaux de construction
              </h1>
              <p className="text-[#b0b8c1] mt-2">
                Gérez les matériaux, comparez les prix et suivez les tendances
              </p>
            </div>
            <div className="flex gap-4">
              <AnimatedButton 
                variant="outline" 
                className="flex items-center rounded-xl px-6 py-3 text-base"
                onClick={handleImport}
                disabled={importMutation.isPending}
              >
                <i className={`fas ${importMutation.isPending ? 'fa-spinner fa-spin' : 'fa-file-import'} mr-2`}></i>
                {importMutation.isPending ? 'Import...' : 'Importer'}
              </AnimatedButton>
              <AnimatedButton className="flex items-center rounded-xl px-6 py-3 text-base">
                <i className="fas fa-plus mr-2"></i>
                Ajouter un matériau
              </AnimatedButton>
            </div>
          </div>
        </FadeIn>
        {/* Tabs and Filters */}
        <FadeIn direction="up" delay={0.2}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList className="rounded-xl bg-white shadow-sm">
                <TabsTrigger value="list" className="px-4">
                  <i className="fas fa-list mr-2"></i>
                  Liste
                </TabsTrigger>
                <TabsTrigger value="compare" className="px-4">
                  <i className="fas fa-balance-scale mr-2"></i>
                  Comparaison
                </TabsTrigger>
                <TabsTrigger value="trends" className="px-4">
                  <i className="fas fa-chart-line mr-2"></i>
                  Tendances
                </TabsTrigger>
              </TabsList>
              <MaterialFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
            <FadeIn direction="up" delay={0.3}>
              <TabsContent value="list" className="m-0">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <MaterialsList filters={filters} />
                </div>
              </TabsContent>
              <TabsContent value="compare" className="m-0">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <PriceComparison />
                </div>
              </TabsContent>
              <TabsContent value="trends" className="m-0">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <PriceTrends />
                </div>
              </TabsContent>
            </FadeIn>
          </Tabs>
        </FadeIn>
      </div>
    </PageTransition>
  );
};

export default Materials;
