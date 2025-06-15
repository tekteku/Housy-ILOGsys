import fs from 'fs';
import path from 'path';

interface Materiau {
  id: number;
  nom: string;
  type_detaille: string;
  prix: {
    unitaire_tnd: number;
    moyen_tnd: number;
    maximum_tnd: number;
  };
  unite: string;
  fournisseur: {
    meilleur: string;
    nombre_total: number;
  };
  categories: string[];
  taux_economies: number;
  disponibilite: string;
}

interface ProprieteImmobiliere {
  id?: string;
  titre: string;
  prix_tnd: number;
  superficie_m2: number;
  nombre_chambres: number;
  ville: string;
  region: string;
  type_propriete: string;
  source: string;
}

interface DataSet {
  materiaux: Materiau[];
  proprietes: ProprieteImmobiliere[];
  indexGeneral: any;
}

class DataService {
  private static instance: DataService;
  private dataCache: DataSet | null = null;
  private lastLoadTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }
  async loadData(): Promise<DataSet> {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (this.dataCache && (now - this.lastLoadTime) < this.CACHE_DURATION) {
      return this.dataCache;
    }

    try {
      console.log("Loading fresh data from JSON files...");
      
      const dataDir = path.join(process.cwd(), 'server', 'data');
      
      // Load materials data with error handling
      let materiauxData: any = { materiaux: [] };
      try {
        const materiauxPath = path.join(dataDir, 'materiaux', 'catalogue_estimation_materiaux_complet.json');
        const materiauxRaw = fs.readFileSync(materiauxPath, 'utf-8');
        materiauxData = JSON.parse(materiauxRaw);
      } catch (error) {
        console.warn("Could not load materials data:", error);
      }
      
      // Load properties data with NaN handling
      let proprietesData: any = { proprietes: [] };
      try {
        const proprietesPath = path.join(dataDir, 'immobilier', 'proprietes_consolidees_resume.json');
        let proprietesRaw = fs.readFileSync(proprietesPath, 'utf-8');
        
        // Replace NaN values with null before parsing
        proprietesRaw = proprietesRaw.replace(/:\s*NaN\s*([,}])/g, ': null$1');
        proprietesRaw = proprietesRaw.replace(/\[\s*NaN\s*([,\]])/g, '[null$1');
        
        proprietesData = JSON.parse(proprietesRaw);
      } catch (error) {
        console.warn("Could not load properties data:", error);
      }
      
      // Load general index with error handling
      let indexData: any = {};
      try {
        const indexPath = path.join(dataDir, 'INDEX_GENERAL.json');
        const indexRaw = fs.readFileSync(indexPath, 'utf-8');
        indexData = JSON.parse(indexRaw);
      } catch (error) {
        console.warn("Could not load index data:", error);
      }

      this.dataCache = {
        materiaux: materiauxData.materiaux || [],
        proprietes: proprietesData.proprietes || [],
        indexGeneral: indexData
      };
      
      this.lastLoadTime = now;
      
      console.log(`Data loaded successfully: ${this.dataCache.materiaux.length} materials, ${this.dataCache.proprietes.length} properties`);
      
      return this.dataCache;
    } catch (error) {
      console.error("Error loading data:", error);
      // Return empty dataset if files can't be loaded
      return {
        materiaux: [],
        proprietes: [],
        indexGeneral: {}
      };
    }
  }

  // Get materials by category
  async getMaterialsByCategory(category?: string): Promise<Materiau[]> {
    const data = await this.loadData();
    
    if (!category) {
      return data.materiaux;
    }
    
    return data.materiaux.filter(materiau => 
      materiau.categories?.includes(category.toLowerCase())
    );
  }

  // Get properties by city/region
  async getPropertiesByLocation(ville?: string, region?: string): Promise<ProprieteImmobiliere[]> {
    const data = await this.loadData();
    
    let properties = data.proprietes;
    
    if (ville) {
      properties = properties.filter(prop => 
        prop.ville?.toLowerCase().includes(ville.toLowerCase())
      );
    }
    
    if (region) {
      properties = properties.filter(prop => 
        prop.region?.toLowerCase().includes(region.toLowerCase())
      );
    }
    
    return properties;
  }
  // Calculate construction cost estimate
  async calculateConstructionCost(surfaceM2: number, ville?: string): Promise<{
    estimation_totale_tnd: number;
    estimation_par_m2_tnd: number;
    materiaux_principaux: any[];
    proprietes_reference: ProprieteImmobiliere[];
    details: string;
  }> {
    const data = await this.loadData();
    
    // Get reference properties in the same city
    const proprietesRef = await this.getPropertiesByLocation(ville);
    
    // Filter properties with valid price and surface data
    const proprietesValides = proprietesRef.filter(prop => 
      prop.prix_tnd && prop.superficie_m2 && 
      prop.prix_tnd > 0 && prop.superficie_m2 > 0 &&
      !isNaN(prop.prix_tnd) && !isNaN(prop.superficie_m2)
    );
    
    // Calculate average price per m2 for similar properties
    const prixParM2Ref = proprietesValides.length > 0 
      ? proprietesValides.reduce((sum, prop) => sum + (prop.prix_tnd / prop.superficie_m2), 0) / proprietesValides.length
      : 2000; // Default if no reference data
    
    // Get main construction materials
    const materiauxPrincipaux = [
      data.materiaux.find(m => m.nom && m.nom.toLowerCase().includes('ciment')),
      data.materiaux.find(m => m.nom && m.nom.toLowerCase().includes('brique')),
      data.materiaux.find(m => m.nom && m.nom.toLowerCase().includes('acier')),
      data.materiaux.find(m => m.nom && m.nom.toLowerCase().includes('sable'))
    ].filter(Boolean);

    // Basic cost calculation
    // Construction cost is typically 60-70% of property sale price
    const estimationTotale = surfaceM2 * prixParM2Ref * 0.65;
    const estimationParM2 = estimationTotale / surfaceM2;

    return {
      estimation_totale_tnd: Math.round(estimationTotale),
      estimation_par_m2_tnd: Math.round(estimationParM2),
      materiaux_principaux: materiauxPrincipaux,
      proprietes_reference: proprietesValides.slice(0, 5), // Return top 5 references
      details: `Estimation basée sur ${proprietesValides.length} propriétés de référence${ville ? ` à ${ville}` : ''} et ${data.materiaux.length} matériaux catalogués.`
    };
  }

  // Get summary statistics
  async getDataSummary(): Promise<{
    nb_materiaux: number;
    nb_proprietes: number;
    villes_disponibles: string[];
    prix_moyen_materiaux_tnd: number;
    prix_moyen_immobilier_par_m2_tnd: number;
  }> {
    const data = await this.loadData();
    
    const villesSet = new Set(data.proprietes.map(p => p.ville).filter(Boolean));
    const villes = Array.from(villesSet);
    
    const prixMoyenMateriaux = data.materiaux.length > 0
      ? data.materiaux.reduce((sum, m) => sum + m.prix.moyen_tnd, 0) / data.materiaux.length
      : 0;
    
    const prixMoyenImmobilier = data.proprietes.length > 0
      ? data.proprietes.reduce((sum, p) => sum + (p.prix_tnd / p.superficie_m2), 0) / data.proprietes.length
      : 0;

    return {
      nb_materiaux: data.materiaux.length,
      nb_proprietes: data.proprietes.length,
      villes_disponibles: villes,
      prix_moyen_materiaux_tnd: Math.round(prixMoyenMateriaux * 100) / 100,
      prix_moyen_immobilier_par_m2_tnd: Math.round(prixMoyenImmobilier)
    };
  }
}

export const dataService = DataService.getInstance();
