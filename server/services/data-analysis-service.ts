import { readFileSync } from 'fs';
import path from 'path';

interface MaterialData {
  metadonnees: {
    nombre_materiaux: number;
    economies_moyennes: string;
  };
  materiaux: Array<{
    nom: string;
    prix: {
      prix_unitaire: number;
      unite: string;
    };
    category: string;
  }>;
}

interface PropertyData {
  metadonnees: {
    nombre_total_proprietes: number;
  };
  proprietes: Array<{
    prix: number;
    surface: number;
    region: string;
    type: string;
  }>;
}

class DataAnalysisService {
  private dataPath: string;
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
  }

  /**
   * Charge les données des matériaux de construction
   */  async loadMaterialData(): Promise<MaterialData> {
    try {
      const filePath = path.join(this.dataPath, 'materiaux/catalogue_estimation_materiaux_complet.json');
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Erreur lors du chargement des données matériaux: ${error}`);
    }
  }

  /**
   * Charge les données immobilières consolidées
   */  async loadPropertyData(): Promise<PropertyData> {
    try {
      const filePath = path.join(this.dataPath, 'immobilier/proprietes_consolidees_resume.json');
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Erreur lors du chargement des données immobilières: ${error}`);
    }
  }

  /**
   * Charge les templates d'estimation
   */  async loadEstimationTemplates() {
    try {
      const filePath = path.join(this.dataPath, 'INDEX_GENERAL.json');
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Erreur lors du chargement des templates: ${error}`);
    }
  }

  /**
   * Analyse les matériaux pour un projet donné
   */
  async analyzeMaterialsForProject(projectType: string, surface: number) {
    const materials = await this.loadMaterialData();
    const templates = await this.loadEstimationTemplates();

    // Calcul basé sur la surface et le type de projet
    const analysis = {
      projet: {
        type: projectType,
        surface: surface,
        estimated_cost: 0
      },
      materiaux_recommandes: [] as any[],
      economies_possibles: 0,
      total_estimation: 0
    };

    // Logique d'analyse basée sur les données réelles
    materials.materiaux.forEach(material => {
      const quantity = this.calculateQuantityForSurface(material.nom, surface);
      const cost = quantity * material.prix.prix_unitaire;
      
      analysis.materiaux_recommandes.push({
        nom: material.nom,
        quantite: quantity,
        prix_unitaire: material.prix.prix_unitaire,
        cout_total: cost,
        unite: material.prix.unite
      });

      analysis.total_estimation += cost;
    });

    // Calcul des économies basé sur les données réelles
    const economyRate = parseFloat(materials.metadonnees.economies_moyennes.replace('%', '')) / 100;
    analysis.economies_possibles = analysis.total_estimation * economyRate;

    return analysis;
  }

  /**
   * Analyse comparative des prix immobiliers par région
   */
  async analyzePropertyPricesByRegion(targetRegion?: string) {
    const properties = await this.loadPropertyData();

    const analysis = {
      nombre_total_proprietes: properties.metadonnees.nombre_total_proprietes,
      analyse_par_region: {} as any,
      recommandations: [] as string[]
    };

    // Grouper par région et calculer les moyennes
    const regionGroups: { [key: string]: number[] } = {};
    
    properties.proprietes.forEach(prop => {
      if (!regionGroups[prop.region]) {
        regionGroups[prop.region] = [];
      }
      regionGroups[prop.region].push(prop.prix);
    });

    // Calculer les statistiques par région
    Object.keys(regionGroups).forEach(region => {
      const prices = regionGroups[region];
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      analysis.analyse_par_region[region] = {
        nombre_proprietes: prices.length,
        prix_moyen: avgPrice,
        prix_minimum: minPrice,
        prix_maximum: maxPrice,
        accessibilite: avgPrice < 200000 ? 'Abordable' : avgPrice < 400000 ? 'Moyen' : 'Élevé'
      };
    });

    // Générer des recommandations intelligentes
    if (targetRegion && analysis.analyse_par_region[targetRegion]) {
      const targetData = analysis.analyse_par_region[targetRegion];
      analysis.recommandations.push(
        `Région ${targetRegion}: Prix moyen ${targetData.prix_moyen.toLocaleString()} TND`,
        `Niveau d'accessibilité: ${targetData.accessibilite}`,
        `${targetData.nombre_proprietes} propriétés disponibles`
      );
    }

    return analysis;
  }

  /**
   * Génère un contexte enrichi pour les prompts AI
   */
  async generateAIContext(projectDescription: string) {
    const materials = await this.loadMaterialData();
    const properties = await this.loadPropertyData();
    
    const context = {
      donnees_marche: {
        materiaux_disponibles: materials.metadonnees.nombre_materiaux,
        proprietes_analysees: properties.metadonnees.nombre_total_proprietes,
        precision_donnees: "100%",
        sources_certifiees: [
          "brico-direct.tn",
          "remax.com.tn", 
          "fi-dari.tn",
          "mubawab.tn",
          "tecnocasa.tn"
        ]
      },
      projet_utilisateur: projectDescription,
      context_tunisien: {
        climat: "Méditerranéen",
        regulations: "Code de l'urbanisme tunisien",
        materiaux_locaux: ["Briques locales", "Pierre de Carthage", "Carrelage Salammbo"],
        considerations_speciales: [
          "Résistance aux vents marins",
          "Isolation thermique été/hiver",
          "Conformité normes tunisiennes"
        ]
      }
    };

    return context;
  }

  /**
   * Calcule la quantité de matériau nécessaire pour une surface donnée
   */
  private calculateQuantityForSurface(materialName: string, surface: number): number {
    // Ratios basés sur l'expérience construction tunisienne
    const ratios: { [key: string]: number } = {
      'Brique': surface * 150, // 150 briques par m²
      'Ciment': surface * 0.5, // 0.5 sacs par m²
      'Sable': surface * 0.3, // 0.3 m³ par m²
      'Gravier': surface * 0.2, // 0.2 m³ par m²
      'Fer': surface * 15, // 15 kg par m²
      'Carrelage': surface * 1.1, // 1.1 m² (avec pertes)
    };

    return ratios[materialName] || surface * 0.1; // Valeur par défaut
  }
}

export default DataAnalysisService;
