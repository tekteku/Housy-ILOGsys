import { Router } from 'express';
import { ZodError } from 'zod';
import { insertEnhancedNotificationSchema } from '../../shared/schema.js';
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

// GET /api/notifications - Obtenir toutes les notifications
router.get('/', async (req, res) => {
  try {
    const { 
      userId, 
      isRead, 
      priority, 
      type,
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    const filters: any = {};
    if (userId) filters.userId = parseInt(userId as string);
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    if (priority) filters.priority = priority as string;
    if (type) filters.type = type as string;    const notifications = await storage.getEnhancedNotifications(
      undefined,
      filters
    );

    res.json({
      message: "Notifications récupérées avec succès",
      data: notifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des notifications"
    });
  }
});

// GET /api/notifications/user/:userId - Obtenir les notifications d'un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { isRead, page = 1, limit = 20 } = req.query;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        message: "ID utilisateur invalide"
      });
    }

    const filters: any = { userId };
    if (isRead !== undefined) filters.isRead = isRead === 'true';    const notifications = await storage.getEnhancedNotifications(
      userId,
      filters
    );

    res.json({
      message: "Notifications utilisateur récupérées avec succès",
      data: notifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications utilisateur:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des notifications utilisateur"
    });
  }
});

// GET /api/notifications/unread/user/:userId - Obtenir les notifications non lues d'un utilisateur
router.get('/unread/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        message: "ID utilisateur invalide"
      });
    }

    const notifications = await storage.getEnhancedNotifications(userId, { isRead: false });

    res.json({
      message: "Notifications non lues récupérées avec succès",
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications non lues:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des notifications non lues"
    });  }
});

// GET /api/notifications/settings - Obtenir les paramètres de notification
router.get('/settings', async (req, res) => {
  try {
    // For now, return default settings. In a real app, these would be stored per user
    const defaultSettings = {
      email_notifications: true,
      push_notifications: true,
      new_projects: true,
      quotation_updates: true,
      client_messages: true,
      system_alerts: true,
      payment_notifications: true
    };

    res.json({
      message: "Paramètres de notification récupérés avec succès",
      data: defaultSettings
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de notification:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des paramètres de notification"
    });
  }
});

// PUT /api/notifications/settings - Mettre à jour les paramètres de notification
router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    // For now, just return success. In a real app, these would be stored in database
    res.json({
      message: "Paramètres de notification mis à jour avec succès",
      data: settings
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres de notification:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour des paramètres de notification"
    });
  }
});

// GET /api/notifications/stats - Statistiques générales des notifications (pour admin)
router.get('/stats', async (req, res) => {
  try {
    // Get all notifications for admin stats
    const allNotifications = await storage.getEnhancedNotifications();
    
    const stats = {
      total: allNotifications.length,
      unread: allNotifications.filter((n: any) => !n.isRead).length,
      read: allNotifications.filter((n: any) => n.isRead).length,
      byType: {
        info: allNotifications.filter((n: any) => n.type === 'info').length,
        success: allNotifications.filter((n: any) => n.type === 'success').length,
        warning: allNotifications.filter((n: any) => n.type === 'warning').length,
        error: allNotifications.filter((n: any) => n.type === 'error').length,
        payment: allNotifications.filter((n: any) => n.type === 'payment').length,
        project: allNotifications.filter((n: any) => n.type === 'project').length
      },
      byPriority: {
        low: allNotifications.filter((n: any) => n.priority === 'low').length,
        medium: allNotifications.filter((n: any) => n.priority === 'medium').length,
        high: allNotifications.filter((n: any) => n.priority === 'high').length,
        urgent: allNotifications.filter((n: any) => n.priority === 'urgent').length
      },
      recent: allNotifications.filter((n: any) => 
        new Date(n.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length
    };

    res.json({
      message: "Statistiques des notifications récupérées avec succès",
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des notifications:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques des notifications"
    });
  }
});

// GET /api/notifications/:id - Obtenir une notification par ID
router.get('/:id', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    if (isNaN(notificationId)) {
      return res.status(400).json({
        message: "ID de notification invalide"
      });
    }

    const notification = await storage.getEnhancedNotification(notificationId);

    if (!notification) {
      return res.status(404).json({
        message: "Notification non trouvée"
      });
    }

    res.json({
      message: "Notification récupérée avec succès",
      data: notification
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la notification:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la notification"
    });
  }
});

// POST /api/notifications - Créer une nouvelle notification
router.post('/', validateRequest(insertEnhancedNotificationSchema), async (req, res) => {
  try {
    // Validate the request body against the schema
    const validatedData = insertEnhancedNotificationSchema.parse(req.body);
    const notificationData = {
      ...validatedData,
      isRead: false, // Ensure isRead is set to false for new notifications
    };

    const newNotification = await storage.createEnhancedNotification(notificationData as any);

    res.status(201).json({
      message: "Notification créée avec succès",
      data: newNotification
    });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    res.status(500).json({
      message: "Erreur lors de la création de la notification"
    });
  }
});

