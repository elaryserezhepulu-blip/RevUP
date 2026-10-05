@echo off
title RevUp server - KEEP THIS WINDOW OPEN
cd /d "%~dp0backend"
echo ============================================================
echo   Starting RevUp...
echo   When you see "listening on http://localhost:4000",
echo   open that address in your browser.
echo.
echo   KEEP THIS WINDOW OPEN while you use RevUp.
echo   Closing it stops the site.
echo ============================================================
echo.
call npm start
echo.
echo (The server stopped. Read any message above, then press a key.)
pause
