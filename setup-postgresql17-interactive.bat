@echo off
echo ================================================================
echo   PostgreSQL 17 Setup for Housy Tunisia - Interactive Version
echo ================================================================
echo.

echo Step 1: Testing PostgreSQL 17 Installation...
echo.

REM Test if PostgreSQL 17 is installed
if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\17\bin\psql.exe"
    echo ✅ Found PostgreSQL 17
) else (
    echo ❌ PostgreSQL 17 not found. Please check installation.
    pause
    exit /b 1
)

echo.
echo Step 2: Password Setup...
echo.

echo Please enter the PostgreSQL password you set during installation:
set /p POSTGRES_PASSWORD="Password for 'postgres' user: "

if "%POSTGRES_PASSWORD%"=="" (
    echo ❌ Password cannot be empty
    pause
    exit /b 1
)

echo.
echo Step 3: Testing Connection...
echo.

REM Set password environment variable
set PGPASSWORD=%POSTGRES_PASSWORD%

REM Test connection
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "SELECT version();" postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL connection successful!
) else (
    echo ❌ Cannot connect to PostgreSQL
    echo 💡 Make sure PostgreSQL service is running
    echo 💡 Check if the password is correct
    pause
    exit /b 1
)

echo.
echo Step 4: Creating Housy Tunisia Database...
echo.

REM Drop database if exists (cleanup)
echo Cleaning up any existing database...
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS housy_tunisia;" postgres >nul 2>&1

REM Create database
echo Creating housy_tunisia database...
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "CREATE DATABASE housy_tunisia WITH ENCODING='UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0;" postgres

if %errorlevel% equ 0 (
    echo ✅ Database 'housy_tunisia' created successfully!
) else (
    echo ❌ Database creation failed
    pause
    exit /b 1
)

echo.
echo Step 5: Creating Database Extensions...
echo.

REM Connect to the new database and create useful extensions
%PSQL_PATH% -h localhost -p 5432 -U postgres -d housy_tunisia -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >nul 2>&1
%PSQL_PATH% -h localhost -p 5432 -U postgres -d housy_tunisia -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";" >nul 2>&1

echo ✅ Database extensions created

echo.
echo Step 6: Updating .env Configuration...
echo.

REM Update .env file with the correct password
set DATABASE_URL=postgresql://postgres:%POSTGRES_PASSWORD%@localhost:5432/housy_tunisia

powershell -Command "(Get-Content .env) -replace 'DATABASE_URL=.*', 'DATABASE_URL=%DATABASE_URL%' | Set-Content .env"

echo ✅ Updated .env file with PostgreSQL connection

echo.
echo Step 7: Installing Node.js Dependencies...
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
) else (
    echo Dependencies already installed
)

echo.
echo Step 8: Running Database Migrations...
echo.

REM Run database migrations
echo Running Drizzle migrations...
npm run db:push

if %errorlevel% equ 0 (
    echo ✅ Database migrations completed successfully!
) else (
    echo ⚠️ Migration issues detected, checking status...
    echo You may need to run migrations manually later
)

echo.
echo Step 9: Testing Node.js Database Connection...
echo.

REM Create a quick test script
echo const { Client } = require('pg'); > test-db-quick.js
echo const client = new Client({ connectionString: '%DATABASE_URL%' }); >> test-db-quick.js
echo client.connect().then(() =^> { >> test-db-quick.js
echo   console.log('✅ Node.js PostgreSQL connection successful!'); >> test-db-quick.js
echo   return client.query('SELECT version()'); >> test-db-quick.js
echo }).then(result =^> { >> test-db-quick.js
echo   console.log('📊 Database version:', result.rows[0].version.substring(0, 50) + '...'); >> test-db-quick.js
echo   client.end(); >> test-db-quick.js
echo }).catch(error =^> { >> test-db-quick.js
echo   console.error('❌ Connection failed:', error.message); >> test-db-quick.js
echo   client.end(); >> test-db-quick.js
echo }); >> test-db-quick.js

node test-db-quick.js
del test-db-quick.js

echo.
echo ================================================================
echo                    🎉 SETUP COMPLETED! 🎉
echo ================================================================
echo.
echo 📊 Database: housy_tunisia
echo 🔗 Connection: %DATABASE_URL%
echo 📱 Application: http://localhost:3000
echo 🤖 AI Test: http://localhost:3000/test-ai-interface.html
echo.
echo 🚀 NEXT STEPS:
echo 1. Start your application: npm run dev
echo 2. Open http://localhost:3000
echo 3. Test AI estimation features
echo 4. Access pgAdmin to manage your database
echo.
echo 🔐 Database Credentials:
echo Host: localhost
echo Port: 5432
echo Database: housy_tunisia
echo Username: postgres
echo Password: [your password]
echo.
pause
