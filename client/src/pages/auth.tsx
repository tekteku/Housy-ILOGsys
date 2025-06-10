/**
 * Page d'authentification principale avec transition fluide
 * 
 * Features:
 * - Basculement animé entre connexion et inscription
 * - Gestion de l'état d'authentification
 * - Redirection automatique si déjà connecté
 * - Animations de transition élégantes
 * 
 * @author Housy Development Team
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { AuthHero } from '../components/auth/AuthHero';
import { useLocation } from 'wouter';

// Animation imports
import { PageTransition, FadeIn } from '../components/animations';

export function AuthPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Fonction de basculement avec animation
  const toggleMode = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setMode(mode === 'login' ? 'register' : 'login');
      setIsTransitioning(false);
    }, 150);
  };

  // Fonction appelée après succès d'authentification
  const handleAuthSuccess = () => {
    setTimeout(() => {
      setLocation('/dashboard');
    }, 1000);
  };
  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
          <FadeIn direction="up" delay={0.1}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto animate-pulse">
                <div className="text-white font-bold text-xl">HT</div>
              </div>
              <div className="text-gray-600">Chargement...</div>
            </div>
          </FadeIn>
        </div>
      </PageTransition>
    );
  }

  // Ne pas afficher si déjà connecté
  if (isAuthenticated) {
    return null;
  }  return (
    <PageTransition>
      <div className="min-h-screen flex">
        {/* Hero Section - Left Side */}
        <FadeIn direction="left" delay={0.1}>
          <div className="hidden lg:flex lg:flex-1">
            <AuthHero />
          </div>
        </FadeIn>
        
        {/* Form Section - Right Side */}
        <FadeIn direction="right" delay={0.2}>
          <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-6 bg-white">
            <div className={`w-full transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {mode === 'login' ? (
                <LoginForm 
                  onToggleMode={toggleMode} 
                  onSuccess={handleAuthSuccess}
                />
              ) : (
                <RegisterForm 
                  onToggleMode={toggleMode} 
                  onSuccess={handleAuthSuccess}
                />
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
