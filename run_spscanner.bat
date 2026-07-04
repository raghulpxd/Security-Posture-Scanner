@echo off
title SPScanner Launcher
echo ==========================================
echo         Starting SPScanner...
echo ==========================================
echo.

set ROOT=%~dp0

echo Make sure Ollama is running in the background before using the Fix Assistant.
timeout /t 2 >nul

REM -----------------------------
REM Start backend
REM -----------------------------
echo Starting backend...
start "SPScanner Backend" cmd /k "cd /d "%ROOT%backend" && call venv\Scripts\activate && uvicorn app.main:app --reload"

REM -----------------------------
REM Start frontend
REM -----------------------------
echo Starting frontend...
start "SPScanner Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev"

echo.
echo SPScanner launch commands started.
echo.
echo Required for full app:
echo - Backend terminal running
echo - Frontend terminal running
echo - Ollama running in background
echo.
pause