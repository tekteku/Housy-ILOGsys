@echo off
echo 🚀 Démarrage de Housy Admin
echo ===========================
cd /d "c:\Users\TaherCh\Desktop\Essay\Housy\Housy"

echo.
echo 🔧 Arrêt des processus existants...
taskkill /F /IM node.exe 2>nul

echo.
echo 📡 Libération des ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9876') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /F /PID %%a 2>nul

echo.
echo 🌐 Démarrage du serveur sur le port 5000...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
echo 🔐 Identifiants Admin:
echo Username: admin
echo Password: admin123
echo.
echo Pour arrêter: Ctrl+C
echo.

set PORT=5000
npm run dev

pause
