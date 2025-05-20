// Archivo de entrada para la integración de Vue con Astro
import { createApp } from "vue"

// Importar componentes globales
import LoadingSpinner from "../components/common/LoadingSpinner.vue"
import Notifications from "../components/common/Notifications.vue"

// Función para configurar la aplicación Vue
export default function createVueApp() {
  const app = createApp({})

  // Registrar componentes globales
  app.component("LoadingSpinner", LoadingSpinner)
  app.component("Notifications", Notifications)

  // Configurar propiedades globales
  app.config.globalProperties.$isBrowser = typeof window !== "undefined"

  // Manejar errores globalmente
  app.config.errorHandler = (err, vm, info) => {
    console.error("Error en componente Vue:", err)
    console.error("Información adicional:", info)

    // Enviar error a un servicio de monitoreo (si existe)
    if (typeof window !== "undefined" && window.errorReporter) {
      window.errorReporter.captureError(err, {
        component: vm.$options.name || "Unknown",
        info,
      })
    }
  }

  return app
}
