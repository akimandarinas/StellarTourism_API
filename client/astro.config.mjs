import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Integración con Vue y Tailwind
  integrations: [
    vue({
      jsx: true,
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    }),
    tailwind({
      config: { path: './tailwind.config.js' },
      applyBaseStyles: false
    })
  ],
  
  server: {
    port: 3000,
    host: true
  },
  
  vite: {
    config: {
      configFile: path.resolve(__dirname, 'vite.config.ts'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@views': path.resolve(__dirname, './src/views'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@composables': path.resolve(__dirname, './src/composables'),
        '@ui': path.resolve(__dirname, './src/ui'),
        '@form': path.resolve(__dirname, './src/components/form'),
        '@3d': path.resolve(__dirname, './src/components/3d'),
        '@payment': path.resolve(__dirname, './src/services/payment')
      }
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/lucide-vue-next/, /node_modules/]
      }
    },
    optimizeDeps: {
      include: ['lucide-vue-next']
    }
  },
  
  output: 'hybrid'
});