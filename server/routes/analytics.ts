import { Router } from 'express';
import moment from 'moment';
import { 
  db, 
  projects as projectsTable, 
  users as usersTable, 
  financialTransactions, 
  materials as materialsTable,
  // Extended schema imports
  activeProjects,
  clientRequests,
  quotations,
  projectPhases,
  projectUpdates,
  payments,
  enhancedNotifications,
  projectCategories,
  count, 
  eq, 
  gte, 
  lte, 
  desc, 
  asc, 
  and 
} from '../storage';
import { storage } from '../storage';
import { reportService } from '../services/report-service';

// Types for better type safety
interface AnalyticsRequest {
  period?: string;
  groupBy?: string;
  category?: string;
  supplier?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  format?: string;
}

interface AnalyticsResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  generatedAt: Date;
}

// Helper function for consistent response format
const createResponse = <T>(
  success: boolean, 
  message: string, 
  data?: T, 
  error?: string
): AnalyticsResponse<T> => ({
  success,
  message,
  data,
  error,
  generatedAt: new Date()
});

// Helper function for date range calculation
const calculateDateRange = (period: string): { startDate: Date; endDate: Date } => {
  const endDate = moment();
  let startDate = moment();
  
  switch (period) {
    case '7days':
      startDate = moment().subtract(7, 'days');
      break;
    case '30days':
      startDate = moment().subtract(30, 'days');
      break;
    case '90days':
      startDate = moment().subtract(90, 'days');
      break;
    case '3months':
      startDate = moment().subtract(3, 'months');
      break;
    case '6months':
      startDate = moment().subtract(6, 'months');
      break;
    case '1year':
      startDate = moment().subtract(1, 'year');
      break;
    case '12months':
      startDate = moment().subtract(12, 'months');
      break;
    default:
      startDate = moment().subtract(30, 'days');
  }
  
  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate()
  };
};

const router = Router();

// GET /api/analytics/dashboard - Tableau de bord principal
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '30days' } = req.query as AnalyticsRequest;
    
    // Calculer les dates avec moment.js
    const { startDate, endDate } = calculateDateRange(period);
    
    // Exécuter toutes les requêtes en parallèle pour optimiser les performances
    const [
      totalProjectsResult,
      activeProjectsResult,
      totalUsersResult,
      recentTransactions
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(projectsTable),
      
      db
        .select({ count: count() })
        .from(projectsTable)
        .where(eq(projectsTable.status, 'active')),
      
      db
        .select({ count: count() })
        .from(usersTable),
      
      db
        .select()
        .from(financialTransactions)
        .where(gte(financialTransactions.createdAt, startDate))
        .orderBy(desc(financialTransactions.createdAt))
        .limit(10)
    ]);

    // Calculs financiers sécurisés avec types explicites
    const totalRevenue = (recentTransactions as any[])
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + (parseFloat(t.amount.toString()) || 0), 0);

    const totalExpenses = (recentTransactions as any[])
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + (parseFloat(t.amount.toString()) || 0), 0);

    const dashboardData = {
      overview: {
        totalProjects: totalProjectsResult[0]?.count || 0,
        activeProjects: activeProjectsResult[0]?.count || 0,
        totalUsers: totalUsersResult[0]?.count || 0,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round((totalRevenue - totalExpenses) * 100) / 100
      },
      recentTransactions: recentTransactions.slice(0, 5),
      period,
      dateRange: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD')
      }
    };

    res.json(createResponse(true, "Données du tableau de bord récupérées avec succès", dashboardData));
  } catch (error) {
    console.error('Erreur lors de la génération du tableau de bord:', error);
    res.status(500).json(createResponse(
      false, 
      "Erreur lors de la génération du tableau de bord",
      undefined,
      error instanceof Error ? error.message : 'Erreur inconnue'
    ));
  }
});

