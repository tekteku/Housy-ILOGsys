# Script de Validation Complete - Application Housy
# Version: 1.0.0
# Date: 13 Juin 2025

param(
    [string]$Action = "full"
)

Write-Host "=== VALIDATION COMPLETE APPLICATION HOUSY ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

function Test-Prerequisites {
    Write-Host "1. VERIFICATION DES PREREQUIS" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    
    $checks = @()
    
    # Docker
    try {
        $dockerVersion = docker --version
        Write-Host "  ✓ Docker: $dockerVersion" -ForegroundColor Green
        $checks += @{Status="OK"; Service="Docker"}
    } catch {
        Write-Host "  ✗ Docker non accessible" -ForegroundColor Red
        $checks += @{Status="ERROR"; Service="Docker"}
    }
    
    # Node.js
    try {
        $nodeVersion = node --version
        Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
        $checks += @{Status="OK"; Service="Node.js"}
    } catch {
        Write-Host "  ✗ Node.js non accessible" -ForegroundColor Red
        $checks += @{Status="ERROR"; Service="Node.js"}
    }
    
    # NPM
    try {
        $npmVersion = npm --version
        Write-Host "  ✓ NPM: $npmVersion" -ForegroundColor Green
        $checks += @{Status="OK"; Service="NPM"}
    } catch {
        Write-Host "  ✗ NPM non accessible" -ForegroundColor Red
        $checks += @{Status="ERROR"; Service="NPM"}
    }
    
    return $checks
}

function Test-FileStructure {
    Write-Host "`n2. VERIFICATION DE LA STRUCTURE" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    
    $requiredFiles = @(
        "package.json",
        "docker-compose.dev.yml",
        "docker-compose.yml",
        "Dockerfile.dev",
        "server/index.ts",
        "client/src/App.tsx",
        "server/data/INDEX_GENERAL.json"
    )
    
    $checks = @()
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Host "  ✓ $file" -ForegroundColor Green
            $checks += @{Status="OK"; File=$file}
        } else {
            Write-Host "  ✗ $file (manquant)" -ForegroundColor Red
            $checks += @{Status="ERROR"; File=$file}
        }
    }
    
    return $checks
}

function Test-DataIntegrity {
    Write-Host "`n3. VERIFICATION DES DONNEES" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    
    $checks = @()
    
    # Données immobilières
    $immobilierPath = "server/data/immobilier/proprietes_consolidees_resume.json"
    if (Test-Path $immobilierPath) {
        try {
            $data = Get-Content $immobilierPath | ConvertFrom-Json
            Write-Host "  ✓ Données immobilières: OK" -ForegroundColor Green
            $checks += @{Status="OK"; Data="Immobilier"}
        } catch {
            Write-Host "  ✗ Données immobilières: Format invalide" -ForegroundColor Red
            $checks += @{Status="ERROR"; Data="Immobilier"}
        }
    } else {
        Write-Host "  ✗ Données immobilières: Fichier manquant" -ForegroundColor Red
        $checks += @{Status="ERROR"; Data="Immobilier"}
    }
    
    # Données matériaux
    $materiauxPath = "server/data/materiaux/catalogue_estimation_materiaux_complet.json"
    if (Test-Path $materiauxPath) {
        try {
            $data = Get-Content $materiauxPath | ConvertFrom-Json
            Write-Host "  ✓ Données matériaux: OK" -ForegroundColor Green
            $checks += @{Status="OK"; Data="Materiaux"}
        } catch {
            Write-Host "  ✗ Données matériaux: Format invalide" -ForegroundColor Red
            $checks += @{Status="ERROR"; Data="Materiaux"}
        }
    } else {
        Write-Host "  ✗ Données matériaux: Fichier manquant" -ForegroundColor Red
        $checks += @{Status="ERROR"; Data="Materiaux"}
    }
    
    # Images
    $imagesPath = "client/public/static/images"
    if (Test-Path $imagesPath) {
        $imageCount = (Get-ChildItem $imagesPath -Filter "*.png").Count
        Write-Host "  ✓ Images: $imageCount fichiers trouvés" -ForegroundColor Green
        $checks += @{Status="OK"; Data="Images"; Count=$imageCount}
    } else {
        Write-Host "  ✗ Images: Dossier manquant" -ForegroundColor Red
        $checks += @{Status="ERROR"; Data="Images"}
    }
    
    return $checks
}

function Test-DockerBuild {
    Write-Host "`n4. TEST DE CONSTRUCTION DOCKER" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    
    try {
        Write-Host "  Construction de l'image de développement..." -ForegroundColor Blue
        $result = docker-compose -f docker-compose.dev.yml build --quiet 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Construction Docker: Succès" -ForegroundColor Green
            return @{Status="OK"; Service="Docker Build"}
        } else {
            Write-Host "  ✗ Construction Docker: Échec" -ForegroundColor Red
            Write-Host "    Détails: $result" -ForegroundColor Gray
            return @{Status="ERROR"; Service="Docker Build"}
        }
    } catch {
        Write-Host "  ✗ Construction Docker: Erreur" -ForegroundColor Red
        return @{Status="ERROR"; Service="Docker Build"}
    }
}

