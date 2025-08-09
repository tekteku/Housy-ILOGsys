# PostgreSQL Installation and Setup Script for Housy Tunisia
# This script will guide you through PostgreSQL installation and database setup

param(
    [switch]$InstallOnly,
    [switch]$SetupDatabase,
    [switch]$TestConnection
)

Write-Host "🐘 PostgreSQL Setup for Housy Tunisia" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Function to check if PostgreSQL is installed
function Test-PostgreSQLInstalled {
    $pgPath = "C:\Program Files\PostgreSQL"
    $pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
    return (Test-Path $pgPath) -or ($pgService -ne $null)
}

# Function to download PostgreSQL installer
function Download-PostgreSQL {
    Write-Host "📥 Downloading PostgreSQL installer..." -ForegroundColor Yellow
    
    $downloadUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.1-1-windows-x64.exe"
    $installerPath = "$env:TEMP\postgresql-installer.exe"
    
    try {
        Write-Host "⏳ This may take a few minutes depending on your internet speed..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "✅ PostgreSQL installer downloaded successfully!" -ForegroundColor Green
        return $installerPath
    } catch {
        Write-Host "❌ Failed to download PostgreSQL installer" -ForegroundColor Red
        Write-Host "Please download manually from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
        return $null
    }
}

# Check if PostgreSQL is already installed
if (Test-PostgreSQLInstalled) {
    Write-Host "✅ PostgreSQL is already installed!" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL not found. Starting installation process..." -ForegroundColor Yellow
    
    if ($InstallOnly -or !$SetupDatabase) {
        Write-Host ""
        Write-Host "📋 MANUAL INSTALLATION STEPS:" -ForegroundColor Cyan
        Write-Host "1. Download PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor White
        Write-Host "2. Choose PostgreSQL 15 or 16 (latest stable version)" -ForegroundColor White
        Write-Host "3. Run the installer as Administrator" -ForegroundColor White
        Write-Host "4. During installation:" -ForegroundColor White
        Write-Host "   - Set password for 'postgres' user: 'housy123' (or remember your choice)" -ForegroundColor White
        Write-Host "   - Port: 5432 (default)" -ForegroundColor White
        Write-Host "   - Locale: Default" -ForegroundColor White
        Write-Host "   - Install pgAdmin (recommended)" -ForegroundColor White
        Write-Host "5. After installation, run this script again with -SetupDatabase" -ForegroundColor White
        Write-Host ""
        
        # Try automatic download
        $installer = Download-PostgreSQL
        if ($installer) {
            Write-Host "🚀 Starting automatic installation..." -ForegroundColor Green
            Write-Host "⚠️  You'll need to provide administrator permissions" -ForegroundColor Yellow
            
            try {
                Start-Process -FilePath $installer -Wait -Verb RunAs
                Write-Host "✅ PostgreSQL installation completed!" -ForegroundColor Green
            } catch {
                Write-Host "❌ Automatic installation failed. Please install manually." -ForegroundColor Red
            }
        }
        
        return
    }
}

# Database setup
if ($SetupDatabase) {
    Write-Host ""
    Write-Host "🏗️ Setting up Housy Tunisia database..." -ForegroundColor Cyan
    
    # Database configuration
    $dbConfig = @{
        Host = "localhost"
        Port = "5432"
        Database = "housy_tunisia"
        Username = "postgres"
        Password = "housy123"  # Change this if you used a different password
    }
    
    Write-Host "📊 Database Configuration:" -ForegroundColor Yellow
    Write-Host "  Host: $($dbConfig.Host)" -ForegroundColor White
    Write-Host "  Port: $($dbConfig.Port)" -ForegroundColor White
    Write-Host "  Database: $($dbConfig.Database)" -ForegroundColor White
    Write-Host "  Username: $($dbConfig.Username)" -ForegroundColor White
    Write-Host ""
    
    # Test PostgreSQL connection
    Write-Host "🔍 Testing PostgreSQL connection..." -ForegroundColor Yellow
    
    $psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
    if (!(Test-Path $psqlPath)) {
        $psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
    }
    if (!(Test-Path $psqlPath)) {
        Write-Host "❌ psql not found. Please ensure PostgreSQL is properly installed." -ForegroundColor Red
        return
    }
    
    # Create database
    Write-Host "📝 Creating Housy Tunisia database..." -ForegroundColor Yellow
    
    $createDbCommand = @"
CREATE DATABASE housy_tunisia 
WITH ENCODING='UTF8' 
LC_COLLATE='French_France.1252' 
LC_CTYPE='French_France.1252' 
TEMPLATE=template0;
"@
    
    # Save command to temp file
    $sqlFile = "$env:TEMP\create_housy_db.sql"
    $createDbCommand | Out-File -FilePath $sqlFile -Encoding UTF8
    
    try {
        # Execute database creation
        $env:PGPASSWORD = $dbConfig.Password
        & $psqlPath -h $dbConfig.Host -p $dbConfig.Port -U $dbConfig.Username -f $sqlFile postgres
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database 'housy_tunisia' created successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Database might already exist or creation failed" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Failed to create database: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Update .env file
    Write-Host "🔧 Updating .env configuration..." -ForegroundColor Yellow
    
    $envPath = ".\.env"
    if (Test-Path $envPath) {
        $newDatabaseUrl = "postgresql://$($dbConfig.Username):$($dbConfig.Password)@$($dbConfig.Host):$($dbConfig.Port)/$($dbConfig.Database)"
        
        $envContent = Get-Content $envPath
        $newEnvContent = @()
        
        foreach ($line in $envContent) {
            if ($line -match "^DATABASE_URL=") {
                $newEnvContent += "DATABASE_URL=$newDatabaseUrl"
                Write-Host "✅ Updated DATABASE_URL in .env" -ForegroundColor Green
            } else {
                $newEnvContent += $line
            }
        }
        
        $newEnvContent | Out-File -FilePath $envPath -Encoding UTF8
    } else {
        Write-Host "⚠️  .env file not found. Creating new one..." -ForegroundColor Yellow
        $envContent = @"
# Database Configuration
DATABASE_URL=postgresql://$($dbConfig.Username):$($dbConfig.Password)@$($dbConfig.Host):$($dbConfig.Port)/$($dbConfig.Database)

# Server Configuration  
PORT=3000
NODE_ENV=development
"@
        $envContent | Out-File -FilePath $envPath -Encoding UTF8
    }
}

# Test connection
if ($TestConnection) {
    Write-Host ""
    Write-Host "🧪 Testing database connection..." -ForegroundColor Cyan
    
    # Test with Node.js
    $testScript = @"
const { Client } = require('pg');

async function testConnection() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:housy123@localhost:5432/housy_tunisia'
    });
    
    try {
        await client.connect();
        console.log('✅ Database connection successful!');
        
        const result = await client.query('SELECT version()');
        console.log('📊 PostgreSQL version:', result.rows[0].version);
        
        await client.end();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

testConnection();
"@
    
    $testFile = "test-db-connection.js"
    $testScript | Out-File -FilePath $testFile -Encoding UTF8
    
    Write-Host "Running database connection test..." -ForegroundColor Yellow
    & "C:\Program Files\nodejs\node.exe" $testFile
    
    Remove-Item $testFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "🎉 PostgreSQL setup completed!" -ForegroundColor Green
Write-Host "📱 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run database migrations: npm run db:push" -ForegroundColor White
Write-Host "2. Start your Housy application: npm run dev" -ForegroundColor White
Write-Host "3. Visit: http://localhost:3000" -ForegroundColor White
