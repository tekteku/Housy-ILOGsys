# PostgreSQL Installation Checklist for Housy Tunisia
# Follow this exactly during installation

## Installation Settings (IMPORTANT):
✓ Installation Directory: C:\Program Files\PostgreSQL\16 (or 15)
✓ Data Directory: C:\Program Files\PostgreSQL\16\data
✓ Database Superuser: postgres
✓ Password: housy123
✓ Port: 5432
✓ Locale: Default [Default locale]

## Components to Install (Select ALL):
✓ PostgreSQL Server
✓ pgAdmin 4 (Database management tool)
✓ Stack Builder (Package manager)
✓ Command Line Tools

## After Installation:
✓ Start PostgreSQL service automatically
✓ Launch Stack Builder (you can skip this for now)

## Post-Installation Commands:
1. Open Command Prompt or PowerShell as Administrator
2. Navigate to: C:\Program Files\PostgreSQL\16\bin
3. Run: psql -U postgres
4. Enter password: housy123
5. Create database: CREATE DATABASE housy_tunisia;

## Verification:
✓ PostgreSQL service running in Windows Services
✓ Can connect with pgAdmin
✓ Can connect via command line
✓ Port 5432 is accessible
