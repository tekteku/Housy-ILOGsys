# Scripts de Gestion Docker - Application Housy
# Utilisation: .\docker-scripts.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "=== Scripts de Gestion Docker - Housy ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commandes disponibles:" -ForegroundColor Yellow
    Write-Host "  help          - Affiche cette aide"
    Write-Host "  status        - Verifie l'etat de Docker"
    Write-Host "  dev-start     - Lance l'environnement de developpement"
    Write-Host "  dev-stop      - Arrete l'environnement de developpement"
    Write-Host "  health        - Verifie la sante de l'application"
    Write-Host ""
}

function Test-DockerStatus {
    Write-Host "Verification de l'etat de Docker..." -ForegroundColor Blue
    
    try {
        $dockerVersion = docker --version
        Write-Host "Docker installe: $dockerVersion" -ForegroundColor Green
        
        docker ps | Out-Null
        Write-Host "Docker Desktop est actif" -ForegroundColor Green
        
        return $true
    }
    catch {
        Write-Host "Erreur Docker: $_" -ForegroundColor Red
        return $false
    }
}

function Start-DevEnvironment {
    Write-Host "Lancement de l'environnement de developpement..." -ForegroundColor Blue
    
    docker-compose -f docker-compose.dev.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Environnement de developpement demarre avec succes" -ForegroundColor Green
        Write-Host "Application disponible sur: http://localhost:3000" -ForegroundColor Cyan
    } else {
        Write-Host "Erreur lors du demarrage" -ForegroundColor Red
    }
}

function Stop-DevEnvironment {
    Write-Host "Arret de l'environnement de developpement..." -ForegroundColor Blue
    
    docker-compose -f docker-compose.dev.yml down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Environnement de developpement arrete" -ForegroundColor Green
    } else {
        Write-Host "Erreur lors de l'arret" -ForegroundColor Red
    }
}

function Test-Health {
    Write-Host "Verification de la sante de l'application..." -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "Application web accessible" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "Application web inaccessible" -ForegroundColor Red
    }
}

# Execution de la commande
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "status" { Test-DockerStatus }
    "dev-start" { Test-DockerStatus; if ($?) { Start-DevEnvironment } }
    "dev-stop" { Stop-DevEnvironment }
    "health" { Test-Health }
    default { 
        Write-Host "Commande '$Command' inconnue" -ForegroundColor Red
        Show-Help 
    }
}
