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
  type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, lte, desc, asc } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
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
    return true; // If no error is thrown, assume success
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
    const [updatedResource] = await db
      .update(resources)
      .set({ ...resource, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }

  async deleteResource(id: number): Promise<boolean> {
    await db.delete(resources).where(eq(resources.id, id));
    return true;
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
    const [updatedMaterial] = await db
      .update(materials)
      .set({ ...material, lastUpdated: new Date() })
      .where(eq(materials.id, id))
      .returning();
    return updatedMaterial;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    await db.delete(materials).where(eq(materials.id, id));
    return true;
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
    let query = db.select().from(realEstateMarket);
    
    if (filters) {
      if (filters.city) {
        query = query.where(like(realEstateMarket.city, `%${filters.city}%`));
      }
      if (filters.propertyType) {
        query = query.where(eq(realEstateMarket.propertyType, filters.propertyType));
      }
      if (filters.minPrice) {
        query = query.where(gte(realEstateMarket.price, filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.where(lte(realEstateMarket.price, filters.maxPrice));
      }
      if (filters.minArea) {
        query = query.where(gte(realEstateMarket.area, filters.minArea));
      }
      if (filters.maxArea) {
        query = query.where(lte(realEstateMarket.area, filters.maxArea));
      }
    }
    
    const listings = await query.orderBy(desc(realEstateMarket.scrapedAt));
    return listings;
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
}

// Use Database Storage
export const storage = new DatabaseStorage();
