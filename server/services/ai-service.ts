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
      // Prepare data - limit to avoid token limits but ensure geographic diversity
      // Group by governorate first to ensure we have samples from different regions
      const governorateGroups: Record<string, any[]> = {};
      
      // Group listings by governorate
      data.forEach(listing => {
        if (!listing.governorate) return;
        
        if (!governorateGroups[listing.governorate]) {
          governorateGroups[listing.governorate] = [];
        }
        governorateGroups[listing.governorate].push(listing);
      });
      
      // Take samples from each governorate to ensure geographic representation
      let sampledData: any[] = [];
      Object.keys(governorateGroups).forEach(governorate => {
        // Take up to 10 samples from each governorate
        const governorateSample = governorateGroups[governorate].slice(0, 10);
        sampledData = sampledData.concat(governorateSample);
      });
      
      // If we still need more data, add random samples up to 150 total
      if (sampledData.length < 150) {
        const randomSamples = data
          .filter(item => !sampledData.includes(item))
          .sort(() => 0.5 - Math.random())
          .slice(0, 150 - sampledData.length);
        
        sampledData = sampledData.concat(randomSamples);
      }
      
      // Generate statistics to include with the data
      const priceStats = this.calculatePriceStatistics(data);
      const propertyTypeDistribution = this.calculatePropertyTypeDistribution(data);
      const cityDistribution = this.calculateCityDistribution(data);
      
      // Create a summary of the data for the AI
      const dataSummary = {
        sampleData: sampledData.slice(0, 100), // Send 100 sample listings
        statistics: {
          totalListings: data.length,
          priceStats,
          propertyTypeDistribution,
          cityDistribution,
          topCities: Object.entries(cityDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([city, count]) => ({ city, count }))
        }
      };
      
      const dataString = JSON.stringify(dataSummary, null, 2);
      
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 3000,
        system: `You're a real estate market analyst in Tunisia with expertise in construction and development. 
        Analyze the provided Tunisian real estate data (which includes both sample listings and statistical summaries) 
        and output comprehensive, data-driven findings in JSON format with the following keys:
          - "marketTrends": Array of specific market trends with supporting data points
          - "priceAnalysis": Detailed breakdown of price ranges and trends by property type and location
          - "locationInsights": Specific insights on best performing locations with price/m² calculations
          - "constructionOpportunities": Specific opportunities for builders based on supply/demand gaps
          - "materialRecommendations": Recommendations for construction materials likely to be in demand based on trending property types
          - "investmentStrategyByRegion": Region-specific investment strategies with expected ROI estimates`,
        messages: [
          { role: 'user', content: `Analyze this Tunisian real estate data and provide comprehensive market insights that would be valuable for construction companies, developers, and investors:\n\n${dataString}` }
        ],
      });
      
      let result: any;
      try {
        // Safely extract the text content from the response
        const responseText = typeof response.content[0] === 'object' && 
                            'text' in response.content[0] ? 
                            response.content[0].text : 
                            JSON.stringify(response.content);
                            
        result = JSON.parse(responseText);
      } catch (error: any) {
        console.error("Error parsing Claude response as JSON:", error);
        result = { 
          error: "Failed to parse response",
          message: error.message || "Unknown parsing error",
          rawContent: JSON.stringify(response.content) 
        };
      }
      
      // Save analysis to database
      const analysisData: InsertAiAnalysis = {
        analysisType: "market_trends",
        inputData: { 
          sampleSize: sampledData.length,
          governorates: Object.keys(governorateGroups),
          totalListings: data.length
        },
        result,
        provider: "anthropic"
      };
      
      await storage.saveAiAnalysis(analysisData);
      
      return result;
    } catch (error) {
      console.error("Error analyzing market trends with Claude:", error);
      throw error;
    }
  }
  
  // Helper methods for data analysis
  private calculatePriceStatistics(data: any[]): any {
    const prices = data
      .filter(item => item.price && !isNaN(parseFloat(item.price)))
      .map(item => parseFloat(item.price));
      
    if (prices.length === 0) return { min: 0, max: 0, avg: 0, median: 0 };
    
    prices.sort((a, b) => a - b);
    
    const min = prices[0];
    const max = prices[prices.length - 1];
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const median = prices.length % 2 === 0 
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)];
      
    return { min, max, avg, median };
  }
  
  private calculatePropertyTypeDistribution(data: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    data.forEach(item => {
      if (!item.propertyType) return;
      
      if (!distribution[item.propertyType]) {
        distribution[item.propertyType] = 0;
      }
      
      distribution[item.propertyType]++;
    });
    
    return distribution;
  }
  
  private calculateCityDistribution(data: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    data.forEach(item => {
      if (!item.city) return;
      
      if (!distribution[item.city]) {
        distribution[item.city] = 0;
      }
      
      distribution[item.city]++;
    });
    
    return distribution;
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
