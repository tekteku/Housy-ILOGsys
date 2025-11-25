import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// POST /api/reports/estimation - Générer un rapport PDF d'estimation
router.post('/estimation', async (req, res) => {
  try {
    const { estimationId, format = 'pdf' } = req.body;

    if (!estimationId) {
      return res.status(400).json({
        message: "ID de l'estimation requis"
      });
    }

    // Récupérer l'estimation depuis la base de données
    const estimation = await storage.getProjectEstimation(estimationId);
    
    if (!estimation) {
      return res.status(404).json({
        message: "Estimation non trouvée"
      });
    }

    // Préparer les données pour le PDF
    const reportData = {
      title: `Estimation - ${estimation.name}`,
      estimation: estimation,
      generatedAt: new Date().toISOString(),
      format: format
    };

    // Pour l'instant, on simule la génération du PDF
    // En production, vous utiliseriez une bibliothèque comme puppeteer ou jsPDF
    const mockPdfBuffer = Buffer.from(`PDF Content for estimation ${estimationId}`);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="estimation-${estimationId}.pdf"`);
    res.setHeader('Content-Length', mockPdfBuffer.length);
    
    res.send(mockPdfBuffer);

  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    res.status(500).json({
      message: "Erreur lors de la génération du rapport"
    });
  }
});

// POST /api/reports/materials - Générer un rapport de matériaux
router.post('/materials', async (req, res) => {
  try {
    const { estimationId, format = 'pdf' } = req.body;

    if (!estimationId) {
      return res.status(400).json({
        message: "ID de l'estimation requis pour le rapport de matériaux"
      });
    }

    // Récupérer l'estimation
    const estimation = await storage.getProjectEstimation(estimationId);
    
    if (!estimation) {
      return res.status(404).json({
        message: "Estimation non trouvée"
      });
    }

    // Simuler la génération du rapport PDF
    const reportContent = `
      RAPPORT DE MATÉRIAUX
      ====================
      
      Estimation: ${estimation.name}
      Type de projet: ${estimation.projectType}
      Surface: ${estimation.area} m²
      Coût total: ${estimation.totalCost} TND
      
      Matériaux utilisés:
      ${JSON.stringify(estimation.materialsList, null, 2)}
      
      Généré le: ${new Date().toLocaleDateString('fr-TN')}
    `;

    const pdfBuffer = Buffer.from(reportContent);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="materials-report-${estimationId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erreur lors de la génération du rapport de matériaux:', error);
    res.status(500).json({
      message: "Erreur lors de la génération du rapport de matériaux"
    });
  }
});

// POST /api/reports/estimation-pdf - Générer un PDF directement depuis les données d'estimation
router.post('/estimation-pdf', async (req, res) => {
  try {
    const { estimationData, format = 'pdf' } = req.body;

    if (!estimationData) {
      return res.status(400).json({
        message: "Données d'estimation requises"
      });
    }

    // Validation des données d'estimation
    if (!estimationData.name || !estimationData.totalCost) {
      return res.status(400).json({
        message: "Données d'estimation incomplètes (nom et coût total requis)"
      });
    }

    // Préparer le contenu du rapport PDF
    const reportContent = `
      ESTIMATION DE PROJET
      =====================
      
      Nom du projet: ${estimationData.name}
      Type de projet: ${estimationData.projectType || 'Non spécifié'}
      Surface: ${estimationData.area || 'Non spécifiée'} m²
      Nombre d'étages: ${estimationData.floors || 'Non spécifié'}
      Niveau de qualité: ${estimationData.qualityLevel || 'Non spécifié'}
      Gaspillage inclus: ${estimationData.wastageIncluded ? 'Oui' : 'Non'}
      
      COÛT TOTAL: ${Number(estimationData.totalCost).toLocaleString('fr-TN')} TND
      
      DÉTAIL PAR CATÉGORIE:
      =====================
      ${estimationData.categories?.map((category: any) => `
      ${category.category.toUpperCase()}
      - Coût total: ${Number(category.totalCost).toLocaleString('fr-TN')} TND
      - Matériaux:
      ${category.materials?.map((material: any) => 
        `  • ${material.name}: ${material.quantity} ${material.unit} × ${Number(material.unitPrice).toLocaleString('fr-TN')} TND = ${Number(material.totalPrice).toLocaleString('fr-TN')} TND`
      ).join('\n') || '  Aucun matériau spécifié'}
      `).join('\n') || 'Aucune catégorie spécifiée'}
      
      =====================
      Rapport généré le: ${new Date().toLocaleDateString('fr-TN')} à ${new Date().toLocaleTimeString('fr-TN')}
      Généré par: Système d'estimation Housy
    `;

    const pdfBuffer = Buffer.from(reportContent);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="estimation-${estimationData.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erreur lors de la génération du PDF d\'estimation:', error);
    res.status(500).json({
      message: "Erreur lors de la génération du PDF d'estimation"
    });
  }
});

export default router;
