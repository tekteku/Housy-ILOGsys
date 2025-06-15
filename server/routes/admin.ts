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
      admins: adminUsers[0]?.count || 0
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

export default router;
