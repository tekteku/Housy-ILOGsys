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

export default router;
