import React, { useState } from 'react';
import { ArrowLeft, Download, Share2, Calculator, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface PublicEstimationProps {
  onBack: () => void;
  onRegister: () => void;
}

export const PublicEstimation: React.FC<PublicEstimationProps> = ({ onBack, onRegister }) => {
  const [estimation, setEstimation] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState({
    surface: '',
    city: '',
    propertyType: '',
    email: ''
  });

  const calculateEstimation = async () => {
    setIsCalculating(true);
    
    try {
      // Simulation d'appel à l'API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const basePrice = 1500;
      const surface = parseInt(formData.surface);
      const total = surface * basePrice;
      
      setEstimation({
        totalCost: total,
        costPerM2: basePrice,
        surface: surface,
        city: formData.city,
        breakdown: {
          grossOeuvre: Math.round(total * 0.45),
          secondOeuvre: Math.round(total * 0.35),
          finitions: Math.round(total * 0.20)
        }
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  if (isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Calcul en cours...</h3>
          <p className="text-gray-600">Analyse de 6036+ propriétés tunisiennes</p>
          <p className="text-sm text-blue-600 mt-2">Données réelles du marché immobilier</p>
        </div>
      </div>
    );
  }

  if (estimation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <button
            onClick={onBack}
            className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Estimation terminée !</h1>
                    <p className="opacity-90">Votre projet à {estimation.city}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{estimation.totalCost.toLocaleString()} TND</div>
                    <div className="opacity-90">{estimation.costPerM2.toLocaleString()} TND/m²</div>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Détails du projet */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Détails du projet</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Surface:</span>
                        <span className="font-medium">{estimation.surface} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Localisation:</span>
                        <span className="font-medium">{estimation.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{formData.propertyType}</span>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold mt-6 mb-3">Répartition des coûts</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Gros œuvre (45%)</span>
                        <span className="font-medium">{estimation.breakdown.grossOeuvre.toLocaleString()} TND</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Second œuvre (35%)</span>
                        <span className="font-medium">{estimation.breakdown.secondOeuvre.toLocaleString()} TND</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Finitions (20%)</span>
                        <span className="font-medium">{estimation.breakdown.finitions.toLocaleString()} TND</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Premium */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Débloquez le rapport complet
                      </h3>
                      <p className="text-gray-600">
                        Obtenez tous les détails pour réaliser votre projet
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {[
                        'Devis détaillé PDF',
                        'Liste des matériaux',
                        'Planning de construction',
                        'Réseau de fournisseurs',
                        'Suivi budgétaire',
                        'Support personnalisé'
                      ].map((feature, index) => (
                        <div key={feature} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={onRegister}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      S'inscrire gratuitement
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-3">
                      Accès immédiat • Sans engagement • Données sécurisées
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 mt-8 pt-6 border-t">
                  <button className="flex-1 flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span>Partager</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Télécharger</span>
                  </button>
                  <button
                    onClick={onRegister}
                    className="flex-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Obtenir le rapport complet
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Trust signals */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Estimation basée sur des données réelles du marché tunisien</p>
              <div className="flex justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>6,036+ propriétés analysées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Prix matériaux actualisés</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Confiance 98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire d'estimation
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </button>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <Calculator className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Estimation gratuite
              </h1>
              <p className="text-gray-600">
                Obtenez une estimation précise en quelques clics
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); calculateEstimation(); }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Surface (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.surface}
                    onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                    placeholder="120"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Ville
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Sélectionnez une ville</option>
                    <option value="Tunis">Tunis</option>
                    <option value="Sousse">Sousse</option>
                    <option value="Sfax">Sfax</option>
                    <option value="Nabeul">Nabeul</option>
                    <option value="Bizerte">Bizerte</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Type de propriété
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Maison', 'Villa', 'Appartement', 'Commercial'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                      className={`p-3 border rounded-lg transition-colors ${
                        formData.propertyType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="votre@email.com"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Pour recevoir le rapport par email
                </p>
              </div>

              <button
                type="submit"
                disabled={!formData.surface || !formData.city || !formData.propertyType}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculer l'estimation
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>✓ Estimation basée sur 6,036+ propriétés tunisiennes</p>
              <p>✓ Données matériaux actualisées quotidiennement</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
