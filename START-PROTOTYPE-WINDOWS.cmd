@echo off
setlocal

cd /d "%~dp0"

echo.
echo ==========================================
echo  Self Photo Preview - Local Prototype
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terinstall atau belum ada di PATH.
  echo Install Node.js dulu, lalu jalankan file ini lagi.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Menginstall dependency pertama kali...
  call npm install
  if errorlevel 1 (
    echo Gagal npm install.
    pause
    exit /b 1
  )
)

echo Membuka prototype di browser...
start "" "http://127.0.0.1:5174/admin/session"
echo.
echo Server berjalan di:
echo http://127.0.0.1:5174/admin/session
echo.
echo Untuk berhenti, tekan Ctrl+C di jendela ini.
echo.

call npm run dev -- --host 127.0.0.1 --port 5174

pause
