@echo off
:: SOVR Cryptographic Ledger Network Launcher
:: Setup and activate the Sovereign CommandCenter on localhost:3000

title SOVR LEDGER RUNTIME METRICS

echo ======================================================================
echo    SOVR CRYPTOGRAPHIC LEDGER NETWORK ^& ACCOUNT CENTER BOOTSTRAPPER
echo ======================================================================
echo.

:: Step 1: Detect Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js runtime not detected in path.
    echo Please install Node.js (v18 or higher) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js env verified.
node -v
echo.

:: Step 2: Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo [SYSTEM] First-time setup detected. Restoring packages...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install npm dependencies.
        pause
        exit /b %ERRORLEVEL%
    )
) else (
    echo [SYSTEM] Node packages verified in node_modules directory.
)

echo.
echo ======================================================================
echo  ACTIVATING LOCAL SOVEREIGN COMMAND CENTER
echo  Console will be available shortly on local port 3000:
echo  URL: http://localhost:3000
echo ======================================================================
echo.

:: Step 3: Run Dev Server
call npm run dev
