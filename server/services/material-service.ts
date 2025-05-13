import { storage } from "../storage";
import { Material, InsertMaterial, MaterialPriceHistory, InsertMaterialPriceHistory } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Define material categories
const MATERIAL_CATEGORIES = {
  GROS_OEUVRE: 'gros_oeuvre',
  SECOND_OEUVRE: 'second_oeuvre',
  FINITION: 'finition'
};

// Define wastage rates by material category (in percentages)
const WASTAGE_RATES = {
  [MATERIAL_CATEGORIES.GROS_OEUVRE]: 10, // 10% wastage for structural materials
  [MATERIAL_CATEGORIES.SECOND_OEUVRE]: 7, // 7% wastage for secondary materials
  [MATERIAL_CATEGORIES.FINITION]: 5, // 5% wastage for finishing materials
};

// Define quality factors (multipliers for different quality levels)
const QUALITY_FACTORS = {
  STANDARD: 1.0,
  PREMIUM: 1.35,
  LUXE: 1.8
};

interface MaterialEstimation {
  category: string;
  totalCost: number;
  materials: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    supplier?: string;
  }>;
}

export class MaterialService {
  
  // Import materials from CSV file
  async importMaterialsFromCsv(filePath: string): Promise<Material[]> {
    try {
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      const importedMaterials: Material[] = [];
      
      for (const record of records) {
        if (!record.id || !record.name || !record.category || !record.price || !record.unit) {
          continue; // Skip incomplete records
        }
        
        // Check if material already exists
        const materialId = parseInt(record.id.replace('mat_', ''), 10);
        const existingMaterial = await storage.getMaterial(materialId);
        
        const materialData: InsertMaterial = {
          name: record.name.trim(),
          category: record.category.trim(),
          unit: record.unit.trim(),
          price: parseFloat(record.price),
          priceCurrency: record.price_currency?.trim() || 'TND',
          supplier: record.supplier || null,
          brand: record.brand || null,
          description: record.description || null,
          lastUpdated: new Date()
        };
        
        let material: Material;
        
        if (existingMaterial) {
          // Update existing material
          material = await storage.updateMaterial(existingMaterial.id, materialData) as Material;
          
          // Add price history entry if price changed
          if (existingMaterial.price !== materialData.price) {
            const historyEntry: InsertMaterialPriceHistory = {
              materialId: existingMaterial.id,
              price: materialData.price,
              priceCurrency: materialData.priceCurrency,
              effectiveDate: new Date(),
              supplier: materialData.supplier
            };
            
            await storage.addMaterialPriceHistory(historyEntry);
          }
        } else {
          // Create new material
          material = await storage.createMaterial(materialData);
          
          // Add initial price history
          const historyEntry: InsertMaterialPriceHistory = {
            materialId: material.id,
            price: materialData.price,
            priceCurrency: materialData.priceCurrency,
            effectiveDate: new Date(),
            supplier: materialData.supplier
          };
          
          await storage.addMaterialPriceHistory(historyEntry);
        }
        
        importedMaterials.push(material);
      }
      
      return importedMaterials;
    } catch (error) {
      console.error('Error importing materials from CSV:', error);
      throw error;
    }
  }
  
