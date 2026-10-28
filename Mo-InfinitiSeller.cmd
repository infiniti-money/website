@echo off
cd /d "%~dp0"
node scripts/run-framework.mjs dev --port 5175
pause
