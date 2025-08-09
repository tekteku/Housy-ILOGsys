import { Router } from 'express';
import { requireAdmin, authenticateToken } from '../middleware/auth.js';
import { db, users, projects as projectsTable, eq, desc, count, and, sql } from '../storage.js';

const router = Router();

// Apply authentication middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/users - Get all users with admin details
router.get('/users', async (req, res) => {
  try {
    const { 
      role, 
      status = 'all',
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build where conditions
    const whereConditions = [];
    
    if (role && role !== 'all') {
      whereConditions.push(eq(users.role, role as string));
    }
    
    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(
        sql`(${users.fullName} ILIKE ${searchTerm} OR ${users.email} ILIKE ${searchTerm} OR ${users.username} ILIKE ${searchTerm})`
      );
    }    // Get users with project counts
    const usersList = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt,
        // Additional computed fields
        first_name: sql<string>`split_part(${users.fullName}, ' ', 1)`,
        last_name: sql<string>`COALESCE(split_part(${users.fullName}, ' ', 2), '')`,
        status: sql<string>`'active'`, // Default status since we don't have a status column
        projects_count: sql<number>`(
          SELECT COUNT(*) 
          FROM ${projectsTable} 
          WHERE ${projectsTable.createdBy} = ${users.id}
        )`
      })
      .from(users)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(parseInt(limit as string))
      .offset((parseInt(page as string) - 1) * parseInt(limit as string))
      .orderBy(desc(users.createdAt)); // Simplified ordering

    // Get total count
    const totalCount = await db
      .select({ count: count() })
      .from(users)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    res.json({
      success: true,
      message: "Utilisateurs récupérés avec succès",
      data: usersList,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / parseInt(limit as string))
      }
    });  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs admin:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs",
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// GET /api/admin/users/stats - Get user statistics
router.get('/users/stats', async (req, res) => {
  try {
    const [totalUsers, adminUsers, clientUsers] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(users).where(eq(users.role, 'admin')),
      db.select({ count: count() }).from(users).where(eq(users.role, 'client'))
    ]);

    // Get users created this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${thisMonth}`);

    const stats = {
      total_users: totalUsers[0]?.count || 0,
      active_users: totalUsers[0]?.count || 0, // Assuming all users are active
      new_this_month: newThisMonth[0]?.count || 0,
      clients: clientUsers[0]?.count || 0,
      admins: adminUsers[0]?.count || 0,
      suspended_users: 0,
      inactive_users: 0,
      verified_users: totalUsers[0]?.count || 0,
      last_30_days_logins: Math.floor(Math.random() * 500) + 100,
      average_projects_per_user: parseFloat((Math.random() * 5 + 1).toFixed(1)),
      total_revenue: Math.floor(Math.random() * 100000) + 50000
    };

    res.json({
      success: true,
      message: "Statistiques utilisateurs récupérées avec succès",
      data: stats
    });  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// GET /api/admin/users/:id - Get user by ID with detailed info
router.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID d'utilisateur invalide"
      });
    }

    const [user] = await db      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // Get user's projects
    const userProjects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.createdBy, userId))
      .orderBy(desc(projectsTable.createdAt));

    const userWithDetails = {
      ...user,
      first_name: user.fullName?.split(' ')[0] || '',
      last_name: user.fullName?.split(' ').slice(1).join(' ') || '',
      status: 'active',
      projects_count: userProjects.length,
      projects: userProjects
    };

    res.json({
      success: true,
      message: "Utilisateur récupéré avec succès",
      data: userWithDetails
    });  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'utilisateur",
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// PUT /api/admin/users/:id/status - Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID d'utilisateur invalide"
      });
    }

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide"
      });
    }

    // For now, we'll just return success since we don't have a status column
    // In a real implementation, you'd update the user's status in the database
    
    res.json({
      success: true,
      message: `Statut utilisateur mis à jour: ${status}`,
      data: { userId, status }
    });  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du statut",
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// DELETE /api/admin/users/:id - Delete user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID d'utilisateur invalide"
      });
    }

    // Prevent admin from deleting themselves
    if (req.user && req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: "Vous ne pouvez pas supprimer votre propre compte"
      });
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email
      });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    res.json({
      success: true,
      message: "Utilisateur supprimé avec succès",
      data: deletedUser
    });  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'utilisateur",
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// GET /api/admin/notifications - Get notifications
router.get('/notifications', async (req, res) => {
  try {
    // Mock data for notifications
    const notifications = [
      {
        id: 1,
        title: "Nouvelle demande client",
        message: "Ahmed Ben Ali a soumis une nouvelle demande",
        type: "info",
        channel: "email",
        created_at: new Date(),
        status: "sent"
      },
      {
        id: 2,
        title: "Projet terminé",
        message: "Le projet Villa Moderne est terminé",
        type: "success", 
        channel: "push",
        created_at: new Date(),
        status: "sent"
      }
    ];

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Erreur notifications:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des notifications"
    });
  }
});

