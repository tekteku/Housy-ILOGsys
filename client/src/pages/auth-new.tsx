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

// Composant Chatbot Assistant intégré
const ChatbotAssistant = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je peux vous aider avec vos questions sur la construction et l\'immobilier en Tunisie. Que souhaitez-vous savoir ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: 'guest_session'
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue. Essayez de vous inscrire pour accéder à toutes les fonctionnalités.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-96 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-orange-500 text-white rounded-t-lg">
          <h3 className="font-semibold">🤖 Assistant Housy</h3>
          <button onClick={onClose} className="text-white hover:text-orange-200">
            ✕
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Posez votre question..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="bg-orange-500 text-white px-3 py-2 rounded-md text-sm hover:bg-orange-600 disabled:opacity-50"
            >
              📤
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Inscrivez-vous pour un accès complet !
          </p>
        </div>
      </div>
    </div>
  );
};

// Composant d'estimation rapide
const QuickEstimateWidget = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [surface, setSurface] = useState('');
  const [ville, setVille] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const calculateEstimate = async () => {
    if (!surface) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Combien coûte la construction d'une maison de ${surface}m2 ${ville ? `à ${ville}` : 'en Tunisie'} ?`,
          conversationId: 'estimate_session'
        })
      });

      const data = await response.json();
      setResult(data.data.response);
    } catch (error) {
      setResult('Erreur lors du calcul. Inscrivez-vous pour accéder aux estimations détaillées.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b bg-orange-500 text-white rounded-t-lg">
          <h3 className="font-semibold">📊 Estimation Rapide</h3>
          <button onClick={onClose} className="text-white hover:text-orange-200">
            ✕
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surface (m²) *
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
              Ville (optionnel)
            </label>
            <select
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Sélectionner une ville</option>
              <option value="Tunis">Tunis</option>
              <option value="Sousse">Sousse</option>
              <option value="Sfax">Sfax</option>
              <option value="Nabeul">Nabeul</option>
              <option value="Monastir">Monastir</option>
              <option value="Bizerte">Bizerte</option>
            </select>
          </div>
          
          <button 
            onClick={calculateEstimate}
            disabled={!surface || isLoading}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Calcul en cours...' : 'Calculer l\'estimation'}
          </button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Résultat :</h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">💡 Conseil</p>
            <p className="text-xs text-blue-600 mt-1">
              Inscrivez-vous gratuitement pour accéder aux estimations détaillées avec prix des matériaux, 
              références de propriétés similaires et calculs personnalisés !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Widget d'aide flottant
const HelpWidget = ({ onEstimate, onChat }: { onEstimate: () => void; onChat: () => void }) => {
  return (
    <div className="fixed bottom-4 left-4 z-40 animate-bounce">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
        <h4 className="font-semibold text-gray-800 mb-2">🏠 Nouveau sur Housy ?</h4>
        <p className="text-sm text-gray-600 mb-3">
          Découvrez nos outils gratuits avant de vous inscrire !
        </p>
        <div className="space-y-2">
          <button
            onClick={onEstimate}
            className="w-full text-left text-sm bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded transition-colors"
          >
            📊 Estimation de coûts
          </button>
          <button
            onClick={onChat}
            className="w-full text-left text-sm bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded transition-colors"
          >
            💬 Assistant IA
          </button>
        </div>
      </div>
    </div>
  );
};

// Bannière de conversion
const ConversionBanner = ({ hasInteracted }: { hasInteracted: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (hasInteracted) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 z-30 animate-slide-down">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm">
            🎉 Vous aimez nos outils ? Rejoignez +1000 professionnels de la construction !
          </span>
        </div>
        <button className="bg-white text-orange-500 px-4 py-1 rounded text-sm font-semibold hover:bg-orange-50 transition-colors">
          S'inscrire gratuitement
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

  // Afficher l'aide après 8 secondes si pas d'interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShowHelp(true);
      }
    }, 8000);

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
        
        <div className={`flex w-full transition-all duration-300 ${hasInteracted ? 'mt-12' : ''}`}>
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
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                    🚀 Essayez nos outils avant de vous inscrire
                  </h4>
                  <p className="text-sm text-orange-700 mb-3">
                    Découvrez la puissance de notre plateforme avec nos outils gratuits !
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleQuickEstimate}
                      className="flex-1 bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>📊</span>
                      <span>Estimation gratuite</span>
                    </button>
                    <button
                      onClick={handleChatOpen}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>🤖</span>
                      <span>Assistant IA</span>
                    </button>
                  </div>
                </div>
                
                {/* Témoignages/Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="p-2">
                    <div className="font-bold text-orange-600">1000+</div>
                    <div className="text-xs text-gray-600">Utilisateurs</div>
                  </div>
                  <div className="p-2">
                    <div className="font-bold text-orange-600">6036</div>
                    <div className="text-xs text-gray-600">Propriétés</div>
                  </div>
                  <div className="p-2">
                    <div className="font-bold text-orange-600">100%</div>
                    <div className="text-xs text-gray-600">Gratuit</div>
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
