/**
 * Tableau de bord client moderne avec design OPTIMA pour Housy
 * 
 * Features:
 * - Interface client élégante avec hero header
 * - Suivi des projets en temps réel
 * - Statistiques financières
 * - Activités récentes
 * - Navigation intuitive
 * 
 * @author Housy Development Team
 */

import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import HeroHeader from './HeroHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { MessageSquare, Clock, FileText, Wrench, AlertTriangle, Building, DollarSign } from 'lucide-react';

// Types pour les projets
interface Project {
  id: string;
  name: string;
  progress: number;
  type?: string;
  budget?: number;
}

// Types pour les activités
interface Activity {
  id: string;
  type: 'message' | 'update' | 'alert' | 'document';
  content: string;
  date: string;
  timeAgo: string;
}

const EnhancedClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Données des projets tunisiens
  const projects: Project[] = [
    { id: '1', name: 'Villa Moderne Sidi Bou Said', progress: 70, type: 'villa_moderne', budget: 450000 },
    { id: '2', name: 'Appartement Tunis Centre', progress: 25, type: 'appartement', budget: 180000 },
    { id: '3', name: 'Maison Traditionnelle Sousse', progress: 50, type: 'maison_traditionnelle', budget: 320000 },
  ];
  
  const activities: Activity[] = [
    {
      id: '1',
      type: 'document',
      content: 'Nouveau document: Plan architectural Villa Sidi Bou Said',
      date: '2025-06-05',
      timeAgo: '2 heures'
    },
    {
      id: '2',
      type: 'message',
      content: 'Message de l\'équipe: Avancement des travaux',
      date: '2025-06-05',
      timeAgo: 'Aujourd\'hui'
    },
    {
      id: '3',
      type: 'update',
      content: 'Mise à jour projet: Étape fondations terminée',
      date: '2025-06-03',
      timeAgo: '4 jours'
    },
    {
      id: '4',
      type: 'alert',
      content: 'Attention: Retard possible sur livraison matériaux',
      date: '2025-05-22',
      timeAgo: '16 jours'
    },
    {
      id: '5',
      type: 'document',
      content: 'Facture: Livraison ciment et matériaux',
      date: '2025-05-24',
      timeAgo: '14 jours'
    }
  ];
  
  // Gestionnaire pour le bouton "Contacter le support"
  const handleContactSupport = () => {
    setLocation('/chatbot');
  };
    // Icône selon le type d'activité
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="text-orange-500" size={18} />;
      case 'update':
        return <Wrench className="text-blue-500" size={18} />;
      case 'alert':
        return <AlertTriangle className="text-red-500" size={18} />;
      case 'document':
        return <FileText className="text-slate-600" size={18} />;
      default:
        return <Clock className="text-slate-400" size={18} />;
    }
  };
  
  // Calcul des statistiques
  const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const averageProgress = projects.reduce((sum, project) => sum + project.progress, 0) / projects.length;
  const estimatedSavings = totalBudget * 0.15; // Estimation de 15% d'économies
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">      {/* Hero Header avec image OPTIMA */}
      <HeroHeader
        title="Bienvenue dans votre espace client"
        subtitle={`Bonjour ${user?.fullName || user?.username || 'Client'}, voici l'état de vos projets`}
        imagePath="/static/images/modern_house_2.png" // Image OPTIMA temporaire
        actionButton={{
          label: "Contacter le support",
          onClick: handleContactSupport
        }}
      />
      
      {/* Section Statistiques globales */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Vue d'ensemble</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-sm text-slate-500">Projets actifs</div>
                </div>
              </div>
            </CardContent>
          </Card>
            <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold">{Math.round(averageProgress)}%</div>
                  <div className="text-sm text-slate-500">Progression moyenne</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold">{(totalBudget / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-slate-500">Budget total (TND)</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold">{activities.length}</div>
                  <div className="text-sm text-slate-500">Activités récentes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Section Projets en cours */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Vos projets en cours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                {project.budget && (
                  <p className="text-sm text-slate-500">
                    Budget: {(project.budget / 1000).toFixed(0)}k TND
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{project.progress}%</div>
                <Progress value={project.progress} className="h-2 mb-4" />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation(`/projects/${project.id}`)}
                >
                  Voir détails
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Section Statistiques financières */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Statistiques financières</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">
                {(totalBudget / 1000).toFixed(0)}k TND
              </div>
              <div className="text-sm text-slate-500">
                Budget total de vos projets
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Moyenne par projet: {((totalBudget / projects.length) / 1000).toFixed(0)}k TND
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">
                {(estimatedSavings / 1000).toFixed(0)}k TND
              </div>
              <div className="text-sm text-slate-500">
                Économies estimées
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Grâce à notre expertise en construction tunisienne
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Section Activités récentes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Activités récentes</h2>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100">
              {activities.map((activity) => (
                <li key={activity.id} className="p-4 flex items-start hover:bg-slate-50 transition-colors">
                  <div className="mr-3 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{activity.content}</p>
                  </div>
                  <div className="text-xs text-slate-500 whitespace-nowrap">
                    {activity.timeAgo}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Bouton pour voir toutes les activités */}
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/activities')}
          >
            Voir toutes les activités
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedClientDashboard;
