param(
    [string]$Host = "localhost",
    [string]$Port = "5433",
    [string]$Database = "housy_tunisia",
    [string]$Username = "postgres",
    [string]$Password = "0000"
)

Write-Host "🔍 Testing PostgreSQL Connection for Housy Tunisia..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if psql is available
Write-Host "1. Checking PostgreSQL client (psql)..." -ForegroundColor Yellow
try {
    $psqlVersion = & psql --version 2>$null
    Write-Host "   ✅ PostgreSQL client found: $psqlVersion" -ForegroundColor Green
    $psqlAvailable = $true
} catch {
    Write-Host "   ❌ PostgreSQL client (psql) not found in PATH" -ForegroundColor Red
    Write-Host "   📥 Install PostgreSQL client tools or use pgAdmin" -ForegroundColor Yellow
    $psqlAvailable = $false
}

Write-Host ""

# Test 2: Check if port is accessible
Write-Host "2. Checking if port $Port is accessible..." -ForegroundColor Yellow
try {
    $connection = Test-NetConnection -ComputerName $Host -Port $Port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "   ✅ Port $Port is accessible on $Host" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Port $Port is not accessible on $Host" -ForegroundColor Red
        Write-Host "   💡 Make sure PostgreSQL/Docker container is running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Cannot test port connectivity" -ForegroundColor Red
}

Write-Host ""

# Test 3: Test database connection (if psql is available)
if ($psqlAvailable) {
    Write-Host "3. Testing database connection..." -ForegroundColor Yellow
    
    $env:PGPASSWORD = $Password
    
    try {
        # Test basic connection
        $result = & psql -h $Host -p $Port -U $Username -d $Database -c "SELECT 1;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Successfully connected to database '$Database'" -ForegroundColor Green
            
            # Get table count
            Write-Host ""
            Write-Host "4. Checking database structure..." -ForegroundColor Yellow
            
            $tableCount = & psql -h $Host -p $Port -U $Username -d $Database -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>$null
            Write-Host "   📊 Total tables: $tableCount" -ForegroundColor Cyan
            
            # Check admin user
            $adminUser = & psql -h $Host -p $Port -U $Username -d $Database -tAc "SELECT username FROM users WHERE role = 'admin' LIMIT 1;" 2>$null
            if ($adminUser) {
                Write-Host "   👑 Admin user found: $adminUser" -ForegroundColor Cyan
            } else {
                Write-Host "   ⚠️  No admin user found" -ForegroundColor Yellow
            }
            
            # List some key tables
            Write-Host ""
            Write-Host "5. Key tables verification..." -ForegroundColor Yellow
            $keyTables = @("users", "projects", "client_requests", "quotations", "active_projects")
            foreach ($table in $keyTables) {
                $exists = & psql -h $Host -p $Port -U $Username -d $Database -tAc "SELECT to_regclass('public.$table');" 2>$null
                if ($exists -and $exists -ne "") {
                    Write-Host "   ✅ $table" -ForegroundColor Green
                } else {
                    Write-Host "   ❌ $table (missing)" -ForegroundColor Red
                }
            }
            
        } else {
            Write-Host "   ❌ Failed to connect to database '$Database'" -ForegroundColor Red
            Write-Host "   💡 Check database name, credentials, and server status" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ Database connection test failed: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "3. Skipping database connection test (psql not available)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 pgAdmin Connection Settings:" -ForegroundColor Cyan
Write-Host "   Host: $Host" -ForegroundColor White
Write-Host "   Port: $Port" -ForegroundColor White
Write-Host "   Database: $Database" -ForegroundColor White
Write-Host "   Username: $Username" -ForegroundColor White
Write-Host "   Password: $Password" -ForegroundColor White

Write-Host ""
Write-Host "🐳 Docker Commands (if using Docker):" -ForegroundColor Cyan
Write-Host "   Start: docker-compose -f docker-compose.dev.yml up -d postgres-dev" -ForegroundColor White
Write-Host "   Status: docker ps --filter name=postgres" -ForegroundColor White
Write-Host "   Logs: docker logs housy-postgres-dev" -ForegroundColor White

Write-Host ""
if ($psqlAvailable) {
    Write-Host "✅ Connection test completed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Install PostgreSQL client tools for complete testing" -ForegroundColor Yellow
    Write-Host "   Or use pgAdmin with the connection settings above" -ForegroundColor Yellow
}
