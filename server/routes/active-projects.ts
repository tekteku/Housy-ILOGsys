import { Router } from 'express';
import { ZodError } from 'zod';
import { insertActiveProjectSchema } from '../../shared/schema.js';
import { storage } from '../storage';

const router = Router();

// Middleware de validation Zod
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

// GET /api/active-projects - Obtenir tous les projets actifs
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'startDate', sortOrder = 'desc' } = req.query;
    
    const filters: any = {};
    if (status && status !== 'all') {
      filters.status = status as string;
    }

    const projects = await storage.getAllActiveProjects(
      filters,
      sortBy as string,
      sortOrder as 'asc' | 'desc',
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      message: "Projets actifs récupérés avec succès",
      data: projects
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets actifs:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des projets actifs"
    });
  }
});

// GET /api/active-projects/:id - Obtenir un projet actif par ID
router.get('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }    const project = await storage.getActiveProject(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Projet actif non trouvé"
      });
    }

    res.json({
      message: "Projet actif récupéré avec succès",
      data: project
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du projet actif:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération du projet actif"
    });
  }
});

// GET /api/active-projects/:id/dashboard - Obtenir le tableau de bord d'un projet
router.get('/:id/dashboard', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }    // Get project details
    const project = await storage.getActiveProject(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Projet actif non trouvé"
      });
    }

    // Get project phases
    const phases = await storage.getProjectPhasesByProject(projectId);

    // Get recent updates
    const updates = await storage.getProjectUpdatesByProject(projectId, {}, 'createdAt', 'desc', 1, 5);

    // Get payment status
    const payments = await storage.getPaymentsByProject(projectId);

    // Calculate progress
    const completedPhases = phases.filter(phase => phase.status === 'completed').length;
    const totalPhases = phases.length;
    const progressPercentage = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

    const dashboard = {
      project,
      phases,
      recentUpdates: updates,
      payments,
      progress: {
        completedPhases,
        totalPhases,
        percentage: Math.round(progressPercentage)
      },      financials: {
        totalBudget: project.contractValue,        totalPaid: payments.reduce((sum, payment) => 
          payment.status === 'paid' ? sum + Number(payment.amount) : sum, 0),
        pendingPayments: payments.filter(payment => payment.status === 'pending').length
      }
    };

    res.json({
      message: "Tableau de bord récupéré avec succès",
      data: dashboard
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération du tableau de bord"
    });
  }
});

// POST /api/active-projects - Créer un nouveau projet actif
router.post('/', validateRequest(insertActiveProjectSchema), async (req, res) => {
  try {    const projectData = {
      ...req.body,
      status: 'planning',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newProject = await storage.createActiveProject(projectData);

    res.status(201).json({
      message: "Projet actif créé avec succès",
      data: newProject
    });
  } catch (error) {
    console.error('Erreur lors de la création du projet actif:', error);
    res.status(500).json({
      message: "Erreur lors de la création du projet actif"
    });
  }
});

// POST /api/active-projects/from-quotation/:quotationId - Créer un projet actif à partir d'un devis accepté
router.post('/from-quotation/:quotationId', async (req, res) => {
  try {
    const quotationId = parseInt(req.params.quotationId);
    const { startDate, estimatedEndDate, additionalNotes } = req.body;
    
    if (isNaN(quotationId)) {
      return res.status(400).json({
        message: "ID de devis invalide"
      });
    }    // Get the quotation
    const quotation = await storage.getQuotation(quotationId);
    if (!quotation) {
      return res.status(404).json({
        message: "Devis non trouvé"
      });
    }

    if (quotation.status !== 'accepted') {
      return res.status(400).json({
        message: "Le devis doit être accepté pour créer un projet"
      });
    }    // Get the client request
    const clientRequest = await storage.getClientRequest(quotation.requestId);
    if (!clientRequest) {
      return res.status(404).json({
        message: "Demande client non trouvée"
      });
    }    // Create active project
    const projectData = {
      projectNumber: `ACT-${Date.now()}`, // Generate unique project number
      quotationId,
      name: clientRequest.title,
      description: clientRequest.description || '',
      clientName: clientRequest.clientName,
      clientPhone: clientRequest.clientPhone,
      clientEmail: clientRequest.clientEmail,
      location: clientRequest.location,
      area: quotation.area,
      contractValue: quotation.finalAmount,
      remainingAmount: quotation.finalAmount,
      startDate: new Date(startDate),
      plannedEndDate: new Date(estimatedEndDate),
      teamLead: 1, // TODO: Set proper team lead from request or user
      projectManager: 1, // TODO: Set proper project manager
      status: 'planning',
      progress: 0
    };

    const newProject = await storage.createActiveProject(projectData);

    res.status(201).json({
      message: "Projet actif créé à partir du devis avec succès",
      data: newProject
    });
  } catch (error) {
    console.error('Erreur lors de la création du projet à partir du devis:', error);
    res.status(500).json({
      message: "Erreur lors de la création du projet à partir du devis"
    });
  }
});

// PUT /api/active-projects/:id - Mettre à jour un projet actif
router.put('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedProject = await storage.updateActiveProject(projectId, updateData);

    if (!updatedProject) {
      return res.status(404).json({
        message: "Projet actif non trouvé"
      });
    }

    res.json({
      message: "Projet actif mis à jour avec succès",
      data: updatedProject
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet actif:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du projet actif"
    });
  }
});

