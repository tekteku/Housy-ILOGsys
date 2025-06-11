import DataAnalysisService from './data-analysis-service';

interface AIPromptContext {
  donnees_marche: any;
  projet_utilisateur: string;
  context_tunisien: any;
}

class IntelligentEstimationService {
  private dataAnalysisService: DataAnalysisService;

  constructor() {
    this.dataAnalysisService = new DataAnalysisService();
  }

  /**
   * Génère un prompt enrichi pour l'IA basé sur les données réelles
   */
  async generateEnrichedPrompt(userQuery: string, projectDetails: any): Promise<string> {
    try {
      // Charger les données réelles
      const materialData = await this.dataAnalysisService.loadMaterialData();
      const propertyData = await this.dataAnalysisService.loadPropertyData();
      const estimationTemplates = await this.dataAnalysisService.loadEstimationTemplates();

      // Analyser le projet avec les données réelles
      let materialAnalysis = null;
      if (projectDetails.surface && projectDetails.projectType) {
        materialAnalysis = await this.dataAnalysisService.analyzeMaterialsForProject(
          projectDetails.projectType,
          projectDetails.surface
        );
      }

      // Construire le prompt enrichi
      const enrichedPrompt = `
# ASSISTANT IA CONSTRUCTION TUNISIENNE

## DONNÉES CERTIFIÉES DISPONIBLES:
- **Matériaux**: ${materialData.metadonnees.nombre_materiaux} produits analysés
- **Immobilier**: ${propertyData.metadonnees.nombre_total_proprietes} propriétés analysées
- **Précision**: 100% (sources certifiées)
- **Économies moyennes**: ${materialData.metadonnees.economies_moyennes}

## SOURCES CERTIFIÉES:
- brico-direct.tn (matériaux)
- remax.com.tn, mubawab.tn, fi-dari.tn, tecnocasa.tn (immobilier)

## CONTEXTE TUNISIEN:
- **Climat**: Méditerranéen avec variations régionales
- **Réglementation**: Code de l'urbanisme tunisien en vigueur
- **Matériaux locaux**: Briques rouges, pierre de Carthage, carrelage Salammbo
- **Considérations**: Résistance aux vents marins, isolation thermique

## PROJET UTILISATEUR:
${userQuery}

${projectDetails.surface ? `**Surface**: ${projectDetails.surface}m²` : ''}
${projectDetails.projectType ? `**Type**: ${projectDetails.projectType}` : ''}
${projectDetails.region ? `**Région**: ${projectDetails.region}` : ''}

${materialAnalysis ? `
## ANALYSE AUTOMATIQUE BASÉE SUR LES DONNÉES:
**Estimation totale**: ${materialAnalysis.total_estimation.toLocaleString()} TND
**Économies possibles**: ${materialAnalysis.economies_possibles.toLocaleString()} TND
**Matériaux recommandés**:
${materialAnalysis.materiaux_recommandes.map(m => 
  `- ${m.nom}: ${m.quantite} ${m.unite} (${m.cout_total.toLocaleString()} TND)`
).join('\n')}
` : ''}

## INSTRUCTIONS:
1. **Utilise UNIQUEMENT les données certifiées fournies**
2. **Réponds en français avec prix en TND**
3. **Respecte le contexte tunisien (climat, réglementations)**
4. **Propose des alternatives économiques quand possible**
5. **Inclus des considérations pratiques tunisiennes**
6. **Formate la réponse de manière structurée et professionnelle**

## QUESTION UTILISATEUR:
${userQuery}

Réponds en tant qu'expert en construction tunisienne avec accès à des données de marché certifiées.
`;

      return enrichedPrompt;

    } catch (error) {
      console.error('Erreur génération prompt enrichi:', error);
      
      // Fallback avec prompt basique
      return `
# ASSISTANT CONSTRUCTION TUNISIENNE

## QUESTION:
${userQuery}

## CONTEXTE:
Vous êtes un expert en construction pour le marché tunisien. 
Répondez en français avec des prix en TND et tenez compte du climat méditerranéen.

${projectDetails.surface ? `Surface du projet: ${projectDetails.surface}m²` : ''}
${projectDetails.projectType ? `Type de projet: ${projectDetails.projectType}` : ''}
${projectDetails.region ? `Région: ${projectDetails.region}` : ''}
`;
    }
  }

