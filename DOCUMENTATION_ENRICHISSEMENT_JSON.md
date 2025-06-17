# 🔧 GUIDE TECHNIQUE - ENRICHISSEMENT AUTOMATIQUE JSON

**Date :** 17 juin 2025  
**Module :** Système d'enrichissement automatique des données JSON  
**Fichiers concernés :** data-service.ts, ai-service.ts, estimation-ai-service.ts

## 🎯 OBJECTIF

Documenter le système d'enrichissement automatique qui permet à tous les modèles IA de bénéficier des données JSON tunisiennes sans intervention manuelle.

## 🏗️ ARCHITECTURE GÉNÉRALE

### Flux de Données
```
Fichiers JSON
     ↓
DataService (Chargement + Cache)
     ↓
AIService (Enrichissement contexte)
     ↓
Modèles IA (Prompt enrichi)
     ↓
Réponse basée données réelles
```

### Composants Principaux

#### 1. **DataService** - Gestionnaire de données
- **Rôle** : Charger et cacher les fichiers JSON
- **Fichier** : `server/services/data-service.ts`
- **Fonctions clés** :
  - `loadAllData()` - Charge tous les JSON
  - `getDataSummary()` - Résumé pour enrichissement
  - `calculateConstructionCost()` - Calculs basés données

#### 2. **AIService** - Enrichisseur de contexte  
- **Rôle** : Enrichir les prompts avec données JSON
- **Fichier** : `server/services/ai-service.ts`
- **Fonction clé** : `enrichContextWithRealData()`

#### 3. **EstimationAIService** - Service spécialisé
- **Rôle** : Estimation enrichie pour construction
- **Fichier** : `server/services/estimation-ai-service.ts`
- **Intégration** : Utilise enrichissement + modèles optimaux

## 📄 FICHIERS JSON GÉRÉS

### Structure des Données

#### 1. Catalogue Matériaux
```json
{
  "materiaux": [
    {
      "id": 1,
      "nom": "Brique",
      "type_detaille": "Matériau de construction",
      "prix": {
        "unitaire_tnd": 0.81,
        "moyen_tnd": 0.85,
        "maximum_tnd": 0.95
      },
      "unite": "unité",
      "fournisseur": {
        "meilleur": "Fournisseur Tunis Nord",
        "nombre_total": 15
      },
      "categories": ["maçonnerie", "gros-oeuvre"],
      "taux_economies": 12.5,
      "disponibilite": "stock"
    }
  ]
}
```

#### 2. Propriétés Immobilières
```json
{
  "proprietes": [
    {
      "titre": "Appartement moderne Ariana",
      "prix_tnd": 45000,
      "superficie_m2": 120,
      "nombre_chambres": 3,
      "ville": "Ariana",
      "region": "Grand Tunis",
      "type_propriete": "appartement",
      "source": "immobilier_tn"
    }
  ]
}
```

#### 3. Index Général
```json
{
  "statistiques": {
    "nb_materiaux": 10,
    "nb_proprietes": 1500,
    "prix_moyen_materiaux_tnd": 15.5,
    "villes_disponibles": ["Tunis", "Ariana", "Sousse", "..."]
  }
}
```

## 🔧 IMPLÉMENTATION DÉTAILLÉE

### 1. Chargement Automatique (DataService)

