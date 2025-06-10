import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  Calendar, 
  Clock, 
  DollarSign, 
  Eye, 
  Filter,
  Plus,
  Search,
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
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'on_hold';
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
  on_hold: 'bg-red-100 text-red-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800'
};

export default function ClientProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects = mockProjects, isLoading } = useQuery({
    queryKey: ['client-projects'],
    queryFn: async () => {
      // Replace with actual API call
      return mockProjects;
    }
  });

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
                       project.status === 'completed' ? 'Terminé' : 'En pause'}
                    </Badge>
                    <Badge className={priorityColors[project.priority]}>
                      {project.priority === 'high' ? 'Priorité haute' :
                       project.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                    </Badge>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <FadeIn>
                      <DialogHeader>
                        <DialogTitle>{project.title}</DialogTitle>
                      </DialogHeader>
                      {selectedProject && (
                        <ProjectDetails project={selectedProject} />
                      )}
                    </FadeIn>
                  </DialogContent>
                </Dialog>
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
