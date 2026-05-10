@echo off
echo =========================================
echo      DONUT BOT BASLATMA ARACI
echo =========================================
echo.
echo [1] Botu Baslat
echo [2] Komutlari Yenile (Sunucu - Hizli)
echo [3] Komutlari Yenile (Global - Tum Sunucular)
echo [4] Modulleri Yeniden Yukle
echo [5] Cikis
echo.
echo =========================================
set /p choice=Lutfen bir secenek secin (1-5): 

if "%choice%"=="1" goto start
if "%choice%"=="2" goto deploy-guild
if "%choice%"=="3" goto deploy-global
if "%choice%"=="4" goto install
if "%choice%"=="5" goto exit
goto end

:start
echo.
echo Bot baslatiliyor...
node src/index.js
pause
goto end

:deploy-guild
echo.
echo Sunucu komutlari yukleniyor...
node src/deploy-commands-guild.js
pause
goto end

:deploy-global
echo.
echo Global komutlar yukleniyor...
node src/deploy-commands.js
pause
goto end

:install
echo.
echo Moduller yukleniyor...
npm install
pause
goto end

:exit
exit

:end
