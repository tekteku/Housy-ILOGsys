import { useQuery } from '@tanstack/react-query';
import StatCard from './StatCard';
import { getDashboardAnalytics } from '@/lib/mega-data-service';

const StatCardsSection = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => getDashboardAnalytics('month'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        Erreur lors du chargement des statistiques
      </div>
    );
  }

  const { projects, materials } = analytics || {};
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Projets actifs" 
        value={projects?.active?.toString() || '0'} 
        description={`${projects?.total || 0} projets au total`} 
        icon="fa-building" 
        iconBgColor="bg-blue-100" 
        iconColor="text-blue-600"
      />
      
      <StatCard 
        title="Projets terminés" 
        value={projects?.completed?.toString() || '0'} 
        description="Projets complétés avec succès" 
        icon="fa-check-circle" 
        iconBgColor="bg-green-100" 
        iconColor="text-green-600"
      />
      
      <StatCard 
        title="Matériaux" 
        value={materials?.total?.toString() || '0'} 
        description={`${materials?.categories || 0} catégories disponibles`} 
        icon="fa-truck" 
        iconBgColor="bg-amber-100" 
        iconColor="text-amber-600"
      />
      
      <StatCard 
        title="Progression moyenne" 
        value={`${Math.round(projects?.averageProgress || 0)}%`} 
        description="Moyenne de tous les projets actifs" 
        icon="fa-chart-line" 
        iconBgColor="bg-purple-100" 
        iconColor="text-purple-600"
      />
    </div>
  );
};

export default StatCardsSection;
