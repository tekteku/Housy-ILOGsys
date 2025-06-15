# 🔍 **SQL QUERY EXAMPLES for Housy Tunisia Database**

## 📋 **Basic Verification Queries**

### **1. Check All Tables**
```sql
-- List all tables in your database
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### **2. Count Tables**
```sql
-- Count total tables (should be 43)
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### **3. Check Database Info**
```sql
-- Confirm you're in the right database
SELECT current_database() as database_name, 
       current_user as username,
       version() as postgresql_version;
```

## 👤 **User Management Queries**

### **4. View All Users**
```sql
-- See all users in the system
SELECT id, username, full_name, email, role, 
       created_at, is_active 
FROM users;
```

### **5. Check Admin User**
```sql
-- Find admin users
SELECT username, full_name, email, role, created_at
FROM users 
WHERE role = 'admin';
```

### **6. Add a Test User**
```sql
-- Create a new test user
INSERT INTO users (username, full_name, email, password_hash, role, is_active)
VALUES ('testuser', 'Test User', 'test@housy.tn', 'hashed_password', 'user', true);
```

## 🏗️ **Project Management Queries**

### **7. View Project Categories**
```sql
-- See all project categories
SELECT id, name, description, base_price, unit, 
       complexity, duration, is_active
FROM project_categories;
```

### **8. Create a Sample Project**
```sql
-- Add a new construction project
INSERT INTO projects (name, description, category_id, status, start_date, estimated_end_date, total_budget, client_name, client_email, client_phone, location, created_by)
VALUES (
    'Villa Moderne Tunis',
    'Construction d''une villa moderne de 200m² à Tunis',
    1, -- category_id from project_categories
    'planning',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '120 days',
    150000.00,
    'Ahmed Ben Ali',
    'ahmed@example.tn',
    '+216 12 345 678',
    'Tunis, Tunisia',
    1 -- user_id of admin
);
```

### **9. View All Projects**
```sql
-- List all projects with details
SELECT p.id, p.name, p.description, p.status, 
       p.start_date, p.estimated_end_date, p.total_budget,
       p.client_name, p.location,
       pc.name as category_name,
       u.username as created_by_user
FROM projects p
JOIN project_categories pc ON p.category_id = pc.id
JOIN users u ON p.created_by = u.id
ORDER BY p.created_at DESC;
```

## 💰 **Financial Queries**

### **10. System Settings (Currency, etc.)**
```sql
-- View system configuration
SELECT setting_key, setting_name, value, description
FROM system_settings;
```

### **11. Add a Sample Quotation**
```sql
-- Create a quotation for a project
INSERT INTO quotations (project_id, quotation_number, total_amount, status, valid_until, notes, created_by)
VALUES (
    1, -- project_id from projects table
    'QUO-2025-001',
    125000.00,
    'draft',
    CURRENT_DATE + INTERVAL '30 days',
    'Devis pour villa moderne - matériaux de qualité',
    1 -- user_id
);
```

### **12. View Financial Summary**
```sql
-- Get financial overview
SELECT 
    (SELECT COUNT(*) FROM quotations) as total_quotations,
    (SELECT COALESCE(SUM(total_amount), 0) FROM quotations WHERE status = 'approved') as approved_quotations_value,
    (SELECT COUNT(*) FROM projects) as total_projects,
    (SELECT COALESCE(SUM(total_budget), 0) FROM projects) as total_projects_budget;
```

## 📊 **Materials and Inventory**

### **13. Add Sample Materials**
```sql
-- Add construction materials
INSERT INTO materials (name, description, unit, base_price, category, supplier_info, is_active)
VALUES 
    ('Ciment Portland', 'Ciment de haute qualité', 'sac', 12.50, 'Matériaux de base', 'Fournisseur local', true),
    ('Brique rouge', 'Brique de construction standard', 'unité', 0.85, 'Maçonnerie', 'Briqueterie Tunis', true),
    ('Carrelage céramique', 'Carrelage intérieur 30x30cm', 'm²', 25.00, 'Finitions', 'Céramique Sousse', true);
```

### **14. View Materials Catalog**
```sql
-- List all materials with prices
SELECT id, name, description, unit, base_price, 
       category, supplier_info
FROM materials 
WHERE is_active = true
ORDER BY category, name;
```

