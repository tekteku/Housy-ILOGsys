import { Router } from 'express';
import { ZodError } from 'zod';
import { insertProjectPhaseSchema } from '../../shared/schema.js';
import { storage } from '../storage';
import { ProjectPhase } from '../../shared/schema';

// Helper function to calculate overall project progress
const calculateProjectProgress = (phases: ProjectPhase[]): number => {
  if (!phases || phases.length === 0) {
    return 0;
  }
  const totalProgress = phases.reduce((sum, phase) => sum + (phase.progress || 0), 0);
  return totalProgress / phases.length;
};

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

// GET /api/project-phases/project/:projectId - Obtenir toutes les phases d'un projet
router.get('/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const phases = await storage.getProjectPhasesByProject(projectId);

    res.json({
      message: "Phases du projet récupérées avec succès",
      data: phases
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des phases:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des phases"
    });
  }
});

// GET /api/project-phases/:id - Obtenir une phase par ID
router.get('/:id', async (req, res) => {
  try {
    const phaseId = parseInt(req.params.id);
    if (isNaN(phaseId)) {
      return res.status(400).json({ message: "Invalid phase ID" });
    }
    const phase = await storage.getProjectPhase(phaseId);
    if (!phase) {
      return res.status(404).json({ message: "Project phase not found" });
    }
    res.json({ message: "Phase récupérée avec succès", data: phase });
  } catch (error) {
    console.error('Erreur lors de la récupération de la phase:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la phase"
    });
  }
});

// POST /api/project-phases - Créer une nouvelle phase
router.post('/', validateRequest(insertProjectPhaseSchema), async (req, res) => {
  try {
    const phaseData = {
      ...req.body,
      status: 'pending',
      progressPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newPhase = await storage.createProjectPhase(phaseData);

    res.status(201).json({
      message: "Phase créée avec succès",
      data: newPhase
    });
  } catch (error) {
    console.error('Erreur lors de la création de la phase:', error);
    res.status(500).json({
      message: "Erreur lors de la création de la phase"
    });
  }
});

// POST /api/project-phases/bulk/:projectId - Créer plusieurs phases pour un projet
router.post('/bulk/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { phases } = req.body;
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    if (!Array.isArray(phases) || phases.length === 0) {
      return res.status(400).json({
        message: "Liste de phases requise"
      });
    }

    const createdPhases = [];
    
    for (let i = 0; i < phases.length; i++) {
      const phaseData = {
        ...phases[i],
        projectId,
        order: i + 1,
        status: 'pending',
        progressPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newPhase = await storage.createProjectPhase(phaseData);
      createdPhases.push(newPhase);
    }

    res.status(201).json({
      message: "Phases créées avec succès",
      data: createdPhases
    });
  } catch (error) {
    console.error('Erreur lors de la création des phases:', error);
    res.status(500).json({
      message: "Erreur lors de la création des phases"
    });
  }
});

// PUT /api/project-phases/:id - Mettre à jour une phase
router.put('/:id', validateRequest(insertProjectPhaseSchema.partial()), async (req, res) => {
  try {
    const phaseId = parseInt(req.params.id);
    const phaseData = req.body;

    if (isNaN(phaseId)) {
      return res.status(400).json({ message: "Invalid phase ID" });
    }

    // Remove 'order' if it exists, as it's not a direct field of projectPhase
    if ('order' in phaseData) {
      delete phaseData.order;
    }

    const updatedPhase = await storage.updateProjectPhase(phaseId, phaseData);

    if (!updatedPhase) {
      return res.status(404).json({ message: "Project phase not found" });
    }

    // Update project progress if phase status or progress changes
    if (updatedPhase.activeProjectId && (phaseData.status || phaseData.progress !== undefined)) {
      const allPhases = await storage.getProjectPhasesByProject(updatedPhase.activeProjectId);
      const projectProgress = calculateProjectProgress(allPhases);
      await storage.updateActiveProject(updatedPhase.activeProjectId, {
        progress: projectProgress,
      });
    }

    res.json({ message: "Project phase updated successfully", data: updatedPhase });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la phase:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la phase"
    });
  }
});

// PATCH /api/project-phases/:id/status - Update phase status
router.patch('/:id/status', async (req, res) => {
  try {
    const phaseId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(phaseId)) {
      return res.status(400).json({ message: "Invalid phase ID" });
    }
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedPhase = await storage.updateProjectPhase(phaseId, { status });

    if (!updatedPhase) {
      return res.status(404).json({ message: "Project phase not found or no changes made" });
    }
    
    // Update project progress
    if (updatedPhase.activeProjectId) {
      const allPhases = await storage.getProjectPhasesByProject(updatedPhase.activeProjectId);
      const projectProgress = calculateProjectProgress(allPhases);
      await storage.updateActiveProject(updatedPhase.activeProjectId, {
        progress: projectProgress,
      });
    }

    res.json({ message: `Project phase status updated to ${status}`, data: updatedPhase });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut"
    });
  }
});

