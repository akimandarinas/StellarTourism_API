@echo off
echo Verificando la instalación de Vue Router...

cd %~dp0
echo Directorio actual: %CD%

echo Comprobando si vue-router está instalado...
npm list vue-router

if %ERRORLEVEL% NEQ 0 (
  echo Vue Router no está instalado correctamente. Instalando...
  npm uninstall vue-router
  npm install vue-router@4.2.5 --save
) else (
  echo Vue Router está instalado. Verificando la versión...
)

echo Verificando la instalación de Vue...
npm list vue

echo Limpiando caché...
rmdir /s /q node_modules\.vite
npm cache clean --force

echo Verificación completa.
pause
