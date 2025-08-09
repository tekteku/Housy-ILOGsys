import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// GET /api/activities - Obtenir toutes les activités
router.get('/', async (req, res) => {
  try {
    const { projectId, type, page = 1, limit = 20 } = req.query;

    // For now, return mock activities since we don't have activities table
    const activities = [
      {
        id: 1,
        projectId: projectId ? parseInt(projectId as string) : 1,
        type: 'project_created',
        title: 'Projet créé',
        description: 'Un nouveau projet a été créé',
        userId: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        projectId: projectId ? parseInt(projectId as string) : 1,
        type: 'material_added',
        title: 'Matériau ajouté',
        description: 'Un nouveau matériau a été ajouté au projet',
        userId: 1,
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      }
    ];

    const filteredActivities = type 
      ? activities.filter(activity => activity.type === type)
      : activities;

    res.json({
      message: "Activités récupérées avec succès",
      data: filteredActivities,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredActivities.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des activités"
    });
  }
});

// POST /api/activities - Créer une nouvelle activité
router.post('/', async (req, res) => {
  try {
    const { projectId, type, title, description, userId } = req.body;

    if (!projectId || !type || !title) {
      return res.status(400).json({
        message: "ID de projet, type et titre requis"
      });
    }

    const newActivity = {
      id: Date.now(), // Mock ID
      projectId: parseInt(projectId),
      type,
      title,
      description: description || '',
      userId: userId || 1,
      createdAt: new Date()
    };

    res.status(201).json({
      message: "Activité créée avec succès",
      data: newActivity
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité:', error);
    res.status(500).json({
      message: "Erreur lors de la création de l'activité"
    });
  }
});

// GET /api/activities/:id - Obtenir une activité par ID
router.get('/:id', async (req, res) => {
  try {
    const activityId = parseInt(req.params.id);

    if (isNaN(activityId)) {
      return res.status(400).json({
        message: "ID d'activité invalide"
      });
    }

    // Mock activity
    const activity = {
      id: activityId,
      projectId: 1,
      type: 'project_created',
      title: 'Projet créé',
      description: 'Un nouveau projet a été créé',
      userId: 1,
      createdAt: new Date()
    };

    res.json({
      message: "Activité récupérée avec succès",
      data: activity
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'activité"
    });
  }
});

export default router;
