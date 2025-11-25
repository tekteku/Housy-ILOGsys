import { Router } from 'express';
import { ZodError } from 'zod';
import { insertProjectCategorySchema } from '../../shared/schema.js';
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

// GET /api/project-categories - Obtenir toutes les catégories de projets
router.get('/', async (req, res) => {
  try {
    const { 
      isActive, 
      page = 1, 
      limit = 50, 
      sortBy = 'name', 
      sortOrder = 'asc' 
    } = req.query;
    
    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const categories = await storage.getAllProjectCategories(
      filters,
      sortBy as string,
      sortOrder as 'asc' | 'desc',
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      message: "Catégories de projets récupérées avec succès",
      data: categories
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des catégories"
    });
  }
});

// GET /api/project-categories/active - Obtenir seulement les catégories actives
router.get('/active', async (req, res) => {
  try {
    const categories = await storage.getActiveProjectCategories();

    res.json({
      message: "Catégories actives récupérées avec succès",
      data: categories
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories actives:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des catégories actives"
    });
  }
});

// GET /api/project-categories/:id - Obtenir une catégorie par ID
router.get('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
      return res.status(400).json({
        message: "ID de catégorie invalide"
      });
    }

    const category = await storage.getProjectCategory(categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Catégorie non trouvée"
      });
    }

    res.json({
      message: "Catégorie récupérée avec succès",
      data: category
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la catégorie"
    });
  }
});

// POST /api/project-categories - Créer une nouvelle catégorie
router.post('/', validateRequest(insertProjectCategorySchema), async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newCategory = await storage.createProjectCategory(categoryData);

    res.status(201).json({
      message: "Catégorie créée avec succès",
      data: newCategory
    });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({
      message: "Erreur lors de la création de la catégorie"
    });
  }
});

// PUT /api/project-categories/:id - Mettre à jour une catégorie
router.put('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({
        message: "ID de catégorie invalide"
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedCategory = await storage.updateProjectCategory(categoryId, updateData);

    if (!updatedCategory) {
      return res.status(404).json({
        message: "Catégorie non trouvée"
      });
    }

    res.json({
      message: "Catégorie mise à jour avec succès",
      data: updatedCategory
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la catégorie"
    });
  }
});

// PUT /api/project-categories/:id/toggle-status - Activer/désactiver une catégorie
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
      return res.status(400).json({
        message: "ID de catégorie invalide"
      });
    }

    const category = await storage.getProjectCategory(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Catégorie non trouvée"
      });
    }

    const updateData = {
      isActive: !category.isActive,
      updatedAt: new Date()
    };

    const updatedCategory = await storage.updateProjectCategory(categoryId, updateData);

    res.json({
      message: `Catégorie ${updateData.isActive ? 'activée' : 'désactivée'} avec succès`,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({
      message: "Erreur lors du changement de statut"
    });
  }
});

// GET /api/project-categories/:id/projects - Obtenir les projets d'une catégorie
router.get('/:id/projects', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const { page = 1, limit = 10, status } = req.query;
    
    if (isNaN(categoryId)) {
      return res.status(400).json({
        message: "ID de catégorie invalide"
      });
    }

    const filters: any = { categoryId };
    if (status && status !== 'all') {
      filters.status = status as string;
    }

    const projects = await storage.getAllActiveProjects(
      filters,
      'createdAt',
      'desc',
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      message: "Projets de la catégorie récupérés avec succès",
      data: projects
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des projets"
    });
  }
});

// GET /api/project-categories/:id/stats - Statistiques d'une catégorie
router.get('/:id/stats', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({
        message: "ID de catégorie invalide"
      });
    }

    // Get all projects for this category
    const allProjects = await storage.getAllActiveProjects({ categoryId });
    
    // Get client requests for this category
    const clientRequests = await storage.getAllClientRequests({ categoryId });

    const stats = {
      categoryId,
      totalProjects: allProjects.length,
      projectsByStatus: {
        planning: allProjects.filter(p => p.status === 'planning').length,
        in_progress: allProjects.filter(p => p.status === 'in_progress').length,
        completed: allProjects.filter(p => p.status === 'completed').length,
        on_hold: allProjects.filter(p => p.status === 'on_hold').length
      },
      totalRequests: clientRequests.length,
      requestsByStatus: {
        pending: clientRequests.filter(r => r.status === 'pending').length,
        approved: clientRequests.filter(r => r.status === 'approved').length,
        rejected: clientRequests.filter(r => r.status === 'rejected').length
      },      averageProjectValue: allProjects.length > 0 
        ? Math.round(allProjects.reduce((sum, p) => sum + parseFloat(p.contractValue?.toString() || '0'), 0) / allProjects.length)
        : 0,
      totalValue: allProjects.reduce((sum, p) => sum + parseFloat(p.contractValue?.toString() || '0'), 0)
    };

    res.json({
      message: "Statistiques de la catégorie récupérées avec succès",
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques"
    });
  }
});

// GET /api/project-categories/stats/overview - Vue d'ensemble de toutes les catégories
router.get('/stats/overview', async (req, res) => {
  try {
    const categories = await storage.getActiveProjectCategories();
    const overview = [];

    for (const category of categories) {
      const projects = await storage.getAllActiveProjects({ categoryId: category.id });
      const requests = await storage.getAllClientRequests({ categoryId: category.id });

      overview.push({
        category,
        projectCount: projects.length,        requestCount: requests.length,
        totalValue: projects.reduce((sum, p) => sum + parseFloat(p.contractValue?.toString() || '0'), 0),
        averageValue: projects.length > 0 
          ? Math.round(projects.reduce((sum, p) => sum + parseFloat(p.contractValue?.toString() || '0'), 0) / projects.length)
          : 0
      });
    }

    res.json({
      message: "Vue d'ensemble des catégories récupérée avec succès",
      data: overview
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la vue d\'ensemble:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la vue d'ensemble"
    });
  }
});

// DELETE /api/project-categories/:id - Supprimer une catégorie
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({
        message: "ID de catégorie invalide"
      });
    }

    // Check if category has associated projects
    const projects = await storage.getAllActiveProjects({ categoryId });
    if (projects.length > 0) {
      return res.status(400).json({
        message: "Impossible de supprimer une catégorie avec des projets associés"
      });
    }

    const deleted = await storage.deleteProjectCategory(categoryId);

    if (!deleted) {
      return res.status(404).json({
        message: "Catégorie non trouvée"
      });
    }

    res.json({
      message: "Catégorie supprimée avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la catégorie"
    });
  }
});

export default router;
