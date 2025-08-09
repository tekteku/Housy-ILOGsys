/**
 * Routes API pour estimation IA avec restriction Ollama (admin seulement)
 */

import { Router } from 'express';
import { z } from 'zod';
import { estimationAIService, EstimationAIRequest } from '../services/estimation-ai-service';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Schéma de validation pour les requêtes d'estimation IA
const estimationAISchema = z.object({
  prompt: z.string().min(1, 'Prompt requis'),
  context: z.object({
    projectType: z.string(),
    area: z.number().positive(),
    floors: z.number().positive(),
    qualityLevel: z.enum(['STANDARD', 'PREMIUM', 'LUXE']),
    includeWastage: z.boolean()
  }),
  preferredModel: z.enum(['openai', 'claude', 'ollama', 'deepseek']).optional()
});

const marketAnalysisSchema = z.object({
  location: z.string().optional(),
  analysisType: z.enum(['general', 'detailed', 'forecast']).optional().default('general')
});

/**
 * POST /api/estimation-ai/generate
 * Génère une estimation avec IA selon les permissions utilisateur
 * Ollama = Admin uniquement
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const validatedData = estimationAISchema.parse(req.body);
    const user = (req as any).user;
    
    const estimationRequest: EstimationAIRequest = {
      ...validatedData,
      userId: user?.id,
      userRole: user?.role
    };

    // Log de la tentative d'estimation
    console.log(`📊 Estimation AI request from user ${user?.id} (${user?.role}) with model: ${validatedData.preferredModel || 'auto'}`);

    const response = await estimationAIService.generateMaterialEstimationWithAI(estimationRequest);

    res.json({
      success: true,
      data: {
        response,
        modelUsed: validatedData.preferredModel || 'auto-selected',
        userRole: user?.role,
        canUseOllama: user?.role === 'admin' || user?.role === 'super_admin',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in estimation AI generation:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération de l\'estimation IA'
    });
  }
});

/**
 * POST /api/estimation-ai/market-analysis
 * Analyse des tendances de marché (Ollama pour admins)
 */
router.post('/market-analysis', authenticateToken, async (req, res) => {
  try {
    const validatedData = marketAnalysisSchema.parse(req.body);
    const user = (req as any).user;

    console.log(`📈 Market analysis request from user ${user?.id} (${user?.role}) for location: ${validatedData.location || 'general'}`);

    const analysis = await estimationAIService.analyzeMarketTrends(
      user?.role,
      validatedData.location
    );

    res.json({
      success: true,
      data: {
        analysis,
        location: validatedData.location || 'Tunisie (général)',
        userRole: user?.role,
        modelUsed: user?.role === 'admin' || user?.role === 'super_admin' ? 'ollama-local' : 'openai-cloud',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in market analysis:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse de marché'
    });
  }
});

/**
 * GET /api/estimation-ai/models
 * Retourne les modèles IA disponibles selon le rôle utilisateur
 */
router.get('/models', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const availableModels = estimationAIService.getAvailableModelsForUser(user?.role);

    res.json({
      success: true,
      data: {
        models: availableModels,
        userRole: user?.role,
        canUseOllama: user?.role === 'admin' || user?.role === 'super_admin',
        restrictions: {
          ollama: 'Réservé aux administrateurs pour estimation sécurisée',
          openai: 'Disponible pour tous',
          claude: 'Disponible pour tous',
          deepseek: 'Disponible pour tous'
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching available models:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des modèles'
    });
  }
});

/**
 * GET /api/estimation-ai/permissions
 * Vérifie les permissions utilisateur pour les modèles IA
 */
router.get('/permissions', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    res.json({
      success: true,
      data: {
        userId: user?.id,
        userRole: user?.role,
        permissions: {
          canUseOllama: isAdmin,
          canUseOpenAI: true,
          canUseClaude: true,
          canUseDeepSeek: true
        },
        restrictions: {
          ollama: {
            enabled: isAdmin,
            reason: isAdmin ? 'Accès autorisé - Administrateur' : 'Réservé aux administrateurs uniquement'
          }
        },
        recommendations: isAdmin 
          ? 'Utilisez Ollama pour les estimations confidentielles et les analyses avancées'
          : 'Utilisez OpenAI ou Claude pour vos estimations et conseils'
      }
    });

  } catch (error) {
    console.error('❌ Error checking permissions:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions'
    });
  }
});

/**
 * POST /api/estimation-ai/test-ollama
 * Test de connexion Ollama (admin seulement)
 */
router.post('/test-ollama', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Ollama réservé aux administrateurs'
      });
    }

    // Test simple d'Ollama
    const testRequest: EstimationAIRequest = {
      prompt: 'Test de connexion Ollama - réponds simplement "Connexion Ollama réussie"',
      context: {
        projectType: 'test',
        area: 100,
        floors: 1,
        qualityLevel: 'STANDARD',
        includeWastage: false
      },
      userId: user?.id,
      userRole: user?.role,
      preferredModel: 'ollama'
    };

    const response = await estimationAIService.generateMaterialEstimationWithAI(testRequest);

    res.json({
      success: true,
      data: {
        ollamaResponse: response,
        status: 'Ollama accessible et fonctionnel',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Ollama test failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Test Ollama échoué',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;
