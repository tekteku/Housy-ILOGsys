import { Router } from 'express';
import { ZodError } from 'zod';
import { insertProjectSchema } from '../../shared/schema.js';
import { projectService } from '../services/project-service';

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

// GET /api/projects - Obtenir tous les projets
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    
    // Get all projects (filtering will be done here since getAllProjects doesn't accept parameters)
    const allProjects = await projectService.getAllProjects();
    
    // Apply filters
    let projects = allProjects;
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      projects = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm) ||
        (project.clientName && project.clientName.toLowerCase().includes(searchTerm)) ||
        (project.location && project.location.toLowerCase().includes(searchTerm))
      );
    }
    
    if (status && status !== 'all') {
      projects = projects.filter(project => project.status === status);
    }
    
    // Apply pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProjects = projects.slice(startIndex, endIndex);    res.json({
      message: "Projets récupérés avec succès",
      data: paginatedProjects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: projects.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des projets"
    });
  }
});

// GET /api/projects/:id - Obtenir un projet par ID
router.get('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const project = await projectService.getProjectDetails(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Projet non trouvé"
      });
    }

    res.json({
      message: "Projet récupéré avec succès",
      data: project
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération du projet"
    });
  }
});

// POST /api/projects - Créer un nouveau projet
router.post('/', validateRequest(insertProjectSchema), async (req, res) => {
  try {
    const projectData = req.body;
    // TODO: In a real app, get userId from authentication
    const userId = 1; // Placeholder for now
    
    const newProject = await projectService.createProject(projectData, userId);

    res.status(201).json({
      message: "Projet créé avec succès",
      data: newProject
    });
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    res.status(500).json({
      message: "Erreur lors de la création du projet"
    });
  }
});

// PUT /api/projects/:id - Mettre à jour un projet
router.put('/:id', validateRequest(insertProjectSchema.partial()), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const updateData = req.body;
    // TODO: In a real app, get userId from authentication
    const userId = 1; // Placeholder for now
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const updatedProject = await projectService.updateProject(projectId, updateData, userId);

    if (!updatedProject) {
      return res.status(404).json({
        message: "Projet non trouvé"
      });
    }

    res.json({
      message: "Projet mis à jour avec succès",
      data: updatedProject
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du projet"
    });
  }
});

// DELETE /api/projects/:id - Supprimer un projet
router.delete('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    // TODO: In a real app, get userId from authentication
    const userId = 1; // Placeholder for now
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const deleted = await projectService.deleteProject(projectId, userId);

    if (!deleted) {
      return res.status(404).json({
        message: "Projet non trouvé"
      });
    }

    res.json({
      message: "Projet supprimé avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression du projet"
    });
  }
});

// GET /api/projects/:id/estimation - Obtenir l'estimation d'un projet
router.get('/:id/estimation', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const estimation = await projectService.getProjectEstimation(projectId);

    res.json({
      message: "Estimation du projet récupérée avec succès",
      data: estimation
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'estimation:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'estimation"
    });
  }
});

// POST /api/projects/:id/generate-estimation - Générer une estimation IA
router.post('/:id/generate-estimation', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const estimation = await projectService.generateAIEstimation(projectId);

    res.json({
      message: "Estimation IA générée avec succès",
      data: estimation
    });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'estimation IA:', error);
    res.status(500).json({
      message: "Erreur lors de la génération de l'estimation IA"
    });
  }
});

export default router;
