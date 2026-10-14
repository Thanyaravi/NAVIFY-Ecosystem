@echo off
title NAVIFY Backend API Server Demo
echo ========================================================
echo   NAVIFY Assistive Navigation Ecosystem - Backend Server
echo ========================================================
echo.
cd /d "%~dp0\backend"
echo Checking Python dependencies...
python -m pip install -q -r requirements.txt
echo.
echo Starting FastAPI Uvicorn Server on http://0.0.0.0:8000...
echo Swagger API Docs available at http://localhost:8000/docs
echo.
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
pause
