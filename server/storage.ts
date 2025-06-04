import { 
  users, 
  projects, 
  tasks, 
  resources, 
  taskResources, 
  materials, 
  materialPriceHistory, 
  realEstateMarket, 
  estimationPresets, 
  projectEstimations, 
  activityLogs, 
  aiAnalysis, 
  notifications, 
  chatMessages,
  companies,
  suppliers,
  contractors,
  projectDocuments,
  financialTransactions,
  budgetCategories,
  projectBudgets,
  equipment,
  equipmentAssignments,
  inventory,
  purchaseOrders,
  purchaseOrderItems,
  qualityInspections,
  safetyIncidents,
  weatherConditions,
  projectMilestones,
  timeTracking,
  clientCommunications,
  // Extended schema imports
  projectCategories,
  clientRequests,
  quotations,
  activeProjects,
  projectPhases,
  projectUpdates,
  payments,
  enhancedProjectDocuments,
  adminStatistics,
  enhancedNotifications,
  systemSettings,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type Task,
  type InsertTask,
  type Resource,
  type InsertResource,
  type TaskResource,
  type InsertTaskResource,
  type Material,
  type InsertMaterial,
  type MaterialPriceHistory,
  type InsertMaterialPriceHistory,
  type RealEstateMarket,
  type InsertRealEstateMarket,
  type EstimationPreset,
  type InsertEstimationPreset,
  type ProjectEstimation,
  type InsertProjectEstimation,
  type ActivityLog,
  type InsertActivityLog,
  type AiAnalysis,
  type InsertAiAnalysis,
  type Notification,
  type InsertNotification,
  type ChatMessage,
  type InsertChatMessage,
  type Company,
  type InsertCompany,
  type Supplier,
  type InsertSupplier,
  type Contractor,
  type InsertContractor,
  type ProjectDocument,
  type InsertProjectDocument,
  type FinancialTransaction,
  type InsertFinancialTransaction,
  type BudgetCategory,
  type InsertBudgetCategory,
  type ProjectBudget,
  type InsertProjectBudget,
  type Equipment,
  type InsertEquipment,
  type EquipmentAssignment,
  type InsertEquipmentAssignment,
  type Inventory,
  type InsertInventory,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type PurchaseOrderItem,
  type InsertPurchaseOrderItem,
  type QualityInspection,
  type InsertQualityInspection,
  type SafetyIncident,
  type InsertSafetyIncident,
  type WeatherCondition,
  type InsertWeatherCondition,
  type ProjectMilestone,
  type InsertProjectMilestone,
  type TimeTracking,
  type InsertTimeTracking,
  type ClientCommunication,
  type InsertClientCommunication,
  // Extended types
  type ProjectCategory,
  type InsertProjectCategory,
  type ClientRequest,
  type InsertClientRequest,
  type Quotation,
  type InsertQuotation,
  type ActiveProject,
  type InsertActiveProject,
  type ProjectPhase,
  type InsertProjectPhase,
  type ProjectUpdate,
  type InsertProjectUpdate,
  type Payment,
  type InsertPayment,
  type EnhancedProjectDocument,
  type InsertEnhancedProjectDocument,
  type AdminStatistic,
  type InsertAdminStatistic,
  type EnhancedNotification,
  type InsertEnhancedNotification,
  type SystemSetting,
  type InsertSystemSetting
} from "../shared/schema";
import { db } from "./db";
import { eq, and, or, ne, like, gte, lte, desc, asc, sql } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Task operations
  getTasks(projectId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Resource operations
  getResources(): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Task-Resource assignment operations
  assignResourceToTask(assignment: InsertTaskResource): Promise<TaskResource>;
  removeResourceFromTask(taskId: number, resourceId: number): Promise<boolean>;
  getTaskResources(taskId: number): Promise<(TaskResource & { resource: Resource })[]>;
  
  // Material operations
  getMaterials(): Promise<Material[]>;
  getMaterialsByCategory(category: string): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | undefined>;
  deleteMaterial(id: number): Promise<boolean>;
  getMaterialTrends(): Promise<any[]>;
  
  // Material price history operations
  getMaterialPriceHistory(materialId: number): Promise<MaterialPriceHistory[]>;
  addMaterialPriceHistory(priceHistory: InsertMaterialPriceHistory): Promise<MaterialPriceHistory>;
  
  // Real estate market operations
  getRealEstateListings(filters?: {
    city?: string,
    propertyType?: string,
    minPrice?: number,
    maxPrice?: number,
    minArea?: number,
    maxArea?: number
  }): Promise<RealEstateMarket[]>;
  addRealEstateListing(listing: InsertRealEstateMarket): Promise<RealEstateMarket>;
  
  // Estimation operations
  getEstimationPresets(): Promise<EstimationPreset[]>;
  getEstimationPreset(id: number): Promise<EstimationPreset | undefined>;
  createEstimationPreset(preset: InsertEstimationPreset): Promise<EstimationPreset>;
  
  getProjectEstimations(projectId?: number): Promise<ProjectEstimation[]>;
  getProjectEstimation(id: number): Promise<ProjectEstimation | undefined>;
  createProjectEstimation(estimation: InsertProjectEstimation): Promise<ProjectEstimation>;
  
  // Activity log operations
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivities(limit?: number): Promise<ActivityLog[]>;
  
  // AI analysis operations
  saveAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  getAiAnalysisByType(type: string): Promise<AiAnalysis[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Chat operations
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;

  // Company operations
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;

  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;

  // Contractor operations
  getContractors(): Promise<Contractor[]>;
  getContractor(id: number): Promise<Contractor | undefined>;
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  updateContractor(id: number, contractor: Partial<InsertContractor>): Promise<Contractor | undefined>;
  deleteContractor(id: number): Promise<boolean>;

  // Project Document operations
  getProjectDocuments(projectId: number): Promise<ProjectDocument[]>;
  getProjectDocument(id: number): Promise<ProjectDocument | undefined>;
  createProjectDocument(document: InsertProjectDocument): Promise<ProjectDocument>;
  updateProjectDocument(id: number, document: Partial<InsertProjectDocument>): Promise<ProjectDocument | undefined>;
  deleteProjectDocument(id: number): Promise<boolean>;

  // Financial Transaction operations
  getFinancialTransactions(projectId?: number): Promise<FinancialTransaction[]>;
  getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined>;
  createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction>;
  updateFinancialTransaction(id: number, transaction: Partial<InsertFinancialTransaction>): Promise<FinancialTransaction | undefined>;
  deleteFinancialTransaction(id: number): Promise<boolean>;

  // Budget Category operations
  getBudgetCategories(): Promise<BudgetCategory[]>;
  getBudgetCategory(id: number): Promise<BudgetCategory | undefined>;
  createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory>;
  updateBudgetCategory(id: number, category: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined>;
  deleteBudgetCategory(id: number): Promise<boolean>;

  // Project Budget operations
  getProjectBudgets(projectId: number): Promise<ProjectBudget[]>;
  getProjectBudget(id: number): Promise<ProjectBudget | undefined>;
  createProjectBudget(budget: InsertProjectBudget): Promise<ProjectBudget>;
  updateProjectBudget(id: number, budget: Partial<InsertProjectBudget>): Promise<ProjectBudget | undefined>;
  deleteProjectBudget(id: number): Promise<boolean>;

  // Equipment operations
  getEquipment(): Promise<Equipment[]>;
  getEquipmentItem(id: number): Promise<Equipment | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: number): Promise<boolean>;

  // Equipment Assignment operations
  getEquipmentAssignments(projectId?: number): Promise<EquipmentAssignment[]>;
  getEquipmentAssignment(id: number): Promise<EquipmentAssignment | undefined>;
  createEquipmentAssignment(assignment: InsertEquipmentAssignment): Promise<EquipmentAssignment>;
  updateEquipmentAssignment(id: number, assignment: Partial<InsertEquipmentAssignment>): Promise<EquipmentAssignment | undefined>;
  deleteEquipmentAssignment(id: number): Promise<boolean>;

  // Inventory operations
  getInventory(projectId?: number): Promise<Inventory[]>;
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;

  // Purchase Order operations
  getPurchaseOrders(projectId?: number): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: number): Promise<boolean>;

  // Purchase Order Item operations
  getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]>;
  getPurchaseOrderItem(id: number): Promise<PurchaseOrderItem | undefined>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  updatePurchaseOrderItem(id: number, item: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined>;
  deletePurchaseOrderItem(id: number): Promise<boolean>;

  // Quality Inspection operations
  getQualityInspections(projectId?: number): Promise<QualityInspection[]>;
  getQualityInspection(id: number): Promise<QualityInspection | undefined>;
  createQualityInspection(inspection: InsertQualityInspection): Promise<QualityInspection>;
  updateQualityInspection(id: number, inspection: Partial<InsertQualityInspection>): Promise<QualityInspection | undefined>;
  deleteQualityInspection(id: number): Promise<boolean>;

  // Safety Incident operations
  getSafetyIncidents(projectId?: number): Promise<SafetyIncident[]>;
  getSafetyIncident(id: number): Promise<SafetyIncident | undefined>;
  createSafetyIncident(incident: InsertSafetyIncident): Promise<SafetyIncident>;
  updateSafetyIncident(id: number, incident: Partial<InsertSafetyIncident>): Promise<SafetyIncident | undefined>;
  deleteSafetyIncident(id: number): Promise<boolean>;

  // Weather Condition operations
  getWeatherConditions(projectId?: number): Promise<WeatherCondition[]>;
  getWeatherCondition(id: number): Promise<WeatherCondition | undefined>;
  createWeatherCondition(condition: InsertWeatherCondition): Promise<WeatherCondition>;
  updateWeatherCondition(id: number, condition: Partial<InsertWeatherCondition>): Promise<WeatherCondition | undefined>;
  deleteWeatherCondition(id: number): Promise<boolean>;

  // Project Milestone operations
  getProjectMilestones(projectId: number): Promise<ProjectMilestone[]>;
  getProjectMilestone(id: number): Promise<ProjectMilestone | undefined>;
  createProjectMilestone(milestone: InsertProjectMilestone): Promise<ProjectMilestone>;
  updateProjectMilestone(id: number, milestone: Partial<InsertProjectMilestone>): Promise<ProjectMilestone | undefined>;
  deleteProjectMilestone(id: number): Promise<boolean>;

  // Time Tracking operations
  getTimeTracking(userId?: number, projectId?: number): Promise<TimeTracking[]>;
  getTimeTrackingEntry(id: number): Promise<TimeTracking | undefined>;
  createTimeTrackingEntry(entry: InsertTimeTracking): Promise<TimeTracking>;
  updateTimeTrackingEntry(id: number, entry: Partial<InsertTimeTracking>): Promise<TimeTracking | undefined>;
  deleteTimeTrackingEntry(id: number): Promise<boolean>;

  // Client Communication operations
  getClientCommunications(projectId: number): Promise<ClientCommunication[]>;
  getClientCommunication(id: number): Promise<ClientCommunication | undefined>;
  createClientCommunication(communication: InsertClientCommunication): Promise<ClientCommunication>;
  updateClientCommunication(id: number, communication: Partial<InsertClientCommunication>): Promise<ClientCommunication | undefined>;
  deleteClientCommunication(id: number): Promise<boolean>;

  // ========================================================================================
  // EXTENDED STORAGE METHODS FOR ADVANCED PROJECT MANAGEMENT
  // ========================================================================================

  // Project Category operations
  getProjectCategories(): Promise<ProjectCategory[]>;
  getAllProjectCategories(filters?: any, sortBy?: string, sortOrder?: 'asc' | 'desc', page?: number, limit?: number): Promise<ProjectCategory[]>;
  getActiveProjectCategories(): Promise<ProjectCategory[]>;
  getProjectCategory(id: number): Promise<ProjectCategory | undefined>;
  createProjectCategory(category: InsertProjectCategory): Promise<ProjectCategory>;
  updateProjectCategory(id: number, category: Partial<InsertProjectCategory>): Promise<ProjectCategory | undefined>;
  deleteProjectCategory(id: number): Promise<boolean>;

  // Client Request operations
  getClientRequests(filters?: { status?: string, categoryId?: number, priority?: string }): Promise<ClientRequest[]>;
  getAllClientRequests(filters?: any, sortBy?: string, sortOrder?: 'asc' | 'desc', page?: number, limit?: number): Promise<ClientRequest[]>;
  getClientRequest(id: number): Promise<ClientRequest | undefined>;
  getClientRequestByNumber(requestNumber: string): Promise<ClientRequest | undefined>;
  createClientRequest(request: InsertClientRequest): Promise<ClientRequest>;
  updateClientRequest(id: number, request: Partial<InsertClientRequest>): Promise<ClientRequest | undefined>;
  deleteClientRequest(id: number): Promise<boolean>;
  assignClientRequest(id: number, userId: number): Promise<ClientRequest | undefined>;

  // Quotation operations
  getQuotations(filters?: { requestId?: number, status?: string }): Promise<Quotation[]>;
  getAllQuotations(filters?: any, sortBy?: string, sortOrder?: 'asc' | 'desc', page?: number, limit?: number): Promise<Quotation[]>;
  getQuotation(id: number): Promise<Quotation | undefined>;
  getQuotationByNumber(quotationNumber: string): Promise<Quotation | undefined>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: number, quotation: Partial<InsertQuotation>): Promise<Quotation | undefined>;
  deleteQuotation(id: number): Promise<boolean>;
  acceptQuotation(id: number): Promise<Quotation | undefined>;
  rejectQuotation(id: number, reason?: string): Promise<Quotation | undefined>;

  // Active Project operations
  getActiveProjects(filters?: { status?: string, teamLead?: number, priority?: string }): Promise<ActiveProject[]>;
  getAllActiveProjects(filters?: any, sortBy?: string, sortOrder?: 'asc' | 'desc', page?: number, limit?: number): Promise<ActiveProject[]>;
  getActiveProject(id: number): Promise<ActiveProject | undefined>;
  getActiveProjectByNumber(projectNumber: string): Promise<ActiveProject | undefined>;
  createActiveProject(project: InsertActiveProject): Promise<ActiveProject>;
  updateActiveProject(id: number, project: Partial<InsertActiveProject>): Promise<ActiveProject | undefined>;
  deleteActiveProject(id: number): Promise<boolean>;
  updateProjectProgress(id: number, progress: number): Promise<ActiveProject | undefined>;

  // Project Phase operations
  getProjectPhases(activeProjectId: number): Promise<ProjectPhase[]>;
  getProjectPhasesByProject(activeProjectId: number): Promise<ProjectPhase[]>;
  getProjectPhase(id: number): Promise<ProjectPhase | undefined>;
  createProjectPhase(phase: InsertProjectPhase): Promise<ProjectPhase>;
  updateProjectPhase(id: number, phase: Partial<InsertProjectPhase>): Promise<ProjectPhase | undefined>;
  deleteProjectPhase(id: number): Promise<boolean>;
  completeProjectPhase(id: number): Promise<ProjectPhase | undefined>;

  // Project Update operations
  getProjectUpdates(activeProjectId: number, filters?: { phaseId?: number, updateType?: string }): Promise<ProjectUpdate[]>;
  getProjectUpdatesByProject(activeProjectId: number, filters?: any, sortBy?: string, sortOrder?: 'asc' | 'desc', page?: number, limit?: number): Promise<ProjectUpdate[]>;
  getProjectUpdate(id: number): Promise<ProjectUpdate | undefined>;
  createProjectUpdate(update: InsertProjectUpdate): Promise<ProjectUpdate>;
  updateProjectUpdate(id: number, update: Partial<InsertProjectUpdate>): Promise<ProjectUpdate | undefined>;
  deleteProjectUpdate(id: number): Promise<boolean>;

  // Payment operations
  getPayments(activeProjectId?: number, filters?: { status?: string, paymentType?: string }): Promise<Payment[]>;
  getPaymentsByProject(projectId?: number): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByNumber(paymentNumber: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;
  markPaymentAsPaid(id: number, paidDate: Date, reference?: string): Promise<Payment | undefined>;

  // Enhanced Project Document operations
  getEnhancedProjectDocuments(filters?: { activeProjectId?: number, category?: string, isClientVisible?: boolean }): Promise<EnhancedProjectDocument[]>;
  getEnhancedProjectDocument(id: number): Promise<EnhancedProjectDocument | undefined>;
  createEnhancedProjectDocument(document: InsertEnhancedProjectDocument): Promise<EnhancedProjectDocument>;
  updateEnhancedProjectDocument(id: number, document: Partial<InsertEnhancedProjectDocument>): Promise<EnhancedProjectDocument | undefined>;
  deleteEnhancedProjectDocument(id: number): Promise<boolean>;

  // Admin Statistics operations
  getAdminStatistics(period?: string, periodStart?: Date, periodEnd?: Date): Promise<AdminStatistic[]>;
  getLatestAdminStatistics(): Promise<AdminStatistic | undefined>;
  createAdminStatistics(statistics: InsertAdminStatistic): Promise<AdminStatistic>;
  calculateAndSaveStatistics(period: string, periodStart: Date, periodEnd: Date): Promise<AdminStatistic>;

  // Enhanced Notification operations
  getEnhancedNotifications(userId?: number, filters?: { isRead?: boolean, type?: string, priority?: string }): Promise<EnhancedNotification[]>;
  getEnhancedNotification(id: number): Promise<EnhancedNotification | undefined>;
  createEnhancedNotification(notification: InsertEnhancedNotification): Promise<EnhancedNotification>;
  updateEnhancedNotification(id: number, notification: Partial<InsertEnhancedNotification>): Promise<EnhancedNotification | undefined>;
  deleteEnhancedNotification(id: number): Promise<boolean>;
  markNotificationAsRead(id: number, userId: number): Promise<EnhancedNotification | undefined>;
  sendBulkNotifications(notifications: InsertEnhancedNotification[]): Promise<EnhancedNotification[]>;

  // System Settings operations
  getSystemSettings(category?: string): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  updateSystemSetting(key: string, value: string, modifiedBy: number): Promise<SystemSetting | undefined>;
  deleteSystemSetting(key: string): Promise<boolean>;
  getSettingValue(key: string, defaultValue?: string): Promise<string | undefined>;
}

