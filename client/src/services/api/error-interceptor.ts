/**
 * Interceptor de errores para Axios
 *
 * Este interceptor se encarga de normalizar los errores de la API
 * para que sean compatibles con lo que espera el cliente.
 */

import type { AxiosError, AxiosInstance } from "axios"
import { logError, normalizeApiError } from "../../utils/error-manager"

/**
 * Configura el interceptor de errores para una instancia de Axios
 * @param axiosInstance Instancia de Axios
 */
export function setupErrorInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Normalizar el error
      const normalizedError = normalizeApiError({
        code: error.code || `error_${error.response?.status || "unknown"}`,
        message: error.message || "Error desconocido",
        status: error.response?.status,
        statusText: error.response?.statusText,
        details: error.response?.data,
        originalError: error,
      })

      // Registrar el error
      logError(normalizedError)

      // Rechazar la promesa con el error normalizado
      return Promise.reject(normalizedError)
    },
  )
}

/**
 * Normaliza un error de Axios
 * @param error Error de Axios
 * @returns Error normalizado
 */
export function normalizeAxiosError(error: AxiosError): any {
  // Si no hay respuesta, es un error de red
  if (!error.response) {
    return {
      code: "network_error",
      message: "Error de red: No se pudo conectar con el servidor",
      status: 0,
      details: {
        originalError: error,
        timestamp: new Date().toISOString(),
        type: "network",
        online: navigator.onLine,
      },
    }
  }

  // Obtener datos de la respuesta
  const { status, statusText, data } = error.response

  // Si la respuesta tiene un formato específico, usarlo
  if (data && typeof data === "object") {
    // Formato 1: { status: 'error', message: '...' }
    if (data.status === "error" && data.message) {
      return {
        code: `api_error_${status}`,
        message: data.message,
        status,
        statusText,
        details: {
          ...data,
          originalError: error,
          timestamp: new Date().toISOString(),
        },
      }
    }

    // Formato 2: { error: { code: '...', message: '...' } }
    if (data.error && data.error.message) {
      return {
        code: data.error.code || `api_error_${status}`,
        message: data.error.message,
        status,
        statusText,
        details: {
          ...data,
          originalError: error,
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  // Formato genérico basado en el código de estado HTTP
  let code = "api_error"
  let message = `Error ${status}: ${statusText || "Error desconocido"}`

  // Categorizar por código de estado
  if (status === 401) {
    code = "authentication_error"
    message = "No estás autenticado o tu sesión ha expirado"
  } else if (status === 403) {
    code = "authorization_error"
    message = "No tienes permisos para realizar esta acción"
  } else if (status === 404) {
    code = "not_found"
    message = "El recurso solicitado no existe"
  } else if (status === 422) {
    code = "validation_error"
    message = "Los datos enviados no son válidos"
  } else if (status === 429) {
    code = "rate_limit_exceeded"
    message = "Has excedido el límite de solicitudes. Intenta de nuevo más tarde"
  } else if (status >= 500) {
    code = "server_error"
    message = "Error en el servidor. Intenta de nuevo más tarde"
  }

  return {
    code,
    message,
    status,
    statusText,
    details: {
      data,
      originalError: error,
      timestamp: new Date().toISOString(),
    },
  }
}

export default {
  setupErrorInterceptor,
  normalizeAxiosError,
}
