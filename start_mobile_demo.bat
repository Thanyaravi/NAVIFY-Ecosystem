@echo off
title NAVIFY Mobile App Demo
echo ========================================================
echo   NAVIFY Assistive Navigation Ecosystem - Mobile Demo
echo ========================================================
echo.
echo Starting Vite server on 0.0.0.0 (Phone and Desktop accessible)...
echo.
cd /d "%~dp0\mobile"
call npm run dev -- --host
pause