// GET /api/analytics/projects - Analyses des projets
router.get('/projects', async (req, res) => {
  try {
        const { period = '6months', groupBy = 'month' } = req.query as AnalyticsRequest;
    
    const { startDate, endDate } = calculateDateRange(period);    // Récupérer les projets avec gestion d'erreur
    const projects = await db
      .select()
      .from(projectsTable)
      .where(gte(projectsTable.createdAt, startDate))
      .orderBy(asc(projectsTable.createdAt));

    if (!projects || projects.length === 0) {
      return res.json(createResponse(
        true, 
        "Aucun projet trouvé pour cette période", 
        {
          projectsByStatus: {},
          projectsByPeriod: [],
          totalProjects: 0,
          averageProjectsPerMonth: 0,
          period,
          groupBy
        }
      ));
    }    // Grouper par statut avec validation
    const projectsByStatus = (projects as any[]).reduce((acc: Record<string, number>, project: any) => {
      const status = project.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Grouper par période avec moment.js
    const projectsByPeriod = (projects as any[]).reduce((acc: any, project: any) => {
      const date = moment(project.createdAt);
      const key = groupBy === 'month' 
        ? date.format('YYYY-MM')
        : date.format('YYYY-MM-DD');
      
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Calculer la moyenne mensuelle
    const monthsDiff = moment(endDate).diff(moment(startDate), 'months') || 1;
    const averageProjectsPerMonth = Math.round((projects.length / monthsDiff) * 100) / 100;

    const analyticsData = {
      projectsByStatus: Object.entries(projectsByStatus).map(([status, count]) => ({
        status,
        count
      })),
      projectsByPeriod: Object.entries(projectsByPeriod)
        .map(([period, count]) => ({
          period,
          count
        }))
        .sort((a, b) => a.period.localeCompare(b.period)),
      totalProjects: projects.length,
      averageProjectsPerMonth,
      period,
      groupBy,
      dateRange: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD')
      }
    };

    res.json(createResponse(true, "Analyses des projets récupérées avec succès", analyticsData));
  } catch (error) {
    console.error('Erreur lors de l\'analyse des projets:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de l'analyse des projets",
      undefined,
      error instanceof Error ? error.message : 'Erreur inconnue'
    ));
  }
});

// GET /api/analytics/materials - Analyses des matériaux
router.get('/materials', async (req, res) => {
  try {    const { category, supplier } = req.query as AnalyticsRequest;
    
    // Build query conditions
    const conditions = [];
    if (category && typeof category === 'string') {
      conditions.push(eq(materialsTable.category, category));
    }
    if (supplier && typeof supplier === 'string') {
      conditions.push(eq(materialsTable.supplier, supplier));
    }

    const materials = conditions.length > 0 
      ? await db.select().from(materialsTable).where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : await db.select().from(materialsTable);

    if (!materials || materials.length === 0) {
      return res.json(createResponse(
        true,
        "Aucun matériau trouvé",
        {
          materialsByCategory: [],
          priceDistribution: [],
          expensiveMaterials: [],
          totalMaterials: 0,
          averagePrice: 0,
          filters: { category, supplier }
        }
      ));
    }    // Grouper par catégorie avec validation
    const materialsByCategory = (materials as any[]).reduce((acc: Record<string, number>, material: any) => {
      const cat = material.category || 'Non catégorisé';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Distribution des prix avec gestion d'erreur
    const priceRanges = {
      '0-100': 0,
      '101-500': 0,
      '501-1000': 0,
      '1000+': 0
    };

    (materials as any[]).forEach((material: any) => {
      const price = parseFloat(material.price?.toString() || '0');
      if (isNaN(price)) return;
      
      if (price <= 100) priceRanges['0-100']++;
      else if (price <= 500) priceRanges['101-500']++;
      else if (price <= 1000) priceRanges['501-1000']++;
      else priceRanges['1000+']++;
    });

    // Top 10 matériaux les plus chers avec validation
    const expensiveMaterials = (materials as any[])
      .filter((m: any) => !isNaN(parseFloat(m.price?.toString() || '0')))
      .sort((a: any, b: any) => parseFloat(b.price.toString()) - parseFloat(a.price.toString()))
      .slice(0, 10)
      .map((material: any) => ({
        ...material,
        price: Math.round(parseFloat(material.price.toString()) * 100) / 100
      }));

    // Calcul du prix moyen
    const validPrices = (materials as any[])
      .map((m: any) => parseFloat(m.price?.toString() || '0'))
      .filter((price: number) => !isNaN(price));
    
    const averagePrice = validPrices.length > 0 
      ? Math.round((validPrices.reduce((sum: number, p: number) => sum + p, 0) / validPrices.length) * 100) / 100
      : 0;

    const analyticsData = {
      materialsByCategory: Object.entries(materialsByCategory).map(([category, count]) => ({
        category,
        count
      })),
      priceDistribution: Object.entries(priceRanges).map(([range, count]) => ({
        range,
        count
      })),
      expensiveMaterials,
      totalMaterials: materials.length,
      averagePrice,
      filters: { category, supplier }
    };

    res.json(createResponse(true, "Analyses des matériaux récupérées avec succès", analyticsData));
  } catch (error) {
    console.error('Erreur lors de l\'analyse des matériaux:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de l'analyse des matériaux",
      undefined,
      error instanceof Error ? error.message : 'Erreur inconnue'
    ));
  }
});

// GET /api/analytics/financial - Analyses financières
router.get('/financial', async (req, res) => {
  try {
    const { period = '12months', projectId } = req.query as AnalyticsRequest;
    
    // Utiliser moment.js pour calculer les dates
    const { startDate, endDate } = calculateDateRange(period);    // Construction de la requête avec validation
    const conditions = [gte(financialTransactions.createdAt, startDate)];
    
    if (projectId && !isNaN(parseInt(projectId))) {
      conditions.push(eq(financialTransactions.projectId, parseInt(projectId)));
    }

    const transactions = await db
      .select()
      .from(financialTransactions)
      .where(and(...conditions))
      .orderBy(asc(financialTransactions.createdAt));

    if (!transactions || transactions.length === 0) {
      return res.json(createResponse(
        true,
        "Aucune transaction trouvée pour cette période",
        {
          monthlyAnalytics: [],
          summary: {
            totalIncome: 0,
            totalExpenses: 0,
            netProfit: 0,
            profitMargin: 0
          },
          transactionCount: 0,
          period,
          projectId,
          dateRange: {
            startDate: moment(startDate).format('YYYY-MM-DD'),
            endDate: moment(endDate).format('YYYY-MM-DD')
          }
        }
      ));
    }    // Revenus et dépenses par mois avec moment.js et validation
    const monthlyData = (transactions as any[]).reduce((acc: any, transaction: any) => {
      if (!transaction.createdAt || !transaction.amount || !transaction.type) {
        return acc;
      }

      const month = moment(transaction.createdAt).format('YYYY-MM');
      const amount = parseFloat(transaction.amount.toString());
      
      if (isNaN(amount)) return acc;
      
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[month].income += amount;
      } else if (transaction.type === 'expense') {
        acc[month].expenses += amount;
      }
      
      return acc;
    }, {});

    const monthlyAnalytics = Object.entries(monthlyData)
      .map(([month, data]: [string, any]) => ({
        month,
        income: Math.round(data.income * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100,
        profit: Math.round((data.income - data.expenses) * 100) / 100
      }))
      .sort((a, b) => a.month.localeCompare(b.month));    // Calculs des totaux avec validation
    const validTransactions = (transactions as any[]).filter((t: any) => 
      t.amount && !isNaN(parseFloat(t.amount.toString())) && t.type
    );

    const totalIncome = validTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

    const totalExpenses = validTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    const analyticsData = {
      monthlyAnalytics,
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100
      },
      transactionCount: transactions.length,
      validTransactionCount: validTransactions.length,
      period,
      projectId,
      dateRange: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD')
      }
    };

    res.json(createResponse(true, "Analyses financières récupérées avec succès", analyticsData));
  } catch (error) {
    console.error('Erreur lors de l\'analyse financière:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de l'analyse financière",
      undefined,
      error instanceof Error ? error.message : 'Erreur inconnue'
    ));
  }
});

