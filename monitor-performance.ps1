# Script de monitoring simple pour Housy Tunisia

Write-Host "🔍 Monitoring Housy Tunisia - $(Get-Date)"
Write-Host "=================================================="

# Variables
$API_URL = "http://localhost:3000"
$HEALTH_ENDPOINT = "$API_URL/health"

# Fonction pour tester l'API
function Test-API {
    try {
        $response = Invoke-RestMethod -Uri $HEALTH_ENDPOINT -Method GET -TimeoutSec 10
        Write-Host "✅ API Status: $($response.status)" -ForegroundColor Green
        Write-Host "   Uptime: $([math]::Round($response.uptime / 3600, 2)) hours" -ForegroundColor Cyan
        Write-Host "   Environment: $($response.environment)" -ForegroundColor Cyan
        return $true
    } catch {
        Write-Host "❌ API inaccessible: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Fonction pour vérifier les conteneurs Docker
function Test-DockerContainers {
    Write-Host "🐳 Vérification des conteneurs Docker:"
    
    $containers = docker ps --filter "name=housy" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    if ($containers) {
        $containers | ForEach-Object { Write-Host "   $_" -ForegroundColor Cyan }
    } else {
        Write-Host "   ❌ Aucun conteneur Housy en cours d'exécution" -ForegroundColor Red
    }
}

# Fonction pour vérifier l'espace disque
function Test-DiskSpace {
    Write-Host "💾 Vérification de l'espace disque:"
    
    Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | ForEach-Object {
        $freePct = [math]::Round(($_.FreeSpace / $_.Size) * 100, 2)
        $color = if ($freePct -lt 10) { "Red" } elseif ($freePct -lt 20) { "Yellow" } else { "Green" }
        
        Write-Host "   Drive $($_.DeviceID) - Free: $freePct% ($([math]::Round($_.FreeSpace/1GB,2)) GB)" -ForegroundColor $color
    }
}

# Fonction pour vérifier la mémoire
function Test-Memory {
    Write-Host "🧠 Vérification de la mémoire:"
    
    $memory = Get-WmiObject -Class Win32_ComputerSystem
    $totalRam = [math]::Round($memory.TotalPhysicalMemory / 1GB, 2)
    
    $memInfo = Get-Counter '\Memory\Available MBytes'
    $availableRam = [math]::Round($memInfo.CounterSamples[0].CookedValue / 1024, 2)
    $usedRam = $totalRam - $availableRam
    $usedPct = [math]::Round(($usedRam / $totalRam) * 100, 2)
    
    $color = if ($usedPct -gt 90) { "Red" } elseif ($usedPct -gt 80) { "Yellow" } else { "Green" }
    
    Write-Host "   RAM: $usedPct% utilisé ($usedRam GB / $totalRam GB)" -ForegroundColor $color
}

# Fonction pour vérifier les processus Node.js
function Test-NodeProcesses {
    Write-Host "⚡ Processus Node.js actifs:"
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            $memMB = [math]::Round($_.WorkingSet / 1MB, 2)
            Write-Host "   PID: $($_.Id) - Memory: $memMB MB - CPU: $($_.CPU)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   ❌ Aucun processus Node.js détecté" -ForegroundColor Red
    }
}

# Fonction pour tester la base de données
function Test-Database {
    Write-Host "🗄️ Test de connexion PostgreSQL:"
    
    try {
        $response = Invoke-RestMethod -Uri "$API_URL/api/mega/health" -Method GET -TimeoutSec 10
        if ($response.database) {
            Write-Host "   ✅ Database: Connected" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Database: Disconnected" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Impossible de vérifier la base de données" -ForegroundColor Red
    }
}

# Exécution du monitoring
Write-Host ""
Test-API
Write-Host ""
Test-DockerContainers
Write-Host ""
Test-Database
Write-Host ""
Test-DiskSpace
Write-Host ""
Test-Memory
Write-Host ""
Test-NodeProcesses
Write-Host ""

# Génération d'un rapport de statut
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$apiStatus = if (Test-API) { "OK" } else { "FAILED" }

$report = @"
Housy Tunisia - Rapport de Monitoring
=====================================
Date: $(Get-Date)
API Status: $apiStatus
Timestamp: $timestamp

Prochaine vérification recommandée dans 15 minutes.
"@

# Sauvegarde du rapport
$reportPath = "monitoring_report_$timestamp.txt"
$report | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "📊 Rapport sauvegardé: $reportPath" -ForegroundColor Yellow
Write-Host "=================================================="
Write-Host "✅ Monitoring terminé à $(Get-Date)" -ForegroundColor Green
