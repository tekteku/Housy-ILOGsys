/**
 * Context d'authentification React pour Housy
 * 
 * Gère l'état d'authentification global de l'application avec:
 * - État utilisateur persistant
 * - Gestion des tokens JWT
 * - Contrôle d'accès basé sur les rôles
 * - Auto-rafraîchissement des tokens
 * 
 * @author Housy Development Team
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types d'utilisateur et d'authentification
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'client' | 'admin' | 'super_admin';
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Actions du reducer d'authentification
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// État initial
const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer d'authentification
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        accessToken: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Interface du contexte d'authentification
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// API d'authentification
class AuthAPI {
  private static baseURL = '/api/auth';

  static async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur de connexion');
    }

    return response.json();
  }

  static async register(userData: any) {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur d\'inscription');
    }

    return response.json();
  }

  static async logout() {
    const response = await fetch(`${this.baseURL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur de déconnexion');
    }

    return response.json();
  }

  static async refreshToken() {
    const response = await fetch(`${this.baseURL}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur de rafraîchissement du token');
    }

    return response.json();
  }

  static async getCurrentUser(token: string) {
    const response = await fetch(`${this.baseURL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur de récupération des informations utilisateur');
    }

    return response.json();
  }
}

// Définition des permissions par rôle (synchronisé avec le backend)
const ROLE_PERMISSIONS = {
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
  ],  super_admin: ['*'] // Accès complet
};

// Composant fournisseur d'authentification
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await AuthAPI.login(email, password);
      
      // Stocker le token dans localStorage
      localStorage.setItem('accessToken', response.accessToken);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          accessToken: response.accessToken,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Fonction d'inscription
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await AuthAPI.register({
        ...userData,
        role: userData.role || 'client',
      });
      
      // Stocker le token dans localStorage
      localStorage.setItem('accessToken', response.accessToken);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          accessToken: response.accessToken,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'inscription';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('accessToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Fonction de rafraîchissement du token
  const refreshToken = async () => {
    try {
      const response = await AuthAPI.refreshToken();
      localStorage.setItem('accessToken', response.accessToken);
      dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: response.accessToken });
    } catch (error) {
      console.error('Erreur de rafraîchissement du token:', error);
      logout();
    }
  };

  // Fonction pour effacer les erreurs
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Fonction pour vérifier les rôles
  const hasRole = (roles: string | string[]): boolean => {
    if (!state.user) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(state.user.role);
  };  // Fonction pour vérifier les permissions
  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[state.user.role as keyof typeof ROLE_PERMISSIONS];
    if (!rolePermissions) return false;
    
    // Super admin a tous les droits
    if (rolePermissions.includes('*')) return true;
    
    return rolePermissions.includes(permission);
  };

  // Effet pour initialiser l'authentification au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          const response = await AuthAPI.getCurrentUser(token);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.user,
              accessToken: token,
            },
          });
        } catch (error) {
          localStorage.removeItem('accessToken');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Effet pour gérer le rafraîchissement automatique du token
  useEffect(() => {
    if (!state.accessToken) return;

    // Rafraîchir le token toutes les 5 minutes
    const interval = setInterval(() => {
      refreshToken();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.accessToken]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
