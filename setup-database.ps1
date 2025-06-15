# Housy Tunisia Database Setup Script for Windows PowerShell
# This script sets up the PostgreSQL database for the Housy application

param(
    [string]$DbHost = "localhost",
    [string]$DbPort = "5433",
    [string]$DbName = "housy_tunisia",
    [string]$DbUser = "postgres",
    [string]$DbPassword = "0000"
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$InfoColor = "Cyan"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $SuccessColor
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $WarningColor
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $ErrorColor
}

function Check-PostgreSQL {
    Write-Status "Checking PostgreSQL connection..."
    
    # Check if psql is available
    try {
        $null = Get-Command psql -ErrorAction Stop
    }
    catch {
        Write-Error "PostgreSQL client (psql) is not installed or not in PATH"
        Write-Warning "Please install PostgreSQL client tools or add them to your PATH"
        exit 1
    }
    
    # Set environment variable for password
    $env:PGPASSWORD = $DbPassword
    
    # Try to connect to PostgreSQL
    try {
        $result = & psql -h $DbHost -p $DbPort -U $DbUser -d postgres -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Connection failed"
        }
        Write-Success "PostgreSQL connection established"
    }
    catch {
        Write-Error "Cannot connect to PostgreSQL. Make sure the database is running and accessible."
        Write-Warning "If using Docker, run: docker-compose -f docker-compose.dev.yml up -d postgres-dev"
        exit 1
    }
}

function Create-Database {
    Write-Status "Creating database '$DbName' if it doesn't exist..."
    
    # Check if database exists
    $env:PGPASSWORD = $DbPassword
    $dbExists = & psql -h $DbHost -p $DbPort -U $DbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DbName'" 2>$null
    
    if ($dbExists -ne "1") {
        Write-Status "Database '$DbName' does not exist. Creating..."
        try {
            & psql -h $DbHost -p $DbPort -U $DbUser -d postgres -c "CREATE DATABASE $DbName;" | Out-Null
            Write-Success "Database '$DbName' created successfully"
        }
        catch {
            Write-Error "Failed to create database '$DbName'"
            exit 1
        }
    }
    else {
        Write-Warning "Database '$DbName' already exists"
    }
}

function Initialize-Schema {
    Write-Status "Initializing database schema..."
    
    $schemaFile = "migrations\init_housy_tunisia.sql"
    if (Test-Path $schemaFile) {
        try {
            $env:PGPASSWORD = $DbPassword
            & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $schemaFile | Out-Null
            Write-Success "Database schema initialized successfully"
        }
        catch {
            Write-Error "Failed to initialize database schema"
            exit 1
        }
    }
    else {
        Write-Error "Schema file '$schemaFile' not found"
        exit 1
    }
}

function Run-Migrations {
    Write-Status "Running additional migrations..."
    
    # Get all migration files in order
    $migrationFiles = Get-ChildItem -Path "migrations" -Filter "0*.sql" | Sort-Object Name
    
    foreach ($migrationFile in $migrationFiles) {
        if ($migrationFile.Name -ne "init_housy_tunisia.sql") {
            Write-Status "Running migration: $($migrationFile.Name)"
            try {
                $env:PGPASSWORD = $DbPassword
                & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $migrationFile.FullName | Out-Null
                Write-Success "Migration $($migrationFile.Name) completed"
            }
            catch {
                Write-Warning "Migration $($migrationFile.Name) failed or already applied"
            }
        }
    }
}

function Verify-Setup {
    Write-Status "Verifying database setup..."
    
    try {
        $env:PGPASSWORD = $DbPassword
        $tableCount = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>$null
        
        if ([int]$tableCount -gt 0) {
            Write-Success "Database setup verified. Found $tableCount tables."
            
            # List some key tables
            Write-Status "Key tables found:"
            & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'projects', 'client_requests', 'quotations', 'active_projects') ORDER BY tablename;"
        }
        else {
            Write-Error "Database setup verification failed. No tables found."
            exit 1
        }
    }
    catch {
        Write-Error "Failed to verify database setup"
        exit 1
    }
}

function Check-AdminUser {
    Write-Status "Checking admin user..."
    
    try {
        $env:PGPASSWORD = $DbPassword
        $adminCount = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -tAc "SELECT COUNT(*) FROM users WHERE username = 'admin';" 2>$null
        
        if ([int]$adminCount -eq 1) {
            Write-Success "Admin user exists"
            Write-Status "Default admin credentials:"
            Write-Host "  Username: admin" -ForegroundColor White
            Write-Host "  Password: admin (please change this after first login)" -ForegroundColor White
        }
        else {
            Write-Warning "Admin user not found or multiple admin users exist"
        }
    }
    catch {
        Write-Warning "Could not check admin user status"
    }
}

# Main execution
function Main {
    Write-Host "`n🏠 " -NoNewline -ForegroundColor $InfoColor
    Write-Host "Housy Tunisia Database Setup" -ForegroundColor $InfoColor
    Write-Host ""
    
    Check-PostgreSQL
    Create-Database
    Initialize-Schema
    Run-Migrations
    Verify-Setup
    Check-AdminUser
    
    Write-Host "`n✅ " -NoNewline -ForegroundColor $SuccessColor
    Write-Host "Database setup completed successfully!" -ForegroundColor $SuccessColor
    Write-Host "`n📋 " -NoNewline -ForegroundColor $InfoColor
    Write-Host "Next steps:" -ForegroundColor $InfoColor
    Write-Host "   1. Update your .env file with the database URL:"
    Write-Host "      DATABASE_URL=postgresql://$DbUser`:$DbPassword@$DbHost`:$DbPort/$DbName"
    Write-Host "   2. Start the application with: npm run dev"
    Write-Host "   3. Access the admin panel and change the default password"
    Write-Host "`n🚀 " -NoNewline -ForegroundColor $SuccessColor
    Write-Host "Happy coding!" -ForegroundColor $SuccessColor
    Write-Host ""
}

# Clean up environment variable on exit
try {
    Main
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
