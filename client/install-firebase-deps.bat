@echo off
echo ===================================================
echo Instalando dependencias de Firebase y date-fns...
echo ===================================================

REM Instalar Firebase y sus componentes
call npm install firebase@10.8.0 --save

REM Instalar date-fns y sus componentes
call npm install date-fns@3.3.1 --save

echo.
echo ===================================================
echo Verificando instalación...
echo ===================================================
call npm list firebase
call npm list date-fns

echo.
echo ===================================================
echo Limpiando caché de Vite...
echo ===================================================
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Caché de Vite eliminada.
) else (
    echo No se encontró caché de Vite.
)

echo.
echo ===================================================
echo Instalación completada.
echo ===================================================
echo Ahora puedes ejecutar 'npm run dev' para iniciar el servidor.
echo.