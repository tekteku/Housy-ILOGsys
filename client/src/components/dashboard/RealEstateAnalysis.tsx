import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface RegionPrice {
  region: string;
  price: number;
  color: string;
}

const RealEstateAnalysis = () => {
  // Query for AI-generated market analysis
  const { data: marketAnalysis, isLoading } = useQuery({
    queryKey: ['/api/ai/market-trends'],
    enabled: false, // Disabled by default, would be enabled in a real app
  });

  // Sample regional price data
  const regionPrices: RegionPrice[] = [
    { region: "Tunis", price: 4450, color: "bg-primary-600" },
    { region: "Sousse", price: 3200, color: "bg-yellow-500" },
    { region: "Sfax", price: 2800, color: "bg-green-500" },
    { region: "Monastir", price: 2650, color: "bg-purple-500" },
  ];

  // Sample AI insight
  const aiInsight = marketAnalysis?.result || {
    marketTrends: ["Les prix de l'immobilier à Tunis ont augmenté de 7% au dernier trimestre, principalement dans les quartiers résidentiels.", "Le marché montre des signes de stabilisation dans les régions côtières."],
  };

  return (
    <Card className="shadow-sm border border-neutral-200 h-full">
      <div className="p-5 border-b border-neutral-200">
        <h2 className="text-lg font-medium text-neutral-900">Marché immobilier</h2>
        <p className="text-neutral-500 text-sm mt-1">Analyse par région - Tunisie</p>
      </div>
      
      <div className="p-5">
        {/* Analysis Map */}
        <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <>
              {/* Map image of Tunisia */}
              <div className="absolute inset-0 bg-neutral-100">
                <svg
                  viewBox="0 0 800 400"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Simplified outline of Tunisia */}
                  <path
                    d="M400,50 C500,70 550,150 580,250 C600,320 580,350 500,370 C420,390 350,370 300,320 C250,270 230,200 250,150 C270,100 350,40 400,50 Z"
                    fill="#E5E7EB"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                  />
                  
                  {/* Dots for main cities with tooltips */}
                  <circle cx="400" cy="120" r="12" fill="#3B82F6" />
                  <text x="400" y="120" textAnchor="middle" fill="white" fontSize="10" dy=".3em">TN</text>
                  
                  <circle cx="450" cy="230" r="8" fill="#F59E0B" />
                  <text x="450" y="230" textAnchor="middle" fill="white" fontSize="8" dy=".3em">SS</text>
                  
                  <circle cx="350" cy="300" r="8" fill="#10B981" />
                  <text x="350" y="300" textAnchor="middle" fill="white" fontSize="8" dy=".3em">SF</text>
                  
                  <circle cx="480" cy="280" r="6" fill="#8B5CF6" />
                  <text x="480" y="280" textAnchor="middle" fill="white" fontSize="8" dy=".3em">MN</text>
                </svg>
              </div>
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent flex items-end p-4">
                <h3 className="text-white font-medium">Prix moyen par m² par région</h3>
              </div>
            </>
          )}
        </div>
        
        {/* Regional Stats */}
        <div className="space-y-2.5">
          {isLoading ? (
            [...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))
          ) : (
            regionPrices.map((region, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-8 ${region.color} rounded-sm mr-3`}></div>
                  <span className="text-sm font-medium text-neutral-800">{region.region}</span>
                </div>
                <div className="text-sm text-neutral-900 font-medium">
                  {formatCurrency(region.price)}/m²
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* AI-Generated Insight */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-robot text-blue-500 mr-2"></i>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Analyse IA</h4>
              <p className="text-xs text-blue-700 mt-1">
                {isLoading ? (
                  <Skeleton className="h-4 w-full" />
                ) : (
                  aiInsight.marketTrends?.[0] || "Les prix de l'immobilier à Tunis ont augmenté de 7% au dernier trimestre, principalement dans les quartiers résidentiels. Le marché montre des signes de stabilisation dans les régions côtières."
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* View Detailed Analysis Button */}
        <div className="mt-4">
          <Button className="w-full">
            Analyse détaillée du marché
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RealEstateAnalysis;
