# 🐘 PostgreSQL Installation Guide for Housy Tunisia

## Quick Installation Steps

### 1. Download PostgreSQL
- Go to: https://www.postgresql.org/download/windows/
- Download PostgreSQL 15 or 16 (latest stable version)
- Choose the Windows x86-64 installer

### 2. Installation Configuration
During installation, use these settings:
- **Database Superuser Password**: `housy123` (remember this!)
- **Port**: `5432` (default)
- **Locale**: Default
- **Components**: Install all (PostgreSQL Server, pgAdmin, Command Line Tools)

### 3. Post-Installation Database Setup
After installation completes:

```sql
-- Connect to PostgreSQL as postgres user
-- Create the Housy Tunisia database
CREATE DATABASE housy_tunisia 
WITH ENCODING='UTF8' 
LC_COLLATE='C' 
LC_CTYPE='C' 
TEMPLATE=template0;

-- Create a dedicated user for Housy (optional but recommended)
CREATE USER housy_user WITH PASSWORD 'housy_password';
GRANT ALL PRIVILEGES ON DATABASE housy_tunisia TO housy_user;
```

### 4. Update Your .env File
Replace the DATABASE_URL in your .env with:
```
DATABASE_URL=postgresql://postgres:housy123@localhost:5432/housy_tunisia
```

Or if you created a dedicated user:
```
DATABASE_URL=postgresql://housy_user:housy_password@localhost:5432/housy_tunisia
```

### 5. Test the Installation
Run this command in your project directory:
```powershell
npm run db:push
```

## Alternative: Quick Setup with Docker (Optional)
If you prefer Docker:
```powershell
docker run --name housy-postgres -e POSTGRES_PASSWORD=housy123 -e POSTGRES_DB=housy_tunisia -p 5432:5432 -d postgres:15
```

## Troubleshooting
- If port 5432 is in use, change it to 5433 in both PostgreSQL and .env
- Make sure PostgreSQL service is running in Windows Services
- Check Windows Firewall if connection fails

## After Installation
1. Run database migrations: `npm run db:push`
2. Start your application: `npm run dev`
3. Visit: http://localhost:3000
