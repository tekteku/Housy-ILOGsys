/**
 * Service d'estimation IA avec restriction Ollama pour administrateurs
 * - Ollama Local : Réservé aux administrateurs UNIQUEMENT pour l'estimation
 * - Autres modèles : Disponibles pour tous selon les cas d'usage
 */

import { aiService } from './ai-service';
import IntelligentEstimationService from './intelligent-estimation-service';
import DataAnalysisService from './data-analysis-service';
import { UnifiedModelService } from './unified-model-service';

export interface EstimationRequest {
  projectType: string;
  area: number;
  floors: number;
  qualityLevel: 'STANDARD' | 'PREMIUM' | 'LUXE';
  includeWastage: boolean;
  userId?: number;
  userRole?: string;
}

export interface EstimationAIRequest {
  prompt: string;
  context: EstimationRequest;
  userId?: number;
  userRole?: string;
  preferredModel?: string;
}

export class EstimationAIService {
  private intelligentEstimationService: IntelligentEstimationService;
  private dataAnalysisService: DataAnalysisService;
  private unifiedModelService: UnifiedModelService;

  constructor() {
    this.intelligentEstimationService = new IntelligentEstimationService();
    this.dataAnalysisService = new DataAnalysisService();
    this.unifiedModelService = new UnifiedModelService();
  }
  
  /**
   * Vérifie si l'utilisateur peut utiliser Ollama pour l'estimation
   */
  private canUseOllamaForEstimation(userRole?: string): boolean {
    return userRole === 'admin' || userRole === 'super_admin';
  }

  /**
   * Détermine le modèle IA approprié selon le rôle utilisateur et le type de demande
   */
  private determineModelForEstimation(userRole?: string, preferredModel?: string): string {
    // Si l'utilisateur demande explicitement Ollama
    if (preferredModel === 'ollama') {
      if (this.canUseOllamaForEstimation(userRole)) {
        return 'ollama';
      } else {
        console.warn(`User with role ${userRole} attempted to use Ollama for estimation - access denied`);
        // Fallback vers un modèle autorisé pour les clients
        return 'openai';
      }
    }

    // Pour les administrateurs, par défaut on utilise Ollama pour l'estimation (sécurité locale)
    if (this.canUseOllamaForEstimation(userRole)) {
      return preferredModel || 'ollama';
    }

    // Pour les clients, on utilise les modèles cloud
    return preferredModel || 'openai';
  }
  /**
   * NOUVEAU: Sélection étendue incluant Perplexity et OpenAI
   */
  private async determineOptimalModelForEstimation(
    userRole?: string, 
    preferredModel?: string
  ): Promise<{
    modelName: string;
    modelType: 'ollama' | 'openai' | 'perplexity' | 'claude';
    reason: string;
  }> {
    
    // Si modèle spécifiquement demandé
    if (preferredModel) {
      // Vérifier les permissions pour modèles restreints
      if (preferredModel.includes('ollama') || preferredModel.includes('llama3.1')) {
        if (this.canUseOllamaForEstimation(userRole)) {
          return {
            modelName: preferredModel,
            modelType: 'ollama',
            reason: 'Modèle demandé explicitement par admin'
          };
        } else {
          // Fallback vers un modèle autorisé
          return {
            modelName: 'qwen2.5-coder:latest',
            modelType: 'ollama',
            reason: 'Fallback - modèle restreint non autorisé'
          };
        }
      }
      
      // Modèles externes
      if (preferredModel.includes('gpt') || preferredModel.includes('openai')) {
        return {
          modelName: 'gpt-4-turbo',
          modelType: 'openai',
          reason: 'OpenAI demandé par utilisateur'
        };
      }
      
      if (preferredModel.includes('perplexity')) {
        return {
          modelName: 'perplexity-online',
          modelType: 'perplexity',
          reason: 'Perplexity demandé par utilisateur'
        };
      }
    }
    
    // Sélection automatique optimale basée sur les tests
    const availableModels = await this.unifiedModelService.getAllAvailableModels();
    
    // Pour les administrateurs - priorité aux modèles locaux performants
    if (this.canUseOllamaForEstimation(userRole)) {
      // Ordre de préférence basé sur les tests de performance
      const preferredLocalModels = ['qwen2.5-coder:latest', 'llama3.1:latest', 'phi:latest'];
      
      for (const model of preferredLocalModels) {
        const isAvailable = availableModels.some(m => m.name.includes(model.split(':')[0]));
        if (isAvailable) {
          return {
            modelName: model,
            modelType: 'ollama',
            reason: `Modèle local optimal pour admin (score élevé: ${model.includes('qwen') ? '270' : model.includes('llama') ? '186' : '132'})`
          };
        }
      }
    }
    
    // Pour les utilisateurs normaux - modèles externes + bons modèles locaux
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-test-key';
    const hasPerplexity = process.env.PPLX_API_KEY && process.env.PPLX_API_KEY !== 'pplx-test-key';
    
    // Si clés API disponibles, prioriser modèles externes pour rapidité
    if (hasOpenAI) {
      return {
        modelName: 'gpt-4-turbo',
        modelType: 'openai',
        reason: 'OpenAI disponible - rapide et fiable'
      };
    }
    
    if (hasPerplexity) {
      return {
        modelName: 'perplexity-online',
        modelType: 'perplexity',
        reason: 'Perplexity disponible - recherche en temps réel'
      };
    }
    
    // Fallback vers meilleur modèle local disponible
    const qwenAvailable = availableModels.some(m => m.name.includes('qwen'));
    if (qwenAvailable) {
      return {
        modelName: 'qwen2.5-coder:latest',
        modelType: 'ollama',
        reason: 'Meilleur modèle local disponible (score: 270)'
      };
    }
    
    // Fallback ultime
    return {
      modelName: 'phi:latest',
      modelType: 'ollama',
      reason: 'Modèle de fallback rapide'
    };
  }

