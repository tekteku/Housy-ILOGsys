Write-Host "Nettoyage VS Code pour HousyTunisia..." -ForegroundColor Green

# Supprimer le dossier .vs s'il existe
if (Test-Path ".vs") {
    Remove-Item -Recurse -Force ".vs" -ErrorAction SilentlyContinue
    Write-Host "Dossier .vs supprime" -ForegroundColor Green
} else {
    Write-Host "Aucun dossier .vs trouve" -ForegroundColor Gray
}

# Créer le dossier .vscode s'il n'existe pas
if (!(Test-Path ".vscode")) {
    New-Item -ItemType Directory -Path ".vscode" -Force | Out-Null
    Write-Host "Dossier .vscode cree" -ForegroundColor Green
}

# Nettoyer les fichiers temporaires
$tempFiles = @("dist", "build", ".next", ".cache")
foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Remove-Item -Recurse -Force $file -ErrorAction SilentlyContinue
        Write-Host "$file supprime" -ForegroundColor Green
    }
}

Write-Host "Nettoyage termine !" -ForegroundColor Green
