-- Migration: Extended Schema for Advanced Project Management
-- Generated on: 2025-05-28
-- Description: Adding 12 new tables for comprehensive construction project management

-- Project categories table
CREATE TABLE IF NOT EXISTS "project_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"base_price" numeric(12,2) NOT NULL,
	"unit" text DEFAULT 'm²' NOT NULL,
	"complexity" text DEFAULT 'medium' NOT NULL,
	"duration" integer NOT NULL,
	"materials" jsonb,
	"labor_cost" numeric(10,2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_categories_name_unique" UNIQUE("name")
);

-- Client requests table - Demandes clients avec workflow complet
CREATE TABLE IF NOT EXISTS "client_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_number" text NOT NULL,
	"client_name" text NOT NULL,
	"client_email" text NOT NULL,
	"client_phone" text NOT NULL,
	"client_address" text,
	"category_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"area" double precision NOT NULL,
	"floors" integer DEFAULT 1,
	"budget" numeric(12,2),
	"desired_start_date" timestamp,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"urgency" text DEFAULT 'normal',
	"quality_level" text DEFAULT 'standard',
	"special_requirements" text,
	"attachments" jsonb,
	"source" text DEFAULT 'website',
	"assigned_to" integer,
	"reviewed_by" integer,
	"review_date" timestamp,
	"review_notes" text,
	"estimated_cost" numeric(12,2),
	"estimated_duration" integer,
	"follow_up_date" timestamp,
	"expiry_date" timestamp,
	"conversion_rate" double precision DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_requests_request_number_unique" UNIQUE("request_number")
);

-- Quotations table - Système de devis avec révisions
CREATE TABLE IF NOT EXISTS "quotations" (
	"id" serial PRIMARY KEY NOT NULL,
	"quotation_number" text NOT NULL,
	"request_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"area" double precision NOT NULL,
	"total_cost" numeric(12,2) NOT NULL,
	"labor_cost" numeric(12,2) NOT NULL,
	"material_cost" numeric(12,2) NOT NULL,
	"equipment_cost" numeric(12,2) DEFAULT 0,
	"overhead_cost" numeric(12,2) DEFAULT 0,
	"profit_margin" double precision DEFAULT 15,
	"discount" numeric(10,2) DEFAULT 0,
	"final_amount" numeric(12,2) NOT NULL,
	"currency" text DEFAULT 'TND' NOT NULL,
	"valid_until" timestamp NOT NULL,
	"payment_terms" text,
	"delivery_time" integer NOT NULL,
	"warranty_period" integer DEFAULT 12,
	"special_conditions" text,
	"breakdown" jsonb NOT NULL,
	"materials" jsonb NOT NULL,
	"phases" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"sent_date" timestamp,
	"viewed_date" timestamp,
	"accepted_date" timestamp,
	"rejected_date" timestamp,
	"rejection_reason" text,
	"client_feedback" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer NOT NULL,
	"approved_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quotations_quotation_number_unique" UNIQUE("quotation_number")
);

-- Active projects table - Projets actifs après acceptation
CREATE TABLE IF NOT EXISTS "active_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_number" text NOT NULL,
	"quotation_id" integer NOT NULL,
	"original_project_id" integer,
	"name" text NOT NULL,
	"description" text,
	"client_name" text NOT NULL,
	"client_email" text NOT NULL,
	"client_phone" text NOT NULL,
	"location" text NOT NULL,
	"area" double precision NOT NULL,
	"contract_value" numeric(12,2) NOT NULL,
	"paid_amount" numeric(12,2) DEFAULT 0,
	"remaining_amount" numeric(12,2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"planned_end_date" timestamp NOT NULL,
	"actual_end_date" timestamp,
	"status" text DEFAULT 'planning' NOT NULL,
	"progress" double precision DEFAULT 0 NOT NULL,
	"current_phase" text,
	"priority" text DEFAULT 'medium',
	"risk_level" text DEFAULT 'low',
	"quality_score" double precision DEFAULT 0,
	"client_satisfaction" double precision DEFAULT 0,
	"team_lead" integer NOT NULL,
	"project_manager" integer NOT NULL,
	"team_members" jsonb,
	"budget" jsonb,
	"timeline" jsonb,
	"risks" jsonb,
	"resources" jsonb,
	"documents" jsonb,
	"last_update" timestamp DEFAULT now(),
	"next_milestone" timestamp,
	"contract_signed_date" timestamp,
	"warranty_end_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "active_projects_project_number_unique" UNIQUE("project_number")
);