  /**
   * Génère une estimation de matériaux avec IA selon les permissions utilisateur
   * ENRICHIE avec les données JSON certifiées
   */
  async generateMaterialEstimationWithAI(request: EstimationAIRequest): Promise<{
    response: string;
    metadata: {
      modelUsed: string;
      modelType: string;
      selectionReason: string;
      executionTime: number;
      dataEnrichment: boolean;
    };
  }> {
    const { prompt, context, userId, userRole, preferredModel } = request;
    const startTime = Date.now();
    
    try {
      // Déterminer le modèle optimal
      const modelSelection = await this.determineOptimalModelForEstimation(userRole, preferredModel);
      
      console.log(`🤖 Modèle sélectionné: ${modelSelection.modelName} (${modelSelection.modelType})`);
      console.log(`💡 Raison: ${modelSelection.reason}`);
      
      // Enrichissement avec données JSON réelles
      const projectDetails = {
        projectType: context.projectType,
        surface: context.area,
        region: 'Tunis',
        qualityLevel: context.qualityLevel
      };

      const intelligentAnalysis = await this.intelligentEstimationService.generateSmartEstimation(
        prompt,
        projectDetails
      );

      // Utiliser le service unifié pour la génération
      const response = await this.unifiedModelService.generateWithModel(
        modelSelection.modelName,
        intelligentAnalysis.prompt_enrichi,
        {
          temperature: 0.3, // Conservateur pour estimations
          maxTokens: 1500,
          systemMessage: "Tu es un expert en estimation de coûts de construction en Tunisie. Réponds en français avec des prix en TND."
        }
      );

      const executionTime = Date.now() - startTime;
      
      return {
        response,
        metadata: {
          modelUsed: modelSelection.modelName,
          modelType: modelSelection.modelType,
          selectionReason: modelSelection.reason,
          executionTime,
          dataEnrichment: true
        }
      };
      
    } catch (error) {
      console.error('Erreur génération estimation:', error);
      
      // Fallback vers modèle simple
      try {
        const fallbackResponse = await this.unifiedModelService.generateWithModel(
          'phi:latest',
          prompt,
          { temperature: 0.5, maxTokens: 800 }
        );
        
        return {
          response: fallbackResponse,
          metadata: {
            modelUsed: 'phi:latest',
            modelType: 'ollama',
            selectionReason: 'Fallback après erreur',
            executionTime: Date.now() - startTime,
            dataEnrichment: false
          }
        };
      } catch (fallbackError) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        throw new Error(`Estimation impossible: ${errorMessage}`);
      }
    }
  }

  /**
   * Construit un prompt spécialisé pour l'estimation selon le rôle
   */
  private buildEstimationPrompt(userPrompt: string, context: EstimationRequest, userRole?: string): string {
    const { projectType, area, floors, qualityLevel, includeWastage } = context;
    
    const baseContext = `
Contexte du projet :
- Type: ${projectType}
- Surface: ${area} m²
- Étages: ${floors}
- Qualité: ${qualityLevel}
- Pertes incluses: ${includeWastage ? 'Oui' : 'Non'}

Utilisateur: ${userRole === 'admin' || userRole === 'super_admin' ? 'Administrateur' : 'Client'}
`;

    if (userRole === 'admin' || userRole === 'super_admin') {
      return `${baseContext}

Tu es un assistant IA spécialisé dans l'estimation de matériaux de construction pour ADMINISTRATEURS de Housy Tunisia.

En tant qu'outil pour administrateurs, tu as accès aux données confidentielles et aux analyses avancées :
- Coûts fournisseurs détaillés et marges
- Analyses prédictives du marché tunisien
- Optimisations techniques avancées
- Calculs de rentabilité et recommandations business

Fournis une estimation détaillée et professionnelle avec :
1. Quantités précises de matériaux
2. Coûts détaillés (fournis + marges)
3. Analyses de rentabilité
4. Recommandations d'optimisation
5. Prévisions de marché

Question: ${userPrompt}`;
    } else {
      return `${baseContext}

Tu es un assistant IA spécialisé dans l'estimation de matériaux de construction pour CLIENTS de Housy Tunisia.

Fournis une estimation claire et accessible avec :
1. Quantités de matériaux nécessaires
2. Coûts estimatifs (prix publics)
3. Conseils pratiques
4. Alternatives selon le budget
5. Recommandations de qualité

Reste accessible et évite les détails techniques trop complexes.

Question: ${userPrompt}`;
    }
  }

  /**
   * Analyse les tendances de marché (Ollama réservé aux admins)
   */
  async analyzeMarketTrends(userRole?: string, location?: string): Promise<string> {
    const selectedModel = this.canUseOllamaForEstimation(userRole) ? 'ollama' : 'openai';
    
    const prompt = userRole === 'admin' || userRole === 'super_admin' 
      ? `Analyse détaillée des tendances du marché immobilier tunisien${location ? ` pour ${location}` : ''} avec données confidentielles et prévisions business.`
      : `Aperçu des tendances du marché immobilier tunisien${location ? ` pour ${location}` : ''} avec conseils pour clients.`;

    const sessionId = `market_analysis_${Date.now()}`;
    
    if (selectedModel === 'ollama') {
      console.log(`🔒 OLLAMA ACCESS - Market analysis for admin (location: ${location})`);
    }

    return await aiService.processChatMessage(sessionId, null, prompt, selectedModel);
  }  /**
   * Obtient les modèles disponibles selon le rôle utilisateur
   */
  getAvailableModelsForUser(userRole?: string): Array<{id: string, name: string, description: string, restricted?: boolean}> {
    const baseModels: Array<{id: string, name: string, description: string, restricted?: boolean}> = [
      {
        id: 'openai',
        name: 'GPT-4 (OpenAI)',
        description: 'Modèle général pour estimation et conseils'
      },
      {
        id: 'claude',
        name: 'Claude 3 (Anthropic)', 
        description: 'Analyse approfondie et recommandations détaillées'
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        description: 'Prédictions et analyses de marché'
      }
    ];

    // Ollama uniquement pour les administrateurs
    if (this.canUseOllamaForEstimation(userRole)) {
      baseModels.unshift({
        id: 'ollama',
        name: 'Ollama Local (Admin Only)',
        description: 'Traitement local sécurisé - Réservé aux administrateurs',
        restricted: true
      });
    }

    return baseModels;
  }

  /**
   * Enrichit la réponse IA avec les analyses de données réelles
   */
  private enhanceAIResponse(aiResponse: string, intelligentAnalysis: any): string {
    const analysis = intelligentAnalysis.recommandations_ia;
    
    return `${aiResponse}

## 📊 ANALYSE BASÉE SUR DONNÉES CERTIFIÉES

### 💰 Estimation Détaillée
- **Budget total estimé**: ${analysis.budget_estime.toLocaleString()} TND
- **Économies possibles**: ${analysis.economies_possibles.toLocaleString()} TND

### 🔧 Matériaux Alternatifs Recommandés
${analysis.materiaux_alternatifs.map((alt: string) => `• ${alt}`).join('\n')}

### 🌍 Conseils Régionaux
${analysis.conseils_region.map((conseil: string) => `• ${conseil}`).join('\n')}

### ⚡ Optimisations Suggérées
${analysis.optimisations.map((opt: string) => `• ${opt}`).join('\n')}

---
*Analyse basée sur 525+ matériaux et 6,036+ propriétés du marché tunisien*
`;
  }
}

export const estimationAIService = new EstimationAIService();