### **15. Inventory Status**
```sql
-- Check inventory levels
SELECT m.name as material_name, 
       m.unit,
       COALESCE(i.quantity_in_stock, 0) as stock_quantity,
       COALESCE(i.minimum_stock_level, 0) as minimum_level,
       CASE 
         WHEN COALESCE(i.quantity_in_stock, 0) <= COALESCE(i.minimum_stock_level, 0) 
         THEN 'STOCK BAS' 
         ELSE 'OK' 
       END as stock_status
FROM materials m
LEFT JOIN inventory i ON m.id = i.material_id
ORDER BY stock_status DESC, m.name;
```

## 📅 **Project Planning Queries**

### **16. Add Project Tasks**
```sql
-- Create tasks for a project
INSERT INTO tasks (project_id, name, description, status, priority, estimated_duration, assigned_to, created_by)
VALUES 
    (1, 'Préparation du terrain', 'Nettoyage et nivellement du terrain', 'pending', 'high', 5, 1, 1),
    (1, 'Fondations', 'Creusage et coulage des fondations', 'pending', 'high', 10, 1, 1),
    (1, 'Gros œuvre', 'Construction des murs porteurs', 'pending', 'medium', 30, 1, 1);
```

### **17. View Project Progress**
```sql
-- Project status with task progress
SELECT p.name as project_name,
       p.status as project_status,
       COUNT(t.id) as total_tasks,
       COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
       COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as active_tasks,
       ROUND(
         (COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(t.id), 0)), 2
       ) as completion_percentage
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.id, p.name, p.status
ORDER BY p.created_at DESC;
```

## 🔍 **Advanced Analytics Queries**

### **18. Monthly Project Summary**
```sql
-- Projects created by month
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as projects_created,
    SUM(total_budget) as total_budget_month,
    AVG(total_budget) as average_budget
FROM projects
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### **19. Client Communication Log**
```sql
-- Recent client communications
SELECT cc.communication_date,
       cc.communication_type,
       cc.subject,
       cc.notes,
       p.name as project_name,
       p.client_name
FROM client_communications cc
JOIN projects p ON cc.project_id = p.id
ORDER BY cc.communication_date DESC
LIMIT 10;
```

### **20. System Activity Log**
```sql
-- Recent system activities
SELECT action_type, 
       details,
       performed_at,
       user_id
FROM activity_logs
ORDER BY performed_at DESC
LIMIT 20;
```

## 🔧 **Database Maintenance Queries**

### **21. Table Sizes**
```sql
-- Check table sizes
SELECT schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **22. Recent Data Activity**
```sql
-- Check which tables have recent data
SELECT 'users' as table_name, COUNT(*) as record_count, MAX(created_at) as latest_record FROM users
UNION ALL
SELECT 'projects', COUNT(*), MAX(created_at) FROM projects
UNION ALL
SELECT 'quotations', COUNT(*), MAX(created_at) FROM quotations
UNION ALL
SELECT 'materials', COUNT(*), MAX(created_at) FROM materials
ORDER BY latest_record DESC NULLS LAST;
```

## 🚀 **Quick Test Suite**

### **23. Complete Database Test**
```sql
-- Run this to test everything is working
DO $$
DECLARE
    table_count INTEGER;
    user_count INTEGER;
    setting_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    -- Count users
    SELECT COUNT(*) INTO user_count FROM users;
    
    -- Count settings
    SELECT COUNT(*) INTO setting_count FROM system_settings;
    
    -- Display results
    RAISE NOTICE 'Database Test Results:';
    RAISE NOTICE 'Tables: %', table_count;
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Settings: %', setting_count;
    
    IF table_count = 43 AND user_count >= 1 AND setting_count >= 4 THEN
        RAISE NOTICE 'SUCCESS: Database is properly set up!';
    ELSE
        RAISE NOTICE 'WARNING: Database might be incomplete';
    END IF;
END $$;
```

## 📝 **How to Use These Queries:**

1. **Open pgAdmin**
2. **Connect to your database** (`housy_tunisia` on port 5432)
3. **Right-click on your database** → **Query Tool**
4. **Copy and paste any query above**
5. **Click the Execute button** (⚡)

## 🎯 **Start with These Essential Queries:**

1. **Query #1** - Verify all tables exist
2. **Query #4** - Check users  
3. **Query #7** - View project categories
4. **Query #10** - Check system settings
5. **Query #23** - Complete database test

**These queries will prove your database is working perfectly!** 🎉
