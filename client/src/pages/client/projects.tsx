import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart3,
  Building2, 
  Calendar, 
  CheckCircle,
  Clock, 
  DollarSign, 
  Eye, 
  Filter,
  Pause,
  PieChart,
  Play,
  Plus,
  Search,
  TrendingUp,
  Truck,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Animation imports
import { InteractiveCardStack, FadeIn, HoverCard } from '@/components/animations';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'on_hold' | 'suspended';
  priority: 'low' | 'medium' | 'high';
  budget: number;
  spent: number;
  progress: number;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  location: string;
  teamSize: number;
  materials: number;
  createdAt: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Villa Moderne Sidi Bou Said',
    description: 'Construction d\'une villa moderne de 250m² avec piscine',
    category: 'Résidentiel',
    status: 'in_progress',
    priority: 'high',
    budget: 180000,
    spent: 90000,
    progress: 65,
    startDate: '2024-03-15',
    expectedEndDate: '2024-08-15',
    location: 'Sidi Bou Said, Tunisia',
    teamSize: 8,
    materials: 45,
    createdAt: '2024-03-10'
  },
  {
    id: '2',
    title: 'Rénovation Appartement Tunis',
    description: 'Rénovation complète d\'un appartement de 120m²',
    category: 'Rénovation',
    status: 'approved',
    priority: 'medium',
    budget: 45000,
    spent: 0,
    progress: 0,
    startDate: '2024-07-01',
    expectedEndDate: '2024-09-30',
    location: 'Centre-ville, Tunis',
    teamSize: 5,
    materials: 28,
    createdAt: '2024-06-01'
  },
  {
    id: '3',
    title: 'Extension Maison Hammamet',
    description: 'Extension de 80m² avec terrasse couverte',
    category: 'Extension',
    status: 'completed',
    priority: 'medium',
    budget: 65000,
    spent: 62000,
    progress: 100,
    startDate: '2024-01-10',
    expectedEndDate: '2024-04-10',
    actualEndDate: '2024-04-08',
    location: 'Hammamet, Tunisia',
    teamSize: 6,
    materials: 32,
    createdAt: '2024-01-05'
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-red-100 text-red-800',
  suspended: 'bg-purple-100 text-purple-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800'
};