-- Project phases table - Phases de construction
CREATE TABLE IF NOT EXISTS "project_phases" (
	"id" serial PRIMARY KEY NOT NULL,
	"active_project_id" integer NOT NULL,
	"phase_number" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"planned_start_date" timestamp NOT NULL,
	"planned_end_date" timestamp NOT NULL,
	"actual_start_date" timestamp,
	"actual_end_date" timestamp,
	"status" text DEFAULT 'not_started' NOT NULL,
	"progress" double precision DEFAULT 0 NOT NULL,
	"budget" numeric(12,2) NOT NULL,
	"actual_cost" numeric(12,2) DEFAULT 0,
	"materials" jsonb,
	"labor_required" jsonb,
	"equipment" jsonb,
	"deliverables" jsonb,
	"dependencies" jsonb,
	"quality_checks" jsonb,
	"risks" jsonb,
	"notes" text,
	"completion_certificate" text,
	"approved_by" integer,
	"approval_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Project updates table - Suivi des mises à jour
CREATE TABLE IF NOT EXISTS "project_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"active_project_id" integer NOT NULL,
	"phase_id" integer,
	"update_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"priority" text DEFAULT 'medium',
	"progress" double precision,
	"budget_impact" numeric(10,2) DEFAULT 0,
	"schedule_impact" integer DEFAULT 0,
	"quality_score" double precision,
	"photos" jsonb,
	"documents" jsonb,
	"location" text,
	"weather" text,
	"team" jsonb,
	"materials" jsonb,
	"equipment" jsonb,
	"issues" jsonb,
	"resolutions" jsonb,
	"next_steps" text,
	"is_client_visible" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"tags" jsonb,
	"parent_update_id" integer,
	"created_by" integer NOT NULL,
	"reviewed_by" integer,
	"review_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Payments table - Gestion des paiements
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_number" text NOT NULL,
	"active_project_id" integer NOT NULL,
	"phase_id" integer,
	"payment_type" text NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"currency" text DEFAULT 'TND' NOT NULL,
	"percentage" double precision,
	"description" text,
	"due_date" timestamp NOT NULL,
	"paid_date" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"reference" text,
	"invoice_number" text,
	"invoice_date" timestamp,
	"invoice_path" text,
	"receipt_path" text,
	"bank_account" text,
	"transaction_id" text,
	"fees" numeric(8,2) DEFAULT 0,
	"taxes" numeric(8,2) DEFAULT 0,
	"net_amount" numeric(12,2) NOT NULL,
	"client_confirmation" boolean DEFAULT false,
	"confirmation_date" timestamp,
	"notes" text,
	"attachments" jsonb,
	"overdue_reason" text,
	"follow_up_date" timestamp,
	"reminder_sent" boolean DEFAULT false,
	"reminder_date" timestamp,
	"created_by" integer NOT NULL,
	"approved_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_payment_number_unique" UNIQUE("payment_number")
);

-- Enhanced project documents table
CREATE TABLE IF NOT EXISTS "enhanced_project_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"active_project_id" integer,
	"quotation_id" integer,
	"phase_id" integer,
	"update_id" integer,
	"category" text NOT NULL,
	"sub_category" text,
	"name" text NOT NULL,
	"description" text,
	"file_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"version" text DEFAULT '1.0',
	"is_latest" boolean DEFAULT true,
	"previous_version_id" integer,
	"tags" jsonb,
	"metadata" jsonb,
	"thumbnail" text,
	"is_public" boolean DEFAULT false,
	"is_client_visible" boolean DEFAULT false,
	"download_count" integer DEFAULT 0,
	"last_accessed" timestamp,
	"expiry_date" timestamp,
	"password" text,
	"uploaded_by" integer NOT NULL,
	"approved_by" integer,
	"approval_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Admin statistics table - KPIs et statistiques
