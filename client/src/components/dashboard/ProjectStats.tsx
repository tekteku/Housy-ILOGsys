import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercentage } from "@/lib/utils";

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

const ProjectStats = () => {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['/api/projects'],
  });

  if (isLoading) {
    return <ProjectStatsLoading />;
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-full shadow-sm border border-neutral-200">
          <CardContent className="p-4 text-center text-red-500">
            <p>Error loading project stats. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats from projects data
  const activeProjects = projects?.length || 0;
  
  const totalBudget = projects?.reduce(
    (sum: number, project: any) => sum + (project.budget || 0),
    0
  ) || 0;
  
  // For materials cost, we'll use a percentage of total budget for demonstration
  const materialsCost = totalBudget * 0.35;
  
  const totalTasks = projects?.reduce(
    (sum: number, project: any) => sum + (project.summary?.totalTasks || 0),
    0
  ) || 0;
  
  const completedTasks = projects?.reduce(
    (sum: number, project: any) => sum + (project.summary?.completedTasks || 0),
    0
  ) || 0;
  
  const taskCompletionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Projets actifs"
        value={activeProjects}
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
