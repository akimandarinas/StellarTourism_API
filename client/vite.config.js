import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "url"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      src: fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    watch: {
      usePolling: true, // Ayuda con problemas de actualización de archivos en Windows
    },
  },
  optimizeDeps: {
    include: ["vue", "vue-router", "pinia", "axios", "@stripe/stripe-js", "jwt-decode", "three"],
  },
  build: {
    sourcemap: true,
    // Mejorar el manejo de errores durante la compilación
    chunkSizeWarningLimit: 1000,
    // Evitar problemas con rutas largas en Windows
    rollupOptions: {
      output: {
        manualChunks: {
          "vue-vendor": ["vue", "vue-router", "pinia"],
          "ui-vendor": ["lucide-vue-next"],
          "api-vendor": ["axios"],
          "three-vendor": ["three"],
        },
      },
    },
  },
  // Asegurarse de que las variables de entorno estén disponibles
  define: {
    "import.meta.env.PUBLIC_API_URL": JSON.stringify(process.env.PUBLIC_API_URL || "http://localhost:8000/api"),
    "import.meta.env.VUE_APP_VERSION": JSON.stringify(process.env.VUE_APP_VERSION || "0.1.0"),
  },
})
