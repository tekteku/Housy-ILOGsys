import { pgTable, text, serial, integer, doublePrecision, boolean, timestamp, jsonb, foreignKey, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, projects, tasks, materials } from "./schema";

// Enhanced schema with additional tables for comprehensive construction and real estate management

// Companies/Organizations table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  companyType: text("company_type").notNull(), // contractor, supplier, client, subcontractor
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  governorate: text("governorate"),
  taxId: text("tax_id"),
  registrationNumber: text("registration_number"),
  rating: doublePrecision("rating").default(0),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Suppliers table (specialized for material suppliers)
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  name: text("name").notNull(),
  specialization: text("specialization"), // cement, steel, wood, electrical, etc.
  deliveryZones: jsonb("delivery_zones"), // Areas they deliver to
  paymentTerms: text("payment_terms"),
  creditLimit: doublePrecision("credit_limit"),
  deliveryTime: integer("delivery_time"), // Average delivery time in days
  qualityRating: doublePrecision("quality_rating").default(0),
  priceRating: doublePrecision("price_rating").default(0),
  serviceRating: doublePrecision("service_rating").default(0),
  isPreferred: boolean("is_preferred").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contractors table (specialized for construction contractors)
export const contractors = pgTable("contractors", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  name: text("name").notNull(),
  specialty: text("specialty"), // general, electrical, plumbing, masonry, etc.
  licenseNumber: text("license_number"),
  licenseExpiry: timestamp("license_expiry"),
  experience: integer("experience"), // Years of experience
  teamSize: integer("team_size"),
  equipment: jsonb("equipment"), // Available equipment
  workingRadius: doublePrecision("working_radius"), // km radius
  hourlyRate: doublePrecision("hourly_rate"),
  projectRate: doublePrecision("project_rate"),
  qualityRating: doublePrecision("quality_rating").default(0),
  timelinessRating: doublePrecision("timeliness_rating").default(0),
  professionalismRating: doublePrecision("professionalism_rating").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project documents table
export const projectDocuments = pgTable("project_documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  documentType: text("document_type").notNull(), // contract, permit, drawing, specification, etc.
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: text("mime_type"),
  version: text("version").default("1.0"),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  tags: jsonb("tags"), // For categorization and search
  isPublic: boolean("is_public").default(false),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Financial transactions table
export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  transactionId: text("transaction_id").notNull().unique(),
  transactionType: text("transaction_type").notNull(), // payment, expense, refund, advance
  category: text("category").notNull(), // materials, labor, equipment, overhead, etc.
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("TND"),
  paymentMethod: text("payment_method"), // cash, bank_transfer, check, card
  payee: text("payee"), // Who received the payment
  payer: text("payer"), // Who made the payment
  invoiceNumber: text("invoice_number"),
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  attachments: jsonb("attachments"), // Receipt, invoice files
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Budget categories table
export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"),
  color: text("color").default("#3b82f6"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  parentReference: foreignKey({
    columns: [table.parentId],
    foreignColumns: [table.id],
  }),
}));