// POST /api/notifications/broadcast - Créer une notification de diffusion
router.post('/broadcast', async (req, res) => {
  try {
    const { title, message, type = 'info', priority = 'medium', userIds } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        message: "Titre et message requis"
      });
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        message: "Liste d'utilisateurs requise"
      });
    }

    const createdNotifications = [];
    
    for (const userId of userIds) {
      const notificationPayload = {
        userId,
        title,
        message,
        type,
        category: type, // map type to category
        priority,
        isRead: false,
      };
      // Validate each notification payload before creation
      const validatedPayload = insertEnhancedNotificationSchema.parse(notificationPayload);
      const newNotification = await storage.createEnhancedNotification(validatedPayload as any);
      createdNotifications.push(newNotification);
    }

    res.status(201).json({
      message: "Notifications de diffusion créées avec succès",
      data: createdNotifications,
      count: createdNotifications.length
    });
  } catch (error) {
    console.error('Erreur lors de la création des notifications de diffusion:', error);
    res.status(500).json({
      message: "Erreur lors de la création des notifications de diffusion"
    });
  }
});

// PUT /api/notifications/:id/read - Marquer une notification comme lue
router.put('/:id/read', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    if (isNaN(notificationId)) {
      return res.status(400).json({
        message: "ID de notification invalide"
      });
    }

    // Define the update payload
    const updatePayload = {
      isRead: true,
      readAt: new Date(),
    };
    
    const updatedNotification = await storage.updateEnhancedNotification(notificationId, updatePayload as any);

    if (!updatedNotification) {
      return res.status(404).json({
        message: "Notification non trouvée"
      });
    }

    res.json({
      message: "Notification marquée comme lue",
      data: updatedNotification
    });
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error);
    res.status(500).json({
      message: "Erreur lors du marquage de la notification"
    });
  }
});

// PUT /api/notifications/read-all/user/:userId - Marquer toutes les notifications comme lues
router.put('/read-all/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        message: "ID utilisateur invalide"
      });
    }

    // Get all unread notifications for the user
    const unreadNotifications = await storage.getEnhancedNotifications(userId, { isRead: false });
    
    // Mark each as read
    let updatedCount = 0;
    for (const notification of unreadNotifications) {
      await storage.markNotificationAsRead(notification.id, userId);
      updatedCount++;
    }    res.json({
      message: "Toutes les notifications marquées comme lues",
      data: { updatedCount }
    });
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications:', error);
    res.status(500).json({
      message: "Erreur lors du marquage de toutes les notifications"
    });
  }
});

// GET /api/notifications/stats/user/:userId - Statistiques des notifications d'un utilisateur
router.get('/stats/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        message: "ID utilisateur invalide"
      });
    }

    const allNotifications = await storage.getEnhancedNotifications(userId);
      const stats = {
      total: allNotifications.length,
      unread: allNotifications.filter((n: any) => !n.isRead).length,
      read: allNotifications.filter((n: any) => n.isRead).length,
      byType: {
        info: allNotifications.filter((n: any) => n.type === 'info').length,
        success: allNotifications.filter((n: any) => n.type === 'success').length,
        warning: allNotifications.filter((n: any) => n.type === 'warning').length,
        error: allNotifications.filter((n: any) => n.type === 'error').length,
        payment: allNotifications.filter((n: any) => n.type === 'payment').length,
        project: allNotifications.filter((n: any) => n.type === 'project').length
      },
      byPriority: {
        low: allNotifications.filter((n: any) => n.priority === 'low').length,
        medium: allNotifications.filter((n: any) => n.priority === 'medium').length,
        high: allNotifications.filter((n: any) => n.priority === 'high').length,
        urgent: allNotifications.filter((n: any) => n.priority === 'urgent').length
      },
      recent: allNotifications.filter((n: any) => 
        new Date(n.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length
    };

    res.json({
      message: "Statistiques des notifications récupérées avec succès",
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques"
    });
  }
});

// GET /api/notifications/recent/user/:userId - Notifications récentes d'un utilisateur
router.get('/recent/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { days = 7, limit = 10 } = req.query;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        message: "ID utilisateur invalide"
      });
    }

    const cutoffDate = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);
    const filters = { 
      userId,
      createdAfter: cutoffDate
    };    const notifications = await storage.getEnhancedNotifications(userId);

    res.json({
      message: "Notifications récentes récupérées avec succès",
      data: notifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications récentes:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des notifications récentes"
    });
  }
});

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    if (isNaN(notificationId)) {
      return res.status(400).json({
        message: "ID de notification invalide"
      });
    }

    const deleted = await storage.deleteEnhancedNotification(notificationId);

    if (!deleted) {
      return res.status(404).json({
        message: "Notification non trouvée"
      });
    }

    res.json({
      message: "Notification supprimée avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la notification"
    });
  }
});

// DELETE /api/notifications/cleanup/user/:userId - Nettoyer les anciennes notifications
router.delete('/cleanup/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { days = 30 } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        message: "ID utilisateur invalide"
      });
    }    const cutoffDate = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);
    
    // Get old notifications for the user
    const allNotifications = await storage.getEnhancedNotifications(userId);
    const oldNotifications = allNotifications.filter((n: any) => n.createdAt < cutoffDate && n.isRead);
    
    // Delete each old notification
    let deletedCount = 0;
    for (const notification of oldNotifications) {
      await storage.deleteEnhancedNotification(notification.id);
      deletedCount++;
    }    res.json({
      message: "Anciennes notifications supprimées avec succès",
      data: { deletedCount }
    });
  } catch (error) {
    console.error('Erreur lors du nettoyage des notifications:', error);
    res.status(500).json({
      message: "Erreur lors du nettoyage des notifications"
    });
  }
});

export default router;
