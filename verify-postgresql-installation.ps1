# PostgreSQL Installation Verification Script
# This script thoroughly checks for PostgreSQL installation

param(
    [switch]$Detailed
)

Write-Host "🔍 PostgreSQL Installation Verification" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

$installationFound = $false
$postgresqlInfo = @{
    "InstallDirectory" = $null
    "Version" = $null
    "ServiceStatus" = $null
    "Port" = $null
    "DataDirectory" = $null
}

# Check common installation directories
$commonPaths = @(
    "C:\Program Files\PostgreSQL",
    "C:\PostgreSQL",
    "C:\Program Files (x86)\PostgreSQL"
)

Write-Host "`n📁 Checking Installation Directories..." -ForegroundColor Yellow

foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Found PostgreSQL directory: $path" -ForegroundColor Green
        $installationFound = $true
        $postgresqlInfo.InstallDirectory = $path
        
        # Check for version directories
        $versionDirs = Get-ChildItem $path -Directory -ErrorAction SilentlyContinue
        foreach ($versionDir in $versionDirs) {
            $binPath = Join-Path $versionDir.FullName "bin\psql.exe"
            if (Test-Path $binPath) {
                Write-Host "  📦 Version found: $($versionDir.Name)" -ForegroundColor Cyan
                $postgresqlInfo.Version = $versionDir.Name
                
                # Try to get actual version
                try {
                    $versionOutput = & "$binPath" --version 2>$null
                    if ($versionOutput) {
                        Write-Host "  🔢 Version details: $versionOutput" -ForegroundColor White
                    }
                } catch {
                    Write-Host "  ⚠️ Could not get version details" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "❌ Not found: $path" -ForegroundColor Red
    }
}

# Check Windows Services
Write-Host "`n🔧 Checking PostgreSQL Services..." -ForegroundColor Yellow

$services = Get-Service -Name "*postgres*" -ErrorAction SilentlyContinue
if ($services) {
    foreach ($service in $services) {
        Write-Host "✅ Service found: $($service.Name) - Status: $($service.Status)" -ForegroundColor Green
        $postgresqlInfo.ServiceStatus = $service.Status
        
        if ($service.Status -eq "Running") {
            Write-Host "  🟢 Service is running" -ForegroundColor Green
        } else {
            Write-Host "  🔴 Service is not running" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ No PostgreSQL services found" -ForegroundColor Red
}

# Check network connectivity
Write-Host "`n🌐 Checking Network Connectivity..." -ForegroundColor Yellow

$ports = @(5432, 5433, 5434)
foreach ($port in $ports) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($connection) {
            Write-Host "✅ Port $port is accessible" -ForegroundColor Green
            $postgresqlInfo.Port = $port
        } else {
            Write-Host "❌ Port $port is not accessible" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Cannot test port $port" -ForegroundColor Red
    }
}

# Check for running PostgreSQL processes
Write-Host "`n🏃 Checking Running Processes..." -ForegroundColor Yellow

$postgresProcesses = Get-Process -Name "*postgres*" -ErrorAction SilentlyContinue
if ($postgresProcesses) {
    foreach ($process in $postgresProcesses) {
        Write-Host "✅ PostgreSQL process running: $($process.Name) (PID: $($process.Id))" -ForegroundColor Green
    }
} else {
    Write-Host "❌ No PostgreSQL processes running" -ForegroundColor Red
}

# Check environment variables
Write-Host "`n🌍 Checking Environment Variables..." -ForegroundColor Yellow

$pgEnvVars = @("PGDATA", "PGPORT", "PGUSER", "PGPASSWORD", "PGHOST")
foreach ($envVar in $pgEnvVars) {
    $value = [Environment]::GetEnvironmentVariable($envVar)
    if ($value) {
        if ($envVar -eq "PGPASSWORD") {
            Write-Host "✅ $envVar is set (hidden for security)" -ForegroundColor Green
        } else {
            Write-Host "✅ $envVar = $value" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ $envVar not set" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n📊 INSTALLATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

if ($installationFound) {
    Write-Host "🎉 PostgreSQL Installation: FOUND" -ForegroundColor Green
    Write-Host "📍 Directory: $($postgresqlInfo.InstallDirectory)" -ForegroundColor White
    if ($postgresqlInfo.Version) {
        Write-Host "🔢 Version: $($postgresqlInfo.Version)" -ForegroundColor White
    }
    if ($postgresqlInfo.ServiceStatus) {
        Write-Host "🔧 Service Status: $($postgresqlInfo.ServiceStatus)" -ForegroundColor White
    }
    if ($postgresqlInfo.Port) {
        Write-Host "🌐 Active Port: $($postgresqlInfo.Port)" -ForegroundColor White
    }
} else {
    Write-Host "❌ PostgreSQL Installation: NOT FOUND" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 TO INSTALL POSTGRESQL:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "2. Choose PostgreSQL 15 or 16" -ForegroundColor White
    Write-Host "3. Use password: housy123" -ForegroundColor White
    Write-Host "4. Use port: 5432" -ForegroundColor White
    Write-Host "5. Install all components" -ForegroundColor White
}

# Test database connection if PostgreSQL is found
if ($installationFound -and $postgresqlInfo.ServiceStatus -eq "Running") {
    Write-Host "`n🧪 Testing Database Connection..." -ForegroundColor Yellow
    
    $psqlPath = $null
    if ($postgresqlInfo.InstallDirectory -and $postgresqlInfo.Version) {
        $psqlPath = Join-Path $postgresqlInfo.InstallDirectory "$($postgresqlInfo.Version)\bin\psql.exe"
    }
    
    if ($psqlPath -and (Test-Path $psqlPath)) {
        try {
            $env:PGPASSWORD = "housy123"
            $testResult = & $psqlPath -h localhost -p 5432 -U postgres -c "SELECT 'Connection successful!' as status;" postgres 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database connection successful!" -ForegroundColor Green
                Write-Host "🏗️ Ready to create housy_tunisia database" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Database connection failed" -ForegroundColor Red
                Write-Host "💡 Check password and service status" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Connection test error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Yellow
if ($installationFound) {
    Write-Host "1. Run: .\setup-after-postgresql-install.bat" -ForegroundColor White
    Write-Host "2. Start your app: npm run dev" -ForegroundColor White
} else {
    Write-Host "1. Install PostgreSQL from https://www.postgresql.org/" -ForegroundColor White
    Write-Host "2. Use the installation checklist: PostgreSQL_Installation_Checklist.md" -ForegroundColor White
    Write-Host "3. Run this verification script again" -ForegroundColor White
}
