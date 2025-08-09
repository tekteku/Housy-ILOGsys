import { apiRequest } from "./queryClient";

/**
 * Enhanced Data Service for Mega Routes Integration
 * 
 * This service provides functions to interact with the new mega routes API endpoints
 * located at /api/mega/* with enhanced features like better error handling,
 * standardized responses, and comprehensive analytics.
 */

// ============================================================================
// ANALYTICS AND DASHBOARD
// ============================================================================

export interface DashboardAnalytics {
  projects: {
    total: number;
    active: number;
    completed: number;
    averageProgress: number;
  };
  materials: {
    total: number;
    categories: number;
  };
  budget: {
    categories: Array<{
      category: string;
      budget: number;
      actual: number;
    }>;
    monthly: Array<{
      month: string;
      budget: number;
      actual: number;
    }>;
  };
  charts: {
    projectProgress: Array<{
      month: string;
      progress: number;
    }>;
    budgetUsage: Array<{
      month: string;
      budget: number;
    }>;
    materialUsage: Array<{
      month: string;
      usage: number;
    }>;
    resources: Array<{
      month: string;
      workers: number;
      machines: number;
    }>;  };
  tasks: {
    total: number;
    completed: number;
    percentage: number;
  };
  activities: Array<{
    id: number;
    actionType: string;
    entityType: string;
    details: any;
    timestamp: string;
    user?: {
      id: number;
      username: string;
      fullName?: string;
      avatar?: string;
    };
    entity?: any;
  }>;
  period: string;
  timestamp: string;
}

/**
 * Get comprehensive dashboard analytics
 */
export async function getDashboardAnalytics(period: string = 'month'): Promise<DashboardAnalytics> {
  try {
    const response = await apiRequest('GET', `/api/mega/analytics/dashboard?period=${period}`, undefined);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    throw error;
  }
}

// ============================================================================
// ENHANCED MATERIALS MANAGEMENT
// ============================================================================

export interface EnhancedMaterial {
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
  priceHistory?: MaterialPriceHistory[];
}

export interface MaterialPriceHistory {
  id: number;
  materialId: number;
  price: number;
  priceCurrency: string;
  effectiveDate: string;
  supplier?: string;
}

export interface MaterialEstimationRequest {
  projectType: string;
  area: number;
  floors: number;
  qualityLevel: 'STANDARD' | 'PREMIUM' | 'LUXE';
  includeWastage: boolean;
}

export interface MaterialEstimationResponse {
  categories: Array<{
    category: string;
    materials: Array<{
      name: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalCost: number;
    }>;
    totalCost: number;
  }>;
  totalCost: number;
  qualityLevel: string;
  wastageIncluded: boolean;
  calculatedAt: string;
}

/**
 * Get enhanced materials with filters and pagination
 */
export async function getEnhancedMaterials(options?: {
  category?: string;
  search?: string;
  supplier?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ materials: EnhancedMaterial[]; total: number; page: number; totalPages: number }> {
  try {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.search) params.append('search', options.search);
    if (options?.supplier) params.append('supplier', options.supplier);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

    const url = params.toString() ? `/api/mega/materials?${params.toString()}` : '/api/mega/materials';
    const response = await apiRequest('GET', url, undefined);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching enhanced materials:', error);
    throw error;
  }
}

/**
 * Calculate enhanced material estimation
 */
export async function calculateEnhancedMaterialEstimation(
  estimation: MaterialEstimationRequest
): Promise<MaterialEstimationResponse> {
  try {
    const response = await apiRequest('POST', '/api/mega/materials/estimate', estimation);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error calculating material estimation:', error);
    throw error;
  }
}

/**
 * Get material price trends with enhanced analytics
 */
export async function getEnhancedMaterialTrends(options?: {
  materialIds?: number[];
  months?: number;
  category?: string;
}): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (options?.materialIds) params.append('materialIds', options.materialIds.join(','));
    if (options?.months) params.append('months', options.months.toString());
    if (options?.category) params.append('category', options.category);

    const url = params.toString() ? `/api/mega/materials/trends?${params.toString()}` : '/api/mega/materials/trends';
    const response = await apiRequest('GET', url, undefined);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching material trends:', error);
    throw error;
  }
}

/**
 * Compare material prices with enhanced analysis
 */
export async function compareEnhancedMaterialPrices(materialNames: string[]): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/mega/materials/compare', { materialNames });
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error comparing material prices:', error);
    throw error;
  }
}

