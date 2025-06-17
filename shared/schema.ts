import { pgTable, text, serial, integer, doublePrecision, boolean, timestamp, jsonb, foreignKey, decimal, uuid } from "drizzle-orm/pg-core";
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

// Enhanced tables for comprehensive construction and real estate management

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

// ========================================================================================
// EXTENDED SCHEMA FOR ADVANCED PROJECT MANAGEMENT - GESTION AVANCÉE DE PROJETS
// ========================================================================================

// Project categories table
export const projectCategories = pgTable("project_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(),
  unit: text("unit").notNull().default("m²"), // m², m lineaire, forfait
  complexity: text("complexity").notNull().default("medium"), // low, medium, high
  duration: integer("duration").notNull(), // estimated duration in days
  materials: jsonb("materials"), // material breakdown percentages
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  projectType: text("project_type").default("construction_neuve"), // construction_neuve, renovation, extension, achat_cle_en_main, amenagement, transformation, rehabilitation_energetique
  tunisianSpecifics: jsonb("tunisian_specifics"), // climate considerations, local regulations, traditional materials
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client requests table - Demandes clients avec workflow complet
export const clientRequests = pgTable("client_requests", {
  id: serial("id").primaryKey(),
  requestNumber: text("request_number").notNull().unique(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  clientAddress: text("client_address"),
  categoryId: integer("category_id").notNull().references(() => projectCategories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  area: doublePrecision("area").notNull(),
  floors: integer("floors").default(1),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  desiredStartDate: timestamp("desired_start_date"),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("received"), // received, reviewing, quoted, accepted, rejected, expired
  urgency: text("urgency").default("normal"), // normal, urgent, emergency
  qualityLevel: text("quality_level").default("standard"), // standard, premium, luxe
  specialRequirements: text("special_requirements"),
  attachments: jsonb("attachments"), // photos, plans, documents
  source: text("source").default("website"), // website, phone, referral, social_media
  assignedTo: integer("assigned_to").references(() => users.id),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewDate: timestamp("review_date"),
  reviewNotes: text("review_notes"),
  estimatedCost: decimal("estimated_cost", { precision: 12, scale: 2 }),
  estimatedDuration: integer("estimated_duration").default(0), // in days
  followUpDate: timestamp("follow_up_date"),
  expiryDate: timestamp("expiry_date"),
  conversionRate: doublePrecision("conversion_rate").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Quotations table - Système de devis avec révisions
export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  quotationNumber: text("quotation_number").notNull().unique(),
  requestId: integer("request_id").notNull().references(() => clientRequests.id),
  version: integer("version").notNull().default(1),
  title: text("title").notNull(),
  description: text("description"),
  area: doublePrecision("area").notNull(),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(),
  laborCost: decimal("labor_cost", { precision: 12, scale: 2 }).notNull(),
  materialCost: decimal("material_cost", { precision: 12, scale: 2 }).notNull(),
  equipmentCost: decimal("equipment_cost", { precision: 12, scale: 2 }).default("0"),
  overheadCost: decimal("overhead_cost", { precision: 12, scale: 2 }).default("0"),
  profitMargin: doublePrecision("profit_margin").default(15), // percentage
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  finalAmount: decimal("final_amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("TND"),
  validUntil: timestamp("valid_until").notNull(),
  paymentTerms: text("payment_terms"),
  deliveryTime: integer("delivery_time").notNull(), // in days
  warrantyPeriod: integer("warranty_period").default(12), // in months
  specialConditions: text("special_conditions"),
  breakdown: jsonb("breakdown").notNull(), // detailed cost breakdown
  materials: jsonb("materials").notNull(), // materials list with quantities and prices
  phases: jsonb("phases"), // project phases with timeline
  status: text("status").notNull().default("draft"), // draft, sent, viewed, accepted, rejected, expired, revised
  sentDate: timestamp("sent_date"),
  viewedDate: timestamp("viewed_date"),
  acceptedDate: timestamp("accepted_date"),
  rejectedDate: timestamp("rejected_date"),
  rejectionReason: text("rejection_reason"),
  clientFeedback: text("client_feedback"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").notNull().references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Active projects table - Projets actifs après acceptation
export const activeProjects = pgTable("active_projects", {
  id: serial("id").primaryKey(),
  projectNumber: text("project_number").notNull().unique(),
  quotationId: integer("quotation_id").notNull().references(() => quotations.id),
  originalProjectId: integer("original_project_id").references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  location: text("location").notNull(),
  area: doublePrecision("area").notNull(),
  contractValue: decimal("contract_value", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0"),
  remainingAmount: decimal("remaining_amount", { precision: 12, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  plannedEndDate: timestamp("planned_end_date").notNull(),
  actualEndDate: timestamp("actual_end_date"),
  status: text("status").notNull().default("planning"), // planning, in_progress, on_hold, completed, cancelled
  progress: doublePrecision("progress").notNull().default(0),
  currentPhase: text("current_phase"),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  riskLevel: text("risk_level").default("low"), // low, medium, high, critical
  qualityScore: doublePrecision("quality_score").default(0),
  clientSatisfaction: doublePrecision("client_satisfaction").default(0),
  teamLead: integer("team_lead").notNull().references(() => users.id),
  projectManager: integer("project_manager").notNull().references(() => users.id),
  teamMembers: jsonb("team_members"), // array of user IDs
  budget: jsonb("budget"), // detailed budget breakdown
  timeline: jsonb("timeline"), // project timeline with milestones
  risks: jsonb("risks"), // identified risks and mitigation plans
  resources: jsonb("resources"), // allocated resources
  documents: jsonb("documents"), // project documents
  lastUpdate: timestamp("last_update").defaultNow(),
  nextMilestone: timestamp("next_milestone"),
  contractSignedDate: timestamp("contract_signed_date"),
  warrantyEndDate: timestamp("warranty_end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project phases table - Phases de construction
export const projectPhases = pgTable("project_phases", {
  id: serial("id").primaryKey(),
  activeProjectId: integer("active_project_id").notNull().references(() => activeProjects.id),
  phaseNumber: integer("phase_number").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  plannedStartDate: timestamp("planned_start_date").notNull(),
  plannedEndDate: timestamp("planned_end_date").notNull(),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed, delayed, cancelled
  progress: doublePrecision("progress").notNull().default(0),
  budget: decimal("budget", { precision: 12, scale: 2 }).notNull(),
  actualCost: decimal("actual_cost", { precision: 12, scale: 2 }).default("0"),
  materials: jsonb("materials"), // required materials for this phase
  laborRequired: jsonb("labor_required"), // labor requirements
  equipment: jsonb("equipment"), // required equipment
  deliverables: jsonb("deliverables"), // phase deliverables
  dependencies: jsonb("dependencies"), // dependencies on other phases
  qualityChecks: jsonb("quality_checks"), // quality control checkpoints
  risks: jsonb("risks"), // phase-specific risks
  notes: text("notes"),
  completionCertificate: text("completion_certificate"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project updates table - Suivi des mises à jour
export const projectUpdates = pgTable("project_updates", {
  id: serial("id").primaryKey(),
  activeProjectId: integer("active_project_id").notNull().references(() => activeProjects.id),
  phaseId: integer("phase_id").references(() => projectPhases.id),
  updateType: text("update_type").notNull(), // progress, issue, milestone, quality, safety, budget, schedule
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"), // active, resolved, closed
  priority: text("priority").default("medium"), // low, medium, high, critical
  progress: doublePrecision("progress"),
  budgetImpact: decimal("budget_impact", { precision: 10, scale: 2 }).default("0"),
  scheduleImpact: integer("schedule_impact").default(0), // days
  qualityScore: doublePrecision("quality_score"),
  photos: jsonb("photos"), // update photos
  documents: jsonb("documents"), // related documents
  location: text("location"), // specific location within project
  weather: text("weather"), // weather conditions if relevant
  team: jsonb("team"), // team members involved
  materials: jsonb("materials"), // materials used/consumed
  equipment: jsonb("equipment"), // equipment used
  issues: jsonb("issues"), // identified issues
  resolutions: jsonb("resolutions"), // resolutions applied
  nextSteps: text("next_steps"),
  isClientVisible: boolean("is_client_visible").default(false),
  isPublic: boolean("is_public").default(false),
  tags: jsonb("tags"),
  parentUpdateId: integer("parent_update_id"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewDate: timestamp("review_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.parentUpdateId],
    foreignColumns: [table.id],
  }),
]);

// Payments table - Gestion des paiements
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  paymentNumber: text("payment_number").notNull().unique(),
  activeProjectId: integer("active_project_id").notNull().references(() => activeProjects.id),
  phaseId: integer("phase_id").references(() => projectPhases.id),
  paymentType: text("payment_type").notNull(), // advance, progress, milestone, final, retention
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("TND"),
  percentage: doublePrecision("percentage"), // percentage of total contract
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, cancelled, disputed
  paymentMethod: text("payment_method"), // cash, bank_transfer, check, card
  reference: text("reference"), // bank reference, check number, etc.
  invoiceNumber: text("invoice_number"),
  invoiceDate: timestamp("invoice_date"),
  invoicePath: text("invoice_path"), // path to invoice file
  receiptPath: text("receipt_path"), // path to receipt file
  bankAccount: text("bank_account"),
  transactionId: text("transaction_id"),
  fees: decimal("fees", { precision: 8, scale: 2 }).default("0"),
  taxes: decimal("taxes", { precision: 8, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(),
  clientConfirmation: boolean("client_confirmation").default(false),
  confirmationDate: timestamp("confirmation_date"),
  notes: text("notes"),
  attachments: jsonb("attachments"),
  overdueReason: text("overdue_reason"),
  followUpDate: timestamp("follow_up_date"),
  reminderSent: boolean("reminder_sent").default(false),
  reminderDate: timestamp("reminder_date"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced project documents table
export const enhancedProjectDocuments = pgTable("enhanced_project_documents", {
  id: serial("id").primaryKey(),
  activeProjectId: integer("active_project_id").references(() => activeProjects.id),
  quotationId: integer("quotation_id").references(() => quotations.id),
  phaseId: integer("phase_id").references(() => projectPhases.id),
  updateId: integer("update_id").references(() => projectUpdates.id),
  category: text("category").notNull(), // contract, permit, drawing, photo, invoice, report, specification
  subCategory: text("sub_category"), // detailed categorization
  name: text("name").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: text("mime_type"),
  version: text("version").default("1.0"),
  isLatest: boolean("is_latest").default(true),
  previousVersionId: integer("previous_version_id"),
  tags: jsonb("tags"),
  metadata: jsonb("metadata"), // file metadata
  thumbnail: text("thumbnail"), // thumbnail path for images
  isPublic: boolean("is_public").default(false),
  isClientVisible: boolean("is_client_visible").default(false),
  downloadCount: integer("download_count").default(0),
  lastAccessed: timestamp("last_accessed"),
  expiryDate: timestamp("expiry_date"),
  password: text("password"), // for protected documents
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.previousVersionId],
    foreignColumns: [table.id],
  }),
]);

// Admin statistics table - KPIs et statistiques
export const adminStatistics = pgTable("admin_statistics", {
  id: serial("id").primaryKey(),
  period: text("period").notNull(), // daily, weekly, monthly, quarterly, yearly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalRequests: integer("total_requests").default(0),
  newRequests: integer("new_requests").default(0),
  quotationsSent: integer("quotations_sent").default(0),
  quotationsAccepted: integer("quotations_accepted").default(0),
  quotationsRejected: integer("quotations_rejected").default(0),
  conversionRate: doublePrecision("conversion_rate").default(0),
  activeProjects: integer("active_projects").default(0),
  completedProjects: integer("completed_projects").default(0),
  delayedProjects: integer("delayed_projects").default(0),
  cancelledProjects: integer("cancelled_projects").default(0),
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default("0"),
  pendingPayments: decimal("pending_payments", { precision: 12, scale: 2 }).default("0"),
  overduePayments: decimal("overdue_payments", { precision: 12, scale: 2 }).default("0"),
  averageProjectValue: decimal("average_project_value", { precision: 12, scale: 2 }).default("0"),
  averageProjectDuration: doublePrecision("average_project_duration").default(0), // in days
  clientSatisfactionAvg: doublePrecision("client_satisfaction_avg").default(0),
  qualityScoreAvg: doublePrecision("quality_score_avg").default(0),
  onTimeCompletionRate: doublePrecision("on_time_completion_rate").default(0),
  budgetAccuracyRate: doublePrecision("budget_accuracy_rate").default(0),
  teamUtilizationRate: doublePrecision("team_utilization_rate").default(0),
  materialCostTrend: jsonb("material_cost_trend"),
  projectTypesBreakdown: jsonb("project_types_breakdown"),
  locationDistribution: jsonb("location_distribution"),
  seasonalTrends: jsonb("seasonal_trends"),
  clientRetentionRate: doublePrecision("client_retention_rate").default(0),
  referralRate: doublePrecision("referral_rate").default(0),
  marketingROI: doublePrecision("marketing_roi").default(0),
  operationalEfficiency: doublePrecision("operational_efficiency").default(0),
  profitMarginAvg: doublePrecision("profit_margin_avg").default(0),
  riskFactors: jsonb("risk_factors"),
  recommendations: jsonb("recommendations"),
  kpis: jsonb("kpis"), // additional custom KPIs
  lastCalculated: timestamp("last_calculated").defaultNow(),
  calculatedBy: integer("calculated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Enhanced notifications table
export const enhancedNotifications = pgTable("enhanced_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  userRole: text("user_role"), // admin, manager, client, team_member
  type: text("type").notNull(), // system, project, payment, deadline, alert, reminder, approval
  category: text("category").notNull(), // urgent, important, info, warning, error
  title: text("title").notNull(),
  message: text("message").notNull(),
  shortMessage: text("short_message"), // for mobile/brief notifications
  actionRequired: boolean("action_required").default(false),
  actionUrl: text("action_url"), // URL for action button
  actionLabel: text("action_label"), // label for action button
  entityType: text("entity_type"), // project, quotation, payment, request, etc.
  entityId: integer("entity_id"),
  entityName: text("entity_name"), // name of the related entity
  priority: text("priority").default("medium"), // low, medium, high, critical
  isRead: boolean("is_read").default(false),
  isArchived: boolean("is_archived").default(false),
  readAt: timestamp("read_at"),
  scheduledFor: timestamp("scheduled_for"), // for scheduled notifications
  expiresAt: timestamp("expires_at"), // when notification becomes irrelevant
  deliveryMethod: jsonb("delivery_method"), // email, sms, push, in_app
  deliveryStatus: jsonb("delivery_status"), // delivery status for each method
  metadata: jsonb("metadata"), // additional data
  tags: jsonb("tags"),
  parentNotificationId: integer("parent_notification_id"),
  batchId: text("batch_id"), // for grouping related notifications
  triggeredBy: integer("triggered_by").references(() => users.id),
  acknowledgedBy: integer("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.parentNotificationId],
    foreignColumns: [table.id],
  }),
]);

// System settings table - Configuration système
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // general, financial, notifications, security, integrations
  settingKey: text("setting_key").notNull().unique(),
  settingName: text("setting_name").notNull(),
  description: text("description"),
  dataType: text("data_type").notNull(), // string, number, boolean, json, encrypted
  value: text("value"),
  defaultValue: text("default_value"),
  options: jsonb("options"), // for select/enum type settings
  validation: jsonb("validation"), // validation rules
  isRequired: boolean("is_required").default(false),
  isSecret: boolean("is_secret").default(false), // for sensitive data
  isUserEditable: boolean("is_user_editable").default(true),
  requiresRestart: boolean("requires_restart").default(false),
  lastModified: timestamp("last_modified").defaultNow(),
  modifiedBy: integer("modified_by").references(() => users.id),
  version: integer("version").default(1),
  environment: text("environment").default("production"), // development, staging, production
  tags: jsonb("tags"),
  dependencies: jsonb("dependencies"), // settings that depend on this one
  impacts: jsonb("impacts"), // what this setting affects
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced AI analysis with detailed model tracking (DEVELOPMENT ONLY)
export const aiModelTracking = pgTable("ai_model_tracking", {
  id: serial("id").primaryKey(),
  responsibleEstimation: text("responsible_estimation"), // Nom du modèle responsable estimation  
  responsibleGeneration: text("responsible_generation"), // Nom du modèle responsable génération
  modelUsed: text("model_used").notNull(), // Modèle actif
  timestamp: timestamp("timestamp").defaultNow().notNull(), // Horodatage
  userId: text("user_id"), // ID utilisateur
  sessionId: text("session_id").notNull(), // ID session
  taskType: text("task_type").notNull(), // 'estimation' | 'generation' | 'chat'
  inputData: jsonb("input_data"), // Données d'entrée pour debug
  outputData: jsonb("output_data"), // Données de sortie pour debug
  executionTimeMs: integer("execution_time_ms"), // Temps d'exécution en ms
  modelCapabilities: jsonb("model_capabilities"), // Capacités du modèle utilisé
  performanceMetrics: jsonb("performance_metrics"), // Métriques de performance
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// Insert schemas for extended tables
export const insertProjectCategorySchema = createInsertSchema(projectCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClientRequestSchema = createInsertSchema(clientRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuotationSchema = createInsertSchema(quotations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActiveProjectSchema = createInsertSchema(activeProjects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectPhaseSchema = createInsertSchema(projectPhases).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectUpdateSchema = createInsertSchema(projectUpdates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEnhancedProjectDocumentSchema = createInsertSchema(enhancedProjectDocuments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAdminStatisticSchema = createInsertSchema(adminStatistics).omit({ id: true, createdAt: true });
export const insertEnhancedNotificationSchema = createInsertSchema(enhancedNotifications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({ id: true, createdAt: true, updatedAt: true });

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
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type InsertProjectDocument = z.infer<typeof insertProjectDocumentSchema>;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type InsertProjectBudget = z.infer<typeof insertProjectBudgetSchema>;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type InsertEquipmentAssignment = z.infer<typeof insertEquipmentAssignmentSchema>;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type InsertQualityInspection = z.infer<typeof insertQualityInspectionSchema>;
export type InsertSafetyIncident = z.infer<typeof insertSafetyIncidentSchema>;
export type InsertWeatherCondition = z.infer<typeof insertWeatherConditionSchema>;
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;
export type InsertTimeTracking = z.infer<typeof insertTimeTrackingSchema>;
export type InsertClientCommunication = z.infer<typeof insertClientCommunicationSchema>;

// Insert types for extended tables
export type InsertProjectCategory = z.infer<typeof insertProjectCategorySchema>;
export type InsertClientRequest = z.infer<typeof insertClientRequestSchema>;
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type InsertActiveProject = z.infer<typeof insertActiveProjectSchema>;
export type InsertProjectPhase = z.infer<typeof insertProjectPhaseSchema>;
export type InsertProjectUpdate = z.infer<typeof insertProjectUpdateSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertEnhancedProjectDocument = z.infer<typeof insertEnhancedProjectDocumentSchema>;
export type InsertAdminStatistic = z.infer<typeof insertAdminStatisticSchema>;
export type InsertEnhancedNotification = z.infer<typeof insertEnhancedNotificationSchema>;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

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
export type Company = typeof companies.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Contractor = typeof contractors.$inferSelect;
export type ProjectDocument = typeof projectDocuments.$inferSelect;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type ProjectBudget = typeof projectBudgets.$inferSelect;
export type Equipment = typeof equipment.$inferSelect;
export type EquipmentAssignment = typeof equipmentAssignments.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type QualityInspection = typeof qualityInspections.$inferSelect;
export type SafetyIncident = typeof safetyIncidents.$inferSelect;
export type WeatherCondition = typeof weatherConditions.$inferSelect;
export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type TimeTracking = typeof timeTracking.$inferSelect;
export type ClientCommunication = typeof clientCommunications.$inferSelect;

// Select types for extended tables
export type ProjectCategory = typeof projectCategories.$inferSelect;
export type ClientRequest = typeof clientRequests.$inferSelect;
export type Quotation = typeof quotations.$inferSelect;
export type ActiveProject = typeof activeProjects.$inferSelect;
export type ProjectPhase = typeof projectPhases.$inferSelect;
export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type EnhancedProjectDocument = typeof enhancedProjectDocuments.$inferSelect;
export type AdminStatistic = typeof adminStatistics.$inferSelect;
export type EnhancedNotification = typeof enhancedNotifications.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;

// AI Model Tracking Types (Development Only)
export type AiModelTracking = typeof aiModelTracking.$inferSelect;
export type InsertAiModelTracking = typeof aiModelTracking.$inferInsert;