function Test-ApplicationStart {
    Write-Host "`n5. TEST DE DEMARRAGE APPLICATION" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    
    try {
        Write-Host "  Démarrage des conteneurs..." -ForegroundColor Blue
        docker-compose -f docker-compose.dev.yml up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Conteneurs démarrés" -ForegroundColor Green
            
            # Attendre que l'application soit prête
            Write-Host "  Attente du démarrage complet..." -ForegroundColor Blue
            Start-Sleep 30
            
            # Test de l'application
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
                if ($response.StatusCode -eq 200) {
                    Write-Host "  ✓ Application accessible sur http://localhost:3000" -ForegroundColor Green
                    return @{Status="OK"; Service="Application"}
                }
            } catch {
                Write-Host "  ✗ Application non accessible" -ForegroundColor Red
                return @{Status="ERROR"; Service="Application"}
            }
        } else {
            Write-Host "  ✗ Échec du démarrage des conteneurs" -ForegroundColor Red
            return @{Status="ERROR"; Service="Containers"}
        }
    } catch {
        Write-Host "  ✗ Erreur lors du démarrage" -ForegroundColor Red
        return @{Status="ERROR"; Service="Startup"}
    }
}

function Test-AIIntegration {
    Write-Host "`n6. TEST DE L'INTEGRATION IA" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    
    try {
        $body = @{
            message = "Test d'estimation: maison 120m2 à Tunis"
            conversationId = "validation_test"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/chat" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
        
        if ($response -and $response.data -and $response.data.response) {
            Write-Host "  ✓ IA accessible et fonctionnelle" -ForegroundColor Green
            Write-Host "  Réponse: $($response.data.response.Substring(0, 100))..." -ForegroundColor Gray
            return @{Status="OK"; Service="IA"}
        } else {
            Write-Host "  ✗ IA: Réponse invalide" -ForegroundColor Red
            return @{Status="ERROR"; Service="IA"}
        }
    } catch {
        Write-Host "  ✗ IA non accessible: $_" -ForegroundColor Red
        return @{Status="ERROR"; Service="IA"}
    }
}

function Show-FinalReport {
    param($AllChecks)
    
    Write-Host "`n7. RAPPORT FINAL DE VALIDATION" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Gray
    
    $totalChecks = $AllChecks.Count
    $successChecks = ($AllChecks | Where-Object { $_.Status -eq "OK" }).Count
    $errorChecks = ($AllChecks | Where-Object { $_.Status -eq "ERROR" }).Count
    
    $successRate = [math]::Round(($successChecks / $totalChecks) * 100, 2)
    
    Write-Host "`n  STATISTIQUES:" -ForegroundColor White
    Write-Host "  - Total des vérifications: $totalChecks" -ForegroundColor Gray
    Write-Host "  - Succès: $successChecks" -ForegroundColor Green
    Write-Host "  - Erreurs: $errorChecks" -ForegroundColor Red
    Write-Host "  - Taux de réussite: $successRate%" -ForegroundColor $(if($successRate -ge 80) {"Green"} else {"Red"})
    
    Write-Host "`n  STATUS GLOBAL:" -ForegroundColor White
    if ($successRate -ge 90) {
        Write-Host "  🎉 EXCELLENT - Application prête pour la production" -ForegroundColor Green
    } elseif ($successRate -ge 75) {
        Write-Host "  ✅ BON - Application fonctionnelle avec quelques améliorations possibles" -ForegroundColor Yellow
    } else {
        Write-Host "  ⚠️  ATTENTION - Problèmes détectés, intervention requise" -ForegroundColor Red
    }
    
    Write-Host "`n  DETAILS DES ERREURS:" -ForegroundColor White
    $errors = $AllChecks | Where-Object { $_.Status -eq "ERROR" }
    if ($errors.Count -eq 0) {
        Write-Host "  Aucune erreur détectée ✓" -ForegroundColor Green
    } else {
        foreach ($error in $errors) {
            Write-Host "  - $($error.Service -or $error.File -or $error.Data): ERREUR" -ForegroundColor Red
        }
    }
    
    Write-Host "`n=== FIN DE LA VALIDATION ===" -ForegroundColor Cyan
    Write-Host "Heure de fin: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray
}

# Exécution principale
$allChecks = @()

switch ($Action.ToLower()) {
    "full" {
        $allChecks += Test-Prerequisites
        $allChecks += Test-FileStructure  
        $allChecks += Test-DataIntegrity
        $allChecks += Test-DockerBuild
        $allChecks += Test-ApplicationStart
        $allChecks += Test-AIIntegration
        Show-FinalReport -AllChecks $allChecks
    }
    "quick" {
        $allChecks += Test-Prerequisites
        $allChecks += Test-FileStructure
        Show-FinalReport -AllChecks $allChecks
    }
    "docker" {
        $allChecks += Test-Prerequisites
        $allChecks += Test-DockerBuild
        $allChecks += Test-ApplicationStart
        Show-FinalReport -AllChecks $allChecks
    }
    default {
        Write-Host "Usage: .\validation-complete.ps1 [full|quick|docker]" -ForegroundColor Yellow
    }
}