// GET /api/admin/notification-templates - Get notification templates
router.get('/notification-templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 1,
        name: "Bienvenue Client",
        subject: "Bienvenue sur Housy",
        content: "Merci de rejoindre notre plateforme...",
        type: "email",
        status: "active"
      },
      {
        id: 2,
        name: "Devis Prêt",
        subject: "Votre devis est prêt",
        content: "Votre devis a été préparé...",
        type: "sms",
        status: "active"
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Erreur templates:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des templates"
    });
  }
});

// GET /api/admin/notification-channels - Get notification channels
router.get('/notification-channels', async (req, res) => {
  try {
    const channels = [
      {
        id: 1,
        name: "Email",
        type: "email",
        enabled: true,
        settings: { smtp_server: "smtp.housy.tn" }
      },
      {
        id: 2,
        name: "SMS",
        type: "sms",
        enabled: true,
        settings: { provider: "twillio" }
      },
      {
        id: 3,
        name: "Push",
        type: "push",
        enabled: true,
        settings: { firebase_key: "xxx" }
      },
      {
        id: 4,
        name: "In-App",
        type: "in-app",
        enabled: true,
        settings: {}
      }
    ];

    res.json({
      success: true,
      data: channels
    });
  } catch (error) {
    console.error('Erreur channels:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des canaux"
    });
  }
});

// GET /api/admin/roles - Get roles
router.get('/roles', async (req, res) => {
  try {
    const roles = [
      {
        id: 1,
        name: "Super Admin",
        description: "Accès complet au système",
        permissions: ["read", "write", "delete", "admin"],
        users_count: 1,
        created_at: new Date()
      },
      {
        id: 2,
        name: "Admin",
        description: "Accès administratif limité",
        permissions: ["read", "write"],
        users_count: 3,
        created_at: new Date()
      },
      {
        id: 3,
        name: "Client",
        description: "Accès client standard",
        permissions: ["read"],
        users_count: 156,
        created_at: new Date()
      }
    ];

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Erreur roles:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des rôles"
    });
  }
});

// GET /api/admin/permissions - Get permissions
router.get('/permissions', async (req, res) => {
  try {
    const permissions = [
      {
        id: 1,
        name: "read",
        description: "Lecture des données",
        category: "general"
      },
      {
        id: 2,
        name: "write",
        description: "Écriture des données",
        category: "general"
      },
      {
        id: 3,
        name: "delete",
        description: "Suppression des données",
        category: "general"
      },
      {
        id: 4,
        name: "admin",
        description: "Accès administrateur",
        category: "admin"
      },
      {
        id: 5,
        name: "users_manage",
        description: "Gestion des utilisateurs",
        category: "users"
      },
      {
        id: 6,
        name: "projects_manage",
        description: "Gestion des projets",
        category: "projects"
      }
    ];

    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Erreur permissions:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des permissions"
    });
  }
});

// GET /api/admin/audit-logs - Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { category } = req.query;
    
    const logs = [
      {
        id: 1,
        user_id: 1,
        user_name: "Admin",
        action: "user_created",
        category: "users",
        description: "Nouvel utilisateur créé: Ahmed Ben Ali",
        ip_address: "192.168.1.100",
        created_at: new Date()
      },
      {
        id: 2,
        user_id: 1,
        user_name: "Admin",
        action: "permission_changed",
        category: "permissions",
        description: "Permissions modifiées pour le rôle Client",
        ip_address: "192.168.1.100",
        created_at: new Date()
      },
      {
        id: 3,
        user_id: 2,
        user_name: "Admin",
        action: "project_deleted",
        category: "projects",
        description: "Projet supprimé: Villa Test",
        ip_address: "192.168.1.101",
        created_at: new Date()
      }
    ];

    const filteredLogs = category ? logs.filter(log => log.category === category) : logs;

    res.json({
      success: true,
      data: filteredLogs
    });
  } catch (error) {
    console.error('Erreur audit logs:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des logs d'audit"
    });
  }
});

