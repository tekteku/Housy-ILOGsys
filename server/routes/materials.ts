import { Router } from 'express';
import { materialService } from '../services/material-service';
import { storage } from '../storage';

const router = Router();

// GET /api/materials - Obtenir tous les matériaux
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      supplier, 
      page = 1, 
      limit = 20,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
      // Use storage.getMaterials() instead of materialService.getAllMaterials()
    const materials = await storage.getMaterials();

    res.json({
      message: "Matériaux récupérés avec succès",
      data: materials,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: materials.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des matériaux:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des matériaux"
    });
  }
});

// GET /api/materials/:id - Obtenir un matériau par ID
router.get('/:id', async (req, res) => {
  try {
    const materialId = parseInt(req.params.id);
    
    if (isNaN(materialId)) {
      return res.status(400).json({
        message: "ID de matériau invalide"
      });
    }

    const material = await (materialService as any).getMaterialById(materialId);

    if (!material) {
      return res.status(404).json({
        message: "Matériau non trouvé"
      });
    }

    res.json({
      message: "Matériau récupéré avec succès",
      data: material
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du matériau:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération du matériau"
    });
  }
});

// GET /api/materials/categories - Obtenir toutes les catégories
router.get('/categories', async (req, res) => {
  try {
    const categories = await (materialService as any).getCategories();

    res.json({
      message: "Catégories récupérées avec succès",
                                                                      data: categories
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des catégories"
    });
  }
});

// GET /api/materials/suppliers - Obtenir tous les fournisseurs
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await (materialService as any).getSuppliers();

    res.json({
      message: "Fournisseurs récupérés avec succès",
      data: suppliers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des fournisseurs"
    });
  }
});

