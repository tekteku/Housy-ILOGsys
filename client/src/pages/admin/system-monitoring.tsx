import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  Wifi,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Network,
  Monitor,
  Settings,
  RefreshCw,
  Power,
  PowerOff,
  Zap,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Lock,
  Unlock,
  Download,
  Upload,
  Eye,
  MoreHorizontal,
  Terminal,
  FileText,
  Bell,
  Info,
  Calendar,
  MapPin,
  Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    frequency: number;
  };
  memory: {
    used: number;
    total: number;
    usage: number;
    available: number;
  };
  disk: {
    used: number;
    total: number;
    usage: number;
    available: number;
  };
  network: {
    downloadSpeed: number;
    uploadSpeed: number;
    totalDownload: number;
    totalUpload: number;
    latency: number;
  };
  processes: {
    total: number;
    running: number;
    sleeping: number;
    zombie: number;
  };
  uptime: number;
  loadAverage: number[];
}

interface Service {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  port?: number;
  pid?: number;
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
  lastRestart?: string;
  autoRestart: boolean;
  description: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  service: string;
  message: string;
  details?: any;
}

interface Alert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'service' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  resolvedAt?: string;
}

interface SystemHealth {
  overall: number;
  components: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    services: number;
    security: number;
  };
  recommendations: string[];
  lastCheck: string;
}