  // Calculate material costs based on project parameters
  async calculateMaterialEstimation(
    projectType: string,
    area: number,
    floors: number,
    qualityLevel: 'STANDARD' | 'PREMIUM' | 'LUXE',
    includeWastage: boolean
  ): Promise<{
    categories: MaterialEstimation[];
    totalCost: number;
  }> {
    try {
      // Get all materials
      const allMaterials = await storage.getMaterials();
      
      // Get materials by category
      const grosOeuvreMaterials = allMaterials.filter(m => m.category === MATERIAL_CATEGORIES.GROS_OEUVRE);
      const secondOeuvreMaterials = allMaterials.filter(m => m.category === MATERIAL_CATEGORIES.SECOND_OEUVRE);
      const finitionMaterials = allMaterials.filter(m => m.category === MATERIAL_CATEGORIES.FINITION);
      
      // Define base material requirements per sqm based on project type
      // These are approximation factors based on project type
      let baseRequirements: Record<string, number> = {
        [MATERIAL_CATEGORIES.GROS_OEUVRE]: 1.0,
        [MATERIAL_CATEGORIES.SECOND_OEUVRE]: 1.0,
        [MATERIAL_CATEGORIES.FINITION]: 1.0
      };
      
      // Adjust requirements based on project type
      switch (projectType.toLowerCase()) {
        case 'apartment':
          baseRequirements[MATERIAL_CATEGORIES.GROS_OEUVRE] = 0.8;
          baseRequirements[MATERIAL_CATEGORIES.SECOND_OEUVRE] = 1.2;
          baseRequirements[MATERIAL_CATEGORIES.FINITION] = 1.3;
          break;
        case 'villa':
          baseRequirements[MATERIAL_CATEGORIES.GROS_OEUVRE] = 1.2;
          baseRequirements[MATERIAL_CATEGORIES.SECOND_OEUVRE] = 1.3;
          baseRequirements[MATERIAL_CATEGORIES.FINITION] = 1.4;
          break;
        case 'immeuble':
          baseRequirements[MATERIAL_CATEGORIES.GROS_OEUVRE] = 1.5;
          baseRequirements[MATERIAL_CATEGORIES.SECOND_OEUVRE] = 1.2;
          baseRequirements[MATERIAL_CATEGORIES.FINITION] = 1.0;
          break;
        case 'commercial':
          baseRequirements[MATERIAL_CATEGORIES.GROS_OEUVRE] = 1.3;
          baseRequirements[MATERIAL_CATEGORIES.SECOND_OEUVRE] = 1.5;
          baseRequirements[MATERIAL_CATEGORIES.FINITION] = 1.2;
          break;
        default:
          // Default is maintained as 1.0 for all
          break;
      }
      
      // Apply quality factor
      const qualityFactor = QUALITY_FACTORS[qualityLevel];
      
      // Calculate total area with floors
      const totalArea = area * floors;
      
      // Calculate estimations for each category
      const estimations: MaterialEstimation[] = [
        this.calculateCategoryEstimation(
          MATERIAL_CATEGORIES.GROS_OEUVRE,
          grosOeuvreMaterials,
          totalArea,
          baseRequirements[MATERIAL_CATEGORIES.GROS_OEUVRE],
          qualityFactor,
          includeWastage ? WASTAGE_RATES[MATERIAL_CATEGORIES.GROS_OEUVRE] : 0
        ),
        this.calculateCategoryEstimation(
          MATERIAL_CATEGORIES.SECOND_OEUVRE,
          secondOeuvreMaterials,
          totalArea,
          baseRequirements[MATERIAL_CATEGORIES.SECOND_OEUVRE],
          qualityFactor,
          includeWastage ? WASTAGE_RATES[MATERIAL_CATEGORIES.SECOND_OEUVRE] : 0
        ),
        this.calculateCategoryEstimation(
          MATERIAL_CATEGORIES.FINITION,
          finitionMaterials,
          totalArea,
          baseRequirements[MATERIAL_CATEGORIES.FINITION],
          qualityFactor,
          includeWastage ? WASTAGE_RATES[MATERIAL_CATEGORIES.FINITION] : 0
        )
      ];
      
      // Calculate total cost
      const totalCost = estimations.reduce(
        (total, category) => total + category.totalCost,
        0
      );
      
      return {
        categories: estimations,
        totalCost
      };
    } catch (error) {
      console.error('Error calculating material estimation:', error);
      throw error;
    }
  }
  
