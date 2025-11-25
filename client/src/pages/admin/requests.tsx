/**
 * Page de gestion des demandes clients (Admin uniquement)
 * 
 * Features:
 * - Vue d'ensemble de toutes les demandes clients
 * - Filtres par statut, catégorie, date
 * - Actions rapides (approuver, rejeter, créer devis)
 * - Détails complets des demandes
 * - Notifications en temps réel
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FadeIn } from '../../components/animations';
import { 
  Eye, 
  Check, 
  X, 
  FileText, 
  Clock, 
  User, 
  MapPin, 
  Calendar,
  DollarSign,
  Building2,
  Phone,
  Mail,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useNotification } from '@/hooks/use-notification';
import { formatDate, formatCurrency } from '@/lib/utils';

interface ClientRequest {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  location: string;
  area: number;
  budget: number;
  timeline: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface ProjectCategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  color: string;
}

export default function ClientRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  // États pour le formulaire de devis
  const [quoteForm, setQuoteForm] = useState({
    amount: '',
    validityDays: '30',
    notes: '',
    itemizedCosts: [
      { description: 'Matériaux', amount: 0 },
      { description: 'Main d\'œuvre', amount: 0 },
      { description: 'Équipements', amount: 0 }
    ]
  });

  // Récupérer les demandes
  const { data: requests = [], isLoading } = useQuery<ClientRequest[]>({
    queryKey: ['client-requests'],
    queryFn: async () => {
      const response = await fetch('/api/client-requests');
      if (!response.ok) throw new Error('Erreur lors du chargement des demandes');
      const result = await response.json();
      return result.data;
    }
  });

  // Récupérer les catégories
  const { data: categories = [] } = useQuery<ProjectCategory[]>({
    queryKey: ['project-categories-active'],
    queryFn: async () => {
      const response = await fetch('/api/project-categories/active');
      if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
      const result = await response.json();
      return result.data;
    }
  });

  // Mutation pour approuver une demande
  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes?: string }) => {
      const response = await fetch(`/api/client-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (!response.ok) throw new Error('Erreur lors de l\'approbation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-requests'] });
      success('Demande approuvée avec succès');
    },
    onError: () => {
      error('Erreur lors de l\'approbation de la demande');
    }
  });

  // Mutation pour rejeter une demande
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const response = await fetch(`/api/client-requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Erreur lors du rejet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-requests'] });
      success('Demande rejetée');
    },
    onError: () => {
      error('Erreur lors du rejet de la demande');
    }
  });

  // Mutation pour créer un devis
  const createQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData)
      });
      if (!response.ok) throw new Error('Erreur lors de la création du devis');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-requests'] });
      success('Devis créé avec succès');
      setIsQuoteModalOpen(false);
      resetQuoteForm();
    },
    onError: () => {
      error('Erreur lors de la création du devis');
    }
  });

  const resetQuoteForm = () => {
    setQuoteForm({
      amount: '',
      validityDays: '30',
      notes: '',
      itemizedCosts: [
        { description: 'Matériaux', amount: 0 },
        { description: 'Main d\'œuvre', amount: 0 },
        { description: 'Équipements', amount: 0 }
      ]
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'approved':
        return { label: 'Approuvée', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'rejected':
        return { label: 'Rejetée', color: 'bg-red-100 text-red-800', icon: XCircle };
      case 'processing':
        return { label: 'En traitement', color: 'bg-blue-100 text-blue-800', icon: AlertCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { label: 'Urgent', color: 'bg-red-100 text-red-800' };
      case 'high':
        return { label: 'Élevée', color: 'bg-orange-100 text-orange-800' };
      case 'medium':
        return { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' };
      case 'low':
        return { label: 'Faible', color: 'bg-green-100 text-green-800' };
      default:
        return { label: priority, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Catégorie inconnue';
  };

  const handleCreateQuote = (request: ClientRequest) => {
    setSelectedRequest(request);
    setQuoteForm({
      ...quoteForm,
      amount: request.budget.toString()
    });
    setIsQuoteModalOpen(true);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const totalAmount = quoteForm.itemizedCosts.reduce((sum, item) => sum + item.amount, 0);
    
    const quoteData = {
      requestId: selectedRequest.id,
      clientName: selectedRequest.clientName,
      clientEmail: selectedRequest.clientEmail,
      clientPhone: selectedRequest.clientPhone,
      projectTitle: selectedRequest.title,
      projectDescription: selectedRequest.description,
      location: selectedRequest.location,
      area: selectedRequest.area,
      estimatedAmount: totalAmount || parseFloat(quoteForm.amount),
      finalAmount: totalAmount || parseFloat(quoteForm.amount),
      validityDays: parseInt(quoteForm.validityDays),
      notes: quoteForm.notes,
      itemizedCosts: quoteForm.itemizedCosts.filter(item => item.amount > 0),
      status: 'draft'
    };

    createQuoteMutation.mutate(quoteData);
  };

  // Filtrer les demandes
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || request.categoryId.toString() === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // Statistiques
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded animate-pulse" />
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
          <h1 className="text-3xl font-bold text-gray-900">Demandes Clients</h1>
          <p className="text-gray-600 mt-1">
            Gérez toutes les demandes de projets des clients
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approuvées</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejetées</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvées</SelectItem>
                <SelectItem value="rejected">Rejetées</SelectItem>
                <SelectItem value="processing">En traitement</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setPriorityFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des demandes */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.map((request) => {
          const statusConfig = getStatusConfig(request.status);
          const priorityConfig = getPriorityConfig(request.priority);
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{request.title}</h3>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      <Badge className={priorityConfig.color}>
                        {priorityConfig.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{request.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{request.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{getCategoryName(request.categoryId)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>Budget: {formatCurrency(request.budget)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Surface:</span>
                        <span>{request.area} m²</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {request.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>

                    {request.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate({ id: request.id })}
                          disabled={approveMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const reason = prompt('Raison du rejet:');
                            if (reason) {
                              rejectMutation.mutate({ id: request.id, reason });
                            }
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </>
                    )}

                    {(request.status === 'approved' || request.status === 'pending') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreateQuote(request)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Créer Devis
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>      {/* Modal détails demande */}      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Informations du projet</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Titre:</strong> {selectedRequest.title}</p>
                      <p><strong>Catégorie:</strong> {getCategoryName(selectedRequest.categoryId)}</p>
                      <p><strong>Localisation:</strong> {selectedRequest.location}</p>
                      <p><strong>Surface:</strong> {selectedRequest.area} m²</p>
                      <p><strong>Budget:</strong> {formatCurrency(selectedRequest.budget)}</p>
                      <p><strong>Délai souhaité:</strong> {selectedRequest.timeline}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Informations client</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nom:</strong> {selectedRequest.clientName}</p>
                      <p><strong>Email:</strong> {selectedRequest.clientEmail}</p>
                      <p><strong>Téléphone:</strong> {selectedRequest.clientPhone}</p>
                      <p><strong>Date de demande:</strong> {formatDate(selectedRequest.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Description du projet</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedRequest.description}
                  </p>
                </div>

                {selectedRequest.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes administratives</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedRequest.notes}
                    </p>
                  </div>              )}          </div>
          )}
        </DialogContent>
      </Dialog>{/* Modal création devis */}      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un devis</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Montant total (TND)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={quoteForm.amount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="validity">Validité (jours)</Label>
                  <Select 
                    value={quoteForm.validityDays} 
                    onValueChange={(value) => setQuoteForm({ ...quoteForm, validityDays: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="45">45 jours</SelectItem>
                      <SelectItem value="60">60 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Détail des coûts</Label>
                <div className="space-y-2">
                  {quoteForm.itemizedCosts.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...quoteForm.itemizedCosts];
                          newItems[index].description = e.target.value;
                          setQuoteForm({ ...quoteForm, itemizedCosts: newItems });
                        }}
                        placeholder="Description"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => {
                          const newItems = [...quoteForm.itemizedCosts];
                          newItems[index].amount = parseFloat(e.target.value) || 0;
                          setQuoteForm({ ...quoteForm, itemizedCosts: newItems });
                        }}
                        placeholder="Montant"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  placeholder="Notes complémentaires..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsQuoteModalOpen(false);
                    resetQuoteForm();
                  }}
                >
                  Annuler
                </Button>                <Button type="submit" disabled={createQuoteMutation.isPending}>
                  Créer le devis                </Button>              </div>
            </form>
        </DialogContent>
      </Dialog>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune demande trouvée
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                ? 'Aucune demande ne correspond à vos critères de recherche.'
                : 'Aucune demande client pour le moment.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
