/**
 * Tableau de bord client avec focus sur les projets personnels
 * 
 * Features:
 * - Vue personnalisée des projets du client
 * - Suivi des devis et factures
 * - Interface intuitive et moderne
 * - Notifications et alertes importantes
 * - Design moderne avec hero header
 * 
 * @author Housy Development Team
 */

import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/use-notification';
import HeroHeader from './HeroHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Home, 
  FileText, 
  Calendar, 
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Download,
  Eye,
  Plus,
  Building,
  DollarSign,
  Wrench,
  AlertTriangle,
  Sparkles,
  Zap
} from 'lucide-react';

export function ClientDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { showNotification } = useNotification();

  // Fonction pour gérer la création d'une nouvelle demande
  const handleNewProjectRequest = () => {
    setLocation('/client/request');
    showNotification({
      title: "Nouvelle demande",
      description: "Remplissez le formulaire pour créer votre demande de projet"
    });
  };
  
  const projectStats = [
    {
      title: "Projets Actifs",
      value: "3",
      icon: Building,
      color: "blue"
    },
    {
      title: "Devis en Attente",
      value: "2",
      icon: FileText,
      color: "orange"
    },
    {
      title: "Budget Total",
      value: "125,000 TND",
      icon: DollarSign,
      color: "green"
    },
    {
      title: "Prochaine Échéance",
      value: "5 jours",
      icon: Clock,
      color: "purple"
    }
  ];

  const myProjects = [
    {
      id: 1,
      name: "Ma Villa à Sousse",
      type: "Construction Neuve",
      status: "En cours",
      progress: 65,
      nextMilestone: "Pose de la toiture",
      deadline: "15 Juillet 2025",
      budget: "85,000 TND",
      architect: "Archi. Mohamed Sassi"
    },
    {
      id: 2,
      name: "Rénovation Appartement",
      type: "Rénovation",
      status: "Planification",
      progress: 20,
      nextMilestone: "Validation des plans",
      deadline: "30 Août 2025",
      budget: "40,000 TND",
      architect: "Archi. Leila Troudi"
    }
  ];

  const recentQuotes = [
    {
      id: 1,
      project: "Extension Cuisine",
      amount: "15,000 TND",
      status: "En révision",
      date: "2 Juin 2025",
      validity: "15 jours"
    },
    {
      id: 2,
      project: "Aménagement Jardin",
      amount: "8,500 TND",
      status: "Approuvé",
      date: "28 Mai 2025",
      validity: "30 jours"
    }
  ];

  const notifications = [
    {
      id: 1,
      type: "info",
      title: "Nouvelle étape terminée",
      message: "La fondation de votre villa est terminée",
      time: "Il y a 2 heures",
      project: "Ma Villa à Sousse"
    },
    {
      id: 2,
      type: "warning",
      title: "Validation requise",
      message: "Veuillez valider le choix des matériaux",
      time: "Il y a 1 jour",
      project: "Rénovation Appartement"
    },
    {
      id: 3,
      type: "success",
      title: "Paiement confirmé",
      message: "Votre paiement de 25,000 TND a été traité",
      time: "Il y a 3 jours",
      project: "Ma Villa à Sousse"
    }
  ];  return (
    <div className="space-y-6">
      {/* Hero Header avec image de fond */}
      <HeroHeader
        title={`Bienvenue, ${user?.fullName || 'Client'}`}
        subtitle="Suivez l'avancement de vos projets de construction en temps réel"
        imagePath="/static/images/d2.png"
        actionButton={{
          label: "Nouvelle Demande",
          onClick: handleNewProjectRequest
        }}
      />

      <div className="p-6 space-y-6">
        {/* Statistiques personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projectStats.map((stat, index) => {
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
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600`} />
                </CardContent>
              </Card>
            );
          })}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes projets */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              Mes Projets en Cours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {myProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.type}</p>
                  </div>
                  <Badge 
                    variant={project.status === 'En cours' ? 'default' : 'secondary'}
                  >
                    {project.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Échéance: {project.deadline}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Budget: {project.budget}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Architecte: {project.architect}
                    </div>
                    <div className="text-sm text-gray-600">
                      Prochaine étape: {project.nextMilestone}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Avancement</span>
                    <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir Détails
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Documents
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Devis récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Devis Récents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentQuotes.map((quote) => (
              <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900">{quote.project}</h4>
                  <p className="text-sm text-gray-600">Date: {quote.date}</p>
                  <p className="text-sm text-gray-600">Validité: {quote.validity}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{quote.amount}</div>
                  <Badge 
                    variant={quote.status === 'Approuvé' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {quote.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {notification.type === 'warning' && <AlertCircle className="h-5 w-5 text-orange-600" />}
                  {notification.type === 'info' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{notification.project}</span>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>        </Card>
      </div>
      </div>
    </div>
  );
}
