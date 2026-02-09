# Start Backend Server
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting Backend Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path "$PSScriptRoot\backend"

Write-Host "Starting uvicorn on http://localhost:8000..." -ForegroundColor Yellow
Write-Host ""

# Start the backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Write-Host ""
Write-Host "Backend server stopped." -ForegroundColor Red
