@echo off
title Todo App Launcher
echo.
echo ==========================================
echo    TODO APP - PHASE II LAUNCHER
echo ==========================================
echo.

echo Killing any existing processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo Starting Backend Server (Port 8000)...
start "Backend Server" cmd /k "cd /d D:\Zees Per\PGD Data Science with AI-NED\Fundamentals AI\hackaton 2\backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 5 /nobreak >nul

echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d D:\Zees Per\PGD Data Science with AI-NED\Fundamentals AI\hackaton 2\frontend && npm run dev"

echo.
echo ==========================================
echo    SERVERS ARE STARTING!
echo ==========================================
echo.
echo Two new windows should have opened:
echo   - "Backend Server" - FastAPI on port 8000
echo   - "Frontend Server" - Next.js on port 3000
echo.
echo WAIT 15-20 seconds for frontend to compile!
echo.
echo Then open your browser to:
echo   http://localhost:3000
echo.
echo ==========================================
echo.
timeout /t 20 /nobreak

echo Opening browser...
start http://localhost:3000

echo.
echo Press any key to close this launcher window...
echo (Keep the server windows open!)
pause >nul
