import { pgTable, foreignKey, serial, integer, text, timestamp, jsonb, boolean, doublePrecision, unique, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const chatMessages = pgTable("chat_messages", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	role: text().notNull(),
	content: text().notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	sessionId: text("session_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "chat_messages_user_id_users_id_fk"
		}),
]);

export const aiAnalysis = pgTable("ai_analysis", {
	id: serial().primaryKey().notNull(),
	analysisType: text("analysis_type").notNull(),
	inputData: jsonb("input_data"),
	result: jsonb().notNull(),
	provider: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const estimationPresets = pgTable("estimation_presets", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	projectType: text("project_type").notNull(),
	qualityLevel: text("quality_level").notNull(),
	wastageIncluded: boolean("wastage_included").default(true).notNull(),
	materialRatios: jsonb("material_ratios").notNull(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "estimation_presets_created_by_users_id_fk"
		}),
]);

export const materials = pgTable("materials", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	category: text().notNull(),
	unit: text().notNull(),
	price: doublePrecision().notNull(),
	priceCurrency: text("price_currency").default('TND').notNull(),
	supplier: text(),
	brand: text(),
	description: text(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: text().notNull(),
	message: text().notNull(),
	type: text().notNull(),
	read: boolean().default(false).notNull(),
	entityType: text("entity_type"),
	entityId: integer("entity_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}),
]);

export const projectEstimations = pgTable("project_estimations", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id"),
	name: text().notNull(),
	area: doublePrecision().notNull(),
	floors: integer().default(1).notNull(),
	projectType: text("project_type").notNull(),
	qualityLevel: text("quality_level").notNull(),
	wastageIncluded: boolean("wastage_included").default(true).notNull(),
	totalCost: doublePrecision("total_cost").notNull(),
	costBreakdown: jsonb("cost_breakdown").notNull(),
	materialsList: jsonb("materials_list").notNull(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_estimations_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "project_estimations_created_by_users_id_fk"
		}),
]);

export const activityLogs = pgTable("activity_logs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	actionType: text("action_type").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: integer("entity_id"),
	details: jsonb(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "activity_logs_user_id_users_id_fk"
		}),
]);

export const realEstateMarket = pgTable("real_estate_market", {
	id: serial().primaryKey().notNull(),
	propertyId: text("property_id").notNull(),
	title: text().notNull(),
	description: text(),
	price: doublePrecision().notNull(),
	priceCurrency: text("price_currency").default('TND').notNull(),
	area: doublePrecision(),
	rooms: text(),
	propertyType: text("property_type").notNull(),
	city: text().notNull(),
	governorate: text().notNull(),
	address: text(),
	latitude: doublePrecision(),
	longitude: doublePrecision(),
	source: text(),
	url: text(),
	scrapedAt: timestamp("scraped_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const resources = pgTable("resources", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	availability: text().notNull(),
	occupancyRate: doublePrecision("occupancy_rate").default(0),
	details: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	name: text().notNull(),
	description: text(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	status: text().default('pending').notNull(),
	progress: doublePrecision().default(0).notNull(),
	assignedTo: integer("assigned_to"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "tasks_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "tasks_assigned_to_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	fullName: text("full_name").notNull(),
	email: text().notNull(),
	role: text().notNull(),
	avatar: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const materialPriceHistory = pgTable("material_price_history", {
	id: serial().primaryKey().notNull(),
	materialId: integer("material_id").notNull(),
	price: doublePrecision().notNull(),
	priceCurrency: text("price_currency").default('TND').notNull(),
	effectiveDate: timestamp("effective_date", { mode: 'string' }).notNull(),
	supplier: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.materialId],
			foreignColumns: [materials.id],
			name: "material_price_history_material_id_materials_id_fk"
		}),
]);

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	clientName: text("client_name"),
	location: text(),
	budget: doublePrecision().notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	status: text().default('active').notNull(),
	progress: doublePrecision().default(0).notNull(),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "projects_created_by_users_id_fk"
		}),
]);

export const taskResources = pgTable("task_resources", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id").notNull(),
	resourceId: integer("resource_id").notNull(),
	allocationPercentage: doublePrecision("allocation_percentage").default(100).notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_resources_task_id_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.resourceId],
			foreignColumns: [resources.id],
			name: "task_resources_resource_id_resources_id_fk"
		}),
]);

