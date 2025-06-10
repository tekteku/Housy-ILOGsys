/**
 * Page de connexion avec design HACIENDA pour Housy
 * 
 * Features:
 * - Design moderne avec bannière HACIENDA
 * - Intégration avec le système d'auth existant
 * - Compatible avec wouter routing
 * - Interface responsive et élégante * 
 * @author Housy Development Team
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  
  const { login, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      setLocation('/dashboard');
    } catch (err) {
      console.error('Erreur de connexion:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#162032] to-[#2D3B55] p-4">
      <div className="w-full max-w-md">
        {/* Logo en haut */}
        <div className="flex justify-center mb-6">
          <div className="text-white flex items-center">
            <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-2xl font-bold">HOUSY</span>
          </div>
        </div>
          {/* Image bannière HACIENDA */}
        <div className="rounded-t-xl overflow-hidden mb-0">
          <div className="relative">
            <img 
              src="/static/images/modern_house_1.png" 
              alt="HACIENDA - Construction Moderne" 
              className="w-full h-48 object-cover"
              onError={(e) => {
                // Fallback si l'image n'existe pas
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-48 bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                    <h2 class="text-white text-4xl font-bold">HACIENDA</h2>
                  </div>
                `;
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h2 className="text-white text-4xl font-bold">HACIENDA</h2>
            </div>
          </div>
        </div>
        
        {/* Formulaire de connexion */}
        <Card className="rounded-t-none shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-center">
              <div className="text-orange-500 flex items-center">
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <CardTitle className="text-xl font-bold text-orange-500">HOUSY</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Adresse e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="remember-me">Rester connecté</Label>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? 'Connexion en cours...' : 'Connexion'}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setLocation('/auth')}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  Retour à la page d'authentification
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
