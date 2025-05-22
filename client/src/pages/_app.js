// Archivo de entrada para la integración de Vue con Astro 
import { createApp } from "vue"

import LoadingSpinner from "../components/common/LoadingSpinner.vue"
import Notifications from "../components/common/Notifications.vue"

export default function createVueApp() {
  const app = createApp({})

  app.component("LoadingSpinner", LoadingSpinner)
  app.component("Notifications", Notifications)

  app.config.globalProperties.$isBrowser = typeof window !== "undefined"

  app.config.errorHandler = (err, vm, info) => {
    console.error("Error en componente Vue:", err)
    console.error("Información adicional:", info)

    if (typeof window !== "undefined" && window.errorReporter) {
      window.errorReporter.captureError(err, {
        component: vm.$options.name || "Unknown",
        info,
      })
    }
  }

  return app
}
