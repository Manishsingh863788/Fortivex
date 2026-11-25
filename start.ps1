# Fortivex AI - PowerShell Launcher
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "   FORTIVEX AI - AUTONOMOUS AI SALES VOICE AGENT" -ForegroundColor Yellow
Write-Host "   TechNova Solutions Enterprise Prototype" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Express Backend on Port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"
Start-Sleep -Seconds 3

Write-Host "Starting Vite React Frontend on Port 5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Start-Sleep -Seconds 2

Write-Host "Launching Dashboard at http://localhost:5173..." -ForegroundColor Green
Start-Process "http://localhost:5173"
