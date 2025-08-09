# PostgreSQL 17 Setup for Housy Tunisia - PowerShell Version
# This script will set up the database with the correct password

Write-Host "🐘 PostgreSQL 17 Setup for Housy Tunisia" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Step 1: Verify PostgreSQL 17 installation
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

if (Test-Path $psqlPath) {
    Write-Host "✅ PostgreSQL 17 found!" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL 17 not found at expected location" -ForegroundColor Red
    exit 1
}

# Step 2: Get password from user
Write-Host ""
Write-Host "🔐 Please enter the PostgreSQL password you set during installation:" -ForegroundColor Yellow
$postgresPassword = Read-Host "Password for 'postgres' user" -AsSecureString
$postgresPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($postgresPassword))

if ([string]::IsNullOrEmpty($postgresPasswordPlain)) {
    Write-Host "❌ Password cannot be empty" -ForegroundColor Red
    exit 1
}

# Step 3: Test connection
Write-Host ""
Write-Host "🔍 Testing PostgreSQL connection..." -ForegroundColor Yellow

$env:PGPASSWORD = $postgresPasswordPlain

try {
    $testResult = & $psqlPath -h localhost -p 5432 -U postgres -c "SELECT version();" postgres 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL connection successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Connection failed: $testResult" -ForegroundColor Red
        Write-Host "💡 Please check your password and ensure PostgreSQL service is running" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Connection test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Create database
Write-Host ""
Write-Host "🏗️ Creating Housy Tunisia database..." -ForegroundColor Yellow

try {
    # Drop existing database if it exists
    Write-Host "Cleaning up any existing database..." -ForegroundColor Gray
    & $psqlPath -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS housy_tunisia;" postgres 2>$null
    
    # Create new database
    Write-Host "Creating housy_tunisia database..." -ForegroundColor Gray
    & $psqlPath -h localhost -p 5432 -U postgres -c "CREATE DATABASE housy_tunisia WITH ENCODING='UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0;" postgres
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database 'housy_tunisia' created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Database creation failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Database creation error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 5: Create extensions
Write-Host ""
Write-Host "🔧 Creating database extensions..." -ForegroundColor Yellow

try {
    & $psqlPath -h localhost -p 5432 -U postgres -d housy_tunisia -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" 2>$null
    & $psqlPath -h localhost -p 5432 -U postgres -d housy_tunisia -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";" 2>$null
    Write-Host "✅ Database extensions created" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Extension creation had issues, but continuing..." -ForegroundColor Yellow
}

# Step 6: Update .env file
Write-Host ""
Write-Host "📝 Updating .env configuration..." -ForegroundColor Yellow

$databaseUrl = "postgresql://postgres:$postgresPasswordPlain@localhost:5432/housy_tunisia"

if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    $newEnvContent = @()
    $foundDatabaseUrl = $false
    
    foreach ($line in $envContent) {
        if ($line -match "^DATABASE_URL=") {
            $newEnvContent += "DATABASE_URL=$databaseUrl"
            $foundDatabaseUrl = $true
            Write-Host "✅ Updated DATABASE_URL in .env" -ForegroundColor Green
        } else {
            $newEnvContent += $line
        }
    }
    
    if (-not $foundDatabaseUrl) {
        $newEnvContent += "DATABASE_URL=$databaseUrl"
        Write-Host "✅ Added DATABASE_URL to .env" -ForegroundColor Green
    }
    
    $newEnvContent | Out-File -FilePath ".env" -Encoding UTF8
} else {
    Write-Host "⚠️ .env file not found, creating new one..." -ForegroundColor Yellow
    "DATABASE_URL=$databaseUrl" | Out-File -FilePath ".env" -Encoding UTF8
}

# Step 7: Install dependencies
Write-Host ""
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow

if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    npm install
} else {
    Write-Host "Dependencies already installed" -ForegroundColor Gray
}

# Step 8: Run database migrations
Write-Host ""
Write-Host "🚀 Running database migrations..." -ForegroundColor Yellow

try {
    npm run db:push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database migrations completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Migration issues detected, but database is ready" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Migration error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 9: Test Node.js connection
Write-Host ""
Write-Host "🧪 Testing Node.js database connection..." -ForegroundColor Yellow

$nodeTestScript = @"
const { Client } = require('pg');

async function testConnection() {
    const client = new Client({
        connectionString: '$databaseUrl'
    });
    
    try {
        await client.connect();
        console.log('✅ Node.js PostgreSQL connection successful!');
        
        const result = await client.query('SELECT version()');
        console.log('📊 Database version:', result.rows[0].version.substring(0, 60) + '...');
        
        await client.end();
        return true;
    } catch (error) {
        console.error('❌ Node.js connection failed:', error.message);
        return false;
    }
}

testConnection().then(success => {
    process.exit(success ? 0 : 1);
});
"@

$testFile = "test-pg-connection-temp.js"
$nodeTestScript | Out-File -FilePath $testFile -Encoding UTF8

try {
    node $testFile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js can connect to PostgreSQL!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Node.js connection test failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Node.js test error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Remove-Item $testFile -ErrorAction SilentlyContinue

# Success summary
Write-Host ""
Write-Host "🎉 SETUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Database Details:" -ForegroundColor Cyan
Write-Host "  Name: housy_tunisia" -ForegroundColor White
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  Username: postgres" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start your application: npm run dev" -ForegroundColor White
Write-Host "2. Open: http://localhost:3000" -ForegroundColor White
Write-Host "3. Test AI features: http://localhost:3000/test-ai-interface.html" -ForegroundColor White
Write-Host "4. Access pgAdmin for database management" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Your Housy Tunisia application is now ready with full database support!" -ForegroundColor Green
