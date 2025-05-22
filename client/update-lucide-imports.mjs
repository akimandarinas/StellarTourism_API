// update-lucide-imports.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Actualizando importaciones de lucide-vue-next...');

// Función para buscar archivos recursivamente
function findFiles(dir, pattern) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory() && file !== 'node_modules' && file !== '.git') {
        results = results.concat(findFiles(filePath, pattern));
      } else if (pattern.test(file)) {
        results.push(filePath);
      }
    }
  } catch (error) {
    console.error(`Error al buscar en ${dir}: ${error.message}`);
  }
  
  return results;
}

// Buscar archivos Vue y JavaScript
const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir, /\.(vue|js|ts)$/);

let updatedFiles = 0;

// Procesar cada archivo
for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Buscar importaciones de lucide-vue-next
    const lucideImportRegex = /import\s+{([^}]*)}\s+from\s+['"]lucide-vue-next['"]/g;
    const matches = content.match(lucideImportRegex);
    
    if (matches) {
      // Reemplazar importaciones directas por importaciones desde el adaptador
      content = content.replace(
        lucideImportRegex,
        'import {$1} from \'@/utils/lucide-adapter\''
      );
      
      // Si el contenido ha cambiado, escribir el archivo
      if (content !== originalContent) {
        fs.writeFileSync(file, content);
        updatedFiles++;
        console.log(`✅ Actualizado: ${file}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error al procesar ${file}: ${error.message}`);
  }
}

console.log(`\n¡Actualización completada! Se actualizaron ${updatedFiles} archivos.`);
console.log('Por favor, reinicia el servidor de desarrollo para aplicar los cambios.');