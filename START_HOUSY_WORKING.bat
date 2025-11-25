@echo off
echo ========================================
echo      Housy Tunisia - Quick Start
echo ========================================
echo.

echo Setting up Node.js environment...
set PATH=%PATH%;C:\Program Files\nodejs

echo Installing/updating dependencies...
"C:\Program Files\nodejs\npm.cmd" install

if %errorlevel% neq 0 (
    echo Failed to install dependencies. Please check Node.js installation.
    pause
    exit /b 1
)

echo.
echo Starting Housy Tunisia in development mode...
echo Open your browser and go to: http://localhost:3000
echo For AI testing go to: http://localhost:3000/test-ai-interface.html
echo.
echo Press Ctrl+C to stop the server
echo.

"C:\Program Files\nodejs\npm.cmd" run dev
