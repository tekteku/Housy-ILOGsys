import { Router } from 'express';
import { ZodError } from 'zod';
import { storage } from '../storage';
import { insertUserSchema } from '../../shared/schema.js';
import { db, users, eq } from '../storage.js';

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

// POST /api/auth/register - Inscription utilisateur
router.post('/register', validateRequest(insertUserSchema), async (req, res) => {
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
    }

    // Créer l'utilisateur
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur"
    });
  }
});

// POST /api/auth/login - Connexion utilisateur
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe requis"
      });
    }    // Trouver l'utilisateur
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        message: "Identifiants invalides"
      });
    }

    // TODO: Implémenter la vérification du mot de passe haché
    // Pour l'instant, comparaison simple (à sécuriser en production)
    if (user.password !== password) {
      return res.status(401).json({
        message: "Identifiants invalides"
      });
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: "Connexion réussie",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      message: "Erreur lors de la connexion"
    });
  }
});

// POST /api/auth/logout - Déconnexion utilisateur
router.post('/logout', (req, res) => {
  // TODO: Implémenter la gestion des sessions/tokens
  res.json({
    message: "Déconnexion réussie"
  });
});

// GET /api/auth/me - Obtenir les informations de l'utilisateur connecté
router.get('/me', async (req, res) => {
  try {
    // TODO: Implémenter la vérification du token/session
    // Pour l'instant, retourne un utilisateur fictif
    res.json({
      message: "Informations utilisateur récupérées",
      user: {
        id: 1,
        name: "Utilisateur Test",
        email: "test@housy-tunisia.com",
        role: "admin"
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des informations utilisateur"
    });
  }
});

export default router;
