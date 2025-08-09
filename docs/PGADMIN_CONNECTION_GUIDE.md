# 🔧 pgAdmin Connection Guide for Housy Tunisia Database

## Connection Issue Resolution

If you can't see tables in pgAdmin, it's likely due to incorrect connection settings. Here are the correct configurations:

## 📋 pgAdmin Connection Settings

### **For Development Database (Docker):**

**When Docker containers are running:**

```
Connection Name: Housy Tunisia Development
Host: localhost
Port: 5433
Database: housy_tunisia
Username: postgres
Password: 0000
```

### **For Local PostgreSQL Installation:**

**If you have PostgreSQL installed locally:**

```
Connection Name: Housy Tunisia Local
Host: localhost
Port: 5432
Database: housy_tunisia
Username: postgres
Password: 0000
```

## 🚀 Step-by-Step Setup

### Step 1: Start Docker Containers

```powershell
# Start Docker Desktop first, then run:
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Verify it's running:
docker ps
```

### Step 2: Create pgAdmin Connection

1. **Open pgAdmin**
2. **Right-click "Servers" → "Register" → "Server"**
3. **General Tab:**
   - Name: `Housy Tunisia Development`

4. **Connection Tab:**
   - Host name/address: `localhost`
   - Port: `5433` (for Docker) or `5432` (for local)
   - Maintenance database: `housy_tunisia`
   - Username: `postgres`
   - Password: `0000`

5. **Click "Save"**

### Step 3: Verify Connection

After connecting, you should see:
- Database: `housy_tunisia`
- Schemas → public → Tables (43 tables)

## 🔍 Troubleshooting

### Issue 1: "Server doesn't exist" or Connection Failed

**Solution A: Check Docker Container**
```powershell
# Check if container is running
docker ps --filter "name=postgres"

# If not running, start it
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Check logs
docker logs housy-postgres-dev
```

**Solution B: Verify Port**
```powershell
# Check what's running on port 5433
netstat -an | findstr 5433
```

### Issue 2: Database Exists but No Tables Visible

**Check correct database:**
1. In pgAdmin, make sure you're connected to `housy_tunisia` database
2. Expand: Servers → Your Connection → Databases → housy_tunisia → Schemas → public → Tables

**Verify via Command Line:**
```powershell
# Connect directly (requires psql)
psql -h localhost -p 5433 -U postgres -d housy_tunisia

# List tables
\dt

# Exit
\q
```

### Issue 3: Wrong Database Connected

If you see a different database (like `postgres`, `Housy`, etc.):
1. Right-click your server connection
2. Select "Properties"
3. Go to "Connection" tab
4. Change "Maintenance database" to `housy_tunisia`
5. Save and reconnect

## 📊 Expected Tables (43 total)

When properly connected, you should see these tables:

### Core Management:
- `users` - User accounts
- `projects` - Project management
- `tasks` - Task assignments
- `resources` - Resource allocation

### Business Operations:
- `client_requests` - Client inquiries
- `quotations` - Project quotations
- `active_projects` - Running projects
- `payments` - Payment tracking

### Materials & Equipment:
- `materials` - Material catalog
- `suppliers` - Supplier management
- `equipment` - Equipment tracking
- `inventory` - Stock management

### Quality & Safety:
- `quality_inspections` - Quality control
- `safety_incidents` - Safety tracking
- `project_milestones` - Milestone tracking

### Analytics & Communication:
- `admin_statistics` - Business KPIs
- `notifications` - System alerts
- `chat_messages` - AI chat history
- `activity_logs` - Audit trail

...and 24 more specialized tables.

## 🔧 Alternative: Direct Database Access

### Using Command Line (psql):

```powershell
# Install PostgreSQL client tools if not available
# Then connect:
psql -h localhost -p 5433 -U postgres -d housy_tunisia

# List all tables:
\dt

# Describe a specific table:
\d users

# Sample query:
SELECT * FROM users;
SELECT COUNT(*) FROM project_categories;
```

### Using VS Code with PostgreSQL Extension:

1. Install "PostgreSQL" extension in VS Code
2. Create connection with same settings above
3. Browse database structure visually

## 🚨 Common Mistakes to Avoid

1. **Wrong Port**: Using 5432 instead of 5433 for Docker
2. **Wrong Database**: Connecting to `postgres` instead of `housy_tunisia`
3. **Docker Not Running**: Make sure Docker Desktop is started
4. **Case Sensitivity**: Use exact database name `housy_tunisia`

## ✅ Quick Verification Script

Run this PowerShell script to verify everything is working:

```powershell
# Check Docker container status
docker ps --filter "name=postgres" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test database connection (requires psql)
$env:PGPASSWORD = "0000"
psql -h localhost -p 5433 -U postgres -d housy_tunisia -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"

# Check admin user
psql -h localhost -p 5433 -U postgres -d housy_tunisia -c "SELECT username, email FROM users WHERE role = 'admin';"
```

Expected output:
- Container status: Up and healthy
- Table count: 43
- Admin user: admin, admin@housy.tn

## 📞 Need Help?

If you're still having issues:

1. **Check Docker Desktop** is running
2. **Verify port 5433** is not blocked by firewall
3. **Ensure database name** is exactly `housy_tunisia`
4. **Try connecting via command line** first to isolate the issue

The database is fully set up with 43 tables and ready for use! 🎉