CREATE TABLE IF NOT EXISTS "admin_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"period" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_requests" integer DEFAULT 0,
	"new_requests" integer DEFAULT 0,
	"quotations_sent" integer DEFAULT 0,
	"quotations_accepted" integer DEFAULT 0,
	"quotations_rejected" integer DEFAULT 0,
	"conversion_rate" double precision DEFAULT 0,
	"active_projects" integer DEFAULT 0,
	"completed_projects" integer DEFAULT 0,
	"delayed_projects" integer DEFAULT 0,
	"cancelled_projects" integer DEFAULT 0,
	"total_revenue" numeric(15,2) DEFAULT 0,
	"pending_payments" numeric(12,2) DEFAULT 0,
	"overdue_payments" numeric(12,2) DEFAULT 0,
	"average_project_value" numeric(12,2) DEFAULT 0,
	"average_project_duration" double precision DEFAULT 0,
	"client_satisfaction_avg" double precision DEFAULT 0,
	"quality_score_avg" double precision DEFAULT 0,
	"on_time_completion_rate" double precision DEFAULT 0,
	"budget_accuracy_rate" double precision DEFAULT 0,
	"team_utilization_rate" double precision DEFAULT 0,
	"material_cost_trend" jsonb,
	"project_types_breakdown" jsonb,
	"location_distribution" jsonb,
	"seasonal_trends" jsonb,
	"client_retention_rate" double precision DEFAULT 0,
	"referral_rate" double precision DEFAULT 0,
	"marketing_roi" double precision DEFAULT 0,
	"operational_efficiency" double precision DEFAULT 0,
	"profit_margin_avg" double precision DEFAULT 0,
	"risk_factors" jsonb,
	"recommendations" jsonb,
	"kpis" jsonb,
	"last_calculated" timestamp DEFAULT now(),
	"calculated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Enhanced notifications table
CREATE TABLE IF NOT EXISTS "enhanced_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"user_role" text,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"short_message" text,
	"action_required" boolean DEFAULT false,
	"action_url" text,
	"action_label" text,
	"entity_type" text,
	"entity_id" integer,
	"entity_name" text,
	"priority" text DEFAULT 'medium',
	"is_read" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"read_at" timestamp,
	"scheduled_for" timestamp,
	"expires_at" timestamp,
	"delivery_method" jsonb,
	"delivery_status" jsonb,
	"metadata" jsonb,
	"tags" jsonb,
	"parent_notification_id" integer,
	"batch_id" text,
	"triggered_by" integer,
	"acknowledged_by" integer,
	"acknowledged_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- System settings table - Configuration système
