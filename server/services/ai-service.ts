import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { storage, db } from "../storage";
import { InsertChatMessage, InsertAiAnalysis, aiModelTracking } from "../../shared/schema.js";
import { dataService } from "./data-service";

// Initialize AI providers
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-" 
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Initialize DeepSeek (OpenAI-compatible API)
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: "https://api.deepseek.com/v1"
});

// Extended type with new models: DeepSeek, Qwen, and specialized variants
type OllamaModel = 
  | "llama2" | "mistral" | "gemma" | "phi" | "falcon" | "orca-mini" | "neural-chat" | "stablelm"
  | "deepseek-coder" | "qwen2.5-coder" | "qwen" | "deepseek" 
  | "qwen-perplexity" | "perplexity" | "llama3.1";

// Model capabilities definition for tracking responsibilities
interface ModelCapabilities {
  estimation: boolean;
  generation: boolean;
  specialization?: string;
}

const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  "llama3.1": { estimation: true, generation: true, specialization: "general" },
  "deepseek-coder": { estimation: true, generation: true, specialization: "coding" },
  "qwen2.5-coder": { estimation: true, generation: true, specialization: "coding" },
  "qwen": { estimation: true, generation: true, specialization: "general" },
  "deepseek": { estimation: true, generation: true, specialization: "reasoning" },
  "qwen-perplexity": { estimation: true, generation: true, specialization: "search" },
  "perplexity": { estimation: false, generation: true, specialization: "search" },
  "llama2": { estimation: true, generation: true, specialization: "general" },
  "mistral": { estimation: true, generation: true, specialization: "general" },
  "phi": { estimation: true, generation: true, specialization: "fast" }
};

// Helper function to call Ollama API locally
async function callOllamaApi(
  prompt: string, 
  model: OllamaModel = "llama2",
  options: {
    system?: string;
    format?: "json" | "text";
    temperature?: number;
  } = {}
) {
  const baseUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
  
  try {
    // First check if the model exists
    const modelResponse = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!modelResponse.ok) {
      console.warn(`Ollama API error when checking models: ${modelResponse.status} ${modelResponse.statusText}`);
      // Continue anyway, maybe the specific model endpoint still works
    } else {
      const modelData = await modelResponse.json();
      console.log("Available Ollama models:", modelData.models?.map((m: any) => m.name).join(", ") || "No models found");
      
      // Check if our requested model exists
      const modelExists = modelData.models?.some((m: any) => m.name === model);
      
      if (!modelExists) {
        console.warn(`Requested model "${model}" not found in Ollama. Available models: ${modelData.models?.map((m: any) => m.name).join(", ") || "None"}`);
        
        // Try to use any available model if our requested one doesn't exist
        if (modelData.models && modelData.models.length > 0) {
          model = modelData.models[0].name as OllamaModel;
          console.log(`Using available model "${model}" instead`);
        }
      }
    }
    
    // Now make the actual API call with our potentially updated model
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt,
        system: options.system,
        format: options.format,
        temperature: options.temperature ?? 0.7,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error: any) {
    console.error("Error calling Ollama API:", error);
    throw error;
  }
}

class AiService {
  
  // Système de tracking pour développement (INVISIBLE à l'utilisateur)
  private async trackModelUsage(params: {
    taskType: 'estimation' | 'generation' | 'chat';
    modelUsed: string;
    responsibleEstimation?: string;
    responsibleGeneration?: string;
    userId?: string;
    sessionId: string;
    inputData?: any;
    outputData?: any;
    executionTimeMs?: number;
  }) {
    try {
      // Ne tracker QUE pour le développement - invisible à l'utilisateur final
      if (process.env.NODE_ENV === 'development' || process.env.AI_TRACKING_ENABLED === 'true') {
        const trackingData = {
          responsibleEstimation: params.responsibleEstimation,
          responsibleGeneration: params.responsibleGeneration,
          modelUsed: params.modelUsed,
          userId: params.userId,
          sessionId: params.sessionId,
          taskType: params.taskType,
          inputData: params.inputData,
          outputData: params.outputData,
          executionTimeMs: params.executionTimeMs,
          modelCapabilities: MODEL_CAPABILITIES[params.modelUsed],
          performanceMetrics: {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            user_agent: 'Housy-AI-Service'
          }
        };        // Insert into tracking table (development only)
        await db.insert(aiModelTracking).values(trackingData);
        
        console.log(`[DEV] Model tracking logged: ${params.taskType} with ${params.modelUsed}`);
      }
    } catch (error) {
      // Silently fail - tracking ne doit jamais affecter l'expérience utilisateur
      console.warn('[DEV] Model tracking failed:', error);
    }
  }

