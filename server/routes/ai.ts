import { Router } from 'express';
import { aiService } from '../services/ai-service';

const router = Router();

// POST /api/ai/chat - Chat avec l'assistant IA
router.post('/chat', async (req, res) => {
  try {
    const { message, context = {}, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message requis"
      });
    }

    const sessionId = conversationId || `session_${Date.now()}`;
    const response = await aiService.processChatMessage(sessionId, null, message);

    res.json({
      message: "Réponse de l'IA générée avec succès",
      data: {
        response,
        sessionId,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur lors du chat avec l\'IA:', error);
    res.status(500).json({
      message: "Erreur lors de la communication avec l'IA"
    });
  }
});

// POST /api/ai/analyze-csv - Analyser des données CSV
router.post('/analyze-csv', async (req, res) => {
  try {
    const { data, analysisType = 'general' } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        message: "Données CSV requises sous forme de tableau"
      });
    }

    const analysis = await aiService.analyzeCsvData(data, analysisType);

    res.json({
      message: "Analyse CSV effectuée avec succès",
      data: analysis
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse CSV:', error);
    res.status(500).json({
      message: "Erreur lors de l'analyse CSV"
    });
  }
});

// GET /api/ai/test - Test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: "AI routes module loaded successfully",
    timestamp: new Date()
  });
});

export default router;
