import { Router } from 'express';
import { ZodError } from 'zod';
import { insertProjectUpdateSchema } from '../../shared/schema.js';
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

// GET /api/project-updates/project/:projectId - Obtenir toutes les mises à jour d'un projet
router.get('/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const updates = await storage.getProjectUpdatesByProject(
      projectId,
      {},
      sortBy as string,
      sortOrder as 'asc' | 'desc',
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      message: "Mises à jour du projet récupérées avec succès",
      data: updates
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des mises à jour:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des mises à jour"
    });
  }
});

// GET /api/project-updates/:id - Obtenir une mise à jour par ID
router.get('/:id', async (req, res) => {
  try {
    const updateId = parseInt(req.params.id);
    
    if (isNaN(updateId)) {
      return res.status(400).json({
        message: "ID de mise à jour invalide"
      });
    }

    const update = await storage.getProjectUpdate(updateId);

    if (!update) {
      return res.status(404).json({
        message: "Mise à jour non trouvée"
      });
    }

    res.json({
      message: "Mise à jour récupérée avec succès",
      data: update
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la mise à jour:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la mise à jour"
    });
  }
});

// POST /api/project-updates - Créer une nouvelle mise à jour
router.post('/', validateRequest(insertProjectUpdateSchema), async (req, res) => {
  try {
    const updateData: any = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newUpdate = await storage.createProjectUpdate(updateData);

    res.status(201).json({
      message: "Mise à jour créée avec succès",
      data: newUpdate
    });
  } catch (error) {
    console.error('Erreur lors de la création de la mise à jour:', error);
    res.status(500).json({
      message: "Erreur lors de la création de la mise à jour"
    });
  }
});

// POST /api/project-updates/quick/:projectId - Créer une mise à jour rapide
router.post('/quick/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { title, description, updateType = 'progress', isVisible = true } = req.body;
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    if (!title || !description) {
      return res.status(400).json({
        message: "Titre et description requis"
      });
    }    const updateData: any = {
      projectId,
      title,
      description,
      updateType,
      isVisible,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newUpdate = await storage.createProjectUpdate(updateData);

    res.status(201).json({
      message: "Mise à jour rapide créée avec succès",
      data: newUpdate
    });
  } catch (error) {
    console.error('Erreur lors de la création de la mise à jour rapide:', error);
    res.status(500).json({
      message: "Erreur lors de la création de la mise à jour rapide"
    });
  }
});

// PUT /api/project-updates/:id - Mettre à jour une mise à jour
router.put('/:id', async (req, res) => {
  try {
    const updateId = parseInt(req.params.id);
    
    if (isNaN(updateId)) {
      return res.status(400).json({
        message: "ID de mise à jour invalide"
      });
    }    const updateData: any = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedUpdate = await storage.updateProjectUpdate(updateId, updateData);

    if (!updatedUpdate) {
      return res.status(404).json({
        message: "Mise à jour non trouvée"
      });
    }

    res.json({
      message: "Mise à jour modifiée avec succès",
      data: updatedUpdate
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la mise à jour:', error);
    res.status(500).json({
      message: "Erreur lors de la modification de la mise à jour"
    });
  }
});

// PUT /api/project-updates/:id/visibility - Changer la visibilité d'une mise à jour
router.put('/:id/visibility', async (req, res) => {
  try {
    const updateId = parseInt(req.params.id);
    const { isVisible } = req.body;
    
    if (isNaN(updateId)) {
      return res.status(400).json({
        message: "ID de mise à jour invalide"
      });
    }

    if (typeof isVisible !== 'boolean') {
      return res.status(400).json({
        message: "Visibilité requise (boolean)"
      });
    }    const updateData: any = {
      isVisible,
      updatedAt: new Date()
    };

    const updatedUpdate = await storage.updateProjectUpdate(updateId, updateData);

    if (!updatedUpdate) {
      return res.status(404).json({
        message: "Mise à jour non trouvée"
      });
    }

    res.json({
      message: "Visibilité de la mise à jour modifiée avec succès",
      data: updatedUpdate
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la visibilité:', error);
    res.status(500).json({
      message: "Erreur lors de la modification de la visibilité"
    });
  }
});

// GET /api/project-updates/recent - Obtenir les mises à jour récentes (tous projets)
router.get('/recent', async (req, res) => {
  try {
    const { limit = 20, days = 7 } = req.query;
    
    const filters = {
      createdAfter: new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000)
    };    // For recent updates across all projects, return empty for now
    // TODO: Implement proper cross-project recent updates
    const updates: any[] = [];

    res.json({
      message: "Mises à jour récentes récupérées avec succès",
      data: updates
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des mises à jour récentes:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des mises à jour récentes"
    });
  }
});

// GET /api/project-updates/public/project/:projectId - Obtenir les mises à jour publiques d'un projet
router.get('/public/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { page = 1, limit = 10 } = req.query;
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const filters = { isVisible: true };
    const updates = await storage.getProjectUpdatesByProject(
      projectId,
      filters,
      'createdAt',
      'desc',
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      message: "Mises à jour publiques récupérées avec succès",
      data: updates
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des mises à jour publiques:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des mises à jour publiques"
    });
  }
});

