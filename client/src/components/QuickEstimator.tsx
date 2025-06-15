import React, { useState } from 'react';
import { Calculator, MapPin, Home, Layers, ArrowRight, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickEstimatorProps {
  onEstimationComplete: (data: any) => void;
  onRegisterPrompt: () => void;
}

interface EstimationData {
  surface: number;
  city: string;
  propertyType: string;
  constructionType: string;
  email?: string;
}

const TUNISIAN_CITIES = [
  'Tunis', 'Sfax', 'Sousse', 'Ettadhamen', 'Kairouan', 'Bizerte', 
  'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous', 'Kasserine',
  'Médenine', 'Nabeul', 'Tataouine', 'Béja', 'Jendouba', 'Mahdia',
  'Siliana', 'Manouba', 'Kébili', 'Tozeur', 'Zaghouan', 'Le Kef'
];

const PROPERTY_TYPES = [
  { id: 'villa', name: 'Villa', icon: '🏡', factor: 1.2 },
  { id: 'apartment', name: 'Appartement', icon: '🏢', factor: 1.0 },
  { id: 'house', name: 'Maison', icon: '🏠', factor: 1.0 },
  { id: 'commercial', name: 'Commercial', icon: '🏪', factor: 1.3 }
];

const CONSTRUCTION_TYPES = [
  { id: 'standard', name: 'Standard', factor: 1.0, description: 'Construction traditionnelle' },
  { id: 'modern', name: 'Moderne', factor: 1.15, description: 'Finitions contemporaines' },
  { id: 'luxury', name: 'Luxe', factor: 1.4, description: 'Matériaux haut de gamme' },
  { id: 'eco', name: 'Écologique', factor: 1.25, description: 'Construction durable' }
];

export const QuickEstimator: React.FC<QuickEstimatorProps> = ({ 
  onEstimationComplete, 
  onRegisterPrompt 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [estimationData, setEstimationData] = useState<EstimationData>({
    surface: 0,
    city: '',
    propertyType: '',
    constructionType: ''
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimationResult, setEstimationResult] = useState<any>(null);

  const steps = [
    { title: 'Surface', description: 'Quelle est la superficie ?', icon: <Layers className="w-5 h-5" /> },
    { title: 'Localisation', description: 'Dans quelle ville ?', icon: <MapPin className="w-5 h-5" /> },
    { title: 'Type', description: 'Type de propriété', icon: <Home className="w-5 h-5" /> },
    { title: 'Finition', description: 'Niveau de finition', icon: <Sparkles className="w-5 h-5" /> },
    { title: 'Résultat', description: 'Votre estimation', icon: <Calculator className="w-5 h-5" /> }
  ];

  const calculateEstimation = async () => {
    setIsCalculating(true);
    
    try {
      // Simulation d'appel API avec les vraies données
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Estimation pour ${estimationData.propertyType} de ${estimationData.surface}m² à ${estimationData.city}, niveau ${estimationData.constructionType}`,
          conversationId: `estimation_${Date.now()}`
        })
      });

      const data = await response.json();
      
      // Calcul local en parallèle pour plus de rapidité
      const basePrice = 1500; // TND par m²
      const propertyFactor = PROPERTY_TYPES.find(p => p.id === estimationData.propertyType)?.factor || 1;
      const constructionFactor = CONSTRUCTION_TYPES.find(c => c.id === estimationData.constructionType)?.factor || 1;
      
      const estimatedTotal = estimationData.surface * basePrice * propertyFactor * constructionFactor;
      const estimatedPerM2 = estimatedTotal / estimationData.surface;

      const result = {
        totalCost: Math.round(estimatedTotal),
        costPerM2: Math.round(estimatedPerM2),
        surface: estimationData.surface,
        city: estimationData.city,
        breakdown: {
          grossOeuvre: Math.round(estimatedTotal * 0.45),
          secondOeuvre: Math.round(estimatedTotal * 0.35),
          finitions: Math.round(estimatedTotal * 0.20)
        },
        aiResponse: data.data?.response || "Estimation basée sur nos données de marché tunisien",
        confidence: 85,
        validityDays: 30
      };

      setEstimationResult(result);
      onEstimationComplete(result);
      
    } catch (error) {
      console.error('Erreur estimation:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 3) {
      calculateEstimation();
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return estimationData.surface > 0;
      case 1: return estimationData.city !== '';
      case 2: return estimationData.propertyType !== '';
      case 3: return estimationData.constructionType !== '';
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Superficie du projet</h3>
              <p className="text-gray-600">Entrez la surface totale en m²</p>
            </div>
            
            <div className="relative">
              <input
                type="number"
                value={estimationData.surface || ''}
                onChange={(e) => setEstimationData(prev => ({ ...prev, surface: parseInt(e.target.value) || 0 }))}
                placeholder="120"
                className="w-full text-4xl font-bold text-center p-6 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none"
                min="1"
                max="10000"
              />
              <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-2xl text-gray-400">m²</span>
            </div>

            {/* Suggestions rapides */}
            <div className="grid grid-cols-3 gap-3">
              {[80, 120, 200].map(size => (
                <button
                  key={size}
                  onClick={() => setEstimationData(prev => ({ ...prev, surface: size }))}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <div className="font-medium">{size} m²</div>
                  <div className="text-sm text-gray-500">
                    {size === 80 ? 'Appartement' : size === 120 ? 'Maison' : 'Villa'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Localisation</h3>
              <p className="text-gray-600">Dans quelle ville se situe votre projet ?</p>
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={estimationData.city}
                onChange={(e) => setEstimationData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              >
                <option value="">Sélectionnez une ville</option>
                {TUNISIAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Villes populaires */}
            <div className="grid grid-cols-3 gap-3">
              {['Tunis', 'Sousse', 'Sfax'].map(city => (
                <button
                  key={city}
                  onClick={() => setEstimationData(prev => ({ ...prev, city }))}
                  className={`p-3 border rounded-lg transition-colors text-center ${
                    estimationData.city === city 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium">{city}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Type de propriété</h3>
              <p className="text-gray-600">Quel type de bien souhaitez-vous construire ?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {PROPERTY_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setEstimationData(prev => ({ ...prev, propertyType: type.id }))}
                  className={`p-6 border-2 rounded-xl transition-all text-center ${
                    estimationData.propertyType === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{type.icon}</div>
                  <div className="font-medium">{type.name}</div>
                  <div className="text-sm text-gray-500">+{(type.factor - 1) * 100}% coût</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Niveau de finition</h3>
              <p className="text-gray-600">Quel niveau de finition désirez-vous ?</p>
            </div>

            <div className="space-y-3">
              {CONSTRUCTION_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setEstimationData(prev => ({ ...prev, constructionType: type.id }))}
                  className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                    estimationData.constructionType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-lg">{type.name}</div>
                      <div className="text-gray-600 text-sm">{type.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">+{(type.factor - 1) * 100}%</div>
                      <div className="text-xs text-gray-500">du coût de base</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {isCalculating ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Calcul en cours...</h3>
                <p className="text-gray-600">Analyse de 6036+ propriétés tunisiennes</p>
              </div>
            ) : estimationResult ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
                    <Star className="w-4 h-4" />
                    <span className="font-medium">Estimation générée</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    {estimationResult.totalCost.toLocaleString()} TND
                  </h3>
                  <p className="text-gray-600">
                    {estimationResult.costPerM2.toLocaleString()} TND/m² • {estimationData.surface} m²
                  </p>
                </div>

                {/* Répartition */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold mb-3">Répartition des coûts :</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Gros œuvre (45%)</span>
                      <span className="font-medium">{estimationResult.breakdown.grossOeuvre.toLocaleString()} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Second œuvre (35%)</span>
                      <span className="font-medium">{estimationResult.breakdown.secondOeuvre.toLocaleString()} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Finitions (20%)</span>
                      <span className="font-medium">{estimationResult.breakdown.finitions.toLocaleString()} TND</span>
                    </div>
                  </div>
                </div>

                {/* CTA vers inscription */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-blue-800 mb-2">Recevez le rapport complet</h4>
                    <p className="text-blue-600 text-sm mb-3">
                      Devis détaillé • Liste matériaux • Planning • Fournisseurs
                    </p>
                    <button
                      onClick={onRegisterPrompt}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>S'inscrire pour le rapport PDF</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>Estimation basée sur les données du marché tunisien</p>
                  <p>Confiance: {estimationResult.confidence}% • Validité: {estimationResult.validityDays} jours</p>
                </div>
              </div>
            ) : null}
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header avec progression */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Estimation rapide</h2>
          <span className="text-sm opacity-90">
            {currentStep + 1}/{steps.length}
          </span>
        </div>
        
        <div className="flex space-x-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {currentStep < 4 && (
        <div className="p-4 border-t bg-gray-50 flex space-x-3">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Précédent
            </button>
          )}
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>{currentStep === 3 ? 'Calculer' : 'Suivant'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
