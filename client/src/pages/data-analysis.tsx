import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import DataAnalysisHub from '../components/dashboard/DataAnalysisHub';
import { Database, TrendingUp, FileText, BarChart3 } from 'lucide-react';

const DataAnalysisPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Database className="h-8 w-8 text-blue-600" />
                  Analyse de Données - Housy Tunisia
                </h1>
                <p className="mt-2 text-gray-600">
                  Système d'analyse basé sur 525+ matériaux et 6,036+ propriétés du marché tunisien
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Données certifiées</p>
                  <p className="text-lg font-semibold text-green-600">100% précision</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Introduction Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sources de Données</p>
                  <p className="text-2xl font-bold text-gray-900">7+</p>
                  <p className="text-xs text-gray-500 mt-1">Sites web certifiés</p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Matériaux</p>
                  <p className="text-2xl font-bold text-gray-900">525+</p>
                  <p className="text-xs text-gray-500 mt-1">Produits analysés</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Propriétés</p>
                  <p className="text-2xl font-bold text-gray-900">6,036+</p>
                  <p className="text-xs text-gray-500 mt-1">Biens immobiliers</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Économies</p>
                  <p className="text-2xl font-bold text-gray-900">19.9%</p>
                  <p className="text-xs text-gray-500 mt-1">Moyenne possible</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description du système */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">🚀 Système d'Analyse Intelligent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-700 mb-3">📊 Capacités d'Analyse</h3>
                <ul className="space-y-2 text-sm text-blue-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Estimation automatique de projets avec données réelles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Comparaison de prix par région tunisienne
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Recommandations de matériaux alternatifs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Calcul d'économies possibles optimisées
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-700 mb-3">🎯 Intégration IA</h3>
                <ul className="space-y-2 text-sm text-blue-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Prompts enrichis avec contexte tunisien
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Données certifiées intégrées aux modèles IA
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Réponses enrichies avec analyses de marché
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Conseils régionaux automatisés
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sources de données */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📋 Sources de Données Certifiées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'brico-direct.tn', type: 'Matériaux', count: '525+' },
                { name: 'remax.com.tn', type: 'Immobilier', count: '1,200+' },
                { name: 'mubawab.tn', type: 'Immobilier', count: '2,500+' },
                { name: 'fi-dari.tn', type: 'Immobilier', count: '1,800+' },
                { name: 'tecnocasa.tn', type: 'Immobilier', count: '536+' },
                { name: 'tunisie-annonce.com', type: 'Immobilier', count: '400+' },
                { name: 'menzili.tn', type: 'Immobilier', count: '300+' },
                { name: 'Templates locaux', type: 'Estimation', count: '10+' }
              ].map((source, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="font-medium text-gray-900 text-sm">{source.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{source.type}</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">{source.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hub d'analyse principal */}
        <DataAnalysisHub />

        {/* Comment utiliser avec l'IA */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">🤖 Intégration avec l'IA Housy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-700 mb-2">💡 Comment l'IA utilise ces données</h3>
                <p className="text-sm text-green-600 mb-3">
                  Toutes vos interactions avec l'IA sont maintenant enrichies avec ces données certifiées du marché tunisien.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">🔄 Processus Automatique</h4>
                    <ol className="text-xs text-green-600 space-y-1">
                      <li>1. Vous posez une question à l'IA</li>
                      <li>2. Le système charge les données pertinentes</li>
                      <li>3. Un prompt enrichi est généré</li>
                      <li>4. L'IA répond avec contexte tunisien</li>
                      <li>5. Analyses complémentaires ajoutées</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">📊 Données Intégrées</h4>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• Prix réels du marché tunisien</li>
                      <li>• Variations régionales certifiées</li>
                      <li>• Conseils climatiques spécialisés</li>
                      <li>• Réglementations locales</li>
                      <li>• Optimisations économiques</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataAnalysisPage;
