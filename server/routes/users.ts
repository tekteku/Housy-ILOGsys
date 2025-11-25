import { Router } from 'express';
import { ZodError } from 'zod';
import { storage, db, users, projects as projectsTable, eq, desc, and, or, ne, count } from '../storage';
import { insertUserSchema } from '../../shared/schema.js';

const router = Router();

// Middleware de validation
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

// GET /api/users - Obtenir tous les utilisateurs
router.get('/', async (req, res) => {
  try {    const { 
      role, 
      search, 
      status = 'active',
      page = 1, 
      limit = 20 
    } = req.query;

    // Build the where conditions
    const whereConditions = [];
    if (role) {
      whereConditions.push(eq(users.role, role as string));
    }

    // TODO: Ajouter filtrage par search et status quand les colonnes existent

    const usersList = await db.select({
      id: users.id,
      name: users.fullName,
      email: users.email,
      role: users.role,
      avatar: users.avatar,
      createdAt: users.createdAt
    })
    .from(users)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .limit(parseInt(limit as string))
    .offset((parseInt(page as string) - 1) * parseInt(limit as string))
    .orderBy(desc(users.createdAt));

    res.json({
      message: "Utilisateurs récupérés avec succès",
      data: usersList,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: usersList.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs"
    });
  }
});

// GET /api/users/:id - Obtenir un utilisateur par ID
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        message: "ID d'utilisateur invalide"
      });
    }    const [user] = await db
      .select({
        id: users.id,
        name: users.fullName,
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
        message: "Utilisateur non trouvé"
      });
    }

    res.json({
      message: "Utilisateur récupéré avec succès",
      data: user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'utilisateur"
    });
  }
});

// POST /api/users - Créer un nouvel utilisateur
router.post('/', validateRequest(insertUserSchema), async (req, res) => {
  try {
    const userData = req.body;
      // Vérifier si l'utilisateur existe déjà
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Un utilisateur avec cet email existe déjà"
      });
    }    // Créer l'utilisateur
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date()
      })
      .returning({
        id: users.id,
        name: users.fullName,
        email: users.email,
        role: users.role,
        profileImageUrl: users.avatar,
        createdAt: users.createdAt
      });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      data: newUser
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur"
    });
  }
});

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put('/:id', validateRequest(insertUserSchema.partial()), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const updateData = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        message: "ID d'utilisateur invalide"
      });
    }    // Si l'email est mis à jour, vérifier qu'il n'existe pas déjà
    if (updateData.email) {
      const existingUser = await db
        .select()
        .from(users)
        .where(and(
          eq(users.email, updateData.email),
          ne(users.id, userId)
        ))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(409).json({
          message: "Un utilisateur avec cet email existe déjà"
        });
      }
    }    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.fullName,
        email: users.email,
        role: users.role,
        profileImageUrl: users.avatar,
        createdAt: users.createdAt
      });

    if (!updatedUser) {
      return res.status(404).json({
        message: "Utilisateur non trouvé"
      });
    }

    res.json({
      message: "Utilisateur mis à jour avec succès",
      data: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'utilisateur"
    });
  }
});

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        message: "ID d'utilisateur invalide"
      });
    }    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.fullName,
        email: users.email
      });

    if (!deletedUser) {
      return res.status(404).json({
        message: "Utilisateur non trouvé"
      });
    }

    res.json({
      message: "Utilisateur supprimé avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression de l'utilisateur"
    });
  }
});

// PUT /api/users/:id/password - Changer le mot de passe d'un utilisateur
router.put('/:id/password', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        message: "ID d'utilisateur invalide"
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Mot de passe actuel et nouveau mot de passe requis"
      });
    }

    // TODO: Implémenter la vérification du mot de passe actuel
    // TODO: Implémenter le hachage du nouveau mot de passe    // Pour l'instant, mise à jour simple (à sécuriser en production)
    const [updatedUser] = await db
      .update(users)
      .set({ 
        password: newPassword // TODO: Hacher le mot de passe
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.fullName,
        email: users.email
      });

    if (!updatedUser) {
      return res.status(404).json({
        message: "Utilisateur non trouvé"
      });
    }

    res.json({
      message: "Mot de passe mis à jour avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du mot de passe"
    });
  }
});

// GET /api/users/:id/projects - Obtenir les projets d'un utilisateur
router.get('/:id/projects', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        message: "ID d'utilisateur invalide"
      });
    }    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.createdBy, userId))
      .orderBy(desc(projectsTable.createdAt));

    res.json({
      message: "Projets de l'utilisateur récupérés avec succès",
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets de l\'utilisateur:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des projets de l'utilisateur"
    });
  }
});

// GET /api/users/stats - Statistiques des utilisateurs
router.get('/stats', async (req, res) => {
  try {    const totalUsers = await db
      .select({ count: count() })
      .from(users);

    // TODO: Ajouter plus de statistiques quand les colonnes nécessaires existent
    const stats = {
      totalUsers: totalUsers[0]?.count || 0,
      // TODO: activeUsers, newUsersThisMonth, etc.
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
