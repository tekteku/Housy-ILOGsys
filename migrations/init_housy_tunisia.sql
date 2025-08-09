-- Housy Tunisia Database Schema
-- This script will create all necessary tables for the Housy application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS enhanced_notifications CASCADE;
DROP TABLE IF EXISTS admin_statistics CASCADE;
DROP TABLE IF EXISTS enhanced_project_documents CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS project_updates CASCADE;
DROP TABLE IF EXISTS project_phases CASCADE;
DROP TABLE IF EXISTS active_projects CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS client_requests CASCADE;
DROP TABLE IF EXISTS project_categories CASCADE;
DROP TABLE IF EXISTS client_communications CASCADE;
DROP TABLE IF EXISTS time_tracking CASCADE;
DROP TABLE IF EXISTS project_milestones CASCADE;
DROP TABLE IF EXISTS weather_conditions CASCADE;
DROP TABLE IF EXISTS safety_incidents CASCADE;
DROP TABLE IF EXISTS quality_inspections CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS equipment_assignments CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS project_budgets CASCADE;
DROP TABLE IF EXISTS budget_categories CASCADE;
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS project_documents CASCADE;
DROP TABLE IF EXISTS contractors CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ai_analysis CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS project_estimations CASCADE;
DROP TABLE IF EXISTS estimation_presets CASCADE;
DROP TABLE IF EXISTS real_estate_market CASCADE;
DROP TABLE IF EXISTS material_price_history CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS task_resources CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    location TEXT,
    budget DOUBLE PRECISION NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'active',
    progress DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    progress DOUBLE PRECISION NOT NULL DEFAULT 0,
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Resources (Human and Material) table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- human, material, equipment
    availability TEXT NOT NULL, -- available, occupied, unavailable
    occupancy_rate DOUBLE PRECISION DEFAULT 0,
    details JSONB, -- For storing role, skills, specifications, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Task-Resource assignments
CREATE TABLE task_resources (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id),
    resource_id INTEGER NOT NULL REFERENCES resources(id),
    allocation_percentage DOUBLE PRECISION NOT NULL DEFAULT 100,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Construction materials table
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- gros_oeuvre, second_oeuvre, finition
    unit TEXT NOT NULL, -- kg, m2, m3, piece, etc.
    price DOUBLE PRECISION NOT NULL,
    price_currency TEXT NOT NULL DEFAULT 'TND',
    supplier TEXT,
    brand TEXT,
    description TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Material price history for tracking trends