export const projectMilestones = pgTable("project_milestones", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	name: text().notNull(),
	description: text(),
	plannedDate: timestamp("planned_date", { mode: 'string' }).notNull(),
	actualDate: timestamp("actual_date", { mode: 'string' }),
	status: text().default('pending').notNull(),
	importance: text().default('medium'),
	deliverables: jsonb(),
	dependencies: jsonb(),
	approvalRequired: boolean("approval_required").default(false),
	approvedBy: integer("approved_by"),
	approvalDate: timestamp("approval_date", { mode: 'string' }),
	budget: numeric({ precision: 12, scale:  2 }),
	actualCost: numeric("actual_cost", { precision: 12, scale:  2 }),
	notes: text(),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_milestones_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "project_milestones_approved_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "project_milestones_created_by_users_id_fk"
		}),
]);

export const purchaseOrders = pgTable("purchase_orders", {
	id: serial().primaryKey().notNull(),
	orderNumber: text("order_number").notNull(),
	projectId: integer("project_id"),
	supplierId: integer("supplier_id").notNull(),
	orderDate: timestamp("order_date", { mode: 'string' }).notNull(),
	expectedDelivery: timestamp("expected_delivery", { mode: 'string' }),
	actualDelivery: timestamp("actual_delivery", { mode: 'string' }),
	status: text().default('pending').notNull(),
	totalAmount: numeric("total_amount", { precision: 12, scale:  2 }).notNull(),
	currency: text().default('TND').notNull(),
	paymentTerms: text("payment_terms"),
	deliveryAddress: text("delivery_address"),
	contactPerson: text("contact_person"),
	notes: text(),
	approvedBy: integer("approved_by"),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "purchase_orders_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "purchase_orders_supplier_id_suppliers_id_fk"
		}),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "purchase_orders_approved_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "purchase_orders_created_by_users_id_fk"
		}),
	unique("purchase_orders_order_number_unique").on(table.orderNumber),
]);

export const projectDocuments = pgTable("project_documents", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	name: text().notNull(),
	description: text(),
	documentType: text("document_type").notNull(),
	filePath: text("file_path").notNull(),
	fileSize: integer("file_size"),
	mimeType: text("mime_type"),
	version: text().default('1.0'),
	uploadedBy: integer("uploaded_by"),
	tags: jsonb(),
	isPublic: boolean("is_public").default(false),
	expiryDate: timestamp("expiry_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_documents_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "project_documents_uploaded_by_users_id_fk"
		}),
]);

export const clientCommunications = pgTable("client_communications", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	communicationType: text("communication_type").notNull(),
	subject: text().notNull(),
	content: text().notNull(),
	communicationDate: timestamp("communication_date", { mode: 'string' }).notNull(),
	clientContact: text("client_contact"),
	ourContact: integer("our_contact"),
	status: text().default('completed'),
	priority: text().default('medium'),
	actionItems: jsonb("action_items"),
	followUpDate: timestamp("follow_up_date", { mode: 'string' }),
	attachments: jsonb(),
	tags: jsonb(),
	isInternal: boolean("is_internal").default(false),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "client_communications_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.ourContact],
			foreignColumns: [users.id],
			name: "client_communications_our_contact_users_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "client_communications_created_by_users_id_fk"
		}),
]);

export const companies = pgTable("companies", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	companyType: text("company_type").notNull(),
	contactPerson: text("contact_person"),
	email: text(),
	phone: text(),
	address: text(),
	city: text(),
	governorate: text(),
	taxId: text("tax_id"),
	registrationNumber: text("registration_number"),
	rating: doublePrecision().default(0),
	isActive: boolean("is_active").default(true).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("companies_name_unique").on(table.name),
]);

export const equipment = pgTable("equipment", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	equipmentType: text("equipment_type").notNull(),
	brand: text(),
	model: text(),
	serialNumber: text("serial_number"),
	purchaseDate: timestamp("purchase_date", { mode: 'string' }),
	purchasePrice: numeric("purchase_price", { precision: 10, scale:  2 }),
	currentValue: numeric("current_value", { precision: 10, scale:  2 }),
	hourlyRate: numeric("hourly_rate", { precision: 8, scale:  2 }),
	dailyRate: numeric("daily_rate", { precision: 8, scale:  2 }),
	status: text().default('available').notNull(),
	location: text(),
	owner: text(),
	maintenanceSchedule: jsonb("maintenance_schedule"),
	operatingHours: doublePrecision("operating_hours").default(0),
	fuelType: text("fuel_type"),
	capacity: text(),
	specifications: jsonb(),
	attachments: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const budgetCategories = pgTable("budget_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	parentId: integer("parent_id"),
	color: text().default('#3b82f6'),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "budget_categories_parent_id_budget_categories_id_fk"
		}),
]);

