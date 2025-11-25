import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Eye,
  PieChart,
  BarChart3,
  LineChart
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  activeProjects: number;
  completedProjects: number;
  pendingPayments: number;
  monthlyGrowth: number;
}

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ProjectByCategory {
  name: string;
  value: number;
  color: string;
}

interface FinancialDashboardProps {
  projectId?: string;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ projectId }) => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [projectsByCategory, setProjectsByCategory] = useState<ProjectByCategory[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'pie'>('line');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod, projectId]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const endpoint = projectId 
        ? `/api/financial/project/${projectId}?period=${selectedPeriod}`
        : `/api/financial/dashboard?period=${selectedPeriod}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      setMetrics(data.metrics);
      setChartData(data.chartData || []);
      setProjectsByCategory(data.projectsByCategory || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'csv' | 'pdf') => {
    try {
      const endpoint = projectId 
        ? `/api/financial/export/project/${projectId}?format=${format}&period=${selectedPeriod}`
        : `/api/financial/export?format=${format}&period=${selectedPeriod}`;
      
      const response = await fetch(endpoint);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${selectedPeriod}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres et actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {projectId ? 'Finances du Projet' : 'Dashboard Financier'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vue d'ensemble des performances financières
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sélecteur de période */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="1month">1 mois</option>
            <option value="3months">3 mois</option>
            <option value="6months">6 mois</option>
            <option value="1year">1 an</option>
            <option value="all">Tout</option>
          </select>

          {/* Sélecteur de type de graphique */}
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setSelectedChart('line')}
              className={`p-2 ${selectedChart === 'line' ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedChart('bar')}
              className={`p-2 ${selectedChart === 'bar' ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedChart('pie')}
              className={`p-2 ${selectedChart === 'pie' ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <PieChart className="w-4 h-4" />
            </button>
          </div>

          {/* Boutons d'export */}
          <button
            onClick={() => exportData('csv')}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => exportData('pdf')}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">
                +{metrics.monthlyGrowth.toFixed(1)}% ce mois
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(metrics.totalExpenses)}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(metrics.profit)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Marge: {metrics.profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projets actifs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.activeProjects}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {metrics.completedProjects} terminés
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique principal */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Évolution financière
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {selectedChart === 'line' ? (
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    name="Revenus"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#FF8042" 
                    strokeWidth={2}
                    name="Dépenses"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#00C49F" 
                    strokeWidth={2}
                    name="Profit"
                  />
                </RechartsLineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="#0088FE" name="Revenus" />
                  <Bar dataKey="expenses" fill="#FF8042" name="Dépenses" />
                  <Bar dataKey="profit" fill="#00C49F" name="Profit" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par catégorie */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Projets par catégorie
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Tooltip formatter={(value) => `${value} projets`} />                <Pie 
                  data={projectsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
