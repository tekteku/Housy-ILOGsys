import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ComparisonChartCard from "./ComparisonChartCard";
import { getDashboardAnalytics } from "@/lib/mega-data-service";

const BudgetComparisonSection = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['dashboard-analytics-budget'],
    queryFn: () => getDashboardAnalytics('month'),
    refetchInterval: 30000,
  });
  // Budget comparison data from API with fallback
  const budgetComparisonData = analytics?.budget?.categories || [
    { category: 'Matériaux', budget: 450000, actual: 482000 },
    { category: 'Main-d\'œuvre', budget: 320000, actual: 295000 },
    { category: 'Équipements', budget: 180000, actual: 196000 },
    { category: 'Sous-traitance', budget: 250000, actual: 270000 },
    { category: 'Permis', budget: 80000, actual: 80000 },
    { category: 'Marketing', budget: 45000, actual: 38000 },
  ];

  // Monthly budget data from API with fallback
  const monthlyBudgetData = analytics?.budget?.monthly || [
    { month: 'Janv', budget: 120000, actual: 125000 },
    { month: 'Févr', budget: 150000, actual: 148000 },
    { month: 'Mars', budget: 180000, actual: 195000 },
    { month: 'Avr', budget: 210000, actual: 200000 },
    { month: 'Mai', budget: 190000, actual: 205000 },
    { month: 'Juin', budget: 170000, actual: 168000 },
  ];

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Comparaisons Budgétaires</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Comparaisons Budgétaires</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Erreur lors du chargement des données budgétaires
        </div>
      </div>
    );
  }
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-neutral-800 mb-4">Comparaisons Budgétaires</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ComparisonChartCard 
          title="Budget vs Dépenses par Catégorie"
          description="Comparaison du budget initial et des dépenses réelles par catégorie"
          data={budgetComparisonData}
          targetKey="budget"
          actualKey="actual"
          xAxisKey="category"
          targetName="Budget prévu"
          actualName="Dépenses réelles"
          height={300}
        />
        
        <ComparisonChartCard 
          title="Suivi Mensuel des Dépenses"
          description="Évolution des dépenses par rapport au budget prévu"
          data={monthlyBudgetData}
          targetKey="budget"
          actualKey="actual"
          xAxisKey="month"
          targetName="Budget prévu"
          actualName="Dépenses réelles"
          height={300}
        />
      </div>
    </div>
  );
};

export default BudgetComparisonSection;