// Composant graphique de progression des projets
function ProgressChart({ projects }: { projects: Project[] }) {
  const progressData = projects.map(project => ({
    name: project.title.length > 20 ? project.title.substring(0, 20) + '...' : project.title,
    progress: project.progress,
    status: project.status,
    budget: project.budget,
    spent: project.spent
  }));

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Progression des Projets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progressData.map((project, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {project.name}
                </span>
                <span className="text-sm text-gray-600">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Budget: {project.budget.toLocaleString()} TND</span>
                <span>Dépensé: {project.spent.toLocaleString()} TND</span>
              </div>
            </div>
          ))}
          {progressData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Aucun projet à afficher</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Composant graphique en donut pour les statuts des projets
function ProjectStatusChart({ projects }: { projects: Project[] }) {
  const statusData = React.useMemo(() => {
    const stats = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusLabels = {
      pending: 'En attente',
      approved: 'Approuvé',
      in_progress: 'En cours',
      completed: 'Terminé',
      on_hold: 'En pause',
      suspended: 'Suspendu'
    };

    const colors = {
      pending: '#EAB308',
      approved: '#3B82F6',
      in_progress: '#F97316',
      completed: '#10B981',
      on_hold: '#EF4444',
      suspended: '#8B5CF6'
    };

    return Object.entries(stats).map(([status, count]) => ({
      status,
      label: statusLabels[status as keyof typeof statusLabels],
      count,
      color: colors[status as keyof typeof colors],
      percentage: Math.round((count / projects.length) * 100)
    }));
  }, [projects]);

  const total = projects.length;
  let cumulativePercentage = 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-600" />
          Répartition par Statut
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <svg width="160" height="160" className="transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              {statusData.map((item, index) => {
                const circumference = 2 * Math.PI * 70;
                const strokeDasharray = circumference;
                const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
                const rotation = (cumulativePercentage / 100) * 360;
                
                cumulativePercentage += item.percentage;
                
                return (
                  <circle
                    key={index}
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(${rotation} 80 80)`}
                    className="transition-all duration-1000"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{total}</div>
                <div className="text-sm text-gray-500">Projets</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {statusData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{item.count}</span>
                <span className="text-xs text-gray-500">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
        
        {statusData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Aucune donnée à afficher</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Composant graphique de timeline des projets
function ProjectTimelineChart({ projects }: { projects: Project[] }) {
  const timelineData = React.useMemo(() => {
    return projects
      .filter(project => project.status === 'in_progress' || project.status === 'completed')
      .map(project => {
        const startDate = new Date(project.startDate);
        const endDate = project.actualEndDate ? new Date(project.actualEndDate) : new Date(project.expectedEndDate);
        const today = new Date();
        
        const totalDuration = endDate.getTime() - startDate.getTime();
        const elapsedDuration = today.getTime() - startDate.getTime();
        const timeProgress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
        
        return {
          ...project,
          startDate,
          endDate,
          timeProgress: Math.round(timeProgress),
          isOverdue: project.status === 'in_progress' && today > endDate,
          daysRemaining: project.status === 'in_progress' ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0
        };
      })
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  }, [projects]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          Timeline des Projets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timelineData.map((project, index) => (
            <div key={project.id} className="relative">
              <div className="flex items-start gap-4">
                {/* Indicateur de timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    project.status === 'completed' 
                      ? 'bg-green-500 border-green-500' 
                      : project.isOverdue 
                        ? 'bg-red-500 border-red-500' 
                        : 'bg-blue-500 border-blue-500'
                  }`} />
                  {index < timelineData.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-200 mt-2" />
                  )}
                </div>
                
                {/* Contenu du projet */}
                <div className="flex-1 pb-8">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{project.title}</h4>
                    <Badge className={statusColors[project.status]}>
                      {project.status === 'completed' ? 'Terminé' : 
                       project.status === 'in_progress' ? 'En cours' : 'Approuvé'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Début:</span> {project.startDate.toLocaleDateString('fr-FR')}
                    </div>
                    <div>
                      <span className="font-medium">Fin prévue:</span> {project.endDate.toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  
                  {/* Barre de progression temporelle */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progression temporelle</span>
                      <span className={project.isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {project.timeProgress}%
                        {project.isOverdue && ' (Retard)'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          project.isOverdue ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, project.timeProgress)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Barre de progression des tâches */}
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progression des tâches</span>
                      <span className="text-gray-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500 transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {project.status === 'in_progress' && (
                    <div className="mt-2 text-sm">
                      {project.daysRemaining > 0 ? (
                        <span className="text-green-600">
                          {project.daysRemaining} jour(s) restant(s)
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Projet en retard de {Math.abs(project.daysRemaining)} jour(s)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {timelineData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Aucun projet actif ou terminé</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const queryClient = useQueryClient();

  const { data: projects = mockProjects, isLoading } = useQuery({
    queryKey: ['client-projects'],
    queryFn: async () => {
      // Replace with actual API call
      return mockProjects;
    }
  });

  // Mutation pour suspendre un projet
  const suspendProjectMutation = useMutation({
    mutationFn: async ({ projectId, reason }: { projectId: string; reason: string }) => {
      // Simulation d'un appel API pour suspendre le projet
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { projectId, reason };
    },
    onSuccess: (data) => {
      console.log('Projet suspendu avec succès:', data.projectId);
      queryClient.invalidateQueries({ queryKey: ['client-projects'] });
      setSuspendReason('');
    },
    onError: (error) => {
      console.error('Erreur lors de la suspension du projet:', error);
    }
  });

  // Mutation pour reprendre un projet
  const resumeProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      // Simulation d'un appel API pour reprendre le projet
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return projectId;
    },
    onSuccess: (projectId) => {
      console.log('Projet repris avec succès:', projectId);
      queryClient.invalidateQueries({ queryKey: ['client-projects'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la reprise du projet:', error);
    }
  });

  const handleSuspendProject = (projectId: string) => {
    if (!suspendReason.trim()) {
      console.error('Veuillez indiquer la raison de la suspension');
      return;
    }
    suspendProjectMutation.mutate({ projectId, reason: suspendReason });
  };

  const handleResumeProject = (projectId: string) => {
    resumeProjectMutation.mutate(projectId);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    pending: projects.filter(p => p.status === 'pending').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Projets</h1>
          <p className="text-gray-600 mt-1">Suivez l'avancement de vos projets de construction</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Projet
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques de progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart projects={filteredProjects} />
        <ProjectStatusChart projects={filteredProjects} />
      </div>

      {/* Graphique de timeline */}
      <ProjectTimelineChart projects={filteredProjects} />

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="on_hold">En pause</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={statusColors[project.status]}>
                      {project.status === 'pending' ? 'En attente' :
                       project.status === 'approved' ? 'Approuvé' :
                       project.status === 'in_progress' ? 'En cours' :
                       project.status === 'completed' ? 'Terminé' : 
                       project.status === 'suspended' ? 'Suspendu' : 'En pause'}
                    </Badge>
                    <Badge className={priorityColors[project.priority]}>
                      {project.priority === 'high' ? 'Priorité haute' :
                       project.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedProject(project)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{project.title}</DialogTitle>
                      </DialogHeader>
                      {selectedProject && (
                        <ProjectDetails project={selectedProject} />
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Bouton Suspendre pour projets en cours */}
                  {project.status === 'in_progress' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-orange-600 hover:text-orange-700 border-orange-600 hover:border-orange-700"
                          disabled={suspendProjectMutation.isPending}
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Suspendre le projet</AlertDialogTitle>
                          <AlertDialogDescription>
                            Vous êtes sur le point de suspendre le projet "{project.title}".
                            Veuillez indiquer la raison de cette suspension.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <textarea
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            placeholder="Raison de la suspension..."
                            className="w-full p-3 border rounded-lg resize-none"
                            rows={3}
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setSuspendReason('')}>
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleSuspendProject(project.id)}
                            disabled={suspendProjectMutation.isPending || !suspendReason.trim()}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            {suspendProjectMutation.isPending ? 'Suspension...' : 'Suspendre'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Bouton Reprendre pour projets suspendus */}
                  {project.status === 'suspended' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={resumeProjectMutation.isPending}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reprendre le projet</AlertDialogTitle>
                          <AlertDialogDescription>
                            Confirmez-vous vouloir reprendre le projet "{project.title}" ?
                            Le projet sera remis en état "En cours".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleResumeProject(project.id)}
                            disabled={resumeProjectMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {resumeProjectMutation.isPending ? 'Reprise...' : 'Reprendre'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm text-gray-600">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Budget */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Budget</span>
                  <span className="text-sm text-gray-600">
                    {project.spent.toLocaleString()} / {project.budget.toLocaleString()} TND
                  </span>
                </div>
                <Progress value={(project.spent / project.budget) * 100} className="h-2" />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{project.teamSize} personnes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{project.materials} matériaux</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {new Date(project.expectedEndDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? "Aucun projet ne correspond à vos critères de recherche." 
                : "Vous n'avez pas encore de projets. Créez votre premier projet pour commencer."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProjectDetails({ project }: { project: Project }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="timeline">Chronologie</TabsTrigger>
        <TabsTrigger value="budget">Budget</TabsTrigger>
        <TabsTrigger value="team">Équipe</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 mt-1">{project.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Catégorie</label>
                <p className="text-gray-900 mt-1">{project.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Localisation</label>
                <p className="text-gray-900 mt-1">{project.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Statut</label>
                <div className="mt-1">
                  <Badge className={statusColors[project.status]}>
                    {project.status === 'pending' ? 'En attente' :
                     project.status === 'approved' ? 'Approuvé' :
                     project.status === 'in_progress' ? 'En cours' :
                     project.status === 'completed' ? 'Terminé' : 'En pause'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Date de début</label>
                <p className="text-gray-900 mt-1">
                  {new Date(project.startDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date de fin prévue</label>
                <p className="text-gray-900 mt-1">
                  {new Date(project.expectedEndDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {project.actualEndDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Date de fin réelle</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(project.actualEndDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Progression</label>
                <div className="mt-2">
                  <Progress value={project.progress} className="h-3" />
                  <p className="text-sm text-gray-600 mt-1">{project.progress}% terminé</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="timeline" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Chronologie du Projet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Projet créé</p>
                  <p className="text-sm text-gray-600">
                    {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              
              {project.status !== 'pending' && (
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Projet approuvé</p>
                    <p className="text-sm text-gray-600">Début des travaux autorisé</p>
                  </div>
                </div>
              )}

              {project.status === 'in_progress' && (
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Travaux en cours</p>
                    <p className="text-sm text-gray-600">{project.progress}% terminé</p>
                  </div>
                </div>
              )}

              {project.status === 'completed' && (
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Projet terminé</p>
                    <p className="text-sm text-gray-600">
                      {project.actualEndDate && new Date(project.actualEndDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="budget" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Résumé Financier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Budget Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {project.budget.toLocaleString()} TND
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="font-medium text-gray-700">Dépensé</span>
                <span className="text-lg font-bold text-blue-600">
                  {project.spent.toLocaleString()} TND
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-700">Restant</span>
                <span className="text-lg font-bold text-green-600">
                  {(project.budget - project.spent).toLocaleString()} TND
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Utilisation du Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression budgétaire</span>
                    <span className="text-sm text-gray-600">
                      {Math.round((project.spent / project.budget) * 100)}%
                    </span>
                  </div>
                  <Progress value={(project.spent / project.budget) * 100} className="h-3" />
                </div>
                <p className="text-sm text-gray-600">
                  Vous avez utilisé {Math.round((project.spent / project.budget) * 100)}% de votre budget total.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="team" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Équipe du Projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Taille de l'équipe</span>
                <span className="text-lg font-bold text-gray-900">{project.teamSize} personnes</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Matériaux requis</span>
                <span className="text-lg font-bold text-gray-900">{project.materials} types</span>
              </div>
              <p className="text-sm text-gray-600">
                Les détails complets de l'équipe et des matériaux seront disponibles une fois le projet approuvé.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
