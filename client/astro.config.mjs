import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  // Integración con Vue
  integrations: [
    vue({
      // Opciones de la integración de Vue
      jsx: true,
      // Usar solo renderizado en cliente
      clientOnly: true
    })
  ],
  
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    host: true
  },
  
  // Configuración de Vite
  vite: {
    // Desactivar SSR completamente
    ssr: false,
    // Configuración de optimización de dependencias
    optimizeDeps: {
      include: ['vue', 'vue-router']
    }
  },
  
  // Configuración de salida - Cambiado a 'server' para manejar rutas dinámicas
  output: 'server'
});