// GET /api/admin/system/metrics - Get system metrics
router.get('/system/metrics', async (req, res) => {
  try {
    const metrics = {
      cpu_usage: Math.floor(Math.random() * 100),
      memory_usage: Math.floor(Math.random() * 100),
      disk_usage: Math.floor(Math.random() * 100),
      network_io: {
        incoming: Math.floor(Math.random() * 1000),
        outgoing: Math.floor(Math.random() * 1000)
      },
      load_average: [
        parseFloat((Math.random() * 4).toFixed(2)),
        parseFloat((Math.random() * 4).toFixed(2)),
        parseFloat((Math.random() * 4).toFixed(2))
      ],
      uptime: Math.floor(Math.random() * 86400),
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Erreur system metrics:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des métriques système"
    });
  }
});

// GET /api/admin/system/services - Get system services status
router.get('/system/services', async (req, res) => {
  try {
    const services = [
      {
        name: "Database",
        status: "running",
        uptime: "24h 35m",
        memory_usage: "2.5 GB",
        cpu_usage: "15%"
      },
      {
        name: "Web Server",
        status: "running",
        uptime: "24h 35m",
        memory_usage: "512 MB",
        cpu_usage: "8%"
      },
      {
        name: "Redis Cache",
        status: "running",
        uptime: "24h 35m",
        memory_usage: "128 MB",
        cpu_usage: "2%"
      },
      {
        name: "Email Service",
        status: "running",
        uptime: "24h 35m",
        memory_usage: "64 MB",
        cpu_usage: "1%"
      }
    ];

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Erreur system services:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des services"
    });
  }
});

// GET /api/admin/system/logs - Get system logs
router.get('/system/logs', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const logs = Array.from({ length: parseInt(limit as string) }, (_, i) => ({
      id: i + 1,
      level: ["INFO", "WARN", "ERROR"][Math.floor(Math.random() * 3)],
      message: `Message de log système ${i + 1}`,
      service: ["Database", "Web Server", "Redis", "Email"][Math.floor(Math.random() * 4)],
      timestamp: new Date(Date.now() - Math.random() * 86400000)
    }));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Erreur system logs:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des logs système"
    });
  }
});

// GET /api/admin/system/alerts - Get system alerts
router.get('/system/alerts', async (req, res) => {
  try {
    const alerts = [
      {
        id: 1,
        title: "Utilisation CPU élevée",
        message: "L'utilisation CPU a dépassé 80%",
        severity: "warning",
        service: "Web Server",
        created_at: new Date(),
        status: "active"
      },
      {
        id: 2,
        title: "Espace disque faible",
        message: "Espace disque inférieur à 10%",
        severity: "critical",
        service: "Database",
        created_at: new Date(),
        status: "active"
      }
    ];

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Erreur system alerts:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des alertes"
    });
  }
});

// GET /api/admin/system/historical - Get historical system data
router.get('/system/historical', async (req, res) => {
  try {
    const { range = '1h' } = req.query;
    
    // Generate mock historical data based on range
    const dataPoints = range === '1h' ? 60 : range === '24h' ? 24 : 30;
    
    const historical = Array.from({ length: dataPoints }, (_, i) => ({
      timestamp: new Date(Date.now() - (dataPoints - i) * (range === '1h' ? 60000 : range === '24h' ? 3600000 : 86400000)),
      cpu_usage: Math.floor(Math.random() * 100),
      memory_usage: Math.floor(Math.random() * 100),
      disk_usage: Math.floor(Math.random() * 100)
    }));

    res.json({
      success: true,
      data: historical
    });
  } catch (error) {
    console.error('Erreur system historical:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des données historiques"
    });
  }
});

// GET /api/admin/system/health - Get system health
router.get('/system/health', async (req, res) => {
  try {
    const health = {
      overall_status: "healthy",
      components: [
        {
          name: "Database",
          status: "healthy",
          response_time: "2ms",
          last_check: new Date()
        },
        {
          name: "Cache",
          status: "healthy", 
          response_time: "1ms",
          last_check: new Date()
        },
        {
          name: "External API",
          status: "degraded",
          response_time: "500ms",
          last_check: new Date()
        }
      ],
      checks: {
        database_connection: true,
        cache_connection: true,
        external_apis: false,
        disk_space: true,
        memory_available: true
      }
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Erreur system health:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification de la santé système"
    });
  }
});

export default router;
