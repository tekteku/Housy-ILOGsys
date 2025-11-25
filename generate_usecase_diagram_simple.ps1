# Script PowerShell pour générer les diagrammes de cas d'utilisation simplifiés
Write-Host "===== GENERATION DIAGRAMMES DE CAS D'UTILISATION SIMPLIFIES =====" -ForegroundColor Cyan
Write-Host ""

# Vérifier si PlantUML JAR existe
if (-not (Test-Path "plantuml.jar")) {
    Write-Host "PlantUML non trouvé. Téléchargement en cours..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://github.com/plantuml/plantuml/releases/download/v1.2023.12/plantuml-1.2023.12.jar" -OutFile "plantuml.jar"
        Write-Host "✅ PlantUML téléchargé avec succès!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erreur lors du téléchargement de PlantUML: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ PlantUML déjà présent" -ForegroundColor Green
}

# Créer le dossier images s'il n'existe pas
$imagesPath = "rapport_latex\images"
if (-not (Test-Path $imagesPath)) {
    New-Item -ItemType Directory -Path $imagesPath -Force | Out-Null
    Write-Host "✅ Dossier images créé" -ForegroundColor Green
}

Write-Host ""
Write-Host "Génération des diagrammes..." -ForegroundColor Yellow

# Diagrammes à générer
$diagrams = @(
    @{
        Source = "rapport_latex\plantuml\usecase_diagram_simple.puml"
        Name = "usecase_diagram_simple.png"
        Description = "Diagramme principal simplifié"
    },
    @{
        Source = "rapport_latex\plantuml\usecase_diagram_simple_clean.puml"
        Name = "usecase_diagram_simple_clean.png"
        Description = "Version épurée"
    }
)

$successCount = 0
$totalCount = $diagrams.Count

foreach ($diagram in $diagrams) {
    try {
        Write-Host "  • $($diagram.Description)..." -NoNewline
        
        # Générer le diagramme
        $process = Start-Process -FilePath "java" -ArgumentList "-jar", "plantuml.jar", "-tpng", $diagram.Source -Wait -PassThru -NoNewWindow -WindowStyle Hidden
        
        if ($process.ExitCode -eq 0) {
            # Déplacer vers le dossier images
            $sourcePath = $diagram.Source -replace "\.puml$", ".png"
            $destPath = Join-Path $imagesPath $diagram.Name
            
            if (Test-Path $sourcePath) {
                Move-Item $sourcePath $destPath -Force
                Write-Host " ✅" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host " ❌ (fichier non généré)" -ForegroundColor Red
            }
        } else {
            Write-Host " ❌ (erreur génération)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host " ❌ (exception: $($_.Exception.Message))" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===== RESULTAT =====" -ForegroundColor Cyan
Write-Host "Diagrammes générés: $successCount/$totalCount" -ForegroundColor $(if ($successCount -eq $totalCount) {"Green"} else {"Yellow"})

if ($successCount -gt 0) {
    Write-Host ""
    Write-Host "Fichiers disponibles dans $imagesPath :" -ForegroundColor White
    Get-ChildItem $imagesPath -Name "*usecase*simple*" | ForEach-Object {
        $size = (Get-Item (Join-Path $imagesPath $_)).Length
        $sizeKB = [math]::Round($size / 1KB, 1)
        Write-Host "  • $_ ($sizeKB KB)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "===== INSTRUCTIONS D'UTILISATION =====" -ForegroundColor Cyan
Write-Host "1. Utilisez 'usecase_diagram_simple.png' pour remplacer l'ancien diagramme" -ForegroundColor White
Write-Host "2. La version 'clean' est disponible pour une approche encore plus minimaliste" -ForegroundColor White
Write-Host "3. Intégrez dans LaTeX avec: \includegraphics[width=0.8\textwidth]{usecase_diagram_simple.png}" -ForegroundColor White

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