// PUT /api/active-projects/:id/status - Mettre à jour le statut d'un projet
router.put('/:id/status', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Statut requis"
      });
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    };    if (status === 'completed') {
      updateData.actualEndDate = new Date();
      updateData.progress = 100;
    } else if (status === 'on_hold') {
      updateData.onHoldReason = req.body.onHoldReason || '';
    }

    const updatedProject = await storage.updateActiveProject(projectId, updateData);

    if (!updatedProject) {
      return res.status(404).json({
        message: "Projet actif non trouvé"
      });
    }

    res.json({
      message: "Statut du projet mis à jour avec succès",
      data: updatedProject
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut"
    });
  }
});

// PUT /api/active-projects/:id/progress - Mettre à jour le progrès d'un projet
router.put('/:id/progress', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { progress } = req.body;
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        message: "Pourcentage de progrès invalide (0-100)"
      });
    }    const updateData: any = {
      progress,
      updatedAt: new Date()
    };

    if (progress === 100) {
      updateData.status = 'completed';
      updateData.actualEndDate = new Date();
    }

    const updatedProject = await storage.updateActiveProject(projectId, updateData);

    if (!updatedProject) {
      return res.status(404).json({
        message: "Projet actif non trouvé"
      });
    }

    res.json({
      message: "Progrès du projet mis à jour avec succès",
      data: updatedProject
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du progrès:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du progrès"
    });
  }
});

// GET /api/active-projects/:id/timeline - Obtenir la timeline d'un projet
router.get('/:id/timeline', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    // Get project phases
    const phases = await storage.getProjectPhasesByProject(projectId);

    // Get project updates
    const updates = await storage.getProjectUpdatesByProject(projectId);

    // Combine and sort timeline events
    const timelineEvents = [
      ...phases.map(phase => ({
        type: 'phase',
        date: phase.plannedStartDate || phase.createdAt,
        title: `Phase: ${phase.name}`,
        description: phase.description,
        status: phase.status,
        data: phase
      })),
      ...updates.map(update => ({
        type: 'update',
        date: update.createdAt,
        title: update.title,
        description: update.description,
        status: 'info',
        data: update
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      message: "Timeline récupérée avec succès",
      data: timelineEvents
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la timeline:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la timeline"
    });
  }
});

// DELETE /api/active-projects/:id - Supprimer un projet actif
router.delete('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const deleted = await storage.deleteActiveProject(projectId);

    if (!deleted) {
      return res.status(404).json({
        message: "Projet actif non trouvé"
      });
    }

    res.json({
      message: "Projet actif supprimé avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet actif:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression du projet actif"
    });
  }
});

export default router;
