import { relations } from "drizzle-orm/relations";
import { users, chatMessages, estimationPresets, notifications, projects, projectEstimations, activityLogs, tasks, materials, materialPriceHistory, taskResources, resources, projectMilestones, purchaseOrders, suppliers, projectDocuments, clientCommunications, budgetCategories, companies, contractors, inventory, projectBudgets, financialTransactions, equipment, equipmentAssignments, purchaseOrderItems, qualityInspections, safetyIncidents, timeTracking, weatherConditions } from "./schema";

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	user: one(users, {
		fields: [chatMessages.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	chatMessages: many(chatMessages),
	estimationPresets: many(estimationPresets),
	notifications: many(notifications),
	projectEstimations: many(projectEstimations),
	activityLogs: many(activityLogs),
	tasks: many(tasks),
	projects: many(projects),
	projectMilestones_approvedBy: many(projectMilestones, {
		relationName: "projectMilestones_approvedBy_users_id"
	}),
	projectMilestones_createdBy: many(projectMilestones, {
		relationName: "projectMilestones_createdBy_users_id"
	}),
	purchaseOrders_approvedBy: many(purchaseOrders, {
		relationName: "purchaseOrders_approvedBy_users_id"
	}),
	purchaseOrders_createdBy: many(purchaseOrders, {
		relationName: "purchaseOrders_createdBy_users_id"
	}),
	projectDocuments: many(projectDocuments),
	clientCommunications_ourContact: many(clientCommunications, {
		relationName: "clientCommunications_ourContact_users_id"
	}),
	clientCommunications_createdBy: many(clientCommunications, {
		relationName: "clientCommunications_createdBy_users_id"
	}),
	financialTransactions_createdBy: many(financialTransactions, {
		relationName: "financialTransactions_createdBy_users_id"
	}),
	financialTransactions_approvedBy: many(financialTransactions, {
		relationName: "financialTransactions_approvedBy_users_id"
	}),
	equipmentAssignments: many(equipmentAssignments),
	qualityInspections: many(qualityInspections),
	safetyIncidents_reportedBy: many(safetyIncidents, {
		relationName: "safetyIncidents_reportedBy_users_id"
	}),
	safetyIncidents_investigatedBy: many(safetyIncidents, {
		relationName: "safetyIncidents_investigatedBy_users_id"
	}),
	timeTrackings_userId: many(timeTracking, {
		relationName: "timeTracking_userId_users_id"
	}),
	timeTrackings_approvedBy: many(timeTracking, {
		relationName: "timeTracking_approvedBy_users_id"
	}),
}));