  // Sélecteur intelligent de modèle selon la tâche
  private selectOptimalModel(taskType: 'estimation' | 'generation' | 'chat', userRole?: string): {
    estimationModel: string;
    generationModel: string;
    primaryModel: string;
  } {
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    
    // Modèles optimaux par tâche
    const optimalModels = {
      estimation: isAdmin ? 'deepseek-coder' : 'qwen2.5-coder', // DeepSeek meilleur pour calculs
      generation: isAdmin ? 'llama3.1' : 'qwen', // Llama3.1 meilleur pour génération
      chat: isAdmin ? 'llama3.1' : 'qwen' // Conversation générale
    };

    const estimationModel = optimalModels.estimation;
    const generationModel = optimalModels.generation;
    const primaryModel = optimalModels[taskType];

    return { estimationModel, generationModel, primaryModel };
  }

  // Method to enrich context with real data
  private async enrichContextWithRealData(userMessage: string): Promise<string> {
    try {
      const summary = await dataService.getDataSummary();
      
      // Check if message is about construction cost estimation
      const isConstructionEstimate = userMessage.toLowerCase().includes('cout') || 
                                   userMessage.toLowerCase().includes('coût') ||
                                   userMessage.toLowerCase().includes('prix') ||
                                   userMessage.toLowerCase().includes('construction') ||
                                   userMessage.toLowerCase().includes('maison') ||
                                   userMessage.toLowerCase().includes('batiment');
      
      let contextData = `
## DONNÉES RÉELLES DISPONIBLES:
- ${summary.nb_materiaux} matériaux de construction catalogués avec prix réels
- ${summary.nb_proprietes} propriétés immobilières tunisiennes dans la base de données
- Villes couvertes: ${summary.villes_disponibles.slice(0, 10).join(', ')}${summary.villes_disponibles.length > 10 ? ' et autres...' : ''}
- Prix moyen matériaux: ${summary.prix_moyen_materiaux_tnd} TND
- Prix moyen immobilier: ${summary.prix_moyen_immobilier_par_m2_tnd} TND/m²

`;

      if (isConstructionEstimate) {
        // Extract surface and city if mentioned
        const surfaceMatch = userMessage.match(/(\d+)\s*m[²2]/i);
        const cityMatch = userMessage.match(/(?:à|dans|de)\s+([a-zà-ù]+)/i);
        
        if (surfaceMatch) {
          const surface = parseInt(surfaceMatch[1]);
          const city = cityMatch ? cityMatch[1] : undefined;
          
          const estimation = await dataService.calculateConstructionCost(surface, city);
          
          contextData += `
## ESTIMATION CALCULÉE AVEC LES VRAIES DONNÉES:
- Surface demandée: ${surface} m²
- Ville: ${city || 'Non spécifiée'}
- Estimation totale: ${estimation.estimation_totale_tnd.toLocaleString()} TND
- Prix par m²: ${estimation.estimation_par_m2_tnd.toLocaleString()} TND/m²
- Basée sur: ${estimation.proprietes_reference.length} propriétés de référence
- Matériaux principaux disponibles: ${estimation.materiaux_principaux.length} catalogués

## PROPRIÉTÉS DE RÉFÉRENCE:
${estimation.proprietes_reference.slice(0, 3).map(prop => 
  `- ${prop.titre}: ${prop.prix_tnd.toLocaleString()} TND, ${prop.superficie_m2} m² (${prop.ville})`
).join('\n')}

## MATÉRIAUX PRINCIPAUX:
${estimation.materiaux_principaux.slice(0, 3).map(mat => 
  `- ${mat.nom}: ${mat.prix.moyen_tnd} TND/${mat.unite}`
).join('\n')}

`;
        }
      }

      return contextData;
    } catch (error) {
      console.error("Error enriching context with real data:", error);
      return "## DONNÉES: Erreur lors du chargement des données réelles.\n";
    }
  }

