import { Router } from 'express';
import { ZodError } from 'zod';
import { insertPaymentSchema } from '../../shared/schema.js';
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

// GET /api/payments/project/:projectId - Obtenir tous les paiements d'un projet
router.get('/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const payments = await storage.getPaymentsByProject(projectId);

    res.json({
      message: "Paiements récupérés avec succès",
      data: payments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements"
    });
  }
});

// GET /api/payments/:id - Obtenir un paiement par ID
router.get('/:id', async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    
    if (isNaN(paymentId)) {
      return res.status(400).json({
        message: "ID de paiement invalide"
      });
    }

    const payment = await storage.getPayment(paymentId);

    if (!payment) {
      return res.status(404).json({
        message: "Paiement non trouvé"
      });
    }

    res.json({
      message: "Paiement récupéré avec succès",
      data: payment
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du paiement:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération du paiement"
    });
  }
});

// POST /api/payments - Créer un nouveau paiement
router.post('/', validateRequest(insertPaymentSchema), async (req, res) => {
  try {
    const paymentData: any = {
      ...req.body,
      status: req.body.status || 'pending'
    };

    const newPayment = await storage.createPayment(paymentData);

    res.status(201).json({
      message: "Paiement créé avec succès",
      data: newPayment
    });
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    res.status(500).json({
      message: "Erreur lors de la création du paiement"
    });
  }
});

// POST /api/payments/schedule/:projectId - Créer un échéancier de paiements
router.post('/schedule/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { paymentSchedule } = req.body; // Array of payment milestones
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    if (!Array.isArray(paymentSchedule) || paymentSchedule.length === 0) {
      return res.status(400).json({
        message: "Échéancier de paiements requis"
      });
    }

    const createdPayments = [];
      for (const payment of paymentSchedule) {
      const paymentData: any = {
        activeProjectId: projectId,
        paymentNumber: `PAY-${projectId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount: payment.amount.toString(),
        netAmount: payment.amount.toString(),
        paymentType: payment.paymentType,
        description: payment.description,
        dueDate: new Date(payment.dueDate),
        status: 'pending',
        phaseId: payment.milestonePhaseId || null,
        createdBy: 1 // TODO: Get from authenticated user
      };

      const newPayment = await storage.createPayment(paymentData);
      createdPayments.push(newPayment);
    }

    res.status(201).json({
      message: "Échéancier de paiements créé avec succès",
      data: createdPayments
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'échéancier:', error);
    res.status(500).json({
      message: "Erreur lors de la création de l\'échéancier"
    });
  }
});

// PUT /api/payments/:id - Mettre à jour un paiement
router.put('/:id', async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    
    if (isNaN(paymentId)) {
      return res.status(400).json({
        message: "ID de paiement invalide"
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedPayment = await storage.updatePayment(paymentId, updateData);

    if (!updatedPayment) {
      return res.status(404).json({
        message: "Paiement non trouvé"
      });
    }

    res.json({
      message: "Paiement mis à jour avec succès",
      data: updatedPayment
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paiement:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du paiement"
    });
  }
});

// PUT /api/payments/:id/status - Mettre à jour le statut d'un paiement
router.put('/:id/status', async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    const { status, paymentMethod, transactionId, notes } = req.body;
    
    if (isNaN(paymentId)) {
      return res.status(400).json({
        message: "ID de paiement invalide"
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

    if (status === 'completed') {
      updateData.paidAt = new Date();
      updateData.paymentMethod = paymentMethod || 'cash';
      updateData.transactionId = transactionId || null;
    }

    if (notes) {
      updateData.notes = notes;
    }

    const updatedPayment = await storage.updatePayment(paymentId, updateData);

    if (!updatedPayment) {
      return res.status(404).json({
        message: "Paiement non trouvé"
      });
    }

    res.json({
      message: "Statut du paiement mis à jour avec succès",
      data: updatedPayment
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut"
    });
  }
});

// POST /api/payments/:id/confirm - Confirmer un paiement
router.post('/:id/confirm', async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    const { paymentMethod, transactionId, notes } = req.body;
    
    if (isNaN(paymentId)) {
      return res.status(400).json({
        message: "ID de paiement invalide"
      });
    }

    const updateData = {
      status: 'completed',
      paidAt: new Date(),
      paymentMethod: paymentMethod || 'cash',
      transactionId: transactionId || null,
      notes: notes || '',
      updatedAt: new Date()
    };

    const updatedPayment = await storage.updatePayment(paymentId, updateData);

    if (!updatedPayment) {
      return res.status(404).json({
        message: "Paiement non trouvé"
      });
    }

    res.json({
      message: "Paiement confirmé avec succès",
      data: updatedPayment
    });
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement:', error);
    res.status(500).json({
      message: "Erreur lors de la confirmation du paiement"
    });
  }
});

// GET /api/payments/overdue - Obtenir les paiements en retard
router.get('/overdue', async (req, res) => {
  try {
    // Get overdue payments by filtering all payments
    const allPayments = await storage.getPayments();
    const overduePayments = allPayments.filter(payment => 
      payment.status === 'pending' && 
      payment.dueDate && 
      new Date(payment.dueDate) < new Date()
    );

    res.json({
      message: "Paiements en retard récupérés avec succès",
      data: overduePayments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements en retard:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements en retard"
    });
  }
});

// GET /api/payments/upcoming - Obtenir les paiements à venir
router.get('/upcoming', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNumber = parseInt(days as string);
    
    // Get upcoming payments by filtering all payments
    const allPayments = await storage.getPayments();
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + daysNumber);
    
    const upcomingPayments = allPayments.filter(payment => 
      payment.status === 'pending' && 
      payment.dueDate && 
      new Date(payment.dueDate) >= currentDate &&
      new Date(payment.dueDate) <= futureDate
    );

    res.json({
      message: "Paiements à venir récupérés avec succès",
      data: upcomingPayments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements à venir:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements à venir"
    });
  }
});

// GET /api/payments/stats/project/:projectId - Statistiques de paiements pour un projet
router.get('/stats/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const payments = await storage.getPaymentsByProject(projectId);
    const project = await storage.getActiveProject(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Projet non trouvé"
      });
    }    const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const paidAmount = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const pendingAmount = payments
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const overdueAmount = payments
      .filter(payment => payment.status === 'pending' && new Date(payment.dueDate) < new Date())
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    const stats = {
      projectId,
      totalBudget: project.contractValue,
      totalScheduled: totalAmount,
      totalPaid: paidAmount,
      totalPending: pendingAmount,
      totalOverdue: overdueAmount,
      paymentProgress: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
      paymentCount: {
        total: payments.length,
        completed: payments.filter(p => p.status === 'completed').length,
        pending: payments.filter(p => p.status === 'pending').length,
        overdue: payments.filter(p => p.status === 'pending' && new Date(p.dueDate) < new Date()).length
      }
    };

    res.json({
      message: "Statistiques de paiements récupérées avec succès",
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques"
    });
  }
});

// DELETE /api/payments/:id - Supprimer un paiement
router.delete('/:id', async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    
    if (isNaN(paymentId)) {
      return res.status(400).json({
        message: "ID de paiement invalide"
      });
    }

    const deleted = await storage.deletePayment(paymentId);

    if (!deleted) {
      return res.status(404).json({
        message: "Paiement non trouvé"
      });
    }

    res.json({
      message: "Paiement supprimé avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du paiement:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression du paiement"
    });
  }
});

export default router;
