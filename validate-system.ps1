Write-Host "Validation complete du systeme HousyTunisia..." -ForegroundColor Green

# Test de l'etat du projet
Write-Host "`nPhase 1: Verification de la structure du projet" -ForegroundColor Cyan

$essentialFiles = @(
    "package.json",
    "README.md",
    "GUIDE_LLM_JSON_INTEGRATION.md",
    "MISSION_ACCOMPLISHED_JSON_LLM_INTEGRATION.md"
)

$fileCount = 0
foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Write-Host "OK $file trouve" -ForegroundColor Green
        $fileCount++
    } else {
        Write-Host "MANQUE $file" -ForegroundColor Red
    }
}

Write-Host "`nPhase 2: Verification des dossiers" -ForegroundColor Cyan

$essentialFolders = @(
    ".vscode",
    "src",
    "lib"
)

$folderCount = 0
foreach ($folder in $essentialFolders) {
    if (Test-Path $folder) {
        Write-Host "OK $folder trouve" -ForegroundColor Green
        $folderCount++
    } else {
        Write-Host "MANQUE $folder" -ForegroundColor Yellow
    }
}

Write-Host "`nPhase 3: Test des scripts existants" -ForegroundColor Cyan

$scripts = Get-ChildItem -Filter "*.ps1" | Select-Object -ExpandProperty Name
Write-Host "Scripts PowerShell disponibles:"
foreach ($script in $scripts) {
    Write-Host "  - $script" -ForegroundColor White
}

Write-Host "`nPhase 4: Resume des resultats" -ForegroundColor Magenta
Write-Host "Fichiers essentiels: $fileCount/$($essentialFiles.Count)" -ForegroundColor White
Write-Host "Dossiers essentiels: $folderCount/$($essentialFolders.Count)" -ForegroundColor White
Write-Host "Scripts disponibles: $($scripts.Count)" -ForegroundColor White

if ($fileCount -eq $essentialFiles.Count -and $folderCount -ge 1) {
    Write-Host "`nFELICITATIONS ! Le projet est pret." -ForegroundColor Green
} else {
    Write-Host "`nATTENTION ! Certains elements manquent." -ForegroundColor Yellow
}

Write-Host "`nValidation terminee !" -ForegroundColor Green
