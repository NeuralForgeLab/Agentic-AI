@echo off
echo.
echo ========================================
echo   TODO APP - STARTING SERVERS
echo ========================================
echo.
echo This will open two PowerShell windows:
echo   1. Backend Server (port 8000)
echo   2. Frontend Server (port 3000)
echo.
echo Please wait 15-20 seconds for servers to start
echo Then your browser will open automatically!
echo.
pause

powershell.exe -ExecutionPolicy Bypass -File "%~dp0START_SERVERS.ps1"
