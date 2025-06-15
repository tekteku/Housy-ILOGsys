# Script de gestion Docker pour Housy (PowerShell)
# Usage: .\docker-manager.ps1 [start|stop|build|logs|status]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("build", "start", "stop", "restart", "logs", "status", "health", "cleanup")]
    [string]$Action
)

# Configuration
$ProjectName = "housy"
$ComposeFile = "docker-compose.dev.yml"

# Fonctions utilitaires
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Vérification de Docker
function Test-Docker {
    try {
        $null = docker info 2>$null
        return $true
    } catch {
        Write-Error "Docker n'est pas disponible. Veuillez démarrer Docker Desktop."
        return $false
    }
}

# Construction des images
function Build-Images {
    Write-Info "Construction des images Docker..."
    
    try {
        # Build de l'image de développement
        docker build -f Dockerfile.dev -t "${ProjectName}-dev" .
        if ($LASTEXITCODE -ne 0) { throw "Échec build dev" }
        
        # Build de l'image de production
        docker build -f Dockerfile -t "${ProjectName}-prod" .
        if ($LASTEXITCODE -ne 0) { throw "Échec build prod" }
        
        Write-Info "Images construites avec succès !"
        docker images | Where-Object { $_ -match $ProjectName }
        
    } catch {
        Write-Error "Erreur lors de la construction: $_"
        exit 1
    }
}

# Démarrage des services
function Start-Services {
    Write-Info "Démarrage des services Housy..."
    
    try {
        # Créer le réseau s'il n'existe pas
        docker network create housy-dev-network 2>$null
        
        # Démarrer avec docker-compose
        docker-compose -f $ComposeFile up -d
        
        Write-Info "Services démarrés !"
        Write-Info "Application disponible sur: http://localhost:3000"
        Write-Info "Base de données: localhost:5433"
        Write-Info "Redis: localhost:6380"
        
    } catch {
        Write-Error "Erreur lors du démarrage: $_"
        exit 1
    }
}

# Arrêt des services
function Stop-Services {
    Write-Info "Arrêt des services Housy..."
    docker-compose -f $ComposeFile down
    Write-Info "Services arrêtés !"
}

# Affichage des logs
function Show-Logs {
    Write-Info "Logs des services Housy:"
    docker-compose -f $ComposeFile logs -f
}

# Statut des services
function Show-Status {
    Write-Info "Statut des services Housy:"
    docker-compose -f $ComposeFile ps
    
    Write-Host ""
    Write-Info "Utilisation des ressources:"
    $containers = docker-compose -f $ComposeFile ps -q
    if ($containers) {
        docker stats --no-stream --format "table {{.Container}}`t{{.CPUPerc}}`t{{.MemUsage}}`t{{.NetIO}}" $containers
    }
}

# Tests de santé
function Test-Health {
    Write-Info "Vérification de la santé des services..."
    
    # Test de l'application
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        Write-Info "✅ Application: OK (Status: $($response.StatusCode))"
    } catch {
        Write-Error "❌ Application: ERREUR"
    }
    
    # Test de PostgreSQL
    try {
        $null = docker exec housy-postgres-dev pg_isready -U housy_dev 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Info "✅ PostgreSQL: OK"
        } else {
            Write-Error "❌ PostgreSQL: ERREUR"
        }
    } catch {
        Write-Error "❌ PostgreSQL: Non accessible"
    }
    
    # Test de Redis
    try {
        $result = docker exec housy-redis-dev redis-cli ping 2>$null
        if ($result -eq "PONG") {
            Write-Info "✅ Redis: OK"
        } else {
            Write-Error "❌ Redis: ERREUR"
        }
    } catch {
        Write-Error "❌ Redis: Non accessible"
    }
}

# Nettoyage complet
function Invoke-Cleanup {
    Write-Warn "Nettoyage complet (suppression des volumes) ?"
    $confirmation = Read-Host "Continuer ? [y/N]"
    
    if ($confirmation -eq "y" -or $confirmation -eq "Y") {
        docker-compose -f $ComposeFile down -v --remove-orphans
        docker system prune -f
        Write-Info "Nettoyage terminé !"
    } else {
        Write-Info "Nettoyage annulé."
    }
}

# Vérification de Docker avant toute action
if (-not (Test-Docker)) {
    exit 1
}

# Exécution de l'action demandée
switch ($Action) {
    "build" {
        Build-Images
    }
    "start" {
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Stop-Services
        Start-Services
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Show-Status
    }
    "health" {
        Test-Health
    }
    "cleanup" {
        Invoke-Cleanup
    }
}

Write-Host ""
Write-Info "Action '$Action' terminée."
