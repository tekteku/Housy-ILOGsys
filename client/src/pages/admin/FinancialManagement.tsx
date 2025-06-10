import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calculator,
  CreditCard,
  Banknote,
  Receipt,
  FileText,
  Download,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Plus,
  Eye,
  Settings
} from 'lucide-react';

interface FinancialOverview {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: number;
  accountsReceivable: number;
  accountsPayable: number;
  workingCapital: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  cashFlow: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  budget: number;
  variance: number;
  trend: 'up' | 'down' | 'stable';
}

interface FinancialAlert {
  id: string;
  type: 'budget_overrun' | 'cash_flow' | 'payment_delay' | 'expense_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  amount?: number;
  projectId?: number;
  projectName?: string;
  createdAt: string;
  resolved: boolean;
}

interface Budget {
  id: string;
  name: string;
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  status: 'on_track' | 'warning' | 'exceeded';
  category: string;
  startDate: string;
  endDate: string;
}

const FinancialManagement: React.FC = () => {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Simuler données financières avancées (à remplacer par vraies API)
      const mockOverview: FinancialOverview = {
        totalRevenue: 2850000,
        totalExpenses: 2150000,
        netProfit: 700000,
        profitMargin: 24.56,
        cashFlow: 450000,
        accountsReceivable: 380000,
        accountsPayable: 220000,
        workingCapital: 560000
      };

      const mockMonthlyData: MonthlyData[] = [
        { month: 'Jan 2024', revenue: 245000, expenses: 180000, profit: 65000, cashFlow: 45000 },
        { month: 'Fév 2024', revenue: 220000, expenses: 175000, profit: 45000, cashFlow: 35000 },
        { month: 'Mar 2024', revenue: 280000, expenses: 195000, profit: 85000, cashFlow: 65000 },
        { month: 'Avr 2024', revenue: 315000, expenses: 210000, profit: 105000, cashFlow: 75000 },
        { month: 'Mai 2024', revenue: 290000, expenses: 205000, profit: 85000, cashFlow: 55000 },
        { month: 'Jun 2024', revenue: 350000, expenses: 235000, profit: 115000, cashFlow: 85000 },
        { month: 'Jul 2024', revenue: 380000, expenses: 250000, profit: 130000, cashFlow: 95000 },
        { month: 'Aoû 2024', revenue: 365000, expenses: 245000, profit: 120000, cashFlow: 88000 },
        { month: 'Sep 2024', revenue: 295000, expenses: 220000, profit: 75000, cashFlow: 52000 },
        { month: 'Oct 2024', revenue: 420000, expenses: 280000, profit: 140000, cashFlow: 105000 },
        { month: 'Nov 2024', revenue: 385000, expenses: 265000, profit: 120000, cashFlow: 92000 },
        { month: 'Déc 2024', revenue: 400000, expenses: 290000, profit: 110000, cashFlow: 85000 }
      ];

      const mockExpenseCategories: ExpenseCategory[] = [
        {
          category: 'Matériaux',
          amount: 850000,
          percentage: 39.5,
          budget: 900000,
          variance: -50000,
          trend: 'down'
        },
        {
          category: 'Main-d\'œuvre',
          amount: 680000,
          percentage: 31.6,
          budget: 650000,
          variance: 30000,
          trend: 'up'
        },
        {
          category: 'Équipements',
          amount: 320000,
          percentage: 14.9,
          budget: 350000,
          variance: -30000,
          trend: 'stable'
        },
        {
          category: 'Transport',
          amount: 150000,
          percentage: 7.0,
          budget: 140000,
          variance: 10000,
          trend: 'up'
        },
        {
          category: 'Services',
          amount: 100000,
          percentage: 4.7,
          budget: 110000,
          variance: -10000,
          trend: 'down'
        },
        {
          category: 'Autres',
          amount: 50000,
          percentage: 2.3,
          budget: 60000,
          variance: -10000,
          trend: 'stable'
        }
      ];

      const mockAlerts: FinancialAlert[] = [
        {
          id: '1',
          type: 'budget_overrun',
          severity: 'high',
          message: 'Dépassement de budget de 15% sur le projet Villa Sidi Bou Saïd',
          amount: 45000,
          projectId: 123,
          projectName: 'Villa Sidi Bou Saïd',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'payment_delay',
          severity: 'medium',
          message: 'Paiement en retard de 15 jours',
          amount: 25000,
          projectId: 456,
          projectName: 'Résidence Carthage',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '3',
          type: 'cash_flow',
          severity: 'critical',
          message: 'Flux de trésorerie négatif prévu le mois prochain',
          amount: -75000,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          resolved: false
        }
      ];

      const mockBudgets: Budget[] = [
        {
          id: '1',
          name: 'Budget Q1 2024 - Matériaux',
          totalBudget: 300000,
          spentAmount: 245000,
          remainingAmount: 55000,
          percentage: 81.7,
          status: 'warning',
          category: 'Matériaux',
          startDate: '2024-01-01',
          endDate: '2024-03-31'
        },
        {
          id: '2',
          name: 'Budget Annuel - Main d\'œuvre',
          totalBudget: 650000,
          spentAmount: 480000,
          remainingAmount: 170000,
          percentage: 73.8,
          status: 'on_track',
          category: 'Personnel',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        {
          id: '3',
          name: 'Budget Équipements 2024',
          totalBudget: 180000,
          spentAmount: 195000,
          remainingAmount: -15000,
          percentage: 108.3,
          status: 'exceeded',
          category: 'Équipements',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      ];

      setOverview(mockOverview);
      setMonthlyData(mockMonthlyData);
      setExpenseCategories(mockExpenseCategories);
      setAlerts(mockAlerts);
      setBudgets(mockBudgets);
    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportFinancialReport = async () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      overview,
      monthlyData,
      expenseCategories,
      alerts: alerts.filter(a => !a.resolved),
      budgets
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-financier-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'exceeded': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getBudgetStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'exceeded': return <AlertCircle className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            Gestion Financière
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Suivi financier avancé et gestion budgétaire pour Housy
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="3months">3 derniers mois</option>
            <option value="6months">6 derniers mois</option>
            <option value="12months">12 derniers mois</option>
            <option value="ytd">Année en cours</option>
          </select>
          <Button 
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau budget
          </Button>
          <Button onClick={exportFinancialReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter rapport
          </Button>
        </div>
      </div>

      {/* Vue d'ensemble financière */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Chiffre d'affaires
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(overview.totalRevenue)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                <span className="text-green-600">+12.5% vs période précédente</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Dépenses
                  </p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {formatCurrency(overview.totalExpenses)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="w-3 h-3 mr-1 text-red-500" />
                <span className="text-red-600">+8.2% vs période précédente</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Bénéfice net
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(overview.netProfit)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-blue-600">
                  Marge: {overview.profitMargin.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Flux de trésorerie
                  </p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {formatCurrency(overview.cashFlow)}
                  </p>
                </div>
                <Banknote className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-purple-600">
                  Fonds de roulement: {formatCurrency(overview.workingCapital)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertes financières */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Alertes financières
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.filter(a => !a.resolved).map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {alert.message}
                  </p>
                  {alert.amount && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Montant: {formatCurrency(Math.abs(alert.amount))}
                    </p>
                  )}
                  {alert.projectName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Projet: {alert.projectName}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">
                      Voir détails
                    </Button>
                    <Button size="sm">
                      Marquer résolu
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suivi budgétaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Suivi budgétaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgets.map((budget) => (
                <div key={budget.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={getBudgetStatusColor(budget.status)}>
                        {getBudgetStatusIcon(budget.status)}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {budget.name}
                      </h4>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {budget.category}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Dépensé: {formatCurrency(budget.spentAmount)}</span>
                      <span>{budget.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          budget.status === 'exceeded' 
                            ? 'bg-red-500' 
                            : budget.status === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Budget total: {formatCurrency(budget.totalBudget)}</p>
                    <p>Restant: {formatCurrency(budget.remainingAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition des dépenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-500" />
              Répartition des dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseCategories.map((category) => (
                <div key={category.category} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {category.category}
                    </h4>
                    <div className="flex items-center gap-1">
                      {category.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                      {category.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-500" />}
                      {category.trend === 'stable' && <div className="w-4 h-4" />}
                      <span className="text-sm font-medium">{category.percentage}%</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Dépensé: {formatCurrency(category.amount)}</span>
                      <span>Budget: {formatCurrency(category.budget)}</span>
                    </div>
                    <div className={`text-xs mt-1 ${
                      category.variance >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      Écart: {formatCurrency(category.variance)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal nouveau budget */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Créer un nouveau budget
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBudgetModal(false)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du budget
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Ex: Budget Q2 2024 - Équipements"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700">
                  <option>Matériaux</option>
                  <option>Main-d'œuvre</option>
                  <option>Équipements</option>
                  <option>Transport</option>
                  <option>Services</option>
                  <option>Autres</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant du budget (TND)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setShowBudgetModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button className="flex-1">
                  Créer budget
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;
