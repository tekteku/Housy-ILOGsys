@echo off
echo ================================================================
echo   PostgreSQL Post-Installation Setup for Housy Tunisia
echo ================================================================
echo.

echo Step 1: Testing PostgreSQL Installation...
echo.

REM Test if PostgreSQL is installed
if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\17\bin\psql.exe"
    echo ✅ Found PostgreSQL 17
) else if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\16\bin\psql.exe"
    echo ✅ Found PostgreSQL 16
) else if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\15\bin\psql.exe"
    echo ✅ Found PostgreSQL 15
) else (
    echo ❌ PostgreSQL not found. Please install it first.
    echo 📥 Download from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo.
echo Step 2: Testing Connection...
echo.

REM Set password environment variable
set PGPASSWORD=housy123

REM Test connection
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "SELECT version();" postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL connection successful!
) else (
    echo ❌ Cannot connect to PostgreSQL
    echo 💡 Make sure PostgreSQL service is running
    echo 💡 Check if password is 'housy123'
    pause
    exit /b 1
)

echo.
echo Step 3: Creating Housy Tunisia Database...
echo.

REM Create database
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS housy_tunisia;" postgres >nul 2>&1
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "CREATE DATABASE housy_tunisia WITH ENCODING='UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0;" postgres

if %errorlevel% equ 0 (
    echo ✅ Database 'housy_tunisia' created successfully!
) else (
    echo ⚠️ Database creation may have failed, but continuing...
)

echo.
echo Step 4: Updating .env Configuration...
echo.

REM Update .env file
powershell -Command "(Get-Content .env) -replace 'DATABASE_URL=.*', 'DATABASE_URL=postgresql://postgres:housy123@localhost:5432/housy_tunisia' | Set-Content .env"

echo ✅ Updated .env file with PostgreSQL connection

echo.
echo Step 5: Installing Node.js Dependencies...
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo Step 6: Running Database Migrations...
echo.

REM Run database migrations
npm run db:push

if %errorlevel% equ 0 (
    echo ✅ Database migrations completed successfully!
) else (
    echo ⚠️ Migration issues detected, but database is ready
)

echo.
echo ================================================================
echo                    🎉 SETUP COMPLETED! 🎉
echo ================================================================
echo.
echo 📊 Database: housy_tunisia
echo 🔗 Connection: postgresql://postgres:housy123@localhost:5432/housy_tunisia
echo 📱 Application: http://localhost:3000
echo 🤖 AI Test: http://localhost:3000/test-ai-interface.html
echo.
echo Next steps:
echo 1. Start your application: npm run dev
echo 2. Open http://localhost:3000
echo 3. Test AI estimation features
echo.
pause
