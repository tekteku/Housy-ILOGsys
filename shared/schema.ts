import { pgTable, text, serial, integer, doublePrecision, boolean, timestamp, jsonb, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  clientName: text("client_name"),
  location: text("location"),
  budget: doublePrecision("budget").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("active"),
  progress: doublePrecision("progress").notNull().default(0),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("pending"),
  progress: doublePrecision("progress").notNull().default(0),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Resources (Human and Material) table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // human, material, equipment
  availability: text("availability").notNull(), // available, occupied, unavailable
  occupancyRate: doublePrecision("occupancy_rate").default(0),
  details: jsonb("details"), // For storing role, skills, specifications, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Task-Resource assignments
export const taskResources = pgTable("task_resources", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  resourceId: integer("resource_id").notNull().references(() => resources.id),
  allocationPercentage: doublePrecision("allocation_percentage").notNull().default(100),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Construction materials table
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // gros_oeuvre, second_oeuvre, finition
  unit: text("unit").notNull(), // kg, m2, m3, piece, etc.
  price: doublePrecision("price").notNull(),
  priceCurrency: text("price_currency").notNull().default("TND"),
  supplier: text("supplier"),
  brand: text("brand"),
  description: text("description"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Material price history for tracking trends
export const materialPriceHistory = pgTable("material_price_history", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").notNull().references(() => materials.id),
  price: doublePrecision("price").notNull(),
  priceCurrency: text("price_currency").notNull().default("TND"),
  effectiveDate: timestamp("effective_date").notNull(),
  supplier: text("supplier"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Real estate market data
export const realEstateMarket = pgTable("real_estate_market", {
  id: serial("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  priceCurrency: text("price_currency").notNull().default("TND"),
  area: doublePrecision("area"),
  rooms: text("rooms"),
  propertyType: text("property_type").notNull(),
  city: text("city").notNull(),
  governorate: text("governorate").notNull(),
  address: text("address"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  source: text("source"),
  url: text("url"),
  scrapedAt: timestamp("scraped_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Material estimation presets
export const estimationPresets = pgTable("estimation_presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  projectType: text("project_type").notNull(), // apartment, villa, commercial, etc.
  qualityLevel: text("quality_level").notNull(), // standard, premium, luxe
  wastageIncluded: boolean("wastage_included").notNull().default(true),
  materialRatios: jsonb("material_ratios").notNull(), // JSON with material requirements per sqm
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project estimation records
export const projectEstimations = pgTable("project_estimations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  name: text("name").notNull(),
  area: doublePrecision("area").notNull(),
  floors: integer("floors").notNull().default(1),
  projectType: text("project_type").notNull(),
  qualityLevel: text("quality_level").notNull(),
  wastageIncluded: boolean("wastage_included").notNull().default(true),
  totalCost: doublePrecision("total_cost").notNull(),
  costBreakdown: jsonb("cost_breakdown").notNull(),
  materialsList: jsonb("materials_list").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  actionType: text("action_type").notNull(),
  entityType: text("entity_type").notNull(), // project, task, resource, etc.
  entityId: integer("entity_id"),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// AI analysis results
export const aiAnalysis = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  analysisType: text("analysis_type").notNull(), // market_trend, cost_estimation, etc.
  inputData: jsonb("input_data"),
  result: jsonb("result").notNull(),
  provider: text("provider").notNull(), // ollama, openai, claude, deepseek
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notification settings
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // task_reminder, deadline_approaching, etc.
  read: boolean("read").notNull().default(false),
  entityType: text("entity_type"), // project, task, resource, etc.
  entityId: integer("entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat messages for AI chatbot
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sessionId: text("session_id").notNull(),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaskResourceSchema = createInsertSchema(taskResources).omit({ id: true, createdAt: true });
export const insertMaterialSchema = createInsertSchema(materials).omit({ id: true, createdAt: true, lastUpdated: true });
export const insertMaterialPriceHistorySchema = createInsertSchema(materialPriceHistory).omit({ id: true, createdAt: true });
export const insertRealEstateMarketSchema = createInsertSchema(realEstateMarket).omit({ id: true, createdAt: true });
export const insertEstimationPresetSchema = createInsertSchema(estimationPresets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectEstimationSchema = createInsertSchema(projectEstimations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true });
export const insertAiAnalysisSchema = createInsertSchema(aiAnalysis).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true });

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type InsertTaskResource = z.infer<typeof insertTaskResourceSchema>;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type InsertMaterialPriceHistory = z.infer<typeof insertMaterialPriceHistorySchema>;
export type InsertRealEstateMarket = z.infer<typeof insertRealEstateMarketSchema>;
export type InsertEstimationPreset = z.infer<typeof insertEstimationPresetSchema>;
export type InsertProjectEstimation = z.infer<typeof insertProjectEstimationSchema>;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type TaskResource = typeof taskResources.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type MaterialPriceHistory = typeof materialPriceHistory.$inferSelect;
export type RealEstateMarket = typeof realEstateMarket.$inferSelect;
export type EstimationPreset = typeof estimationPresets.$inferSelect;
export type ProjectEstimation = typeof projectEstimations.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type AiAnalysis = typeof aiAnalysis.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
