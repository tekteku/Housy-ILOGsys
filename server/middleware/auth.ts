/**
 * Middleware d'authentification JWT pour Housy
 * 
 * Implémente l'authentification basée sur JWT avec:
 * - Génération et vérification des tokens JWT
 * - Hachage sécurisé des mots de passe avec bcrypt
 * - Contrôle d'accès basé sur les rôles (RBAC)
 * - Gestion des sessions utilisateur
 * 
 * @author Housy Development Team
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db, users, eq } from '../storage.js';

// Configuration JWT
const JWT_SECRET: string = process.env.JWT_SECRET || 'housy-tunisia-secret-key-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Interface pour le payload JWT
export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  fullName: string;
  iat?: number;
  exp?: number;
}

// Extension de l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        fullName: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Classe utilitaire pour la gestion JWT
 */
export class AuthUtils {
  /**
   * Génère un hash sécurisé du mot de passe
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Vérifie si le mot de passe correspond au hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }  /**
   * Génère un token JWT d'accès
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
      issuer: 'housy-tunisia',
      subject: payload.userId.toString()
    } as SignOptions);
  }  /**
   * Génère un token JWT de rafraîchissement
   */
  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN as any,
      issuer: 'housy-tunisia',
      subject: payload.userId.toString()
    } as SignOptions);
  }

  /**
   * Vérifie et décode un token JWT
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  /**
   * Extrait le token depuis l'en-tête Authorization
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}

/**
 * Middleware d'authentification JWT principal
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification requis',
        code: 'AUTH_TOKEN_REQUIRED'
      });
    }

    // Vérifier et décoder le token
    const decoded = AuthUtils.verifyToken(token);

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
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur d\'authentification';
    
    return res.status(401).json({
      success: false,
      message: errorMessage,
      code: 'AUTH_TOKEN_INVALID'
    });
  }
};

/**
 * Middleware de vérification des rôles (RBAC)
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Rôle insuffisant',
        code: 'INSUFFICIENT_ROLE',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware pour les routes d'administration uniquement
 */
export const requireAdmin = requireRole('admin', 'super_admin');

/**
 * Middleware pour les routes client/admin
 */
export const requireUser = requireRole('client', 'admin', 'super_admin');

/**
 * Middleware optionnel d'authentification (n'échoue pas si non authentifié)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = AuthUtils.verifyToken(token);
      
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

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur authentifié
    next();
  }
};

/**
 * Définition des permissions par rôle
 */
export const ROLE_PERMISSIONS = {
  client: [
    'project:read:own',
    'project:create',
    'quotation:read:own',
    'quotation:request',
    'profile:read:own',
    'profile:update:own'
  ],
  admin: [
    'project:read:all',
    'project:create',
    'project:update:all',
    'project:delete:all',
    'user:read:all',
    'user:create',
    'user:update:all',
    'quotation:read:all',
    'quotation:create',
    'quotation:update:all',
    'material:read:all',
    'material:create',
    'material:update:all',
    'report:read:all',
    'report:generate'
  ],  super_admin: [
    '*' // Accès complet
  ]
};

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export const hasPermission = (userRole: string, permission: string): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  
  if (!rolePermissions) return false;
    // Super admin a tous les droits
  if (rolePermissions.includes('*')) return true;
  
  return rolePermissions.includes(permission);
};

/**
 * Middleware de vérification des permissions
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        message: 'Permission refusée',
        code: 'PERMISSION_DENIED',
        requiredPermission: permission,
        userRole: req.user.role
      });
    }

    next();
  };
};
