# Housy Tunisia - Safe Startup Script
# This script will set up and start the Housy application safely

param(
    [switch]$Clean,
    [switch]$Install,
    [switch]$Dev,
    [switch]$Production
)

Write-Host "🏗️ Housy Tunisia - Safe Startup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Clean node_modules if requested
if ($Clean) {
    Write-Host "🧹 Cleaning node_modules and package-lock.json..." -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
    }
    Write-Host "✅ Cleanup completed" -ForegroundColor Green
}

# Install dependencies
if ($Install -or $Clean -or !(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️ .env file not found. Using default development configuration." -ForegroundColor Yellow
    Write-Host "💡 You can configure .env file for custom settings." -ForegroundColor Cyan
}

# Start the application
if ($Production) {
    Write-Host "🚀 Building and starting in production mode..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -eq 0) {
        npm start
    }
} elseif ($Dev -or $true) {
    Write-Host "🚀 Starting in development mode..." -ForegroundColor Cyan
    npm run dev
}

Write-Host "🎉 Housy Tunisia is ready!" -ForegroundColor Green
Write-Host "📱 Open your browser and navigate to: http://localhost:3000" -ForegroundColor Cyan