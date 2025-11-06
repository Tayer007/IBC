@echo off
echo ============================================================
echo   IBC Wastewater Treatment System - Windows Quick Start
echo   Hochschule Koblenz
echo ============================================================
echo.

echo [1/3] Starting Python Backend...
echo.
start cmd /k "cd backend && venv\Scripts\activate && python app.py"

timeout /t 5 /nobreak > nul

echo.
echo [2/3] Starting React Frontend...
echo.
start cmd /k "cd frontend && npm run dev"

echo.
echo [3/3] Opening Dashboard in Browser...
timeout /t 10 /nobreak > nul
start http://localhost:3000

echo.
echo ============================================================
echo   System Started!
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo   Close the terminal windows to stop the servers.
echo ============================================================
echo.
pause
