import { apiRequest } from "./queryClient";

/**
 * Service for handling data retrieval and processing
 */

export interface Material {
  id: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  priceCurrency: string;
  supplier?: string;
  brand?: string;
  description?: string;
  lastUpdated: string;
}

export interface PriceHistory {
  materialId: number;
  price: number;
  effectiveDate: string;
  supplier?: string;
}

export interface MaterialEstimation {
  projectType: string;
  area: number;
  floors: number;
  qualityLevel: string;
  includeWastage: boolean;
}

export interface RealEstateListing {
  id: number;
  propertyId: string;
  title: string;
  description?: string;
  price: number;
  priceCurrency: string;
  area?: number;
  rooms?: string;
  propertyType: string;
  city: string;
  governorate: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  url?: string;
  source?: string;
  scrapedAt: string;
}

/**
 * Fetch all materials
 */
export async function getMaterials(filters?: {
  category?: string;
  search?: string;
  supplier?: string;
}): Promise<Material[]> {
  try {
    let url = '/api/materials';
    
    // Add query parameters if filters are provided
    if (filters?.category) {
      url += `?category=${encodeURIComponent(filters.category)}`;
    }
    
    const response = await apiRequest('GET', url, undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
}

/**
 * Fetch material price trends
 */
export async function getMaterialPriceTrends(materialIds: number[], months: number = 6): Promise<any[]> {
  try {
    const response = await apiRequest(
      'GET', 
      `/api/materials/trends?ids=${materialIds.join(',')}&months=${months}`, 
      undefined
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching material price trends:', error);
    throw error;
  }
}

/**
 * Compare material prices between suppliers
 */
export async function compareMaterialPrices(materialNames: string[]): Promise<any[]> {
  try {
    const response = await apiRequest(
      'POST', 
      '/api/materials/compare', 
      { materialNames }
    );
    return await response.json();
  } catch (error) {
    console.error('Error comparing material prices:', error);
    throw error;
  }
}

/**
 * Import materials from CSV
 */
export async function importMaterialsFromCsv(): Promise<{message: string; count: number}> {
  try {
    const response = await apiRequest('POST', '/api/materials/import', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error importing materials:', error);
    throw error;
  }
}

/**
 * Calculate material estimation
 */
export async function calculateMaterialEstimation(data: MaterialEstimation): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/estimation/calculate', data);
    return await response.json();
  } catch (error) {
    console.error('Error calculating material estimation:', error);
    throw error;
  }
}

/**
 * Save estimation
 */
export async function saveEstimation(data: any): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/estimation/save', data);
    return await response.json();
  } catch (error) {
    console.error('Error saving estimation:', error);
    throw error;
  }
}

/**
 * Get estimation history
 */
export async function getEstimationHistory(projectId?: number): Promise<any[]> {
  try {
    let url = '/api/estimation/history';
    if (projectId) {
      url += `?projectId=${projectId}`;
    }
    
    const response = await apiRequest('GET', url, undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching estimation history:', error);
    throw error;
  }
}

/**
 * Get real estate listings
 */
export async function getRealEstateListings(filters?: {
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
}): Promise<RealEstateListing[]> {
  try {
    let url = '/api/real-estate';
    
    // Add query parameters if filters are provided
    if (filters) {
      const params = new URLSearchParams();
      
      if (filters.city) params.append('city', filters.city);
      if (filters.propertyType) params.append('propertyType', filters.propertyType);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.minArea) params.append('minArea', filters.minArea.toString());
      if (filters.maxArea) params.append('maxArea', filters.maxArea.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await apiRequest('GET', url, undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching real estate listings:', error);
    throw error;
  }
}

/**
 * Import real estate data from CSV
 */
export async function importRealEstateData(): Promise<{message: string; status: string}> {
  try {
    const response = await apiRequest('POST', '/api/real-estate/import', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error importing real estate data:', error);
    throw error;
  }
}

/**
 * Generate reports
 */
export async function generateProjectReport(
  projectId: number, 
  format: 'pdf' | 'excel' = 'pdf'
): Promise<any> {
  try {
    const response = await apiRequest(
      'POST', 
      '/api/reports/project', 
      { projectId, format }
    );
    return await response.json();
  } catch (error) {
    console.error('Error generating project report:', error);
    throw error;
  }
}

export async function generateMaterialsReport(
  estimationId: number, 
  format: 'pdf' | 'excel' = 'pdf'
): Promise<any> {
  try {
    const response = await apiRequest(
      'POST', 
      '/api/reports/materials', 
      { estimationId, format }
    );
    return await response.json();
  } catch (error) {
    console.error('Error generating materials report:', error);
    throw error;
  }
}

export async function generateMarketReport(
  filters: any,
  format: 'pdf' | 'excel' = 'pdf'
): Promise<any> {
  try {
    const response = await apiRequest(
      'POST', 
      '/api/reports/market', 
      { filters, format }
    );
    return await response.json();
  } catch (error) {
    console.error('Error generating market report:', error);
    throw error;
  }
}