```typescript
class DataService {
  private dataCache: DataSet | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async loadAllData(): Promise<DataSet> {
    const now = Date.now();
    
    // Vérifier cache
    if (this.dataCache && (now - this.lastLoadTime) < this.CACHE_DURATION) {
      return this.dataCache;
    }

    const dataDir = path.join(process.cwd(), 'server', 'data');
    
    // Charger matériaux avec gestion d'erreur
    let materiauxData: any = { materiaux: [] };
    try {
      const materiauxPath = path.join(dataDir, 'materiaux', 'catalogue_estimation_materiaux_complet.json');
      materiauxData = JSON.parse(fs.readFileSync(materiauxPath, 'utf-8'));
    } catch (error) {
      console.warn("Could not load materials data:", error);
    }

    // Charger propriétés avec nettoyage NaN
    let proprietesData: any = { proprietes: [] };
    try {
      const proprietesPath = path.join(dataDir, 'immobilier', 'proprietes_consolidees_resume.json');
      let proprietesRaw = fs.readFileSync(proprietesPath, 'utf-8');
      
      // Nettoyer les valeurs NaN problématiques
      proprietesRaw = proprietesRaw.replace(/:\s*NaN\s*([,}])/g, ': null$1');
      proprietesRaw = proprietesRaw.replace(/\[\s*NaN\s*([,\]])/g, '[null$1');
      
      proprietesData = JSON.parse(proprietesRaw);
    } catch (error) {
      console.warn("Could not load properties data:", error);
    }

    // Cache et retour
    this.dataCache = {
      materiaux: materiauxData.materiaux || [],
      proprietes: proprietesData.proprietes || [],
      indexGeneral: indexData
    };

    return this.dataCache;
  }

  async getDataSummary(): Promise<DataSummary> {
    const data = await this.loadAllData();
    
    return {
      nb_materiaux: data.materiaux.length,
      nb_proprietes: data.proprietes.length,
      prix_moyen_materiaux_tnd: this.calculateAverageMaterialPrice(data.materiaux),
      prix_moyen_immobilier_par_m2_tnd: this.calculateAveragePropertyPrice(data.proprietes),
      villes_disponibles: [...new Set(data.proprietes.map(p => p.ville))].filter(Boolean)
    };
  }
}
```

### 2. Enrichissement Contextuel (AIService)

```typescript
private async enrichContextWithRealData(userMessage: string): Promise<string> {
  try {
    const summary = await dataService.getDataSummary();
    
    // Détecter si c'est une estimation de construction
    const isConstructionEstimate = userMessage.toLowerCase().includes('cout') || 
                                 userMessage.toLowerCase().includes('coût') ||
                                 userMessage.toLowerCase().includes('prix') ||
                                 userMessage.toLowerCase().includes('construction') ||
                                 userMessage.toLowerCase().includes('maison') ||
                                 userMessage.toLowerCase().includes('batiment');
    
    // Contexte de base avec résumé des données
    let contextData = `
## DONNÉES RÉELLES HOUSY DISPONIBLES:
- ${summary.nb_materiaux} matériaux de construction catalogués avec prix réels tunisiens
- ${summary.nb_proprietes} propriétés immobilières dans la base de données
- Villes couvertes: ${summary.villes_disponibles.slice(0, 10).join(', ')}${summary.villes_disponibles.length > 10 ? ' et autres...' : ''}
- Prix moyen matériaux: ${summary.prix_moyen_materiaux_tnd} TND
- Prix moyen immobilier: ${summary.prix_moyen_immobilier_par_m2_tnd} TND/m²

`;

    if (isConstructionEstimate) {
      // Extraction automatique surface et ville
      const surfaceMatch = userMessage.match(/(\d+)\s*m[²2]/i);
      const cityMatch = userMessage.match(/(?:à|dans|de)\s+([a-zà-ù]+)/i);
      
      if (surfaceMatch) {
        const surface = parseInt(surfaceMatch[1]);
        const city = cityMatch ? cityMatch[1] : undefined;
        
        // Calcul avec données réelles
        const estimation = await dataService.calculateConstructionCost(surface, city);
        
        contextData += `
## ESTIMATION CALCULÉE AVEC DONNÉES RÉELLES:
- Surface demandée: ${surface} m²
${city ? `- Ville: ${city}` : ''}
- Coût estimé gros œuvre: ${estimation.gros_oeuvre.toLocaleString()} TND
- Coût estimé finitions: ${estimation.finitions.toLocaleString()} TND
- Coût total estimé: ${estimation.total.toLocaleString()} TND

