import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Filter,
  Receipt,
  Search,
  TrendingUp,
  Wallet
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface Payment {
  id: string;
  projectId: string;
  projectName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  description: string;
  category: string;
  installmentNumber?: number;
  totalInstallments?: number;
  transactionId?: string;
}

interface PaymentPlan {
  id: string;
  projectId: string;
  projectName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: Payment[];
  nextPaymentDate: string;
  completionPercentage: number;
}

const mockPayments: Payment[] = [
  {
    id: '1',
    projectId: '1',
    projectName: 'Villa Moderne Sidi Bou Said',
    invoiceNumber: 'INV-2024-001',
    amount: 55500,
    dueDate: '2024-03-30',
    paidDate: '2024-03-25',
    status: 'paid',
    paymentMethod: 'Virement bancaire',
    description: 'Acompte à la signature (30%)',
    category: 'Acompte',
    installmentNumber: 1,
    totalInstallments: 3,
    transactionId: 'TXN-001-2024'
  },
  {
    id: '2',
    projectId: '1',
    projectName: 'Villa Moderne Sidi Bou Said',
    invoiceNumber: 'INV-2024-002',
    amount: 74000,
    dueDate: '2024-07-15',
    status: 'pending',
    description: 'Paiement intermédiaire (40%)',
    category: 'Paiement intermédiaire',
    installmentNumber: 2,
    totalInstallments: 3
  },
  {
    id: '3',
    projectId: '1',
    projectName: 'Villa Moderne Sidi Bou Said',
    invoiceNumber: 'INV-2024-003',
    amount: 55500,
    dueDate: '2024-08-30',
    status: 'pending',
    description: 'Solde à la livraison (30%)',
    category: 'Solde',
    installmentNumber: 3,
    totalInstallments: 3
  },
  {
    id: '4',
    projectId: '2',
    projectName: 'Rénovation Appartement Tunis',
    invoiceNumber: 'INV-2024-004',
    amount: 19200,
    dueDate: '2024-06-30',
    paidDate: '2024-06-28',
    status: 'paid',
    paymentMethod: 'Chèque',
    description: 'Acompte à la signature (40%)',
    category: 'Acompte',
    installmentNumber: 1,
    totalInstallments: 2,
    transactionId: 'TXN-002-2024'
  },
  {
    id: '5',
    projectId: '2',
    projectName: 'Rénovation Appartement Tunis',
    invoiceNumber: 'INV-2024-005',
    amount: 28800,
    dueDate: '2024-09-30',
    status: 'pending',
    description: 'Solde à la livraison (60%)',
    category: 'Solde',
    installmentNumber: 2,
    totalInstallments: 2
  },
  {
    id: '6',
    projectId: '3',
    projectName: 'Extension Maison Hammamet',
    invoiceNumber: 'INV-2024-006',
    amount: 25200,
    dueDate: '2024-01-15',
    paidDate: '2024-01-12',
    status: 'paid',
    paymentMethod: 'Virement bancaire',
    description: 'Acompte à la signature (35%)',
    category: 'Acompte',
    installmentNumber: 1,
    totalInstallments: 3,
    transactionId: 'TXN-003-2024'
  },
  {
    id: '7',
    projectId: '3',
    projectName: 'Extension Maison Hammamet',
    invoiceNumber: 'INV-2024-007',
    amount: 25200,
    dueDate: '2024-03-15',
    paidDate: '2024-03-10',
    status: 'paid',
    paymentMethod: 'Chèque',
    description: 'Paiement intermédiaire (35%)',
    category: 'Paiement intermédiaire',
    installmentNumber: 2,
    totalInstallments: 3,
    transactionId: 'TXN-004-2024'
  },
  {
    id: '8',
    projectId: '3',
    projectName: 'Extension Maison Hammamet',
    invoiceNumber: 'INV-2024-008',
    amount: 21600,
    dueDate: '2024-04-30',
    paidDate: '2024-04-25',
    status: 'paid',
    paymentMethod: 'Virement bancaire',
    description: 'Solde à la livraison (30%)',
    category: 'Solde',
    installmentNumber: 3,
    totalInstallments: 3,
    transactionId: 'TXN-005-2024'
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  pending: 'En attente',
  paid: 'Payé',
  overdue: 'En retard',
  cancelled: 'Annulé'
};

export default function ClientPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [viewMode, setViewMode] = useState<'payments' | 'plans'>('payments');

  const { data: payments = mockPayments, isLoading } = useQuery({
    queryKey: ['client-payments'],
    queryFn: async () => {
      return mockPayments;
    }
  });

  // Group payments by project to create payment plans
  const paymentPlans: PaymentPlan[] = React.useMemo(() => {
    const projectGroups = payments.reduce((acc, payment) => {
      if (!acc[payment.projectId]) {
        acc[payment.projectId] = [];
      }
      acc[payment.projectId].push(payment);
      return acc;
    }, {} as Record<string, Payment[]>);

    return Object.entries(projectGroups).map(([projectId, projectPayments]) => {
      const totalAmount = projectPayments.reduce((sum, p) => sum + p.amount, 0);
      const paidAmount = projectPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      const remainingAmount = totalAmount - paidAmount;
      const completionPercentage = (paidAmount / totalAmount) * 100;
      
      const nextPayment = projectPayments
        .filter(p => p.status === 'pending')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

      return {
        id: projectId,
        projectId,
        projectName: projectPayments[0].projectName,
        totalAmount,
        paidAmount,
        remainingAmount,
        installments: projectPayments.sort((a, b) => (a.installmentNumber || 0) - (b.installmentNumber || 0)),
        nextPaymentDate: nextPayment?.dueDate || '',
        completionPercentage
      };
    });
  }, [payments]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesProject = projectFilter === 'all' || payment.projectId === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const stats = {
    totalPayments: payments.length,
    paidPayments: payments.filter(p => p.status === 'paid').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    totalPaid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    totalPending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0)
  };

  const uniqueProjects = Array.from(new Set(payments.map(p => p.projectId)))
    .map(id => ({
      id,
      name: payments.find(p => p.projectId === id)?.projectName || ''
    }));

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
          <h1 className="text-3xl font-bold text-gray-900">Mes Paiements</h1>
          <p className="text-gray-600 mt-1">Suivez vos paiements et échéanciers de construction</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'payments' ? 'default' : 'outline'}
            onClick={() => setViewMode('payments')}
          >
            <Receipt className="w-4 h-4 mr-2" />
            Paiements
          </Button>
          <Button
            variant={viewMode === 'plans' ? 'default' : 'outline'}
            onClick={() => setViewMode('plans')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Échéanciers
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payé</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPaid.toLocaleString()} TND</p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalPending.toLocaleString()} TND</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paiements Effectués</p>
                <p className="text-2xl font-bold text-blue-600">{stats.paidPayments}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progression</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((stats.totalPaid / stats.totalAmount) * 100)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'plans' ? (
        // Payment Plans View
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Échéanciers de Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {paymentPlans.map((plan) => (
                  <Card key={plan.id} className="bg-gray-50">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {plan.projectName}
                          </h3>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Total:</span>
                              <p className="font-semibold text-gray-900">
                                {plan.totalAmount.toLocaleString()} TND
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Payé:</span>
                              <p className="font-semibold text-green-600">
                                {plan.paidAmount.toLocaleString()} TND
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Restant:</span>
                              <p className="font-semibold text-yellow-600">
                                {plan.remainingAmount.toLocaleString()} TND
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {Math.round(plan.completionPercentage)}%
                          </div>
                          <p className="text-sm text-gray-600">Complété</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <Progress value={plan.completionPercentage} className="h-3" />
                      </div>

                      {plan.nextPaymentDate && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800">
                            Prochain paiement: {new Date(plan.nextPaymentDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        {plan.installments.map((installment) => (
                          <div key={installment.id} className="flex items-center justify-between p-3 bg-white rounded border">
                            <div className="flex items-center gap-3">
                              <Badge className={statusColors[installment.status]}>
                                {statusLabels[installment.status]}
                              </Badge>
                              <span className="font-medium">
                                {installment.description}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{installment.amount.toLocaleString()} TND</p>
                              <p className="text-sm text-gray-600">
                                Échéance: {new Date(installment.dueDate).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Payments List View
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher un paiement..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="paid">Payé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Projet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les projets</SelectItem>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payments List */}
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {payment.description}
                        </h3>
                        <Badge className={statusColors[payment.status]}>
                          {statusLabels[payment.status]}
                        </Badge>
                        {payment.installmentNumber && payment.totalInstallments && (
                          <Badge variant="outline">
                            {payment.installmentNumber}/{payment.totalInstallments}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{payment.projectName}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Facture</span>
                          <p className="font-semibold text-gray-900">{payment.invoiceNumber}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Montant</span>
                          <p className="font-semibold text-gray-900">{payment.amount.toLocaleString()} TND</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Échéance</span>
                          <p className="font-semibold text-gray-900">
                            {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            {payment.status === 'paid' ? 'Payé le' : 'Statut'}
                          </span>
                          <p className="font-semibold text-gray-900">
                            {payment.paidDate ? 
                              new Date(payment.paidDate).toLocaleDateString('fr-FR') : 
                              statusLabels[payment.status]
                            }
                          </p>
                        </div>
                      </div>

                      {payment.paymentMethod && (
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Payé par: {payment.paymentMethod}
                          </span>
                          {payment.transactionId && (
                            <span className="text-sm text-gray-500">
                              (Réf: {payment.transactionId})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Détails
                          </Button>
                        </DialogTrigger>                        <DialogContent className="max-w-2xl">
                          <FadeIn>
                            <DialogHeader>
                              <DialogTitle>Détails du Paiement</DialogTitle>
                            </DialogHeader>
                            {selectedPayment && (
                              <PaymentDetails payment={selectedPayment} />
                            )}
                          </FadeIn>
                        </DialogContent>
                      </Dialog>

                      {payment.status === 'paid' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Reçu
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPayments.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paiement trouvé</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || projectFilter !== 'all'
                    ? "Aucun paiement ne correspond à vos critères de recherche."
                    : "Aucun paiement n'est encore enregistré."}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function PaymentDetails({ payment }: { payment: Payment }) {
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="info">Informations</TabsTrigger>
        <TabsTrigger value="receipt">Reçu</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Facture</label>
                <p className="text-gray-900 mt-1">{payment.invoiceNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 mt-1">{payment.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Catégorie</label>
                <p className="text-gray-900 mt-1">{payment.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Statut</label>
                <div className="mt-1">
                  <Badge className={statusColors[payment.status]}>
                    {statusLabels[payment.status]}
                  </Badge>
                </div>
              </div>
              {payment.installmentNumber && payment.totalInstallments && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Échéance</label>
                  <p className="text-gray-900 mt-1">
                    {payment.installmentNumber} sur {payment.totalInstallments}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails Financiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Projet</label>
                <p className="text-gray-900 mt-1">{payment.projectName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Montant</label>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {payment.amount.toLocaleString()} TND
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date d'échéance</label>
                <p className="text-gray-900 mt-1">
                  {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {payment.paidDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Date de paiement</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(payment.paidDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              {payment.paymentMethod && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Méthode de paiement</label>
                  <p className="text-gray-900 mt-1">{payment.paymentMethod}</p>
                </div>
              )}
              {payment.transactionId && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Référence transaction</label>
                  <p className="text-gray-900 mt-1">{payment.transactionId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="receipt" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Reçu de Paiement</CardTitle>
          </CardHeader>
          <CardContent>
            {payment.status === 'paid' ? (
              <div className="space-y-4">
                <div className="text-center py-8 border border-gray-200 rounded-lg">
                  <Receipt className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Paiement Confirmé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Votre paiement de {payment.amount.toLocaleString()} TND a été traité avec succès.
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Facture: {payment.invoiceNumber}</p>
                    <p>Date: {payment.paidDate && new Date(payment.paidDate).toLocaleDateString('fr-FR')}</p>
                    {payment.transactionId && <p>Référence: {payment.transactionId}</p>}
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le Reçu PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Reçu non disponible
                </h3>
                <p className="text-gray-600">
                  Le reçu sera disponible une fois le paiement effectué.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
