# Validation Rapide - Application Housy
Write-Host "=== VALIDATION APPLICATION HOUSY ===" -ForegroundColor Cyan
Write-Host ""

# Test Docker
Write-Host "1. VERIFICATION DOCKER" -ForegroundColor Yellow
try {
    docker --version | Out-Host
    Write-Host "Docker OK" -ForegroundColor Green
} catch {
    Write-Host "Docker ERREUR" -ForegroundColor Red
}

# Test structure
Write-Host "`n2. VERIFICATION STRUCTURE" -ForegroundColor Yellow
$files = @("package.json", "docker-compose.dev.yml", "Dockerfile.dev")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "$file OK" -ForegroundColor Green
    } else {
        Write-Host "$file MANQUANT" -ForegroundColor Red
    }
}

# Test images Docker
Write-Host "`n3. VERIFICATION IMAGES DOCKER" -ForegroundColor Yellow
try {
    $images = docker images --format "table {{.Repository}}:{{.Tag}}" | Select-String "housy"
    if ($images) {
        Write-Host "Images Docker OK" -ForegroundColor Green
        $images | Out-Host
    } else {
        Write-Host "Images Docker AUCUNE TROUVEE" -ForegroundColor Red
    }
} catch {
    Write-Host "Images Docker ERREUR" -ForegroundColor Red
}

# Demarrage de l'application
Write-Host "`n4. DEMARRAGE APPLICATION" -ForegroundColor Yellow
Write-Host "Demarrage des conteneurs..." -ForegroundColor Blue
docker-compose -f docker-compose.dev.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "Application demarree avec succes!" -ForegroundColor Green
    Write-Host "URL http://localhost:3000" -ForegroundColor Cyan
    
    Write-Host "`nStatus des conteneurs" -ForegroundColor Blue
    docker-compose -f docker-compose.dev.yml ps
} else {
    Write-Host "Erreur lors du demarrage" -ForegroundColor Red
}

Write-Host "`n=== FIN VALIDATION ===" -ForegroundColor Cyan