export const contractors = pgTable("contractors", {
	id: serial().primaryKey().notNull(),
	companyId: integer("company_id"),
	name: text().notNull(),
	specialty: text(),
	licenseNumber: text("license_number"),
	licenseExpiry: timestamp("license_expiry", { mode: 'string' }),
	experience: integer(),
	teamSize: integer("team_size"),
	equipment: jsonb(),
	workingRadius: doublePrecision("working_radius"),
	hourlyRate: doublePrecision("hourly_rate"),
	projectRate: doublePrecision("project_rate"),
	qualityRating: doublePrecision("quality_rating").default(0),
	timelinessRating: doublePrecision("timeliness_rating").default(0),
	professionalismRating: doublePrecision("professionalism_rating").default(0),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "contractors_company_id_companies_id_fk"
		}),
]);

export const inventory = pgTable("inventory", {
	id: serial().primaryKey().notNull(),
	materialId: integer("material_id").notNull(),
	projectId: integer("project_id"),
	location: text(),
	quantity: doublePrecision().notNull(),
	unit: text().notNull(),
	minStockLevel: doublePrecision("min_stock_level").default(0),
	maxStockLevel: doublePrecision("max_stock_level"),
	unitCost: numeric("unit_cost", { precision: 10, scale:  4 }),
	totalValue: numeric("total_value", { precision: 12, scale:  2 }),
	supplierId: integer("supplier_id"),
	batchNumber: text("batch_number"),
	expiryDate: timestamp("expiry_date", { mode: 'string' }),
	lastRestocked: timestamp("last_restocked", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.materialId],
			foreignColumns: [materials.id],
			name: "inventory_material_id_materials_id_fk"
		}),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "inventory_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "inventory_supplier_id_suppliers_id_fk"
		}),
]);

export const projectBudgets = pgTable("project_budgets", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	categoryId: integer("category_id").notNull(),
	budgetedAmount: numeric("budgeted_amount", { precision: 12, scale:  2 }).notNull(),
	actualAmount: numeric("actual_amount", { precision: 12, scale:  2 }).default('0'),
	variance: numeric({ precision: 12, scale:  2 }).default('0'),
	currency: text().default('TND').notNull(),
	notes: text(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_budgets_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [budgetCategories.id],
			name: "project_budgets_category_id_budget_categories_id_fk"
		}),
]);

export const financialTransactions = pgTable("financial_transactions", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id"),
	transactionId: text("transaction_id").notNull(),
	transactionType: text("transaction_type").notNull(),
	category: text().notNull(),
	description: text().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	currency: text().default('TND').notNull(),
	paymentMethod: text("payment_method"),
	payee: text(),
	payer: text(),
	invoiceNumber: text("invoice_number"),
	status: text().default('pending').notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	paidDate: timestamp("paid_date", { mode: 'string' }),
	notes: text(),
	attachments: jsonb(),
	createdBy: integer("created_by"),
	approvedBy: integer("approved_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "financial_transactions_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "financial_transactions_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "financial_transactions_approved_by_users_id_fk"
		}),
	unique("financial_transactions_transaction_id_unique").on(table.transactionId),
]);

export const equipmentAssignments = pgTable("equipment_assignments", {
	id: serial().primaryKey().notNull(),
	equipmentId: integer("equipment_id").notNull(),
	projectId: integer("project_id"),
	taskId: integer("task_id"),
	assignedTo: integer("assigned_to"),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	actualStartDate: timestamp("actual_start_date", { mode: 'string' }),
	actualEndDate: timestamp("actual_end_date", { mode: 'string' }),
	hoursUsed: doublePrecision("hours_used").default(0),
	cost: numeric({ precision: 10, scale:  2 }),
	status: text().default('scheduled').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.equipmentId],
			foreignColumns: [equipment.id],
			name: "equipment_assignments_equipment_id_equipment_id_fk"
		}),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "equipment_assignments_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "equipment_assignments_task_id_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "equipment_assignments_assigned_to_users_id_fk"
		}),
]);

