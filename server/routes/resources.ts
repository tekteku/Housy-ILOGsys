import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// GET /api/resources - Obtenir toutes les ressources
router.get('/', async (req, res) => {
  try {
    const { type, projectId, page = 1, limit = 20 } = req.query;

    // Mock resources data since we don't have resources table
    const resources = [
      {
        id: 1,
        name: 'Équipe de construction',
        type: 'human',
        availability: 'available',
        cost: 50,
        unit: 'hour',
        projectId: projectId ? parseInt(projectId as string) : null,
        description: 'Équipe expérimentée en construction',
        createdAt: new Date()
      },
      {
        id: 2,
        name: 'Grue de chantier',
        type: 'equipment',
        availability: 'busy',
        cost: 200,
        unit: 'day',
        projectId: null,
        description: 'Grue mobile pour chantier de construction',
        createdAt: new Date()
      },
      {
        id: 3,
        name: 'Camion de livraison',
        type: 'vehicle',
        availability: 'available',
        cost: 80,
        unit: 'day',
        projectId: null,
        description: 'Camion pour livraison de matériaux',
        createdAt: new Date()
      }
    ];

    const filteredResources = type 
      ? resources.filter(resource => resource.type === type)
      : resources;

    res.json({
      message: "Ressources récupérées avec succès",
      data: filteredResources,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredResources.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ressources:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des ressources"
    });
  }
});

// GET /api/resources/:id - Obtenir une ressource par ID
router.get('/:id', async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id);

    if (isNaN(resourceId)) {
      return res.status(400).json({
        message: "ID de ressource invalide"
      });
    }

    // Mock resource
    const resource = {
      id: resourceId,
      name: 'Équipe de construction',
      type: 'human',
      availability: 'available',
      cost: 50,
      unit: 'hour',
      projectId: null,
      description: 'Équipe expérimentée en construction',
      createdAt: new Date()
    };

    res.json({
      message: "Ressource récupérée avec succès",
      data: resource
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la ressource:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la ressource"
    });
  }
});

// POST /api/resources - Créer une nouvelle ressource
router.post('/', async (req, res) => {
  try {
    const { name, type, cost, unit, description, availability } = req.body;

    if (!name || !type || !cost) {
      return res.status(400).json({
        message: "Nom, type et coût requis"
      });
    }

    const newResource = {
      id: Date.now(), // Mock ID
      name,
      type,
      cost: parseFloat(cost),
      unit: unit || 'hour',
      availability: availability || 'available',
      projectId: null,
      description: description || '',
      createdAt: new Date()
    };

    res.status(201).json({
      message: "Ressource créée avec succès",
      data: newResource
    });
  } catch (error) {
    console.error('Erreur lors de la création de la ressource:', error);
    res.status(500).json({
      message: "Erreur lors de la création de la ressource"
    });
  }
});

// PUT /api/resources/:id - Mettre à jour une ressource
router.put('/:id', async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id);
    const updateData = req.body;

    if (isNaN(resourceId)) {
      return res.status(400).json({
        message: "ID de ressource invalide"
      });
    }

    const updatedResource = {
      id: resourceId,
      ...updateData,
      updatedAt: new Date()
    };

    res.json({
      message: "Ressource mise à jour avec succès",
      data: updatedResource
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la ressource:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la ressource"
    });
  }
});

// DELETE /api/resources/:id - Supprimer une ressource
router.delete('/:id', async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id);

    if (isNaN(resourceId)) {
      return res.status(400).json({
        message: "ID de ressource invalide"
      });
    }

    res.json({
      message: "Ressource supprimée avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la ressource:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la ressource"
    });
  }
});

export default router;
