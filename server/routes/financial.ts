import { Router } from 'express';
import { ZodError } from 'zod';
import moment from 'moment';
import { 
  storage, 
  db, 
  financialTransactions, 
  projectBudgets, 
  budgetCategories,
  eq, 
  and, 
  gte, 
  lte, 
  desc, 
  asc,
  count,
  sql
} from '../storage';
import { 
  insertFinancialTransactionSchema, 
  insertBudgetCategorySchema, 
  insertProjectBudgetSchema 
} from '../../shared/schema.js';

const router = Router();

// TypeScript interfaces for better type safety
interface FinancialRequest {
  projectId?: string;
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  period?: string;
  page?: string;
  limit?: string;
}

interface FinancialResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  generatedAt: Date;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
  netFlow: number;
}

interface ProjectFinancialReport {
  projectId: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  budgetAllocated: number;
  budgetRemaining: number;
  budgetUtilization: number;
  transactionCount: number;
  generatedAt: Date;
}

// Helper function to create consistent response format
const createResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  error?: string,
  pagination?: { page: number; limit: number; total: number }
): FinancialResponse<T> => ({
  success,
  message,
  data,
  error,
  generatedAt: new Date(),
  ...(pagination && { pagination })
});

// Helper function to get date range based on period
const getDateRange = (period: string = '12months') => {
  const endDate = moment();
  let startDate = moment();

  switch (period) {
    case '1month':
      startDate = moment().subtract(1, 'month');
      break;
    case '3months':
      startDate = moment().subtract(3, 'months');
      break;
    case '6months':
      startDate = moment().subtract(6, 'months');
      break;
    case '12months':
    default:
      startDate = moment().subtract(12, 'months');
      break;
  }

  return { startDate: startDate.toDate(), endDate: endDate.toDate() };
};

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Une erreur inconnue s\'est produite';
};

// Middleware de validation
const validateRequest = (schema: any) => (req: any, res: any, next: any) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Erreur de validation",
        errors: error.errors
      });
    } else {
      next(error);
    }
  }
};

// GET /api/financial/transactions - Obtenir toutes les transactions
router.get('/transactions', async (req, res) => {
  try {
    const { 
      projectId, 
      type, 
      startDate, 
      endDate, 
      page = '1', 
      limit = '20'    }: FinancialRequest = req.query;
    
    let conditions: any[] = [];
    
    // Apply filters using conditional query building
    if (projectId) {
      const projectIdNum = parseInt(projectId);
      if (isNaN(projectIdNum)) {
        return res.status(400).json(
          createResponse(false, "ID de projet invalide", undefined, "L'ID du projet doit être un nombre valide")
        );
      }
      conditions.push(eq(financialTransactions.projectId, projectIdNum));
    }
    
    if (type && ['income', 'expense'].includes(type)) {
      conditions.push(eq(financialTransactions.transactionType, type));
    }

    // Date range filtering using createdAt field
    if (startDate && moment(startDate).isValid()) {
      conditions.push(gte(financialTransactions.createdAt, moment(startDate).toDate()));
    }
      if (endDate && moment(endDate).isValid()) {
      conditions.push(lte(financialTransactions.createdAt, moment(endDate).toDate()));
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json(
        createResponse(false, "Numéro de page invalide", undefined, "La page doit être un nombre positif")
      );
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json(
        createResponse(false, "Limite invalide", undefined, "La limite doit être entre 1 et 100")
      );
    }    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: count() })
      .from(financialTransactions);
    
    const total = totalResult?.count || 0;

    // Execute query with pagination
    const transactions = conditions.length > 0 
      ? await db
          .select()
          .from(financialTransactions)
          .where(and(...conditions))
          .limit(limitNum)
          .offset((pageNum - 1) * limitNum)
          .orderBy(desc(financialTransactions.createdAt))
      : await db
          .select()
          .from(financialTransactions)
          .limit(limitNum)
          .offset((pageNum - 1) * limitNum)
          .orderBy(desc(financialTransactions.createdAt));

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total
    };

    res.json(createResponse(
      true,
      "Transactions récupérées avec succès",
      transactions,
      undefined,
      pagination
    ));
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de la récupération des transactions",
      undefined,
      getErrorMessage(error)
    ));
  }
});

