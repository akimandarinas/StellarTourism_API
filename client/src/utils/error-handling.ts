import type { App } from "vue"
import { isClient } from "./ssr-safe"

// Configurar manejo de errores
export function setupErrorHandling(app: App) {
  // Configurar manejador global de errores
  app.config.errorHandler = (err, instance, info) => {
    console.error("Global error handler:", err)
    console.error("Component:", instance)
    console.error("Info:", info)

    // Enviar error a un servicio de monitoreo
    if (isClient && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("app-error", {
          detail: { error: err, component: instance?.$options?.name, info },
        }),
      )
    }
  }

  // Configurar manejador de errores no capturados
  if (isClient) {
    window.addEventListener("error", (event) => {
      console.error("Uncaught error:", event.error)

      // Enviar error a un servicio de monitoreo
      if (window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent("app-error", {
            detail: { error: event.error, type: "uncaught" },
          }),
        )
      }
    })

    // Configurar manejador de promesas no capturadas
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason)

      // Enviar error a un servicio de monitoreo
      if (window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent("app-error", {
            detail: { error: event.reason, type: "unhandledrejection" },
          }),
        )
      }
    })
  }
}