export const estimationPresetsRelations = relations(estimationPresets, ({one}) => ({
	user: one(users, {
		fields: [estimationPresets.createdBy],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const projectEstimationsRelations = relations(projectEstimations, ({one}) => ({
	project: one(projects, {
		fields: [projectEstimations.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [projectEstimations.createdBy],
		references: [users.id]
	}),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	projectEstimations: many(projectEstimations),
	tasks: many(tasks),
	user: one(users, {
		fields: [projects.createdBy],
		references: [users.id]
	}),
	projectMilestones: many(projectMilestones),
	purchaseOrders: many(purchaseOrders),
	projectDocuments: many(projectDocuments),
	clientCommunications: many(clientCommunications),
	inventories: many(inventory),
	projectBudgets: many(projectBudgets),
	financialTransactions: many(financialTransactions),
	equipmentAssignments: many(equipmentAssignments),
	qualityInspections: many(qualityInspections),
	safetyIncidents: many(safetyIncidents),
	timeTrackings: many(timeTracking),
	weatherConditions: many(weatherConditions),
}));

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [tasks.assignedTo],
		references: [users.id]
	}),
	taskResources: many(taskResources),
	equipmentAssignments: many(equipmentAssignments),
	qualityInspections: many(qualityInspections),
	timeTrackings: many(timeTracking),
}));

export const materialPriceHistoryRelations = relations(materialPriceHistory, ({one}) => ({
	material: one(materials, {
		fields: [materialPriceHistory.materialId],
		references: [materials.id]
	}),
}));

export const materialsRelations = relations(materials, ({many}) => ({
	materialPriceHistories: many(materialPriceHistory),
	inventories: many(inventory),
	purchaseOrderItems: many(purchaseOrderItems),
}));

export const taskResourcesRelations = relations(taskResources, ({one}) => ({
	task: one(tasks, {
		fields: [taskResources.taskId],
		references: [tasks.id]
	}),
	resource: one(resources, {
		fields: [taskResources.resourceId],
		references: [resources.id]
	}),
}));

export const resourcesRelations = relations(resources, ({many}) => ({
	taskResources: many(taskResources),
}));

export const projectMilestonesRelations = relations(projectMilestones, ({one}) => ({
	project: one(projects, {
		fields: [projectMilestones.projectId],
		references: [projects.id]
	}),
	user_approvedBy: one(users, {
		fields: [projectMilestones.approvedBy],
		references: [users.id],
		relationName: "projectMilestones_approvedBy_users_id"
	}),
	user_createdBy: one(users, {
		fields: [projectMilestones.createdBy],
		references: [users.id],
		relationName: "projectMilestones_createdBy_users_id"
	}),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({one, many}) => ({
	project: one(projects, {
		fields: [purchaseOrders.projectId],
		references: [projects.id]
	}),
	supplier: one(suppliers, {
		fields: [purchaseOrders.supplierId],
		references: [suppliers.id]
	}),
	user_approvedBy: one(users, {
		fields: [purchaseOrders.approvedBy],
		references: [users.id],
		relationName: "purchaseOrders_approvedBy_users_id"
	}),
	user_createdBy: one(users, {
		fields: [purchaseOrders.createdBy],
		references: [users.id],
		relationName: "purchaseOrders_createdBy_users_id"
	}),
	purchaseOrderItems: many(purchaseOrderItems),
}));

export const suppliersRelations = relations(suppliers, ({one, many}) => ({
	purchaseOrders: many(purchaseOrders),
	inventories: many(inventory),
	company: one(companies, {
		fields: [suppliers.companyId],
		references: [companies.id]
	}),
}));

export const projectDocumentsRelations = relations(projectDocuments, ({one}) => ({
	project: one(projects, {
		fields: [projectDocuments.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [projectDocuments.uploadedBy],
		references: [users.id]
	}),
}));

export const clientCommunicationsRelations = relations(clientCommunications, ({one}) => ({
	project: one(projects, {
		fields: [clientCommunications.projectId],
		references: [projects.id]
	}),
	user_ourContact: one(users, {
		fields: [clientCommunications.ourContact],
		references: [users.id],
		relationName: "clientCommunications_ourContact_users_id"
	}),
	user_createdBy: one(users, {
		fields: [clientCommunications.createdBy],
		references: [users.id],
		relationName: "clientCommunications_createdBy_users_id"
	}),
}));

export const budgetCategoriesRelations = relations(budgetCategories, ({one, many}) => ({
	budgetCategory: one(budgetCategories, {
		fields: [budgetCategories.parentId],
		references: [budgetCategories.id],
		relationName: "budgetCategories_parentId_budgetCategories_id"
	}),
	budgetCategories: many(budgetCategories, {
		relationName: "budgetCategories_parentId_budgetCategories_id"
	}),
	projectBudgets: many(projectBudgets),
}));

export const contractorsRelations = relations(contractors, ({one}) => ({
	company: one(companies, {
		fields: [contractors.companyId],
		references: [companies.id]
	}),
}));

export const companiesRelations = relations(companies, ({many}) => ({
	contractors: many(contractors),
	suppliers: many(suppliers),
}));

export const inventoryRelations = relations(inventory, ({one}) => ({
	material: one(materials, {
		fields: [inventory.materialId],
		references: [materials.id]
	}),
	project: one(projects, {
		fields: [inventory.projectId],
		references: [projects.id]
	}),
	supplier: one(suppliers, {
		fields: [inventory.supplierId],
		references: [suppliers.id]
	}),
}));

export const projectBudgetsRelations = relations(projectBudgets, ({one}) => ({
	project: one(projects, {
		fields: [projectBudgets.projectId],
		references: [projects.id]
	}),
	budgetCategory: one(budgetCategories, {
		fields: [projectBudgets.categoryId],
		references: [budgetCategories.id]
	}),
}));

export const financialTransactionsRelations = relations(financialTransactions, ({one}) => ({
	project: one(projects, {
		fields: [financialTransactions.projectId],
		references: [projects.id]
	}),
	user_createdBy: one(users, {
		fields: [financialTransactions.createdBy],
		references: [users.id],
		relationName: "financialTransactions_createdBy_users_id"
	}),
	user_approvedBy: one(users, {
		fields: [financialTransactions.approvedBy],
		references: [users.id],
		relationName: "financialTransactions_approvedBy_users_id"
	}),
}));

export const equipmentAssignmentsRelations = relations(equipmentAssignments, ({one}) => ({
	equipment: one(equipment, {
		fields: [equipmentAssignments.equipmentId],
		references: [equipment.id]
	}),
	project: one(projects, {
		fields: [equipmentAssignments.projectId],
		references: [projects.id]
	}),
	task: one(tasks, {
		fields: [equipmentAssignments.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [equipmentAssignments.assignedTo],
		references: [users.id]
	}),
}));

export const equipmentRelations = relations(equipment, ({many}) => ({
	equipmentAssignments: many(equipmentAssignments),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({one}) => ({
	purchaseOrder: one(purchaseOrders, {
		fields: [purchaseOrderItems.purchaseOrderId],
		references: [purchaseOrders.id]
	}),
	material: one(materials, {
		fields: [purchaseOrderItems.materialId],
		references: [materials.id]
	}),
}));

export const qualityInspectionsRelations = relations(qualityInspections, ({one}) => ({
	project: one(projects, {
		fields: [qualityInspections.projectId],
		references: [projects.id]
	}),
	task: one(tasks, {
		fields: [qualityInspections.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [qualityInspections.inspector],
		references: [users.id]
	}),
}));

export const safetyIncidentsRelations = relations(safetyIncidents, ({one}) => ({
	project: one(projects, {
		fields: [safetyIncidents.projectId],
		references: [projects.id]
	}),
	user_reportedBy: one(users, {
		fields: [safetyIncidents.reportedBy],
		references: [users.id],
		relationName: "safetyIncidents_reportedBy_users_id"
	}),
	user_investigatedBy: one(users, {
		fields: [safetyIncidents.investigatedBy],
		references: [users.id],
		relationName: "safetyIncidents_investigatedBy_users_id"
	}),
}));

export const timeTrackingRelations = relations(timeTracking, ({one}) => ({
	user_userId: one(users, {
		fields: [timeTracking.userId],
		references: [users.id],
		relationName: "timeTracking_userId_users_id"
	}),
	project: one(projects, {
		fields: [timeTracking.projectId],
		references: [projects.id]
	}),
	task: one(tasks, {
		fields: [timeTracking.taskId],
		references: [tasks.id]
	}),
	user_approvedBy: one(users, {
		fields: [timeTracking.approvedBy],
		references: [users.id],
		relationName: "timeTracking_approvedBy_users_id"
	}),
}));

export const weatherConditionsRelations = relations(weatherConditions, ({one}) => ({
	project: one(projects, {
		fields: [weatherConditions.projectId],
		references: [projects.id]
	}),
}));