// POST /api/financial/transactions - Créer une nouvelle transaction
router.post('/transactions', validateRequest(insertFinancialTransactionSchema), async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [newTransaction] = await db
      .insert(financialTransactions)
      .values(transactionData)
      .returning();

    res.status(201).json(createResponse(
      true,
      "Transaction créée avec succès",
      newTransaction
    ));
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de la création de la transaction",
      undefined,
      getErrorMessage(error)
    ));
  }
});

// GET /api/financial/budgets - Obtenir tous les budgets
router.get('/budgets', async (req, res) => {
  try {
    const { projectId }: FinancialRequest = req.query;
    
    const conditions: any[] = [];
    
    if (projectId) {
      const projectIdNum = parseInt(projectId);
      if (isNaN(projectIdNum)) {
        return res.status(400).json(createResponse(
          false,
          "ID de projet invalide",
          undefined,
          "L'ID du projet doit être un nombre valide"
        ));
      }
      conditions.push(eq(projectBudgets.projectId, projectIdNum));
    }

    const budgets = conditions.length > 0 
      ? await db.select().from(projectBudgets).where(and(...conditions))
      : await db.select().from(projectBudgets);

    res.json(createResponse(
      true,
      "Budgets récupérés avec succès",
      budgets
    ));
  } catch (error) {
    console.error('Erreur lors de la récupération des budgets:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de la récupération des budgets",
      undefined,
      getErrorMessage(error)
    ));
  }
});

// POST /api/financial/budgets - Créer un nouveau budget
router.post('/budgets', validateRequest(insertProjectBudgetSchema), async (req, res) => {
  try {
    const budgetData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [newBudget] = await db
      .insert(projectBudgets)
      .values(budgetData)
      .returning();

    res.status(201).json(createResponse(
      true,
      "Budget créé avec succès",
      newBudget
    ));
  } catch (error) {
    console.error('Erreur lors de la création du budget:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de la création du budget",
      undefined,
      getErrorMessage(error)
    ));
  }
});

// GET /api/financial/categories - Obtenir toutes les catégories budgétaires
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.select().from(budgetCategories);

    res.json(createResponse(
      true,
      "Catégories budgétaires récupérées avec succès",
      categories
    ));
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de la récupération des catégories",
      undefined,
      getErrorMessage(error)
    ));
  }
});

// POST /api/financial/categories - Créer une nouvelle catégorie budgétaire
router.post('/categories', validateRequest(insertBudgetCategorySchema), async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [newCategory] = await db
      .insert(budgetCategories)
      .values(categoryData)
      .returning();

    res.status(201).json(createResponse(
      true,
      "Catégorie budgétaire créée avec succès",
      newCategory
    ));
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de la création de la catégorie",
      undefined,
      getErrorMessage(error)
    ));
  }
});

// GET /api/financial/reports/project/:projectId - Rapport financier d'un projet
router.get('/reports/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json(createResponse(
        false,
        "ID de projet invalide",
        undefined,
        "L'ID du projet doit être un nombre valide"
      ));
    }

    // Parallel execution for better performance
    const [transactions, budgetResult] = await Promise.all([
      db
        .select()
        .from(financialTransactions)
        .where(eq(financialTransactions.projectId, projectId)),
      
      db
        .select()
        .from(projectBudgets)
        .where(eq(projectBudgets.projectId, projectId))
        .limit(1)
    ]);

    const budget = budgetResult[0];    // Calculate totals with proper type conversion
    const totalIncome = transactions
      .filter((t: any) => t.transactionType === 'income')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

    const totalExpenses = transactions
      .filter((t: any) => t.transactionType === 'expense')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

    const netBalance = totalIncome - totalExpenses;
    const budgetAllocated = budget ? parseFloat(budget.budgetedAmount.toString()) : 0;
    const budgetRemaining = budgetAllocated - totalExpenses;
    const budgetUtilization = budgetAllocated > 0 ? (totalExpenses / budgetAllocated) * 100 : 0;

    const report: ProjectFinancialReport = {
      projectId,
      totalIncome,
      totalExpenses,
      netBalance,
      budgetAllocated,
      budgetRemaining,
      budgetUtilization: Math.round(budgetUtilization * 100) / 100, // Round to 2 decimal places
      transactionCount: transactions.length,
      generatedAt: new Date()
    };

    res.json(createResponse(
      true,
      "Rapport financier généré avec succès",
      report
    ));
  } catch (error) {
    console.error('Erreur lors de la génération du rapport financier:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de la génération du rapport financier",
      undefined,
      getErrorMessage(error)
    ));
  }
});