// GET /api/analytics/reports/:type - Générer des rapports spécifiques
router.get('/reports/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { projectId, startDate, endDate, format = 'json' } = req.query;

    // Validation du type de rapport
    const validTypes = ['project-summary', 'financial-statement', 'materials-usage'];
    if (!validTypes.includes(type)) {
      return res.status(400).json(createResponse(
        false,
        "Type de rapport non supporté",
        undefined,
        `Types disponibles: ${validTypes.join(', ')}`
      ));
    }

    let reportData;
    const requestData = {
      type,
      projectId: projectId ? parseInt(projectId as string) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
      format: format as string
    };

    switch (type) {
      case 'project-summary':
        if (!projectId || isNaN(parseInt(projectId as string))) {
          return res.status(400).json(createResponse(
            false,
            "ID de projet requis et valide pour ce type de rapport"
          ));
        }
        
        // Obtenir le projet via le service storage
        const project = await storage.getProject(parseInt(projectId as string));
        
        if (!project) {
          return res.status(404).json(createResponse(
            false,
            "Projet non trouvé"
          ));
        }

        // Récupérer les données associées via le service storage
        const [activities, materials, transactions] = await Promise.all([
          storage.getTasks(parseInt(projectId as string)), // Using tasks instead of activities
          storage.getMaterials(), // Will need to filter by project later
          storage.getFinancialTransactions(parseInt(projectId as string))
        ]);

        reportData = {
          project,
          statistics: {
            totalActivities: activities.length,
            completedActivities: activities.filter((a: any) => a.status === 'completed').length,
            totalMaterials: materials.filter((m: any) => m.projectId === parseInt(projectId as string)).length,
            totalTransactions: transactions.length,
            projectProgress: project.progress || 0
          },
          activities,
          materials: materials.filter((m: any) => m.projectId === parseInt(projectId as string)),
          financialSummary: {
            totalIncome: transactions
              .filter((t: any) => t.type === 'income')
              .reduce((sum: number, t: any) => sum + parseFloat(t.amount?.toString() || '0'), 0),
            totalExpenses: transactions
              .filter((t: any) => t.type === 'expense')
              .reduce((sum: number, t: any) => sum + parseFloat(t.amount?.toString() || '0'), 0)
          }
        };
        break;      case 'financial-statement':
        const { startDate: reqStartDate, endDate: reqEndDate } = calculateDateRange(
          startDate as string || '30days'
        );
        
        // Obtenir toutes les transactions et filtrer
        const allTransactions = projectId && !isNaN(parseInt(projectId as string))
          ? await storage.getFinancialTransactions(parseInt(projectId as string))
          : await storage.getFinancialTransactions();

        // Filtrer par date
        const financialTransactions = allTransactions.filter((t: any) => {
          const transactionDate = new Date(t.transactionDate || t.createdAt);
          const isAfterStart = transactionDate >= reqStartDate;
          const isBeforeEnd = !reqEndDate || transactionDate <= reqEndDate;
          return isAfterStart && isBeforeEnd;
        });

        reportData = {
          period: {
            startDate: moment(reqStartDate).format('YYYY-MM-DD'),
            endDate: reqEndDate ? moment(reqEndDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
          },
          transactions: financialTransactions,
          summary: {
            totalIncome: financialTransactions
              .filter((t: any) => t.type === 'income')
              .reduce((sum: number, t: any) => sum + parseFloat(t.amount?.toString() || '0'), 0),
            totalExpenses: financialTransactions
              .filter((t: any) => t.type === 'expense')
              .reduce((sum: number, t: any) => sum + parseFloat(t.amount?.toString() || '0'), 0),
            transactionCount: financialTransactions.length
          }
        };
        break;

      case 'materials-usage':
        const allMaterials = await storage.getMaterials();
        const materialsData = projectId && !isNaN(parseInt(projectId as string))
          ? allMaterials.filter((m: any) => m.projectId === parseInt(projectId as string))
          : allMaterials;
        
        reportData = {
          materials: materialsData,
          summary: {
            totalMaterials: materialsData.length,
            totalQuantity: materialsData.reduce((sum: number, m: any) => sum + (m.quantity || 0), 0),
            totalValue: materialsData.reduce((sum: number, m: any) => sum + (parseFloat(m.unitPrice?.toString() || '0') * (m.quantity || 0)), 0),
            averageUnitPrice: materialsData.length > 0
              ? materialsData.reduce((sum: number, m: any) => sum + parseFloat(m.unitPrice?.toString() || '0'), 0) / materialsData.length
              : 0
          },
          projectId: projectId ? parseInt(projectId as string) : null
        };
        break;
    }

    const responseData = {
      ...reportData,
      metadata: {
        type,
        format: format as string,
        generatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        requestParameters: requestData
      }
    };

    res.json(createResponse(
      true,
      `Rapport ${type} généré avec succès`,
      responseData
    ));
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    res.status(500).json(createResponse(
      false,
      "Erreur lors de la génération du rapport",
      undefined,
      error instanceof Error ? error.message : 'Erreur inconnue'
    ));
  }
});