CREATE TABLE IF NOT EXISTS "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"setting_key" text NOT NULL,
	"setting_name" text NOT NULL,
	"description" text,
	"data_type" text NOT NULL,
	"value" text,
	"default_value" text,
	"options" jsonb,
	"validation" jsonb,
	"is_required" boolean DEFAULT false,
	"is_secret" boolean DEFAULT false,
	"is_user_editable" boolean DEFAULT true,
	"requires_restart" boolean DEFAULT false,
	"last_modified" timestamp DEFAULT now(),
	"modified_by" integer,
	"version" integer DEFAULT 1,
	"environment" text DEFAULT 'production',
	"tags" jsonb,
	"dependencies" jsonb,
	"impacts" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_setting_key_unique" UNIQUE("setting_key")
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "client_requests" ADD CONSTRAINT "client_requests_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "project_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "client_requests" ADD CONSTRAINT "client_requests_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "client_requests" ADD CONSTRAINT "client_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "quotations" ADD CONSTRAINT "quotations_request_id_client_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "client_requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "quotations" ADD CONSTRAINT "quotations_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "active_projects" ADD CONSTRAINT "active_projects_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "active_projects" ADD CONSTRAINT "active_projects_original_project_id_projects_id_fk" FOREIGN KEY ("original_project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "active_projects" ADD CONSTRAINT "active_projects_team_lead_users_id_fk" FOREIGN KEY ("team_lead") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "active_projects" ADD CONSTRAINT "active_projects_project_manager_users_id_fk" FOREIGN KEY ("project_manager") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_active_project_id_active_projects_id_fk" FOREIGN KEY ("active_project_id") REFERENCES "active_projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_active_project_id_active_projects_id_fk" FOREIGN KEY ("active_project_id") REFERENCES "active_projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "project_phases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_parent_update_id_project_updates_id_fk" FOREIGN KEY ("parent_update_id") REFERENCES "project_updates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_active_project_id_active_projects_id_fk" FOREIGN KEY ("active_project_id") REFERENCES "active_projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "project_phases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "enhanced_project_documents" ADD CONSTRAINT "enhanced_project_documents_active_project_id_active_projects_id_fk" FOREIGN KEY ("active_project_id") REFERENCES "active_projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "enhanced_project_documents" ADD CONSTRAINT "enhanced_project_documents_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "enhanced_project_documents" ADD CONSTRAINT "enhanced_project_documents_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "project_phases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "enhanced_project_documents" ADD CONSTRAINT "enhanced_project_documents_update_id_project_updates_id_fk" FOREIGN KEY ("update_id") REFERENCES "project_updates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "enhanced_project_documents" ADD CONSTRAINT "enhanced_project_documents_previous_version_id_enhanced_project_documents_id_fk" FOREIGN KEY ("previous_version_id") REFERENCES "enhanced_project_documents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "enhanced_project_documents" ADD CONSTRAINT "enhanced_project_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "enhanced_project_documents" ADD CONSTRAINT "enhanced_project_documents_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "admin_statistics" ADD CONSTRAINT "admin_statistics_calculated_by_users_id_fk" FOREIGN KEY ("calculated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "enhanced_notifications" ADD CONSTRAINT "enhanced_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "enhanced_notifications" ADD CONSTRAINT "enhanced_notifications_parent_notification_id_enhanced_notifications_id_fk" FOREIGN KEY ("parent_notification_id") REFERENCES "enhanced_notifications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "enhanced_notifications" ADD CONSTRAINT "enhanced_notifications_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "enhanced_notifications" ADD CONSTRAINT "enhanced_notifications_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_client_requests_status" ON "client_requests" ("status");
CREATE INDEX IF NOT EXISTS "idx_client_requests_category" ON "client_requests" ("category_id");
CREATE INDEX IF NOT EXISTS "idx_client_requests_assigned" ON "client_requests" ("assigned_to");
CREATE INDEX IF NOT EXISTS "idx_client_requests_created_at" ON "client_requests" ("created_at");

CREATE INDEX IF NOT EXISTS "idx_quotations_request_id" ON "quotations" ("request_id");
CREATE INDEX IF NOT EXISTS "idx_quotations_status" ON "quotations" ("status");
CREATE INDEX IF NOT EXISTS "idx_quotations_created_by" ON "quotations" ("created_by");
CREATE INDEX IF NOT EXISTS "idx_quotations_created_at" ON "quotations" ("created_at");

CREATE INDEX IF NOT EXISTS "idx_active_projects_status" ON "active_projects" ("status");
CREATE INDEX IF NOT EXISTS "idx_active_projects_team_lead" ON "active_projects" ("team_lead");
CREATE INDEX IF NOT EXISTS "idx_active_projects_project_manager" ON "active_projects" ("project_manager");
CREATE INDEX IF NOT EXISTS "idx_active_projects_created_at" ON "active_projects" ("created_at");

CREATE INDEX IF NOT EXISTS "idx_project_phases_active_project_id" ON "project_phases" ("active_project_id");
CREATE INDEX IF NOT EXISTS "idx_project_phases_status" ON "project_phases" ("status");
CREATE INDEX IF NOT EXISTS "idx_project_phases_phase_number" ON "project_phases" ("phase_number");

CREATE INDEX IF NOT EXISTS "idx_project_updates_active_project_id" ON "project_updates" ("active_project_id");
CREATE INDEX IF NOT EXISTS "idx_project_updates_phase_id" ON "project_updates" ("phase_id");
CREATE INDEX IF NOT EXISTS "idx_project_updates_type" ON "project_updates" ("update_type");
CREATE INDEX IF NOT EXISTS "idx_project_updates_created_at" ON "project_updates" ("created_at");

CREATE INDEX IF NOT EXISTS "idx_payments_active_project_id" ON "payments" ("active_project_id");
CREATE INDEX IF NOT EXISTS "idx_payments_status" ON "payments" ("status");
CREATE INDEX IF NOT EXISTS "idx_payments_due_date" ON "payments" ("due_date");
CREATE INDEX IF NOT EXISTS "idx_payments_created_at" ON "payments" ("created_at");

CREATE INDEX IF NOT EXISTS "idx_enhanced_documents_active_project_id" ON "enhanced_project_documents" ("active_project_id");
CREATE INDEX IF NOT EXISTS "idx_enhanced_documents_category" ON "enhanced_project_documents" ("category");
CREATE INDEX IF NOT EXISTS "idx_enhanced_documents_client_visible" ON "enhanced_project_documents" ("is_client_visible");

CREATE INDEX IF NOT EXISTS "idx_admin_statistics_period" ON "admin_statistics" ("period");
CREATE INDEX IF NOT EXISTS "idx_admin_statistics_period_start" ON "admin_statistics" ("period_start");

CREATE INDEX IF NOT EXISTS "idx_enhanced_notifications_user_id" ON "enhanced_notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_enhanced_notifications_type" ON "enhanced_notifications" ("type");
CREATE INDEX IF NOT EXISTS "idx_enhanced_notifications_is_read" ON "enhanced_notifications" ("is_read");
CREATE INDEX IF NOT EXISTS "idx_enhanced_notifications_priority" ON "enhanced_notifications" ("priority");

CREATE INDEX IF NOT EXISTS "idx_system_settings_category" ON "system_settings" ("category");
CREATE INDEX IF NOT EXISTS "idx_system_settings_key" ON "system_settings" ("setting_key");

-- Insert initial data

-- Default project categories
INSERT INTO "project_categories" ("name", "description", "base_price", "unit", "complexity", "duration", "labor_cost", "materials") VALUES
('Construction Villa', 'Construction complète de villa résidentielle', 800.00, 'm²', 'complex', 120, 200.00, '{"concrete": 150, "steel": 80, "ceramic": 25, "paint": 15}'),
('Rénovation Appartement', 'Rénovation complète d''appartement', 450.00, 'm²', 'medium', 45, 120.00, '{"paint": 20, "ceramic": 30, "electrical": 40, "plumbing": 35}'),
('Extension Maison', 'Extension de maison existante', 650.00, 'm²', 'medium', 60, 150.00, '{"concrete": 100, "steel": 60, "ceramic": 20, "roofing": 45}'),
('Construction Commerciale', 'Construction de locaux commerciaux', 550.00, 'm²', 'medium', 90, 130.00, '{"concrete": 120, "steel": 70, "glass": 50, "electrical": 60}'),
('Aménagement Intérieur', 'Aménagement et décoration intérieure', 200.00, 'm²', 'simple', 30, 80.00, '{"paint": 15, "flooring": 40, "lighting": 25, "furniture": 60}'),
('Aménagement Extérieur', 'Aménagement jardin et espaces extérieurs', 150.00, 'm²', 'simple', 20, 60.00, '{"plants": 30, "stone": 40, "irrigation": 35, "lighting": 20}');

-- Default system settings
INSERT INTO "system_settings" ("category", "setting_key", "setting_name", "description", "data_type", "value", "default_value") VALUES
('general', 'company_name', 'Nom de l''entreprise', 'Nom officiel de l''entreprise de construction', 'string', 'Housy', 'Housy'),
('general', 'company_email', 'Email de l''entreprise', 'Adresse email principale de l''entreprise', 'string', 'contact@housy.tn', 'contact@housy.tn'),
('general', 'company_phone', 'Téléphone de l''entreprise', 'Numéro de téléphone principal', 'string', '+216 XX XXX XXX', '+216 XX XXX XXX'),
('general', 'default_currency', 'Devise par défaut', 'Devise utilisée par défaut dans le système', 'string', 'TND', 'TND'),
('general', 'tax_rate', 'Taux de TVA', 'Taux de TVA appliqué aux devis et factures', 'number', '19', '19'),
('financial', 'default_payment_terms', 'Conditions de paiement par défaut', 'Conditions de paiement standard', 'string', '30% avance, 40% à mi-parcours, 30% livraison', '30% avance, 40% à mi-parcours, 30% livraison'),
('financial', 'default_warranty_period', 'Période de garantie par défaut', 'Période de garantie en mois', 'number', '12', '12'),
('notifications', 'email_notifications_enabled', 'Notifications email activées', 'Activer les notifications par email', 'boolean', 'true', 'true'),
('notifications', 'sms_notifications_enabled', 'Notifications SMS activées', 'Activer les notifications par SMS', 'boolean', 'false', 'false'),
('security', 'session_timeout', 'Délai d''expiration de session', 'Délai en minutes avant expiration de session', 'number', '480', '480');

-- Success message
INSERT INTO "admin_statistics" ("period", "period_start", "period_end", "total_requests", "new_requests", "quotations_sent", "conversion_rate", "active_projects", "total_revenue") VALUES
('initial', '2025-05-28 00:00:00'::timestamp, '2025-05-28 23:59:59'::timestamp, 0, 0, 0, 0, 0, 0);