// DatabaseStorage class
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).then(rows => rows[0]);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.username, username)).then(rows => rows[0]);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.email, email)).then(rows => rows[0]);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    const projectsList = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return projectsList;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Task operations
  async getTasks(projectId: number): Promise<Task[]> {
    const tasksList = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(asc(tasks.startDate));
    return tasksList;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }
  
  // Resource operations
  async getResources(): Promise<Resource[]> {
    const resourcesList = await db.select().from(resources);
    return resourcesList;
  }

  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined> {
    const [updatedResource] = await db.update(resources).set(resource).where(eq(resources.id, id)).returning();
    return updatedResource;
  }
  async deleteResource(id: number): Promise<boolean> {
    const result = await db.delete(resources).where(eq(resources.id, id));
    return result && result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Task-Resource assignment operations
  async assignResourceToTask(assignment: InsertTaskResource): Promise<TaskResource> {
    const [newAssignment] = await db.insert(taskResources).values(assignment).returning();
    return newAssignment;
  }

  async removeResourceFromTask(taskId: number, resourceId: number): Promise<boolean> {
    await db
      .delete(taskResources)
      .where(
        and(
          eq(taskResources.taskId, taskId),
          eq(taskResources.resourceId, resourceId)
        )
      );
    return true;
  }

  async getTaskResources(taskId: number): Promise<(TaskResource & { resource: Resource })[]> {
    // This is a simplified version as Drizzle ORM doesn't support automatic joins in the type system
    // In a real application, you would use relations and proper joining
    const assignments = await db.select().from(taskResources).where(eq(taskResources.taskId, taskId));
    
    const result: (TaskResource & { resource: Resource })[] = [];
    
    for (const assignment of assignments) {
      const [resource] = await db.select().from(resources).where(eq(resources.id, assignment.resourceId));
      if (resource) {
        result.push({
          ...assignment,
          resource
        });
      }
    }
    
    return result;
  }
  
  // Material operations
  async getMaterials(): Promise<Material[]> {
    const materialsList = await db.select().from(materials);
    return materialsList;
  }

  async getMaterialsByCategory(category: string): Promise<Material[]> {
    const materialsList = await db
      .select()
      .from(materials)
      .where(eq(materials.category, category));
    return materialsList;
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material;
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [newMaterial] = await db.insert(materials).values(material).returning();
    return newMaterial;
  }

  async updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | undefined> {
    const [updatedMaterial] = await db.update(materials).set(material).where(eq(materials.id, id)).returning();
    return updatedMaterial;
  }
  async deleteMaterial(id: number): Promise<boolean> {
    const result = await db.delete(materials).where(eq(materials.id, id));
    return result && result.rowCount ? result.rowCount > 0 : false;
  }

  async getMaterialTrends(): Promise<any[]> {
    // Placeholder implementation
    // TODO: Implement actual logic to fetch material trends
    const recentPriceHistory = await db
      .select({
        materialId: materialPriceHistory.materialId,
        price: materialPriceHistory.price,
        date: materialPriceHistory.effectiveDate, // Corrected from .date to .effectiveDate
        // materialName: materials.name // Assuming materials table has a 'name' field
      })
      .from(materialPriceHistory)
      // .leftJoin(materials, eq(materialPriceHistory.materialId, materials.id))
      .orderBy(desc(materialPriceHistory.effectiveDate)) // Corrected from .date to .effectiveDate
      .limit(20); 
    return recentPriceHistory;
  }

  // Material price history operations
  async getMaterialPriceHistory(materialId: number): Promise<MaterialPriceHistory[]> {
    const history = await db
      .select()
      .from(materialPriceHistory)
      .where(eq(materialPriceHistory.materialId, materialId))
      .orderBy(desc(materialPriceHistory.effectiveDate));
    return history;
  }

  async addMaterialPriceHistory(priceHistory: InsertMaterialPriceHistory): Promise<MaterialPriceHistory> {
    const [newPriceHistory] = await db.insert(materialPriceHistory).values(priceHistory).returning();
    return newPriceHistory;
  }
  
  // Real estate market operations
  async getRealEstateListings(filters?: {
    city?: string,
    propertyType?: string,
    minPrice?: number,
    maxPrice?: number,
    minArea?: number,
    maxArea?: number
  }): Promise<RealEstateMarket[]> {
    const conditions = [];
    
    if (filters) {
      if (filters.city) {
        conditions.push(like(realEstateMarket.city, `%${filters.city}%`));
      }
      if (filters.propertyType) {
        conditions.push(eq(realEstateMarket.propertyType, filters.propertyType));
      }
      if (filters.minPrice) {
        conditions.push(gte(realEstateMarket.price, filters.minPrice));
      }
      if (filters.maxPrice) {
        conditions.push(lte(realEstateMarket.price, filters.maxPrice));
      }
      if (filters.minArea) {
        conditions.push(gte(realEstateMarket.area, filters.minArea));
      }
      if (filters.maxArea) {
        conditions.push(lte(realEstateMarket.area, filters.maxArea));
      }
    }
    
    if (conditions.length > 0) {
      return await db.select().from(realEstateMarket)
        .where(and(...conditions))
        .orderBy(desc(realEstateMarket.scrapedAt));
    }
    
    return await db.select().from(realEstateMarket)
      .orderBy(desc(realEstateMarket.scrapedAt));
  }

  async addRealEstateListing(listing: InsertRealEstateMarket): Promise<RealEstateMarket> {
    const [newListing] = await db.insert(realEstateMarket).values(listing).returning();
    return newListing;
  }
  
  // Estimation operations
  async getEstimationPresets(): Promise<EstimationPreset[]> {
    const presets = await db.select().from(estimationPresets);
    return presets;
  }

  async getEstimationPreset(id: number): Promise<EstimationPreset | undefined> {
    const [preset] = await db.select().from(estimationPresets).where(eq(estimationPresets.id, id));
    return preset;
  }

  async createEstimationPreset(preset: InsertEstimationPreset): Promise<EstimationPreset> {
    const [newPreset] = await db.insert(estimationPresets).values(preset).returning();
    return newPreset;
  }

  async getProjectEstimations(projectId?: number): Promise<ProjectEstimation[]> {
    if (projectId) {
      return db
        .select()
        .from(projectEstimations)
        .where(eq(projectEstimations.projectId, projectId))
        .orderBy(desc(projectEstimations.createdAt));
    } else {
      return db
        .select()
        .from(projectEstimations)
        .orderBy(desc(projectEstimations.createdAt));
    }
  }

  async getProjectEstimation(id: number): Promise<ProjectEstimation | undefined> {
    const [estimation] = await db.select().from(projectEstimations).where(eq(projectEstimations.id, id));
    return estimation;
  }

  async createProjectEstimation(estimation: InsertProjectEstimation): Promise<ProjectEstimation> {
    const [newEstimation] = await db.insert(projectEstimations).values(estimation).returning();
    return newEstimation;
  }
  
  // Activity log operations
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db.insert(activityLogs).values(activity).returning();
    return newActivity;
  }

  async getRecentActivities(limit: number = 10): Promise<ActivityLog[]> {
    const activities = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
    return activities;
  }
  
  // AI analysis operations
  async saveAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const [newAnalysis] = await db.insert(aiAnalysis).values(analysis).returning();
    return newAnalysis;
  }

  async getAiAnalysisByType(type: string): Promise<AiAnalysis[]> {
    const analyses = await db
      .select()
      .from(aiAnalysis)
      .where(eq(aiAnalysis.analysisType, type))
      .orderBy(desc(aiAnalysis.createdAt));
    return analyses;
  }
  
  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return userNotifications;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
    return true;
  }
  
  // Chat operations
  async saveChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.timestamp));
    return messages;
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    const companiesList = await db.select().from(companies).orderBy(desc(companies.createdAt));
    return companiesList;
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updatedCompany] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    await db.delete(companies).where(eq(companies.id, id));
    return true;
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    const suppliersList = await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
    return suppliersList;
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({ ...supplier, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
    return true;
  }

  // Contractor operations
  async getContractors(): Promise<Contractor[]> {
    const contractorsList = await db.select().from(contractors).orderBy(desc(contractors.createdAt));
    return contractorsList;
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    const [contractor] = await db.select().from(contractors).where(eq(contractors.id, id));
    return contractor;
  }

  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const [newContractor] = await db.insert(contractors).values(contractor).returning();
    return newContractor;
  }

  async updateContractor(id: number, contractor: Partial<InsertContractor>): Promise<Contractor | undefined> {
    const [updatedContractor] = await db
      .update(contractors)
      .set({ ...contractor, updatedAt: new Date() })
      .where(eq(contractors.id, id))
      .returning();
    return updatedContractor;
  }

  async deleteContractor(id: number): Promise<boolean> {
    await db.delete(contractors).where(eq(contractors.id, id));
    return true;
  }

  // Additional methods for other new tables would go here...
  // For brevity, I'll add a few key ones and the pattern can be extended

  // Financial Transaction operations
  async getFinancialTransactions(projectId?: number): Promise<FinancialTransaction[]> {
    if (projectId) {
      return db
        .select()
        .from(financialTransactions)
        .where(eq(financialTransactions.projectId, projectId))
        .orderBy(desc(financialTransactions.createdAt));
    } else {
      return db
        .select()
        .from(financialTransactions)
        .orderBy(desc(financialTransactions.createdAt));
    }
  }

  async getFinancialTransaction(id: number): Promise<FinancialTransaction | undefined> {
    const [transaction] = await db.select().from(financialTransactions).where(eq(financialTransactions.id, id));
    return transaction;
  }

  async createFinancialTransaction(transaction: InsertFinancialTransaction): Promise<FinancialTransaction> {
    const [newTransaction] = await db.insert(financialTransactions).values(transaction).returning();
    return newTransaction;
  }

  async updateFinancialTransaction(id: number, transaction: Partial<InsertFinancialTransaction>): Promise<FinancialTransaction | undefined> {
    const [updatedTransaction] = await db
      .update(financialTransactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(financialTransactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async deleteFinancialTransaction(id: number): Promise<boolean> {
    await db.delete(financialTransactions).where(eq(financialTransactions.id, id));
    return true;
  }

  // Equipment operations
  async getEquipment(): Promise<Equipment[]> {
    const equipmentList = await db.select().from(equipment).orderBy(desc(equipment.createdAt));
    return equipmentList;
  }

  async getEquipmentItem(id: number): Promise<Equipment | undefined> {
    const [equipmentItem] = await db.select().from(equipment).where(eq(equipment.id, id));
    return equipmentItem;
  }

  async createEquipment(equipmentItem: InsertEquipment): Promise<Equipment> {
    const [newEquipment] = await db.insert(equipment).values(equipmentItem).returning();
    return newEquipment;
  }

  async updateEquipment(id: number, equipmentItem: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const [updatedEquipment] = await db
      .update(equipment)
      .set({ ...equipmentItem, updatedAt: new Date() })
      .where(eq(equipment.id, id))
      .returning();
    return updatedEquipment;
  }

  async deleteEquipment(id: number): Promise<boolean> {
    await db.delete(equipment).where(eq(equipment.id, id));
    return true;
  }

  // Placeholder methods for other tables (can be expanded)
  async getProjectDocuments(projectId: number): Promise<ProjectDocument[]> {
    return db.select().from(projectDocuments).where(eq(projectDocuments.projectId, projectId));
  }

  async getProjectDocument(id: number): Promise<ProjectDocument | undefined> {
    const [doc] = await db.select().from(projectDocuments).where(eq(projectDocuments.id, id));
    return doc;
  }

  async createProjectDocument(document: InsertProjectDocument): Promise<ProjectDocument> {
    const [newDoc] = await db.insert(projectDocuments).values(document).returning();
    return newDoc;
  }

  async updateProjectDocument(id: number, document: Partial<InsertProjectDocument>): Promise<ProjectDocument | undefined> {
    const [updated] = await db.update(projectDocuments).set({ ...document, updatedAt: new Date() }).where(eq(projectDocuments.id, id)).returning();
    return updated;
  }

  async deleteProjectDocument(id: number): Promise<boolean> {
    await db.delete(projectDocuments).where(eq(projectDocuments.id, id));
    return true;
  }

  // Budget operations
  async getBudgetCategories(): Promise<BudgetCategory[]> {
    return db.select().from(budgetCategories).orderBy(asc(budgetCategories.name));
  }

  async getBudgetCategory(id: number): Promise<BudgetCategory | undefined> {
    const [category] = await db.select().from(budgetCategories).where(eq(budgetCategories.id, id));
    return category;
  }

  async createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory> {
    const [newCategory] = await db.insert(budgetCategories).values(category).returning();
    return newCategory;
  }

  async updateBudgetCategory(id: number, category: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined> {
    const [updated] = await db.update(budgetCategories).set(category).where(eq(budgetCategories.id, id)).returning();
    return updated;
  }

  async deleteBudgetCategory(id: number): Promise<boolean> {
    await db.delete(budgetCategories).where(eq(budgetCategories.id, id));
    return true;
  }

  async getProjectBudgets(projectId: number): Promise<ProjectBudget[]> {
    return db.select().from(projectBudgets).where(eq(projectBudgets.projectId, projectId));
  }

  async getProjectBudget(id: number): Promise<ProjectBudget | undefined> {
    const [budget] = await db.select().from(projectBudgets).where(eq(projectBudgets.id, id));
    return budget;
  }

  async createProjectBudget(budget: InsertProjectBudget): Promise<ProjectBudget> {
    const [newBudget] = await db.insert(projectBudgets).values(budget).returning();
    return newBudget;
  }

  async updateProjectBudget(id: number, budget: Partial<InsertProjectBudget>): Promise<ProjectBudget | undefined> {
    const [updated] = await db.update(projectBudgets).set({ ...budget, lastUpdated: new Date() }).where(eq(projectBudgets.id, id)).returning();
    return updated;
  }

  async deleteProjectBudget(id: number): Promise<boolean> {
    await db.delete(projectBudgets).where(eq(projectBudgets.id, id));
    return true;
  }

  // Equipment Assignment operations
  async getEquipmentAssignments(projectId?: number): Promise<EquipmentAssignment[]> {
    if (projectId) {
      return await db.select().from(equipmentAssignments).where(eq(equipmentAssignments.projectId, projectId));
    }
    return await db.select().from(equipmentAssignments);
  }
  
  async getEquipmentAssignment(id: number): Promise<EquipmentAssignment | undefined> {
    const [assignment] = await db.select().from(equipmentAssignments).where(eq(equipmentAssignments.id, id));
    return assignment;
  }
  
  async createEquipmentAssignment(assignment: InsertEquipmentAssignment): Promise<EquipmentAssignment> { 
    const [newAssignment] = await db.insert(equipmentAssignments).values(assignment).returning();
    return newAssignment;
  }
  
  async updateEquipmentAssignment(id: number, assignment: Partial<InsertEquipmentAssignment>): Promise<EquipmentAssignment | undefined> {
    const [updatedAssignment] = await db.update(equipmentAssignments)
      .set(assignment)
      .where(eq(equipmentAssignments.id, id))
      .returning();
    return updatedAssignment;
  }
  
  async deleteEquipmentAssignment(id: number): Promise<boolean> {
    await db.delete(equipmentAssignments).where(eq(equipmentAssignments.id, id));
    return true;
  }

  // Inventory operations
  async getInventory(projectId?: number): Promise<Inventory[]> {
    if (projectId) {
      return await db.select().from(inventory).where(eq(inventory.projectId, projectId));
    }
    return await db.select().from(inventory);
  }
  
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }
  
  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }
  
  async updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [updatedItem] = await db.update(inventory)
      .set(item)
      .where(eq(inventory.id, id))
      .returning();
    return updatedItem;
  }
  
  async deleteInventoryItem(id: number): Promise<boolean> {
    await db.delete(inventory).where(eq(inventory.id, id));
    return true;
  }

  // Purchase Order operations
  async getPurchaseOrders(projectId?: number): Promise<PurchaseOrder[]> {
    if (projectId) {
      return await db.select().from(purchaseOrders).where(eq(purchaseOrders.projectId, projectId));
    }
    return await db.select().from(purchaseOrders);
  }
  
  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return order;
  }
  
  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [newOrder] = await db.insert(purchaseOrders).values(order).returning();
    return newOrder;
  }
  
  async updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const [updatedOrder] = await db.update(purchaseOrders)
      .set(order)
      .where(eq(purchaseOrders.id, id))
      .returning();
    return updatedOrder;
  }
  
  async deletePurchaseOrder(id: number): Promise<boolean> {
    await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
    return true;
  }

  // Purchase Order Item operations
  async getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]> {
    return await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId));
  }
  
  async getPurchaseOrderItem(id: number): Promise<PurchaseOrderItem | undefined> {
    const [item] = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
    return item;
  }
  
  async createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const [newItem] = await db.insert(purchaseOrderItems).values(item).returning();
    return newItem;
  }
  
  async updatePurchaseOrderItem(id: number, item: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    const [updatedItem] = await db.update(purchaseOrderItems)
      .set(item)
      .where(eq(purchaseOrderItems.id, id))
      .returning();
    return updatedItem;
  }
  
  async deletePurchaseOrderItem(id: number): Promise<boolean> {
    await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
    return true;
  }

  // Quality Inspection operations
  async getQualityInspections(projectId?: number): Promise<QualityInspection[]> {
    if (projectId) {
      return await db.select().from(qualityInspections).where(eq(qualityInspections.projectId, projectId));
    }
    return await db.select().from(qualityInspections);
  }
  
  async getQualityInspection(id: number): Promise<QualityInspection | undefined> {
    const [inspection] = await db.select().from(qualityInspections).where(eq(qualityInspections.id, id));
    return inspection;
  }
  
  async createQualityInspection(inspection: InsertQualityInspection): Promise<QualityInspection> {
    const [newInspection] = await db.insert(qualityInspections).values(inspection).returning();
    return newInspection;
  }
  
  async updateQualityInspection(id: number, inspection: Partial<InsertQualityInspection>): Promise<QualityInspection | undefined> {
    const [updatedInspection] = await db.update(qualityInspections)
      .set(inspection)
      .where(eq(qualityInspections.id, id))
      .returning();
    return updatedInspection;
  }
  
  async deleteQualityInspection(id: number): Promise<boolean> {
    await db.delete(qualityInspections).where(eq(qualityInspections.id, id));
    return true;
  }

  // Safety Incident operations
  async getSafetyIncidents(projectId?: number): Promise<SafetyIncident[]> {
    if (projectId) {
      return await db.select().from(safetyIncidents).where(eq(safetyIncidents.projectId, projectId));
    }
    return await db.select().from(safetyIncidents);
  }
  
  async getSafetyIncident(id: number): Promise<SafetyIncident | undefined> {
    const [incident] = await db.select().from(safetyIncidents).where(eq(safetyIncidents.id, id));
    return incident;
  }
  
  async createSafetyIncident(incident: InsertSafetyIncident): Promise<SafetyIncident> {
    const [newIncident] = await db.insert(safetyIncidents).values(incident).returning();
    return newIncident;
  }
  
  async updateSafetyIncident(id: number, incident: Partial<InsertSafetyIncident>): Promise<SafetyIncident | undefined> {
    // Placeholder implementation
    console.log(`Attempting to update safety incident with id ${id} with data:`, incident);
    const [updatedIncident] = await db.update(safetyIncidents).set(incident).where(eq(safetyIncidents.id, id)).returning();
    return updatedIncident;
  }
  
  async deleteSafetyIncident(id: number): Promise<boolean> {
    // Placeholder implementation
    console.log(`Attempting to delete safety incident with id ${id}`);
    const result = await db.delete(safetyIncidents).where(eq(safetyIncidents.id, id));
    return result && result.rowCount ? result.rowCount > 0 : false;
  }

  // Weather Condition operations
  async getWeatherConditions(projectId?: number): Promise<WeatherCondition[]> {
    if (projectId) {
      return await db.select().from(weatherConditions).where(eq(weatherConditions.projectId, projectId));
    }
    return await db.select().from(weatherConditions);
  }
  
  async getWeatherCondition(id: number): Promise<WeatherCondition | undefined> {
    const [condition] = await db.select().from(weatherConditions).where(eq(weatherConditions.id, id));
    return condition;
  }
  
  async createWeatherCondition(condition: InsertWeatherCondition): Promise<WeatherCondition> {
    const [newCondition] = await db.insert(weatherConditions).values(condition).returning();
    return newCondition;
  }
  
  async updateWeatherCondition(id: number, condition: Partial<InsertWeatherCondition>): Promise<WeatherCondition | undefined> {
    const [updatedCondition] = await db.update(weatherConditions)
      .set(condition)
      .where(eq(weatherConditions.id, id))
      .returning();
    return updatedCondition;
  }
  
  async deleteWeatherCondition(id: number): Promise<boolean> {
    await db.delete(weatherConditions).where(eq(weatherConditions.id, id));
    return true;
  }

  // Project Milestone operations
  async getProjectMilestones(projectId: number): Promise<ProjectMilestone[]> {
    return await db.select().from(projectMilestones).where(eq(projectMilestones.projectId, projectId));
  }
  
  async getProjectMilestone(id: number): Promise<ProjectMilestone | undefined> {
    const [milestone] = await db.select().from(projectMilestones).where(eq(projectMilestones.id, id));
    return milestone;
  }
  
  async createProjectMilestone(milestone: InsertProjectMilestone): Promise<ProjectMilestone> {
    const [newMilestone] = await db.insert(projectMilestones).values(milestone).returning();
    return newMilestone;
  }
  
  async updateProjectMilestone(id: number, milestone: Partial<InsertProjectMilestone>): Promise<ProjectMilestone | undefined> {
    const [updatedMilestone] = await db.update(projectMilestones)
      .set(milestone)
      .where(eq(projectMilestones.id, id))
      .returning();
    return updatedMilestone;
  }
  
  async deleteProjectMilestone(id: number): Promise<boolean> {
    await db.delete(projectMilestones).where(eq(projectMilestones.id, id));
    return true;
  }

  // Time Tracking operations
  async getTimeTracking(userId?: number, projectId?: number): Promise<TimeTracking[]> {
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(timeTracking.userId, userId));
    }
    if (projectId) {
      conditions.push(eq(timeTracking.projectId, projectId));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(timeTracking).where(and(...conditions));
    }
    
    return await db.select().from(timeTracking);
  }
  
  async getTimeTrackingEntry(id: number): Promise<TimeTracking | undefined> {
    const [entry] = await db.select().from(timeTracking).where(eq(timeTracking.id, id));
    return entry;
  }
  
  async createTimeTrackingEntry(entry: InsertTimeTracking): Promise<TimeTracking> {
    const [newEntry] = await db.insert(timeTracking).values(entry).returning();
    return newEntry;
  }
  
  async updateTimeTrackingEntry(id: number, entry: Partial<InsertTimeTracking>): Promise<TimeTracking | undefined> {
    const [updatedEntry] = await db.update(timeTracking)
      .set(entry)
      .where(eq(timeTracking.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteTimeTrackingEntry(id: number): Promise<boolean> {
    await db.delete(timeTracking).where(eq(timeTracking.id, id));
    return true;
  }

  // Client Communication operations
  async getClientCommunications(projectId: number): Promise<ClientCommunication[]> {
    return await db.select().from(clientCommunications).where(eq(clientCommunications.projectId, projectId));
  }
  
  async getClientCommunication(id: number): Promise<ClientCommunication | undefined> {
    const [communication] = await db.select().from(clientCommunications).where(eq(clientCommunications.id, id));
    return communication;
  }
  
  async createClientCommunication(communication: InsertClientCommunication): Promise<ClientCommunication> {
    const [newCommunication] = await db.insert(clientCommunications).values(communication).returning();
    return newCommunication;
  }
  
  async updateClientCommunication(id: number, communication: Partial<InsertClientCommunication>): Promise<ClientCommunication | undefined> {
    const [updatedCommunication] = await db.update(clientCommunications)
      .set(communication)
      .where(eq(clientCommunications.id, id))
      .returning();
    return updatedCommunication;
  }
  
  async deleteClientCommunication(id: number): Promise<boolean> {
    await db.delete(clientCommunications).where(eq(clientCommunications.id, id));
    return true;
  }

  // ========================================================================================
  // EXTENDED STORAGE METHODS IMPLEMENTATION
  // ========================================================================================

  // Project Category operations
  async getProjectCategories(): Promise<ProjectCategory[]> {
    return await db.select().from(projectCategories).where(eq(projectCategories.isActive, true));
  }

  async getAllProjectCategories(
    filters: any = {}, 
    sortBy: string = 'name', 
    sortOrder: 'asc' | 'desc' = 'asc', 
    page: number = 1, 
    limit: number = 50
  ): Promise<ProjectCategory[]> {
    let query = db.select().from(projectCategories);
    
    // Apply filters
    const conditions = [];
    if (filters.isActive !== undefined) {
      conditions.push(eq(projectCategories.isActive, filters.isActive));
    }
    if (filters.name) {
      conditions.push(like(projectCategories.name, `%${filters.name}%`));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = projectCategories[sortBy as keyof typeof projectCategories] || projectCategories.name;
    query = query.orderBy(sortOrder === 'desc' ? desc(sortField) : asc(sortField));

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    return await query;
  }

  async getActiveProjectCategories(): Promise<ProjectCategory[]> {
    return await db.select().from(projectCategories).where(eq(projectCategories.isActive, true)).orderBy(asc(projectCategories.name));
  }

  async getProjectCategory(id: number): Promise<ProjectCategory | undefined> {
    const [category] = await db.select().from(projectCategories).where(eq(projectCategories.id, id));
    return category;
  }

  async createProjectCategory(category: InsertProjectCategory): Promise<ProjectCategory> {
    const [newCategory] = await db.insert(projectCategories).values(category).returning();
    return newCategory;
  }

  async updateProjectCategory(id: number, category: Partial<InsertProjectCategory>): Promise<ProjectCategory | undefined> {
    const [updatedCategory] = await db.update(projectCategories)
      .set(category)
      .where(eq(projectCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteProjectCategory(id: number): Promise<boolean> {
    await db.update(projectCategories)
      .set({ isActive: false })
      .where(eq(projectCategories.id, id));
    return true;
  }

  // Client Request operations
  async getClientRequests(filters?: { status?: string, categoryId?: number, priority?: string }): Promise<ClientRequest[]> {
    let query = db.select().from(clientRequests);
    
    if (filters?.status) {
      query = query.where(eq(clientRequests.status, filters.status));
    }
    if (filters?.categoryId) {
      query = query.where(eq(clientRequests.categoryId, filters.categoryId));
    }
    if (filters?.priority) {
      query = query.where(eq(clientRequests.priority, filters.priority));
    }

    return await query.orderBy(desc(clientRequests.createdAt));
  }

  async getAllClientRequests(
    filters: any = {}, 
    sortBy: string = 'createdAt', 
    sortOrder: 'asc' | 'desc' = 'desc', 
    page: number = 1, 
    limit: number = 50
  ): Promise<ClientRequest[]> {
    let query = db.select().from(clientRequests);
    
    // Apply filters
    const conditions = [];
    if (filters.status) {
      conditions.push(eq(clientRequests.status, filters.status));
    }
    if (filters.categoryId) {
      conditions.push(eq(clientRequests.categoryId, filters.categoryId));
    }
    if (filters.priority) {
      conditions.push(eq(clientRequests.priority, filters.priority));
    }
    if (filters.clientName) {
      conditions.push(like(clientRequests.clientName, `%${filters.clientName}%`));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = clientRequests[sortBy as keyof typeof clientRequests] || clientRequests.createdAt;
    query = query.orderBy(sortOrder === 'desc' ? desc(sortField) : asc(sortField));

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    return await query;
  }

  async getClientRequest(id: number): Promise<ClientRequest | undefined> {
    const [request] = await db.select().from(clientRequests).where(eq(clientRequests.id, id));
    return request;
  }

  async getClientRequestByNumber(requestNumber: string): Promise<ClientRequest | undefined> {
    const [request] = await db.select().from(clientRequests).where(eq(clientRequests.requestNumber, requestNumber));
    return request;
  }

  async createClientRequest(request: InsertClientRequest): Promise<ClientRequest> {
    const [newRequest] = await db.insert(clientRequests).values(request).returning();
    return newRequest;
  }

  async updateClientRequest(id: number, request: Partial<InsertClientRequest>): Promise<ClientRequest | undefined> {
    const [updatedRequest] = await db.update(clientRequests)
      .set(request)
      .where(eq(clientRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async deleteClientRequest(id: number): Promise<boolean> {
    await db.delete(clientRequests).where(eq(clientRequests.id, id));
    return true;
  }

  async assignClientRequest(id: number, userId: number): Promise<ClientRequest | undefined> {
    const [updatedRequest] = await db.update(clientRequests)
      .set({ assignedTo: userId, reviewDate: new Date() })
      .where(eq(clientRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Quotation operations
  async getQuotations(filters?: { requestId?: number, status?: string }): Promise<Quotation[]> {
    let query = db.select().from(quotations);
    
    if (filters?.requestId) {
      query = query.where(eq(quotations.requestId, filters.requestId));
    }
    if (filters?.status) {
      query = query.where(eq(quotations.status, filters.status));
    }

    return await query.orderBy(desc(quotations.createdAt));
  }

  async getAllQuotations(
    filters: any = {}, 
    sortBy: string = 'createdAt', 
    sortOrder: 'asc' | 'desc' = 'desc', 
    page: number = 1, 
    limit: number = 50
  ): Promise<Quotation[]> {
    let query = db.select().from(quotations);
    
    // Apply filters
    const conditions = [];
    if (filters.requestId) {
      conditions.push(eq(quotations.requestId, filters.requestId));
    }
    if (filters.status) {
      conditions.push(eq(quotations.status, filters.status));
    }
    if (filters.quotationNumber) {
      conditions.push(like(quotations.quotationNumber, `%${filters.quotationNumber}%`));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = quotations[sortBy as keyof typeof quotations] || quotations.createdAt;
    query = query.orderBy(sortOrder === 'desc' ? desc(sortField) : asc(sortField));

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    return await query;
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id));
    return quotation;
  }

  async getQuotationByNumber(quotationNumber: string): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.quotationNumber, quotationNumber));
    return quotation;
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const [newQuotation] = await db.insert(quotations).values(quotation).returning();
    return newQuotation;
  }

  async updateQuotation(id: number, quotation: Partial<InsertQuotation>): Promise<Quotation | undefined> {
    const [updatedQuotation] = await db.update(quotations)
      .set(quotation)
      .where(eq(quotations.id, id))
      .returning();
    return updatedQuotation;
  }

  async deleteQuotation(id: number): Promise<boolean> {
    await db.delete(quotations).where(eq(quotations.id, id));
    return true;
  }

  async acceptQuotation(id: number): Promise<Quotation | undefined> {
    const [acceptedQuotation] = await db.update(quotations)
      .set({ status: 'accepted', acceptedDate: new Date() })
      .where(eq(quotations.id, id))
      .returning();
    return acceptedQuotation;
  }

  async rejectQuotation(id: number, reason?: string): Promise<Quotation | undefined> {
    const [rejectedQuotation] = await db.update(quotations)
      .set({ status: 'rejected', rejectedDate: new Date(), rejectionReason: reason })
      .where(eq(quotations.id, id))
      .returning();
    return rejectedQuotation;
  }

  // Active Project operations
  async getActiveProjects(filters?: { status?: string, teamLead?: number, priority?: string }): Promise<ActiveProject[]> {
    let query = db.select().from(activeProjects).where(eq(activeProjects.isActive, true));
    
    if (filters?.status) {
      query = query.where(eq(activeProjects.status, filters.status));
    }
    if (filters?.teamLead) {
      query = query.where(eq(activeProjects.teamLead, filters.teamLead));
    }
    if (filters?.priority) {
      query = query.where(eq(activeProjects.priority, filters.priority));
    }

    return await query.orderBy(desc(activeProjects.createdAt));
  }

  async getAllActiveProjects(
    filters: any = {}, 
    sortBy: string = 'createdAt', 
    sortOrder: 'asc' | 'desc' = 'desc', 
    page: number = 1, 
    limit: number = 50
  ): Promise<ActiveProject[]> {
    let query = db.select().from(activeProjects);
    
    // Apply filters
    const conditions = [eq(activeProjects.isActive, true)]; // Only active by default
    if (filters.status) {
      conditions.push(eq(activeProjects.status, filters.status));
    }
    if (filters.teamLead) {
      conditions.push(eq(activeProjects.teamLead, filters.teamLead));
    }
    if (filters.priority) {
      conditions.push(eq(activeProjects.priority, filters.priority));
    }
    if (filters.categoryId) {
      conditions.push(eq(activeProjects.categoryId, filters.categoryId));
    }
    if (filters.projectName) {
      conditions.push(like(activeProjects.projectName, `%${filters.projectName}%`));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = activeProjects[sortBy as keyof typeof activeProjects] || activeProjects.createdAt;
    query = query.orderBy(sortOrder === 'desc' ? desc(sortField) : asc(sortField));

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    return await query;
  }

  async getActiveProject(id: number): Promise<ActiveProject | undefined> {
    const [project] = await db.select().from(activeProjects).where(eq(activeProjects.id, id));
    return project;
  }

  async getActiveProjectByNumber(projectNumber: string): Promise<ActiveProject | undefined> {
    const [project] = await db.select().from(activeProjects).where(eq(activeProjects.projectNumber, projectNumber));
    return project;
  }

  async createActiveProject(project: InsertActiveProject): Promise<ActiveProject> {
    const [newProject] = await db.insert(activeProjects).values(project).returning();
    return newProject;
  }

  async updateActiveProject(id: number, project: Partial<InsertActiveProject>): Promise<ActiveProject | undefined> {
    const [updatedProject] = await db.update(activeProjects)
      .set({ ...project, lastUpdate: new Date() })
      .where(eq(activeProjects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteActiveProject(id: number): Promise<boolean> {
    await db.update(activeProjects)
      .set({ isActive: false })
      .where(eq(activeProjects.id, id));
    return true;
  }

  async updateProjectProgress(id: number, progress: number): Promise<ActiveProject | undefined> {
    const [updatedProject] = await db.update(activeProjects)
      .set({ progress, lastUpdate: new Date() })
      .where(eq(activeProjects.id, id))
      .returning();
    return updatedProject;
  }

  // Project Phase operations
  async getProjectPhases(activeProjectId: number): Promise<ProjectPhase[]> {
    return await db.select().from(projectPhases)
      .where(eq(projectPhases.activeProjectId, activeProjectId))
      .orderBy(asc(projectPhases.phaseNumber));
  }

  async getProjectPhasesByProject(activeProjectId: number): Promise<ProjectPhase[]> {
    return await db.select().from(projectPhases)
      .where(eq(projectPhases.activeProjectId, activeProjectId))
      .orderBy(asc(projectPhases.phaseNumber));
  }

  async getProjectPhase(id: number): Promise<ProjectPhase | undefined> {
    const [phase] = await db.select().from(projectPhases).where(eq(projectPhases.id, id));
    return phase;
  }

  async createProjectPhase(phase: InsertProjectPhase): Promise<ProjectPhase> {
    const [newPhase] = await db.insert(projectPhases).values(phase).returning();
    return newPhase;
  }

  async updateProjectPhase(id: number, phase: Partial<InsertProjectPhase>): Promise<ProjectPhase | undefined> {
    const [updatedPhase] = await db.update(projectPhases)
      .set(phase)
      .where(eq(projectPhases.id, id))
      .returning();
    return updatedPhase;
  }

  async deleteProjectPhase(id: number): Promise<boolean> {
    await db.delete(projectPhases).where(eq(projectPhases.id, id));
    return true;
  }

  async completeProjectPhase(id: number): Promise<ProjectPhase | undefined> {
    const [completedPhase] = await db.update(projectPhases)
      .set({ status: 'completed', actualEndDate: new Date(), progress: 100 })
      .where(eq(projectPhases.id, id))
      .returning();
    return completedPhase;
  }

  // Project Update operations
  async getProjectUpdates(activeProjectId: number, filters?: { phaseId?: number, updateType?: string }): Promise<ProjectUpdate[]> {
    let query = db.select().from(projectUpdates)
      .where(eq(projectUpdates.activeProjectId, activeProjectId));
    
    if (filters?.phaseId) {
      query = query.where(eq(projectUpdates.phaseId, filters.phaseId));
    }
    if (filters?.updateType) {
      query = query.where(eq(projectUpdates.updateType, filters.updateType));
    }

    return await query.orderBy(desc(projectUpdates.createdAt));
  }

  async getProjectUpdate(id: number): Promise<ProjectUpdate | undefined> {
    const [update] = await db.select().from(projectUpdates).where(eq(projectUpdates.id, id));
    return update;
  }

  async createProjectUpdate(update: InsertProjectUpdate): Promise<ProjectUpdate> {
    const [newUpdate] = await db.insert(projectUpdates).values(update).returning();
    return newUpdate;
  }

  async updateProjectUpdate(id: number, update: Partial<InsertProjectUpdate>): Promise<ProjectUpdate | undefined> {
    const [updatedUpdate] = await db.update(projectUpdates)
      .set(update)
      .where(eq(projectUpdates.id, id))
      .returning();
    return updatedUpdate;
  }

  async deleteProjectUpdate(id: number): Promise<boolean> {
    await db.delete(projectUpdates).where(eq(projectUpdates.id, id));
    return true;
  }

  async getProjectUpdatesByProject(
    activeProjectId: number, 
    filters: any = {}, 
    sortBy: string = 'createdAt', 
    sortOrder: 'asc' | 'desc' = 'desc', 
    page: number = 1, 
    limit: number = 50
  ): Promise<ProjectUpdate[]> {
    let query = db.select().from(projectUpdates)
      .where(eq(projectUpdates.activeProjectId, activeProjectId));
    
    // Apply filters
    if (filters.phaseId) {
      query = query.where(eq(projectUpdates.phaseId, filters.phaseId));
    }
    if (filters.updateType) {
      query = query.where(eq(projectUpdates.updateType, filters.updateType));
    }

    // Apply sorting
    const sortField = projectUpdates[sortBy as keyof typeof projectUpdates] || projectUpdates.createdAt;
    query = query.orderBy(sortOrder === 'desc' ? desc(sortField) : asc(sortField));

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    return await query;
  }

  // Payment operations
  async getPayments(activeProjectId?: number, filters?: { status?: string, paymentType?: string }): Promise<Payment[]> {
    let query = db.select().from(payments);
    
    if (activeProjectId) {
      query = query.where(eq(payments.activeProjectId, activeProjectId));
    }
    if (filters?.status) {
      query = query.where(eq(payments.status, filters.status));
    }
    if (filters?.paymentType) {
      query = query.where(eq(payments.paymentType, filters.paymentType));
    }

    return await query.orderBy(desc(payments.createdAt));
  }

  async getPaymentsByProject(projectId?: number): Promise<Payment[]> {
    if (!projectId) {
      return await db.select().from(payments).orderBy(desc(payments.createdAt));
    }
    return await db.select().from(payments)
      .where(eq(payments.activeProjectId, projectId))
      .orderBy(desc(payments.createdAt));
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentByNumber(paymentNumber: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.paymentNumber, paymentNumber));
    return payment;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db.update(payments)
      .set(payment)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  async deletePayment(id: number): Promise<boolean> {
    await db.delete(payments).where(eq(payments.id, id));
    return true;
  }

  async markPaymentAsPaid(id: number, paidDate: Date, reference?: string): Promise<Payment | undefined> {
    const [paidPayment] = await db.update(payments)
      .set({ status: 'paid', paidDate, reference, clientConfirmation: true, confirmationDate: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return paidPayment;
  }

  // Enhanced Project Document operations
  async getEnhancedProjectDocuments(filters?: { activeProjectId?: number, category?: string, isClientVisible?: boolean }): Promise<EnhancedProjectDocument[]> {
    let query = db.select().from(enhancedProjectDocuments);
    
    if (filters?.activeProjectId) {
      query = query.where(eq(enhancedProjectDocuments.activeProjectId, filters.activeProjectId));
    }
    if (filters?.category) {
      query = query.where(eq(enhancedProjectDocuments.category, filters.category));
    }
    if (filters?.isClientVisible !== undefined) {
      query = query.where(eq(enhancedProjectDocuments.isClientVisible, filters.isClientVisible));
    }

    return await query.orderBy(desc(enhancedProjectDocuments.createdAt));
  }

  async getEnhancedProjectDocument(id: number): Promise<EnhancedProjectDocument | undefined> {
    const [document] = await db.select().from(enhancedProjectDocuments).where(eq(enhancedProjectDocuments.id, id));
    return document;
  }

  async createEnhancedProjectDocument(document: InsertEnhancedProjectDocument): Promise<EnhancedProjectDocument> {
    const [newDocument] = await db.insert(enhancedProjectDocuments).values(document).returning();
    return newDocument;
  }

  async updateEnhancedProjectDocument(id: number, document: Partial<InsertEnhancedProjectDocument>): Promise<EnhancedProjectDocument | undefined> {
    const [updatedDocument] = await db.update(enhancedProjectDocuments)
      .set(document)
      .where(eq(enhancedProjectDocuments.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteEnhancedProjectDocument(id: number): Promise<boolean> {
    await db.delete(enhancedProjectDocuments).where(eq(enhancedProjectDocuments.id, id));
    return true;
  }

  // Admin Statistics operations
  async getAdminStatistics(period?: string, periodStart?: Date, periodEnd?: Date): Promise<AdminStatistic[]> {
    let query = db.select().from(adminStatistics);
    
    if (period) {
      query = query.where(eq(adminStatistics.period, period));
    }
    if (periodStart) {
      query = query.where(gte(adminStatistics.periodStart, periodStart));
    }
    if (periodEnd) {
      query = query.where(lte(adminStatistics.periodEnd, periodEnd));
    }

    return await query.orderBy(desc(adminStatistics.periodStart));
  }

  async getLatestAdminStatistics(): Promise<AdminStatistic | undefined> {
    const [latest] = await db.select().from(adminStatistics)
      .orderBy(desc(adminStatistics.createdAt))
      .limit(1);
    return latest;
  }

  async createAdminStatistics(statistics: InsertAdminStatistic): Promise<AdminStatistic> {
    const [newStatistics] = await db.insert(adminStatistics).values(statistics).returning();
    return newStatistics;
  }

  async calculateAndSaveStatistics(period: string, periodStart: Date, periodEnd: Date): Promise<AdminStatistic> {
    // This would contain complex calculation logic
    // For now, just create a basic entry
    const stats: InsertAdminStatistic = {
      period,
      periodStart,
      periodEnd,
      totalRequests: 0,
      newRequests: 0,
      quotationsSent: 0,
      quotationsAccepted: 0,
      conversionRate: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalRevenue: "0",
      lastCalculated: new Date()
    };
    
    return await this.createAdminStatistics(stats);
  }

  // Enhanced Notification operations
  async getEnhancedNotifications(userId?: number, filters?: { isRead?: boolean, type?: string, priority?: string }): Promise<EnhancedNotification[]> {
    let query = db.select().from(enhancedNotifications).where(eq(enhancedNotifications.isArchived, false));
    
    if (userId) {
      query = query.where(eq(enhancedNotifications.userId, userId));
    }
    if (filters?.isRead !== undefined) {
      query = query.where(eq(enhancedNotifications.isRead, filters.isRead));
    }
    if (filters?.type) {
      query = query.where(eq(enhancedNotifications.type, filters.type));
    }
    if (filters?.priority) {
      query = query.where(eq(enhancedNotifications.priority, filters.priority));
    }

    return await query.orderBy(desc(enhancedNotifications.createdAt));
  }

  async getEnhancedNotification(id: number): Promise<EnhancedNotification | undefined> {
    const [notification] = await db.select().from(enhancedNotifications).where(eq(enhancedNotifications.id, id));
    return notification;
  }

  async createEnhancedNotification(notification: InsertEnhancedNotification): Promise<EnhancedNotification> {
    const [newNotification] = await db.insert(enhancedNotifications).values(notification).returning();
    return newNotification;
  }

  async updateEnhancedNotification(id: number, notification: Partial<InsertEnhancedNotification>): Promise<EnhancedNotification | undefined> {
    const [updatedNotification] = await db.update(enhancedNotifications)
      .set(notification)
      .where(eq(enhancedNotifications.id, id))
      .returning();
    return updatedNotification;
  }

  async deleteEnhancedNotification(id: number): Promise<boolean> {
    await db.delete(enhancedNotifications).where(eq(enhancedNotifications.id, id));
    return true;
  }

  async markNotificationAsRead(id: number, userId: number): Promise<EnhancedNotification | undefined> {
    const [readNotification] = await db.update(enhancedNotifications)
      .set({ isRead: true, readAt: new Date(), acknowledgedBy: userId, acknowledgedAt: new Date() })
      .where(eq(enhancedNotifications.id, id))
      .returning();
    return readNotification;
  }

  async sendBulkNotifications(notifications: InsertEnhancedNotification[]): Promise<EnhancedNotification[]> {
    const createdNotifications = await db.insert(enhancedNotifications).values(notifications).returning();
    return createdNotifications;
  }

  // System Settings operations
  async getSystemSettings(category?: string): Promise<SystemSetting[]> {
    let query = db.select().from(systemSettings);
    
    if (category) {
      query = query.where(eq(systemSettings.category, category));
    }

    return await query.orderBy(asc(systemSettings.category), asc(systemSettings.settingKey));
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, key));
    return setting;
  }

  async createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const [newSetting] = await db.insert(systemSettings).values(setting).returning();
    return newSetting;
  }

  async updateSystemSetting(key: string, value: string, modifiedBy: number): Promise<SystemSetting | undefined> {
    const [updatedSetting] = await db.update(systemSettings)
      .set({ value, lastModified: new Date(), modifiedBy, version: sql`${systemSettings.version} + 1` })
      .where(eq(systemSettings.settingKey, key))
      .returning();
    return updatedSetting;
  }

  async deleteSystemSetting(key: string): Promise<boolean> {
    await db.delete(systemSettings).where(eq(systemSettings.settingKey, key));
    return true;
  }

  async getSettingValue(key: string, defaultValue?: string): Promise<string | undefined> {
    const setting = await this.getSystemSetting(key);
    return setting?.value || defaultValue;
  }
}

export const storage = new DatabaseStorage();

// Export database instance and table schemas for direct queries
export { db };
export { 
  users, 
  projects, 
  tasks, 
  resources, 
  taskResources, 
  materials, 
  materialPriceHistory, 
  realEstateMarket, 
  estimationPresets, 
  projectEstimations, 
  activityLogs, 
  aiAnalysis, 
  notifications, 
  chatMessages,
  companies,
  suppliers,
  contractors,
  projectDocuments,
  financialTransactions,
  budgetCategories,
  projectBudgets,
  equipment,
  equipmentAssignments,
  inventory,
  purchaseOrders,
  purchaseOrderItems,
  qualityInspections,
  safetyIncidents,
  weatherConditions,
  projectMilestones,
  timeTracking,
  clientCommunications,
  // Extended tables
  projectCategories,
  clientRequests,
  quotations,
  activeProjects,
  projectPhases,
  projectUpdates,
  payments,
  enhancedProjectDocuments,
  adminStatistics,
  enhancedNotifications,
  systemSettings
};

// Export drizzle-orm operators
export { eq, and, or, ne, like, gte, lte, desc, asc };

// Export additional operators
export { count, sql } from "drizzle-orm";
