@echo off
TITLE Fortivex AI - TechNova Autonomous Voice Sales Agent
echo =====================================================================
echo    FORTIVEX AI - AUTONOMOUS AI SALES VOICE AGENT
echo    TechNova Solutions Enterprise Prototype
echo =====================================================================
echo.
echo Starting Express Backend on Port 5000...
start cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Vite React Frontend on Port 5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo System launching...
echo Opening Dashboard in your default browser at http://localhost:5173
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
echo Done! Both Backend (5000) and Frontend (5173) are running.
