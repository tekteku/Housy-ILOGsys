import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Database, TrendingUp, Building, Calculator } from 'lucide-react';
import MultiChartCard from '../dashboard/MultiChartCard';

interface MaterialAnalysis {
  projet: {
    type: string;
    surface: number;
    estimated_cost: number;
  };
  materiaux_recommandes: Array<{
    nom: string;
    quantite: number;
    prix_unitaire: number;
    cout_total: number;
    unite: string;
  }>;
  economies_possibles: number;
  total_estimation: number;
}

interface PropertyAnalysis {
  nombre_total_proprietes: number;
  analyse_par_region: Record<string, {
    nombre_proprietes: number;
    prix_moyen: number;
    prix_minimum: number;
    prix_maximum: number;
    accessibilite: string;
  }>;
  recommandations: string[];
}

const DataAnalysisHub: React.FC = () => {
  const [materialAnalysis, setMaterialAnalysis] = useState<MaterialAnalysis | null>(null);
  const [propertyAnalysis, setPropertyAnalysis] = useState<PropertyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'materials' | 'properties' | 'ai-context'>('materials');

  // Formulaire pour l'analyse des matériaux
  const [projectForm, setProjectForm] = useState({
    projectType: 'villa',
    surface: 200,
    description: 'Construction d\'une villa moderne',
    region: 'Tunis'
  });

  const analyzeMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data-analysis/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          projectType: projectForm.projectType,
          surface: projectForm.surface,
          description: projectForm.description
        })
      });

      const result = await response.json();
      if (result.success) {
        setMaterialAnalysis(result.data);
      }
    } catch (error) {
      console.error('Erreur analyse matériaux:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data-analysis/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          region: projectForm.region
        })
      });

      const result = await response.json();
      if (result.success) {
        setPropertyAnalysis(result.data);
      }
    } catch (error) {
      console.error('Erreur analyse immobilière:', error);
    } finally {
      setLoading(false);
    }
  };

  // Données pour les graphiques
  const materialChartData = materialAnalysis?.materiaux_recommandes.map(m => ({
    nom: m.nom,
    cout: m.cout_total,
    quantite: m.quantite
  })) || [];

  const propertyChartData = propertyAnalysis ? 
    Object.entries(propertyAnalysis.analyse_par_region).map(([region, data]) => ({
      region,
      prix_moyen: data.prix_moyen,
      nombre_proprietes: data.nombre_proprietes,
      accessibilite: data.accessibilite
    })) : [];

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Matériaux</p>
                <p className="text-lg font-semibold">525+</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Propriétés</p>
                <p className="text-lg font-semibold">6,036+</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Précision</p>
                <p className="text-lg font-semibold">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Économies</p>
                <p className="text-lg font-semibold">19.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'materials', label: 'Analyse Matériaux', icon: Database },
            { id: 'properties', label: 'Analyse Immobilière', icon: Building },
            { id: 'ai-context', label: 'Contexte IA', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-1 py-4 border-b-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire de projet */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type de Projet</label>
                <select
                  value={projectForm.projectType}
                  onChange={(e) => setProjectForm({...projectForm, projectType: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="villa">Villa</option>
                  <option value="appartement">Appartement</option>
                  <option value="maison">Maison</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Surface (m²)</label>
                <input
                  type="number"
                  value={projectForm.surface}
                  onChange={(e) => setProjectForm({...projectForm, surface: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded-md"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Région</label>
                <select
                  value={projectForm.region}
                  onChange={(e) => setProjectForm({...projectForm, region: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Tunis">Tunis</option>
                  <option value="Sfax">Sfax</option>
                  <option value="Sousse">Sousse</option>
                  <option value="Kairouan">Kairouan</option>
                  <option value="Bizerte">Bizerte</option>
                </select>
              </div>

              <Button 
                onClick={analyzeMaterials} 
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyser les Matériaux
              </Button>
            </CardContent>
          </Card>

          {/* Résultats de l'analyse */}
          <div className="lg:col-span-2 space-y-4">
            {materialAnalysis && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Estimation du Projet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Coût Total</p>
                        <p className="text-2xl font-bold text-green-600">
                          {materialAnalysis.total_estimation.toLocaleString()} TND
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Économies Possibles</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {materialAnalysis.economies_possibles.toLocaleString()} TND
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Matériaux Recommandés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {materialAnalysis.materiaux_recommandes.map((material, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{material.nom}</p>
                            <p className="text-sm text-gray-600">
                              {material.quantite} {material.unite} × {material.prix_unitaire} TND
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {material.cout_total.toLocaleString()} TND
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'properties' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Analyse Immobilière</h2>
            <Button onClick={analyzeProperties} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyser le Marché
            </Button>
          </div>

          {propertyAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MultiChartCard
                title="Prix Moyen par Région"
                data={propertyChartData}
                series={[
                  { key: 'prix_moyen', name: 'Prix Moyen (TND)', color: '#3b82f6' }
                ]}
                xAxisKey="region"
                type="bar"
                height={300}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Recommandations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {propertyAnalysis.recommandations.map((rec, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai-context' && (
        <Card>
          <CardHeader>
            <CardTitle>Contexte IA Enrichi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Données Certifiées Disponibles</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 525+ matériaux de construction (brico-direct.tn)</li>
                  <li>• 6,036+ propriétés immobilières (5 sources)</li>
                  <li>• Templates d'estimation validés</li>
                  <li>• Analyses comparatives régionales</li>
                  <li>• Taux de précision: 100%</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Capacités d'Analyse IA</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Estimation automatique de projets</li>
                  <li>• Comparaison de prix par région</li>
                  <li>• Recommandations de matériaux alternatifs</li>
                  <li>• Calcul d'économies possibles</li>
                  <li>• Génération de devis personnalisés</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="font-medium text-orange-800 mb-2">Contexte Tunisien Intégré</h3>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Code de l'urbanisme tunisien</li>
                  <li>• Climat méditerranéen</li>
                  <li>• Matériaux locaux spécialisés</li>
                  <li>• Prix du marché en temps réel</li>
                  <li>• Normes de construction locales</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataAnalysisHub;
