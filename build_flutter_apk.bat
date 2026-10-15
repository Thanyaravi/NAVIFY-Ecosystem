@echo off
title Build NAVIFY Android APK
echo ========================================================
echo   Building Native Android APK for Phone Installation
echo ========================================================
echo.
cd /d "%~dp0navify_flutter"
echo Building APK...
call flutter build apk --release
echo.
echo ========================================================
echo APK successfully built!
echo Location: navify_flutter\build\app\outputs\flutter-apk\app-release.apk
echo Copy this file to your Android phone and tap to install!
echo ========================================================
pause
