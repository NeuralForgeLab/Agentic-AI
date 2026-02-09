@echo off
echo Starting Todo Application Servers...
echo.

start "Backend Server" cmd /k "cd /d \"D:\Zees Per\PGD Data Science with AI-NED\Fundamentals AI\hackaton 2\backend\" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

start "Frontend Server" cmd /k "cd /d \"D:\Zees Per\PGD Data Science with AI-NED\Fundamentals AI\hackaton 2\frontend\" && npm run dev"

echo.
echo Servers starting...
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
echo.
echo Wait 10 seconds then open http://localhost:3000 in your browser
timeout /t 10 /nobreak
start http://localhost:3000