// PUT /api/project-phases/:id/progress - Mettre à jour le progrès d'une phase
router.put('/:id/progress', async (req, res) => {
  try {
    const phaseId = parseInt(req.params.id);
    const { progressPercentage } = req.body;
    
    if (isNaN(phaseId)) {
      return res.status(400).json({
        message: "ID de phase invalide"
      });
    }

    if (progressPercentage === undefined || progressPercentage < 0 || progressPercentage > 100) {
      return res.status(400).json({
        message: "Pourcentage de progrès invalide (0-100)"
      });
    }

    const updateData: any = {
      progressPercentage,
      updatedAt: new Date()
    };

    if (progressPercentage === 100) {
      updateData.status = 'completed';
      updateData.endDate = new Date();
    } else if (progressPercentage > 0 && progressPercentage < 100) {
      updateData.status = 'in_progress';
      if (!updateData.startDate) {
        updateData.startDate = new Date();
      }
    }

    const updatedPhase = await storage.updateProjectPhase(phaseId, updateData);

    if (!updatedPhase) {
      return res.status(404).json({
        message: "Phase non trouvée"
      });
    }

    res.json({
      message: "Progrès de la phase mis à jour avec succès",
      data: updatedPhase
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du progrès:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du progrès"
    });
  }
});

// PUT /api/project-phases/reorder/:projectId - Réorganiser l'ordre des phases
router.put('/reorder/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { phaseOrders } = req.body; // Array of { phaseId, order }
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    if (!Array.isArray(phaseOrders)) {
      return res.status(400).json({
        message: "Ordre des phases requis"
      });
    }

    const updatedPhases = [];
    
    for (const { phaseId, order } of phaseOrders) {
      const updatedPhase = await storage.updateProjectPhase(phaseId, {
        phaseNumber: order, // Corrected field name
      });
      if (updatedPhase) {
        updatedPhases.push(updatedPhase);
      }
    }

    res.json({
      message: "Ordre des phases mis à jour avec succès",
      data: updatedPhases
    });
  } catch (error) {
    console.error('Erreur lors de la réorganisation des phases:', error);
    res.status(500).json({
      message: "Erreur lors de la réorganisation des phases"
    });
  }
});

// POST /api/project-phases/:id/start - Démarrer une phase
router.post('/:id/start', async (req, res) => {
  try {
    const phaseId = parseInt(req.params.id);
    
    if (isNaN(phaseId)) {
      return res.status(400).json({
        message: "ID de phase invalide"
      });
    }

    const updateData = {
      status: 'in_progress',
      startDate: new Date(),
      updatedAt: new Date()
    };

    const updatedPhase = await storage.updateProjectPhase(phaseId, updateData);

    if (!updatedPhase) {
      return res.status(404).json({
        message: "Phase non trouvée"
      });
    }

    res.json({
      message: "Phase démarrée avec succès",
      data: updatedPhase
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de la phase:', error);
    res.status(500).json({
      message: "Erreur lors du démarrage de la phase"
    });
  }
});

// POST /api/project-phases/:id/complete - Marquer une phase comme terminée
router.post('/:id/complete', async (req, res) => {
  try {
    const phaseId = parseInt(req.params.id);
    const { completionNotes } = req.body;
    
    if (isNaN(phaseId)) {
      return res.status(400).json({
        message: "ID de phase invalide"
      });
    }

    const updateData = {
      status: 'completed',
      endDate: new Date(),
      progressPercentage: 100,
      completionNotes: completionNotes || '',
      updatedAt: new Date()
    };

    const updatedPhase = await storage.updateProjectPhase(phaseId, updateData);

    if (!updatedPhase) {
      return res.status(404).json({
        message: "Phase non trouvée"
      });
    }

    // Update project progress
    if (updatedPhase.activeProjectId) { // Corrected field name
      const allPhases = await storage.getProjectPhasesByProject(updatedPhase.activeProjectId); // Corrected field name
      const completedPhases = allPhases.filter(phase => phase.status === 'completed').length;
      const totalPhases = allPhases.length;
      const projectProgress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

      await storage.updateActiveProject(updatedPhase.activeProjectId, { // Corrected field name
        progress: projectProgress, // Corrected field name
      });
    }

    res.json({
      message: "Phase marquée comme terminée avec succès",
      data: updatedPhase
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation de la phase:', error);
    res.status(500).json({
      message: "Erreur lors de la finalisation de la phase"
    });
  }
});

// DELETE /api/project-phases/:id - Supprimer une phase
router.delete('/:id', async (req, res) => {
  try {
    const phaseId = parseInt(req.params.id);
    
    if (isNaN(phaseId)) {
      return res.status(400).json({
        message: "ID de phase invalide"
      });
    }

    const deleted = await storage.deleteProjectPhase(phaseId);

    if (!deleted) {
      return res.status(404).json({
        message: "Phase non trouvée"
      });
    }

    res.json({
      message: "Phase supprimée avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la phase:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la phase"
    });
  }
});

export default router;
