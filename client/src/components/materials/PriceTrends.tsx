import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMaterialPriceTrends } from "@/lib/data-service";
import { formatCurrency, getChartColors } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PriceTrends = () => {
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([1, 2, 3]);
  const [timeRange, setTimeRange] = useState<number>(6); // months
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState(400);

  // List of materials to choose from
  const materialsList = [
    { id: 1, name: "Ciment Portland CPJ 45" },
    { id: 2, name: "Acier a beton HA Fe E400" },
    { id: 3, name: "Carrelage gres cerame" },
    { id: 4, name: "Brique creuse 12 trous" },
    { id: 5, name: "Peinture acrylique" },
    { id: 6, name: "Tube PVC evacuation" },
    { id: 7, name: "Cable electrique" },
  ];

  // Query for material price trends
  const { data: trends, isLoading, error } = useQuery({
    queryKey: ['/api/materials/trends', selectedMaterials.join(','), timeRange],
    queryFn: () => getMaterialPriceTrends(selectedMaterials, timeRange),
    enabled: selectedMaterials.length > 0,
  });

  // Format data for the chart
  const formatChartData = (trendsData: any[] = []) => {
    if (!trendsData || trendsData.length === 0) return [];
    
    // Get all unique dates across all materials
    const allDates = new Set<string>();
    trendsData.forEach(material => {
      material.priceHistory.forEach((history: any) => {
        allDates.add(history.date.split('T')[0]);
      });
    });
    
    // Sort dates
    const sortedDates = Array.from(allDates).sort();
    
    // Create data points for each date
    return sortedDates.map(date => {
      const dataPoint: any = { date };
      
      trendsData.forEach(material => {
        // Find price for this date or use the closest previous date
        const pricePoint = material.priceHistory.find((h: any) => h.date.split('T')[0] === date);
        if (pricePoint) {
          dataPoint[material.name] = pricePoint.price;
        }
      });
      
      return dataPoint;
    });
  };

  // Toggle a material selection
  const toggleMaterialSelection = (id: number) => {
    setSelectedMaterials(prev => 
      prev.includes(id)
        ? prev.filter(m => m !== id)
        : [...prev, id]
    );
  };

  // Adjust chart height on window resize
  useEffect(() => {
    const updateChartHeight = () => {
      if (chartRef.current) {
        // Set height based on container width for responsive aspect ratio
        const width = chartRef.current.offsetWidth;
        setChartHeight(Math.min(Math.max(width * 0.5, 300), 500));
      }
    };
    
    updateChartHeight();
    window.addEventListener('resize', updateChartHeight);
    
    return () => {
      window.removeEventListener('resize', updateChartHeight);
    };
  }, []);

  // Get chart data and colors
  const chartData = formatChartData(trends);
  const chartColors = getChartColors(materialsList.length);

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tendances des prix des matériaux</CardTitle>
          <CardDescription>
            Suivez l'évolution des prix des matériaux dans le temps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex flex-wrap gap-2 flex-1">
              {materialsList.map((material) => (
                <Button
                  key={material.id}
                  variant={selectedMaterials.includes(material.id) ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => toggleMaterialSelection(material.id)}
                >
                  {material.name}
                </Button>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={timeRange.toString()}
                onValueChange={(value) => setTimeRange(parseInt(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 mois</SelectItem>
                  <SelectItem value="6">6 mois</SelectItem>
                  <SelectItem value="12">1 an</SelectItem>
                  <SelectItem value="24">2 ans</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <i className="fas fa-download"></i>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Card */}
      <Card>
        <CardContent className="pt-6" ref={chartRef}>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">
                Erreur lors du chargement des tendances de prix.
              </p>
              <Button variant="outline">Réessayer</Button>
            </div>
          ) : !trends || trends.length === 0 || !chartData || chartData.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p>Aucune donnée disponible pour la période sélectionnée.</p>
              <p className="text-sm mt-2">
                Sélectionnez d'autres matériaux ou modifiez la période.
              </p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear().toString().substr(2)}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${formatCurrency(Number(value))}`, ""]}
                    labelFormatter={(date) => `Date: ${new Date(date).toLocaleDateString('fr-FR')}`}
                  />
                  <Legend />
                  {trends.map((material: any, index: number) => (
                    <Line 
                      key={material.materialId}
                      type="monotone" 
                      dataKey={material.name} 
                      stroke={chartColors[index % chartColors.length]}
                      activeDot={{ r: 8 }} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {trends.map((material: any) => {
                  // Calculate price change
                  const priceHistory = material.priceHistory;
                  const oldestPrice = priceHistory[0]?.price;
                  const latestPrice = material.currentPrice;
                  const priceChange = oldestPrice 
                    ? ((latestPrice - oldestPrice) / oldestPrice) * 100
                    : 0;
                  const increasing = priceChange > 0;

                  return (
                    <Card key={material.materialId} className="shadow-sm bg-neutral-50">
                      <CardContent className="p-4">
                        <h3 className="font-medium">{material.name}</h3>
                        <div className="flex justify-between items-baseline mt-2">
                          <div className="text-2xl font-semibold">
                            {formatCurrency(material.currentPrice, material.currency)}
                          </div>
                          <div className={`text-sm font-medium flex items-center ${
                            increasing ? 'text-red-500' : 'text-green-500'
                          }`}>
                            <i className={`fas fa-arrow-${increasing ? 'up' : 'down'} mr-1`}></i>
                            {Math.abs(priceChange).toFixed(1)}%
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          Prix actuel par {material.unit}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Price Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse des prix</CardTitle>
          <CardDescription>
            Insights sur les tendances des prix des matériaux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <i className="fas fa-robot text-blue-500 mt-0.5 mr-3"></i>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Analyse IA</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Les prix du ciment ont connu une augmentation constante de 7% au cours des 6 derniers mois, principalement due à la hausse des coûts de transport et à la demande croissante dans le secteur de la construction. Les prix de l'acier montrent une légère tendance à la baisse depuis le mois dernier, offrant une opportunité d'achat stratégique.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-neutral-200 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Prévisions pour le prochain trimestre</h3>
              <p className="text-sm text-neutral-600">
                Selon les tendances actuelles et l'analyse de notre IA, nous prévoyons une stabilisation des prix des matériaux de gros œuvre et une légère baisse des prix des matériaux de finition.
              </p>
            </div>

            <div className="p-4 border border-neutral-200 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Recommandations d'achat</h3>
              <p className="text-sm text-neutral-600">
                Considérez l'achat d'acier et de briques maintenant, et envisagez de reporter l'achat de ciment si possible. Les prix des matériaux de second œuvre devraient rester stables.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceTrends;
