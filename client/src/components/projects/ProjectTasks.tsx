import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  User,
  Target,
  Flag,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
  completedDate?: string;
  progress: number;
  category: string;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
  attachments: number;
  comments: number;
}

interface ProjectTasksProps {
  projectId: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Finaliser les plans d\'architecture',
    description: 'Compléter les dessins techniques et obtenir l\'approbation du client',
    status: 'completed',
    priority: 'high',
    assignee: 'Ahmed Ben Ali',
    dueDate: '2024-01-25',
    completedDate: '2024-01-23',
    progress: 100,
    category: 'Design',
    estimatedHours: 40,
    actualHours: 38,
    dependencies: [],
    attachments: 3,
    comments: 5
  },
  {
    id: '2',
    title: 'Préparation du site de construction',
    description: 'Nettoyage du terrain et préparation des fondations',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Mohamed Triki',
    dueDate: '2024-02-15',
    progress: 75,
    category: 'Construction',
    estimatedHours: 80,
    actualHours: 60,
    dependencies: ['1'],
    attachments: 2,
    comments: 8
  },
  {
    id: '3',
    title: 'Installation électrique phase 1',
    description: 'Installation des câblages principaux et tableaux électriques',
    status: 'todo',
    priority: 'medium',
    assignee: 'Salim Khediri',
    dueDate: '2024-03-01',
    progress: 0,
    category: 'Électricité',
    estimatedHours: 60,
    actualHours: 0,
    dependencies: ['2'],
    attachments: 1,
    comments: 2
  },
  {
    id: '4',
    title: 'Inspection qualité fondations',
    description: 'Contrôle qualité des fondations coulées',
    status: 'review',
    priority: 'urgent',
    assignee: 'Fatma Sassi',
    dueDate: '2024-02-20',
    progress: 90,
    category: 'Qualité',
    estimatedHours: 16,
    actualHours: 14,
    dependencies: ['2'],
    attachments: 4,
    comments: 3
  },
  {
    id: '5',
    title: 'Commande matériaux construction',
    description: 'Passer commande des matériaux pour la phase 2',
    status: 'blocked',
    priority: 'high',
    assignee: 'Karim Mansouri',
    dueDate: '2024-02-28',
    progress: 25,
    category: 'Logistique',
    estimatedHours: 24,
    actualHours: 6,
    dependencies: ['4'],
    attachments: 2,
    comments: 7
  }
];

export default function ProjectTasks({ projectId }: ProjectTasksProps) {
  const [tasks] = useState<Task[]>(mockTasks);
  const [selectedView, setSelectedView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'review':
        return <Target className="h-4 w-4 text-yellow-500" />;
      case 'blocked':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
    blocked: filteredTasks.filter(t => t.status === 'blocked')
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => 
    t.status !== 'completed' && new Date(t.dueDate) < new Date()
  ).length;

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            <CardTitle className="text-sm font-medium line-clamp-2">
              {task.title}
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs line-clamp-2">
          {task.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <Badge className={getStatusColor(task.status)}>
              {task.status}
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{task.assignee}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{task.actualHours}h / {task.estimatedHours}h</span>
            <div className="flex items-center gap-2">
              <span>📎 {task.attachments}</span>
              <span>💬 {task.comments}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalTasks}</p>
              <p className="text-sm text-muted-foreground">Total tâches</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              <p className="text-sm text-muted-foreground">Terminées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{inProgressTasks}</p>
              <p className="text-sm text-muted-foreground">En cours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
              <p className="text-sm text-muted-foreground">En retard</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Gestion des Tâches
              </CardTitle>
              <CardDescription>
                Suivi et organisation des tâches du projet
              </CardDescription>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle tâche
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle tâche</DialogTitle>
                  <DialogDescription>
                    Ajoutez une nouvelle tâche au projet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Titre de la tâche" />
                  <Textarea placeholder="Description détaillée" />
                  <div className="grid grid-cols-2 gap-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Assigné à" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ahmed">Ahmed Ben Ali</SelectItem>
                        <SelectItem value="mohamed">Mohamed Triki</SelectItem>
                        <SelectItem value="salim">Salim Khediri</SelectItem>
                        <SelectItem value="fatma">Fatma Sassi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="date" placeholder="Date d'échéance" />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={() => setIsCreateModalOpen(false)}>
                      Créer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des tâches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="review">En révision</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="blocked">Bloqué</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes priorités</SelectItem>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Views */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Vue Liste</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {filteredTasks.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune tâche trouvée</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="kanban" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <Card key={status} className="min-h-96">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {getStatusIcon(status as Task['status'])}
                    {status === 'todo' ? 'À faire' :
                     status === 'in-progress' ? 'En cours' :
                     status === 'review' ? 'En révision' :
                     status === 'completed' ? 'Terminé' : 'Bloqué'}
                    <Badge variant="secondary" className="ml-auto">
                      {statusTasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {statusTasks.map(task => (
                    <Card key={task.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <p className="text-sm font-medium line-clamp-2">{task.title}</p>
                        <div className="flex items-center justify-between">
                          <Badge className={getPriorityColor(task.priority)} variant="secondary">
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {task.progress}%
                          </span>
                        </div>
                        <Progress value={task.progress} className="h-1" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{task.assignee}</span>
                          <span>{new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Vue calendrier en développement</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
