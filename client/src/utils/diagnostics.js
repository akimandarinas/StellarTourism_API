// Función para verificar el entorno y mostrar información de diagnóstico
import { version } from "vue" // Importar correctamente desde Vue 3

export function runDiagnostics() {
  console.log("=== DIAGNÓSTICO DE STELLAR TOURISM ===")

  // Verificar entorno
  console.log("Entorno:", import.meta.env ? import.meta.env.MODE : "No disponible")

  // Verificar punto de montaje
  const appElement = document.getElementById("app")
  console.log("Punto de montaje (#app):", appElement ? "Encontrado" : "No encontrado")

  // Verificar Vue
  console.log("Versión de Vue:", version || "No disponible")

  // Verificar rutas
  try {
    const currentRoute = window.location.pathname
    console.log("Ruta actual:", currentRoute)
  } catch (error) {
    console.error("Error al obtener la ruta:", error)
  }

  // Verificar errores
  const errors = []
  const originalError = console.error
  console.error = (...args) => {
    errors.push(args.join(" "))
    originalError.apply(console, args)
  }

  // Restaurar después de 5 segundos
  setTimeout(() => {
    console.error = originalError
    console.log("Errores capturados:", errors.length > 0 ? errors : "Ninguno")
    console.log("=== FIN DEL DIAGNÓSTICO ===")
  }, 5000)
}

// Ejecutar diagnóstico automáticamente
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", runDiagnostics)

  // Exponer función para uso manual
  window.runDiagnostics = runDiagnostics
}
