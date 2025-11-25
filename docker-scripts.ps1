# 🐳 Scripts de Gestion Docker - Application Housy
# Utilisation: .\docker-scripts.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Configuration
$PROJECT_NAME = "housy"
$DEV_COMPOSE_FILE = "docker-compose.dev.yml"
$PROD_COMPOSE_FILE = "docker-compose.yml"

function Show-Help {
    Write-Host "=== 🐳 Scripts de Gestion Docker - Housy ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commandes disponibles:" -ForegroundColor Yellow
    Write-Host "  help          - Affiche cette aide"
    Write-Host "  status        - Vérifie l'état de Docker"
    Write-Host "  dev-build     - Construit l'environnement de développement"
    Write-Host "  dev-start     - Lance l'environnement de développement"
    Write-Host "  dev-stop      - Arrête l'environnement de développement"
    Write-Host "  dev-logs      - Affiche les logs de développement"
    Write-Host "  prod-build    - Construit l'environnement de production"
    Write-Host "  prod-start    - Lance l'environnement de production"
    Write-Host "  prod-stop     - Arrête l'environnement de production"
    Write-Host "  cleanup       - Nettoie les ressources Docker inutilisées"
    Write-Host "  backup        - Sauvegarde la base de données"
    Write-Host "  health        - Vérifie la santé de l'application"
    Write-Host ""
    Write-Host "Exemples:" -ForegroundColor Green
    Write-Host "  .\docker-scripts.ps1 dev-start"
    Write-Host "  .\docker-scripts.ps1 health"
    Write-Host "  .\docker-scripts.ps1 cleanup"
}

function Test-DockerStatus {
    Write-Host "🔍 Vérification de l'état de Docker..." -ForegroundColor Blue
    
    try {
        $dockerVersion = docker --version
        Write-Host "✅ Docker installé: $dockerVersion" -ForegroundColor Green
        
        $composeVersion = docker-compose --version
        Write-Host "✅ Docker Compose installé: $composeVersion" -ForegroundColor Green
        
        docker ps | Out-Null
        Write-Host "✅ Docker Desktop est actif et accessible" -ForegroundColor Green
        
        return $true
    }
    catch {
        Write-Host "❌ Erreur Docker: $_" -ForegroundColor Red
        Write-Host "💡 Assurez-vous que Docker Desktop est démarré" -ForegroundColor Yellow
        return $false
    }
}

function Build-DevEnvironment {
    Write-Host "🏗️ Construction de l'environnement de développement..." -ForegroundColor Blue
    
    if (-not (Test-Path $DEV_COMPOSE_FILE)) {
        Write-Host "❌ Fichier $DEV_COMPOSE_FILE introuvable" -ForegroundColor Red
        return
    }
    
    docker-compose -f $DEV_COMPOSE_FILE build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environnement de développement construit avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la construction" -ForegroundColor Red
    }
}

function Start-DevEnvironment {
    Write-Host "🚀 Lancement de l'environnement de développement..." -ForegroundColor Blue
    
    docker-compose -f $DEV_COMPOSE_FILE up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environnement de développement démarré" -ForegroundColor Green
        Write-Host "🌐 Application disponible sur: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "📊 Base de données sur: localhost:5433" -ForegroundColor Cyan
        Write-Host "🔴 Redis sur: localhost:6380" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erreur lors du démarrage" -ForegroundColor Red
    }
}

function Stop-DevEnvironment {
    Write-Host "🛑 Arrêt de l'environnement de développement..." -ForegroundColor Blue
    
    docker-compose -f $DEV_COMPOSE_FILE down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environnement de développement arrêté" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'arrêt" -ForegroundColor Red
    }
}

function Show-DevLogs {
    Write-Host "📋 Affichage des logs de développement..." -ForegroundColor Blue
    Write-Host "💡 Appuyez sur Ctrl+C pour quitter" -ForegroundColor Yellow
    
    docker-compose -f $DEV_COMPOSE_FILE logs -f
}

