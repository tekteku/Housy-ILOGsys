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

type OllamaModel = "llama2" | "mistral" | "gemma" | "phi" | "stablelm";

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
  } catch (error) {
    console.error("Error calling Ollama API:", error);
    throw error;
  }
}

class AiService {
  // For chatbot functionality
  async processChatMessage(sessionId: string, userId: number | null, content: string): Promise<string> {
    try {
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
      
      // Prepare messages for OpenAI
      const messages = chatHistory.map(msg => ({
        role: msg.role as any,
        content: msg.content
      }));
      
      // Add system message for construction domain expertise
      messages.unshift({
        role: "system",
        content: "You are an AI assistant for Housy, a construction and real estate management platform in Tunisia. You can help with project management, material estimation, construction techniques, and real estate market information. Provide helpful, accurate information for the Tunisian market context."
      });
      
      // Call OpenAI API
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      
      const assistantResponse = response.choices[0].message.content || "Je suis désolé, je n'ai pas pu traiter votre demande.";
      
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
  
  // For analyzing CSV data with Ollama
  async analyzeCsvData(data: any[], analysisType: string): Promise<any> {
    try {
      // Convert data to string representation
      const dataString = JSON.stringify(data, null, 2);
      
      // Create appropriate prompt based on analysis type
      let prompt = "";
      let system = "";
      
      if (analysisType === "material_prices") {
        system = "You are a construction materials analyst. Analyze the provided CSV data of construction materials and provide insights on price trends, anomalies, and recommendations.";
        prompt = `Analyze the following construction materials data and provide insights on price trends, categories with highest prices, and potential savings opportunities:\n\n${dataString}`;
      } else if (analysisType === "real_estate_market") {
        system = "You are a real estate market analyst. Analyze the provided property listings data and provide insights on market trends, price distributions, and investment opportunities.";
        prompt = `Analyze the following real estate listings data and provide insights on property types, price trends by location, and investment opportunities in the Tunisian market:\n\n${dataString}`;
      } else {
        system = "You are a data analyst. Analyze the provided CSV data and extract key insights and patterns.";
        prompt = `Analyze the following data and provide key insights and patterns:\n\n${dataString}`;
      }
      
      // Call Ollama API
      const result = await callOllamaApi(prompt, "llama2", { 
        system, 
        format: "json",
        temperature: 0.2
      });
      
      // Parse result if in string format
      const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
      
      // Save analysis to database
      const analysisData: InsertAiAnalysis = {
        analysisType,
        inputData: data,
        result: parsedResult,
        provider: "ollama"
      };
      
      await storage.saveAiAnalysis(analysisData);
      
      return parsedResult;
    } catch (error) {
      console.error("Error analyzing CSV data with Ollama:", error);
      
      // Fallback to OpenAI if Ollama fails
      try {
        console.log("Falling back to OpenAI for analysis...");
        return this.analyzeCsvDataWithOpenAI(data, analysisType);
      } catch (fallbackError) {
        console.error("Fallback to OpenAI also failed:", fallbackError);
        throw error;
      }
    }
  }
  
  // Fallback to OpenAI for CSV analysis
  private async analyzeCsvDataWithOpenAI(data: any[], analysisType: string): Promise<any> {
    // Prepare data - limit to first 100 items to avoid token limits
    const limitedData = data.slice(0, 100);
    const dataString = JSON.stringify(limitedData, null, 2);
    
    // Create system and user messages based on analysis type
    let systemContent = "";
    let userContent = "";
    
    if (analysisType === "material_prices") {
      systemContent = "You are a construction materials analyst. Analyze the provided construction materials data and provide insights.";
      userContent = `Analyze these construction materials and provide insights on price trends, categories with highest prices, and potential savings opportunities. Respond in JSON format with keys: 'trends', 'highestPriceCategories', 'savingsOpportunities', and 'recommendations'.\n\n${dataString}`;
    } else if (analysisType === "real_estate_market") {
      systemContent = "You are a real estate market analyst. Analyze the provided property listings data and provide insights.";
      userContent = `Analyze these real estate listings and provide insights on property types, price trends by location, and investment opportunities in Tunisia. Respond in JSON format with keys: 'marketTrends', 'priceByLocation', 'investmentOpportunities', and 'recommendations'.\n\n${dataString}`;
    } else {
      systemContent = "You are a data analyst. Analyze the provided data and extract key insights and patterns.";
      userContent = `Analyze this data and provide key insights and patterns. Respond in JSON format with keys: 'keyInsights', 'patterns', and 'recommendations'.\n\n${dataString}`;
    }
    
    // Call OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Save analysis to database
    const analysisData: InsertAiAnalysis = {
      analysisType,
      inputData: limitedData,
      result,
      provider: "openai"
    };
    
    await storage.saveAiAnalysis(analysisData);
    
    return result;
  }
  
  // For market trend analysis with Claude
  async analyzeMarketTrends(data: any[]): Promise<any> {
    try {
      // Prepare data - limit to avoid token limits
      const limitedData = data.slice(0, 100);
      const dataString = JSON.stringify(limitedData, null, 2);
      
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 2000,
        system: `You're a real estate market analyst in Tunisia. Analyze the provided data and output your findings in JSON format with the following keys:
          - "marketTrends": Array of key market trends
          - "priceAnalysis": Breakdown of price ranges and trends
          - "locationInsights": Insights on best performing locations
          - "investmentRecommendations": List of recommendations for investors
          - "constructionOpportunities": Opportunities for new construction projects`,
        messages: [
          { role: 'user', content: `Analyze these Tunisian real estate listings and provide comprehensive market insights:\n\n${dataString}` }
        ],
      });
      
      let result: any;
      try {
        result = JSON.parse(response.content[0].text);
      } catch (parseError) {
        console.error("Error parsing Claude response as JSON:", parseError);
        result = { text: response.content[0].text };
      }
      
      // Save analysis to database
      const analysisData: InsertAiAnalysis = {
        analysisType: "market_trends",
        inputData: limitedData,
        result,
        provider: "claude"
      };
      
      await storage.saveAiAnalysis(analysisData);
      
      return result;
    } catch (error) {
      console.error("Error analyzing market trends with Claude:", error);
      throw error;
    }
  }
  
  // For DeepSeek API integration (price prediction)
  async predictPrices(data: any[]): Promise<any> {
    try {
      // For now, we'll simulate with OpenAI since DeepSeek integration would require additional setup
      const limitedData = data.slice(0, 100);
      const dataString = JSON.stringify(limitedData, null, 2);
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an AI specialized in real estate price prediction. Analyze the provided data and predict future price trends for different regions and property types in Tunisia." 
          },
          { 
            role: "user", 
            content: `Based on this historical real estate data, predict price trends for the next 6 months for different regions and property types. Return as JSON with keys: 'predictions', 'confidenceLevel', 'factorsInfluencing', and 'regionSpecificTrends'.\n\n${dataString}` 
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Add simulated DeepSeek metadata
      result.model = "DeepSeek simulation";
      result.timestamp = new Date().toISOString();
      
      // Save analysis to database
      const analysisData: InsertAiAnalysis = {
        analysisType: "price_prediction",
        inputData: limitedData,
        result,
        provider: "deepseek_simulation"
      };
      
      await storage.saveAiAnalysis(analysisData);
      
      return result;
    } catch (error) {
      console.error("Error predicting prices:", error);
      throw error;
    }
  }
}

export const aiService = new AiService();
