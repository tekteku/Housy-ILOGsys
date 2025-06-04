import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertTriangle, Calendar, Download, Plus, Filter, Eye, FileText, Calculator } from 'lucide-react';
import { useNotification } from '@/hooks/use-notification';

interface ProjectFinancesProps {
  projectId: number;
}

interface FinancialTransaction {
  id: number;
  projectId: number;
  transactionType: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectBudget {
  id: number;
  projectId: number;
  categoryId: number;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  currency: string;
  notes?: string;
  lastUpdated: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  budgetAllocated: number;
  budgetRemaining: number;
  budgetUtilization: number;
  transactionCount: number;
}

interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
  netFlow: number;
}

const EXPENSE_CATEGORIES = [
  'Matériaux',
  'Main-d\'œuvre',
  'Équipements',
  'Transport',
  'Sous-traitance',
  'Permis',
  'Assurance',
  'Autres'
];

const INCOME_CATEGORIES = [
  'Paiement client',
  'Avance',
  'Subvention',
  'Remboursement',
  'Autres'
];

const COLORS = {
  income: '#10b981',
  expense: '#ef4444',
  budget: '#3b82f6',
  actual: '#f59e0b',
  positive: '#10b981',
  negative: '#ef4444',
  warning: '#f59e0b',
  chart: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
};