function Build-ProdEnvironment {
    Write-Host "🏗️ Construction de l'environnement de production..." -ForegroundColor Blue
    
    if (-not (Test-Path $PROD_COMPOSE_FILE)) {
        Write-Host "❌ Fichier $PROD_COMPOSE_FILE introuvable" -ForegroundColor Red
        return
    }
    
    docker-compose -f $PROD_COMPOSE_FILE build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environnement de production construit avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la construction" -ForegroundColor Red
    }
}

function Start-ProdEnvironment {
    Write-Host "🚀 Lancement de l'environnement de production..." -ForegroundColor Blue
    
    docker-compose -f $PROD_COMPOSE_FILE up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environnement de production démarré" -ForegroundColor Green
        Write-Host "🌐 Application disponible sur: http://localhost:3000" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erreur lors du démarrage" -ForegroundColor Red
    }
}

function Stop-ProdEnvironment {
    Write-Host "🛑 Arrêt de l'environnement de production..." -ForegroundColor Blue
    
    docker-compose -f $PROD_COMPOSE_FILE down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environnement de production arrêté" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'arrêt" -ForegroundColor Red
    }
}

function Invoke-Cleanup {
    Write-Host "🧹 Nettoyage des ressources Docker..." -ForegroundColor Blue
    
    Write-Host "Suppression des conteneurs arrêtés..." -ForegroundColor Yellow
    docker container prune -f
    
    Write-Host "Suppression des images inutilisées..." -ForegroundColor Yellow
    docker image prune -f
    
    Write-Host "Suppression des volumes inutilisés..." -ForegroundColor Yellow
    docker volume prune -f
    
    Write-Host "Suppression des réseaux inutilisés..." -ForegroundColor Yellow
    docker network prune -f
    
    Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
    
    # Affichage de l'espace libéré
    Write-Host "📊 Espace disque Docker:" -ForegroundColor Blue
    docker system df
}

function Invoke-Backup {
    Write-Host "💾 Sauvegarde de la base de données..." -ForegroundColor Blue
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_$timestamp.sql"
    
    try {
        docker-compose exec -T postgres-dev pg_dump -U housy_dev housy_dev > $backupFile
        Write-Host "✅ Sauvegarde créée: $backupFile" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erreur lors de la sauvegarde: $_" -ForegroundColor Red
    }
}

function Test-Health {
    Write-Host "🏥 Vérification de la santé de l'application..." -ForegroundColor Blue
    
    # Test de l'application
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Application web accessible" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ Application web inaccessible" -ForegroundColor Red
    }
    
    # Test de l'API
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ API accessible" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ API inaccessible" -ForegroundColor Red
    }
    
    # Test des conteneurs
    $containers = docker-compose ps --services
    foreach ($container in $containers) {
        $status = docker-compose ps $container --format "table {{.Status}}"
        if ($status -like "*Up*") {
            Write-Host "✅ Conteneur $container : fonctionnel" -ForegroundColor Green
        } else {
            Write-Host "❌ Conteneur $container : problème" -ForegroundColor Red
        }
    }
}

# Exécution de la commande
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "status" { Test-DockerStatus }
    "dev-build" { Test-DockerStatus; if ($?) { Build-DevEnvironment } }
    "dev-start" { Test-DockerStatus; if ($?) { Start-DevEnvironment } }
    "dev-stop" { Stop-DevEnvironment }
    "dev-logs" { Show-DevLogs }
    "prod-build" { Test-DockerStatus; if ($?) { Build-ProdEnvironment } }
    "prod-start" { Test-DockerStatus; if ($?) { Start-ProdEnvironment } }
    "prod-stop" { Stop-ProdEnvironment }
    "cleanup" { Invoke-Cleanup }
    "backup" { Invoke-Backup }
    "health" { Test-Health }
    default { 
        Write-Host "❌ Commande '$Command' inconnue" -ForegroundColor Red
        Show-Help 
    }
}
