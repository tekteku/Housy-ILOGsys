import StatCard from './StatCard';

const StatCardsSection = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Projets actifs" 
        value="12" 
        description="3 projets de plus qu'au mois dernier" 
        icon="fa-building" 
        iconBgColor="bg-blue-100" 
        iconColor="text-blue-600"
      />
      
      <StatCard 
        title="Budget total" 
        value="2,45M TND" 
        description="Budget cumulé de tous les projets" 
        icon="fa-money-bill-wave" 
        iconBgColor="bg-green-100" 
        iconColor="text-green-600"
      />
      
      <StatCard 
        title="Matériaux" 
        value="856" 
        description="24 commandes en attente de livraison" 
        icon="fa-truck" 
        iconBgColor="bg-amber-100" 
        iconColor="text-amber-600"
      />
      
      <StatCard 
        title="Progression moyenne" 
        value="68%" 
        description="Augmentation de 12% ce trimestre" 
        icon="fa-chart-line" 
        iconBgColor="bg-purple-100" 
        iconColor="text-purple-600"
      />
    </div>
  );
};

export default StatCardsSection;
