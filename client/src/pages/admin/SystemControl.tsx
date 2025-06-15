/**
 * Centre de Contrôle Système - Page Admin
 * 
 * Features:
 * - Monitoring en temps réel des serveurs
 * - Métriques de performance système
 * - Gestion des services et processus
 * - Logs système et maintenance
 * 
 * @author Housy Development Team
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Server, 
  Activity, 
  HardDrive, 
  Cpu, 
  Wifi,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Database,
  Shield,
  Clock,
  TrendingUp,
  BarChart3,
  Monitor,
  Zap,
  Thermometer
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface SystemMetrics {
  cpu: { usage: number; temperature: number; cores: number };
  memory: { used: number; total: number; percentage: number };
  disk: { used: number; total: number; percentage: number };
  network: { inbound: number; outbound: number; latency: number };
  database: { connections: number; queries: number; performance: number; uptime: string };
  services: Array<{ 
    name: string; 
    status: 'running' | 'stopped' | 'error'; 
    uptime: string;
    memory: number;
    cpu: number;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
}

const SystemControlPage: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data pour la démonstration
  const mockSystemMetrics: SystemMetrics = {
    cpu: { usage: 45, temperature: 62, cores: 8 },
    memory: { used: 12.5, total: 32, percentage: 39 },
    disk: { used: 456, total: 1000, percentage: 46 },
    network: { inbound: 12.8, outbound: 8.3, latency: 23 },
    database: { connections: 45, queries: 1247, performance: 98, uptime: "15j 3h 24m" },
    services: [
      { name: 'PostgreSQL Database', status: 'running', uptime: '15j 3h 24m', memory: 2.1, cpu: 8.5 },
      { name: 'Node.js API Server', status: 'running', uptime: '2j 14h 12m', memory: 1.8, cpu: 12.3 },
      { name: 'Redis Cache', status: 'running', uptime: '15j 3h 20m', memory: 0.5, cpu: 2.1 },
      { name: 'File Upload Service', status: 'running', uptime: '1j 8h 45m', memory: 0.3, cpu: 1.2 },
      { name: 'Email Service', status: 'error', uptime: '0m', memory: 0, cpu: 0 },
      { name: 'Backup Service', status: 'running', uptime: '15j 3h 24m', memory: 0.8, cpu: 0.5 }
    ],
    alerts: [
      { id: '1', type: 'warning', message: 'Utilisation mémoire élevée (85%)', timestamp: '2025-06-08T14:30:00Z' },
      { id: '2', type: 'error', message: 'Service Email en panne', timestamp: '2025-06-08T13:45:00Z' },
      { id: '3', type: 'info', message: 'Sauvegarde automatique terminée', timestamp: '2025-06-08T12:00:00Z' }
    ]
  };

  const { data: systemMetrics = mockSystemMetrics, isLoading, refetch } = useQuery<SystemMetrics>({
    queryKey: ['system-metrics', selectedTimeRange],
    queryFn: async () => {
      // En production, ceci appellerait l'API réelle
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockSystemMetrics;
    },
    refetchInterval: autoRefresh ? 30000 : false // Refresh every 30 seconds if auto-refresh is on
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200';
      case 'stopped': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'stopped': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Chargement des métriques système...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Server className="h-8 w-8 mr-3 text-blue-600" />
            Centre de Contrôle Système
          </h1>
          <p className="text-gray-600 mt-1">Monitoring en temps réel et gestion système</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)} 
            variant={autoRefresh ? "default" : "outline"}
          >
            <Zap className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto-actualisation ON' : 'Auto-actualisation OFF'}
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {systemMetrics.alerts.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Alertes Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemMetrics.alerts.map((alert) => (
                <div key={alert.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                  {getAlertIcon(alert.type)}
                  <span className="flex-1">{alert.message}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.cpu.usage}%</div>
            <Progress value={systemMetrics.cpu.usage} className="mt-2" />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center">
                <Thermometer className="h-3 w-3 mr-1" />
                {systemMetrics.cpu.temperature}°C
              </span>
              <span>{systemMetrics.cpu.cores} cœurs</span>
            </div>
          </CardContent>
        </Card>        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mémoire</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.memory.percentage}%</div>
            <Progress value={systemMetrics.memory.percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {systemMetrics.memory.used}GB / {systemMetrics.memory.total}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stockage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.disk.percentage}%</div>
            <Progress value={systemMetrics.disk.percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {systemMetrics.disk.used}GB / {systemMetrics.disk.total}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base de Données</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.database.connections}</div>
            <p className="text-xs text-muted-foreground">Connexions actives</p>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{systemMetrics.database.queries} req/min</span>
              <span>{systemMetrics.database.performance}% perf</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="network">Réseau</TabsTrigger>
          <TabsTrigger value="logs">Logs Système</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>État des Services</CardTitle>
              <CardDescription>
                Monitoring en temps réel des services critiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemMetrics.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div className="flex-1">
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-500">Uptime: {service.uptime}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                          <span>RAM: {service.memory}GB</span>
                          <span>CPU: {service.cpu}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(service.status)}>
                        {service.status === 'running' ? 'En cours' : 
                         service.status === 'stopped' ? 'Arrêté' : 'Erreur'}
                      </Badge>
                      {service.status === 'error' && (
                        <Button size="sm" variant="outline">
                          Redémarrer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Trafic Entrant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {systemMetrics.network.inbound} MB/s
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+2.5% depuis hier</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Trafic Sortant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {systemMetrics.network.outbound} MB/s
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600">+1.2% depuis hier</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="h-5 w-5 mr-2 text-orange-600" />
                  Latence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {systemMetrics.network.latency}ms
                </div>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">Optimal</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs Système Récents</CardTitle>
              <CardDescription>
                Dernières entrées du journal système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="flex items-center space-x-2 text-sm p-2 rounded bg-green-50">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">2025-06-08 14:32:15</span>
                  <Badge variant="outline" className="text-green-600">INFO</Badge>
                  <span>Nouvelle connexion utilisateur admin@housy.tn</span>
                </div>
                <div className="flex items-center space-x-2 text-sm p-2 rounded bg-blue-50">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">2025-06-08 14:30:42</span>
                  <Badge variant="outline" className="text-blue-600">SUCCESS</Badge>
                  <span>Sauvegarde automatique de la base de données terminée</span>
                </div>
                <div className="flex items-center space-x-2 text-sm p-2 rounded bg-yellow-50">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">2025-06-08 14:28:33</span>
                  <Badge variant="outline" className="text-yellow-600">WARNING</Badge>
                  <span>Utilisation mémoire élevée détectée (85%)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm p-2 rounded bg-green-50">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">2025-06-08 14:25:18</span>
                  <Badge variant="outline" className="text-green-600">INFO</Badge>
                  <span>Mise à jour système appliquée avec succès</span>
                </div>
                <div className="flex items-center space-x-2 text-sm p-2 rounded bg-red-50">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">2025-06-08 13:45:12</span>
                  <Badge variant="outline" className="text-red-600">ERROR</Badge>
                  <span>Service Email en panne - Tentative de redémarrage</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métriques de Performance</CardTitle>
              <CardDescription>
                Analyse des performances sur les dernières 24h
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">99.8%</div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-xs text-gray-500 mt-1">Excellent</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <Activity className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">142ms</div>
                  <p className="text-sm text-gray-600">Temps de réponse moyen</p>
                  <p className="text-xs text-gray-500 mt-1">Très bon</p>
                </div>
                <div className="text-center p-6 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">1,247</div>
                  <p className="text-sm text-gray-600">Requêtes/heure</p>
                  <p className="text-xs text-gray-500 mt-1">+15% vs hier</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemControlPage;
