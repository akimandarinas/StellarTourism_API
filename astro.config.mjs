import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'url';
import path from 'path';

// Obtener la ruta del directorio actual
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  // Integración con Vue y Tailwind
  integrations: [
    vue({
      // Opciones de la integración de Vue
      jsx: true,
      // Corregir la ruta del punto de entrada usando rutas absolutas
      appEntrypoint: path.resolve(__dirname, 'client/src/main.js')
    }),
    tailwind({
      // Corregir la ruta de configuración de Tailwind usando rutas absolutas
      config: { path: path.resolve(__dirname, 'client/tailwind.config.js') },
      applyBaseStyles: false
    })
  ],
  
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    host: true
  },
  
  // Configuración de Vite
  vite: {
    // Optimizaciones para SSR
    ssr: {
      noExternal: ['@astrojs/vue'],
      // Excluir bibliotecas problemáticas en SSR
      external: ['firebase', '@stripe/stripe-js', 'three']
    },
    // Configuración de resolución de alias usando rutas absolutas
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client/src')
      }
    },
    optimizeDeps: {
      exclude: ['firebase/auth', 'firebase/app', 'firebase/firestore']
    }
  },
  
  // Configuración de salida
  output: 'hybrid',
  
  // Configuración de imágenes
  image: {
    domains: ['localhost']
  },
  build: {
    assets: 'assets'
  }
});