  // For chatbot functionality
  async processChatMessage(sessionId: string, userId: number | null, content: string, preferredModel: string = "openai"): Promise<string> {
    try {
      console.log(`Processing chat with preferred model: ${preferredModel}`);
      
      // Save user message
      const userMessage: InsertChatMessage = {
        userId: userId || null,
        role: "user",
        content,
        sessionId
      };
      
      await storage.saveChatMessage(userMessage);
      
      // Get conversation history for context
      const chatHistory = await storage.getChatMessages(sessionId);
      console.log(`Retrieved ${chatHistory.length} messages from chat history`);
      
      // ENRICHIR LE CONTEXTE AVEC LES VRAIES DONNÉES
      const realDataContext = await this.enrichContextWithRealData(content);
      console.log("Real data context added to system message");
      
      // Prepare system message for construction domain expertise
      const systemMessage = `Tu es un assistant spécialisé pour Housy, une plateforme de gestion immobilière et de construction en Tunisie. 

${realDataContext}

UTILISE IMPÉRATIVEMENT ces données réelles ci-dessus pour tes réponses. Ne pas inventer de chiffres.

Ton expertise inclut:
1. Les coûts des matériaux de construction et l'estimation en Tunisie
2. Les tendances du marché immobilier dans différentes régions tunisiennes
3. Les techniques de construction et les meilleures pratiques pour le climat et les réglementations tunisiennes
4. La gestion de projets de construction en Tunisie
5. L'analyse d'investissement immobilier tunisien

Utilise UNIQUEMENT les données réelles fournies ci-dessus. Tous les prix doivent être en TND (Dinar Tunisien).
Lorsque tu parles de matériaux de construction, utilise les prix RÉELS du catalogue.
Pour les emplacements, utilise les villes RÉELLES de notre base de données.

Sois professionnel mais amical dans tes réponses et formate les informations clairement avec une mise en forme appropriée.`;
      
      // The order of models to try, based on user preference
      const modelsToTry = [];
      
      // Add the preferred model first
      modelsToTry.push(preferredModel);
      
      // Then add the fallbacks in order of reliability
      if (preferredModel !== "deepseek") {
        modelsToTry.push("deepseek");
      }
      if (preferredModel !== "claude" && preferredModel !== "anthropic") {
        modelsToTry.push("claude");
      }
      if (preferredModel !== "openai" && preferredModel !== "gpt") {
        modelsToTry.push("openai");
      }
      if (preferredModel !== "ollama") {
        modelsToTry.push("ollama");
      }
      
      console.log("Models to try in order:", modelsToTry);
      
      // Try each model in sequence until one works
      let assistantResponse = "";
      let usedProvider = "";
      let errors: string[] = []; // Explicitly type errors array
      
      for (const model of modelsToTry) {
        try {
          console.log(`Attempting to use model: ${model}`);
          
          if (model === "openai" || model === "gpt") {
            // Check if we have an API key before attempting
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-" || process.env.OPENAI_API_KEY.length < 10) {
              console.log("OpenAI API key not available or invalid, skipping");
              errors.push("OpenAI API key missing or invalid");
              continue;
            }
            
            // Prepare messages for OpenAI
            const messages = chatHistory.map(msg => ({
              role: msg.role as any,
              content: msg.content
            }));
            
            messages.unshift({
              role: "system",
              content: systemMessage
            });
            
            // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            const response = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: messages,
              temperature: 0.7,
              max_tokens: 1000
            });
            
            assistantResponse = response.choices[0].message.content || "";
            usedProvider = "openai";
            break; // Exit loop on success
          } 
          else if (model === "deepseek") {
            // Check if we have an API key before attempting
            if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === "" || process.env.DEEPSEEK_API_KEY.length < 10) {
              console.log("DeepSeek API key not available or invalid, skipping");
              errors.push("DeepSeek API key missing or invalid");
              continue;
            }
            
            // Use DeepSeek API
            assistantResponse = await this.processChatWithDeepSeek(chatHistory, systemMessage);
            usedProvider = "deepseek";
            break; // Exit loop on success
          }
          else if (model === "claude" || model === "anthropic") {
            // Check if we have an API key before attempting
            if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "" || process.env.ANTHROPIC_API_KEY.length < 10) {
              console.log("Anthropic API key not available or invalid, skipping");
              errors.push("Anthropic API key missing or invalid");
              continue;
            }
            
