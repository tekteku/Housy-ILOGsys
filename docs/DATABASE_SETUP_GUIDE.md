# Housy Tunisia Database Setup Guide

## Overview

This guide will help you set up the PostgreSQL database for the Housy Tunisia application with all necessary tables and initial data.

## Database Schema

The Housy application uses a comprehensive PostgreSQL database schema with the following main table groups:

### Core Management Tables
- **users** - User accounts and authentication
- **projects** - Construction projects
- **tasks** - Project tasks and assignments
- **resources** - Human and material resources

### Business Management
- **client_requests** - Client project requests
- **quotations** - Project quotations and estimates
- **active_projects** - Active construction projects
- **project_phases** - Project phases and milestones
- **payments** - Payment tracking and invoicing

### Material & Equipment Management
- **materials** - Construction materials catalog
- **material_price_history** - Price tracking
- **equipment** - Equipment inventory
- **equipment_assignments** - Equipment allocations
- **inventory** - Material stock management
- **purchase_orders** - Purchase order management

### Financial Management
- **financial_transactions** - All financial transactions
- **budget_categories** - Budget categorization
- **project_budgets** - Project budget tracking

### Quality & Safety
- **quality_inspections** - Quality control inspections
- **safety_incidents** - Safety incident tracking
- **time_tracking** - Work time tracking

### Vendor Management
- **companies** - Company information
- **suppliers** - Material suppliers
- **contractors** - Construction contractors

### Communication & Documentation
- **client_communications** - Client interaction logs
- **project_documents** - Document management
- **enhanced_project_documents** - Extended document management
- **notifications** - System notifications
- **enhanced_notifications** - Advanced notifications

### Analytics & Reporting
- **admin_statistics** - Administrative KPIs and statistics
- **ai_analysis** - AI analysis results
- **activity_logs** - System activity logging
- **real_estate_market** - Market data

### Configuration
- **system_settings** - Application configuration
- **project_categories** - Project type categories
- **estimation_presets** - Cost estimation templates

## Prerequisites

### Required Software

1. **Docker and Docker Compose** (Recommended)
   - Docker Desktop for Windows
   - Or native Docker installation

2. **PostgreSQL Client Tools**
   - Install PostgreSQL client (psql)
   - Or use pgAdmin for GUI management

3. **Node.js and npm**
   - Node.js 18+ required
   - npm or yarn package manager

### Environment Variables

Create a `.env` file (or use the provided `.env.development`):

```env
DATABASE_URL=postgresql://postgres:0000@localhost:5433/housy_tunisia
POSTGRES_DB=housy_tunisia
POSTGRES_USER=postgres
POSTGRES_PASSWORD=0000
NODE_ENV=development
```

## Setup Methods

### Method 1: Automated Setup with Docker (Recommended)

1. **Start the database container:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d postgres-dev
   ```

2. **Run the database setup script:**
   
   **On Windows (PowerShell):**
   ```powershell
   .\setup-database.ps1
   ```
   
   **On Linux/Mac:**
   ```bash
   chmod +x setup-database.sh
   ./setup-database.sh
   ```

3. **Verify the setup:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs postgres-dev
   ```

### Method 2: Manual Database Setup

1. **Start PostgreSQL:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d postgres-dev
   ```

2. **Connect to PostgreSQL:**
   ```bash
   psql -h localhost -p 5433 -U postgres -d postgres
   ```

3. **Create the database:**
   ```sql
   CREATE DATABASE housy_tunisia;
   \q
   ```

4. **Initialize the schema:**
   ```bash
   psql -h localhost -p 5433 -U postgres -d housy_tunisia -f migrations/init_housy_tunisia.sql
   ```

### Method 3: Using Drizzle ORM

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate migrations:**
   ```bash
   npm run db:generate
   ```

3. **Push schema to database:**
   ```bash
   npm run db:push
   ```

## Database Configuration

### Connection Settings

| Environment | Host | Port | Database | User | Password |
|-------------|------|------|----------|------|----------|
| Development | localhost | 5433 | housy_tunisia | postgres | 0000 |
| Production | postgres | 5432 | housy_tunisia | postgres | 0000 |

### Default Admin User

After setup, you can log in with:
- **Username:** `admin`
- **Password:** `admin` (change immediately after first login)

## Verification

### Check Database Tables

```sql
-- Connect to the database
\c housy_tunisia

-- List all tables
\dt

-- Check user table
SELECT * FROM users;

-- Check system settings
SELECT * FROM system_settings;
```

### Application Health Check

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Check database connection:**
   - Application should start without database errors
   - Admin panel should be accessible
   - You should be able to log in with admin credentials

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5433
   ```
   **Solution:** Ensure PostgreSQL container is running:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d postgres-dev
   ```

2. **Permission Denied**
   ```
   ERROR: permission denied for database housy_tunisia
   ```
   **Solution:** Check user permissions and password

3. **Schema Already Exists**
   ```
   ERROR: relation "users" already exists
   ```
   **Solution:** Drop and recreate database or use migration scripts

4. **Port Already in Use**
   ```
   Error: Port 5433 is already in use
   ```
   **Solution:** Stop existing PostgreSQL instances or change port

### Manual Cleanup

If you need to start fresh:

```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Remove volumes (WARNING: This will delete all data)
docker volume rm housy-ilogsys-main_postgres_dev_data

# Start fresh
docker-compose -f docker-compose.dev.yml up -d postgres-dev
./setup-database.ps1  # or ./setup-database.sh
```

## Data Management

### Backup Database

```bash
# Create backup
pg_dump -h localhost -p 5433 -U postgres -d housy_tunisia > backup.sql

# With Docker
docker exec housy-postgres-dev pg_dump -U postgres housy_tunisia > backup.sql
```

### Restore Database

```bash
# Restore from backup
psql -h localhost -p 5433 -U postgres -d housy_tunisia < backup.sql

# With Docker
docker exec -i housy-postgres-dev psql -U postgres housy_tunisia < backup.sql
```

## Development Workflow

1. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   npm run dev
   ```

2. **Make schema changes:**
   - Edit `shared/schema.ts`
   - Generate migration: `npm run db:generate`
   - Apply changes: `npm run db:push`

3. **Add test data:**
   - Use admin panel to add initial data
   - Or create seed scripts

## Production Deployment

For production deployment, use the main `docker-compose.yml`:

```bash
# Set environment variables
export POSTGRES_PASSWORD=your_secure_password
export JWT_SECRET=your_jwt_secret

# Deploy
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs
```

## Support

If you encounter issues:

1. Check the application logs
2. Verify Docker container status
3. Ensure all environment variables are set
4. Check PostgreSQL connection manually
5. Review the troubleshooting section above

## Database Maintenance

### Regular Tasks

1. **Monitor disk usage**
2. **Regular backups**
3. **Update statistics:** `ANALYZE;`
4. **Vacuum database:** `VACUUM;`
5. **Monitor slow queries**

### Performance Optimization

The schema includes optimized indexes for:
- User lookups
- Project queries
- Financial transactions
- Material searches
- Geographic queries

Additional indexes can be added based on usage patterns.

---

**Happy coding with Housy Tunisia! 🏠🇹🇳**
