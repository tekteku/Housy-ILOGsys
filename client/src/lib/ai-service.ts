import { apiRequest } from "./queryClient";

/**
 * Service for handling AI-related functionality
 */
export interface ChatMessage {
  id?: number;
  userId?: number | null;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  sessionId: string;
}

export interface AIAnalysisRequest {
  type: string;
  data: any[];
}

export interface AIAnalysisResponse {
  message: string;
  result: any;
}

/**
 * Send a message to the AI chatbot
 */
export async function sendChatMessage(
  message: string,
  sessionId: string,
  model: string = 'openai',
  userId?: number
): Promise<{response: string; sessionId: string}> {
  try {
    // Utiliser les mega-routes qui sont plus robustes
    const response = await apiRequest('POST', '/api/mega/ai/chat', {
      message,
      sessionId,
      userId,
      model
    });
    
    const data = await response.json();
    
    if (data.success) {
      return {
        response: data.data.response,
        sessionId: data.data.sessionId
      };
    } else {
      throw new Error(data.message || 'Erreur lors de l\'envoi du message');
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
    
    // Fallback vers l'ancien endpoint si nécessaire
    try {
      const fallbackResponse = await apiRequest('POST', '/api/ai/chat', {
        message,
        sessionId,
        userId,
        model
      });
      
      return await fallbackResponse.json();
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw error;
    }
  }
}

/**
 * Fetch chat history for a session
 */
export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    const response = await apiRequest('GET', `/api/ai/chat/${sessionId}`, undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}

/**
 * Analyze material data with AI
 */
export async function analyzeMaterialData(): Promise<AIAnalysisResponse> {
  try {
    const response = await apiRequest('POST', '/api/ai/analyze/materials', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error analyzing material data:', error);
    throw error;
  }
}

/**
 * Analyze real estate market trends with AI
 */
export async function analyzeMarketTrends(): Promise<AIAnalysisResponse> {
  try {
    const response = await apiRequest('POST', '/api/ai/market-trends', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error analyzing market trends:', error);
    throw error;
  }
}

/**
 * Generate price predictions with AI
 */
export async function generatePricePredictions(): Promise<AIAnalysisResponse> {
  try {
    const response = await apiRequest('POST', '/api/ai/price-prediction', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error generating price predictions:', error);
    throw error;
  }
}
