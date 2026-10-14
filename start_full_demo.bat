@echo off
title NAVIFY Ecosystem Full Stack Launcher
echo ========================================================
echo   NAVIFY Assistive Ecosystem - Launching Full Stack Demo
echo ========================================================
echo.
echo [1/2] Launching Backend Server in new window...
start "NAVIFY Backend API" cmd /k "%~dp0start_backend_demo.bat"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Mobile Frontend in new window...
start "NAVIFY Mobile App" cmd /k "%~dp0start_mobile_demo.bat"

echo.
echo All services launched!
echo - Mobile App: http://localhost:5173
echo - Backend API: http://localhost:8000
echo - Swagger Docs: http://localhost:8000/docs
echo.
