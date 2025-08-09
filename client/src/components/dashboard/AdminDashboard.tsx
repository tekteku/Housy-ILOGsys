/**
 * Tableau de bord administrateur avec statistiques avancées
 * 
 * Features:
 * - Vue d'ensemble des projets et utilisateurs
 * - Graphiques et métriques en temps réel
 * - Gestion rapide des ressources
 * - Interface moderne avec animations
 * 
 * @author Housy Development Team
 */

import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  Activity,
  Plus,
  Settings,
  UserPlus,
  FileBarChart,
  Zap,
  Shield
} from 'lucide-react';

export function AdminDashboard() {
  const [, setLocation] = useLocation();
  
  const stats = [
    {
      title: "Projets Actifs",
      value: "24",
      change: "+12%",
      changeType: "positive" as const,
      icon: Building2,
      color: "blue"
    },
    {
      title: "Utilisateurs Actifs",
      value: "156",
      change: "+8%",
      changeType: "positive" as const,
      icon: Users,
      color: "green"
    },
    {
      title: "Revenus Mensuels",
      value: "45,320 TND",
      change: "+23%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "purple"
    },
    {
      title: "Alertes Système",
      value: "3",
      change: "-60%",
      changeType: "positive" as const,
      icon: AlertTriangle,
      color: "orange"
    },
    {
      title: "Performance Système",
      value: "98.5%",
      change: "+2.1%",
      changeType: "positive" as const,
      icon: Activity,
      color: "emerald"
    },
    {
      title: "Demandes en Attente",
      value: "12",
      change: "-5%",
      changeType: "positive" as const,
      icon: FileText,
      color: "cyan"
    },
    {
      title: "Taux de Conversion",
      value: "87%",
      change: "+4%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "pink"
    },
    {
      title: "Satisfaction Client",
      value: "4.8/5",
      change: "+0.2",
      changeType: "positive" as const,
      icon: Shield,
      color: "indigo"
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: "Villa Moderne Sousse",
      client: "Ahmed Ben Ali",
      status: "En cours",
      progress: 75,
      deadline: "15 Juin 2025"
    },
    {
      id: 2,
      name: "Complexe Résidentiel Tunis",
      client: "Société Immobilière",
      status: "Planification",
      progress: 25,
      deadline: "30 Juillet 2025"
    },
    {
      id: 3,
      name: "Rénovation Bureau Sfax",
      client: "Entreprise Tech",
      status: "Finalisation",
      progress: 90,
      deadline: "10 Juin 2025"
    }
  ];

  const quickActions = [
    {
      title: "Analytics Avancés",
      description: "Dashboard analytique temps réel avec prédictions",
      icon: Plus,
      color: "blue",
      action: "/admin/analytics-enhanced"
    },
    {
      title: "Monitoring Système",
      description: "Surveillance temps réel des services et performances",
      icon: Activity,
      color: "green",
      action: "/admin/system-monitoring"
    },
    {
      title: "Gestion Permissions",
      description: "Configuration des rôles et permissions utilisateurs",
      icon: Shield,
      color: "purple",
      action: "/admin/permission-management"
    },
    {
      title: "Centre Notifications",
      description: "Gestion centralisée des notifications multi-canal",
      icon: Settings,
      color: "orange",
      action: "/admin/notification-center"
    },
    {
      title: "Nouveau Projet",
      description: "Créer un nouveau projet de construction",
      icon: UserPlus,
      color: "indigo",
      action: "/projects/new"
    },
    {
      title: "Ajouter Utilisateur",
      description: "Inviter un nouveau membre de l'équipe",
      icon: FileBarChart,
      color: "cyan",
      action: "/admin/users"
    },
    {
      title: "Audit Sécurité",
      description: "Contrôle des accès et logs sécurité",
      icon: Zap,
      color: "red",
      action: "/admin/security-audit"
    },
    {
      title: "Gestion Financière",
      description: "Tableau de bord financier et comptabilité",
      icon: Settings,
      color: "emerald",
      action: "/admin/financial-management"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header avec salutation */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de Bord Administrateur
          </h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble de votre plateforme Housy
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Exporter Données
          </Button>
          <Button size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Rapport en Temps Réel
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-${stat.color}-100 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-4 w-4 text-${stat.color}-600`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <Badge 
                  variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projets récents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Projets Récents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-600">Client: {project.client}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge 
                      variant={project.status === 'En cours' ? 'default' : project.status === 'Finalisation' ? 'secondary' : 'outline'}
                    >
                      {project.status}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{project.deadline}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{project.progress}%</div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start p-4 h-auto hover:bg-gray-50 group"
                  onClick={() => setLocation(action.action)}
                >
                  <div className={`p-2 rounded-lg bg-${action.color}-100 mr-3 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-4 w-4 text-${action.color}-600`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{action.title}</div>
                    <div className="text-sm text-gray-600">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </CardContent>        </Card>
      </div>

      {/* Graphique des performances (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Performances Mensuelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
            <div className="text-center">
              <Activity className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-gray-600">Graphique des performances</p>
              <p className="text-sm text-gray-500">Intégration des graphiques en cours...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
