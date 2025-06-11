import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDate, formatCurrency } from '@/lib/utils';

// Animation imports
import { FadeIn } from '../animations';

interface FinancialTransaction {
  id: number;
  projectId?: number;
  transactionId: string;
  transactionType: 'income' | 'expense' | 'refund' | 'advance';
  category: string;
  description: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  payee?: string;
  payer?: string;
  invoiceNumber?: string;
  status: 'pending' | 'completed' | 'cancelled';
  dueDate?: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionJournalProps {
  projectId?: number;
  title?: string;
  showProjectFilter?: boolean;
}

const TransactionJournal: React.FC<TransactionJournalProps> = ({ 
  projectId, 
  title = "Journal des Transactions", 
  showProjectFilter = true 
}) => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  
  // State management
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
    projectId: projectId?.toString() || 'all'
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    transactionType: 'expense' as const,
    category: '',
    description: '',
    amount: '',
    paymentMethod: '',
    payee: '',
    invoiceNumber: '',
    dueDate: '',
    notes: ''
  });

  // Fetch transactions
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['financial-transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.projectId && filters.projectId !== 'all') {
        params.append('projectId', filters.projectId);
      }
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }

      const response = await fetch(`/api/financial/transactions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const result = await response.json();
      return result.data || [];
    },
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: any) => {
      const response = await fetch('/api/financial/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transaction,
          projectId: projectId || (filters.projectId !== 'all' ? parseInt(filters.projectId) : undefined),
          transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          amount: parseFloat(transaction.amount),
          currency: 'TND',
          status: 'pending'
        }),
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      setIsCreateDialogOpen(false);
      setNewTransaction({
        transactionType: 'expense',
        category: '',
        description: '',
        amount: '',
        paymentMethod: '',
        payee: '',
        invoiceNumber: '',
        dueDate: '',
        notes: ''
      });
    },
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/financial/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete transaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
    },
  });

  // Export transactions
  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (filters.projectId && filters.projectId !== 'all') {
        params.append('projectId', filters.projectId);
      }
      
      const response = await fetch(`/api/financial/export?${params.toString()}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter((transaction: FinancialTransaction) => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.category.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.type === 'all' || transaction.transactionType === filters.type;
    const matchesStatus = filters.status === 'all' || transaction.status === filters.status;
    const matchesCategory = filters.category === 'all' || transaction.category === filters.category;
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  // Calculate summary statistics
  const summary = filteredTransactions.reduce((acc: any, transaction: any) => {
    if (transaction.transactionType === 'income') {
      acc.totalIncome += transaction.amount;
    } else if (transaction.transactionType === 'expense') {
      acc.totalExpenses += transaction.amount;
    }
    acc.totalTransactions += 1;
    return acc;
  }, { totalIncome: 0, totalExpenses: 0, totalTransactions: 0 });

  const netBalance = summary.totalIncome - summary.totalExpenses;

  // Get transaction type icon and color
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'refund':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      case 'advance':
        return <ArrowDownRight className="h-4 w-4 text-orange-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expense':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refund':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  // Get unique categories for filter
  const categories = Array.from(new Set(transactions.map((t: FinancialTransaction) => t.category))).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestion et suivi des transactions financières
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Transaction
              </Button>
            </DialogTrigger>            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle transaction</DialogTitle>
                <DialogDescription>
                  Ajoutez une nouvelle transaction financière au journal.
                </DialogDescription>
              </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newTransaction.transactionType}
                    onValueChange={(value: any) => 
                      setNewTransaction(prev => ({ ...prev, transactionType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Recette</SelectItem>
                      <SelectItem value="expense">Dépense</SelectItem>
                      <SelectItem value="refund">Remboursement</SelectItem>
                      <SelectItem value="advance">Avance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={newTransaction.category}
                    onChange={(e) => 
                      setNewTransaction(prev => ({ ...prev, category: e.target.value }))
                    }
                    placeholder="Ex: Matériaux, Main d'œuvre"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newTransaction.description}
                    onChange={(e) => 
                      setNewTransaction(prev => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Description de la transaction"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (TND)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => 
                      setNewTransaction(prev => ({ ...prev, amount: e.target.value }))
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                  <Select
                    value={newTransaction.paymentMethod}
                    onValueChange={(value) => 
                      setNewTransaction(prev => ({ ...prev, paymentMethod: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                      <SelectItem value="check">Chèque</SelectItem>
                      <SelectItem value="card">Carte bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payee">Bénéficiaire</Label>
                  <Input
                    id="payee"
                    value={newTransaction.payee}
                    onChange={(e) => 
                      setNewTransaction(prev => ({ ...prev, payee: e.target.value }))
                    }
                    placeholder="Nom du bénéficiaire"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">N° Facture</Label>
                  <Input
                    id="invoiceNumber"
                    value={newTransaction.invoiceNumber}
                    onChange={(e) => 
                      setNewTransaction(prev => ({ ...prev, invoiceNumber: e.target.value }))
                    }
                    placeholder="Numéro de facture"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Date d'échéance</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTransaction.dueDate}
                    onChange={(e) => 
                      setNewTransaction(prev => ({ ...prev, dueDate: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newTransaction.notes}
                    onChange={(e) => 
                      setNewTransaction(prev => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Notes supplémentaires"
                    rows={3}
                  />
                </div>
              </div>              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Annuler
                </Button>                <Button
                  onClick={() => createTransactionMutation.mutate(newTransaction)}
                  disabled={!newTransaction.description || !newTransaction.amount || !newTransaction.category}
                >
                  Créer Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Recettes
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalIncome)} TND
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Dépenses
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalExpenses)} TND
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Solde Net
                </p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netBalance)} TND
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.totalTransactions}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Description, ID, catégorie..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="income">Recettes</SelectItem>
                  <SelectItem value="expense">Dépenses</SelectItem>
                  <SelectItem value="refund">Remboursements</SelectItem>
                  <SelectItem value="advance">Avances</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date début</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Date fin</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Aucune transaction trouvée</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction: FinancialTransaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.transactionType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {transaction.description}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTypeColor(transaction.transactionType)}`}
                        >
                          {transaction.transactionType}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>ID: {transaction.transactionId}</span>
                        <span>Catégorie: {transaction.category}</span>
                        <span>Date: {formatDate(transaction.createdAt)}</span>
                        {transaction.payee && <span>Bénéficiaire: {transaction.payee}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.transactionType === 'income' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.transactionType === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)} TND
                      </p>
                      {transaction.dueDate && (
                        <p className="text-xs text-gray-500">
                          Échéance: {formatDate(transaction.dueDate)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
                            deleteTransactionMutation.mutate(transaction.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionJournal;