// GET /api/project-updates/feed/project/:projectId - Obtenir le feed de mises à jour pour un projet
router.get('/feed/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    // Get project updates
    const updates = await storage.getProjectUpdatesByProject(projectId, {}, 'createdAt', 'desc', 1, 20);

    // Get project phases updates
    const phases = await storage.getProjectPhasesByProject(projectId);

    // Get recent payments
    const payments = await storage.getPaymentsByProject(projectId);    const recentPayments = payments
      .filter(payment => payment.paidDate && 
        new Date(payment.paidDate).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000)
      .slice(0, 5);

    // Combine all feed items
    const feedItems = [
      ...updates.map(update => ({
        type: 'update',
        date: update.createdAt,
        title: update.title,
        description: update.description,
        data: update
      })),      ...phases
        .filter(phase => phase.status === 'completed' && phase.actualEndDate)
        .map(phase => ({
          type: 'phase_completed',
          date: phase.actualEndDate,
          title: `Phase terminée: ${phase.name}`,
          description: phase.description || `La phase ${phase.name} a été terminée avec succès.`,
          data: phase
        })),...recentPayments.map(payment => ({
        type: 'payment',
        date: payment.paidDate,
        title: `Paiement reçu: ${payment.amount} DT`,
        description: payment.description || `Paiement de ${payment.amount} DT reçu pour le projet.`,
        data: payment
      }))
    ].sort((a, b) => {
      const dateA = new Date(a.date || new Date());
      const dateB = new Date(b.date || new Date());
      return dateB.getTime() - dateA.getTime();
    });

    res.json({
      message: "Feed de mises à jour récupéré avec succès",
      data: feedItems
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du feed:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération du feed"
    });
  }
});

// POST /api/project-updates/:id/pin - Épingler une mise à jour
router.post('/:id/pin', async (req, res) => {
  try {
    const updateId = parseInt(req.params.id);
    
    if (isNaN(updateId)) {
      return res.status(400).json({
        message: "ID de mise à jour invalide"
      });
    }    const updateData: any = {
      isPinned: true,
      updatedAt: new Date()
    };

    const updatedUpdate = await storage.updateProjectUpdate(updateId, updateData);

    if (!updatedUpdate) {
      return res.status(404).json({
        message: "Mise à jour non trouvée"
      });
    }

    res.json({
      message: "Mise à jour épinglée avec succès",
      data: updatedUpdate
    });
  } catch (error) {
    console.error('Erreur lors de l\'épinglage de la mise à jour:', error);
    res.status(500).json({
      message: "Erreur lors de l\'épinglage de la mise à jour"
    });
  }
});

// POST /api/project-updates/:id/unpin - Désépingler une mise à jour
router.post('/:id/unpin', async (req, res) => {
  try {
    const updateId = parseInt(req.params.id);
    
    if (isNaN(updateId)) {
      return res.status(400).json({
        message: "ID de mise à jour invalide"
      });
    }    const updateData: any = {
      isPinned: false,
      updatedAt: new Date()
    };

    const updatedUpdate = await storage.updateProjectUpdate(updateId, updateData);

    if (!updatedUpdate) {
      return res.status(404).json({
        message: "Mise à jour non trouvée"
      });
    }

    res.json({
      message: "Mise à jour désépinglée avec succès",
      data: updatedUpdate
    });
  } catch (error) {
    console.error('Erreur lors du désépinglage de la mise à jour:', error);
    res.status(500).json({
      message: "Erreur lors du désépinglage de la mise à jour"
    });
  }
});

// DELETE /api/project-updates/:id - Supprimer une mise à jour
router.delete('/:id', async (req, res) => {
  try {
    const updateId = parseInt(req.params.id);
    
    if (isNaN(updateId)) {
      return res.status(400).json({
        message: "ID de mise à jour invalide"
      });
    }

    const deleted = await storage.deleteProjectUpdate(updateId);

    if (!deleted) {
      return res.status(404).json({
        message: "Mise à jour non trouvée"
      });
    }

    res.json({
      message: "Mise à jour supprimée avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la mise à jour:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la mise à jour"
    });
  }
});

export default router;
