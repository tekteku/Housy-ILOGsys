import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// POST /api/estimation/calculate - Calculer une estimation
router.post('/calculate', async (req, res) => {
  try {
    const { projectType, area, materials, location } = req.body;

    if (!projectType || !area) {
      return res.status(400).json({
        message: "Type de projet et superficie requis"
      });
    }

    // Simple estimation calculation (placeholder logic)
    const basePrice = projectType === 'residential' ? 500 : 700; // TND per m²
    const areaMultiplier = parseFloat(area);
    const locationMultiplier = location === 'tunis' ? 1.2 : 1.0;
    
    const baseCost = basePrice * areaMultiplier * locationMultiplier;
    
    // Add material costs if provided
    let materialCost = 0;
    if (materials && Array.isArray(materials)) {
      materialCost = materials.reduce((total, material) => {
        return total + (material.quantity * material.unitPrice || 0);
      }, 0);
    }

    const totalEstimation = baseCost + materialCost;

    const estimation = {
      projectType,
      area: areaMultiplier,
      location,
      baseCost,
      materialCost,
      totalEstimation,
      currency: 'TND',
      calculatedAt: new Date()
    };

    res.json({
      message: "Estimation calculée avec succès",
      data: estimation
    });
  } catch (error) {
    console.error('Erreur lors du calcul de l\'estimation:', error);
    res.status(500).json({
      message: "Erreur lors du calcul de l'estimation"
    });
  }
});

// POST /api/estimation/save - Sauvegarder une estimation
router.post('/save', async (req, res) => {
  try {
    const {
      name,
      projectType,
      area,
      floors,
      qualityLevel,
      wastageIncluded,
      totalCost,
      costBreakdown,
      materialsList,
      createdBy
    } = req.body;

    if (!name || !projectType || !area || !totalCost) {
      return res.status(400).json({
        message: "Nom, type de projet, superficie et coût total requis"
      });
    }

    // Create estimation data
    const estimationData = {
      name,
      projectType,
      area: parseFloat(area),
      floors: parseInt(floors) || 1,
      qualityLevel: qualityLevel || 'STANDARD',
      wastageIncluded: wastageIncluded !== false,
      totalCost: parseFloat(totalCost),
      costBreakdown: costBreakdown || {},
      materialsList: materialsList || [],
      notes: `Estimation pour ${projectType} - ${area}m² - ${qualityLevel}`,
      createdBy: createdBy || 1, // Default user ID
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    const savedEstimation = await storage.createProjectEstimation(estimationData);

    res.status(201).json({
      message: "Estimation sauvegardée avec succès",
      data: savedEstimation
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'estimation:', error);
    res.status(500).json({
      message: "Erreur lors de la sauvegarde de l'estimation"
    });
  }
});

// GET /api/estimation/history - Obtenir l'historique des estimations
router.get('/history', async (req, res) => {
  try {
    const { projectId, userId } = req.query;

    // Get estimations from database
    const estimations = await storage.getProjectEstimations(
      projectId ? parseInt(projectId as string) : undefined
    );

    res.json({
      message: "Historique des estimations récupéré avec succès",
      data: estimations,
      count: estimations.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'historique des estimations"
    });
  }
});

// GET /api/estimation/templates - Obtenir les modèles d'estimation
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 1,
        name: "Maison individuelle",
        type: "residential",
        basePrice: 500,
        description: "Estimation pour une maison individuelle standard"
      },
      {
        id: 2,
        name: "Appartement",
        type: "apartment",
        basePrice: 400,
        description: "Estimation pour un appartement standard"
      },
      {
        id: 3,
        name: "Commercial",
        type: "commercial",
        basePrice: 700,
        description: "Estimation pour un bâtiment commercial"
      }
    ];

    res.json({
      message: "Modèles d'estimation récupérés avec succès",
      data: templates
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des modèles d'estimation"
    });
  }
});

export default router;
