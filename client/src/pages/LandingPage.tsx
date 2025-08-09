import React, { useState, useEffect } from 'react';
import { Home, Calculator, MessageCircle, Users, Star, ArrowRight, CheckCircle, Building, Eye, Heart, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { AssistantChatbot } from '../components/AssistantChatbot';
import { HelpBanner, InteractiveGuide } from '../components/HelpBanner';
import { ConversionStrategy, useConversionStrategy } from '../components/ConversionStrategy';
import { QuickEstimator } from '../components/QuickEstimator';
import { ImageGallery, ImageGrid, HOUSE_IMAGES } from '../components/ImageGallery';
import { QuickLogin } from '../components/QuickLogin';

interface LandingPageProps {
  onRegister: () => void;
  onLogin: () => void;
}

const FEATURES = [
  {
    icon: <Calculator className="w-8 h-8" />,
    title: "Estimations instantanées",
    description: "Obtenez le coût de votre construction en 30 secondes",
    images: ["/static/images/modern_house_2.png", "/static/images/house.png", "/static/images/modern_house_4.png"]
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Assistant IA spécialisé",
    description: "Posez vos questions à notre expert en construction tunisienne",
    images: ["/static/images/d1.png", "/static/images/modern_house_6.png", "/static/images/house3.png"]
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Réseau d'entrepreneurs",
    description: "Connectez-vous avec des professionnels vérifiés",
    images: ["/static/images/modern_house_3.png", "/static/images/house11.png", "/static/images/modern_house_8 (1).png"]
  }
];

const TESTIMONIALS = [
  {
    name: "Ahmed Ben Salem",
    location: "Tunis",
    avatar: "👨‍💼",
    comment: "Housy m'a fait économiser 15% sur ma construction !",
    rating: 5,
    project: "Villa 180m²"
  },
  {
    name: "Fatima Trabelsi", 
    location: "Sousse",
    avatar: "👩‍💼",
    comment: "Estimations très précises, je recommande vivement.",
    rating: 5,
    project: "Appartement 120m²"
  },
  {
    name: "Mohamed Gharbi",
    location: "Sfax", 
    avatar: "👨‍🔧",
    comment: "Interface simple, données fiables et actualisées.",
    rating: 5,
    project: "Maison 150m²"
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onRegister, onLogin }) => {
  const [showEstimator, setShowEstimator] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const { 
    shouldShowConversion, 
    conversionTrigger, 
    triggerConversion, 
    hideConversion 
  } = useConversionStrategy();

  // Animation des particules (même que AuthHero)
  useEffect(() => {
    const newParticles = Array.from({ length:20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
    }));
    setParticles(newParticles);
  }, []);

  const handleStartEstimation = () => {
    setShowEstimator(true);
  };

  const handleStartChat = () => {
    setShowChatbot(true);
  };

  const handleEstimationComplete = (data: any) => {
    triggerConversion('estimation_request');
  };

  const handleChatInteraction = () => {
    triggerConversion('chat_interaction');
  };

  return (
    <div className="min-h-screen relative">
      {/* Même background que AuthHero */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
        {/* Particules animées */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute bg-white/10 rounded-full animate-pulse"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.id * 0.1}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Arrière-plan avec overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Image de fond (construction tunisienne) */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23ffffff'/%3E%3Cstop offset='1' stop-color='%23e0e7ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='1200' height='800'/%3E%3Cpath d='M100 300h200v200H100z' fill='%23ddd6fe' opacity='0.3'/%3E%3Cpath d='M400 200h300v300H400z' fill='%23c4b5fd' opacity='0.3'/%3E%3Cpath d='M800 250h200v250H800z' fill='%23a78bfa' opacity='0.3'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Contenu avec z-index relatif */}
      <div className="relative z-10">
      {/* Help Banner pour les nouveaux visiteurs */}
      <HelpBanner onStartChat={handleStartChat} onRegister={onRegister} />

      {/* Navigation Header */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>              <div>
                <h1 className="text-xl font-bold text-white">Housy</h1>
                <p className="text-xs text-blue-200">Construction & Immobilier</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowQuickLogin(true)}
                className="px-4 py-2 text-blue-200 hover:text-white transition-colors font-medium"
              >
                Déjà client ?
              </button>
              <button
                onClick={onLogin}
                className="px-4 py-2 text-blue-200 hover:text-white transition-colors"
              >
                Connexion
              </button>
              <button
                onClick={onRegister}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </nav>      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >              <h1 className="text-5xl font-bold text-white mb-6">
                Estimez votre
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  {" "}construction{" "}
                </span>
                en Tunisie
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Obtenez des estimations précises basées sur 6,036+ propriétés tunisiennes 
                et des prix matériaux actualisés quotidiennement.
              </p>

              <div className="flex flex-col gap-4 mb-8">
                {/* Boutons principaux */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartEstimation}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Calculator className="w-5 h-5" />
                    <span>Estimation gratuite</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartChat}
                    className="flex-1 bg-white border-2 border-blue-200 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:border-blue-400 transition-all flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Poser une question</span>
                  </motion.button>
                </div>

                {/* Bouton connexion rapide pour les clients existants */}
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowQuickLogin(!showQuickLogin)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all flex items-center justify-center space-x-2 mx-auto"
                  >
                    <span>Déjà client ? Connectez-vous rapidement</span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${showQuickLogin ? 'rotate-90' : ''}`} />
                  </motion.button>
                </div>
              </div>              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">6,036+</div>
                  <div className="text-sm text-blue-200">Propriétés analysées</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">15,000+</div>
                  <div className="text-sm text-blue-200">Utilisateurs actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">98%</div>
                  <div className="text-sm text-blue-200">Satisfaction client</div>
                </div>
              </div>
            </motion.div>            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Galerie interactive avec toutes les images */}
              <ImageGallery 
                maxImages={8}
                category="all"
                className="mb-6"
              />
              
              {/* Badge flottant */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-lg z-20">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">19+ Modèles</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Login Section */}
      {showQuickLogin && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="py-12 bg-white/5 backdrop-blur-sm border-t border-white/10"
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <QuickLogin onCancel={() => setShowQuickLogin(false)} />
            </div>
          </div>
        </motion.section>
      )}

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Une plateforme complète pour estimer, planifier et réaliser vos projets de construction en Tunisie
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-white/20 hover:bg-white/15"
              >                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                
                {/* Mini galerie d'images pour chaque fonctionnalité */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {feature.images.map((imageSrc, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={imageSrc}
                      alt={`${feature.title} ${imgIndex + 1}`}
                      className="w-full h-20 object-cover rounded-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
                    />
                  ))}
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-blue-200">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-blue-200">
              Des milliers de Tunisiens nous font confiance pour leurs projets
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-blue-200">{testimonial.location} • {testimonial.project}</p>
                  </div>
                  <div className="flex text-yellow-400 ml-auto">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-blue-100 italic">"{testimonial.comment}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Prêt à commencer votre projet ?
          </h2>          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de Tunisiens qui utilisent Housy pour construire leurs rêves
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRegister}
              className="flex-1 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Créer mon compte</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartEstimation}
              className="flex-1 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
            >
              <Calculator className="w-5 h-5" />
              <span>Essayer maintenant</span>
            </motion.button>
          </div>
          </div>        </div>
      </section>

      {/* Gallery Section - Showcase all house models */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Découvrez Notre Catalogue de Maisons
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Plus de 19 modèles de maisons tunisiennes, du style traditionnel au design moderne. 
              Chaque propriété avec prix, surface et caractéristiques détaillées.
            </p>
          </div>

          {/* Grille d'images avec notre composant */}
          <ImageGrid maxImages={12} className="mb-8" />
          
          {/* Bouton pour voir plus */}
          <div className="text-center mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2 mx-auto"
            >
              <Eye className="w-5 h-5" />
              <span>Voir tous les modèles</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Statistiques de la galerie */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
                <Home className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">19+</div>
              <div className="text-sm text-blue-200">Modèles disponibles</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
                <Building className="w-8 h-8 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">4</div>
              <div className="text-sm text-blue-200">Catégories</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-blue-200">Constructions réelles</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">5★</div>
              <div className="text-sm text-blue-200">Satisfaction client</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800/50 backdrop-blur-sm text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Housy</span>
              </div>
              <p className="text-gray-400 mb-4">
                La plateforme leader en Tunisie pour l'estimation et la gestion de projets de construction.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Estimation de coûts</li>
                <li>Assistant IA</li>
                <li>Réseau d'entrepreneurs</li>
                <li>Suivi de projets</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Centre d'aide</li>
                <li>Contact</li>
                <li>Guides</li>
                <li>FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Données</h4>
              <ul className="space-y-2 text-gray-400">
                <li>6,036+ propriétés</li>
                <li>Prix matériaux actualisés</li>
                <li>Marché tunisien</li>
                <li>Tendances construction</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Housy Tunisia. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Modals et Overlays */}
      {showEstimator && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="relative">
            <button
              onClick={() => setShowEstimator(false)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
            >
              ×
            </button>
            <QuickEstimator
              onEstimationComplete={handleEstimationComplete}
              onRegisterPrompt={onRegister}
            />
          </div>
        </div>
      )}

      {/* Chatbot Assistant */}
      <AssistantChatbot onRegisterPrompt={handleChatInteraction} />

      {/* Interactive Guide */}
      <InteractiveGuide onComplete={() => {}} />      {/* Conversion Strategy */}
      {shouldShowConversion && (
        <ConversionStrategy
          trigger={conversionTrigger}
          onRegister={onRegister}
          onClose={hideConversion}
        />
      )}
      </div>
    </div>
  );
};