  // Calculate material estimation for a specific category
  private calculateCategoryEstimation(
    category: string,
    materials: Material[],
    area: number,
    requirementFactor: number,
    qualityFactor: number,
    wastagePercentage: number
  ): MaterialEstimation {
    // Define material quantities needed per square meter for different materials
    // These are simplified formulas and would be more complex in a real system
    const materialUsageRates: Record<string, (area: number) => number> = {
      'Ciment Portland CPJ 45': (area) => area * 0.35, // 350kg per m²
      'Sable de construction lave': (area) => area * 0.08, // 0.08 m³ per m²
      'Gravier concasse 5/15': (area) => area * 0.12, // 0.12 m³ per m²
      'Acier a beton HA Fe E400': (area) => area * 0.03, // 30kg per m²
      'Brique creuse 12 trous': (area) => area * 50, // 50 units per m²
      'Bloc de beton 20x20x40': (area) => area * 12.5, // 12.5 units per m²
      'Tube PVC evacuation': (area) => area * 0.5, // 0.5 ml per m²
      'Cable electrique': (area) => area * 2.5, // 2.5ml per m²
      'Plaque de platre BA13': (area) => area * 1.2, // 1.2 m² per m²
      'Carrelage gres cerame': (area) => area * 1.05, // 1.05 m² per m² (5% cutting loss)
      'Peinture acrylique': (area) => area * 0.3, // 0.3L per m²
      'default': (area) => area * 0.1, // Default fallback
    };
    
    const categoryMaterials = materials.map(material => {
      // Determine quantity needed based on material name or use default
      let baseQuantity = 0;
      
      // Try to match material name with known rates
      const materialNameLower = material.name.toLowerCase();
      const matchingRate = Object.keys(materialUsageRates).find(key => 
        materialNameLower.includes(key.toLowerCase())
      );
      
      if (matchingRate) {
        baseQuantity = materialUsageRates[matchingRate](area);
      } else {
        baseQuantity = materialUsageRates['default'](area);
      }
      
      // Apply requirement factor based on project type
      const adjustedQuantity = baseQuantity * requirementFactor;
      
      // Apply wastage factor if needed
      const finalQuantity = adjustedQuantity * (1 + wastagePercentage / 100);
      
      // For some materials, quality affects quantity, for others it affects price
      // Here we simplify by applying quality to price for all materials
      const adjustedPrice = material.price * qualityFactor;
      
      // Calculate total price for this material
      const totalPrice = adjustedPrice * finalQuantity;
      
      return {
        id: material.id,
        name: material.name,
        quantity: parseFloat(finalQuantity.toFixed(2)),
        unit: material.unit,
        unitPrice: parseFloat(adjustedPrice.toFixed(2)),
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        supplier: material.supplier,
      };
    });
    
    // Calculate total cost for this category
    const totalCost = categoryMaterials.reduce(
      (total, material) => total + material.totalPrice,
      0
    );
    
    return {
      category,
      totalCost: parseFloat(totalCost.toFixed(2)),
      materials: categoryMaterials
    };
  }
  
  // Compare material prices between suppliers
  async compareMaterialPrices(materialNames: string[]): Promise<Array<{
    name: string;
    unit: string;
    suppliers: Array<{
      supplier: string;
      price: number;
      currency: string;
      lastUpdated: Date;
    }>;
    bestPrice: {
      supplier: string;
      price: number;
      currency: string;
    };
  }>> {
    try {
      const allMaterials = await storage.getMaterials();
      
      const comparisonResults = [];
      
      for (const name of materialNames) {
        // Find all materials matching this name (from different suppliers)
        const matchingMaterials = allMaterials.filter(
          m => m.name.toLowerCase().includes(name.toLowerCase())
        );
        
        if (matchingMaterials.length > 0) {
          // Extract unit from first match (assuming same unit for all suppliers)
          const unit = matchingMaterials[0].unit;
          
          // Create supplier price list
          const suppliers = matchingMaterials.map(m => ({
            supplier: m.supplier || 'Unknown supplier',
            price: m.price,
            currency: m.priceCurrency,
            lastUpdated: m.lastUpdated
          }));
          
          // Find the best price
          const bestPrice = suppliers.reduce((best, current) => 
            current.price < best.price ? current : best
          , suppliers[0]);
          
          comparisonResults.push({
            name: matchingMaterials[0].name, // Use name from first match
            unit,
            suppliers,
            bestPrice: {
              supplier: bestPrice.supplier,
              price: bestPrice.price,
              currency: bestPrice.currency
            }
          });
        }
      }
      
      return comparisonResults;
    } catch (error) {
      console.error('Error comparing material prices:', error);
      throw error;
    }
  }
  
  // Get material price trends for a given period
  async getMaterialPriceTrends(materialIds: number[], months: number = 6): Promise<any> {
    try {
      const trends = [];
      
      for (const materialId of materialIds) {
        // Get material info
        const material = await storage.getMaterial(materialId);
        
        if (!material) continue;
        
        // Get price history
        const priceHistory = await storage.getMaterialPriceHistory(materialId);
        
        // Sort by date (oldest first)
        priceHistory.sort((a, b) => 
          new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime()
        );
        
        // Prepare trend data
        trends.push({
          materialId,
          name: material.name,
          unit: material.unit,
          currentPrice: material.price,
          currency: material.priceCurrency,
          priceHistory: priceHistory.map(h => ({
            price: h.price,
            date: h.effectiveDate,
            supplier: h.supplier
          })),
          // Calculate trend percentage from oldest to newest price
          trend: priceHistory.length > 1
            ? ((priceHistory[priceHistory.length - 1].price - priceHistory[0].price) / priceHistory[0].price) * 100
            : 0
        });
      }
      
      return trends;
    } catch (error) {
      console.error('Error getting material price trends:', error);
      throw error;
    }
  }
}

export const materialService = new MaterialService();