// GET /api/financial/analytics/cash-flow - Analyse de flux de trésorerie
router.get('/analytics/cash-flow', async (req, res) => {
  try {
    const { projectId, period = '12months' }: FinancialRequest = req.query;
    
    // Use moment.js for better date handling
    const { startDate } = getDateRange(period);
    const conditions: any[] = [gte(financialTransactions.createdAt, startDate)];
    
    if (projectId) {
      const projectIdNum = parseInt(projectId);
      if (isNaN(projectIdNum)) {
        return res.status(400).json(createResponse(
          false,
          "ID de projet invalide",
          undefined,
          "L'ID du projet doit être un nombre valide"
        ));
      }
      conditions.push(eq(financialTransactions.projectId, projectIdNum));
    }

    const transactions = await db
      .select()
      .from(financialTransactions)
      .where(and(...conditions))
      .orderBy(asc(financialTransactions.createdAt));// Group by month with improved date handling
    const monthlyData = transactions.reduce((acc: Record<string, { income: number; expenses: number }>, transaction: any) => {
      const month = moment(transaction.createdAt).format('YYYY-MM');
      
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      
      const amount = parseFloat(transaction.amount.toString());      if (transaction.transactionType === 'income') {
        acc[month].income += amount;
      } else if (transaction.transactionType === 'expense') {
        acc[month].expenses += amount;
      }
      
      return acc;
    }, {});

    const cashFlowData: CashFlowData[] = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: Math.round(data.income * 100) / 100, // Round to 2 decimal places
        expenses: Math.round(data.expenses * 100) / 100,
        netFlow: Math.round((data.income - data.expenses) * 100) / 100
      }))
      .sort((a, b) => a.month.localeCompare(b.month)); // Sort by month

    res.json(createResponse(
      true,
      "Analyse de flux de trésorerie générée avec succès",
      {
        cashFlow: cashFlowData,
        period,
        summary: {
          totalMonths: cashFlowData.length,
          totalIncome: cashFlowData.reduce((sum, item) => sum + item.income, 0),
          totalExpenses: cashFlowData.reduce((sum, item) => sum + item.expenses, 0),
          totalNetFlow: cashFlowData.reduce((sum, item) => sum + item.netFlow, 0)
        }
      }
    ));
  } catch (error) {
    console.error('Erreur lors de l\'analyse de flux de trésorerie:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de l'analyse de flux de trésorerie",
      undefined,
      getErrorMessage(error)
    ));
  }
});

// DELETE /api/financial/transactions/:id - Supprimer une transaction
router.delete('/transactions/:id', async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    
    if (isNaN(transactionId)) {
      return res.status(400).json(createResponse(
        false,
        "ID de transaction invalide",
        undefined,
        "L'ID de la transaction doit être un nombre valide"
      ));
    }

    const [deletedTransaction] = await db
      .delete(financialTransactions)
      .where(eq(financialTransactions.id, transactionId))
      .returning();

    if (!deletedTransaction) {
      return res.status(404).json(createResponse(
        false,
        "Transaction non trouvée",
        undefined,
        "Aucune transaction trouvée avec cet ID"
      ));
    }

    res.json(createResponse(
      true,
      "Transaction supprimée avec succès",
      { deletedId: transactionId }
    ));
  } catch (error) {
    console.error('Erreur lors de la suppression de la transaction:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de la suppression de la transaction",
      undefined,
      getErrorMessage(error)
    ));
  }
});

