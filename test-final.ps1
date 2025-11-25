Write-Host "🧪 Test Final - Validation des Fonctionnalités d'Estimation" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

# Test de l'endpoint de santé
Write-Host ""
Write-Host "1️⃣ Test de connectivité du serveur..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Serveur accessible sur port 3000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Serveur non accessible - Démarrer avec 'npm run dev'" -ForegroundColor Red
    Write-Host "💡 Commande: npm run dev" -ForegroundColor Blue
    exit 1
}

# Test de l'endpoint test
Write-Host ""
Write-Host "2️⃣ Test de la structure des routes..." -ForegroundColor Yellow

try {
    $testResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/test" -UseBasicParsing -TimeoutSec 5
    $content = $testResponse.Content
    if ($content -match "estimation|reports") {
        Write-Host "✅ Routes d'estimation et reports disponibles" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Routes possiblement non montées" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Impossible de tester les routes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3️⃣ Instructions pour test manuel:" -ForegroundColor Yellow
Write-Host "   📍 Ouvrir: http://localhost:3000/estimation" -ForegroundColor White
Write-Host "   📋 Remplir le formulaire avec:" -ForegroundColor White
Write-Host "      - Surface: 120m²" -ForegroundColor Gray
Write-Host "      - Type: Construction neuve" -ForegroundColor Gray
Write-Host "      - Qualité: Premium" -ForegroundColor Gray
Write-Host "   🧮 Cliquer 'Calculer l'estimation'" -ForegroundColor White
Write-Host "   💾 Cliquer 'Enregistrer l'estimation'" -ForegroundColor White
Write-Host "   📄 Cliquer 'Exporter en PDF'" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Status: Toutes les modifications sont terminées !" -ForegroundColor Green
Write-Host "📱 Application prête pour les tests finaux" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan

# Optionnel: Ouvrir automatiquement dans le navigateur
$openBrowser = Read-Host "Voulez-vous ouvrir la page d'estimation maintenant? (y/N)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "http://localhost:3000/estimation"
}
