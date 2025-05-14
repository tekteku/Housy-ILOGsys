import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { storage } from "../storage";
import { InsertChatMessage, InsertAiAnalysis } from "@shared/schema";

// Initialize AI providers
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-" 
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

type OllamaModel = "llama2" | "mistral" | "gemma" | "phi" | "falcon" | "orca-mini" | "neural-chat" | "stablelm";

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
      
      // Prepare system message for construction domain expertise
      const systemMessage = `Tu es un assistant spécialisé pour Housy, une plateforme de gestion immobilière et de construction en Tunisie. 
        
Tu as accès aux données réelles du marché immobilier tunisien avec 109 336 annonces immobilières et une base de données de matériaux de construction avec 46 articles incluant les prix en Dinar Tunisien (TND).

Ton expertise inclut:
1. Les coûts des matériaux de construction et l'estimation en Tunisie
2. Les tendances du marché immobilier dans différentes régions tunisiennes
3. Les techniques de construction et les meilleures pratiques pour le climat et les réglementations tunisiennes
4. La gestion de projets de construction en Tunisie
5. L'analyse d'investissement immobilier tunisien

Utilise des exemples concrets et des données spécifiques chaque fois que possible. Tous les prix doivent être en TND (Dinar Tunisien).
Lorsque tu parles de matériaux de construction, fais référence aux fournisseurs réels comme Sotumetal, Ciments d'Enfidha, Ciments de Bizerte, etc.
Pour les emplacements, concentre-toi sur les villes tunisiennes, notamment Tunis, Sousse, Sfax et d'autres villes de nos données.

Sois professionnel mais amical dans tes réponses et formate les informations clairement avec une mise en forme appropriée.`;
      
      // The order of models to try, based on user preference
      const modelsToTry = [];
      
      // Add the preferred model first
      modelsToTry.push(preferredModel);
      
      // Then add the fallbacks in order of reliability
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
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-") {
              console.log("OpenAI API key not available, skipping");
              errors.push("OpenAI API key missing");
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
          else if (model === "claude" || model === "anthropic") {
            // Check if we have an API key before attempting
            if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "") {
              console.log("Anthropic API key not available, skipping");
              errors.push("Anthropic API key missing");
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
          assistantResponse = "Désolé, je rencontre actuellement des difficultés techniques. Tous nos modèles d'IA sont momentanément indisponibles. Veuillez réessayer plus tard.\n\nDétails techniques: " + errors.join("; ");
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
      const preferredModels = ["mistral", "llama2", "gemma", "phi", "neural-chat", "orca-mini"];
      let modelToUse: OllamaModel = "mistral"; // Default
      
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
}

export const aiService = new AiService();
