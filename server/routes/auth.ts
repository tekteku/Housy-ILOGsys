import { Router } from 'express';
import { ZodError } from 'zod';
import { storage } from '../storage';
import { insertUserSchema } from '../../shared/schema.js';
import { db, users, eq } from '../storage.js';
import { AuthUtils, authenticateToken } from '../middleware/auth.js';

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
        success: false,
        message: "Un utilisateur avec cet email existe déjà",
        code: 'USER_ALREADY_EXISTS'
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await AuthUtils.hashPassword(userData.password);

    // Créer l'utilisateur avec mot de passe haché
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Générer les tokens JWT
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName
    };

    const accessToken = AuthUtils.generateAccessToken(tokenPayload);
    const refreshToken = AuthUtils.generateRefreshToken(tokenPayload);

    // Retourner l'utilisateur sans le mot de passe avec les tokens
    const { password, ...userWithoutPassword } = newUser;
    
    // Définir le cookie sécurisé pour le refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
    });
    
    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      user: userWithoutPassword,
      accessToken,
      tokenType: 'Bearer'
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'utilisateur",
      code: 'REGISTRATION_ERROR'
    });
  }
});

// POST /api/auth/login - Connexion utilisateur
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis",
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Trouver l'utilisateur
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides",
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Vérifier le mot de passe haché
    const isPasswordValid = await AuthUtils.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides",
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Générer les tokens JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };

    const accessToken = AuthUtils.generateAccessToken(tokenPayload);
    const refreshToken = AuthUtils.generateRefreshToken(tokenPayload);

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    
    // Définir le cookie sécurisé pour le refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
    });
    
    res.json({
      success: true,
      message: "Connexion réussie",
      user: userWithoutPassword,
      accessToken,
      tokenType: 'Bearer'
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
      code: 'LOGIN_ERROR'
    });
  }
});

// POST /api/auth/logout - Déconnexion utilisateur
router.post('/logout', (req, res) => {
  // Supprimer le cookie refresh token
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  res.json({
    success: true,
    message: "Déconnexion réussie"
  });
});

// GET /api/auth/me - Obtenir les informations de l'utilisateur connecté
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié",
        code: 'NOT_AUTHENTICATED'
      });
    }

    res.json({
      success: true,
      message: "Informations utilisateur récupérées",
      user: req.user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des informations utilisateur",
      code: 'USER_INFO_ERROR'
    });
  }
});

// POST /api/auth/refresh - Renouveler le token d'accès
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Token de rafraîchissement requis",
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    // Vérifier le refresh token
    const decoded = AuthUtils.verifyToken(refreshToken);

    // Récupérer l'utilisateur depuis la base de données
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        role: users.role
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
        code: 'USER_NOT_FOUND'
      });
    }

    // Générer un nouveau token d'accès
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };

    const newAccessToken = AuthUtils.generateAccessToken(tokenPayload);

    res.json({
      success: true,
      message: "Token renouvelé avec succès",
      accessToken: newAccessToken,
      tokenType: 'Bearer'
    });

  } catch (error) {
    console.error('Erreur lors du renouvellement du token:', error);
    
    // Supprimer le cookie invalide
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(401).json({
      success: false,
      message: "Token de rafraîchissement invalide",
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

export default router;