export const SystemMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'logs' | 'alerts' | 'health'>('overview');
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [logLevel, setLogLevel] = useState('all');

  const queryClient = useQueryClient();

  // Fetch system metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<SystemMetrics>({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/system/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    refetchInterval: autoRefresh ? 5000 : false
  });

  // Fetch services
  const { data: services } = useQuery<Service[]>({
    queryKey: ['system-services'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/system/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
    refetchInterval: autoRefresh ? 10000 : false
  });

  // Fetch logs
  const { data: logs } = useQuery<LogEntry[]>({
    queryKey: ['system-logs', logLevel],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        limit: '100',
        ...(logLevel !== 'all' && { level: logLevel })
      });
      const response = await fetch(`/api/admin/system/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch logs');
      return response.json();
    }
  });

  // Fetch alerts
  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['system-alerts'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/system/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    },
    refetchInterval: autoRefresh ? 15000 : false
  });

  // Fetch system health
  const { data: health } = useQuery<SystemHealth>({
    queryKey: ['system-health'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/system/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch health');
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false
  });

  // Fetch historical data
  const { data: historicalData } = useQuery({
    queryKey: ['system-historical', timeRange],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/system/historical?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch historical data');
      return response.json();
    }
  });

  // Service control mutation
  const serviceControlMutation = useMutation({
    mutationFn: async ({ serviceId, action }: { serviceId: string; action: 'start' | 'stop' | 'restart' }) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/system/services/${serviceId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`Failed to ${action} service`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-services'] });
    }
  });

  // Alert action mutation
  const alertActionMutation = useMutation({
    mutationFn: async ({ alertId, action }: { alertId: string; action: 'acknowledge' | 'resolve' }) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/system/alerts/${alertId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`Failed to ${action} alert`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'stopped': return 'text-red-600 bg-red-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'starting': return 'text-yellow-600 bg-yellow-100';
      case 'stopping': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'debug': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}j ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Monitor className="h-8 w-8 text-blue-600" />
            Monitoring Système
          </h1>
          <p className="text-gray-600 mt-1">Surveillance en temps réel des performances et services</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${autoRefresh ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <span className="text-sm text-gray-600">Temps réel</span>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 heure</SelectItem>
              <SelectItem value="6h">6 heures</SelectItem>
              <SelectItem value="24h">24 heures</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* System Health Overview */}
      {health && (
        <Card className={`border-l-4 ${health.overall >= 90 ? 'border-l-green-500' : health.overall >= 70 ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              État du Système
              <Badge className={health.overall >= 90 ? 'bg-green-100 text-green-800' : health.overall >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                {health.overall}% Santé
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(health.components).map(([component, score]) => (
                <div key={component} className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1 capitalize">{component}</div>
                  <div className={`text-lg font-bold ${score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {score}%
                  </div>
                  <Progress value={score} className="h-2 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">CPU</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.cpu.usage}%</p>
                  <p className="text-xs text-gray-500">{metrics.cpu.cores} cores • {metrics.cpu.temperature}°C</p>
                  <Progress value={metrics.cpu.usage} className="h-2 mt-2" />
                </div>
                <Cpu className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Mémoire</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.memory.usage}%</p>
                  <p className="text-xs text-gray-500">{formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}</p>
                  <Progress value={metrics.memory.usage} className="h-2 mt-2" />
                </div>
                <Database className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Disque</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.disk.usage}%</p>
                  <p className="text-xs text-gray-500">{formatBytes(metrics.disk.used)} / {formatBytes(metrics.disk.total)}</p>
                  <Progress value={metrics.disk.usage} className="h-2 mt-2" />
                </div>
                <HardDrive className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Réseau</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-semibold">{(metrics.network.downloadSpeed / 1024 / 1024).toFixed(1)} MB/s</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Upload className="h-3 w-3 text-blue-600" />
                      <span className="text-sm font-semibold">{(metrics.network.uploadSpeed / 1024 / 1024).toFixed(1)} MB/s</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Latence: {metrics.network.latency}ms</p>
                </div>
                <Network className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="health">Santé</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {historicalData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Utilisation CPU et Mémoire</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={historicalData.metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="cpu" stackId="1" stroke="#8884d8" fill="#8884d8" name="CPU %" />
                      <Area type="monotone" dataKey="memory" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Mémoire %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trafic Réseau</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData.network}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="download" stroke="#8884d8" name="Download (MB/s)" />
                      <Line type="monotone" dataKey="upload" stroke="#82ca9d" name="Upload (MB/s)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Informations Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Uptime</div>
                  <div className="font-semibold">{metrics ? formatUptime(metrics.uptime) : 'N/A'}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Server className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Processus</div>
                  <div className="font-semibold">{metrics?.processes.running} / {metrics?.processes.total}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Gauge className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Load Average</div>
                  <div className="font-semibold">{metrics?.loadAverage.join(', ')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Services Actifs</div>
                  <div className="font-semibold">{services?.filter(s => s.status === 'running').length} / {services?.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Services Système</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>CPU</TableHead>
                    <TableHead>Mémoire</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Redémarrages</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services?.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-600">{service.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{service.port || 'N/A'}</TableCell>
                      <TableCell>{service.cpu.toFixed(1)}%</TableCell>
                      <TableCell>{formatBytes(service.memory)}</TableCell>
                      <TableCell>{formatUptime(service.uptime)}</TableCell>
                      <TableCell>{service.restarts}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {service.status === 'running' ? (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => serviceControlMutation.mutate({ serviceId: service.id, action: 'restart' })}
                                disabled={serviceControlMutation.isPending}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => serviceControlMutation.mutate({ serviceId: service.id, action: 'stop' })}
                                disabled={serviceControlMutation.isPending}
                              >
                                <PowerOff className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => serviceControlMutation.mutate({ serviceId: service.id, action: 'start' })}
                              disabled={serviceControlMutation.isPending}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Logs Système</CardTitle>
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="error">Erreurs</SelectItem>
                  <SelectItem value="warning">Avertissements</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs?.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge className={getLevelColor(log.level)}>
                      {log.level}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.service}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts?.map((alert) => (
                  <div key={alert.id} className={`p-4 border rounded-lg ${alert.status === 'active' ? 'border-red-200 bg-red-50' : alert.status === 'acknowledged' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">
                            {alert.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{alert.title}</h3>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                      <div className="flex gap-1">
                        {alert.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => alertActionMutation.mutate({ alertId: alert.id, action: 'acknowledge' })}
                          >
                            Acquitter
                          </Button>
                        )}
                        {alert.status !== 'resolved' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => alertActionMutation.mutate({ alertId: alert.id, action: 'resolve' })}
                          >
                            Résoudre
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4">
          {health && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Recommandations Système</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {health.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <p className="text-sm text-blue-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scores de Santé Détaillés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(health.components).map(([component, score]) => (
                      <div key={component} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                          <span className="font-medium capitalize">{component}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={score} className="w-32" />
                          <span className="font-semibold w-12 text-right">{score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemMonitoringPage;
