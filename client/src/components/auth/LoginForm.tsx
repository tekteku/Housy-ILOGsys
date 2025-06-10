/**
 * Composant de connexion avec design moderne et animations fluides
 * 
 * Features:
 * - Interface utilisateur élégante avec animations
 * - Validation en temps réel des champs
 * - Gestion des erreurs avec feedback visuel
 * - Support responsive
 * - Transitions fluides entre états
 * 
 * @author Housy Development Team
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'wouter';

// Animation imports
import { FadeIn, AnimatedButton } from '../animations';

interface LoginFormProps {
  onToggleMode: () => void;
  onSuccess?: () => void;
}

export function LoginForm({ onToggleMode, onSuccess }: LoginFormProps) {
  const [, setLocation] = useLocation();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation en temps réel
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!value) return 'Email requis';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Format d\'email invalide';
        }
        return '';
      
      case 'password':
        if (!value) return 'Mot de passe requis';
        if (value.length < 6) return 'Minimum 6 caractères';
        return '';
        
      default:
        return '';
    }
  };

  // Gestionnaire de changement des champs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validation en temps réel
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
    
    // Effacer l'erreur globale si l'utilisateur tape
    if (error) {
      clearError();
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation complète
    const errors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) errors[key] = error;
    });
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setIsSubmitting(true);
    
    try {
      await login(formData.email, formData.password);
      
      // Animation de succès
      setTimeout(() => {
        onSuccess?.();
        setLocation('/dashboard');
      }, 500);
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effacer les erreurs au démontage
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const isFormValid = !Object.values(formErrors).some(error => error) && 
                     formData.email && formData.password;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      {/* Éléments décoratifs animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-200/20 to-amber-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <FadeIn direction="up" delay={0.1}>
        <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <FadeIn direction="down" delay={0.2}>
            <CardHeader className="space-y-4 text-center pb-8">
              {/* Logo animé */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="text-white font-bold text-2xl">HT</div>
              </div>
              
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Bienvenue sur Housy
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  Connectez-vous à votre espace de gestion
                </p>
              </div>
            </CardHeader>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <CardContent className="space-y-6">
          {/* Message d'erreur global */}
          {error && (
            <Alert className="border-red-200 bg-red-50 text-red-700 animate-in slide-in-from-top-2 duration-300">
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="votre@email.com"
                className={`transition-all duration-200 ${
                  formErrors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                }`}
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`pr-10 transition-all duration-200 ${
                    formErrors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">
                  {formErrors.password}
                </p>
              )}
            </div>            {/* Bouton de connexion */}
            <AnimatedButton
              type="submit"
              variant="primary"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
              disabled={!isFormValid || isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                'Se connecter'
              )}
            </AnimatedButton>
          </form>

          {/* Liens additionnels */}
          <div className="space-y-4 text-center">
            <button
              type="button"
              className="text-sm text-orange-600 hover:text-orange-700 transition-colors duration-200"
            >
              Mot de passe oublié ?
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-500">ou</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            
            <div className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
              >
                Créer un compte
              </button>            </div>
          </div>
            </CardContent>
          </FadeIn>
        </Card>
      </FadeIn>
    </div>
  );
}
