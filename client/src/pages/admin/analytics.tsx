import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign,
  Calendar,
  PieChart,
  Activity,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Share,
  Eye,
  Plus,
  Trash2,
  Edit,
  MoreHorizontal,
  Target,
  Zap,
  Globe,
  Cpu,
  Database,
  Wifi,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalProjects: number;
    activeClients: number;
    completedProjects: number;
    pendingQuotations: number;
    conversionRate: number;
    systemHealth: number;
    uptime: number;
    avgResponseTime: number;
  };
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    projects: number;
    clients: number;
  }>;
  projectsByCategory: Array<{
    category: string;
    count: number;
    value: number;
    color: string;
  }>;
  clientGrowth: Array<{
    month: string;
    newClients: number;
    totalClients: number;
    activeClients: number;
  }>;
  quotationStats: Array<{
    status: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  realTimeMetrics: {
    activeUsers: number;
    onlineUsers: number;
    currentProjects: number;
    pendingTasks: number;
    systemLoad: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  kpiTargets: Array<{
    name: string;
    current: number;
    target: number;
    unit: string;
    status: 'good' | 'warning' | 'danger';
  }>;
  predictiveAnalytics: {
    nextMonthRevenue: number;
    expectedClients: number;
    projectCompletion: number;
    riskFactors: string[];
  };
}

interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'realtime';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  visible: boolean;
  config: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const AdminAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('12months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [dashboardLayout, setDashboardLayout] = useState<DashboardWidget[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [selectedKPI, setSelectedKPI] = useState<string>('all');
  const [showPredictive, setShowPredictive] = useState(false);

  const queryClient = useQueryClient();

  // Fetch analytics data with real-time updates
  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['admin-analytics', dateRange],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false
  });

  // Fetch real-time metrics
  const { data: realTimeData } = useQuery({
    queryKey: ['real-time-metrics'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/analytics/realtime', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch real-time data');
      return response.json();
    },
    refetchInterval: 5000 // Update every 5 seconds
  });

  // Export analytics mutation
  const exportAnalyticsMutation = useMutation({
    mutationFn: async ({ format, dateRange, metrics }: { format: string; dateRange: string; metrics: string[] }) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format, dateRange, metrics })
      });

      if (!response.ok) throw new Error('Failed to export analytics');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  });

  // Alert creation mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertConfig: any) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/analytics/alerts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alertConfig)
      });

      if (!response.ok) throw new Error('Failed to create alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, queryClient]);

  const handleExportReport = () => {
    exportAnalyticsMutation.mutate({
      format: exportFormat,
      dateRange,
      metrics: [selectedMetric]
    });
  };

  // KPI calculation helpers
  const getKPIStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 95) return 'good';
    if (percentage >= 80) return 'warning';
    return 'danger';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'danger': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600">Impossible de charger les données analytiques</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Real-time Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Tableau de bord analytique temps réel et prédictif</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Activity className={`h-4 w-4 ${autoRefresh ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-xs text-gray-600">
                {autoRefresh ? 'Temps réel' : 'Statique'}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Désactiver' : 'Activer'} temps réel
            </Button>
          </div>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="3months">3 derniers mois</SelectItem>
              <SelectItem value="6months">6 derniers mois</SelectItem>
              <SelectItem value="12months">12 derniers mois</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setExportFormat(value)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleExportReport} disabled={exportAnalyticsMutation.isPending}>
            <Download className="h-4 w-4 mr-2" />
            {exportAnalyticsMutation.isPending ? 'Export...' : 'Exporter'}
          </Button>
          
          <Button variant="outline" onClick={() => setIsCustomizing(!isCustomizing)}>
            <Settings className="h-4 w-4 mr-2" />
            Personnaliser
          </Button>
        </div>
      </div>

      {/* Real-time System Status */}
      {realTimeData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Statut Système Temps Réel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium">Utilisateurs</span>
                </div>
                <p className="text-lg font-bold text-green-600">{realTimeData.onlineUsers}</p>
                <p className="text-xs text-gray-600">en ligne</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Building className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm font-medium">Projets</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{realTimeData.currentProjects}</p>
                <p className="text-xs text-gray-600">actifs</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-sm font-medium">Tâches</span>
                </div>
                <p className="text-lg font-bold text-orange-600">{realTimeData.pendingTasks}</p>
                <p className="text-xs text-gray-600">en attente</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Cpu className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-sm font-medium">CPU</span>
                </div>
                <p className="text-lg font-bold text-purple-600">{realTimeData.cpuUsage}%</p>
                <p className="text-xs text-gray-600">utilisation</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Database className="h-4 w-4 text-indigo-600 mr-1" />
                  <span className="text-sm font-medium">Mémoire</span>
                </div>
                <p className="text-lg font-bold text-indigo-600">{realTimeData.memoryUsage}%</p>
                <p className="text-xs text-gray-600">utilisée</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Wifi className="h-4 w-4 text-teal-600 mr-1" />
                  <span className="text-sm font-medium">Uptime</span>
                </div>
                <p className="text-lg font-bold text-teal-600">{analytics.overview.uptime}%</p>
                <p className="text-xs text-gray-600">disponibilité</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Shield className="h-4 w-4 text-emerald-600 mr-1" />
                  <span className="text-sm font-medium">Santé</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{analytics.overview.systemHealth}/10</p>
                <p className="text-xs text-gray-600">score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced KPI Cards with Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Revenus Total</p>
                <p className="text-2xl font-bold text-green-600">
                  €{analytics.overview.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    +{Math.round(((analytics.overview.totalRevenue / analytics.predictiveAnalytics.nextMonthRevenue) - 1) * 100)}%
                  </span>
                  <span className="text-sm text-gray-600 ml-1">vs prévu</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Projets Actifs</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.overview.totalProjects}</p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">
                    {analytics.overview.completedProjects} terminés
                  </span>
                </div>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Clients Actifs</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.overview.activeClients}</p>
                <div className="flex items-center mt-2">
                  <Target className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-sm text-purple-600 font-medium">
                    {analytics.predictiveAnalytics.expectedClients} attendus
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Taux Conversion</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.overview.conversionRate}%</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-sm text-orange-600 font-medium">
                    {analytics.overview.pendingQuotations} devis en attente
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.overview.totalProjects}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.overview.activeClients}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{analytics.overview.completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.overview.pendingQuotations}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.overview.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Revenue & Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' 
                      ? new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(Number(value))
                      : value,
                    name === 'revenue' ? 'Revenue' : 'Projects'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="projects" stroke="#82ca9d" name="Projects" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Projects by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Projects by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={analytics.projectsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.projectsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.clientGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newClients" stroke="#8884d8" name="New Clients" />
                <Line type="monotone" dataKey="totalClients" stroke="#82ca9d" name="Total Clients" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quotation Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quotation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.quotationStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' 
                      ? new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(Number(value))
                      : value,
                    name === 'value' ? 'Value' : 'Count'
                  ]}
                />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Count" />
                <Bar dataKey="value" fill="#82ca9d" name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Category Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Projects</th>
                  <th className="text-left p-3">Total Value</th>
                  <th className="text-left p-3">Avg. Project Value</th>
                  <th className="text-left p-3">Market Share</th>
                </tr>
              </thead>
              <tbody>
                {analytics.projectsByCategory.map((category, index) => {
                  const avgValue = category.value / category.count;
                  const totalProjects = analytics.projectsByCategory.reduce((sum, cat) => sum + cat.count, 0);
                  const marketShare = (category.count / totalProjects) * 100;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{category.category}</td>
                      <td className="p-3">{category.count}</td>
                      <td className="p-3 font-medium text-green-600">
                        {new Intl.NumberFormat('fr-TN', { 
                          style: 'currency', 
                          currency: 'TND' 
                        }).format(category.value)}
                      </td>
                      <td className="p-3">
                        {new Intl.NumberFormat('fr-TN', { 
                          style: 'currency', 
                          currency: 'TND' 
                        }).format(avgValue)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${marketShare}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{marketShare.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Performing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.projectsByCategory
                .sort((a, b) => b.value - a.value)
                .slice(0, 3)
                .map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{category.category}</span>
                    <span className="text-sm font-medium text-green-600">
                      {new Intl.NumberFormat('fr-TN', { 
                        style: 'currency', 
                        currency: 'TND',
                        notation: 'compact'
                      }).format(category.value)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Most Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.projectsByCategory
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{category.category}</span>
                    <span className="text-sm font-medium text-blue-600">
                      {category.count} projects
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Quotations</span>
                <span className="text-sm font-medium text-orange-600">
                  {analytics.overview.pendingQuotations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Conversion Rate</span>
                <span className={`text-sm font-medium ${
                  analytics.overview.conversionRate < 30 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {analytics.overview.conversionRate}%
                </span>
              </div>
              {analytics.quotationStats
                .filter(stat => stat.status === 'rejected')
                .map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">Rejected Quotes</span>
                    <span className="text-sm font-medium text-red-600">
                      {stat.count}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
