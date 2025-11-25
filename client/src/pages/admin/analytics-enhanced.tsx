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
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
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
  Cell,
  Area,
  AreaChart
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export const EnhancedAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('12months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
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
    refetchInterval: 5000
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

  const handleExportReport = () => {
    exportAnalyticsMutation.mutate({
      format: exportFormat,
      dateRange,
      metrics: [selectedMetric]
    });
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, queryClient]);

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
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Tableau de bord analytique temps réel et prédictif</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${autoRefresh ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-xs text-gray-600">
              {autoRefresh ? 'Temps réel' : 'Statique'}
            </span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
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
          
          <Button onClick={handleExportReport} disabled={exportAnalyticsMutation.isPending}>
            <Download className="h-4 w-4 mr-2" />
            {exportAnalyticsMutation.isPending ? 'Export...' : 'Exporter'}
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

      {/* Enhanced KPI Cards */}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenus Mensuels et Projets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' 
                      ? `€${Number(value).toLocaleString()}`
                      : value,
                    name === 'revenue' ? 'Revenus' : 'Projets'
                  ]}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" name="Revenus" />
                <Line yAxisId="right" type="monotone" dataKey="projects" stroke="#82ca9d" name="Projets" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Projects by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Projets par Catégorie
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
                  label={({ category, count }) => `${category}: ${count}`}
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

        {/* Client Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Croissance des Clients
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
                <Line type="monotone" dataKey="newClients" stroke="#8884d8" name="Nouveaux Clients" />
                <Line type="monotone" dataKey="totalClients" stroke="#82ca9d" name="Total Clients" />
                <Line type="monotone" dataKey="activeClients" stroke="#ffc658" name="Clients Actifs" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quotation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Statut des Devis
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
                      ? `€${Number(value).toLocaleString()}`
                      : value,
                    name === 'value' ? 'Valeur' : 'Nombre'
                  ]}
                />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Nombre" />
                <Bar dataKey="value" fill="#82ca9d" name="Valeur" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* KPI Targets and Predictive Analytics */}
      {analytics.kpiTargets && analytics.kpiTargets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objectifs KPI et Prévisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.kpiTargets.map((kpi, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{kpi.name}</span>
                    <Badge variant={kpi.status === 'good' ? 'default' : kpi.status === 'warning' ? 'secondary' : 'destructive'}>
                      {kpi.status === 'good' ? 'Atteint' : kpi.status === 'warning' ? 'Attention' : 'Critique'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Actuel:</span>
                      <span className="font-semibold">{kpi.current}{kpi.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Objectif:</span>
                      <span className="font-semibold">{kpi.target}{kpi.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          kpi.status === 'good' ? 'bg-green-500' : 
                          kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, (kpi.current / kpi.target) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((kpi.current / kpi.target) * 100)}% de l'objectif
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictive Analytics Section */}
      {showPredictive && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Analyses Prédictives IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Revenus Prévus Mois Prochain</p>
                <p className="text-2xl font-bold text-green-600">
                  €{analytics.predictiveAnalytics.nextMonthRevenue.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Nouveaux Clients Attendus</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.predictiveAnalytics.expectedClients}
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Taux Completion Projeté</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.predictiveAnalytics.projectCompletion}%
                </p>
              </div>
            </div>
            {analytics.predictiveAnalytics.riskFactors.length > 0 && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Facteurs de Risque Identifiés
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {analytics.predictiveAnalytics.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-gray-600">{risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Toggle Predictive Analytics */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowPredictive(!showPredictive)}
        >
          {showPredictive ? 'Masquer' : 'Afficher'} les Analyses Prédictives
        </Button>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsPage;
