# Start Frontend Server
Write-Host "================================" -ForegroundColor Green
Write-Host "Starting Frontend Server" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Set-Location -Path "$PSScriptRoot\frontend"

Write-Host "Starting Next.js on http://localhost:3000..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Waiting for compilation... This may take 10-15 seconds." -ForegroundColor Yellow
Write-Host ""

# Start the frontend server
npm run dev

Write-Host ""
Write-Host "Frontend server stopped." -ForegroundColor Red
