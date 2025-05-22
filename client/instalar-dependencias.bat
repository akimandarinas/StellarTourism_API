@echo off
echo ===================================================
echo Instalando dependencias para Stellar Tourism (Windows)
echo ===================================================

echo.
echo [1/4] Limpiando cache de npm...
call npm cache clean --force

echo.
echo [2/4] Instalando dependencias principales...
call npm install @astrojs/vue@4.0.8 @stripe/stripe-js@2.2.0 astro@4.16.18 axios@1.6.2 jwt-decode@4.0.0 lucide-vue-next@0.294.0 pinia@2.1.7 three@0.159.0 vue@3.3.8 vue-router@4.2.5

echo.
echo [3/4] Instalando dependencias de desarrollo...
call npm install -D @types/node@20.10.0 @types/three@0.159.0 @vitejs/plugin-vue@4.5.0 autoprefixer@10.4.16 postcss@8.4.31 tailwindcss@3.3.5 typescript@5.3.2 vite@5.0.2

echo.
echo [4/4] Limpiando cache de Vite...
if exist "node_modules\.vite" (
  echo Eliminando carpeta node_modules\.vite...
  rmdir /s /q "node_modules\.vite"
)

echo.
echo ===================================================
echo Instalacion completada!
echo ===================================================
echo.
echo Para iniciar el servidor de desarrollo, ejecuta:
echo npm run dev
echo.
pause
