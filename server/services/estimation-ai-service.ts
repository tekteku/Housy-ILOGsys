/**
 * Service d'estimation IA avec restriction Ollama pour administrateurs
 * - Ollama Local : Réservé aux administrateurs UNIQUEMENT pour l'estimation
 * - Autres modèles : Disponibles pour tous selon les cas d'usage
 */

import { aiService } from './ai-service';

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
   * Génère une estimation de matériaux avec IA selon les permissions utilisateur
   */
  async generateMaterialEstimationWithAI(request: EstimationAIRequest): Promise<string> {
    const { prompt, context, userId, userRole, preferredModel } = request;
    
    // Déterminer le modèle approprié
    const selectedModel = this.determineModelForEstimation(userRole, preferredModel);
    
    // Log de sécurité pour l'utilisation d'Ollama
    if (selectedModel === 'ollama') {
      console.log(`🔒 OLLAMA ACCESS GRANTED - Admin estimation request from user ${userId} (role: ${userRole})`);
    }

    // Créer un prompt spécialisé pour l'estimation
    const estimationPrompt = this.buildEstimationPrompt(prompt, context, userRole);

    // Utiliser le service IA avec le modèle autorisé
    const sessionId = `estimation_${userId}_${Date.now()}`;
    
    try {
      const response = await aiService.processChatMessage(
        sessionId,
        userId || null,
        estimationPrompt,
        selectedModel
      );

      // Log du résultat pour audit
      console.log(`📊 Estimation IA generated using ${selectedModel} for user ${userId} (${userRole})`);
      
      return response;
    } catch (error) {
      console.error(`❌ Error generating estimation with ${selectedModel}:`, error);
      
      // Si Ollama échoue pour un admin, essayer avec un modèle cloud
      if (selectedModel === 'ollama' && this.canUseOllamaForEstimation(userRole)) {
        console.log(`🔄 Ollama failed for admin, falling back to OpenAI...`);
        return await aiService.processChatMessage(
          sessionId,
          userId || null,
          estimationPrompt,
          'openai'
        );
      }
      
      throw error;
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
  }

  /**
   * Obtient les modèles disponibles selon le rôle utilisateur
   */
  getAvailableModelsForUser(userRole?: string): Array<{id: string, name: string, description: string, restricted?: boolean}> {
    const baseModels = [
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
}

export const estimationAIService = new EstimationAIService();
