@echo off
title Todo Backend Server
cd /d "D:\Zees Per\PGD Data Science with AI-NED\Fundamentals AI\hackaton 2\backend"
echo Starting Backend Server on http://localhost:8000
echo Press Ctrl+C to stop
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
