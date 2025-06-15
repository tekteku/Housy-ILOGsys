# PostgreSQL 17 Interactive Setup for Housy Tunisia
# This script will prompt for the password you set during installation

Write-Host "🐘 PostgreSQL 17 Setup for Housy Tunisia" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Test PostgreSQL 17 installation
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

if (Test-Path $psqlPath) {
    Write-Host "✅ Found PostgreSQL 17 at: $psqlPath" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL 17 not found" -ForegroundColor Red
    exit 1
}

# Prompt for password
Write-Host ""
Write-Host "🔑 Please enter the PostgreSQL password you set during installation:" -ForegroundColor Yellow
$Password = Read-Host -AsSecureString "Password"
$PlainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password))

# Test connection
Write-Host ""
Write-Host "🔗 Testing PostgreSQL connection..." -ForegroundColor Yellow

$env:PGPASSWORD = $PlainPassword

try {
    & $psqlPath -h localhost -p 5432 -U postgres -c "SELECT version();" postgres | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL connection successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Connection failed. Please check your password." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Connection error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create database
Write-Host ""
Write-Host "🏗️ Creating Housy Tunisia database..." -ForegroundColor Yellow

$createDbScript = @"
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
    & $psqlPath -h localhost -p 5432 -U postgres -f $scriptFile postgres
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database 'housy_tunisia' created successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Database creation may have failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Database creation error: $($_.Exception.Message)" -ForegroundColor Red
}

# Update .env file
Write-Host ""
Write-Host "📝 Updating .env configuration..." -ForegroundColor Yellow

$newDatabaseUrl = "postgresql://postgres:$PlainPassword@localhost:5432/housy_tunisia"
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

# Run database migrations
Write-Host ""
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
    Write-Host "⚠️ npm not found, please run npm run db:push manually" -ForegroundColor Yellow
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

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