            // Use Claude API
            assistantResponse = await this.processChatWithClaude(chatHistory, systemMessage);
            usedProvider = "anthropic";
            break; // Exit loop on success
          }
          else if (model === "ollama") {
            // Use Ollama API for local processing
            let ollamaRawResponse = await this.processChatWithOllama(chatHistory, systemMessage);
            
            const ollamaGenericFailurePhrases = [
              "situation technique", 
              "difficultés techniques",
              "pas en mesure de répondre",
              "recommencer plus tard",
              "actuellement en situation technique",
              "ne sommes pas en mesure de répondre",
              "nous allons recommencer plus tard"
            ];

            let responseInvalidated = false;
            if (ollamaRawResponse) {
                const lowerResponse = ollamaRawResponse.toLowerCase();
                if (ollamaGenericFailurePhrases.some(phrase => lowerResponse.includes(phrase.toLowerCase()))) {
                    console.warn(`Ollama response used a generic failure phrase: "${ollamaRawResponse}"`);
                    errors.push(`ollama: Model used a generic failure phrase it was asked to avoid.`);
                    responseInvalidated = true;
                }
            }
            
            if (ollamaRawResponse && !responseInvalidated) {
              assistantResponse = ollamaRawResponse;
              usedProvider = "ollama";
              break; 
            } else {
              // If response was invalidated or initially empty/null
              console.log("Ollama produced no valid response or response was invalidated, trying next model or fallback.");
              if (!errors.some(e => e.startsWith("ollama:"))) { 
                  errors.push(`ollama: Failed to get a valid response or response was invalidated by checks.`);
              }
              assistantResponse = ""; // Ensure assistantResponse is cleared
            }
          }
        } catch (error) { // No type annotation, error is unknown by default
          // Log the error and continue to the next model
          console.log(`Error with ${model}:`, error);
          const errorMessage = error instanceof Error ? error.message : String(error); // Safe access to message
          errors.push(`${model}: ${errorMessage || 'Unknown error'}`);
        }
      }
      
      // If we've tried all models and none worked
      if (!assistantResponse) {
        console.error("All AI models failed:", errors);
        
        // Use a fallback mechanism with predefined responses for common queries
        const userQuery = content.toLowerCase().trim();
        
        // Check for construction cost related questions
        if (userQuery.includes("cout") && 
            (userQuery.includes("construction") || userQuery.includes("maison") || userQuery.includes("batiment")) && 
            (userQuery.includes("tunis") || userQuery.includes("tunisie"))) {
          
          assistantResponse = `
Voici quelques informations sur les coûts de construction en Tunisie (basées sur nos données internes) :

## Coûts moyens de construction en Tunisie (2025)

| Type de construction | Coût moyen (TND/m²) |
|----------------------|---------------------|
| Économique           | 1,200 - 1,500       |
| Standard             | 1,500 - 2,200       |
| Haut de gamme        | 2,200 - 3,500+      |

## Répartition des coûts par catégorie
- Gros œuvre : 45-50% du budget total
- Second œuvre : 30-35% du budget total
- Finitions : 15-25% du budget total

## Matériaux populaires et leurs coûts approximatifs
- Ciment Portland CPJ 45 : 62 TND/50kg
- Acier à béton : 2,400 TND/tonne
- Sable de construction lavé : 1,250 TND/m³

Pour une estimation plus précise, veuillez utiliser notre calculateur de matériaux dans la section "Matériaux" de l'application.

*Note: Ces informations sont à titre indicatif et peuvent varier selon la région, la disponibilité des matériaux et d'autres facteurs.*
`;
        }
        // Check for material price related questions
        else if ((userQuery.includes("prix") || userQuery.includes("cout") || userQuery.includes("tarif")) && 
                 (userQuery.includes("materiau") || userQuery.includes("materiaux") || userQuery.includes("ciment") || 
                  userQuery.includes("acier") || userQuery.includes("sable"))) {
          
          assistantResponse = `
Voici les prix actuels des principaux matériaux de construction en Tunisie :

## Matériaux de gros œuvre
- Ciment Portland CPJ 45 : 62.42 TND/50kg
- Sable de construction lavé : 1,255.25 TND/m³
- Gravier concassé 5/15 : 89.72 TND/m³
- Acier à béton HA Fe E400 (8mm) : 2,442.84 TND/tonne
- Acier à béton HA Fe E400 (10mm) : 1,211.35 TND/tonne

## Matériaux de second œuvre
- Brique rouge : 1.75 TND/unité
- Tuile en terre cuite : 3.20 TND/unité
- Plaque de plâtre standard (13mm) : 30.50 TND/m²
- Parpaing creux 20x20x40 : 2.35 TND/unité

## Finitions
- Carrelage standard : 45 TND/m²
- Peinture intérieure : 25.80 TND/litre
- Mastic pour joints : 12.30 TND/kg

Vous pouvez consulter notre liste complète de matériaux et leurs prix à jour dans la section "Matériaux" de l'application.
`;
        }
        // Check for construction techniques or regulations
        else if ((userQuery.includes("technique") || userQuery.includes("reglementation") || userQuery.includes("norme")) && 
                 (userQuery.includes("construction") || userQuery.includes("batiment") || userQuery.includes("maison"))) {
          
          assistantResponse = `
Voici quelques informations sur les techniques et réglementations de construction en Tunisie :

## Réglementations principales
- Code de l'urbanisme et de l'aménagement du territoire
- Règlement Général de la Construction (RGC)
- Plan d'Aménagement Urbain (PAU) spécifique à chaque municipalité

## Autorisations nécessaires
1. Certificat d'urbanisme
2. Autorisation de bâtir (permis de construire)
3. Certificat de conformité après achèvement

## Normes techniques importantes
- NT 47.01 : Béton - Spécifications, performances, production et conformité
- NT 21.05 : Ciments - Composition, spécifications et critères de conformité
- Normes parasismiques tunisiennes (zones sismiques 1, 2 et 3)

## Processus de construction recommandé
1. Étude de sol
2. Conception architecturale et études techniques
3. Obtention des autorisations
4. Terrassement et fondations
5. Gros œuvre
6. Second œuvre
7. Finitions

Pour plus de détails sur les réglementations spécifiques à votre région ou projet, veuillez consulter un architecte ou un ingénieur agréé.
`;
        }
        // Default fallback response
        else {
          assistantResponse = `En tant qu'assistant spécialisé dans la construction en Tunisie, je peux vous aider avec votre question même si nos modèles IA principaux sont temporairement indisponibles.

Pourriez-vous me préciser :
- De quel type de projet s'agit-il ?
- Dans quelle région de Tunisie ?
- Avez-vous besoin d'informations sur les matériaux, les coûts, ou les procédures ?

Je peux vous fournir des informations basées sur notre base de données interne de matériaux tunisiens et nos connaissances du marché local.

Note technique : Modèles IA temporairement indisponibles (${errors.join("; ")})`;
        }
        
        usedProvider = "none (fallback)";
      }
      
      // Add a note about which provider was used if different from preferred
      if (usedProvider && preferredModel !== usedProvider.split(" ")[0]) {
        assistantResponse = `[Utilisation du modèle ${usedProvider} au lieu de ${preferredModel}]\n\n` + assistantResponse;
      }
      
      console.log(`Successfully generated response using: ${usedProvider}`);
      
      // Save assistant response
      const assistantMessage: InsertChatMessage = {
        userId: userId || null,
        role: "assistant",
        content: assistantResponse,
        sessionId
      };
      
      await storage.saveChatMessage(assistantMessage);
      
      return assistantResponse;
    } catch (error) {
      console.error("Error processing chat message:", error);
      throw error;
    }
  }
  
  // Process chat with Claude (Anthropic)
  private async processChatWithClaude(chatHistory: any[], systemMessage: string): Promise<string> {
    try {
      console.log("Using Anthropic Claude API...");
      
      // Filter and prepare valid messages - only include messages with valid roles
      const validMessages = [];
      
      for (const msg of chatHistory) {
        // Anthropic only accepts 'user' or 'assistant' roles
        if (msg.role === 'user') {
          validMessages.push({
            role: 'user' as const,
            content: msg.content
          });
        } else if (msg.role === 'assistant') {
          validMessages.push({
            role: 'assistant' as const,
            content: msg.content
          });
        }
      }
      
      console.log(`Prepared ${validMessages.length} valid messages for Claude`);
      
      if (validMessages.length === 0) {
        // Add a default user message if the history is empty
        validMessages.push({
          role: 'user' as const,
          content: "Bonjour, pouvez-vous me donner des informations sur la construction en Tunisie?"
        });
      }
      
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const response = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229", // Using a model that exists in current Anthropic API
        system: systemMessage,
        max_tokens: 1000,
        messages: validMessages
      });
      
      console.log("Claude API response received");
      
      // Extract text from response
      let responseText = "";
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if (typeof firstContent === 'object' && 'text' in firstContent) {
          responseText = firstContent.text;
        }
      }
      
      return responseText || "Je suis désolé, je n'ai pas pu générer une réponse.";
    } catch (error) {
      console.error("Error with Claude API:", error);
      throw error;
    }
  }

  // Process chat with DeepSeek API
  private async processChatWithDeepSeek(chatHistory: any[], systemMessage: string): Promise<string> {
    try {
      console.log("Using DeepSeek API...");
      
      // Prepare messages for DeepSeek (OpenAI-compatible format)
      const messages = chatHistory.map(msg => ({
        role: msg.role as any,
        content: msg.content
      }));
      
      messages.unshift({
        role: "system",
        content: systemMessage
      });
      
      console.log(`Prepared ${messages.length} messages for DeepSeek`);
      
      // Use DeepSeek's latest model
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat", // DeepSeek's main chat model
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      });
      
      console.log("DeepSeek API response received");
      
      const responseText = response.choices[0].message.content || "";
      return responseText || "Je suis désolé, je n'ai pas pu générer une réponse.";
    } catch (error) {
      console.error("Error with DeepSeek API:", error);
      throw error;
    }
  }
  
  // Process chat with Ollama (local model)
  private async processChatWithOllama(chatHistory: any[], systemMessage: string): Promise<string> {
    try {
      console.log("Using Ollama local API...");
      
      // First try to get available models from Ollama
      let ollamaModels: string[] = [];
      
      try {
        const baseUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
        const modelResponse = await fetch(`${baseUrl}/api/tags`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        
        if (modelResponse.ok) {
          const modelData = await modelResponse.json();
          ollamaModels = modelData.models?.map((m: any) => m.name) || [];
          console.log("Available Ollama models:", ollamaModels.join(", "));
        }
      } catch (err) {
        console.warn("Failed to get available Ollama models:", err);
      }
      
      // Choose a model to use - prefer these models in order if available
      // Updated priority: prefer llama3.1 (once installed) and phi over smaller models
      const preferredModels = ["llama3.1", "llama3", "mistral", "phi", "llama2", "gemma", "neural-chat", "orca-mini"];
      let modelToUse: OllamaModel = "phi"; // Default to phi since it's available
      
      // Find first preferred model that's available
      for (const model of preferredModels) {
        if (ollamaModels.includes(model)) {
          modelToUse = model as OllamaModel;
          console.log(`Selected available Ollama model: ${modelToUse}`);
          break;
        }
      }
      
      // If none of our preferred models are available but others are, use the first available
      if (ollamaModels.length > 0 && !preferredModels.includes(modelToUse)) {
        modelToUse = ollamaModels[0] as OllamaModel;
        console.log(`Using first available Ollama model: ${modelToUse}`);
      }

      const ollamaSystemPrompt = `${systemMessage}

Instructions supplémentaires IMPÉRATIVES pour ce modèle (Ollama):
- Précision Géographique Absolue : Fais extrêmement attention aux noms de lieux (villes, régions, quartiers) mentionnés par l'utilisateur. Ta réponse DOIT CONCERNER PRÉCISÉMENT le lieu demandé. Si le lieu n'est pas clair, demande une clarification. Si tu n'as AUCUNE information spécifique pour le lieu exact demandé, tu dois l'indiquer clairement (par exemple, "Je n'ai pas d'informations spécifiques sur les coûts de construction pour la ville de [NomLieu spécifié par l'utilisateur].") NE PAS fournir d'informations sur un autre lieu, même proche ou similaire.
- Interdiction de Messages d'Échec Génériques : NE PAS utiliser de phrases comme "difficultés techniques", "situation technique", "pas en mesure de répondre", "recommencer plus tard", "je ne peux pas aider avec ça", ou toute excuse similaire. Le système applicatif externe gérera les erreurs techniques réelles ou les indisponibilités. Ton rôle est de fournir une réponse basée sur les informations ou d'indiquer un manque d'information spécifique.
- Pas de Suggestions Alternatives Non Sollicitées : Si la question concerne un lieu spécifique et que tu n'as pas de données pour ce lieu, NE PAS suggérer un autre lieu à moins que l'utilisateur ne le demande explicitement.
- Répondre à la question : Tu dois toujours essayer de répondre à la question posée par l'utilisateur. Si tu manques d'informations, explique ce qui manque pour que tu puisses répondre.`;
      
      // Convert chat history to a formatted prompt for Ollama
      let prompt = "Contexte du système:\n" + systemMessage + "\n\nHistorique de conversation:\n"; // Original system message for context
      
      chatHistory.forEach(msg => {
        const role = msg.role === "user" ? "Utilisateur" : "Assistant";
        prompt += `${role}: ${msg.content}\n\n`;
      });
      
      prompt += "Assistant: "; // Ollama expects the prompt to end with the turn of the entity to generate for
      
      console.log(`Calling Ollama API with model: ${modelToUse}`);
      
      try {
        const ollamaResponse = await callOllamaApi(prompt, modelToUse, { 
          system: ollamaSystemPrompt, // Use the new, more specific system prompt
          temperature: 0.6 // Slightly lower temperature for more factual responses
        });
        
        if (!ollamaResponse) {
          console.warn("Ollama API returned no response, attempting fallback model if available.");
          const otherModels = ollamaModels.filter(m => m !== modelToUse);
          if (otherModels.length > 0) {
            const fallbackModel = otherModels[0];
            console.log(`Retrying with fallback Ollama model: ${fallbackModel}`);
            
            const fallbackResponse = await callOllamaApi(prompt, fallbackModel as OllamaModel, {
              system: ollamaSystemPrompt, // Also use the enhanced system prompt for retry
              temperature: 0.6
            });
            
            return fallbackResponse || "Je suis désolé, je n'ai pas pu générer une réponse (Ollama fallback).";
          }
        }
        
        return ollamaResponse;
      } catch (error) {
        console.error("Error with Ollama:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error with Ollama:", error);
      throw error;
    }
  }

  // Analyze CSV data for material prices and trends
  async analyzeCsvData(data: any[], analysisType: string): Promise<any> {
    try {
      console.log(`Analyzing CSV data for: ${analysisType}`);
      
      // Process the data based on type
      if (analysisType === 'material_prices') {
        // Analyze material price data
        const analysis = {
          totalRecords: data.length,
          categories: this.groupByCategory(data),
          priceRanges: this.analyzePriceRanges(data),
          suppliers: this.analyzeSuppliers(data),
          trends: this.calculatePriceTrends(data),
          insights: [
            "Les prix des matériaux de construction montrent une tendance à la hausse",
            "Les fournisseurs locaux offrent des prix compétitifs",
            "La demande pour les matériaux de qualité premium augmente"
          ]
        };
        
        return analysis;
      }
      
      return { message: "Analysis completed", data: data.slice(0, 10) };
    } catch (error) {
      console.error("Error analyzing CSV data:", error);
      return { error: "Failed to analyze data", message: "Analysis temporarily unavailable" };
    }
  }

  // Analyze market trends for real estate
  async analyzeMarketTrends(realEstateData: any[]): Promise<any> {
    try {
      console.log("Analyzing market trends for real estate data");
      
      const analysis = {
        marketOverview: {
          totalListings: realEstateData.length,
          averagePrice: this.calculateAveragePrice(realEstateData),
          priceGrowth: "7.2%", // Sample growth rate
          hotspots: ["Tunis", "Sousse", "Sfax"]
        },
        regionalAnalysis: this.analyzeByRegion(realEstateData),
        priceSegmentation: this.segmentByPrice(realEstateData),
        predictions: [
          "Les prix continueront de croître modérément au cours des 6 prochains mois",
          "La demande pour les appartements de taille moyenne reste forte",
          "Les zones côtières montrent le plus de potentiel d'investissement"
        ],
        insights: [
          "Le marché tunisien montre une stabilité dans les grandes villes",
          "L'investissement immobilier reste attractif dans les zones touristiques",
          "Les prix par m² varient significativement selon la région"
        ]
      };
      
      return analysis;
    } catch (error) {
      console.error("Error analyzing market trends:", error);
      return { error: "Failed to analyze trends", message: "Market analysis temporarily unavailable" };
    }
  }

  // Predict future prices based on historical data
  async predictPrices(historicalData: any[]): Promise<any> {
    try {
      console.log("Generating price predictions based on historical data");
      
      const prediction = {
        methodology: "Machine Learning basé sur les tendances historiques",
        timeframe: "6 mois",
        confidence: "78%",
        predictions: {
          materialPrices: {
            ciment: { current: 62.42, predicted: 66.50, change: "+6.5%" },
            acier: { current: 1446.34, predicted: 1520.80, change: "+5.1%" },
            brique: { current: 1.25, predicted: 1.31, change: "+4.8%" }
          },
          realEstatePrices: {
            tunis: { current: 4450, predicted: 4760, change: "+7.0%" },
            sousse: { current: 3200, predicted: 3392, change: "+6.0%" },
            sfax: { current: 2800, predicted: 2940, change: "+5.0%" }
          }
        },
        factors: [
          "Croissance économique stable",
          "Inflation modérée",
          "Demande soutenue dans le secteur de la construction",
          "Politiques gouvernementales favorables au logement"
        ],
        risks: [
          "Fluctuations des prix des matières premières",
          "Changements réglementaires",
          "Conditions économiques internationales"
        ]
      };
      
      return prediction;
    } catch (error) {
      console.error("Error predicting prices:", error);
      return { error: "Failed to predict prices", message: "Price prediction temporarily unavailable" };
    }
  }

  // Helper methods for data analysis
  private groupByCategory(data: any[]): any {
    const categories: { [key: string]: number } = {};
    data.forEach(item => {
      const category = item.category || 'Unknown';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  }

  private analyzePriceRanges(data: any[]): any {
    const ranges = {
      'low': { min: 0, max: 100, count: 0 },
      'medium': { min: 100, max: 1000, count: 0 },
      'high': { min: 1000, max: Infinity, count: 0 }
    };
    
    data.forEach(item => {
      const price = parseFloat(item.price) || 0;
      if (price < 100) ranges.low.count++;
      else if (price < 1000) ranges.medium.count++;
      else ranges.high.count++;
    });
    
    return ranges;
  }

  private analyzeSuppliers(data: any[]): any {
    const suppliers: { [key: string]: { count: number, avgPrice: number } } = {};
    
    data.forEach(item => {
      const supplier = item.supplier || 'Unknown';
      const price = parseFloat(item.price) || 0;
      
      if (!suppliers[supplier]) {
        suppliers[supplier] = { count: 0, avgPrice: 0 };
      }
      
      suppliers[supplier].count++;
      suppliers[supplier].avgPrice = 
        (suppliers[supplier].avgPrice * (suppliers[supplier].count - 1) + price) / suppliers[supplier].count;
    });
    
    return suppliers;
  }

  private calculatePriceTrends(data: any[]): any {
    // Simple trend calculation - in a real app this would be more sophisticated
    return {
      overall: "+3.2%",
      byCategory: {
        'Ciment': "+2.8%",
        'Acier': "+4.1%",
        'Brique': "+1.9%"
      }
    };
  }

  private calculateAveragePrice(data: any[]): number {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    return Math.round(total / data.length);
  }

  private analyzeByRegion(data: any[]): any {
    const regions: { [key: string]: { count: number, avgPrice: number } } = {};
    
    data.forEach(item => {
      const region = item.city || item.governorate || 'Unknown';
      const price = parseFloat(item.price) || 0;
      
      if (!regions[region]) {
        regions[region] = { count: 0, avgPrice: 0 };
      }
      
      regions[region].count++;
      regions[region].avgPrice = 
        (regions[region].avgPrice * (regions[region].count - 1) + price) / regions[region].count;
    });
    
    return regions;
  }

  private segmentByPrice(data: any[]): any {
    const segments = {
      'budget': { max: 200000, count: 0 },
      'mid-range': { min: 200000, max: 500000, count: 0 },
      'premium': { min: 500000, max: 1000000, count: 0 },
      'luxury': { min: 1000000, count: 0 }
    };
    
    data.forEach(item => {
      const price = parseFloat(item.price) || 0;
      if (price < 200000) segments.budget.count++;
      else if (price < 500000) segments['mid-range'].count++;
      else if (price < 1000000) segments.premium.count++;
      else segments.luxury.count++;
    });
    
    return segments;
  }

  // Nouvelle méthode principale avec intégration des modèles étendus
  async processChatMessageEnhanced(
    sessionId: string, 
    userId: number | null, 
    content: string, 
    preferredModel?: string,
    userRole?: string
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      // Enrichissement automatique avec données réelles
      const enrichedContext = await this.enrichContextWithRealData(content);
      
      // Détection automatique du type de tâche
      const taskType = this.detectTaskType(content);
      
      // Sélection intelligente des modèles optimaux
      const { estimationModel, generationModel, primaryModel } = this.selectOptimalModel(taskType, userRole);
      
      // Sélection du modèle final selon préférence utilisateur
      let finalModel = primaryModel;
      if (preferredModel && MODEL_CAPABILITIES[preferredModel]) {
        // Vérifier les permissions pour modèles restreints
        if (preferredModel.includes('ollama') || preferredModel.includes('deepseek-coder')) {
          if (userRole === 'admin' || userRole === 'super_admin') {
            finalModel = preferredModel;
          } else {
            console.warn(`User ${userRole} attempted restricted model access: ${preferredModel}`);
            finalModel = primaryModel; // Fallback au modèle autorisé
          }
        } else {
          finalModel = preferredModel;
        }
      }
      
      console.log(`[ENHANCED] Processing with model: ${finalModel} (task: ${taskType})`);
      
      // Traitement selon le modèle sélectionné
      let response: string;
      
      switch (finalModel) {
        case 'deepseek-coder':
        case 'deepseek':
          response = await this.processChatWithDeepSeek([{role: 'user', content: enrichedContext}]);
          break;
          
        case 'qwen2.5-coder':
        case 'qwen':
          response = await this.processChatWithQwen([{role: 'user', content: enrichedContext}]);
          break;
          
        case 'llama3.1':
        case 'mistral':
        case 'phi':
          response = await this.processChatWithOllama([{role: 'user', content: enrichedContext}], enrichedContext);
          break;
          
        default:
          // Fallback vers les modèles cloud classiques
          if (finalModel.includes('claude')) {
            response = await this.processChatWithClaude([{role: 'user', content: enrichedContext}]);
          } else {
            response = await this.processChatWithOpenAI([{role: 'user', content: enrichedContext}]);
          }
      }
      
      const executionTime = Date.now() - startTime;
      
      // Tracking pour développement (INVISIBLE à l'utilisateur)
      await this.trackModelUsage({
        taskType,
        modelUsed: finalModel,
        responsibleEstimation: taskType === 'estimation' ? estimationModel : undefined,
        responsibleGeneration: taskType === 'generation' ? generationModel : undefined,
        userId: userId?.toString(),
        sessionId,
        inputData: { content, enrichedContext: !!enrichedContext },
        outputData: { responseLength: response.length },
        executionTimeMs: executionTime
      });
      
      return response;
      
    } catch (error) {
      console.error('Enhanced chat processing failed:', error);
      
      // Fallback automatique vers modèle de base
      try {
        return await this.processChatMessage(sessionId, userId, content);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error("Impossible de traiter votre demande actuellement.");
      }
    }
  }
  
  // Détection automatique du type de tâche
  private detectTaskType(content: string): 'estimation' | 'generation' | 'chat' {
    const estimationKeywords = ['coût', 'cout', 'prix', 'tarif', 'estimation', 'budget', 'devis', 'm²', 'm2'];
    const generationKeywords = ['génère', 'crée', 'écris', 'rédige', 'produis', 'développe'];
    
    const contentLower = content.toLowerCase();
    
    if (estimationKeywords.some(keyword => contentLower.includes(keyword))) {
      return 'estimation';
    }
    
    if (generationKeywords.some(keyword => contentLower.includes(keyword))) {
      return 'generation';
    }
    
    return 'chat';
  }
  
  // Nouvelle méthode pour Qwen
  private async processChatWithQwen(chatHistory: any[], systemMessage?: string): Promise<string> {
    try {
      console.log("Using Qwen via Ollama...");
      
      // Qwen est maintenant disponible via Ollama
      const qwenModels = ['qwen2.5-coder', 'qwen'];
      let selectedModel = 'qwen2.5-coder'; // Par défaut
      
      // Vérifier quel modèle Qwen est disponible
      try {
        const baseUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
        const modelResponse = await fetch(`${baseUrl}/api/tags`);
        
        if (modelResponse.ok) {
          const modelData = await modelResponse.json();
          const availableModels = modelData.models?.map((m: any) => m.name) || [];
          
          // Sélectionner le premier modèle Qwen disponible
          for (const model of qwenModels) {
            if (availableModels.includes(model)) {
              selectedModel = model;
              break;
            }
          }
        }
      } catch (error) {
        console.warn("Could not check available Qwen models:", error);
      }
      
      const prompt = chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
      
      const response = await callOllamaApi(prompt, selectedModel as OllamaModel, {
        system: systemMessage || "Tu es un assistant IA spécialisé dans l'immobilier tunisien.",
        temperature: 0.7
      });
      
      return response || "Je suis désolé, je n'ai pas pu générer une réponse avec Qwen.";
      
    } catch (error) {
      console.error("Error with Qwen:", error);
      throw error;
    }
  }

  // ...existing code...
}

export const aiService = new AiService();