// ============================================================================
// ENHANCED PROJECTS MANAGEMENT
// ============================================================================

export interface EnhancedProject {
  id: number;
  name: string;
  description?: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  clientName?: string;
  location?: string;
  tasks?: Array<{
    id: number;
    name: string;
    status: string;
    progress: number;
    startDate: string;
    endDate: string;
    resources?: any[];
  }>;
  estimations?: any[];
  documents?: any[];
}

/**
 * Get enhanced projects with comprehensive data
 */
export async function getEnhancedProjects(options?: {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
  includeDetails?: boolean;
}): Promise<{ projects: EnhancedProject[]; total: number; page: number; totalPages: number }> {
  try {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.priority) params.append('priority', options.priority);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.includeDetails) params.append('includeDetails', 'true');

    const url = params.toString() ? `/api/mega/projects?${params.toString()}` : '/api/mega/projects';
    const response = await apiRequest('GET', url, undefined);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching enhanced projects:', error);
    throw error;
  }
}

/**
 * Get project details with full data
 */
export async function getEnhancedProjectDetails(projectId: number): Promise<EnhancedProject> {
  try {
    const response = await apiRequest('GET', `/api/mega/projects/${projectId}`, undefined);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw error;
  }
}

/**
 * Create enhanced project with validation
 */
export async function createEnhancedProject(project: Partial<EnhancedProject>): Promise<EnhancedProject> {
  try {
    const response = await apiRequest('POST', '/api/mega/projects', project);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

// ============================================================================
// ENHANCED NOTIFICATIONS
// ============================================================================

export interface EnhancedNotification {
  id: number;
  userId?: number;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  readAt?: string;
  data?: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get enhanced notifications with filtering
 */
export async function getEnhancedNotifications(options?: {
  isRead?: boolean;
  type?: string;
  priority?: string;
  page?: number;
  limit?: number;
}): Promise<{ notifications: EnhancedNotification[]; total: number; unreadCount: number }> {
  try {
    const params = new URLSearchParams();
    if (options?.isRead !== undefined) params.append('isRead', options.isRead.toString());
    if (options?.type) params.append('type', options.type);
    if (options?.priority) params.append('priority', options.priority);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const url = params.toString() ? `/api/mega/notifications?${params.toString()}` : '/api/mega/notifications';
    const response = await apiRequest('GET', url, undefined);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<EnhancedNotification> {
  try {
    const response = await apiRequest('PUT', `/api/mega/notifications/${notificationId}/read`, undefined);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// ============================================================================
// ENHANCED FILE UPLOADS
// ============================================================================

export interface DocumentUploadResponse {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedAt: string;
}

/**
 * Upload documents with enhanced metadata
 */
export async function uploadDocument(
  file: File,
  options?: {
    projectId?: number;
    category?: string;
    isClientVisible?: boolean;
    description?: string;
  }
): Promise<DocumentUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.projectId) formData.append('projectId', options.projectId.toString());
    if (options?.category) formData.append('category', options.category);
    if (options?.isClientVisible) formData.append('isClientVisible', options.isClientVisible.toString());
    if (options?.description) formData.append('description', options.description);

    const response = await fetch('/api/mega/upload/documents', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

// ============================================================================
// ENHANCED REPORTS
// ============================================================================

export interface ReportGenerationRequest {
  type: 'project' | 'materials' | 'market';
  parameters: any;
  format?: 'pdf' | 'excel' | 'json';
}

export interface ReportGenerationResponse {
  reportId: string;
  filename: string;
  downloadUrl: string;
  generatedAt: string;
  format: string;
  size: number;
}

/**
 * Generate enhanced reports
 */
export async function generateEnhancedReport(request: ReportGenerationRequest): Promise<ReportGenerationResponse> {
  try {
    const response = await apiRequest('POST', '/api/mega/reports/generate', request);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

// ============================================================================
// HEALTH CHECK AND INFO
// ============================================================================

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  database: 'connected' | 'disconnected';
  services: {
    [key: string]: 'operational' | 'degraded' | 'down';
  };
}

/**
 * Get system health status
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  try {
    const response = await apiRequest('GET', '/api/mega/health', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching health status:', error);
    throw error;
  }
}

/**
 * Get API information
 */
export async function getApiInfo(): Promise<any> {
  try {
    const response = await apiRequest('GET', '/api/mega/info', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error fetching API info:', error);
    throw error;
  }
}
