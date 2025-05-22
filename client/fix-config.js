// fix-config.js
const fs = require('fs');
const path = require('path');

// Determinar qué configuración usar (cambiar a 'root' o 'client')
const configToUse = 'client';

// Rutas a los archivos
const rootTailwindPath = path.resolve('tailwind.config.ts');
const rootAstroPath = path.resolve('astro.config.mjs');
const clientTailwindPath = path.resolve('client/tailwind.config.js');
const clientAstroPath = path.resolve('client/astro.config.mjs');

// Función para copiar un archivo
function copyFile(source, destination) {
  if (fs.existsSync(source)) {
    const content = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(destination, content, 'utf8');
    console.log(`Copied ${source} to ${destination}`);
  } else {
    console.error(`Source file ${source} does not exist`);
  }
}

// Función para crear un backup de un archivo
function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.backup`;
    copyFile(filePath, backupPath);
    return true;
  }
  return false;
}

// Crear backups de todos los archivos de configuración
backupFile(rootTailwindPath);
backupFile(rootAstroPath);
backupFile(clientTailwindPath);
backupFile(clientAstroPath);

// Unificar configuraciones según la opción elegida
if (configToUse === 'root') {
  // Usar configuración de la raíz
  if (fs.existsSync(rootTailwindPath)) {
    copyFile(rootTailwindPath, clientTailwindPath);
  }
  if (fs.existsSync(rootAstroPath)) {
    copyFile(rootAstroPath, clientAstroPath);
  }
  console.log('Root configuration has been copied to client directory');
} else if (configToUse === 'client') {
  // Usar configuración del cliente
  if (fs.existsSync(clientTailwindPath)) {
    copyFile(clientTailwindPath, rootTailwindPath);
  }
  if (fs.existsSync(clientAstroPath)) {
    copyFile(clientAstroPath, rootAstroPath);
  }
  console.log('Client configuration has been copied to root directory');
}

// Crear un archivo .env en la raíz si no existe
const envPath = path.resolve('.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, 'PUBLIC_API_URL=http://localhost:8000/api\n', 'utf8');
  console.log('Created .env file in root directory');
}

// Crear un archivo .env en client si no existe
const clientEnvPath = path.resolve('client/.env');
if (!fs.existsSync(clientEnvPath)) {
  fs.writeFileSync(clientEnvPath, 'PUBLIC_API_URL=http://localhost:8000/api\n', 'utf8');
  console.log('Created .env file in client directory');
}

console.log('Configuration unification completed!');