import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { getDashboardAnalytics } from "@/lib/mega-data-service";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  progressValue?: number;
  progressLabel?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  iconBgClass,
  iconColorClass,
  trend,
  progressValue,
  progressLabel,
}: StatCardProps) => {
  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-neutral-500 text-sm">{title}</p>
            <p className="text-2xl font-semibold mt-1 text-neutral-900">{value}</p>
          </div>
          <div className={`w-10 h-10 ${iconBgClass} rounded-lg flex items-center justify-center`}>
            <i className={`fas fa-${icon} ${iconColorClass}`}></i>
          </div>
        </div>

        {trend && (
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm font-medium flex items-center ${
                trend.isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              <i
                className={`fas fa-arrow-${
                  trend.isPositive ? "up" : "down"
                } mr-1 text-xs`}
              ></i>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-neutral-500 text-sm ml-2">{trend.label}</span>
          </div>
        )}

        {progressValue !== undefined && progressLabel && (
          <div className="mt-4 flex items-center">
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${progressValue}%` }}
              ></div>
            </div>
            <span className="text-neutral-600 text-sm ml-2 whitespace-nowrap">
              {progressLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProjectStatsLoading = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, index) => (
        <Card key={index} className="shadow-sm border border-neutral-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface Project {
  id: number;
  name: string;
  budget: number;
  summary?: {
    totalTasks: number;
    completedTasks: number;
  };
}

const ProjectStats = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['dashboard-analytics', 'month'],
    queryFn: () => getDashboardAnalytics('month'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  console.log('ProjectStats - isLoading:', isLoading);
  console.log('ProjectStats - error:', error);
  console.log('ProjectStats - analytics data:', analytics);

  if (isLoading) {
    return <ProjectStatsLoading />;
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-full shadow-sm border border-neutral-200">
          <CardContent className="p-4 text-center text-red-500">
            <p>Erreur lors du chargement des statistiques. Veuillez réessayer.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data from analytics response
  const { projects, budget, materials, activities, tasks } = analytics || {};
  
  // Calculate budget totals from categories
  const totalBudget = budget?.categories?.reduce((sum, cat) => sum + cat.budget, 0) || 0;
  const spentBudget = budget?.categories?.reduce((sum, cat) => sum + cat.actual, 0) || 0;
  const materialsCost = budget?.categories?.find(cat => cat.category === 'Matériaux')?.actual || totalBudget * 0.35;
  
  // Use task data from analytics
  const totalTasks = tasks?.total || 45;
  const completedTasks = tasks?.completed || 32;
  const taskCompletionPercentage = tasks?.percentage || Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Projets actifs"
        value={projects?.active || 0}
        icon="building"
        iconBgClass="bg-primary-100"
        iconColorClass="text-primary-600"
        trend={{
          value: 12,
          label: "depuis le mois dernier",
          isPositive: true,
        }}
      />

      <StatCard
        title="Budget total"
        value={formatCurrency(totalBudget)}
        icon="money-bill-wave"
        iconBgClass="bg-green-100"
        iconColorClass="text-green-600"
        trend={{
          value: 3,
          label: "dépassement du budget",
          isPositive: false,
        }}
      />

      <StatCard
        title="Coûts matériaux"
        value={formatCurrency(materialsCost)}
        icon="hammer"
        iconBgClass="bg-yellow-100"
        iconColorClass="text-yellow-600"
        trend={{
          value: 5,
          label: "économies réalisées",
          isPositive: true,
        }}
      />

      <StatCard
        title="Tâches en cours"
        value={totalTasks - completedTasks}
        icon="clipboard-list"
        iconBgClass="bg-blue-100"
        iconColorClass="text-blue-600"
        progressValue={taskCompletionPercentage}
        progressLabel={`${taskCompletionPercentage}% terminées`}
      />
    </div>
  );
};

export default ProjectStats;
