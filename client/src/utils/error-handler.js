/**
 * Maneja errores de forma consistente en toda la aplicación
 * @param {Error} error - El error capturado
 * @param {string} defaultMessage - Mensaje por defecto si no hay uno específico
 * @returns {Object} - Objeto de error formateado
 */
export function handleError(error, defaultMessage = "Ha ocurrido un error") {
  console.error("Error:", error)

  // Determinar el mensaje de error
  const message = error.response?.data?.message || error.message || defaultMessage

  // Determinar el código de error
  const code = error.response?.status || error.code || "ERROR"

  // Crear un objeto de error formateado
  const formattedError = {
    message,
    code,
    timestamp: new Date().toISOString(),
    isHandled: true,
  }

  // Aquí podríamos añadir lógica para reportar el error a un servicio de monitoreo

  // Devolver el error formateado
  return Promise.reject(formattedError)
}

/**
 * Muestra un mensaje de error al usuario
 * @param {Object|string} error - El error a mostrar
 */
export function showErrorMessage(error) {
  const message = typeof error === "string" ? error : error.message || "Ha ocurrido un error"

  // Aquí podríamos implementar lógica para mostrar el error en la UI
  // Por ejemplo, usando un sistema de notificaciones
  console.error("Error UI:", message)

  // Si tenemos un sistema de notificaciones global
  if (window.$notify) {
    window.$notify({
      type: "error",
      title: "Error",
      text: message,
    })
  }
}

/**
 * Registra un error en el sistema de logs
 * @param {Error|Object|string} error - El error a registrar
 * @param {Object} context - Contexto adicional del error
 */
export function logError(error, context = {}) {
  // Formatear el error para el log
  const logEntry = {
    message: typeof error === "string" ? error : error.message || "Error desconocido",
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
  }

  // Log en consola (en producción esto iría a un servicio de logs)
  console.error("Error Log:", logEntry)

  // Aquí podríamos enviar el error a un servicio de logs externo
}

/**
 * Objeto con funciones de utilidad para manejo de errores
 */
export const errorUtils = {
  handleError,
  showErrorMessage,
  logError,
}

// Exportar por defecto para facilitar la importación
export default {
  handleError,
  showErrorMessage,
  logError,
}
