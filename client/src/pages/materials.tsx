import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaterialsList from "@/components/materials/MaterialsList";
import MaterialFilters from "@/components/materials/MaterialFilters";
import PriceComparison from "@/components/materials/PriceComparison";
import PriceTrends from "@/components/materials/PriceTrends";
import { Button } from "@/components/ui/button";

const Materials = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    supplier: "all",
    sortBy: "name",
  });

  // Set document title
  useEffect(() => {
    document.title = "Matériaux de construction | Housy";
  }, []);

  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">
            Matériaux de construction
          </h1>
          <p className="text-neutral-500 mt-1">
            Gérez les matériaux, comparez les prix et suivez les tendances
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center">
            <i className="fas fa-file-import mr-2"></i>
            Importer
          </Button>
          <Button className="flex items-center">
            <i className="fas fa-plus mr-2"></i>
            Ajouter un matériau
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
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

          {/* Filters */}
          <MaterialFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        <TabsContent value="list" className="m-0">
          <MaterialsList filters={filters} />
        </TabsContent>

        <TabsContent value="compare" className="m-0">
          <PriceComparison />
        </TabsContent>

        <TabsContent value="trends" className="m-0">
          <PriceTrends />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Materials;
