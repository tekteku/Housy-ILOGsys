import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calculator, Home, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpBannerProps {
  onStartChat: () => void;
  onRegister: () => void;
}

export const HelpBanner: React.FC<HelpBannerProps> = ({ onStartChat, onRegister }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Nouveau sur Housy ?",
      subtitle: "Découvrez nos estimations de construction",
      cta: "Essayer gratuitement",
      image: "/static/images/modern_house_2.png"
    },
    {
      title: "Estimation instantanée",
      subtitle: "Obtenez le coût de votre projet en 30 secondes",
      cta: "Calculer maintenant",
      image: "/static/images/modern_house_4.png"
    },
    {
      title: "Données réelles tunisiennes",
      subtitle: "6036+ propriétés • Prix matériaux actualisés",
      cta: "Voir les prix",
      image: "/static/images/modern_house_5.png"
    }
  ];

  useEffect(() => {
    // Afficher la bannière après 3 secondes pour les nouveaux visiteurs
    const timer = setTimeout(() => {
      const hasSeenBanner = localStorage.getItem('housy_help_banner_seen');
      if (!hasSeenBanner) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const stepTimer = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % steps.length);
      }, 4000);

      return () => clearInterval(stepTimer);
    }
  }, [isVisible, steps.length]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('housy_help_banner_seen', 'true');
  };

  const handleStartChat = () => {
    setIsVisible(false);
    onStartChat();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Image */}
                <div className="hidden md:block w-12 h-12 rounded-lg overflow-hidden">
                  <img 
                    src={steps[currentStep].image} 
                    alt="Maison moderne"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Contenu */}
                <div className="flex-1">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="font-bold text-lg">{steps[currentStep].title}</h3>
                    <p className="text-blue-100 text-sm">{steps[currentStep].subtitle}</p>
                  </motion.div>
                </div>

                {/* Indicateurs de progression */}
                <div className="hidden md:flex space-x-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        index === currentStep ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartChat}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{steps[currentStep].cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Composant de guide interactif pour les nouveaux utilisateurs
export const InteractiveGuide: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const guideSteps = [
    {
      title: "Bienvenue sur Housy !",
      description: "Votre plateforme d'estimation de construction en Tunisie",
      position: "center",
      image: "/static/images/modern_house_1.png",
      highlight: null
    },
    {
      title: "Chat IA Assistant",
      description: "Posez vos questions sur les coûts de construction",
      position: "bottom-right",
      image: "/static/images/d2.png",
      highlight: ".assistant-chatbot-button"
    },
    {
      title: "Estimations gratuites",
      description: "Obtenez des devis sans inscription préalable",
      position: "center",
      image: "/static/images/modern_house_3.png",
      highlight: null
    }
  ];

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('housy_guide_completed');
    if (!hasSeenGuide) {
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeGuide();
    }
  };

  const completeGuide = () => {
    setIsVisible(false);
    localStorage.setItem('housy_guide_completed', 'true');
    onComplete();
  };

  if (!isVisible) return null;

  const currentGuideStep = guideSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
        >
          {/* Image */}
          <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
            <img 
              src={currentGuideStep.image} 
              alt="Guide step"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Contenu */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {currentGuideStep.title}
            </h3>
            <p className="text-gray-600">
              {currentGuideStep.description}
            </p>
          </div>

          {/* Progression */}
          <div className="flex justify-center space-x-2 mb-6">
            {guideSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={completeGuide}
              className="flex-1 px-4 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Passer
            </button>
            <button
              onClick={nextStep}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>{currentStep === guideSteps.length - 1 ? 'Commencer' : 'Suivant'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
