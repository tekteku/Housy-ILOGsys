import React, { useState, useEffect } from 'react';
import { Star, Users, Shield, ArrowRight, Gift, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversionStrategyProps {
  onRegister: () => void;
  onClose: () => void;
  trigger: 'chat_interaction' | 'time_spent' | 'estimation_request';
}

export const ConversionStrategy: React.FC<ConversionStrategyProps> = ({ 
  onRegister, 
  onClose, 
  trigger 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(0);

  const offers = [
    {
      trigger: 'chat_interaction',
      title: "Vous aimez nos estimations ?",
      subtitle: "Inscrivez-vous pour débloquer encore plus de fonctionnalités",
      benefits: [
        "Sauvegarde de vos projets",
        "Devis détaillés PDF",
        "Comparateur de prix",
        "Réseau d'entrepreneurs"
      ],
      cta: "S'inscrire gratuitement",
      urgency: "Offre limitée : 7 jours d'essai Premium",
      image: "/static/images/modern_house_2.png",
      badge: "GRATUIT"
    },
    {
      trigger: 'time_spent',
      title: "Vous explorez depuis un moment",
      subtitle: "Créez votre compte pour ne rien perdre",
      benefits: [
        "Historique de vos recherches",
        "Alertes prix matériaux",
        "Conseils personnalisés",
        "Support prioritaire"
      ],
      cta: "Créer mon compte",
      urgency: "Accès immédiat à toutes les fonctionnalités",
      image: "/static/images/modern_house_4.png",
      badge: "RECOMMANDÉ"
    },
    {
      trigger: 'estimation_request',
      title: "Estimation terminée !",
      subtitle: "Recevez le rapport complet par email",
      benefits: [
        "Rapport PDF détaillé",
        "Planning de construction",
        "Liste fournisseurs",
        "Suivi budgétaire"
      ],
      cta: "Recevoir le rapport",
      urgency: "Rapport disponible 24h après inscription",
      image: "/static/images/modern_house_5.png",
      badge: "NOUVEAU"
    }
  ];

  const currentOfferData = offers.find(offer => offer.trigger === trigger) || offers[0];

  const testimonials = [
    {
      name: "Ahmed Ben Salem",
      location: "Tunis",
      avatar: "👨‍💼",
      comment: "Housy m'a fait économiser 15% sur ma construction !",
      rating: 5
    },
    {
      name: "Fatima Trabelsi",
      location: "Sousse", 
      avatar: "👩‍💼",
      comment: "Estimations très précises, je recommande.",
      rating: 5
    },
    {
      name: "Mohamed Gharbi",
      location: "Sfax",
      avatar: "👨‍🔧",
      comment: "Interface simple, données fiables.",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = () => {
    setIsVisible(false);
    onRegister();
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20">
                  <img 
                    src={currentOfferData.image} 
                    alt="Offer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                      {currentOfferData.badge}
                    </span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold">{currentOfferData.title}</h2>
                  <p className="text-blue-100">{currentOfferData.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Benefits */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Avantages inclus :</h3>
                  <div className="space-y-3">
                    {currentOfferData.benefits.map((benefit, index) => (
                      <motion.div
                        key={benefit}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Social Proof */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Témoignages :</h3>
                  <div className="space-y-3">
                    {testimonials.slice(0, 2).map((testimonial, index) => (
                      <motion.div
                        key={testimonial.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">{testimonial.avatar}</span>
                          <div>
                            <p className="font-medium text-sm">{testimonial.name}</p>
                            <p className="text-xs text-gray-500">{testimonial.location}</p>
                          </div>
                          <div className="flex text-yellow-400 ml-auto">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">"{testimonial.comment}"</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">6,036+</div>
                    <div className="text-sm text-blue-800">Propriétés</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">15,000+</div>
                    <div className="text-sm text-purple-800">Utilisateurs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <div className="text-sm text-green-800">Satisfaction</div>
                  </div>
                </div>
              </div>

              {/* Urgency */}
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-800 font-medium">
                    {currentOfferData.urgency}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Plus tard
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                >
                  <span>{currentOfferData.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Trust signals */}
              <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>100% Sécurisé</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Réseau vérifié</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gift className="w-4 h-4" />
                  <span>Sans engagement</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook pour gérer les stratégies de conversion
export const useConversionStrategy = () => {
  const [shouldShowConversion, setShouldShowConversion] = useState(false);
  const [conversionTrigger, setConversionTrigger] = useState<'chat_interaction' | 'time_spent' | 'estimation_request'>('chat_interaction');
  
  useEffect(() => {
    // Stratégie basée sur le temps passé
    const timeTimer = setTimeout(() => {
      const hasRegistered = localStorage.getItem('user_registered');
      if (!hasRegistered) {
        setConversionTrigger('time_spent');
        setShouldShowConversion(true);
      }
    }, 60000); // 1 minute

    return () => clearTimeout(timeTimer);
  }, []);

  const triggerConversion = (trigger: 'chat_interaction' | 'time_spent' | 'estimation_request') => {
    const hasRegistered = localStorage.getItem('user_registered');
    if (!hasRegistered) {
      setConversionTrigger(trigger);
      setShouldShowConversion(true);
    }
  };

  const hideConversion = () => {
    setShouldShowConversion(false);
  };

  return {
    shouldShowConversion,
    conversionTrigger,
    triggerConversion,
    hideConversion
  };
};
