import { Router } from 'express';
import { ZodError } from 'zod';
import { insertQuotationSchema } from '../../shared/schema.js';
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

// GET /api/quotations - Obtenir tous les devis
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const filters: any = {};
    if (status && status !== 'all') {
      filters.status = status as string;
    }

    const quotations = await storage.getAllQuotations(
      filters,
      sortBy as string,
      sortOrder as 'asc' | 'desc',
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      message: "Devis récupérés avec succès",
      data: quotations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des devis:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des devis"
    });
  }
});

// GET /api/quotations/:id - Obtenir un devis par ID
router.get('/:id', async (req, res) => {
  try {
    const quotationId = parseInt(req.params.id);
    
    if (isNaN(quotationId)) {
      return res.status(400).json({
        message: "ID de devis invalide"
      });
    }

    const quotation = await storage.getQuotation(quotationId);

    if (!quotation) {
      return res.status(404).json({
        message: "Devis non trouvé"
      });
    }

    res.json({
      message: "Devis récupéré avec succès",
      data: quotation
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du devis:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération du devis"
    });
  }
});

// GET /api/quotations/request/:requestId - Obtenir les devis pour une demande client
router.get('/request/:requestId', async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);
    
    if (isNaN(requestId)) {
      return res.status(400).json({
        message: "ID de demande invalide"
      });
    }

    const quotations = await storage.getQuotations({ requestId });

    res.json({
      message: "Devis récupérés avec succès",
      data: quotations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des devis:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des devis"
    });
  }
});

// POST /api/quotations - Créer un nouveau devis
router.post('/', validateRequest(insertQuotationSchema), async (req, res) => {
  try {
    const quotationData = {
      ...req.body,
      status: 'draft',
      revisionNumber: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newQuotation = await storage.createQuotation(quotationData);

    res.status(201).json({
      message: "Devis créé avec succès",
      data: newQuotation
    });
  } catch (error) {
    console.error('Erreur lors de la création du devis:', error);
    res.status(500).json({
      message: "Erreur lors de la création du devis"
    });
  }
});

// POST /api/quotations/:id/revise - Créer une révision du devis
router.post('/:id/revise', async (req, res) => {
  try {
    const quotationId = parseInt(req.params.id);
    const { changes, revisionNotes } = req.body;
    
    if (isNaN(quotationId)) {
      return res.status(400).json({
        message: "ID de devis invalide"
      });
    }    // Get the original quotation
    const originalQuotation = await storage.getQuotation(quotationId);
    if (!originalQuotation) {
      return res.status(404).json({
        message: "Devis original non trouvé"
      });
    }

    // Create new revision
    const revisionData = {
      ...originalQuotation,
      ...changes,
      revisionNumber: (originalQuotation.version || 1) + 1,
      parentQuotationId: quotationId,
      status: 'draft',
      revisionNotes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    delete revisionData.id; // Remove ID so a new one is generated

    const newRevision = await storage.createQuotation(revisionData);

    res.status(201).json({
      message: "Révision du devis créée avec succès",
      data: newRevision
    });
  } catch (error) {
    console.error('Erreur lors de la création de la révision:', error);
    res.status(500).json({
      message: "Erreur lors de la création de la révision"
    });
  }
});

// PUT /api/quotations/:id - Mettre à jour un devis
router.put('/:id', async (req, res) => {
  try {
    const quotationId = parseInt(req.params.id);
    
    if (isNaN(quotationId)) {
      return res.status(400).json({
        message: "ID de devis invalide"
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedQuotation = await storage.updateQuotation(quotationId, updateData);

    if (!updatedQuotation) {
      return res.status(404).json({
        message: "Devis non trouvé"
      });
    }

    res.json({
      message: "Devis mis à jour avec succès",
      data: updatedQuotation
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du devis:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du devis"
    });
  }
});

// PUT /api/quotations/:id/status - Mettre à jour le statut d'un devis
router.put('/:id/status', async (req, res) => {
  try {
    const quotationId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (isNaN(quotationId)) {
      return res.status(400).json({
        message: "ID de devis invalide"
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

    if (status === 'sent') {
      updateData.sentAt = new Date();
    } else if (status === 'accepted') {
      updateData.acceptedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date();
    }

    const updatedQuotation = await storage.updateQuotation(quotationId, updateData);

    if (!updatedQuotation) {
      return res.status(404).json({
        message: "Devis non trouvé"
      });
    }

    res.json({
      message: "Statut du devis mis à jour avec succès",
      data: updatedQuotation
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut"
    });
  }
});

// POST /api/quotations/:id/send - Envoyer un devis au client
router.post('/:id/send', async (req, res) => {
  try {
    const quotationId = parseInt(req.params.id);
    
    if (isNaN(quotationId)) {
      return res.status(400).json({
        message: "ID de devis invalide"
      });
    }

    const updateData = {
      status: 'sent',
      sentAt: new Date(),
      updatedAt: new Date()
    };

    const updatedQuotation = await storage.updateQuotation(quotationId, updateData);

    if (!updatedQuotation) {
      return res.status(404).json({
        message: "Devis non trouvé"
      });
    }

    // TODO: Integrate with email service to send quotation to client

    res.json({
      message: "Devis envoyé avec succès",
      data: updatedQuotation
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du devis:', error);
    res.status(500).json({
      message: "Erreur lors de l\'envoi du devis"
    });
  }
});

// GET /api/quotations/:id/pdf - Générer le PDF du devis
router.get('/:id/pdf', async (req, res) => {
  try {
    const quotationId = parseInt(req.params.id);
    
    if (isNaN(quotationId)) {
      return res.status(400).json({
        message: "ID de devis invalide"
      });
    }

    const quotation = await storage.getQuotation(quotationId);

    if (!quotation) {
      return res.status(404).json({
        message: "Devis non trouvé"
      });
    }

    // TODO: Implement PDF generation
    res.json({
      message: "Génération PDF en cours de développement",
      data: { quotationId, downloadUrl: `/api/quotations/${quotationId}/download` }
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    res.status(500).json({
      message: "Erreur lors de la génération du PDF"
    });
  }
});

// DELETE /api/quotations/:id - Supprimer un devis
router.delete('/:id', async (req, res) => {
  try {
    const quotationId = parseInt(req.params.id);
    
    if (isNaN(quotationId)) {
      return res.status(400).json({
        message: "ID de devis invalide"
      });
    }

    const deleted = await storage.deleteQuotation(quotationId);

    if (!deleted) {
      return res.status(404).json({
        message: "Devis non trouvé"
      });
    }

    res.json({
      message: "Devis supprimé avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du devis:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression du devis"
    });  }
});

// GET /api/quotations/stats - Obtenir les statistiques des devis
router.get('/stats', async (req, res) => {
  try {
    const allQuotations = await storage.getAllQuotations({}, 'createdAt', 'desc', 1, 1000);
    
    const stats = {
      total: allQuotations.length,
      pending: allQuotations.filter(q => q.status === 'sent').length,
      accepted: allQuotations.filter(q => q.status === 'accepted').length,
      total_value: allQuotations.reduce((sum, q) => sum + (parseFloat(q.finalAmount?.toString() || '0') || 0), 0)
    };

    res.json({
      message: "Statistiques récupérées avec succès",
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques"
    });
  }
});

export default router;
