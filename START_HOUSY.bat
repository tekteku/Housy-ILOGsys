@echo off
echo ========================================
echo      Housy Tunisia - Quick Start
echo ========================================
echo.

echo Installing Node.js dependencies...
npm install

if %errorlevel% neq 0 (
    echo Failed to install dependencies. Please make sure Node.js is installed.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Starting Housy Tunisia in development mode...
echo Open your browser and go to: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
