import ChartCard from './ChartCard';
import MultiChartCard from './MultiChartCard';

// Sample data for the charts
const projectProgressData = [
  { month: 'Jan', progress: 30 },
  { month: 'Fév', progress: 42 },
  { month: 'Mar', progress: 45 },
  { month: 'Avr', progress: 50 },
  { month: 'Mai', progress: 58 },
  { month: 'Juin', progress: 72 },
  { month: 'Juil', progress: 80 },
];

const budgetUsageData = [
  { month: 'Jan', budget: 120 },
  { month: 'Fév', budget: 240 },
  { month: 'Mar', budget: 310 },
  { month: 'Avr', budget: 450 },
  { month: 'Mai', budget: 520 },
  { month: 'Juin', budget: 610 },
  { month: 'Juil', budget: 720 },
];

const materialUsageData = [
  { month: 'Jan', usage: 42 },
  { month: 'Fév', usage: 89 },
  { month: 'Mar', usage: 125 },
  { month: 'Avr', usage: 173 },
  { month: 'Mai', usage: 248 },
  { month: 'Juin', usage: 312 },
  { month: 'Juil', usage: 389 },
];

// Multi-series data example
const resourcesData = [
  { month: 'Jan', workers: 15, machines: 8 },
  { month: 'Fév', workers: 18, machines: 10 },
  { month: 'Mar', workers: 22, machines: 12 },
  { month: 'Avr', workers: 25, machines: 14 },
  { month: 'Mai', workers: 30, machines: 16 },
  { month: 'Juin', workers: 28, machines: 15 },
  { month: 'Juil', workers: 32, machines: 18 },
];

const ChartCardsSection = () => {  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-neutral-800 mb-4">Tendances et Analyses</h2>
      
      {/* Multi-series chart example */}
      <div className="mb-4">
        <MultiChartCard
          title="Ressources du projet"
          description="Comparaison des ressources humaines et matérielles"
          data={resourcesData}
          xAxisKey="month"
          type="line"
          series={[
            { key: "workers", name: "Main d'oeuvre", color: "#f59e0b" },
            { key: "machines", name: "Équipements", color: "#ef4444" }
          ]}
          height={250}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* First row with two larger charts */}
        <ChartCard 
          title="Progression des projets" 
          data={projectProgressData} 
          dataKey="progress" 
          xAxisKey="month"
          type="area"
          color="#4f46e5"
          description="Progression moyenne des projets actifs (%)"
          height={250}
          showLegend={false}
        />
        
        <ChartCard 
          title="Utilisation du budget" 
          data={budgetUsageData} 
          dataKey="budget" 
          xAxisKey="month"
          type="bar"
          color="#8b5cf6"
          description="Budget utilisé par mois (milliers TND)"
          height={250}
          showLegend={false}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Second row with three smaller charts */}
        <ChartCard 
          title="Consommation des matériaux" 
          data={materialUsageData} 
          dataKey="usage" 
          xAxisKey="month"
          type="line"
          color="#10b981"
          description="Nombre de matériaux utilisés"
        />
        
        <ChartCard 
          title="Main d'oeuvre" 
          data={resourcesData} 
          dataKey="workers" 
          xAxisKey="month"
          type="line"
          color="#f59e0b"
          description="Nombre d'ouvriers sur site"
        />
        
        <ChartCard 
          title="Équipements" 
          data={resourcesData} 
          dataKey="machines" 
          xAxisKey="month"
          type="line"
          color="#ef4444"
          description="Nombre de machines en service"
        />
      </div>
    </div>
  );
};

export default ChartCardsSection;
