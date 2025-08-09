import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// POST /api/estimation/calculate - Calculer une estimation
router.post('/calculate', async (req, res) => {
  try {
    const { 
      name = "Nouvelle estimation",
      projectType, 
      area, 
      floors = 1,
      qualityLevel = "PREMIUM",
      includeWastage = true
    } = req.body;

    if (!projectType || !area) {
      return res.status(400).json({
        message: "Type de projet et superficie requis"
      });
    }

    const areaNum = parseFloat(area);
    const floorsNum = parseInt(floors);

    // Récupérer tous les matériaux disponibles
    const allMaterials = await storage.getMaterials();

    
    // Définir les coefficients de qualité
    const qualityMultipliers = {
      BASIC: 0.8,
      STANDARD: 1.0,
      PREMIUM: 1.3,
      LUXURY: 1.6
    };

    const qualityMultiplier = qualityMultipliers[qualityLevel as keyof typeof qualityMultipliers] || 1.0;
    const wastageMultiplier = includeWastage ? 1.1 : 1.0;

    // Calculer les quantités et coûts par catégorie
    const categories = [
      {
        category: "gros_oeuvre",
        totalCost: 0,
        materials: [] as any[]
      },
      {
        category: "second_oeuvre", 
        totalCost: 0,
        materials: [] as any[]
      },
      {
        category: "finition",
        totalCost: 0,
        materials: [] as any[]
      }
    ];

    // Mappage des matériaux par catégorie
    const materialsByCategory = {
      gros_oeuvre: allMaterials.filter(m => 
        m.category === "gros_oeuvre" || 
        m.name.toLowerCase().includes("béton") ||
        m.name.toLowerCase().includes("ciment") ||
        m.name.toLowerCase().includes("fer") ||
        m.name.toLowerCase().includes("brique")
      ),
      second_oeuvre: allMaterials.filter(m => 
        m.category === "second_oeuvre" ||
        m.name.toLowerCase().includes("plâtre") ||
        m.name.toLowerCase().includes("isolation") ||
        m.name.toLowerCase().includes("plomberie") ||
        m.name.toLowerCase().includes("électricité")
      ),
      finition: allMaterials.filter(m => 
        m.category === "finition" ||
        m.name.toLowerCase().includes("peinture") ||
        m.name.toLowerCase().includes("carrelage") ||
        m.name.toLowerCase().includes("parquet") ||
        m.name.toLowerCase().includes("sanitaire")
      )
    };

    // Calculer pour chaque catégorie
    for (const category of categories) {
      const categoryMaterials = materialsByCategory[category.category as keyof typeof materialsByCategory] || [];
      
      for (const material of categoryMaterials.slice(0, 5)) { // Prendre les 5 premiers de chaque catégorie
        let quantity = 0;
        
        // Calculs de quantité basés sur la superficie et le type de matériau
        if (material.name.toLowerCase().includes("béton") || material.name.toLowerCase().includes("ciment")) {
          quantity = areaNum * floorsNum * 0.15; // 0.15 m³ par m²
        } else if (material.name.toLowerCase().includes("brique")) {
          quantity = areaNum * floorsNum * 50; // 50 briques par m²
        } else if (material.name.toLowerCase().includes("fer") || material.name.toLowerCase().includes("acier")) {
          quantity = areaNum * floorsNum * 8; // 8 kg par m²
        } else if (material.name.toLowerCase().includes("carrelage") || material.name.toLowerCase().includes("parquet")) {
          quantity = areaNum * 1.1; // +10% de perte
        } else if (material.name.toLowerCase().includes("peinture")) {
          quantity = areaNum * floorsNum * 0.3; // 0.3L par m²
        } else {
          // Quantité par défaut basée sur la superficie
          quantity = areaNum * 0.1;
        }

        const adjustedQuantity = quantity * qualityMultiplier * wastageMultiplier;
        const unitPrice = material.price;
        const totalPrice = adjustedQuantity * unitPrice;

        const materialEstimation = {
          id: material.id,
          name: material.name,
          quantity: Math.round(adjustedQuantity * 100) / 100,
          unit: material.unit,
          unitPrice: unitPrice,
          totalPrice: Math.round(totalPrice * 100) / 100,
          supplier: material.supplier || "Non spécifié"
        };

        category.materials.push(materialEstimation);
        category.totalCost += totalPrice;
      }
      
      category.totalCost = Math.round(category.totalCost * 100) / 100;
    }

    // Calculer le coût total
    const totalCost = categories.reduce((sum, cat) => sum + cat.totalCost, 0);

    const estimationResult = {
      categories,
      totalCost: Math.round(totalCost * 100) / 100,
      metadata: {
        projectType,
        area: areaNum,
        floors: floorsNum,
        qualityLevel,
        includeWastage,
        calculatedAt: new Date().toISOString()
      }
    };

    res.json(estimationResult);
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
      estimationId: savedEstimation.id,
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