export default function ProjectFinances({ projectId }: ProjectFinancesProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: ''
  });

  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Fetch financial data
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['financial-transactions', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/financial/transactions?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const result = await response.json();
      return result.data || [];
    }
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['project-budgets', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/financial/budgets?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch budgets');
      const result = await response.json();
      return result.data || [];
    }
  });

  const { data: financialSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['financial-summary', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/financial/reports/project/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch financial summary');
      const result = await response.json();
      return result.data;
    }
  });

  const { data: cashFlowData = [], isLoading: cashFlowLoading } = useQuery({
    queryKey: ['cash-flow', projectId, selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/financial/analytics/cash-flow?projectId=${projectId}&period=${selectedPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch cash flow data');
      const result = await response.json();
      return result.data?.cashFlow || [];
    }
  });

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: any) => {
      const response = await fetch('/api/financial/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          transactionType: transaction.type,
          amount: parseFloat(transaction.amount),
          description: transaction.description,
          category: transaction.category
        })
      });
      if (!response.ok) throw new Error('Failed to add transaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary', projectId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow', projectId] });
      setIsAddTransactionOpen(false);
      setNewTransaction({ type: 'expense', amount: '', description: '', category: '' });
      showNotification('Transaction ajoutée avec succès', 'success');
    },
    onError: () => {
      showNotification('Erreur lors de l\'ajout de la transaction', 'error');
    }
  });

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction: FinancialTransaction) => {
      if (transactionFilter !== 'all' && transaction.transactionType !== transactionFilter) return false;
      if (categoryFilter !== 'all' && transaction.category !== categoryFilter) return false;
      return true;
    });
  }, [transactions, transactionFilter, categoryFilter]);

  // Budget vs Actual data for chart
  const budgetVsActualData = useMemo(() => {
    const categoryMap = new Map();
    
    budgets.forEach((budget: ProjectBudget) => {
      const category = budget.categoryId.toString(); // Simplified for demo
      categoryMap.set(category, {
        category,
        budget: budget.budgetedAmount,
        actual: budget.actualAmount
      });
    });

    return Array.from(categoryMap.values());
  }, [budgets]);

  // Expense breakdown for pie chart
  const expenseBreakdown = useMemo(() => {
    const categoryTotals = new Map();
    
    transactions
      .filter((t: FinancialTransaction) => t.transactionType === 'expense')
      .forEach((t: FinancialTransaction) => {
        const category = t.category || 'Autres';
        categoryTotals.set(category, (categoryTotals.get(category) || 0) + t.amount);
      });

    return Array.from(categoryTotals.entries()).map(([category, amount], index) => ({
      name: category,
      value: amount,
      color: COLORS.chart[index % COLORS.chart.length]
    }));
  }, [transactions]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100) / 100}%`;
  };

  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description) {
      showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    addTransactionMutation.mutate(newTransaction);
  };

  const exportFinancialReport = async () => {
    try {
      const response = await fetch(`/api/analytics/reports/financial-statement?projectId=${projectId}&format=pdf`);
      if (!response.ok) throw new Error('Failed to export report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_financier_projet_${projectId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showNotification('Rapport exporté avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de l\'export du rapport', 'error');
    }
  };

  if (transactionsLoading || budgetsLoading || summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(financialSummary?.budgetAllocated || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, financialSummary?.budgetUtilization || 0)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formatPercentage(financialSummary?.budgetUtilization || 0)}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialSummary?.totalIncome || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12% ce mois</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dépenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(financialSummary?.totalExpenses || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-red-600">+8% ce mois</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Solde Net</p>
                <p className={`text-2xl font-bold ${(financialSummary?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialSummary?.netBalance || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-muted-foreground">
                    Budget restant: {formatCurrency(financialSummary?.budgetRemaining || 0)}
                  </span>
                </div>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${(financialSummary?.netBalance || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${(financialSummary?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Flux de Trésorerie</CardTitle>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 mois</SelectItem>
                  <SelectItem value="12months">12 mois</SelectItem>
                  <SelectItem value="24months">24 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {cashFlowLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1" 
                    stroke={COLORS.income} 
                    fill={COLORS.income} 
                    fillOpacity={0.6}
                    name="Revenus"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2" 
                    stroke={COLORS.expense} 
                    fill={COLORS.expense} 
                    fillOpacity={0.6}
                    name="Dépenses"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netFlow" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    name="Flux Net"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Budget vs Actual Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Réalisé</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetVsActualData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="budget" fill={COLORS.budget} name="Budget" />
                <Bar dataKey="actual" fill={COLORS.actual} name="Réalisé" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertes Budgétaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {budgets.map((budget: ProjectBudget) => {
              const utilizationRate = budget.budgetedAmount > 0 ? (budget.actualAmount / budget.budgetedAmount) * 100 : 0;
              const isOverBudget = utilizationRate > 100;
              const isWarning = utilizationRate > 80;
              
              return (
                <div key={budget.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${isOverBudget ? 'bg-red-100' : isWarning ? 'bg-yellow-100' : 'bg-green-100'}`}>
                      <AlertTriangle className={`h-4 w-4 ${isOverBudget ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium">Catégorie {budget.categoryId}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(budget.actualAmount)} / {formatCurrency(budget.budgetedAmount)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isOverBudget ? 'destructive' : isWarning ? 'secondary' : 'default'}>
                    {formatPercentage(utilizationRate)}
                  </Badge>
                </div>
              );
            })}
            
            {budgets.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun budget configuré</p>
                <p className="text-sm">Configurez des budgets pour suivre vos dépenses</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions Financières</CardTitle>
            <div className="flex items-center space-x-2">
              <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouvelle Transaction</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="transaction-type">Type</Label>
                        <Select 
                          value={newTransaction.type} 
                          onValueChange={(value: 'income' | 'expense') => 
                            setNewTransaction(prev => ({ ...prev, type: value, category: '' }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Revenu</SelectItem>
                            <SelectItem value="expense">Dépense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="amount">Montant (TND)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <Select 
                        value={newTransaction.category} 
                        onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {(newTransaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Description de la transaction..."
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddTransactionOpen(false)}>
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleAddTransaction}
                        disabled={addTransactionMutation.isPending}
                      >
                        {addTransactionMutation.isPending ? 'Ajout...' : 'Ajouter'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={exportFinancialReport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="income">Revenus</SelectItem>
                  <SelectItem value="expense">Dépenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transactions List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTransactions.map((transaction: FinancialTransaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${transaction.transactionType === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transaction.transactionType === 'income' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{new Date(transaction.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.transactionType === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <Badge variant={transaction.transactionType === 'income' ? 'default' : 'secondary'}>
                    {transaction.transactionType === 'income' ? 'Revenu' : 'Dépense'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Aucune transaction trouvée</p>
                <p className="text-sm">
                  {transactions.length === 0 
                    ? 'Commencez par ajouter une transaction'
                    : 'Aucune transaction ne correspond aux filtres sélectionnés'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
