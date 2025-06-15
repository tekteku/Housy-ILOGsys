/**
 * Composant d'inscription avec validation avancée et UI moderne
 * 
 * Features:
 * - Formulaire d'inscription multi-étapes
 * - Validation en temps réel avec feedback visuel
 * - Sélection de rôle avec icons
 * - Vérification de force du mot de passe
 * - Animations fluides et micro-interactions
 * 
 * @author Housy Development Team
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  CogIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useLocation } from 'wouter';

// Animation imports
import { FadeIn, AnimatedButton } from '../animations';

interface RegisterFormProps {
  onToggleMode: () => void;
  onSuccess?: () => void;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: 'client' | 'admin';
}

export function RegisterForm({ onToggleMode, onSuccess }: RegisterFormProps) {
  const [, setLocation] = useLocation();
  const { register, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'client',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validation du mot de passe avec calcul de force
  const validatePassword = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
    
    if (!password) return 'Mot de passe requis';
    if (password.length < 6) return 'Minimum 6 caractères';
    if (strength < 3) return 'Mot de passe trop faible';
    
    return '';
  };

  // Validation en temps réel
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value) return 'Nom d\'utilisateur requis';
        if (value.length < 3) return 'Minimum 3 caractères';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return 'Seuls les lettres, chiffres et _ sont autorisés';
        }
        return '';
      
      case 'email':
        if (!value) return 'Email requis';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Format d\'email invalide';
        }
        return '';
      
      case 'password':
        return validatePassword(value);
        
      case 'confirmPassword':
        if (!value) return 'Confirmation requise';
        if (value !== formData.password) return 'Les mots de passe ne correspondent pas';
        return '';
        
      case 'fullName':
        if (!value) return 'Nom complet requis';
        if (value.length < 2) return 'Minimum 2 caractères';
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
    
    // Validation du mot de passe de confirmation si le mot de passe change
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = formData.confirmPassword !== value ? 
        'Les mots de passe ne correspondent pas' : '';
      setFormErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
    
    // Effacer l'erreur globale si l'utilisateur tape
    if (error) {
      clearError();
    }
  };

  // Gestionnaire de sélection de rôle
  const handleRoleSelect = (role: 'client' | 'admin') => {
    setFormData(prev => ({ ...prev, role }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation complète
    const errors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'role') {
        const error = validateField(key, formData[key as keyof FormData] as string);
        if (error) errors[key] = error;
      }
    });
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setIsSubmitting(true);
    
    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      
      // Animation de succès
      setTimeout(() => {
        onSuccess?.();
        setLocation('/dashboard');
      }, 500);
      
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effacer les erreurs au démontage
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const isFormValid = !Object.values(formErrors).some(error => error) && 
                     Object.values(formData).every(value => value);

  // Fonction pour obtenir la couleur de la barre de force du mot de passe
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Faible';
    if (passwordStrength <= 3) return 'Moyen';
    if (passwordStrength <= 4) return 'Fort';
    return 'Très fort';
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      {/* Éléments décoratifs animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-200/20 to-amber-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <FadeIn direction="up" delay={0.1}>
        <Card className="w-full max-w-lg relative z-10 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <FadeIn direction="down" delay={0.2}>
            <CardHeader className="space-y-4 text-center pb-6">
          {/* Logo animé */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="text-white font-bold text-2xl">HT</div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Créer votre compte
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Rejoignez Housy dès maintenant
            </p>          </div>
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

          {/* Sélection du rôle */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Type de compte
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('client')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.role === 'client'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <UserIcon className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Client</div>
                <div className="text-xs text-gray-500">Particulier/Entreprise</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.role === 'admin'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <CogIcon className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Administrateur</div>
                <div className="text-xs text-gray-500">Équipe Housy</div>
              </button>
            </div>
          </div>

          {/* Formulaire d'inscription */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom complet */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Votre nom complet"
                className={`transition-all duration-200 ${
                  formErrors.fullName 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                }`}
                disabled={isSubmitting}
              />
              {formErrors.fullName && (
                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">
                  {formErrors.fullName}
                </p>
              )}
            </div>

            {/* Nom d'utilisateur */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="nom_utilisateur"
                className={`transition-all duration-200 ${
                  formErrors.username 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                }`}
                disabled={isSubmitting}
              />
              {formErrors.username && (
                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">
                  {formErrors.username}
                </p>
              )}
            </div>

            {/* Email */}
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

            {/* Mot de passe */}
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
              
              {/* Barre de force du mot de passe */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Force du mot de passe:</span>
                    <span className={`font-medium ${
                      passwordStrength <= 2 ? 'text-red-500' :
                      passwordStrength <= 3 ? 'text-yellow-500' :
                      passwordStrength <= 4 ? 'text-orange-500' : 'text-green-500'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`pr-10 transition-all duration-200 ${
                    formErrors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : formData.confirmPassword && !formErrors.confirmPassword
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                  }`}
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                  {formData.confirmPassword && !formErrors.confirmPassword && (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>            {/* Bouton d'inscription */}
            <AnimatedButton
              type="submit"
              variant="primary"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
              disabled={!isFormValid || isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Création du compte...</span>
                </div>              ) : (
                'Créer mon compte'
              )}
            </AnimatedButton>
          </form>

          {/* Lien vers la connexion */}
          <div className="text-center">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-500">ou</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            
            <div className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
              >
                Se connecter
              </button>            </div>
          </div>
        </CardContent>
          </FadeIn>
        </Card>
      </FadeIn>
    </div>
  );
}
