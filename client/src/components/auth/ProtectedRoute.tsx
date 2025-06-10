/**
 * Composant de route protégée avec contrôle d'accès basé sur les rôles
 * 
 * Features:
 * - Protection par authentification
 * - Contrôle d'accès basé sur les rôles (RBAC)
 * - Vérification des permissions
 * - Redirection automatique
 * - UI de chargement et d'erreur
 * 
 * @author Housy Development Team
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'wouter';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { ShieldExclamationIcon, UserIcon } from '@heroicons/react/24/outline';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string | string[];
  requiredPermissions?: string | string[];
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermissions,
  fallbackPath = '/auth',
  showAccessDenied = true,
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, user, hasRole, hasPermission } = useAuth();

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto animate-pulse">
            <div className="text-white font-bold text-xl">HT</div>
          </div>
          <div className="text-gray-600">Vérification des autorisations...</div>
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Redirection si non authentifié
  if (!isAuthenticated) {
    setTimeout(() => setLocation(fallbackPath), 100);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto" />
          <div className="text-gray-600">Redirection vers la connexion...</div>
        </div>
      </div>
    );
  }

  // Vérification des rôles requis
  if (requiredRoles && !hasRole(requiredRoles)) {
    if (!showAccessDenied) {
      setTimeout(() => setLocation(fallbackPath), 100);
      return null;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <ShieldExclamationIcon className="w-10 h-10 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Accès refusé</h2>
              <p className="text-gray-600">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </p>
            </div>

            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700 text-sm">
                <div className="space-y-1">
                  <div><strong>Rôle requis:</strong> {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}</div>
                  <div><strong>Votre rôle:</strong> {user?.role}</div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button
                onClick={() => setLocation('/dashboard')}
                variant="outline"
                className="flex-1"
              >
                Tableau de bord
              </Button>
              <Button
                onClick={() => setLocation(fallbackPath)}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                Retour
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vérification des permissions requises
  if (requiredPermissions) {
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    const hasAllPermissions = permissions.every(permission => hasPermission(permission));

    if (!hasAllPermissions) {
      if (!showAccessDenied) {
        setTimeout(() => setLocation(fallbackPath), 100);
        return null;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <ShieldExclamationIcon className="w-10 h-10 text-yellow-600" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Permissions insuffisantes</h2>
                <p className="text-gray-600">
                  Vous n'avez pas toutes les permissions nécessaires pour cette action.
                </p>
              </div>

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-700 text-sm">
                  <div className="space-y-1">
                    <div><strong>Permissions requises:</strong></div>
                    <ul className="list-disc list-inside text-left space-y-1 mt-2">
                      {permissions.map(permission => (
                        <li key={permission}>{permission}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setLocation('/dashboard')}
                  variant="outline"
                  className="flex-1"
                >
                  Tableau de bord
                </Button>
                <Button
                  onClick={() => setLocation(fallbackPath)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  Retour
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Afficher le contenu si toutes les vérifications passent
  return <>{children}</>;
}

// Composants de route protégée avec rôles prédéfinis
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'super_admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function ClientRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['client', 'admin', 'super_admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function SuperAdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles="super_admin" {...props}>
      {children}
    </ProtectedRoute>
  );
}