CREATE TABLE material_price_history (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    price DOUBLE PRECISION NOT NULL,
    price_currency TEXT NOT NULL DEFAULT 'TND',
    effective_date TIMESTAMP NOT NULL,
    supplier TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Real estate market data
CREATE TABLE real_estate_market (
    id SERIAL PRIMARY KEY,
    property_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    price_currency TEXT NOT NULL DEFAULT 'TND',
    area DOUBLE PRECISION,
    rooms TEXT,
    property_type TEXT NOT NULL,
    city TEXT NOT NULL,
    governorate TEXT NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    source TEXT,
    url TEXT,
    scraped_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Material estimation presets
CREATE TABLE estimation_presets (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    project_type TEXT NOT NULL, -- apartment, villa, commercial, etc.
    quality_level TEXT NOT NULL, -- standard, premium, luxe
    wastage_included BOOLEAN NOT NULL DEFAULT true,
    material_ratios JSONB NOT NULL, -- JSON with material requirements per sqm
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Project estimation records
CREATE TABLE project_estimations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    name TEXT NOT NULL,
    area DOUBLE PRECISION NOT NULL,
    floors INTEGER NOT NULL DEFAULT 1,
    project_type TEXT NOT NULL,
    quality_level TEXT NOT NULL,
    wastage_included BOOLEAN NOT NULL DEFAULT true,
    total_cost DOUBLE PRECISION NOT NULL,
    cost_breakdown JSONB NOT NULL,
    materials_list JSONB NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Activity logs
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- project, task, resource, etc.
    entity_id INTEGER,
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- AI analysis results
CREATE TABLE ai_analysis (
    id SERIAL PRIMARY KEY,
    analysis_type TEXT NOT NULL, -- market_trend, cost_estimation, etc.
    input_data JSONB,
    result JSONB NOT NULL,
    provider TEXT NOT NULL, -- ollama, openai, claude, deepseek
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Notification settings
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- task_reminder, deadline_approaching, etc.
    read BOOLEAN NOT NULL DEFAULT false,
    entity_type TEXT, -- project, task, resource, etc.
    entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Chat messages for AI chatbot
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    role TEXT NOT NULL, -- user, assistant
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    session_id TEXT NOT NULL
);

-- Companies/Organizations table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    company_type TEXT NOT NULL, -- contractor, supplier, client, subcontractor
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    governorate TEXT,
    tax_id TEXT,
    registration_number TEXT,
    rating DOUBLE PRECISION DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Suppliers table (specialized for material suppliers)
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name TEXT NOT NULL,
    specialization TEXT, -- cement, steel, wood, electrical, etc.
    delivery_zones JSONB, -- Areas they deliver to
    payment_terms TEXT,
    credit_limit DOUBLE PRECISION,
    delivery_time INTEGER, -- Average delivery time in days
    quality_rating DOUBLE PRECISION DEFAULT 0,
    price_rating DOUBLE PRECISION DEFAULT 0,
    service_rating DOUBLE PRECISION DEFAULT 0,
    is_preferred BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Contractors table (specialized for construction contractors)
CREATE TABLE contractors (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name TEXT NOT NULL,
    specialty TEXT, -- general, electrical, plumbing, masonry, etc.
    license_number TEXT,
    license_expiry TIMESTAMP,
    experience INTEGER, -- Years of experience
    team_size INTEGER,
    equipment JSONB, -- Available equipment
    working_radius DOUBLE PRECISION, -- km radius
    hourly_rate DOUBLE PRECISION,
    project_rate DOUBLE PRECISION,
    quality_rating DOUBLE PRECISION DEFAULT 0,
    timeliness_rating DOUBLE PRECISION DEFAULT 0,
    professionalism_rating DOUBLE PRECISION DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Project documents table
CREATE TABLE project_documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    name TEXT NOT NULL,
    description TEXT,
    document_type TEXT NOT NULL, -- contract, permit, drawing, specification, etc.
    file_path TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    mime_type TEXT,
    version TEXT DEFAULT '1.0',
    uploaded_by INTEGER REFERENCES users(id),
    tags JSONB, -- For categorization and search
    is_public BOOLEAN DEFAULT false,
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Financial transactions table
CREATE TABLE financial_transactions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    transaction_id TEXT NOT NULL UNIQUE,
    transaction_type TEXT NOT NULL, -- payment, expense, refund, advance
    category TEXT NOT NULL, -- materials, labor, equipment, overhead, etc.
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TND',
    payment_method TEXT, -- cash, bank_transfer, check, card
    payee TEXT, -- Who received the payment
    payer TEXT, -- Who made the payment
    invoice_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, cancelled
    due_date TIMESTAMP,
    paid_date TIMESTAMP,
    notes TEXT,
    attachments JSONB, -- Receipt, invoice files
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Budget categories table
CREATE TABLE budget_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES budget_categories(id),
    color TEXT DEFAULT '#3b82f6',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Project budgets table
CREATE TABLE project_budgets (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    category_id INTEGER NOT NULL REFERENCES budget_categories(id),
    budgeted_amount DECIMAL(12, 2) NOT NULL,
    actual_amount DECIMAL(12, 2) DEFAULT 0,
    variance DECIMAL(12, 2) DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'TND',
    notes TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Equipment table
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    equipment_type TEXT NOT NULL, -- excavator, crane, mixer, etc.
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date TIMESTAMP,
    purchase_price DECIMAL(10, 2),
    current_value DECIMAL(10, 2),
    hourly_rate DECIMAL(8, 2),
    daily_rate DECIMAL(8, 2),
    status TEXT NOT NULL DEFAULT 'available', -- available, in_use, maintenance, retired
    location TEXT,
    owner TEXT, -- company, rental, leased
    maintenance_schedule JSONB,
    operating_hours DOUBLE PRECISION DEFAULT 0,
    fuel_type TEXT,
    capacity TEXT,
    specifications JSONB,
    attachments JSONB, -- Photos, manuals, certificates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Equipment assignments table
CREATE TABLE equipment_assignments (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id),
    project_id INTEGER REFERENCES projects(id),
    task_id INTEGER REFERENCES tasks(id),
    assigned_to INTEGER REFERENCES users(id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    actual_start_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    hours_used DOUBLE PRECISION DEFAULT 0,
    cost DECIMAL(10, 2),
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, active, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Inventory table for material tracking
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    project_id INTEGER REFERENCES projects(id),
    location TEXT, -- warehouse, site, etc.
    quantity DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    min_stock_level DOUBLE PRECISION DEFAULT 0,
    max_stock_level DOUBLE PRECISION,
    unit_cost DECIMAL(10, 4),
    total_value DECIMAL(12, 2),
    supplier_id INTEGER REFERENCES suppliers(id),
    batch_number TEXT,
    expiry_date TIMESTAMP,
    last_restocked TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Purchase orders table
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    project_id INTEGER REFERENCES projects(id),
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    order_date TIMESTAMP NOT NULL,
    expected_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, ordered, delivered, cancelled
    total_amount DECIMAL(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TND',
    payment_terms TEXT,
    delivery_address TEXT,
    contact_person TEXT,
    notes TEXT,
    approved_by INTEGER REFERENCES users(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Purchase order items table
CREATE TABLE purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id),
    material_id INTEGER NOT NULL REFERENCES materials(id),
    quantity DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    unit_price DECIMAL(10, 4) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    delivered_quantity DOUBLE PRECISION DEFAULT 0,
    specifications TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Quality inspections table
CREATE TABLE quality_inspections (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    task_id INTEGER REFERENCES tasks(id),
    inspection_type TEXT NOT NULL, -- material, workmanship, safety, compliance
    inspection_date TIMESTAMP NOT NULL,
    inspector INTEGER NOT NULL REFERENCES users(id),
    status TEXT NOT NULL, -- passed, failed, conditional, pending
    score DOUBLE PRECISION, -- Quality score (0-100)
    checklist JSONB, -- Inspection checklist items
    findings TEXT,
    recommendations TEXT,
    action_required TEXT,
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    due_date TIMESTAMP,
    completed_date TIMESTAMP,
    photos JSONB, -- Inspection photos
    documents JSONB, -- Related documents
    follow_up_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Safety incidents table
CREATE TABLE safety_incidents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    incident_date TIMESTAMP NOT NULL,
    incident_type TEXT NOT NULL, -- injury, near_miss, property_damage, environmental
    severity TEXT NOT NULL, -- minor, moderate, major, fatal
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    involved_persons JSONB, -- People involved
    witnesses JSONB,
    root_cause TEXT,
    corrective_actions TEXT,
    preventive_actions TEXT,
    status TEXT NOT NULL DEFAULT 'open', -- open, investigating, resolved, closed
    reported_by INTEGER NOT NULL REFERENCES users(id),
    investigated_by INTEGER REFERENCES users(id),
    work_lost_days INTEGER DEFAULT 0,
    medical_treatment BOOLEAN DEFAULT false,
    photos JSONB,
    documents JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Weather conditions table
CREATE TABLE weather_conditions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    record_date TIMESTAMP NOT NULL,
    temperature DOUBLE PRECISION, -- Celsius
    humidity DOUBLE PRECISION, -- Percentage
    wind_speed DOUBLE PRECISION, -- km/h
    precipitation DOUBLE PRECISION, -- mm
    visibility DOUBLE PRECISION, -- km
    conditions TEXT, -- sunny, cloudy, rainy, windy, etc.
    workability TEXT DEFAULT 'good', -- good, fair, poor, impossible
    impact TEXT, -- Description of impact on work
    delays_minutes INTEGER DEFAULT 0,
    source TEXT DEFAULT 'manual', -- manual, api, sensor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Project milestones table
CREATE TABLE project_milestones (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    name TEXT NOT NULL,
    description TEXT,
    planned_date TIMESTAMP NOT NULL,
    actual_date TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, delayed, cancelled
    importance TEXT DEFAULT 'medium', -- low, medium, high, critical
    deliverables JSONB, -- List of deliverables
    dependencies JSONB, -- Dependent tasks/milestones
    approval_required BOOLEAN DEFAULT false,
    approved_by INTEGER REFERENCES users(id),
    approval_date TIMESTAMP,
    budget DECIMAL(12, 2),
    actual_cost DECIMAL(12, 2),
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Time tracking table
CREATE TABLE time_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    project_id INTEGER REFERENCES projects(id),
    task_id INTEGER REFERENCES tasks(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER, -- Duration in minutes
    work_type TEXT, -- planning, execution, inspection, documentation, etc.
    description TEXT,
    location TEXT,
    is_approved BOOLEAN DEFAULT false,
    approved_by INTEGER REFERENCES users(id),
    hourly_rate DECIMAL(8, 2),
    total_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Client communications table
CREATE TABLE client_communications (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    communication_type TEXT NOT NULL, -- email, call, meeting, site_visit
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    communication_date TIMESTAMP NOT NULL,
    client_contact TEXT,
    our_contact INTEGER REFERENCES users(id),
    status TEXT DEFAULT 'completed', -- completed, follow_up_required, cancelled
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    action_items JSONB,
    follow_up_date TIMESTAMP,
    attachments JSONB,
    tags JSONB,
    is_internal BOOLEAN DEFAULT false,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Project categories table
CREATE TABLE project_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    base_price DECIMAL(12, 2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'm²', -- m², m lineaire, forfait
    complexity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
    duration INTEGER NOT NULL, -- estimated duration in days
    materials JSONB, -- material breakdown percentages
    labor_cost DECIMAL(10, 2),
    project_type TEXT DEFAULT 'construction_neuve', -- construction_neuve, renovation, extension, achat_cle_en_main, amenagement, transformation, rehabilitation_energetique
    tunisian_specifics JSONB, -- climate considerations, local regulations, traditional materials
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Client requests table
CREATE TABLE client_requests (
    id SERIAL PRIMARY KEY,
    request_number TEXT NOT NULL UNIQUE,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_address TEXT,
    category_id INTEGER NOT NULL REFERENCES project_categories(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    area DOUBLE PRECISION NOT NULL,
    floors INTEGER DEFAULT 1,
    budget DECIMAL(12, 2),
    desired_start_date TIMESTAMP,
    priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    status TEXT NOT NULL DEFAULT 'received', -- received, reviewing, quoted, accepted, rejected, expired
    urgency TEXT DEFAULT 'normal', -- normal, urgent, emergency
    quality_level TEXT DEFAULT 'standard', -- standard, premium, luxe
    special_requirements TEXT,
    attachments JSONB, -- photos, plans, documents
    source TEXT DEFAULT 'website', -- website, phone, referral, social_media
    assigned_to INTEGER REFERENCES users(id),
    reviewed_by INTEGER REFERENCES users(id),
    review_date TIMESTAMP,
    review_notes TEXT,
    estimated_cost DECIMAL(12, 2),
    estimated_duration INTEGER, -- in days
    follow_up_date TIMESTAMP,
    expiry_date TIMESTAMP,
    conversion_rate DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Quotations table
CREATE TABLE quotations (
    id SERIAL PRIMARY KEY,
    quotation_number TEXT NOT NULL UNIQUE,
    request_id INTEGER NOT NULL REFERENCES client_requests(id),
    version INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT,
    area DOUBLE PRECISION NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    labor_cost DECIMAL(12, 2) NOT NULL,
    material_cost DECIMAL(12, 2) NOT NULL,
    equipment_cost DECIMAL(12, 2) DEFAULT 0,
    overhead_cost DECIMAL(12, 2) DEFAULT 0,
    profit_margin DOUBLE PRECISION DEFAULT 15, -- percentage
    discount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TND',
    valid_until TIMESTAMP NOT NULL,
    payment_terms TEXT,
    delivery_time INTEGER NOT NULL, -- in days
    warranty_period INTEGER DEFAULT 12, -- in months
    special_conditions TEXT,
    breakdown JSONB NOT NULL, -- detailed cost breakdown
    materials JSONB NOT NULL, -- materials list with quantities and prices
    phases JSONB, -- project phases with timeline
    status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, viewed, accepted, rejected, expired, revised
    sent_date TIMESTAMP,
    viewed_date TIMESTAMP,
    accepted_date TIMESTAMP,
    rejected_date TIMESTAMP,
    rejection_reason TEXT,
    client_feedback TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Active projects table
CREATE TABLE active_projects (
    id SERIAL PRIMARY KEY,
    project_number TEXT NOT NULL UNIQUE,
    quotation_id INTEGER NOT NULL REFERENCES quotations(id),
    original_project_id INTEGER REFERENCES projects(id),
    name TEXT NOT NULL,
    description TEXT,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    location TEXT NOT NULL,
    area DOUBLE PRECISION NOT NULL,
    contract_value DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    remaining_amount DECIMAL(12, 2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    planned_end_date TIMESTAMP NOT NULL,
    actual_end_date TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'planning', -- planning, in_progress, on_hold, completed, cancelled
    progress DOUBLE PRECISION NOT NULL DEFAULT 0,
    current_phase TEXT,
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    risk_level TEXT DEFAULT 'low', -- low, medium, high, critical
    quality_score DOUBLE PRECISION DEFAULT 0,
    client_satisfaction DOUBLE PRECISION DEFAULT 0,
    team_lead INTEGER NOT NULL REFERENCES users(id),
    project_manager INTEGER NOT NULL REFERENCES users(id),
    team_members JSONB, -- array of user IDs
    budget JSONB, -- detailed budget breakdown
    timeline JSONB, -- project timeline with milestones
    risks JSONB, -- identified risks and mitigation plans
    resources JSONB, -- allocated resources
    documents JSONB, -- project documents
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_milestone TIMESTAMP,
    contract_signed_date TIMESTAMP,
    warranty_end_date TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Project phases table
CREATE TABLE project_phases (
    id SERIAL PRIMARY KEY,
    active_project_id INTEGER NOT NULL REFERENCES active_projects(id),
    phase_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    planned_start_date TIMESTAMP NOT NULL,
    planned_end_date TIMESTAMP NOT NULL,
    actual_start_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed, delayed, cancelled
    progress DOUBLE PRECISION NOT NULL DEFAULT 0,
    budget DECIMAL(12, 2) NOT NULL,
    actual_cost DECIMAL(12, 2) DEFAULT 0,
    materials JSONB, -- required materials for this phase
    labor_required JSONB, -- labor requirements
    equipment JSONB, -- required equipment
    deliverables JSONB, -- phase deliverables
    dependencies JSONB, -- dependencies on other phases
    quality_checks JSONB, -- quality control checkpoints
    risks JSONB, -- phase-specific risks
    notes TEXT,
    completion_certificate TEXT,
    approved_by INTEGER REFERENCES users(id),
    approval_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Project updates table
CREATE TABLE project_updates (
    id SERIAL PRIMARY KEY,
    active_project_id INTEGER NOT NULL REFERENCES active_projects(id),
    phase_id INTEGER REFERENCES project_phases(id),
    update_type TEXT NOT NULL, -- progress, issue, milestone, quality, safety, budget, schedule
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, resolved, closed
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    progress DOUBLE PRECISION,
    budget_impact DECIMAL(10, 2) DEFAULT 0,
    schedule_impact INTEGER DEFAULT 0, -- days
    quality_score DOUBLE PRECISION,
    photos JSONB, -- update photos
    documents JSONB, -- related documents
    location TEXT, -- specific location within project
    weather TEXT, -- weather conditions if relevant
    team JSONB, -- team members involved
    materials JSONB, -- materials used/consumed
    equipment JSONB, -- equipment used
    issues JSONB, -- identified issues
    resolutions JSONB, -- resolutions applied
    next_steps TEXT,
    is_client_visible BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    tags JSONB,
    parent_update_id INTEGER REFERENCES project_updates(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    reviewed_by INTEGER REFERENCES users(id),
    review_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    payment_number TEXT NOT NULL UNIQUE,
    active_project_id INTEGER NOT NULL REFERENCES active_projects(id),
    phase_id INTEGER REFERENCES project_phases(id),
    payment_type TEXT NOT NULL, -- advance, progress, milestone, final, retention
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TND',
    percentage DOUBLE PRECISION, -- percentage of total contract
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    paid_date TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled, disputed
    payment_method TEXT, -- cash, bank_transfer, check, card
    reference TEXT, -- bank reference, check number, etc.
    invoice_number TEXT,
    invoice_date TIMESTAMP,
    invoice_path TEXT, -- path to invoice file
    receipt_path TEXT, -- path to receipt file
    bank_account TEXT,
    transaction_id TEXT,
    fees DECIMAL(8, 2) DEFAULT 0,
    taxes DECIMAL(8, 2) DEFAULT 0,
    net_amount DECIMAL(12, 2) NOT NULL,
    client_confirmation BOOLEAN DEFAULT false,
    confirmation_date TIMESTAMP,
    notes TEXT,
    attachments JSONB,
    overdue_reason TEXT,
    follow_up_date TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT false,
    reminder_date TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enhanced project documents table
CREATE TABLE enhanced_project_documents (
    id SERIAL PRIMARY KEY,
    active_project_id INTEGER REFERENCES active_projects(id),
    quotation_id INTEGER REFERENCES quotations(id),
    phase_id INTEGER REFERENCES project_phases(id),
    update_id INTEGER REFERENCES project_updates(id),
    category TEXT NOT NULL, -- contract, permit, drawing, photo, invoice, report, specification
    sub_category TEXT, -- detailed categorization
    name TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    mime_type TEXT,
    version TEXT DEFAULT '1.0',
    is_latest BOOLEAN DEFAULT true,
    previous_version_id INTEGER REFERENCES enhanced_project_documents(id),
    tags JSONB,
    metadata JSONB, -- file metadata
    thumbnail TEXT, -- thumbnail path for images
    is_public BOOLEAN DEFAULT false,
    is_client_visible BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    expiry_date TIMESTAMP,
    password TEXT, -- for protected documents
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approval_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Admin statistics table
CREATE TABLE admin_statistics (
    id SERIAL PRIMARY KEY,
    period TEXT NOT NULL, -- daily, weekly, monthly, quarterly, yearly
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    total_requests INTEGER DEFAULT 0,
    new_requests INTEGER DEFAULT 0,
    quotations_sent INTEGER DEFAULT 0,
    quotations_accepted INTEGER DEFAULT 0,
    quotations_rejected INTEGER DEFAULT 0,
    conversion_rate DOUBLE PRECISION DEFAULT 0,
    active_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    delayed_projects INTEGER DEFAULT 0,
    cancelled_projects INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    pending_payments DECIMAL(12, 2) DEFAULT 0,
    overdue_payments DECIMAL(12, 2) DEFAULT 0,
    average_project_value DECIMAL(12, 2) DEFAULT 0,
    average_project_duration DOUBLE PRECISION DEFAULT 0, -- in days
    client_satisfaction_avg DOUBLE PRECISION DEFAULT 0,
    quality_score_avg DOUBLE PRECISION DEFAULT 0,
    on_time_completion_rate DOUBLE PRECISION DEFAULT 0,
    budget_accuracy_rate DOUBLE PRECISION DEFAULT 0,
    team_utilization_rate DOUBLE PRECISION DEFAULT 0,
    material_cost_trend JSONB,
    project_types_breakdown JSONB,
    location_distribution JSONB,
    seasonal_trends JSONB,
    client_retention_rate DOUBLE PRECISION DEFAULT 0,
    referral_rate DOUBLE PRECISION DEFAULT 0,
    marketing_roi DOUBLE PRECISION DEFAULT 0,
    operational_efficiency DOUBLE PRECISION DEFAULT 0,
    profit_margin_avg DOUBLE PRECISION DEFAULT 0,
    risk_factors JSONB,
    recommendations JSONB,
    kpis JSONB, -- additional custom KPIs
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enhanced notifications table
CREATE TABLE enhanced_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_role TEXT, -- admin, manager, client, team_member
    type TEXT NOT NULL, -- system, project, payment, deadline, alert, reminder, approval
    category TEXT NOT NULL, -- urgent, important, info, warning, error
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    short_message TEXT, -- for mobile/brief notifications
    action_required BOOLEAN DEFAULT false,
    action_url TEXT, -- URL for action button
    action_label TEXT, -- label for action button
    entity_type TEXT, -- project, quotation, payment, request, etc.
    entity_id INTEGER,
    entity_name TEXT, -- name of the related entity
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    scheduled_for TIMESTAMP, -- for scheduled notifications
    expires_at TIMESTAMP, -- when notification becomes irrelevant
    delivery_method JSONB, -- email, sms, push, in_app
    delivery_status JSONB, -- delivery status for each method
    metadata JSONB, -- additional data
    tags JSONB,
    parent_notification_id INTEGER REFERENCES enhanced_notifications(id),
    batch_id TEXT, -- for grouping related notifications
    triggered_by INTEGER REFERENCES users(id),
    acknowledged_by INTEGER REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- System settings table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL, -- general, financial, notifications, security, integrations
    setting_key TEXT NOT NULL UNIQUE,
    setting_name TEXT NOT NULL,
    description TEXT,
    data_type TEXT NOT NULL, -- string, number, boolean, json, encrypted
    value TEXT,
    default_value TEXT,
    options JSONB, -- for select/enum type settings
    validation JSONB, -- validation rules
    is_required BOOLEAN DEFAULT false,
    is_secret BOOLEAN DEFAULT false, -- for sensitive data
    is_user_editable BOOLEAN DEFAULT true,
    requires_restart BOOLEAN DEFAULT false,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users(id),
    version INTEGER DEFAULT 1,
    environment TEXT DEFAULT 'production', -- development, staging, production
    tags JSONB,
    dependencies JSONB, -- settings that depend on this one
    impacts JSONB, -- what this setting affects
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert default admin user
INSERT INTO users (username, password, full_name, email, role) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Uu0QZXaQUQJJ3QWGa', 'Administrator', 'admin@housy.tn', 'admin');

-- Insert default system settings
INSERT INTO system_settings (category, setting_key, setting_name, description, data_type, value, default_value, is_required) VALUES
('general', 'app_name', 'Application Name', 'The name of the application', 'string', 'Housy Tunisia', 'Housy Tunisia', true),
('general', 'app_version', 'Application Version', 'Current version of the application', 'string', '1.0.0', '1.0.0', true),
('general', 'default_currency', 'Default Currency', 'Default currency for the system', 'string', 'TND', 'TND', true),
('general', 'timezone', 'System Timezone', 'Default timezone for the system', 'string', 'Africa/Tunis', 'Africa/Tunis', true);

-- Insert default budget categories
INSERT INTO budget_categories (name, description, color) VALUES
('Matériaux', 'Coûts des matériaux de construction', '#3b82f6'),
('Main d''œuvre', 'Coûts de la main d''œuvre', '#10b981'),
('Équipements', 'Location et achat d''équipements', '#f59e0b'),
('Transport', 'Frais de transport et livraison', '#8b5cf6'),
('Administration', 'Frais administratifs et généraux', '#ef4444');

-- Insert default project categories for Tunisia
INSERT INTO project_categories (name, description, base_price, unit, complexity, duration, project_type, tunisian_specifics) VALUES
('Villa individuelle', 'Construction de villa individuelle standard', 800.00, 'm²', 'medium', 180, 'construction_neuve', '{"climate": "méditerranéen", "materials": ["brique", "béton", "carrelage"], "regulations": "code_construction_tunisien"}'),
('Appartement', 'Construction d''appartement résidentiel', 650.00, 'm²', 'low', 120, 'construction_neuve', '{"climate": "méditerranéen", "materials": ["béton_armé", "carrelage"], "regulations": "code_construction_tunisien"}'),
('Rénovation complète', 'Rénovation complète de bâtiment existant', 500.00, 'm²', 'high', 90, 'renovation', '{"preservation": "patrimoine", "materials": ["pierre_naturelle", "bois_olive"], "permits": "patrimoine_culturel"}'),
('Extension', 'Extension de bâtiment existant', 700.00, 'm²', 'medium', 60, 'extension', '{"integration": "architecture_existante", "materials": ["brique", "béton"], "permits": "urbanisme"}');

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_real_estate_market_city ON real_estate_market(city);
CREATE INDEX idx_real_estate_market_governorate ON real_estate_market(governorate);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_companies_company_type ON companies(company_type);
CREATE INDEX idx_financial_transactions_project_id ON financial_transactions(project_id);
CREATE INDEX idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_equipment_assignments_equipment_id ON equipment_assignments(equipment_id);
CREATE INDEX idx_equipment_assignments_project_id ON equipment_assignments(project_id);
CREATE INDEX idx_inventory_material_id ON inventory(material_id);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_client_requests_status ON client_requests(status);
CREATE INDEX idx_quotations_request_id ON quotations(request_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_active_projects_status ON active_projects(status);
CREATE INDEX idx_active_projects_team_lead ON active_projects(team_lead);
CREATE INDEX idx_project_phases_active_project_id ON project_phases(active_project_id);
CREATE INDEX idx_project_updates_active_project_id ON project_updates(active_project_id);
CREATE INDEX idx_payments_active_project_id ON payments(active_project_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_enhanced_notifications_user_id ON enhanced_notifications(user_id);
CREATE INDEX idx_enhanced_notifications_type ON enhanced_notifications(type);
CREATE INDEX idx_enhanced_notifications_is_read ON enhanced_notifications(is_read);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estimation_presets_updated_at BEFORE UPDATE ON estimation_presets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_estimations_updated_at BEFORE UPDATE ON project_estimations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_documents_updated_at BEFORE UPDATE ON project_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_assignments_updated_at BEFORE UPDATE ON equipment_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_inspections_updated_at BEFORE UPDATE ON quality_inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_safety_incidents_updated_at BEFORE UPDATE ON safety_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON project_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_tracking_updated_at BEFORE UPDATE ON time_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_communications_updated_at BEFORE UPDATE ON client_communications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_categories_updated_at BEFORE UPDATE ON project_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_requests_updated_at BEFORE UPDATE ON client_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_active_projects_updated_at BEFORE UPDATE ON active_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_phases_updated_at BEFORE UPDATE ON project_phases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_updates_updated_at BEFORE UPDATE ON project_updates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enhanced_project_documents_updated_at BEFORE UPDATE ON enhanced_project_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enhanced_notifications_updated_at BEFORE UPDATE ON enhanced_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Log successful setup
INSERT INTO activity_logs (action_type, entity_type, details) VALUES 
('database_setup', 'system', '{"message": "Database housy_tunisia successfully initialized with all tables", "timestamp": "' || CURRENT_TIMESTAMP || '"}');
