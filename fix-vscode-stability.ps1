# 🧹 Script de Nettoyage et Optimisation VS Code - HousyTunisia

Write-Host "🚀 Démarrage du nettoyage et optimisation VS Code..." -ForegroundColor Green

# Fonction pour afficher les étapes
function Write-Step {
    param([string]$Message)
    Write-Host "`n🔧 $Message" -ForegroundColor Cyan
}

# Fonction pour vérifier et supprimer un dossier/fichier
function Remove-SafelyIfExists {
    param([string]$Path, [string]$Description)
    
    if (Test-Path $Path) {
        try {
            Remove-Item -Recurse -Force $Path -ErrorAction Stop
            Write-Host "✅ $Description supprimé : $Path" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️ Erreur lors de la suppression de $Description : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "ℹ️ $Description non trouvé : $Path" -ForegroundColor Gray
    }
}

Write-Step "Nettoyage des fichiers Visual Studio (.vs)"
Remove-SafelyIfExists ".vs" "Dossier Visual Studio"

Write-Step "Nettoyage des fichiers temporaires de build"
Remove-SafelyIfExists "dist" "Dossier dist"
Remove-SafelyIfExists "build" "Dossier build"
Remove-SafelyIfExists ".next" "Dossier .next"

Write-Step "Nettoyage des fichiers de cache"
Remove-SafelyIfExists "node_modules/.cache" "Cache node_modules"
Remove-SafelyIfExists ".cache" "Dossier cache"

Write-Step "Vérification de la structure .vscode"
if (!(Test-Path ".vscode")) {
    New-Item -ItemType Directory -Path ".vscode" -Force
    Write-Host "✅ Dossier .vscode créé" -ForegroundColor Green
}

Write-Step "Optimisation terminée"
Write-Host "🎉 Le projet HousyTunisia est maintenant optimisé pour VS Code !" -ForegroundColor Green
