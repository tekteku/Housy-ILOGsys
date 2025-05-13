import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
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

// Material price history data for the chart
interface MaterialPriceData {
  materialId: number;
  name: string;
  unit: string;
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
}

// Material comparison data for the table
interface MaterialComparisonData {
  name: string;
  unit: string;
  suppliers: Array<{
    supplier: string;
    price: number;
    currency: string;
  }>;
}

const MarketTrends = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState(300);
  
  // Query for material price trends
  const { data: materialTrends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ['/api/materials/trends', '1,2,3'],
  });
  
  // Format data for the chart
  const formatChartData = (materialsData: MaterialPriceData[] = []) => {
    if (!materialsData || materialsData.length === 0) return [];
    
    // Get all unique dates across all materials
    const allDates = new Set<string>();
    materialsData.forEach(material => {
      material.priceHistory.forEach(history => {
        allDates.add(history.date.split('T')[0]);
      });
    });
    
    // Sort dates
    const sortedDates = Array.from(allDates).sort();
    
    // Create data points for each date
    return sortedDates.map(date => {
      const dataPoint: any = { date };
      
      materialsData.forEach(material => {
        // Find price for this date or use the closest previous date
        const pricePoint = material.priceHistory.find(h => h.date.split('T')[0] === date);
        if (pricePoint) {
          dataPoint[material.name] = pricePoint.price;
        }
      });
      
      return dataPoint;
    });
  };
  
  // Sample materials comparison data
  const materialsComparison: MaterialComparisonData[] = [
    {
      name: "Ciment Portland CPJ 45",
      unit: "50 kg",
      suppliers: [
        { supplier: "Ciments d'Enfidha", price: 62.42, currency: "TND" },
        { supplier: "Sotumetal", price: 63.10, currency: "TND" },
        { supplier: "Cimaf", price: 60.75, currency: "TND" },
      ],
    },
    {
      name: "Acier HA Fe E400 Ø 12mm",
      unit: "tonne",
      suppliers: [
        { supplier: "Ciments d'Enfidha", price: 1446.34, currency: "TND" },
        { supplier: "Sotumetal", price: 1420.50, currency: "TND" },
        { supplier: "Cimaf", price: 1460.80, currency: "TND" },
      ],
    },
    {
      name: "Brique creuse 12 trous",
      unit: "unité",
      suppliers: [
        { supplier: "Ciments d'Enfidha", price: 1.25, currency: "TND" },
        { supplier: "Sotumetal", price: 1.23, currency: "TND" },
        { supplier: "Cimaf", price: 1.20, currency: "TND" },
      ],
    },
  ];
  
  // Get best price supplier for each material
  const getBestPriceSupplier = (suppliers: { supplier: string; price: number }[]) => {
    if (!suppliers || suppliers.length === 0) return null;
    
    return suppliers.reduce((best, current) => 
      current.price < best.price ? current : best, suppliers[0]);
  };
  
  // Adjust chart height on window resize
  useEffect(() => {
    const updateChartHeight = () => {
      if (chartRef.current) {
        // Set height based on container width for responsive aspect ratio
        const width = chartRef.current.offsetWidth;
        setChartHeight(Math.min(Math.max(width * 0.5, 200), 400));
      }
    };
    
    updateChartHeight();
    window.addEventListener('resize', updateChartHeight);
    
    return () => {
      window.removeEventListener('resize', updateChartHeight);
    };
  }, []);
  
  // Format chart data
  const chartData = formatChartData(materialTrends);
  
  return (
    <Card className="shadow-sm border border-neutral-200">
      <div className="p-5 border-b border-neutral-200">
        <h2 className="text-lg font-medium text-neutral-900">Tendances du marché</h2>
        <p className="text-neutral-500 text-sm mt-1">Évolution des prix des matériaux</p>
      </div>
      
      {/* Chart Area */}
      <div className="p-5" ref={chartRef}>
        {isLoadingTrends ? (
          <Skeleton className="h-64 w-full" />
        ) : (
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
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} TND`, ""]}
                labelFormatter={(date) => `Date: ${new Date(date).toLocaleDateString('fr-FR')}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Ciment Portland CPJ 45" 
                stroke="hsl(var(--chart-1))" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="Acier a beton HA Fe E400" 
                stroke="hsl(var(--chart-2))" 
              />
              <Line 
                type="monotone" 
                dataKey="Carrelage gres cerame" 
                stroke="hsl(var(--chart-3))" 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Price Comparison Table */}
      <div className="px-5 pb-5">
        <h3 className="font-medium text-neutral-900 mb-3">Comparaison des prix par fournisseur</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Matériau</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Unité</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ciments d'Enfidha</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Sotumetal</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Cimaf</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {materialsComparison.map((material, index) => {
                const bestSupplier = getBestPriceSupplier(material.suppliers);
                
                return (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-neutral-800">
                      {material.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-600">
                      {material.unit}
                    </td>
                    {material.suppliers.map((supplier, i) => (
                      <td 
                        key={i}
                        className={`px-3 py-2 whitespace-nowrap text-sm ${
                          bestSupplier && supplier.supplier === bestSupplier.supplier 
                            ? 'font-medium text-green-600' 
                            : 'text-neutral-600'
                        }`}
                      >
                        {formatCurrency(supplier.price, "TND", "fr-TN")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* View All Button */}
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" className="flex items-center">
            Voir tous les matériaux
            <i className="fas fa-chevron-right ml-1.5 text-xs"></i>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MarketTrends;
