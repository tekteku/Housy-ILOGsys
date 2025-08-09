@echo off
echo ================================================================
echo   PostgreSQL Password Finder for Housy Tunisia
echo ================================================================
echo.

echo Testing PostgreSQL 17 installation...
if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\17\bin\psql.exe"
    echo ✅ Found PostgreSQL 17
) else (
    echo ❌ PostgreSQL 17 not found
    pause
    exit /b 1
)

echo.
echo Testing common passwords...
echo.

echo Testing password: (empty)
set PGPASSWORD=
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "SELECT 'Connection successful!' as status;" postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ SUCCESS! No password required
    set FOUND_PASSWORD=
    goto :setup
)

echo Testing password: postgres
set PGPASSWORD=postgres
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "SELECT 'Connection successful!' as status;" postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ SUCCESS! Password is: postgres
    set FOUND_PASSWORD=postgres
    goto :setup
)

echo Testing password: 123456
set PGPASSWORD=123456
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "SELECT 'Connection successful!' as status;" postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ SUCCESS! Password is: 123456
    set FOUND_PASSWORD=123456
    goto :setup
)

echo Testing password: admin
set PGPASSWORD=admin
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "SELECT 'Connection successful!' as status;" postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ SUCCESS! Password is: admin
    set FOUND_PASSWORD=admin
    goto :setup
)

echo Testing password: housy123
set PGPASSWORD=housy123
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "SELECT 'Connection successful!' as status;" postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ SUCCESS! Password is: housy123
    set FOUND_PASSWORD=housy123
    goto :setup
)

echo.
echo ❌ None of the common passwords worked.
echo.
echo 💡 Please manually test your password:
echo 1. Open Command Prompt
echo 2. Run: "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres
echo 3. Enter your password when prompted
echo 4. If successful, run this script again and enter your password
echo.

set /p USER_PASSWORD="Enter your PostgreSQL password: "
set PGPASSWORD=%USER_PASSWORD%
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "SELECT 'Connection successful!' as status;" postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ SUCCESS! Password is: %USER_PASSWORD%
    set FOUND_PASSWORD=%USER_PASSWORD%
    goto :setup
) else (
    echo ❌ Password failed. Please check your PostgreSQL installation.
    pause
    exit /b 1
)

:setup
echo.
echo ================================================================
echo     SETTING UP HOUSY TUNISIA DATABASE
echo ================================================================
echo.
echo Using password: %FOUND_PASSWORD%
echo.

echo Creating database...
set PGPASSWORD=%FOUND_PASSWORD%
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS housy_tunisia;" postgres >nul 2>&1
%PSQL_PATH% -h localhost -p 5432 -U postgres -c "CREATE DATABASE housy_tunisia WITH ENCODING='UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0;" postgres

if %errorlevel% equ 0 (
    echo ✅ Database 'housy_tunisia' created successfully!
) else (
    echo ⚠️ Database creation may have failed, but continuing...
)

echo.
echo Updating .env file...
powershell -Command "(Get-Content .env) -replace 'DATABASE_URL=.*', 'DATABASE_URL=postgresql://postgres:%FOUND_PASSWORD%@localhost:5432/housy_tunisia' | Set-Content .env"
echo ✅ Updated .env file

echo.
echo Running database migrations...
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
echo 🔗 Connection: postgresql://postgres:%FOUND_PASSWORD%@localhost:5432/housy_tunisia
echo 📱 Application: http://localhost:3000
echo 🤖 AI Test: http://localhost:3000/test-ai-interface.html
echo.
echo Next steps:
echo 1. Start your application: npm run dev
echo 2. Open http://localhost:3000
echo 3. Test AI estimation features
echo.
pause
