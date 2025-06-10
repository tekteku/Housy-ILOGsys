import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Download, 
  Eye, 
  FileText,
  Filter,
  MessageSquare,
  Search,
  XCircle
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
import { FadeIn } from '../../components/animations';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Quotation {
  id: string;
  projectTitle: string;
  quotationNumber: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'revised';
  createdDate: string;
  validUntil: string;
  acceptedDate?: string;
  totalAmount: number;
  items: QuotationItem[];
  notes: string;
  terms: string;
  paymentTerms: string;
  estimatedDuration: string;
  category: string;
  clientNotes?: string;
  revision?: number;
}

const mockQuotations: Quotation[] = [
  {
    id: '1',
    projectTitle: 'Villa Moderne Sidi Bou Said',
    quotationNumber: 'QUO-2024-001',
    status: 'sent',
    createdDate: '2024-06-15',
    validUntil: '2024-07-15',
    totalAmount: 185000,
    category: 'Résidentiel',
    estimatedDuration: '8 mois',
    paymentTerms: '30% à la signature, 40% à mi-parcours, 30% à la livraison',
    notes: 'Devis pour construction de villa moderne avec piscine',
    terms: 'Prix valable 30 jours. Matériaux de première qualité inclus.',
    items: [
      {
        id: '1',
        description: 'Gros œuvre et fondations',
        quantity: 1,
        unit: 'forfait',
        unitPrice: 65000,
        total: 65000
      },
      {
        id: '2',
        description: 'Maçonnerie et structure',
        quantity: 250,
        unit: 'm²',
        unitPrice: 180,
        total: 45000
      },
      {
        id: '3',
        description: 'Plomberie et électricité',
        quantity: 1,
        unit: 'forfait',
        unitPrice: 25000,
        total: 25000
      },
      {
        id: '4',
        description: 'Revêtements et finitions',
        quantity: 1,
        unit: 'forfait',
        unitPrice: 35000,
        total: 35000
      },
      {
        id: '5',
        description: 'Piscine et aménagements extérieurs',
        quantity: 1,
        unit: 'forfait',
        unitPrice: 15000,
        total: 15000
      }
    ]
  },
  {
    id: '2',
    projectTitle: 'Rénovation Appartement Tunis',
    quotationNumber: 'QUO-2024-002',
    status: 'accepted',
    createdDate: '2024-06-20',
    validUntil: '2024-07-20',
    acceptedDate: '2024-06-25',
    totalAmount: 48000,
    category: 'Rénovation',
    estimatedDuration: '4 mois',
    paymentTerms: '40% à la signature, 60% à la livraison',
    notes: 'Rénovation complète appartement 120m²',
    terms: 'Garantie 2 ans sur tous les travaux.',
    items: [
      {
        id: '1',
        description: 'Démolition et préparation',
        quantity: 1,
        unit: 'forfait',
        unitPrice: 8000,
        total: 8000
      },
      {
        id: '2',
        description: 'Cloisons et isolation',
        quantity: 120,
        unit: 'm²',
        unitPrice: 120,
        total: 14400
      },
      {
        id: '3',
        description: 'Plomberie moderne',
        quantity: 1,
        unit: 'forfait',
        unitPrice: 12000,
        total: 12000
      },
      {
        id: '4',
        description: 'Carrelage et peinture',
        quantity: 1,
        unit: 'forfait',
        unitPrice: 13600,
        total: 13600
      }
    ]
  },
  {
    id: '3',
    projectTitle: 'Extension Maison Hammamet',
    quotationNumber: 'QUO-2024-003',
    status: 'revised',
    createdDate: '2024-06-10',
    validUntil: '2024-07-10',
    totalAmount: 72000,
    category: 'Extension',
    estimatedDuration: '6 mois',
    paymentTerms: '35% à la signature, 35% à mi-parcours, 30% à la livraison',
    notes: 'Extension 80m² avec terrasse couverte - Version révisée',
    terms: 'Révision suite aux demandes client. Matériaux haut de gamme.',
    revision: 2,
    clientNotes: 'Merci de revoir les finitions et d\'ajouter l\'option isolation renforcée',
    items: [
      {
        id: '1',
        description: 'Extension structure 80m²',
        quantity: 80,
        unit: 'm²',
        unitPrice: 450,
        total: 36000
      },
      {
        id: '2',
        description: 'Terrasse couverte 40m²',
        quantity: 40,
        unit: 'm²',
        unitPrice: 280,
        total: 11200
      },
      {
        id: '3',
        description: 'Raccordements et finitions',
        quantity: 1,
        unit: 'forfait',
        unitPrice: 18000,
        total: 18000
      },
      {
        id: '4',
        description: 'Isolation renforcée (ajout)',
        quantity: 80,
        unit: 'm²',
        unitPrice: 85,
        total: 6800
      }
    ]
  }
];

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
  revised: 'bg-purple-100 text-purple-800'
};

