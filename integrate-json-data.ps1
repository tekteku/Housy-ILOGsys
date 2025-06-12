# Script pour integrer les donnees JSON dans l'application Housy
# Ce script copie les donnees de attached_assets vers le serveur

Write-Host "Demarrage integration des donnees JSON dans Housy Tunisia..." -ForegroundColor Green

# Creer le dossier de donnees dans le serveur s'il n'existe pas
$serverDataPath = ".\server\data"
if (!(Test-Path $serverDataPath)) {
    New-Item -ItemType Directory -Path $serverDataPath -Force
    Write-Host "Dossier server/data cree" -ForegroundColor Yellow
}

# Copier les donnees JSON essentielles
$attachedAssets = ".\attached_assets"
if (Test-Path $attachedAssets) {
    Write-Host "Copie des donnees JSON..." -ForegroundColor Cyan
    
    # Copier les fichiers index et readme
    Copy-Item "$attachedAssets\INDEX_GENERAL.json" "$serverDataPath\" -Force
    Copy-Item "$attachedAssets\README_DONNEES_JSON.md" "$serverDataPath\" -Force
    
    # Copier les donnees de materiaux (essentielles)
    $materialsSource = "$attachedAssets\01_MATERIAUX_CONSTRUCTION"
    $materialsTarget = "$serverDataPath\materiaux"
    if (Test-Path $materialsSource) {
        if (!(Test-Path $materialsTarget)) {
            New-Item -ItemType Directory -Path $materialsTarget -Force
        }
        Copy-Item "$materialsSource\catalogue_estimation_materiaux_complet.json" "$materialsTarget\" -Force -ErrorAction SilentlyContinue
        Copy-Item "$materialsSource\catalogue_brico_direct_detaille.json" "$materialsTarget\" -Force -ErrorAction SilentlyContinue
        Write-Host "Donnees materiaux copiees" -ForegroundColor Green
    }
    
    # Copier un echantillon des donnees immobilieres (pour eviter la surcharge)
    $propertiesSource = "$attachedAssets\02_PROPRIETES_IMMOBILIERES"
    $propertiesTarget = "$serverDataPath\immobilier"
    if (Test-Path $propertiesSource) {
        if (!(Test-Path $propertiesTarget)) {
            New-Item -ItemType Directory -Path $propertiesTarget -Force
        }
        Copy-Item "$propertiesSource\proprietes_consolidees_resume.json" "$propertiesTarget\" -Force -ErrorAction SilentlyContinue
        Write-Host "Donnees immobilieres copiees" -ForegroundColor Green
    }
    
    Write-Host "Integration des donnees terminee avec succes !" -ForegroundColor Green
    
} else {
    Write-Host "Dossier attached_assets non trouve" -ForegroundColor Red
}

Write-Host "L'application peut maintenant utiliser les donnees JSON certifiees !" -ForegroundColor Green
