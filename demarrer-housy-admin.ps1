Write-Host "🚀 DÉMARRAGE DE HOUSY ADMIN" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

# Naviguer vers le répertoire du projet
Set-Location "c:\Users\TaherCh\Desktop\Essay\Housy\Housy"
Write-Host "📁 Répertoire: $(Get-Location)" -ForegroundColor Yellow

# Vérifier package.json
if (Test-Path "package.json") {
    Write-Host "✅ package.json trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ package.json non trouvé" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit
}

Write-Host ""
Write-Host "🔧 Démarrage du serveur..." -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 IDENTIFIANTS ADMIN:" -ForegroundColor Magenta
Write-Host "Username: admin" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Pour arrêter: Ctrl+C" -ForegroundColor Red
Write-Host ""

# Démarrer le serveur
npm run dev