// POST /api/materials/search - Recherche avancée de matériaux
router.post('/search', async (req, res) => {
  try {
    const requestBody = req.body;
    
    const { 
      search, 
      category, 
      supplier, 
      page = 1, 
      limit = 20,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc'
      // Any other parameters from requestBody can be ignored or handled if getAllMaterials supports them
    } = requestBody;

    const optionsForGetAllMaterials = {
      search: search as string | undefined,
      category: category as string | undefined,
      supplier: supplier as string | undefined,
      page: typeof page === 'string' ? parseInt(page, 10) : Number(page),
      limit: typeof limit === 'string' ? parseInt(limit, 10) : Number(limit),
      minPrice: minPrice !== undefined ? (typeof minPrice === 'string' ? parseFloat(minPrice) : Number(minPrice)) : undefined,
      maxPrice: maxPrice !== undefined ? (typeof maxPrice === 'string' ? parseFloat(maxPrice) : Number(maxPrice)) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    // Validate parsed numeric values and sortOrder
    if (isNaN(optionsForGetAllMaterials.page) || optionsForGetAllMaterials.page <= 0) {
      optionsForGetAllMaterials.page = 1;
    }
    if (isNaN(optionsForGetAllMaterials.limit) || optionsForGetAllMaterials.limit <= 0) {
      optionsForGetAllMaterials.limit = 20;
    }
    if (optionsForGetAllMaterials.minPrice !== undefined && isNaN(optionsForGetAllMaterials.minPrice)) {
      optionsForGetAllMaterials.minPrice = undefined;
    }
    if (optionsForGetAllMaterials.maxPrice !== undefined && isNaN(optionsForGetAllMaterials.maxPrice)) {
      optionsForGetAllMaterials.maxPrice = undefined;
    }
    if (optionsForGetAllMaterials.sortOrder !== 'asc' && optionsForGetAllMaterials.sortOrder !== 'desc') {
      optionsForGetAllMaterials.sortOrder = 'asc';
    }

    const materials = await (materialService as any).getAllMaterials(optionsForGetAllMaterials);

    res.json({
      message: "Recherche effectuée avec succès",
      data: materials,
      searchParams: requestBody // Return the original request body as searchParams
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de matériaux:', error);
    res.status(500).json({
      message: "Erreur lors de la recherche de matériaux"
    });
  }
});

// GET /api/materials/:id/price-history - Obtenir l'historique des prix
router.get('/:id/price-history', async (req, res) => {
  try {
    const materialId = parseInt(req.params.id);
    const { period = '12months' } = req.query;
    
    if (isNaN(materialId)) {
      return res.status(400).json({
        message: "ID de matériau invalide"
      });
    }

    const priceHistory = await (materialService as any).getPriceHistory(materialId, period as string);

    res.json({
      message: "Historique des prix récupéré avec succès",
      data: priceHistory
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des prix:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'historique des prix"
    });
  }
});

// POST /api/materials/bulk-create - Créer plusieurs matériaux
router.post('/bulk-create', async (req, res) => {
  try {
    const materialsData = req.body.materials;
    
    if (!Array.isArray(materialsData)) {
      return res.status(400).json({
        message: "Format invalide: attendu un tableau de matériaux"
      });
    }

    const createdMaterials = await (materialService as any).bulkCreateMaterials(materialsData);

    res.status(201).json({
      message: `${createdMaterials.length} matériaux créés avec succès`,
      data: createdMaterials
    });
  } catch (error) {
    console.error('Erreur lors de la création en lot:', error);
    res.status(500).json({
      message: "Erreur lors de la création en lot des matériaux"
    });
  }
});

// GET /api/materials/trends - Obtenir les tendances des matériaux
router.get('/trends', async (req, res) => {
  try {
    const { ids, months = 12 } = req.query;
    
    if (!ids) {
      return res.status(400).json({
        message: "Paramètre 'ids' requis"
      });
    }

    const materialIds = Array.isArray(ids) ? ids : (ids as string).split(',');
    
    if (materialIds.length === 0) {
      return res.status(400).json({
        message: "Au moins un ID de matériau requis"
      });
    }

    const monthsNum = parseInt(months as string) || 12;
    
    // For now, return mock trend data since we don't have historical price data in our schema
    const trends = materialIds.map((id, index) => ({
      materialId: parseInt(id as string),
      materialName: `Matériau ${id}`,
      trends: Array.from({ length: monthsNum }, (_, i) => ({
        month: new Date(Date.now() - (monthsNum - i - 1) * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
        price: 100 + Math.random() * 50 + (index * 10), // Mock price trend
        volume: Math.floor(Math.random() * 1000) + 500 // Mock volume
      }))
    }));

    res.json({
      message: "Tendances récupérées avec succès",
      data: {
        trends,
        period: `${monthsNum} mois`,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tendances:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des tendances"
    });
  }
});

// GET /api/materials/market-analysis - Analyse du marché
router.get('/market-analysis', async (req, res) => {
  try {
    const { category, region = 'tunisia' } = req.query;
    
    const analysis = await (materialService as any).getMarketAnalysis({
      category: category as string,
      region: region as string
    });

    res.json({
      message: "Analyse du marché récupérée avec succès",
      data: analysis
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse du marché:', error);
    res.status(500).json({
      message: "Erreur lors de l'analyse du marché"
    });
  }
});

// POST /api/materials/import-csv - Importer des matériaux depuis un CSV
router.post('/import-csv', async (req, res) => {
  try {
    const { csvData, options = {} } = req.body;
    
    if (!csvData) {
      return res.status(400).json({
        message: "Données CSV requises"
      });
    }

    const result = await (materialService as any).importFromCSV(csvData, options);

    res.json({
      message: "Import CSV effectué avec succès",
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de l\'import CSV:', error);
    res.status(500).json({
      message: "Erreur lors de l'import CSV"
    });
  }
});

// POST /api/materials/compare - Comparer plusieurs matériaux
router.post('/compare', async (req, res) => {
  try {
    const { materialIds } = req.body;
    
    if (!Array.isArray(materialIds) || materialIds.length < 2) {
      return res.status(400).json({
        message: "Au moins 2 IDs de matériaux requis pour la comparaison"
      });
    }

    // Get materials by IDs
    const materials = [];
    for (const id of materialIds) {
      try {
        const material = await storage.getMaterial(parseInt(id));
        if (material) {
          materials.push(material);
        }
      } catch (error) {
        console.warn(`Material with ID ${id} not found`);
      }
    }

    if (materials.length < 2) {
      return res.status(404).json({
        message: "Pas assez de matériaux trouvés pour la comparaison"
      });
    }    // Create comparison result
    const comparison = {
      materials,
      comparison: {
        priceRange: {
          min: Math.min(...materials.map(m => m.price || 0)),
          max: Math.max(...materials.map(m => m.price || 0))
        },
        categories: Array.from(new Set(materials.map(m => m.category))),
        suppliers: Array.from(new Set(materials.map(m => m.supplier).filter(Boolean))),
        averagePrice: materials.reduce((sum, m) => sum + (m.price || 0), 0) / materials.length
      },
      comparedAt: new Date()
    };

    res.json({
      message: "Comparaison effectuée avec succès",
      data: comparison
    });
  } catch (error) {
    console.error('Erreur lors de la comparaison:', error);
    res.status(500).json({
      message: "Erreur lors de la comparaison des matériaux"
    });
  }
});

export default router;
