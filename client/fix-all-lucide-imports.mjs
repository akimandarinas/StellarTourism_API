// fix-all-lucide-imports.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Corrigiendo rutas de importación de lucide-vue-next...');

// Función para buscar archivos recursivamente
function findFiles(dir, pattern) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      
      try {
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory() && file !== 'node_modules' && file !== '.git') {
          results = results.concat(findFiles(filePath, pattern));
        } else if (pattern.test(file)) {
          results.push(filePath);
        }
      } catch (error) {
        console.error(`Error al acceder a ${filePath}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Error al buscar en ${dir}: ${error.message}`);
  }
  
  return results;
}

// Directorio base para la búsqueda
const srcDir = path.join(__dirname, 'src');
console.log(`Buscando archivos en: ${srcDir}`);

if (!fs.existsSync(srcDir)) {
  console.error(`❌ Error: El directorio src no existe: ${srcDir}`);
  process.exit(1);
}

// Buscar todos los archivos .vue, .js, .ts, .astro
const files = findFiles(srcDir, /\.(vue|js|ts|astro)$/);
console.log(`Encontrados ${files.length} archivos para procesar`);

let updatedFiles = 0;

// Corregir importaciones en cada archivo
for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Corregir importaciones de lucide-vue-next
    content = content.replace(
      /import\s+\{\s*([^\}]*)\s*\}\s+from\s+['"]lucide-vue-next['"]/g,
      "import lucideIcons from '@/utils/lucide-adapter';"
    );

    // Si el contenido ha cambiado, escribir el archivo
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      updatedFiles++;
      console.log(`✅ Corregido: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error al procesar ${file}: ${error.message}`);
  }
}

console.log(`\n¡Proceso completado! Se actualizaron ${updatedFiles} archivos.`);
console.log('Por favor, reinicia el servidor de desarrollo para aplicar los cambios.');