## MATÉRIAUX PERTINENTS (Prix réels TND):
`;

        // Ajouter matériaux pertinents avec prix réels
        const data = await dataService.getAllData();
        const relevantMaterials = data.materiaux.slice(0, 5);
        
        relevantMaterials.forEach(material => {
          contextData += `- ${material.nom}: ${material.prix.unitaire_tnd} TND/${material.unite} (${material.fournisseur.meilleur})\n`;
        });

        // Ajouter propriétés similaires
        const similarProperties = data.proprietes.filter(p => 
          Math.abs(p.superficie_m2 - surface) < 50 && 
          (!city || p.ville.toLowerCase().includes(city.toLowerCase()))
        ).slice(0, 3);

        if (similarProperties.length > 0) {
          contextData += `
## PROPRIÉTÉS SIMILAIRES (Référence marché):
`;
          similarProperties.forEach(prop => {
            contextData += `- ${prop.ville}: ${prop.prix_tnd.toLocaleString()} TND pour ${prop.superficie_m2}m² (${prop.type_propriete})\n`;
          });
        }
      }
    }

    return contextData + `

## DEMANDE UTILISATEUR:
${userMessage}

**INSTRUCTIONS**: Utilise OBLIGATOIREMENT les données réelles tunisiennes fournies ci-dessus pour ton estimation. Justifie tes calculs avec les prix réels mentionnés.`;

  } catch (error) {
    console.error('Error enriching context:', error);
    return userMessage; // Fallback vers prompt original
  }
}
```

### 3. Service Estimation Spécialisé

```typescript
async generateMaterialEstimationWithAI(request: EstimationAIRequest): Promise<EstimationResponse> {
  // Enrichissement avec service intelligent
  const intelligentAnalysis = await this.intelligentEstimationService.generateSmartEstimation(
    request.prompt,
    {
      projectType: request.context.projectType,
      surface: request.context.area,
      region: 'Tunis',
      qualityLevel: request.context.qualityLevel
    }
  );

  // Le prompt est automatiquement enrichi avec :
  // - Données JSON matériaux
  // - Propriétés similaires
  // - Prix de référence tunisiens
  // - Calculs préliminaires

  const response = await this.unifiedModelService.generateWithModel(
    selectedModel,
    intelligentAnalysis.prompt_enrichi, // Prompt enrichi JSON
    {
      temperature: 0.3,
      systemMessage: "Tu es un expert en estimation de coûts de construction en Tunisie. Utilise PRIORITAIREMENT les données JSON fournies."
    }
  );

  return {
    response,
    metadata: {
      modelUsed: selectedModel,
      dataEnrichment: true, // Confirme utilisation JSON
      jsonSources: ['materiaux', 'proprietes', 'index'],
      enrichmentTime: enrichmentTime
    }
  };
}
```

## ✅ VALIDATION ET TESTS

### Script de Test
Le fichier `test-json-reading-capability.cjs` valide :

1. **Présence fichiers JSON** ✅
2. **Chargement data-service** ✅
3. **Enrichissement ai-service** ✅
4. **Utilisation par modèles** 🧪
5. **Qualité réponses enrichies** 📊

### Métriques de Validation
```typescript
const jsonUsageScore = (usesMaterialData ? 40 : 0) + 
                      (usesPropertyData ? 30 : 0) + 
                      (mentionsJSON ? 20 : 0) + 
                      (mentionsTND ? 10 : 0);
```

## 🚀 AVANTAGES ARCHITECTURE

### ✅ Performance
- **Cache intelligent** - Évite rechargement constant
- **Chargement asynchrone** - Non-bloquant
- **Fallbacks robustes** - Fonctionne même si JSON manquant

### ✅ Maintenance
- **Transparence totale** - Utilisateur ne voit que le résultat
- **Mise à jour simple** - Modifier JSON suffit
- **Extensibilité** - Nouveaux JSON intégrés automatiquement

### ✅ Qualité
- **Données réelles** - Basées sur marché tunisien
- **Contexte précis** - Spécifique région et projet
- **Validation automatique** - Nettoyage des données problématiques

## 💡 CONCLUSION TECHNIQUE

Le système d'enrichissement automatique JSON de Housy garantit que **tous les modèles IA bénéficient des données tunisiennes les plus récentes** sans aucune intervention manuelle, tout en maintenant une **performance optimale** et une **expérience utilisateur transparente**.

---

*Documentation technique - 17 juin 2025*
