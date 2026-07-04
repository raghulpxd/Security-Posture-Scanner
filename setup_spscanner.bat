@echo off
title SPScanner Setup
echo ==========================================
echo        SPScanner One-Time Setup
echo ==========================================
echo.

set ROOT=%~dp0

REM -----------------------------
REM Backend setup
REM -----------------------------
echo [1/4] Setting up backend...
cd /d "%ROOT%backend"

IF NOT EXIST venv (
    echo Creating Python virtual environment...
    python -m venv venv
) ELSE (
    echo Virtual environment already exists.
)

call venv\Scripts\activate

echo Installing backend dependencies...
pip install -r requirements.txt

echo.
REM -----------------------------
REM Frontend setup
REM -----------------------------
echo [2/4] Setting up frontend...
cd /d "%ROOT%frontend"

echo Installing frontend dependencies...
npm install

echo.
REM -----------------------------
REM Ollama model setup
REM -----------------------------
echo [3/4] Pulling Ollama Mistral model...
ollama pull mistral

echo.
echo [4/4] Setup complete.
echo.
echo Setup finished successfully.
echo Next time, just run: run_spscanner.bat
pause