  /**
   * Analyse intelligente de projet avec recommandations IA
   */
  async generateSmartEstimation(projectDescription: string, details: any) {
    try {
      // Générer le contexte enrichi
      const enrichedPrompt = await this.generateEnrichedPrompt(projectDescription, details);
      
      // Charger les données pour l'analyse
      const materialAnalysis = await this.dataAnalysisService.analyzeMaterialsForProject(
        details.projectType || 'villa',
        details.surface || 200
      );

      const propertyAnalysis = await this.dataAnalysisService.analyzePropertyPricesByRegion(
        details.region
      );

      return {
        prompt_enrichi: enrichedPrompt,
        analyse_materiaux: materialAnalysis,
        analyse_immobilier: propertyAnalysis,
        recommandations_ia: {
          budget_estime: materialAnalysis.total_estimation,
          economies_possibles: materialAnalysis.economies_possibles,
          materiaux_alternatifs: await this.suggestAlternativeMaterials(materialAnalysis),
          conseils_region: this.getRegionalAdvice(details.region),
          optimisations: await this.suggestOptimizations(materialAnalysis)
        }
      };

    } catch (error) {
      console.error('Erreur estimation intelligente:', error);
      throw error;
    }
  }

  /**
   * Suggère des matériaux alternatifs pour économiser
   */
  private async suggestAlternativeMaterials(analysis: any): Promise<string[]> {
    const suggestions = [];
    
    for (const material of analysis.materiaux_recommandes) {
      switch (material.nom.toLowerCase()) {
        case 'brique':
          suggestions.push("Alternative: Parpaings (-15% par rapport aux briques classiques)");
          break;
        case 'carrelage':
          suggestions.push("Alternative: Carrelage local tunisien (-20% par rapport à l'importé)");
          break;
        case 'ciment':
          suggestions.push("Conseil: Achat en gros direct usine (-8% sur grandes quantités)");
          break;
        default:
          if (material.cout_total > 5000) {
            suggestions.push(`${material.nom}: Négociation possible sur grandes quantités`);
          }
      }
    }

    return suggestions;
  }

  /**
   * Conseils spécifiques par région
   */
  private getRegionalAdvice(region?: string): string[] {
    if (!region) return [];

    const adviceMap: Record<string, string[]> = {
      'Tunis': [
        "Zone humide: Privilégier les matériaux anti-humidité",
        "Réglementation stricte: Vérifier les permis avant travaux",
        "Transport: Coûts élevés, grouper les livraisons"
      ],
      'Sfax': [
        "Climat sec: Isolation thermique renforcée recommandée",
        "Port industriel: Accès facilité aux matériaux importés",
        "Vents: Renforcer les structures externes"
      ],
      'Sousse': [
        "Zone côtière: Matériaux résistants au sel marin",
        "Tourisme: Respecter l'esthétique locale",
        "Humidité marine: Traitement anti-corrosion essentiel"
      ],
      'Kairouan': [
        "Région intérieure: Coûts de transport majorés",
        "Climat continental: Isolation thermique importante",
        "Matériaux locaux: Privilégier la production régionale"
      ],
      'Bizerte': [
        "Proximité mer: Protection contre la corrosion",
        "Vents forts: Ancrage renforcé requis",
        "Matériaux: Transport facilité par le port"
      ]
    };

    return adviceMap[region] || ["Région non spécialisée: Conseils généraux tunisiens applicables"];
  }

  /**
   * Suggère des optimisations basées sur l'analyse
   */
  private async suggestOptimizations(analysis: any): Promise<string[]> {
    const optimizations = [];

    // Analyse du budget total
    if (analysis.total_estimation > 100000) {
      optimizations.push("Budget élevé: Négociation groupée recommandée (-5 à 10%)");
    }

    // Analyse des économies possibles
    if (analysis.economies_possibles > 10000) {
      optimizations.push(`Économies importantes possibles: ${analysis.economies_possibles.toLocaleString()} TND`);
    }

    // Optimisations par matériau
    const expensiveMaterials = analysis.materiaux_recommandes
      .filter((m: any) => m.cout_total > 15000)
      .sort((a: any, b: any) => b.cout_total - a.cout_total);

    if (expensiveMaterials.length > 0) {
      optimizations.push(`Matériau le plus coûteux: ${expensiveMaterials[0].nom} (${expensiveMaterials[0].cout_total.toLocaleString()} TND) - Priorité d'optimisation`);
    }

    // Suggestions saisonnières
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 2 && currentMonth <= 4) { // Mars-Mai
      optimizations.push("Période favorable: Prix matériaux généralement plus bas au printemps");
    }

    return optimizations;
  }
}

export default IntelligentEstimationService;
