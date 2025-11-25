/**
 * Page d'authentification principale avec fonctionnalités pré-inscription
 * 
 * Features:
 * - Basculement animé entre connexion et inscription
 * - Chatbot d'assistance intégré
 * - Estimation rapide sans inscription
 * - Démonstration des fonctionnalités
 * - Stratégies de conversion
 * - Gestion de l'état d'authentification
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

// Composants temporaires en attendant la création des vrais
const ChatbotAssistant = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-96">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-800">Assistant Housy</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Bonjour ! Je peux vous aider avec vos questions sur la construction et l'immobilier en Tunisie.
          </p>
          <div className="space-y-2">
            <button className="w-full text-left p-2 text-sm bg-orange-50 hover:bg-orange-100 rounded">
              💰 Estimer le coût de construction
            </button>
            <button className="w-full text-left p-2 text-sm bg-orange-50 hover:bg-orange-100 rounded">
              🏠 Prix des matériaux
            </button>
            <button className="w-full text-left p-2 text-sm bg-orange-50 hover:bg-orange-100 rounded">
              📍 Marché immobilier local
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickEstimateWidget = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [surface, setSurface] = useState('');
  const [ville, setVille] = useState('');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-800">Estimation Rapide</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surface (m²)
            </label>
            <input
              type="number"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ville
            </label>
            <select
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Sélectionner une ville</option>
              <option value="tunis">Tunis</option>
              <option value="sousse">Sousse</option>
              <option value="sfax">Sfax</option>
              <option value="nabeul">Nabeul</option>
            </select>
          </div>
          <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600">
            Calculer l'estimation
          </button>
          <p className="text-xs text-gray-500 text-center">
            Inscription gratuite pour accéder aux estimations détaillées
          </p>
        </div>
      </div>
    </div>
  );
};

const HelpWidget = ({ onEstimate, onChat }: { onEstimate: () => void; onChat: () => void }) => {
  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
        <h4 className="font-semibold text-gray-800 mb-2">🏠 Besoin d'aide ?</h4>
        <p className="text-sm text-gray-600 mb-3">
          Découvrez nos outils gratuits avant de vous inscrire !
        </p>
        <div className="space-y-2">
          <button
            onClick={onEstimate}
            className="w-full text-left text-sm bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded"
          >
            📊 Estimation rapide
          </button>
          <button
            onClick={onChat}
            className="w-full text-left text-sm bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded"
          >
            💬 Poser une question
          </button>
        </div>
      </div>
    </div>
  );
};

const ConversionBanner = ({ hasInteracted }: { hasInteracted: boolean }) => {
  if (!hasInteracted) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 z-30">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm">
            🎉 Vous aimez nos outils ? Inscrivez-vous pour accéder à toutes les fonctionnalités !
          </span>
        </div>
        <button className="bg-white text-orange-500 px-4 py-1 rounded text-sm font-semibold hover:bg-orange-50">
          S'inscrire
        </button>
      </div>
    </div>
  );
};

export function AuthPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // États pour les nouvelles fonctionnalités
  const [showQuickEstimate, setShowQuickEstimate] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Afficher l'aide après 5 secondes si pas d'interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShowHelp(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  // Fonction de basculement avec animation
  const toggleMode = () => {
    setIsTransitioning(true);
    setHasInteracted(true);
    
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

  // Gestionnaires pour les nouvelles fonctionnalités
  const handleQuickEstimate = () => {
    setShowQuickEstimate(true);
    setHasInteracted(true);
    setShowHelp(false);
  };

  const handleChatOpen = () => {
    setShowChatbot(true);
    setHasInteracted(true);
    setShowHelp(false);
  };

  const handleCloseQuickEstimate = () => {
    setShowQuickEstimate(false);
  };

  const handleCloseChatbot = () => {
    setShowChatbot(false);
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
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex relative">
        {/* Bannière de conversion */}
        <ConversionBanner hasInteracted={hasInteracted} />
        
        <div className={`flex w-full ${hasInteracted ? 'mt-12' : ''}`}>
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
                
                {/* Call-to-action pour les fonctionnalités */}
                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">
                    🚀 Essayez nos outils gratuits
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleQuickEstimate}
                      className="flex-1 bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600"
                    >
                      📊 Estimation rapide
                    </button>
                    <button
                      onClick={handleChatOpen}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                    >
                      💬 Assistance IA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
        
        {/* Widgets flottants */}
        {showHelp && !hasInteracted && (
          <HelpWidget 
            onEstimate={handleQuickEstimate}
            onChat={handleChatOpen}
          />
        )}
        
        <ChatbotAssistant 
          isOpen={showChatbot}
          onClose={handleCloseChatbot}
        />
        
        <QuickEstimateWidget 
          isOpen={showQuickEstimate}
          onClose={handleCloseQuickEstimate}
        />
      </div>
    </PageTransition>
  );
}
