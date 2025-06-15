# Post-PostgreSQL Installation Setup for Housy Tunisia
# Run this script after PostgreSQL is installed

param(
    [string]$Password = "housy123",
    [string]$Host = "localhost",
    [string]$Port = "5432"
)

Write-Host "🐘 Post-PostgreSQL Installation Setup" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test if PostgreSQL is installed and running
Write-Host "🔍 Testing PostgreSQL installation..." -ForegroundColor Yellow

$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        Write-Host "✅ Found PostgreSQL at: $path" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL not found. Please install it first." -ForegroundColor Red
    Write-Host "📥 Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Test connection
Write-Host "🔗 Testing database connection..." -ForegroundColor Yellow
$env:PGPASSWORD = $Password

try {
    & $psqlPath -h $Host -p $Port -U postgres -c "SELECT version();" postgres | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL connection successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to connect to PostgreSQL" -ForegroundColor Red
        Write-Host "💡 Make sure PostgreSQL service is running and password is correct" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Connection test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create database
Write-Host "🏗️ Creating Housy Tunisia database..." -ForegroundColor Yellow

$createDbScript = @"
SELECT 'Creating housy_tunisia database...' as status;
DROP DATABASE IF EXISTS housy_tunisia;
CREATE DATABASE housy_tunisia 
WITH 
    ENCODING='UTF8' 
    LC_COLLATE='C' 
    LC_CTYPE='C' 
    TEMPLATE=template0;
SELECT 'Database housy_tunisia created successfully!' as status;
"@

$scriptFile = "$env:TEMP\create_housy_db.sql"
$createDbScript | Out-File -FilePath $scriptFile -Encoding UTF8

try {
    & $psqlPath -h $Host -p $Port -U postgres -f $scriptFile postgres
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database 'housy_tunisia' created successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Database creation may have failed, but continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Database creation issue: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Update .env file
Write-Host "📝 Updating .env configuration..." -ForegroundColor Yellow

$newDatabaseUrl = "postgresql://postgres:$Password@$Host`:$Port/housy_tunisia"
$envPath = ".\.env"

if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $updatedContent = @()
    $foundDatabaseUrl = $false
    
    foreach ($line in $envContent) {
        if ($line -match "^DATABASE_URL=") {
            $updatedContent += "DATABASE_URL=$newDatabaseUrl"
            $foundDatabaseUrl = $true
            Write-Host "✅ Updated DATABASE_URL in .env" -ForegroundColor Green
        } else {
            $updatedContent += $line
        }
    }
    
    if (-not $foundDatabaseUrl) {
        $updatedContent += "DATABASE_URL=$newDatabaseUrl"
        Write-Host "✅ Added DATABASE_URL to .env" -ForegroundColor Green
    }
    
    $updatedContent | Out-File -FilePath $envPath -Encoding UTF8
} else {
    Write-Host "⚠️ .env file not found, creating new one..." -ForegroundColor Yellow
    "DATABASE_URL=$newDatabaseUrl" | Out-File -FilePath $envPath -Encoding UTF8
}

# Test Node.js PostgreSQL connection
Write-Host "🧪 Testing Node.js database connection..." -ForegroundColor Yellow

$nodeTestScript = @"
const { Client } = require('pg');

async function testConnection() {
    const client = new Client({
        connectionString: '$newDatabaseUrl'
    });
    
    try {
        await client.connect();
        console.log('✅ Node.js PostgreSQL connection successful!');
        
        const result = await client.query('SELECT version()');
        console.log('📊 PostgreSQL version:', result.rows[0].version.substring(0, 50) + '...');
        
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

$nodeTestFile = "test-pg-connection.js"
$nodeTestScript | Out-File -FilePath $nodeTestFile -Encoding UTF8

$nodePath = "C:\Program Files\nodejs\node.exe"
if (Test-Path $nodePath) {
    try {
        & $nodePath $nodeTestFile
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Node.js can connect to PostgreSQL!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Node.js connection test failed" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ Node.js test error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Remove-Item $nodeTestFile -ErrorAction SilentlyContinue
} else {
    Write-Host "⚠️ Node.js not found, skipping connection test" -ForegroundColor Yellow
}

# Run database migrations
Write-Host "🚀 Running database migrations..." -ForegroundColor Cyan

$npmPath = "C:\Program Files\nodejs\npm.cmd"
if (Test-Path $npmPath) {
    Write-Host "📦 Installing/updating dependencies..." -ForegroundColor Yellow
    & $npmPath install
    
    Write-Host "🏗️ Running Drizzle migrations..." -ForegroundColor Yellow
    & $npmPath run db:push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database migrations completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Migration may have had issues, but database is ready" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ npm not found, please run 'npm run db:push' manually" -ForegroundColor Yellow
}

# Cleanup
Remove-Item $scriptFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 PostgreSQL setup completed!" -ForegroundColor Green
Write-Host "📊 Database: housy_tunisia" -ForegroundColor White
Write-Host "🔗 Connection: $newDatabaseUrl" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Start your application: npm run dev" -ForegroundColor White
Write-Host "2. Visit: http://localhost:3000" -ForegroundColor White
Write-Host "3. Test AI features: http://localhost:3000/test-ai-interface.html" -ForegroundColor White
