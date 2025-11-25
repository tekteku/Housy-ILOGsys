/**
 * Page de gestion des catégories de projets (Admin uniquement)
 * 
 * Features:
 * - Liste des catégories existantes
 * - Création/modification/suppression de catégories
 * - Statistiques par catégorie
 * - Activation/désactivation de catégories
 * 
 * @author Housy Development Team
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FadeIn } from '@/components/animations';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Settings,
  Building2,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useNotification } from '@/hooks/use-notification';

interface ProjectCategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryStats {
  categoryId: number;
  totalProjects: number;
  totalRequests: number;
  totalValue: number;
  averageValue: number;
  projectsByStatus: {
    planning: number;
    in_progress: number;
    completed: number;
    on_hold: number;
  };
}

export default function CategoriesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  // États pour le formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    color: '#3B82F6',
    icon: 'building'
  });

  // Récupérer les catégories
  const { data: categories = [], isLoading } = useQuery<ProjectCategory[]>({
    queryKey: ['project-categories'],
    queryFn: async () => {
      const response = await fetch('/api/project-categories');
      if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
      const result = await response.json();
      return result.data;
    }
  });

  // Récupérer les statistiques
  const { data: categoriesOverview = [] } = useQuery<any[]>({
    queryKey: ['categories-overview'],
    queryFn: async () => {
      const response = await fetch('/api/project-categories/stats/overview');
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
      const result = await response.json();
      return result.data;
    }
  });

  // Mutation pour créer une catégorie
  const createCategoryMutation = useMutation({
    mutationFn: async (newCategory: Omit<ProjectCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/project-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      if (!response.ok) throw new Error('Erreur lors de la création');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-overview'] });
      success('Catégorie créée avec succès');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: () => {
      error('Erreur lors de la création de la catégorie');
    }
  });

  // Mutation pour modifier une catégorie
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ProjectCategory> & { id: number }) => {
      const response = await fetch(`/api/project-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur lors de la modification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-overview'] });
      success('Catégorie modifiée avec succès');
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      resetForm();
    },
    onError: () => {
      error('Erreur lors de la modification de la catégorie');
    }
  });

  // Mutation pour supprimer une catégorie
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/project-categories/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-overview'] });
      success('Catégorie supprimée avec succès');
    },
    onError: () => {
      error('Erreur lors de la suppression de la catégorie');
    }
  });

  // Mutation pour toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/project-categories/${id}/toggle-status`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Erreur lors du changement de statut');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-categories'] });
      success('Statut modifié avec succès');
    },
    onError: () => {
      error('Erreur lors du changement de statut');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
      color: '#3B82F6',
      icon: 'building'
    });
  };

  const handleEdit = (category: ProjectCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      color: category.color,
      icon: category.icon
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory) {
      updateCategoryMutation.mutate({ ...formData, id: selectedCategory.id });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const getCategoryStats = (categoryId: number) => {
    return categoriesOverview.find(overview => overview.category.id === categoryId);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catégories de Projets</h1>
          <p className="text-gray-600 mt-1">
            Gérez les catégories de projets de construction
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Catégorie
            </Button>
          </DialogTrigger>          <DialogContent className="max-w-md">
            <FadeIn>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la catégorie</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Villa moderne"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la catégorie..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Catégorie active</Label>
              </div>
              <div>
                <Label htmlFor="color">Couleur</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createCategoryMutation.isPending}>
                  Créer
                </Button>
              </div>
            </form>
            </FadeIn>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recherche */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher une catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Statistiques globales */}
      {categoriesOverview.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Projets</p>
                  <p className="text-2xl font-bold">
                    {categoriesOverview.reduce((sum, cat) => sum + cat.projectCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Demandes Clients</p>
                  <p className="text-2xl font-bold">
                    {categoriesOverview.reduce((sum, cat) => sum + cat.requestCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valeur Totale</p>
                  <p className="text-2xl font-bold">
                    {(categoriesOverview.reduce((sum, cat) => sum + cat.totalValue, 0) / 1000).toFixed(0)}K TND
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Catégories Actives</p>
                  <p className="text-2xl font-bold">
                    {categories.filter(cat => cat.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const stats = getCategoryStats(category.id);
          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{category.description}</p>
                
                {stats && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Projets</p>
                      <p className="font-semibold">{stats.projectCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Demandes</p>
                      <p className="font-semibold">{stats.requestCount}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Valeur moyenne</p>
                      <p className="font-semibold">{(stats.averageValue / 1000).toFixed(0)}K TND</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatusMutation.mutate(category.id)}
                    disabled={toggleStatusMutation.isPending}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    {category.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
                        deleteCategoryMutation.mutate(category.id);
                      }
                    }}
                    disabled={deleteCategoryMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal d'édition */}      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <FadeIn>
            <DialogHeader>
              <DialogTitle>Modifier la catégorie</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom de la catégorie</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Catégorie active</Label>
            </div>
            <div>
              <Label htmlFor="edit-color">Couleur</Label>
              <Input
                id="edit-color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCategory(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={updateCategoryMutation.isPending}>
                Modifier
              </Button>
            </div>
            </form>
          </FadeIn>
        </DialogContent>
      </Dialog>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune catégorie trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Aucune catégorie ne correspond à votre recherche.' : 'Commencez par créer votre première catégorie de projet.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer la première catégorie
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
