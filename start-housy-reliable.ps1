# Housy Tunisia - Reliable Startup Script
# This script ensures Node.js is accessible and starts the server

Write-Host "🏗️ Housy Tunisia - Reliable Startup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Add Node.js to PATH for this session
$env:PATH += ";C:\Program Files\nodejs"

# Test Node.js installation
try {
    $nodeVersion = & "C:\Program Files\nodejs\node.exe" --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Test npm
try {
    $npmVersion = & "C:\Program Files\nodejs\npm.cmd" --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not accessible" -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    & "C:\Program Files\nodejs\npm.cmd" install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🚀 Starting Housy Tunisia development server..." -ForegroundColor Cyan
Write-Host "📱 Main application: http://localhost:3000" -ForegroundColor Yellow
Write-Host "🤖 AI Test interface: http://localhost:3000/test-ai-interface.html" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor White

# Start the development server
& "C:\Program Files\nodejs\npm.cmd" run dev

START_HOUSY_WORKING.bat
