@echo off
title NAVIFY Flutter Mobile App
echo ========================================================
echo   NAVIFY Assistive Ecosystem - Native Flutter Mobile
echo ========================================================
echo.
echo Checking Flutter devices...
cd /d "%~dp0navify_flutter"
call flutter run
pause