// GET /api/analytics/kpis - Indicateurs clés de performance
router.get('/kpis', async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (period === '30days' ? 30 : 90));

    // Obtenir tous les projets via le service storage
    const allProjects = await storage.getProjects();
    
    // Calculer les KPIs de base
    const totalProjects = allProjects.length;
    const completedProjects = allProjects.filter((p: any) => p.status === 'completed').length;
    
    // Calculer les projets livrés à temps
    const onTimeProjects = allProjects.filter((p: any) => {
      if (p.status !== 'completed' || !p.endDate || !p.actualEndDate) return false;
      const plannedEnd = new Date(p.endDate);
      const actualEnd = new Date(p.actualEndDate);
      return actualEnd <= plannedEnd;
    }).length;

    // Calculs des KPIs avec validation
    const projectCompletionRate = totalProjects > 0 
      ? (completedProjects / totalProjects) * 100 
      : 0;

    const onTimeDeliveryRate = completedProjects > 0 
      ? (onTimeProjects / completedProjects) * 100 
      : 0;

    // Obtenir les statistiques financières pour la période
    const allTransactions = await storage.getFinancialTransactions();
    const periodTransactions = allTransactions.filter((t: any) => {
      const transactionDate = new Date(t.transactionDate || t.createdAt);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const periodRevenue = periodTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount?.toString() || '0'), 0);

    const periodExpenses = periodTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount?.toString() || '0'), 0);

    const periodProfit = periodRevenue - periodExpenses;
    const profitMargin = periodRevenue > 0 ? (periodProfit / periodRevenue) * 100 : 0;

    // Statistiques générées avec succès
    res.json({
      success: true,
      data: {
        revenue: periodRevenue,
        expenses: periodExpenses,
        profit: periodProfit,
        margin: profitMargin
      }
    });
  } catch (error) {
    console.error('Erreur analytics financiers:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors des analytics financiers"
    });
  }
});