export const suppliers = pgTable("suppliers", {
	id: serial().primaryKey().notNull(),
	companyId: integer("company_id"),
	name: text().notNull(),
	specialization: text(),
	deliveryZones: jsonb("delivery_zones"),
	paymentTerms: text("payment_terms"),
	creditLimit: doublePrecision("credit_limit"),
	deliveryTime: integer("delivery_time"),
	qualityRating: doublePrecision("quality_rating").default(0),
	priceRating: doublePrecision("price_rating").default(0),
	serviceRating: doublePrecision("service_rating").default(0),
	isPreferred: boolean("is_preferred").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "suppliers_company_id_companies_id_fk"
		}),
]);

export const purchaseOrderItems = pgTable("purchase_order_items", {
	id: serial().primaryKey().notNull(),
	purchaseOrderId: integer("purchase_order_id").notNull(),
	materialId: integer("material_id").notNull(),
	quantity: doublePrecision().notNull(),
	unit: text().notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  4 }).notNull(),
	totalPrice: numeric("total_price", { precision: 12, scale:  2 }).notNull(),
	deliveredQuantity: doublePrecision("delivered_quantity").default(0),
	specifications: text(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.purchaseOrderId],
			foreignColumns: [purchaseOrders.id],
			name: "purchase_order_items_purchase_order_id_purchase_orders_id_fk"
		}),
	foreignKey({
			columns: [table.materialId],
			foreignColumns: [materials.id],
			name: "purchase_order_items_material_id_materials_id_fk"
		}),
]);

export const qualityInspections = pgTable("quality_inspections", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	taskId: integer("task_id"),
	inspectionType: text("inspection_type").notNull(),
	inspectionDate: timestamp("inspection_date", { mode: 'string' }).notNull(),
	inspector: integer().notNull(),
	status: text().notNull(),
	score: doublePrecision(),
	checklist: jsonb(),
	findings: text(),
	recommendations: text(),
	actionRequired: text("action_required"),
	priority: text().default('medium'),
	dueDate: timestamp("due_date", { mode: 'string' }),
	completedDate: timestamp("completed_date", { mode: 'string' }),
	photos: jsonb(),
	documents: jsonb(),
	followUpRequired: boolean("follow_up_required").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "quality_inspections_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "quality_inspections_task_id_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.inspector],
			foreignColumns: [users.id],
			name: "quality_inspections_inspector_users_id_fk"
		}),
]);

export const safetyIncidents = pgTable("safety_incidents", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	incidentDate: timestamp("incident_date", { mode: 'string' }).notNull(),
	incidentType: text("incident_type").notNull(),
	severity: text().notNull(),
	location: text().notNull(),
	description: text().notNull(),
	involvedPersons: jsonb("involved_persons"),
	witnesses: jsonb(),
	rootCause: text("root_cause"),
	correctiveActions: text("corrective_actions"),
	preventiveActions: text("preventive_actions"),
	status: text().default('open').notNull(),
	reportedBy: integer("reported_by").notNull(),
	investigatedBy: integer("investigated_by"),
	workLostDays: integer("work_lost_days").default(0),
	medicalTreatment: boolean("medical_treatment").default(false),
	photos: jsonb(),
	documents: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "safety_incidents_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.reportedBy],
			foreignColumns: [users.id],
			name: "safety_incidents_reported_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.investigatedBy],
			foreignColumns: [users.id],
			name: "safety_incidents_investigated_by_users_id_fk"
		}),
]);

export const timeTracking = pgTable("time_tracking", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	projectId: integer("project_id"),
	taskId: integer("task_id"),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }),
	duration: integer(),
	workType: text("work_type"),
	description: text(),
	location: text(),
	isApproved: boolean("is_approved").default(false),
	approvedBy: integer("approved_by"),
	hourlyRate: numeric("hourly_rate", { precision: 8, scale:  2 }),
	totalCost: numeric("total_cost", { precision: 10, scale:  2 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "time_tracking_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "time_tracking_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "time_tracking_task_id_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "time_tracking_approved_by_users_id_fk"
		}),
]);

export const weatherConditions = pgTable("weather_conditions", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id"),
	recordDate: timestamp("record_date", { mode: 'string' }).notNull(),
	temperature: doublePrecision(),
	humidity: doublePrecision(),
	windSpeed: doublePrecision("wind_speed"),
	precipitation: doublePrecision(),
	visibility: doublePrecision(),
	conditions: text(),
	workability: text().default('good'),
	impact: text(),
	delaysMinutes: integer("delays_minutes").default(0),
	source: text().default('manual'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "weather_conditions_project_id_projects_id_fk"
		}),
]);