// GET /api/financial/analytics/budget-vs-actual/:projectId - Comparaison budget vs réel
router.get('/analytics/budget-vs-actual/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { period = '12months' }: FinancialRequest = req.query;
    
    if (isNaN(projectId)) {
      return res.status(400).json(createResponse(
        false,
        "ID de projet invalide",
        undefined,
        "L'ID du projet doit être un nombre valide"
      ));
    }

    const { startDate } = getDateRange(period);

    // Parallel execution for better performance
    const [transactions, budget] = await Promise.all([
      db
        .select()
        .from(financialTransactions)
        .where(and(        eq(financialTransactions.projectId, projectId),
          gte(financialTransactions.createdAt, startDate)
        )),
      
      db
        .select()
        .from(projectBudgets)
        .where(eq(projectBudgets.projectId, projectId))
        .limit(1)
    ]);

    const projectBudget = budget[0];
    
    if (!projectBudget) {
      return res.status(404).json(createResponse(
        false,
        "Budget de projet non trouvé",
        undefined,
        "Aucun budget trouvé pour ce projet"
      ));
    }    const totalExpenses = transactions
      .filter((t: any) => t.transactionType === 'expense')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

    const budgetAllocated = parseFloat(projectBudget.budgetedAmount.toString());
    const budgetUsed = totalExpenses;
    const budgetRemaining = budgetAllocated - budgetUsed;
    const utilizationPercentage = budgetAllocated > 0 ? (budgetUsed / budgetAllocated) * 100 : 0;

    const analysis = {
      projectId,
      budget: {
        allocated: Math.round(budgetAllocated * 100) / 100,
        used: Math.round(budgetUsed * 100) / 100,
        remaining: Math.round(budgetRemaining * 100) / 100,
        utilizationPercentage: Math.round(utilizationPercentage * 100) / 100
      },
      status: {
        isOverBudget: budgetUsed > budgetAllocated,
        warningThreshold: utilizationPercentage > 80,
        criticalThreshold: utilizationPercentage > 95
      },
      period,
      generatedAt: new Date()
    };

    res.json(createResponse(
      true,
      "Analyse budget vs réel générée avec succès",
      analysis
    ));
  } catch (error) {
    console.error('Erreur lors de l\'analyse budget vs réel:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de l'analyse budget vs réel",
      undefined,
      getErrorMessage(error)
    ));
  }
});

// Nouvel endpoint pour le dashboard financier global
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    const { startDate, endDate } = getDateRange(period as string);

    // Métriques principales
    const metrics = {
      totalRevenue: 850000,
      totalExpenses: 620000,
      profit: 230000,
      profitMargin: 27.1,
      activeProjects: 12,
      completedProjects: 45,
      pendingPayments: 125000,
      monthlyGrowth: 15.3
    };

    // Données pour les graphiques
    const chartData = [
      { month: 'Jan', revenue: 120000, expenses: 85000, profit: 35000 },
      { month: 'Fév', revenue: 135000, expenses: 95000, profit: 40000 },
      { month: 'Mar', revenue: 150000, expenses: 110000, profit: 40000 },
      { month: 'Avr', revenue: 145000, expenses: 105000, profit: 40000 },
      { month: 'Mai', revenue: 165000, expenses: 115000, profit: 50000 },
      { month: 'Juin', revenue: 135000, expenses: 110000, profit: 25000 }
    ];

    // Projets par catégorie
    const projectsByCategory = [
      { name: 'Construction Villa', value: 8, color: '#0088FE' },
      { name: 'Rénovation', value: 6, color: '#00C49F' },
      { name: 'Extension', value: 4, color: '#FFBB28' },
      { name: 'Commercial', value: 3, color: '#FF8042' },
      { name: 'Aménagement', value: 2, color: '#8884D8' }
    ];

    res.json(createResponse(true, 'Dashboard financier récupéré avec succès', {
      metrics,
      chartData,
      projectsByCategory
    }));  } catch (error) {
    console.error('Erreur dashboard financier:', error);
    res.status(500).json(createResponse(false, 'Erreur lors de la récupération du dashboard', undefined, getErrorMessage(error)));
  }
});