// ===================== ADMIN ANALYTICS ENDPOINTS (RESTful) =====================
// GET /api/analytics/realtime - Real-time admin analytics (active users, recent activity, etc.)
router.get('/realtime', async (req, res) => {
  try {
    // Use recent activity logs to estimate active users in the last 10 minutes
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    // Get recent activities (last 100 for safety)
    const recentActivities = await storage.getRecentActivities(100);
    // Count unique userIds active in the last 10 minutes
    const activeUserIds = new Set(
      recentActivities
        .filter(a => a.timestamp && new Date(a.timestamp) >= tenMinutesAgo && a.userId)
        .map(a => a.userId)
    );
    // Recent projects (last 5)
    const projects = await storage.getProjects();
    const recentProjects = projects.slice(0, 5);
    res.json(createResponse(true, 'Données analytiques temps réel récupérées', {
      activeUsers: activeUserIds.size,
      recentActivities: recentActivities.slice(0, 10),
      recentProjects
    }));
  } catch (error) {
    console.error('Erreur analytics temps réel:', error);
    res.status(500).json(createResponse(false, 'Erreur lors des analytics temps réel', undefined, error instanceof Error ? error.message : 'Erreur inconnue'));
  }
});

// GET /api/analytics (with ?range=12months) - Admin analytics with range param
router.get('/', async (req, res) => {
  try {
    const { range = '12months' } = req.query;
    const { startDate, endDate } = calculateDateRange(range as string);
    // Example: project and user stats for the period
    const projects = await db.select().from(projectsTable).where(gte(projectsTable.createdAt, startDate));
    const users = await db.select().from(usersTable).where(gte(usersTable.createdAt, startDate));
    // Financials for the period
    const transactions = await db.select().from(financialTransactions).where(gte(financialTransactions.createdAt, startDate));
    const totalRevenue = (transactions as any[]).filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + (parseFloat(t.amount.toString()) || 0), 0);
    const totalExpenses = (transactions as any[]).filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + (parseFloat(t.amount.toString()) || 0), 0);
    res.json(createResponse(true, 'Données analytiques admin récupérées', {
      totalProjects: projects.length,
      totalUsers: users.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netProfit: Math.round((totalRevenue - totalExpenses) * 100) / 100,
      range,
      dateRange: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD')
      }
    }));
  } catch (error) {
    console.error('Erreur analytics admin:', error);
    res.status(500).json(createResponse(false, 'Erreur lors des analytics admin', undefined, error instanceof Error ? error.message : 'Erreur inconnue'));
  }
});

export default router;