const statusLabels = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  rejected: 'Rejeté',
  expired: 'Expiré',
  revised: 'Révisé'
};

export default function ClientQuotationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const { data: quotations = mockQuotations, isLoading } = useQuery({
    queryKey: ['client-quotations'],
    queryFn: async () => {
      // Replace with actual API call
      return mockQuotations;
    }
  });

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: quotations.length,
    sent: quotations.filter(q => q.status === 'sent').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
    pending: quotations.filter(q => ['sent', 'revised'].includes(q.status)).length,
    totalValue: quotations.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.totalAmount, 0)
  };

  const isExpiringSoon = (validUntil: string) => {
    const expiryDate = new Date(validUntil);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const handleAcceptQuotation = (quotationId: string) => {
    // Implementation for accepting quotation
    console.log('Accepting quotation:', quotationId);
  };

  const handleRejectQuotation = (quotationId: string) => {
    // Implementation for rejecting quotation
    console.log('Rejecting quotation:', quotationId);
  };

  const handleRequestRevision = (quotationId: string) => {
    // Implementation for requesting revision
    console.log('Requesting revision for quotation:', quotationId);
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
          <h1 className="text-3xl font-bold text-gray-900">Mes Devis</h1>
          <p className="text-gray-600 mt-1">Consultez et gérez vos devis de construction</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Devis</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acceptés</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur Totale</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalValue.toLocaleString()} TND</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
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
                  placeholder="Rechercher un devis..."
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
                <SelectItem value="sent">Envoyé</SelectItem>
                <SelectItem value="accepted">Accepté</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="revised">Révisé</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <div className="space-y-4">
        {filteredQuotations.map((quotation) => (
          <Card key={quotation.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {quotation.projectTitle}
                    </h3>
                    <Badge className={statusColors[quotation.status]}>
                      {statusLabels[quotation.status]}
                    </Badge>
                    {isExpiringSoon(quotation.validUntil) && quotation.status === 'sent' && (
                      <Badge variant="destructive" className="animate-pulse">
                        Expire bientôt
                      </Badge>
                    )}
                    {quotation.revision && (
                      <Badge variant="outline" className="text-purple-600 border-purple-300">
                        Rev. {quotation.revision}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">N° {quotation.quotationNumber}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Montant</span>
                      <p className="font-semibold text-gray-900">{quotation.totalAmount.toLocaleString()} TND</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Durée estimée</span>
                      <p className="font-semibold text-gray-900">{quotation.estimatedDuration}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Créé le</span>
                      <p className="font-semibold text-gray-900">
                        {new Date(quotation.createdDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Valide jusqu'au</span>
                      <p className={`font-semibold ${isExpiringSoon(quotation.validUntil) ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(quotation.validUntil).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {quotation.clientNotes && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Vos commentaires:</p>
                          <p className="text-sm text-yellow-700 mt-1">{quotation.clientNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedQuotation(quotation)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir Détails
                      </Button>
                    </DialogTrigger>                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Devis {quotation.quotationNumber}</DialogTitle>
                      </DialogHeader>
                      {selectedQuotation && (
                        <QuotationDetails 
                          quotation={selectedQuotation} 
                          onAccept={handleAcceptQuotation}
                          onReject={handleRejectQuotation}
                          onRequestRevision={handleRequestRevision}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  {quotation.status === 'sent' && (
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-xs px-2"
                        onClick={() => handleAcceptQuotation(quotation.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accepter
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 text-xs px-2"
                        onClick={() => handleRejectQuotation(quotation.id)}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Refuser
                      </Button>
                    </div>
                  )}

                  {(quotation.status === 'sent' || quotation.status === 'revised') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-purple-600 hover:text-purple-700 text-xs"
                      onClick={() => handleRequestRevision(quotation.id)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Demander Révision
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun devis trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? "Aucun devis ne correspond à vos critères de recherche." 
                : "Vous n'avez pas encore reçu de devis. Les devis apparaîtront ici une fois créés par notre équipe."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function QuotationDetails({ 
  quotation, 
  onAccept, 
  onReject, 
  onRequestRevision 
}: { 
  quotation: Quotation;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRequestRevision: (id: string) => void;
}) {
  const subtotal = quotation.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.19; // 19% TVA
  const total = subtotal + tax;

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details">Détails</TabsTrigger>
        <TabsTrigger value="items">Articles</TabsTrigger>
        <TabsTrigger value="terms">Conditions</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Projet</label>
                <p className="text-gray-900 mt-1">{quotation.projectTitle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Numéro de devis</label>
                <p className="text-gray-900 mt-1">{quotation.quotationNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Catégorie</label>
                <p className="text-gray-900 mt-1">{quotation.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Statut</label>
                <div className="mt-1">
                  <Badge className={statusColors[quotation.status]}>
                    {statusLabels[quotation.status]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dates et Montants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Date de création</label>
                <p className="text-gray-900 mt-1">
                  {new Date(quotation.createdDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Valide jusqu'au</label>
                <p className="text-gray-900 mt-1">
                  {new Date(quotation.validUntil).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {quotation.acceptedDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Date d'acceptation</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(quotation.acceptedDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Montant total</label>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {quotation.totalAmount.toLocaleString()} TND
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Durée estimée</label>
                <p className="text-gray-900 mt-1">{quotation.estimatedDuration}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {quotation.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{quotation.notes}</p>
            </CardContent>
          </Card>
        )}

        {quotation.status === 'sent' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center gap-4">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onAccept(quotation.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accepter ce Devis
                </Button>
                <Button 
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onReject(quotation.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser ce Devis
                </Button>
                <Button 
                  variant="outline"
                  className="text-purple-600 hover:text-purple-700"
                  onClick={() => onRequestRevision(quotation.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Demander une Révision
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="items" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Détail des Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium text-gray-700">Description</th>
                    <th className="text-center py-3 font-medium text-gray-700">Quantité</th>
                    <th className="text-center py-3 font-medium text-gray-700">Unité</th>
                    <th className="text-right py-3 font-medium text-gray-700">Prix Unitaire</th>
                    <th className="text-right py-3 font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3 text-gray-900">{item.description}</td>
                      <td className="py-3 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-3 text-center text-gray-700">{item.unit}</td>
                      <td className="py-3 text-right text-gray-700">
                        {item.unitPrice.toLocaleString()} TND
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900">
                        {item.total.toLocaleString()} TND
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Sous-total</span>
                <span>{subtotal.toLocaleString()} TND</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>TVA (19%)</span>
                <span>{tax.toLocaleString()} TND</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total TTC</span>
                <span>{total.toLocaleString()} TND</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="terms" className="space-y-4">
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Conditions de Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{quotation.paymentTerms}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termes et Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{quotation.terms}</p>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Télécharger le Devis PDF
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