// Endpoint pour les données financières d'un projet spécifique
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { period = '6months' } = req.query;

    if (!projectId) {
      return res.status(400).json(createResponse(false, 'ID du projet requis'));
    }

    // Métriques du projet
    const metrics = {
      totalRevenue: 185000,
      totalExpenses: 135000,
      profit: 50000,
      profitMargin: 27.0,
      activeProjects: 1,
      completedProjects: 0,
      pendingPayments: 35000,
      monthlyGrowth: 8.5
    };

    // Données temporelles pour ce projet
    const chartData = [
      { month: 'Jan', revenue: 0, expenses: 0, profit: 0 },
      { month: 'Fév', revenue: 55000, expenses: 40000, profit: 15000 },
      { month: 'Mar', revenue: 65000, expenses: 45000, profit: 20000 },
      { month: 'Avr', revenue: 65000, expenses: 50000, profit: 15000 }
    ];

    res.json(createResponse(true, 'Données financières du projet récupérées', {
      metrics,
      chartData,
      projectsByCategory: [] // Pas applicable pour un projet spécifique
    }));  } catch (error) {
    console.error('Erreur données financières projet:', error);
    res.status(500).json(createResponse(false, 'Erreur lors de la récupération des données', undefined, getErrorMessage(error)));
  }
});

// Endpoint pour l'export de données financières
router.get('/export', async (req, res) => {
  try {
    const { format, period = '6months' } = req.query;

    if (!format || !['csv', 'pdf'].includes(format as string)) {
      return res.status(400).json(createResponse(false, 'Format d\'export invalide'));
    }

    if (format === 'csv') {
      const csvContent = `Period,Revenue,Expenses,Profit,Margin\n` +
        `Janvier,120000,85000,35000,29.2%\n` +
        `Février,135000,95000,40000,29.6%\n` +
        `Mars,150000,110000,40000,26.7%\n` +
        `Avril,145000,105000,40000,27.6%\n` +
        `Mai,165000,115000,50000,30.3%\n` +
        `Juin,135000,110000,25000,18.5%`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="financial-report-${period}.csv"`);
      res.send(csvContent);
    } else {
      // Simulation PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="financial-report-${period}.pdf"`);
      res.send('PDF content simulation');
    }  } catch (error) {
    console.error('Erreur export financier:', error);
    res.status(500).json(createResponse(false, 'Erreur lors de l\'export', undefined, getErrorMessage(error)));
  }
});

// Endpoint pour l'export de données d'un projet spécifique
router.get('/export/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { format, period = '6months' } = req.query;

    if (!projectId) {
      return res.status(400).json(createResponse(false, 'ID du projet requis'));
    }

    if (!format || !['csv', 'pdf'].includes(format as string)) {
      return res.status(400).json(createResponse(false, 'Format d\'export invalide'));
    }

    if (format === 'csv') {
      const csvContent = `Date,Type,Description,Amount,Category\n` +
        `2025-02-15,Income,Acompte client,55000,Payment\n` +
        `2025-02-20,Expense,Matériaux construction,25000,Materials\n` +
        `2025-03-01,Expense,Main d'oeuvre,15000,Labor\n` +
        `2025-03-15,Income,Paiement intermédiaire,65000,Payment`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="project-${projectId}-financial-${period}.csv"`);
      res.send(csvContent);
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="project-${projectId}-financial-${period}.pdf"`);
      res.send('Project PDF content simulation');
    }  } catch (error) {
    console.error('Erreur export financier projet:', error);
    res.status(500).json(createResponse(false, 'Erreur lors de l\'export du projet', undefined, getErrorMessage(error)));
  }
});

export default router;
