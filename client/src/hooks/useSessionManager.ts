/**
 * Hook de gestion de session avancée
 * 
 * Features:
 * - Détection d'inactivité utilisateur
 * - Auto-rafraîchissement des tokens
 * - Déconnexion automatique
 * - Avertissements avant expiration
 * - Gestion multi-onglets
 * 
 * @author Housy Development Team
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SessionConfig {
  warningTime: number; // Temps avant avertissement (minutes)
  idleTime: number;    // Temps d'inactivité max (minutes)
  checkInterval: number; // Intervalle de vérification (millisecondes)
}

const DEFAULT_CONFIG: SessionConfig = {
  warningTime: 5,
  idleTime: 30,
  checkInterval: 60000 // 1 minute
};

export function useSessionManager(config: Partial<SessionConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { logout, refreshToken, isAuthenticated } = useAuth();
  
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const lastActivity = useRef(Date.now());
  const warningTimeout = useRef<NodeJS.Timeout>();
  const logoutTimeout = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Mise à jour de la dernière activité
  const updateActivity = useCallback(() => {
    lastActivity.current = Date.now();
    
    // Fermer l'avertissement si ouvert
    if (showWarning) {
      setShowWarning(false);
      setTimeLeft(0);
    }
    
    // Clear existing timeouts
    if (warningTimeout.current) {
      clearTimeout(warningTimeout.current);
    }
    if (logoutTimeout.current) {
      clearTimeout(logoutTimeout.current);
    }

    // Programmer l'avertissement
    warningTimeout.current = setTimeout(() => {
      if (isAuthenticated) {
        setShowWarning(true);
        setTimeLeft(finalConfig.warningTime * 60);
      }
    }, (finalConfig.idleTime - finalConfig.warningTime) * 60 * 1000);

    // Programmer la déconnexion
    logoutTimeout.current = setTimeout(() => {
      if (isAuthenticated) {
        handleAutoLogout();
      }
    }, finalConfig.idleTime * 60 * 1000);
  }, [showWarning, isAuthenticated, finalConfig]);

  // Déconnexion automatique
  const handleAutoLogout = useCallback(() => {
    setShowWarning(false);
    logout();
    
    // Notifier l'utilisateur
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session expirée', {
        body: 'Vous avez été déconnecté pour inactivité.',
        icon: '/favicon.ico'
      });
    }
  }, [logout]);

  // Étendre la session
  const extendSession = useCallback(async () => {
    try {
      await refreshToken();
      updateActivity();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      handleAutoLogout();
    }
  }, [refreshToken, updateActivity, handleAutoLogout]);

  // Événements d'activité utilisateur
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  // Gestionnaire d'événements throttlé
  const throttledActivityHandler = useCallback(() => {
    const now = Date.now();
    if (now - lastActivity.current > 5000) { // Throttle à 5 secondes
      updateActivity();
    }
  }, [updateActivity]);

  // Gestion de la synchronisation multi-onglets
  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (e.key === 'housy_last_activity') {
      const newActivity = parseInt(e.newValue || '0');
      if (newActivity > lastActivity.current) {
        lastActivity.current = newActivity;
        updateActivity();
      }
    }
  }, [updateActivity]);

  // Décompte du temps restant
  useEffect(() => {
    if (showWarning && timeLeft > 0) {
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [showWarning, timeLeft, handleAutoLogout]);

  // Mise à jour périodique dans le localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const updateStorage = () => {
        localStorage.setItem('housy_last_activity', lastActivity.current.toString());
      };

      intervalRef.current = setInterval(updateStorage, 10000); // Toutes les 10 secondes
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isAuthenticated]);

  // Setup et cleanup
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Demander permission pour les notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initialiser la session
    updateActivity();

    // Écouter les événements d'activité
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivityHandler, true);
    });

    // Écouter les changements dans le localStorage
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivityHandler, true);
      });
      window.removeEventListener('storage', handleStorageChange);
      
      if (warningTimeout.current) {
        clearTimeout(warningTimeout.current);
      }
      if (logoutTimeout.current) {
        clearTimeout(logoutTimeout.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, updateActivity, throttledActivityHandler, handleStorageChange]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (warningTimeout.current) {
        clearTimeout(warningTimeout.current);
      }
      if (logoutTimeout.current) {
        clearTimeout(logoutTimeout.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    showWarning,
    timeLeft,
    extendSession,
    handleAutoLogout,
    updateActivity
  };
}
