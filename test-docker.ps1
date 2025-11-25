# Docker Testing and Troubleshooting Script for Housy Tunisia

Write-Host "🐳 Docker Testing for Housy Tunisia Database" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check Docker Installation
Write-Host "1. Testing Docker Installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "   ✅ Docker Client: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Docker not found in PATH" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Docker installation error" -ForegroundColor Red
    exit 1
}

# Test 2: Check Docker Daemon
Write-Host ""
Write-Host "2. Testing Docker Daemon..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker Daemon is running" -ForegroundColor Green
        $daemonRunning = $true
    } else {
        Write-Host "   ❌ Docker Daemon not responding" -ForegroundColor Red
        Write-Host "   💡 Starting Docker Desktop..." -ForegroundColor Yellow
        
        # Try to start Docker Desktop
        try {
            Start-Process -FilePath "C:\Program Files\Docker\Docker\Docker Desktop.exe" -WindowStyle Hidden -ErrorAction Stop
            Write-Host "   🔄 Docker Desktop starting... Please wait 30-60 seconds" -ForegroundColor Yellow
            $daemonRunning = $false
        } catch {
            Write-Host "   ❌ Could not start Docker Desktop automatically" -ForegroundColor Red
            Write-Host "   📝 Please start Docker Desktop manually from Start Menu" -ForegroundColor Yellow
            $daemonRunning = $false
        }
    }
} catch {
    Write-Host "   ❌ Docker daemon test failed" -ForegroundColor Red
    $daemonRunning = $false
}

# Test 3: List Containers (if daemon is running)
if ($daemonRunning) {
    Write-Host ""
    Write-Host "3. Checking Docker Containers..." -ForegroundColor Yellow
    try {
        $containers = docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   📊 Container Status:" -ForegroundColor Cyan
            Write-Host $containers
            
            # Check for Housy containers specifically
            $housyContainers = docker ps -a --filter "name=housy" --format "{{.Names}}" 2>$null
            if ($housyContainers) {
                Write-Host ""
                Write-Host "   🏠 Housy Containers Found:" -ForegroundColor Green
                $housyContainers | ForEach-Object { Write-Host "   - $_" -ForegroundColor Green }
            } else {
                Write-Host "   ⚠️  No Housy containers found" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ❌ Could not list containers" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Container listing failed" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "3. Skipping container check (daemon not running)" -ForegroundColor Yellow
}

# Test 4: Check Docker Compose
Write-Host ""
Write-Host "4. Testing Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version 2>$null
    if ($composeVersion) {
        Write-Host "   ✅ Docker Compose: $composeVersion" -ForegroundColor Green
        $composeAvailable = $true
    } else {
        Write-Host "   ❌ Docker Compose not available" -ForegroundColor Red
        $composeAvailable = $false
    }
} catch {
    Write-Host "   ❌ Docker Compose test failed" -ForegroundColor Red
    $composeAvailable = $false
}

# Test 5: Check Compose Files
Write-Host ""
Write-Host "5. Checking Docker Compose Files..." -ForegroundColor Yellow
$composeFiles = @("docker-compose.yml", "docker-compose.dev.yml")
foreach ($file in $composeFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing: $file" -ForegroundColor Red
    }
}

# Test 6: Test Port Availability
Write-Host ""
Write-Host "6. Testing Port Availability..." -ForegroundColor Yellow
$ports = @{5433="PostgreSQL"; 6380="Redis"; 3000="Application"}
foreach ($port in $ports.Keys) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "   ✅ Port $port ($($ports[$port])): ACCESSIBLE" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Port $port ($($ports[$port])): Not accessible" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ Port $port ($($ports[$port])): Test failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan

if (-not $daemonRunning) {
    Write-Host "   1. 🚀 Start Docker Desktop manually:" -ForegroundColor Yellow
    Write-Host "      - Open Start Menu" -ForegroundColor White
    Write-Host "      - Search for 'Docker Desktop'" -ForegroundColor White
    Write-Host "      - Launch Docker Desktop" -ForegroundColor White
    Write-Host "      - Wait for the green 'Docker is running' indicator" -ForegroundColor White
    Write-Host ""
    Write-Host "   2. 🔄 Then run this script again to verify" -ForegroundColor Yellow
} else {
    Write-Host "   1. ✅ Docker is working!" -ForegroundColor Green
    if ($composeAvailable) {
        Write-Host "   2. 🐘 Start PostgreSQL container:" -ForegroundColor Yellow
        Write-Host "      docker-compose -f docker-compose.dev.yml up -d postgres-dev" -ForegroundColor White
        Write-Host ""
        Write-Host "   3. 📊 Check container status:" -ForegroundColor Yellow
        Write-Host "      docker-compose -f docker-compose.dev.yml ps" -ForegroundColor White
        Write-Host ""
        Write-Host "   4. 🔗 Connect pgAdmin with:" -ForegroundColor Yellow
        Write-Host "      Host: localhost, Port: 5433, Database: housy_tunisia" -ForegroundColor White
        Write-Host "      Username: postgres, Password: 0000" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🔧 Troubleshooting Tips:" -ForegroundColor Cyan
Write-Host "   • If Docker Desktop won't start: Restart your computer" -ForegroundColor White
Write-Host "   • If ports are blocked: Check Windows Firewall" -ForegroundColor White
Write-Host "   • If containers won't start: Try 'docker system prune'" -ForegroundColor White
Write-Host "   • For permissions issues: Run as Administrator" -ForegroundColor White

Write-Host ""
Write-Host "📞 Current Status Summary:" -ForegroundColor Cyan
Write-Host "   Docker Client: $(if ($dockerVersion) { '✅ Working' } else { '❌ Failed' })" -ForegroundColor White
Write-Host "   Docker Daemon: $(if ($daemonRunning) { '✅ Running' } else { '❌ Not Running' })" -ForegroundColor White
Write-Host "   Docker Compose: $(if ($composeAvailable) { '✅ Available' } else { '❌ Not Available' })" -ForegroundColor White
