# Script PowerShell pour démarrer Housy
Write-Host "🚀 Démarrage du serveur Housy..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Set-Location "c:\Users\TaherCh\Desktop\Essay\Housy\Housy"

Write-Host "📁 Répertoire courant: $(Get-Location)" -ForegroundColor Yellow

# Vérifier si Node.js est installé
if (Get-Command "node" -ErrorAction SilentlyContinue) {
    Write-Host "✅ Node.js trouvé: $(node --version)" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js non trouvé" -ForegroundColor Red
    exit 1
}

# Vérifier si npm est installé
if (Get-Command "npm" -ErrorAction SilentlyContinue) {
    Write-Host "✅ npm trouvé: $(npm --version)" -ForegroundColor Green
} else {
    Write-Host "❌ npm non trouvé" -ForegroundColor Red
    exit 1
}

# Vérifier package.json
if (Test-Path "package.json") {
    Write-Host "✅ package.json trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ package.json non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔄 Installation des dépendances..." -ForegroundColor Yellow
npm install

Write-Host "`n🎯 Démarrage du serveur de développement..." -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "`nPour arrêter le serveur, appuyez sur Ctrl+C`n" -ForegroundColor Magenta

npm run dev
