import ChartCard from './ChartCard';
import StatCard from './StatCard';
import ChatbotPreviewCard from './ChatbotPreviewCard';

// Sample data for chart
const weeklyCostsData = [
  { day: 'Lun', cost: 12500 },
  { day: 'Mar', cost: 18700 },
  { day: 'Mer', cost: 15400 },
  { day: 'Jeu', cost: 21000 },
  { day: 'Ven', cost: 19200 },
  { day: 'Sam', cost: 8500 },
  { day: 'Dim', cost: 4200 },
];

const materialPriceData = [
  { month: 'Jan', price: 100 },
  { month: 'Fév', price: 110 },
  { month: 'Mar', price: 105 },
  { month: 'Avr', price: 115 },
  { month: 'Mai', price: 130 },
  { month: 'Juin', price: 125 },
  { month: 'Juil', price: 135 },
];

const DashboardCardsGrid = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Column 1 */}
      <div className="lg:col-span-2 space-y-4">
        <ChartCard 
          title="Dépenses de la semaine" 
          data={weeklyCostsData} 
          dataKey="cost" 
          xAxisKey="day"
          type="bar"
          color="#6366f1"
          description="Coûts journaliers (TND)"
          height={220}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard 
            title="Taux d'occupation" 
            value="92%" 
            description="Taux d'occupation des équipements" 
            icon="fa-cogs" 
            iconBgColor="bg-sky-100" 
            iconColor="text-sky-600"
          />
          
          <StatCard 
            title="Coût moyen journalier" 
            value="14 214 TND" 
            description="Coût moyen des 7 derniers jours" 
            icon="fa-money-bill-trend-up" 
            iconBgColor="bg-rose-100" 
            iconColor="text-rose-600"
          />
        </div>
      </div>
      
      {/* Column 2 */}
      <div className="space-y-4">        <div className="bg-white p-4 rounded-lg shadow border border-neutral-200">
          <h3 className="text-md font-semibold text-neutral-700 mb-3">Tâches prioritaires</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input type="checkbox" className="w-4 h-4 rounded mr-2" />
              <span className="text-sm text-neutral-700">Valider les plans révisés</span>
              <span className="ml-auto text-xs text-amber-500 font-medium">Aujourd'hui</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="w-4 h-4 rounded mr-2" />
              <span className="text-sm text-neutral-700">Commander ciment (12 tonnes)</span>
              <span className="ml-auto text-xs text-red-500 font-medium">Urgent</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="w-4 h-4 rounded mr-2" checked />
              <span className="text-sm text-neutral-500 line-through">Payer les fournisseurs</span>
              <span className="ml-auto text-xs text-green-500 font-medium">Terminé</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="w-4 h-4 rounded mr-2" />
              <span className="text-sm text-neutral-700">Réunion équipe architecture</span>
              <span className="ml-auto text-xs text-neutral-500 font-medium">Demain</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="w-4 h-4 rounded mr-2" />
              <span className="text-sm text-neutral-700">Inspecter phase électrique</span>
              <span className="ml-auto text-xs text-neutral-500 font-medium">26 mai</span>
            </div>
          </div>
        </div>
        
        <ChatbotPreviewCard />
        
        <ChartCard 
          title="Prix du ciment (tonne)" 
          data={materialPriceData} 
          dataKey="price" 
          xAxisKey="month"
          type="line"
          color="#f43f5e"
          height={160}
        />
        
        <div className="bg-white p-4 rounded-lg shadow border border-neutral-200">
          <h3 className="text-md font-semibold text-neutral-700 mb-2">Alertes matériaux</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-amber-600">
              <i className="fas fa-triangle-exclamation mr-2"></i>
              <span>Stock faible: Acier (250kg)</span>
            </div>
            <div className="flex items-center text-red-600">
              <i className="fas fa-circle-xmark mr-2"></i>
              <span>Rupture: Carrelage modèle A12</span>
            </div>
            <div className="flex items-center text-blue-600">
              <i className="fas fa-truck mr-2"></i>
              <span>Livraison prévue: Bois (25 mai)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCardsGrid;
