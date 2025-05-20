@echo off
echo ===================================================
echo Solucionador de problemas para Stellar Tourism (Windows)
echo ===================================================

echo.
echo [1/5] Verificando instalacion de Node.js...
node --version
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Node.js no esta instalado o no esta en el PATH.
  echo Por favor, instala Node.js desde https://nodejs.org/
  pause
  exit /b 1
)

echo.
echo [2/5] Verificando instalacion de npm...
npm --version
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: npm no esta instalado o no esta en el PATH.
  echo Por favor, reinstala Node.js desde https://nodejs.org/
  pause
  exit /b 1
)

echo.
echo [3/5] Limpiando cache de npm...
call npm cache clean --force

echo.
echo [4/5] Eliminando node_modules y package-lock.json...
if exist "node_modules" (
  echo Eliminando carpeta node_modules...
  rmdir /s /q "node_modules"
)

if exist "package-lock.json" (
  echo Eliminando package-lock.json...
  del /f "package-lock.json"
)

echo.
echo [5/5] Reinstalando todas las dependencias...
call npm install

echo.
echo ===================================================
echo Reparacion completada!
echo ===================================================
echo.
echo Para iniciar el servidor de desarrollo, ejecuta:
echo npm run dev
echo.
pause
