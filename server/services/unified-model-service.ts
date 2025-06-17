/**
 * Configuration avancée pour intégrer Perplexity et OpenAI avec Ollama
 * Date: 17 juin 2025
 * Approche: Proxy unifié via l'interface Ollama
 */

import OpenAI from 'openai';

// Configuration des modèles externes via Ollama
export interface ExternalModelConfig {
  name: string;
  provider: 'openai' | 'perplexity' | 'anthropic';
  apiKey: string;
  baseURL?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

// Configuration des modèles externes
const EXTERNAL_MODELS: ExternalModelConfig[] = [
  {
    name: 'gpt-4-turbo',
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    maxTokens: 2000,
    temperature: 0.7
  },
  {
    name: 'gpt-3.5-turbo',
    provider: 'openai', 
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-3.5-turbo',
    maxTokens: 1500,
    temperature: 0.7
  },
  {
    name: 'perplexity-online',
    provider: 'perplexity',
    apiKey: process.env.PPLX_API_KEY || '',
    baseURL: 'https://api.perplexity.ai',
    model: 'llama-3.1-sonar-large-128k-online',
    maxTokens: 2000,
    temperature: 0.5
  },
  {
    name: 'perplexity-chat',
    provider: 'perplexity',
    apiKey: process.env.PPLX_API_KEY || '',
    baseURL: 'https://api.perplexity.ai',
    model: 'llama-3.1-sonar-small-128k-chat',
    maxTokens: 1500,
    temperature: 0.7
  }
];

// Service unifié pour tous les modèles (Ollama + Externes)
export class UnifiedModelService {
  private openaiClients: Map<string, OpenAI> = new Map();

  constructor() {
    this.initializeExternalClients();
  }

  private initializeExternalClients() {
    // Initialiser les clients OpenAI et Perplexity
    EXTERNAL_MODELS.forEach(config => {
      if (config.provider === 'openai') {
        const client = new OpenAI({
          apiKey: config.apiKey,
          baseURL: config.baseURL
        });
        this.openaiClients.set(config.name, client);
      } else if (config.provider === 'perplexity') {
        const client = new OpenAI({
          apiKey: config.apiKey,
          baseURL: config.baseURL || 'https://api.perplexity.ai'
        });
        this.openaiClients.set(config.name, client);
      }
    });
  }

  // Méthode unifiée pour générer avec n'importe quel modèle
  async generateWithModel(
    modelName: string, 
    prompt: string, 
    options: {
      temperature?: number;
      maxTokens?: number;
      systemMessage?: string;
    } = {}
  ): Promise<string> {
    
    // Vérifier si c'est un modèle Ollama local
    if (await this.isOllamaModel(modelName)) {
      return this.generateWithOllama(modelName, prompt, options);
    }
    
    // Vérifier si c'est un modèle externe configuré
    const externalConfig = EXTERNAL_MODELS.find(m => m.name === modelName);
    if (externalConfig) {
      return this.generateWithExternalModel(externalConfig, prompt, options);
    }
    
    throw new Error(`Modèle non supporté: ${modelName}`);
  }

  // Génération avec Ollama (modèles locaux)
  private async generateWithOllama(
    modelName: string, 
    prompt: string, 
    options: any
  ): Promise<string> {
    const baseUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    
    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt,
          system: options.systemMessage,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.maxTokens || 1000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error(`Erreur Ollama modèle ${modelName}:`, error);
      throw error;
    }
  }

  // Génération avec modèles externes (OpenAI/Perplexity)
  private async generateWithExternalModel(
    config: ExternalModelConfig, 
    prompt: string, 
    options: any
  ): Promise<string> {
    const client = this.openaiClients.get(config.name);
    if (!client) {
      throw new Error(`Client non initialisé pour ${config.name}`);
    }

    try {
      const messages = [];
      
      if (options.systemMessage) {
        messages.push({ role: 'system', content: options.systemMessage });
      }
      
      messages.push({ role: 'user', content: prompt });

      const response = await client.chat.completions.create({
        model: config.model,
        messages: messages as any,
        max_tokens: options.maxTokens || config.maxTokens || 1000,
        temperature: options.temperature || config.temperature || 0.7
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error(`Erreur modèle externe ${config.name}:`, error);
      throw error;
    }
  }

  // Vérifier si un modèle est disponible dans Ollama
  private async isOllamaModel(modelName: string): Promise<boolean> {
    try {
      const baseUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
      const response = await fetch(`${baseUrl}/api/tags`);
      
      if (response.ok) {
        const data = await response.json();
        const models = data.models?.map((m: any) => m.name) || [];
        return models.includes(modelName) || models.some((m: string) => m.startsWith(modelName));
      }
      
      return false;
    } catch {
      return false;
    }
  }

  // Lister tous les modèles disponibles (Ollama + Externes)
  async getAllAvailableModels(): Promise<Array<{name: string, type: 'local' | 'external', provider: string}>> {
    const models: Array<{name: string, type: 'local' | 'external', provider: string}> = [];
    
    // Ajouter les modèles Ollama
    try {
      const baseUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
      const response = await fetch(`${baseUrl}/api/tags`);
      
      if (response.ok) {
        const data = await response.json();
        const ollamaModels = data.models || [];
        
        ollamaModels.forEach((model: any) => {
          models.push({
            name: model.name,
            type: 'local',
            provider: 'ollama'
          });
        });
      }
    } catch (error) {
      console.warn('Impossible de récupérer les modèles Ollama:', error);
    }
    
    // Ajouter les modèles externes configurés
    EXTERNAL_MODELS.forEach(config => {
      if (config.apiKey) { // Seulement si la clé API est configurée
        models.push({
          name: config.name,
          type: 'external',
          provider: config.provider
        });
      }
    });
    
    return models;
  }

  // Test de connectivité pour un modèle
  async testModel(modelName: string): Promise<{success: boolean, responseTime: number, error?: string}> {
    const startTime = Date.now();
    
    try {
      const testPrompt = "Réponds simplement 'Test réussi' en français.";
      const response = await this.generateWithModel(modelName, testPrompt, {
        temperature: 0.1,
        maxTokens: 50
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
}

export default UnifiedModelService;
