# Main Startup Script for Todo App
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  TODO APP - PHASE II STARTUP" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Kill any existing processes
Write-Host "Cleaning up any existing processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend in new window
Write-Host "Starting Backend Server (new window)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start-backend.ps1"
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "Starting Frontend Server (new window)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start-frontend.ps1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  SERVERS STARTING!" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Two PowerShell windows have opened:" -ForegroundColor Yellow
Write-Host "  1. Backend Server (Blue)" -ForegroundColor Cyan
Write-Host "  2. Frontend Server (Green)" -ForegroundColor Green
Write-Host ""
Write-Host "WAIT 15-20 SECONDS for both to start!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open your browser to:" -ForegroundColor White
Write-Host "  http://localhost:3000" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
Write-Host "Press any key to open browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Browser should open now!" -ForegroundColor Green
Write-Host ""
Write-Host "To stop servers: Close the two PowerShell windows" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