// Project budgets table
export const projectBudgets = pgTable("project_budgets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  categoryId: integer("category_id").notNull().references(() => budgetCategories.id),
  budgetedAmount: decimal("budgeted_amount", { precision: 12, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 12, scale: 2 }).default("0"),
  variance: decimal("variance", { precision: 12, scale: 2 }).default("0"),
  currency: text("currency").notNull().default("TND"),
  notes: text("notes"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Equipment table
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  equipmentType: text("equipment_type").notNull(), // excavator, crane, mixer, etc.
  brand: text("brand"),
  model: text("model"),
  serialNumber: text("serial_number"),
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  dailyRate: decimal("daily_rate", { precision: 8, scale: 2 }),
  status: text("status").notNull().default("available"), // available, in_use, maintenance, retired
  location: text("location"),
  owner: text("owner"), // company, rental, leased
  maintenanceSchedule: jsonb("maintenance_schedule"),
  operatingHours: doublePrecision("operating_hours").default(0),
  fuelType: text("fuel_type"),
  capacity: text("capacity"),
  specifications: jsonb("specifications"),
  attachments: jsonb("attachments"), // Photos, manuals, certificates
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Equipment assignments table
export const equipmentAssignments = pgTable("equipment_assignments", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipment.id),
  projectId: integer("project_id").references(() => projects.id),
  taskId: integer("task_id").references(() => tasks.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  hoursUsed: doublePrecision("hours_used").default(0),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("scheduled"), // scheduled, active, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Inventory table for material tracking
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").notNull().references(() => materials.id),
  projectId: integer("project_id").references(() => projects.id),
  location: text("location"), // warehouse, site, etc.
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  minStockLevel: doublePrecision("min_stock_level").default(0),
  maxStockLevel: doublePrecision("max_stock_level"),
  unitCost: decimal("unit_cost", { precision: 10, scale: 4 }),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  batchNumber: text("batch_number"),
  expiryDate: timestamp("expiry_date"),
  lastRestocked: timestamp("last_restocked"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Purchase orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  projectId: integer("project_id").references(() => projects.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  orderDate: timestamp("order_date").notNull(),
  expectedDelivery: timestamp("expected_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  status: text("status").notNull().default("pending"), // pending, approved, ordered, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("TND"),
  paymentTerms: text("payment_terms"),
  deliveryAddress: text("delivery_address"),
  contactPerson: text("contact_person"),
  notes: text("notes"),
  approvedBy: integer("approved_by").references(() => users.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Purchase order items table
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").notNull().references(() => purchaseOrders.id),
  materialId: integer("material_id").notNull().references(() => materials.id),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 4 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  deliveredQuantity: doublePrecision("delivered_quantity").default(0),
  specifications: text("specifications"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quality inspections table
export const qualityInspections = pgTable("quality_inspections", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  taskId: integer("task_id").references(() => tasks.id),
  inspectionType: text("inspection_type").notNull(), // material, workmanship, safety, compliance
  inspectionDate: timestamp("inspection_date").notNull(),
  inspector: integer("inspector").notNull().references(() => users.id),
  status: text("status").notNull(), // passed, failed, conditional, pending
  score: doublePrecision("score"), // Quality score (0-100)
  checklist: jsonb("checklist"), // Inspection checklist items
  findings: text("findings"),
  recommendations: text("recommendations"),
  actionRequired: text("action_required"),
  priority: text("priority").default("medium"), // low, medium, high, critical
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  photos: jsonb("photos"), // Inspection photos
  documents: jsonb("documents"), // Related documents
  followUpRequired: boolean("follow_up_required").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Safety incidents table
export const safetyIncidents = pgTable("safety_incidents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  incidentDate: timestamp("incident_date").notNull(),
  incidentType: text("incident_type").notNull(), // injury, near_miss, property_damage, environmental
  severity: text("severity").notNull(), // minor, moderate, major, fatal
  location: text("location").notNull(),
  description: text("description").notNull(),
  involvedPersons: jsonb("involved_persons"), // People involved
  witnesses: jsonb("witnesses"),
  rootCause: text("root_cause"),
  correctiveActions: text("corrective_actions"),
  preventiveActions: text("preventive_actions"),
  status: text("status").notNull().default("open"), // open, investigating, resolved, closed
  reportedBy: integer("reported_by").notNull().references(() => users.id),
  investigatedBy: integer("investigated_by").references(() => users.id),
  workLostDays: integer("work_lost_days").default(0),
  medicalTreatment: boolean("medical_treatment").default(false),
  photos: jsonb("photos"),
  documents: jsonb("documents"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Weather conditions table (for tracking weather impact on construction)
export const weatherConditions = pgTable("weather_conditions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  recordDate: timestamp("record_date").notNull(),
  temperature: doublePrecision("temperature"), // Celsius
  humidity: doublePrecision("humidity"), // Percentage
  windSpeed: doublePrecision("wind_speed"), // km/h
  precipitation: doublePrecision("precipitation"), // mm
  visibility: doublePrecision("visibility"), // km
  conditions: text("conditions"), // sunny, cloudy, rainy, windy, etc.
  workability: text("workability").default("good"), // good, fair, poor, impossible
  impact: text("impact"), // Description of impact on work
  delaysMinutes: integer("delays_minutes").default(0),
  source: text("source").default("manual"), // manual, api, sensor
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Project milestones table
export const projectMilestones = pgTable("project_milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  plannedDate: timestamp("planned_date").notNull(),
  actualDate: timestamp("actual_date"),
  status: text("status").notNull().default("pending"), // pending, completed, delayed, cancelled
  importance: text("importance").default("medium"), // low, medium, high, critical
  deliverables: jsonb("deliverables"), // List of deliverables
  dependencies: jsonb("dependencies"), // Dependent tasks/milestones
  approvalRequired: boolean("approval_required").default(false),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Time tracking table
export const timeTracking = pgTable("time_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  taskId: integer("task_id").references(() => tasks.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // Duration in minutes
  workType: text("work_type"), // planning, execution, inspection, documentation, etc.
  description: text("description"),
  location: text("location"),
  isApproved: boolean("is_approved").default(false),
  approvedBy: integer("approved_by").references(() => users.id),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client communications table
export const clientCommunications = pgTable("client_communications", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  communicationType: text("communication_type").notNull(), // email, call, meeting, site_visit
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  communicationDate: timestamp("communication_date").notNull(),
  clientContact: text("client_contact"),
  ourContact: integer("our_contact").references(() => users.id),
  status: text("status").default("completed"), // completed, follow_up_required, cancelled
  priority: text("priority").default("medium"), // low, medium, high, urgent
  actionItems: jsonb("action_items"),
  followUpDate: timestamp("follow_up_date"),
  attachments: jsonb("attachments"),
  tags: jsonb("tags"),
  isInternal: boolean("is_internal").default(false),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create insert schemas for all new tables
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContractorSchema = createInsertSchema(contractors).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectDocumentSchema = createInsertSchema(projectDocuments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetCategorySchema = createInsertSchema(budgetCategories).omit({ id: true, createdAt: true });
export const insertProjectBudgetSchema = createInsertSchema(projectBudgets).omit({ id: true, createdAt: true, lastUpdated: true });
export const insertEquipmentSchema = createInsertSchema(equipment).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEquipmentAssignmentSchema = createInsertSchema(equipmentAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true, createdAt: true });
export const insertQualityInspectionSchema = createInsertSchema(qualityInspections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSafetyIncidentSchema = createInsertSchema(safetyIncidents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWeatherConditionSchema = createInsertSchema(weatherConditions).omit({ id: true, createdAt: true });
export const insertProjectMilestoneSchema = createInsertSchema(projectMilestones).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTimeTrackingSchema = createInsertSchema(timeTracking).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClientCommunicationSchema = createInsertSchema(clientCommunications).omit({ id: true, createdAt: true, updatedAt: true });

// Export types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type ProjectDocument = typeof projectDocuments.$inferSelect;
export type InsertProjectDocument = z.infer<typeof insertProjectDocumentSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type ProjectBudget = typeof projectBudgets.$inferSelect;
export type InsertProjectBudget = z.infer<typeof insertProjectBudgetSchema>;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type EquipmentAssignment = typeof equipmentAssignments.$inferSelect;
export type InsertEquipmentAssignment = z.infer<typeof insertEquipmentAssignmentSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type QualityInspection = typeof qualityInspections.$inferSelect;
export type InsertQualityInspection = z.infer<typeof insertQualityInspectionSchema>;
export type SafetyIncident = typeof safetyIncidents.$inferSelect;
export type InsertSafetyIncident = z.infer<typeof insertSafetyIncidentSchema>;
export type WeatherCondition = typeof weatherConditions.$inferSelect;
export type InsertWeatherCondition = z.infer<typeof insertWeatherConditionSchema>;
export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;
export type TimeTracking = typeof timeTracking.$inferSelect;
export type InsertTimeTracking = z.infer<typeof insertTimeTrackingSchema>;
export type ClientCommunication = typeof clientCommunications.$inferSelect;
export type InsertClientCommunication = z.infer<typeof insertClientCommunicationSchema>;
