import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Users, 
  Database, 
  Activity, 
  Clock, 
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login' | 'access_violation' | 'data_breach' | 'privilege_escalation' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: number;
  userName?: string;
  ipAddress: string;
  timestamp: string;
  status: 'resolved' | 'investigating' | 'pending';
  details: Record<string, any>;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  activeIncidents: number;
  resolvedToday: number;
  systemUptime: number;
  lastBackup: string;
  failedLogins: number;
  activeUsers: number;
}

interface ComplianceCheck {
  id: string;
  name: string;
  category: 'data_protection' | 'access_control' | 'audit_trail' | 'backup' | 'encryption';
  status: 'compliant' | 'non_compliant' | 'warning';
  lastCheck: string;
  description: string;
  recommendation?: string;
}

const SecurityAudit: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchSecurityData();
    const interval = autoRefresh ? setInterval(fetchSecurityData, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Simuler données de sécurité (à remplacer par vraies API)
      const mockMetrics: SecurityMetrics = {
        totalEvents: 1247,
        criticalEvents: 3,
        activeIncidents: 1,
        resolvedToday: 8,
        systemUptime: 99.97,
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        failedLogins: 12,
        activeUsers: 24
      };

      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'suspicious_activity',
          severity: 'high',
          description: 'Tentatives de connexion multiples depuis une IP suspecte',
          userId: 456,
          userName: 'test.user@housy.tn',
          ipAddress: '192.168.1.100',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'investigating',
          details: { attempts: 15, userAgent: 'Python-requests/2.28.0' }
        },
        {
          id: '2',
          type: 'access_violation',
          severity: 'medium',
          description: 'Tentative d\'accès non autorisé aux fichiers administratifs',
          userId: 789,
          userName: 'client.user@housy.tn',
          ipAddress: '10.0.0.45',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          status: 'resolved',
          details: { endpoint: '/api/admin/users', method: 'GET' }
        },
        {
          id: '3',
          type: 'login',
          severity: 'low',
          description: 'Connexion depuis un nouvel appareil',
          userId: 123,
          userName: 'admin@housy.tn',
          ipAddress: '192.168.1.50',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'resolved',
          details: { device: 'Chrome/120.0.0.0', location: 'Tunis, Tunisia' }
        }
      ];

      const mockCompliance: ComplianceCheck[] = [
        {
          id: '1',
          name: 'Chiffrement des données en transit',
          category: 'encryption',
          status: 'compliant',
          lastCheck: new Date().toISOString(),
          description: 'HTTPS activé sur tous les endpoints',
        },
        {
          id: '2',
          name: 'Politique de mots de passe',
          category: 'access_control',
          status: 'compliant',
          lastCheck: new Date().toISOString(),
          description: 'Exigences de complexité respectées',
        },
        {
          id: '3',
          name: 'Sauvegarde automatique',
          category: 'backup',
          status: 'warning',
          lastCheck: new Date().toISOString(),
          description: 'Dernière sauvegarde il y a 2 heures',
          recommendation: 'Configurer des sauvegardes plus fréquentes'
        },
        {
          id: '4',
          name: 'Journalisation des accès',
          category: 'audit_trail',
          status: 'compliant',
          lastCheck: new Date().toISOString(),
          description: 'Tous les accès sont enregistrés',
        },
        {
          id: '5',
          name: 'Protection des données personnelles',
          category: 'data_protection',
          status: 'non_compliant',
          lastCheck: new Date().toISOString(),
          description: 'Données sensibles non anonymisées dans les logs',
          recommendation: 'Implémenter l\'anonymisation des logs'
        }
      ];

      setMetrics(mockMetrics);
      setSecurityEvents(mockEvents);
      setComplianceChecks(mockCompliance);
    } catch (error) {
      console.error('Erreur lors du chargement des données de sécurité:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveEvent = async (eventId: string) => {
    setSecurityEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, status: 'resolved' }
          : event
      )
    );
  };

  const exportSecurityReport = async () => {
    // Simuler l'export d'un rapport de sécurité
    const reportData = {
      generatedAt: new Date().toISOString(),
      metrics,
      events: securityEvents,
      compliance: complianceChecks
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'non_compliant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'non_compliant': return <XCircle className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Audit de Sécurité
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Surveillance et analyse de la sécurité du système Housy
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-actualisation
          </Button>
          <Button onClick={exportSecurityReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter rapport
          </Button>
        </div>
      </div>

      {/* Métriques de sécurité */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Événements critiques
                  </p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {metrics.criticalEvents}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Incidents actifs
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {metrics.activeIncidents}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Disponibilité système
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {metrics.systemUptime}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Utilisateurs actifs
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {metrics.activeUsers}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Événements de sécurité récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Événements de sécurité récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {event.description}
                      </p>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <p>IP: {event.ipAddress}</p>
                        {event.userName && <p>Utilisateur: {event.userName}</p>}
                        <p>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(event.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    {event.status !== 'resolved' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolveEvent(event.id);
                        }}
                      >
                        Résoudre
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vérifications de conformité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Conformité de sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceChecks.map((check) => (
                <div key={check.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={getComplianceColor(check.status)}>
                        {getComplianceIcon(check.status)}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {check.name}
                      </h4>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {check.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {check.description}
                  </p>
                  {check.recommendation && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Recommandation:</strong> {check.recommendation}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Dernière vérification: {new Date(check.lastCheck).toLocaleString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal détails événement */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Détails de l'événement
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Type
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedEvent.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Sévérité
                  </label>
                  <Badge className={getSeverityColor(selectedEvent.severity)}>
                    {selectedEvent.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Adresse IP
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedEvent.ipAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Horodatage
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(selectedEvent.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Description
                </label>
                <p className="text-gray-900 dark:text-gray-100">{selectedEvent.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Détails techniques
                </label>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(selectedEvent.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAudit;
