@echo off
echo Generating simplified use case diagram...

:: Check if PlantUML jar exists, if not download it
if not exist "plantuml.jar" (
    echo Downloading PlantUML...
    curl -L -o plantuml.jar "https://github.com/plantuml/plantuml/releases/download/v1.2023.12/plantuml-1.2023.12.jar"
)

:: Generate the PNG from PlantUML source
echo Generating usecase_diagram_simple.png...
java -jar plantuml.jar -tpng "rapport_latex\plantuml\usecase_diagram_simple.puml" -o "..\images\"

:: Also generate the clean version
echo Generating usecase_diagram_simple_clean.png...
java -jar plantuml.jar -tpng "rapport_latex\plantuml\usecase_diagram_simple_clean.puml" -o "..\images\"

echo Done! Check rapport_latex\images\ for the generated diagrams.
pause
