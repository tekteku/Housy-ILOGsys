import React, { useEffect, useState, Suspense } from 'react';
import { useRoute } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  ListTodo,
  FileText,
  UserCheck,
  TrendingUp,
  Settings,
  Bell,
  Share2,
  BarChart3,
  Target
} from 'lucide-react';
import { useNotification } from '@/hooks/use-notification';
import { cn } from '@/lib/utils';
import { TaskManagement } from '@/components/tasks/TaskManagement';
import { FinancialDashboard } from '@/components/financial/FinancialDashboard';
import ProgressTracking from '@/components/progress/ProgressTracking';
import TeamManagement from '@/components/team/TeamManagement';
import { FileDropzone } from '@/components/ui/FileDropzone';

// Lazy load tab components for performance
const ProjectInfo = React.lazy(() => import('@/components/project/ProjectInfo'));
const ProjectFiles = React.lazy(() => import('@/components/projects/ProjectFiles'));
const ProjectTeam = React.lazy(() => import('@/components/projects/ProjectTeam'));

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  location: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  teamMembers: number;
  tasksTotal: number;
  tasksCompleted: number;
  lastActivity: string;
  manager: string;
  client: string;
  objectives: string[];
  specifications: string[];
}

const ProjectDetailsPage: React.FC = () => {
  const [match, params] = useRoute('/projects/:id');
  const { showNotification } = useNotification();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    document.title = `Détails du projet | Housy`;
  }, []);

  useEffect(() => {
    if (params?.id) {
      loadProjectDetails(params.id);
    }
  }, [params?.id]);
  const loadProjectDetails = async (projectId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock project data
      const mockProject: Project = {
        id: projectId,
        title: 'Résidence Les Oliviers',
        description: 'Construction d\'un complexe résidentiel moderne de 120 unités avec espaces verts et équipements communautaires.',
        status: 'in-progress',
        progress: 68,
        startDate: '2024-01-15',
        endDate: '2025-06-30',
        budget: 2500000,
        spent: 1700000,
        location: 'Tunis, Tunisie',
        category: 'Résidentiel',
        priority: 'high',
        teamMembers: 12,
        tasksTotal: 45,
        tasksCompleted: 31,
        lastActivity: '2024-01-20T10:30:00',
        manager: 'Ahmed Ben Ali',
        client: 'Société Immobilière Carthage',
        objectives: [
          'Construire 120 unités résidentielles de qualité',
          'Respecter les délais de livraison',
          'Minimiser l\'impact environnemental',
          'Assurer la satisfaction client'
        ],
        specifications: [
          'Surface totale: 15 000 m²',
          'Hauteur: R+4',
          'Parkings: 150 places',
          'Espaces verts: 3 000 m²',
          'Certification énergétique: Classe A'
        ]
      };

      setProject(mockProject);
    } catch (error) {
      showNotification({
        title: 'Erreur',
        description: 'Impossible de charger les détails du projet.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: Project['status']) => {
    const configs = {
      'planning': { 
        label: 'Planification', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        icon: Clock 
      },
      'in-progress': { 
        label: 'En cours', 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        icon: Clock 
      },
      'completed': { 
        label: 'Terminé', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: CheckCircle 
      },
      'on-hold': { 
        label: 'En pause', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        icon: AlertTriangle 
      },
      'cancelled': { 
        label: 'Annulé', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        icon: AlertTriangle 
      }
    };
    return configs[status];
  };

  const getPriorityConfig = (priority: Project['priority']) => {
    const configs = {
      'low': { label: 'Faible', color: 'bg-green-100 text-green-800' },
      'medium': { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
      'high': { label: 'Élevée', color: 'bg-orange-100 text-orange-800' },
      'urgent': { label: 'Urgente', color: 'bg-red-100 text-red-800' }
    };
    return configs[priority];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  if (!match) {
    return <div>Projet non trouvé</div>;
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Projet non trouvé</h2>
        <p className="text-gray-600 mt-2">Le projet demandé n'existe pas ou a été supprimé.</p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(project.status);
  const priorityConfig = getPriorityConfig(project.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
                  <Badge className={cn('flex items-center gap-1', statusConfig.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                  <Badge className={priorityConfig.color}>
                    {priorityConfig.label}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">{project.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <i className="fas fa-edit mr-2 h-4 w-4"></i>
                Modifier
              </Button>
              <Button size="sm">
                <i className="fas fa-share mr-2 h-4 w-4"></i>
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progression</p>
                  <p className="text-2xl font-bold">{project.progress}%</p>
                </div>
                <Progress value={project.progress} className="w-16" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget utilisé</p>
                  <p className="text-xl font-bold">{formatCurrency(project.spent)}</p>
                  <p className="text-xs text-muted-foreground">
                    sur {formatCurrency(project.budget)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tâches</p>
                  <p className="text-2xl font-bold">{project.tasksCompleted}/{project.tasksTotal}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Équipe</p>
                  <p className="text-2xl font-bold">{project.teamMembers}</p>
                  <p className="text-xs text-muted-foreground">membres</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Dates du projet</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Localisation</p>
                  <p className="text-xs text-muted-foreground">{project.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Dernière activité</p>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(new Date(project.lastActivity))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Tâches
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Progrès
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Équipe
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Fichiers
            </TabsTrigger>
            <TabsTrigger value="finances" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Finances
            </TabsTrigger>          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <ProjectInfo project={project} />
            </Suspense>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <TaskManagement projectId={project.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <ProgressTracking projectId={parseInt(project.id)} />
            </Suspense>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <TeamManagement projectId={parseInt(project.id)} />
            </Suspense>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Gestion des fichiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileDropzone
                  onFilesChange={(files) => {
                    // Logique pour gérer les fichiers uploadés
                    console.log('Fichiers uploadés:', files);
                  }}
                  maxFiles={20}
                  maxSize={100}
                />
              </CardContent>
            </Card>            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <ProjectFiles projectId={project.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="finances" className="space-y-6">
            <FinancialDashboard projectId={project.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
