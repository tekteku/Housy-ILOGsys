# PostgreSQL Password Finder for Housy Tunisia
Write-Host "================================================================" -ForegroundColor Green
Write-Host "   PostgreSQL Password Finder for Housy Tunisia" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Testing PostgreSQL 17 installation..." -ForegroundColor Yellow
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

if (Test-Path $psqlPath) {
    Write-Host "✅ Found PostgreSQL 17" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL 17 not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Testing common passwords..." -ForegroundColor Yellow
Write-Host ""

# Common passwords to test
$passwords = @("", "postgres", "123456", "admin", "password", "housy123", "root", "123", "1234", "12345")
$foundPassword = $null

foreach ($password in $passwords) {
    if ($password -eq "") {
        Write-Host "Testing password: (empty)" -ForegroundColor Cyan
    } else {
        Write-Host "Testing password: $password" -ForegroundColor Cyan
    }
    
    $env:PGPASSWORD = $password
    
    try {
        $output = & $psqlPath -h localhost -p 5432 -U postgres -c "SELECT 'Connection successful!' as status;" postgres 2>&1
        if ($LASTEXITCODE -eq 0) {
            if ($password -eq "") {
                Write-Host "✅ SUCCESS! No password required" -ForegroundColor Green
                $foundPassword = ""
            } else {
                Write-Host "✅ SUCCESS! Password is: $password" -ForegroundColor Green
                $foundPassword = $password
            }
            break
        }
    } catch {
        # Continue to next password
    }
}

if ($foundPassword -ne $null) {
    Write-Host ""
    Write-Host "🎉 Password found! Setting up database..." -ForegroundColor Green
    Write-Host ""
    
    # Create database
    Write-Host "Creating Housy Tunisia database..." -ForegroundColor Yellow
    
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
        }
    } catch {
        Write-Host "⚠️ Database creation may have failed" -ForegroundColor Yellow
    }
    
    # Update .env file
    Write-Host ""
    Write-Host "Updating .env configuration..." -ForegroundColor Yellow
    
    $newDatabaseUrl = "postgresql://postgres:$foundPassword@localhost:5432/housy_tunisia"
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
    Write-Host "Running database migrations..." -ForegroundColor Cyan
    
    $npmPath = "C:\Program Files\nodejs\npm.cmd"
    if (Test-Path $npmPath) {
        Write-Host "Installing/updating dependencies..." -ForegroundColor Yellow
        & $npmPath install
        
        Write-Host "Running Drizzle migrations..." -ForegroundColor Yellow
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
    Write-Host "You can now start the application with: npm run dev" -ForegroundColor Cyan
    
} else {
    Write-Host ""
    Write-Host "❌ Could not find the correct password!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please try these steps:" -ForegroundColor Yellow
    Write-Host "1. Check if PostgreSQL service is running" -ForegroundColor White
    Write-Host "2. Try resetting the postgres user password:" -ForegroundColor White
    Write-Host "   - Open Command Prompt as Administrator" -ForegroundColor White
    Write-Host "   - Run: net stop postgresql-x64-17" -ForegroundColor White
    Write-Host "   - Run: net start postgresql-x64-17" -ForegroundColor White
    Write-Host "3. Or reinstall PostgreSQL with a known password" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"
