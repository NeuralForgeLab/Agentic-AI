@echo off
echo ====================================
echo Starting Todo App Servers
echo ====================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && uvicorn app.main:app --reload --port 8000"
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ====================================
echo Servers Starting!
echo ====================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Wait 10-15 seconds for both servers to be ready...
echo Then open: http://localhost:3000 in your browser
echo.
echo Press any key to open browser automatically...
pause > nul

start http://localhost:3000

echo.
echo Browser should open now!
echo If not, manually open: http://localhost:3000
echo.
echo To stop servers: Close the two command windows that opened
echo.
