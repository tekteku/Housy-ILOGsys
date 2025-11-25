import { Router } from 'express';
import { ZodError } from 'zod';
import { insertClientRequestSchema } from '../../shared/schema.js';
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

// GET /api/client-requests - Obtenir toutes les demandes clients
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const filters: any = {};
    if (status && status !== 'all') {
      filters.status = status as string;
    }

    const requests = await storage.getAllClientRequests(
      filters,
      sortBy as string,
      sortOrder as 'asc' | 'desc',
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      message: "Demandes clients récupérées avec succès",
      data: requests
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des demandes"
    });
  }
});

// GET /api/client-requests/:id - Obtenir une demande client par ID
router.get('/:id', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    
    if (isNaN(requestId)) {
      return res.status(400).json({
        message: "ID de demande invalide"
      });
    }

    const request = await storage.getClientRequest(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Demande non trouvée"
      });
    }

    res.json({
      message: "Demande récupérée avec succès",
      data: request
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la demande:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la demande"
    });
  }
});

// POST /api/client-requests - Créer une nouvelle demande client
router.post('/', validateRequest(insertClientRequestSchema), async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newRequest = await storage.createClientRequest(requestData);

    res.status(201).json({
      message: "Demande client créée avec succès",
      data: newRequest
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    res.status(500).json({
      message: "Erreur lors de la création de la demande"
    });
  }
});

// PUT /api/client-requests/:id - Mettre à jour une demande client
router.put('/:id', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    
    if (isNaN(requestId)) {
      return res.status(400).json({
        message: "ID de demande invalide"
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedRequest = await storage.updateClientRequest(requestId, updateData);

    if (!updatedRequest) {
      return res.status(404).json({
        message: "Demande non trouvée"
      });
    }

    res.json({
      message: "Demande mise à jour avec succès",
      data: updatedRequest
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la demande:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la demande"
    });
  }
});

// PUT /api/client-requests/:id/status - Mettre à jour le statut d'une demande
router.put('/:id/status', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { status, rejectionReason } = req.body;
    
    if (isNaN(requestId)) {
      return res.status(400).json({
        message: "ID de demande invalide"
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
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (status === 'approved') {
      updateData.approvedAt = new Date();
    }

    const updatedRequest = await storage.updateClientRequest(requestId, updateData);

    if (!updatedRequest) {
      return res.status(404).json({
        message: "Demande non trouvée"
      });
    }

    res.json({
      message: "Statut de la demande mis à jour avec succès",
      data: updatedRequest
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut"
    });
  }
});

// DELETE /api/client-requests/:id - Supprimer une demande client
router.delete('/:id', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    
    if (isNaN(requestId)) {
      return res.status(400).json({
        message: "ID de demande invalide"
      });
    }

    const deleted = await storage.deleteClientRequest(requestId);

    if (!deleted) {
      return res.status(404).json({
        message: "Demande non trouvée"
      });
    }

    res.json({
      message: "Demande supprimée avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la demande:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la demande"
    });
  }
});

// GET /api/client-requests/search - Rechercher des demandes
router.get('/search', async (req, res) => {
  try {
    const { query, filters } = req.query;
    
    if (!query) {
      return res.status(400).json({
        message: "Terme de recherche requis"
      });
    }    const searchFilters = filters ? JSON.parse(filters as string) : {};
    searchFilters.clientName = query; // Use query as client name filter
    
    const results = await storage.getAllClientRequests(searchFilters);

    res.json({
      message: "Recherche effectuée avec succès",
      data: results
    });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({
      message: "Erreur lors de la recherche"
    });
  }
});

export default router;
