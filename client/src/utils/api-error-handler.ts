/**
 * Utilidades para el manejo de errores de la API
 */

import type { ApiResponse, Result } from "../types/api"
import type { AxiosError } from "axios"

// Tipos de errores
export interface ApiErrorBase {
  code: string
  message: string
  status?: number
  statusText?: string
  details?: any
  originalError?: any
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  code?: string
  status?: number
}

/**
 * Procesa una respuesta de API y la convierte a un formato estándar
 * @param response Respuesta de fetch
 * @returns Respuesta de API en formato estándar
 */
export async function processApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const headers = Object.fromEntries(response.headers.entries())
  const requestId = headers["x-request-id"] || ""
  const timestamp = new Date().toISOString()

  // Registrar métricas de rendimiento
  const responseTime = headers["x-response-time"] || ""
  const serverTiming = headers["server-timing"] || ""

  try {
    // Intentar parsear como JSON
    const data = await response.json()

    // Respuesta exitosa
    if (response.ok) {
      return {
        success: true,
        data: data as T,
        status: response.status,
        headers,
        message: data.message || "Operación exitosa",
        metadata: {
          requestId,
          timestamp,
          responseTime,
          serverTiming,
          endpoint: response.url,
          method: "GET", // Idealmente deberíamos capturar el método real
        },
      }
    }

    // Respuesta de error con datos
    const errorCode = data.error?.code || `error_${response.status}`
    const errorMessage = data.error?.message || data.message || `Error ${response.status}: ${response.statusText}`
    const errorDetails = data.error?.details || data.details || {}

    throw {
      message: errorMessage,
      code: errorCode,
      status: response.status,
      statusText: response.statusText,
      data: errorDetails,
      details: {
        requestId,
        timestamp,
        responseTime,
        serverTiming,
        endpoint: response.url,
        rawError: data,
      },
    }
  } catch (error) {
    // Error al parsear JSON o error lanzado manualmente
    if (error instanceof SyntaxError) {
      // No es JSON válido, intentar obtener texto
      const text = await response.text()
      throw {
        message: `Error al procesar la respuesta: ${response.statusText}`,
        code: "parse_error",
        status: response.status,
        statusText: response.statusText,
        details: {
          requestId,
          timestamp,
          responseTime,
          serverTiming,
          endpoint: response.url,
          responseText: text.substring(0, 500), // Limitar tamaño
        },
      }
    }

    // Re-lanzar el error ya formateado
    throw error
  }
}

/**
 * Maneja errores de fetch y los convierte a un formato estándar
 * @param error Error original
 * @returns Error en formato estándar
 */
export function handleFetchError(error: unknown): ApiErrorBase {
  // Generar un ID único para este error
  const errorId = `api_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Capturar información de rendimiento
  const performanceInfo = {
    timing:
      window.performance && window.performance.timing
        ? {
            navigationStart: window.performance.timing.navigationStart,
            loadEventEnd: window.performance.timing.loadEventEnd,
            domComplete: window.performance.timing.domComplete,
          }
        : "unavailable",
    memory:
      window.performance && window.performance.memory
        ? {
            usedJSHeapSize: window.performance.memory.usedJSHeapSize,
            totalJSHeapSize: window.performance.memory.totalJSHeapSize,
          }
        : "unavailable",
  }

  // Error de red (sin conexión, CORS, etc.)
  if (error instanceof TypeError) {
    return {
      message: "Error de red: No se pudo conectar con el servidor",
      code: "network_error",
      status: 0,
      details: {
        originalError: error,
        errorId,
        timestamp: new Date().toISOString(),
        type: "network",
        performance: performanceInfo,
        online: navigator.onLine,
        connectionType: navigator.connection ? navigator.connection.effectiveType : "unknown",
      },
    }
  }

  // Error de timeout
  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      message: "La solicitud ha excedido el tiempo de espera",
      code: "timeout",
      status: 408,
      details: {
        originalError: error,
        errorId,
        timestamp: new Date().toISOString(),
        type: "timeout",
        performance: performanceInfo,
      },
    }
  }

  // Error de respuesta HTTP
  if (error instanceof Response) {
    const status = error.status
    let code = "api_error"
    let message = `Error ${status}: ${error.statusText || "Error desconocido"}`

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
      message,
      code,
      status,
      statusText: error.statusText,
      details: {
        originalError: error,
        errorId,
        timestamp: new Date().toISOString(),
        url: error.url,
        type: "http",
        performance: performanceInfo,
      },
    }
  }

  // Error de API ya formateado
  if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
    const apiError = error as Partial<ApiErrorBase>
    return {
      message: apiError.message || "Error desconocido",
      code: apiError.code || "unknown_error",
      status: apiError.status || 500,
      statusText: apiError.statusText,
      details: {
        ...apiError.details,
        errorId,
        timestamp: new Date().toISOString(),
        performance: performanceInfo,
      },
    }
  }

  // Error genérico
  return {
    message: error instanceof Error ? error.message : "Error desconocido",
    code: "unknown_error",
    status: 500,
    details: {
      originalError: error,
      errorId,
      timestamp: new Date().toISOString(),
      type: "unknown",
      performance: performanceInfo,
      errorObject: typeof error === "object" ? { ...error } : error,
    },
  }
}

/**
 * Registra un error de API en un servicio centralizado
 * @param error Error de API
 * @param context Contexto adicional
 */
export async function logApiError(error: ApiErrorBase, context: Record<string, any> = {}): Promise<void> {
  // Evitar bucles infinitos si el error es del servicio de logging
  if (error.details?.endpoint?.includes("/api/log")) {
    console.error("Error en el servicio de logging, no se registrará:", error)
    return
  }

  try {
    // Preparar datos para el registro
    const logData = {
      error: {
        message: error.message,
        code: error.code,
        status: error.status,
        statusText: error.statusText,
      },
      details: error.details || {},
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        appVersion: process.env.VUE_APP_VERSION || "unknown",
      },
    }

    // Enviar a un endpoint de logging (podría ser un servicio externo como Sentry)
    // O almacenar localmente si estamos offline
    if (navigator.onLine) {
      const response = await fetch("/api/log/client-error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
        // No usar el cliente API normal para evitar bucles infinitos
      })

      if (!response.ok) {
        console.error("Error al registrar error de API:", await response.text())
      }
    } else {
      // Almacenar localmente para sincronizar más tarde
      const storedErrors = JSON.parse(localStorage.getItem("offlineApiErrors") || "[]")
      storedErrors.push({
        ...logData,
        storedAt: new Date().toISOString(),
      })

      // Limitar a 50 errores para evitar llenar el almacenamiento
      if (storedErrors.length > 50) {
        storedErrors.shift()
      }

      localStorage.setItem("offlineApiErrors", JSON.stringify(storedErrors))
    }
  } catch (loggingError) {
    console.error("Error al registrar error de API:", loggingError)
  }
}

/**
 * Convierte una función asíncrona que puede lanzar errores en una que devuelve un Result
 * @param fn Función a convertir
 * @returns Función que devuelve un Result
 */
export function toResult<T, Args extends any[]>(
  fn: (...args: Args) => Promise<ApiResponse<T>>,
): (...args: Args) => Promise<Result<T>> {
  return async (...args: Args): Promise<Result<T>> => {
    try {
      const startTime = performance.now()
      const response = await fn(...args)
      const endTime = performance.now()

      return {
        success: true,
        data: response.data,
        metadata: {
          ...response.metadata,
          clientDuration: endTime - startTime,
        },
      }
    } catch (error) {
      const apiError = error instanceof Error ? handleFetchError(error) : (error as ApiErrorBase)

      // Registrar el error
      logApiError(apiError, {
        functionName: fn.name,
        arguments: args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg).substring(0, 500) : String(arg))),
      })

      return {
        success: false,
        error: apiError,
      }
    }
  }
}

// Envolver función con manejo de errores
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error(`Error en ${fn.name || "función"}:`, error)
      throw error
    }
  }) as T
}

// Función para obtener un mensaje de error legible
export function getErrorMessage(error: unknown): string {
  // Si es un error de Axios
  if (isAxiosError(error)) {
    // Si hay una respuesta del servidor
    if (error.response) {
      const data = error.response.data as ApiErrorResponse | undefined

      // Si hay un mensaje en la respuesta
      if (data?.message) {
        return data.message
      }

      // Si hay errores de validación
      if (data?.errors) {
        const firstErrorField = Object.keys(data.errors)[0]
        if (firstErrorField && data.errors[firstErrorField].length > 0) {
          return data.errors[firstErrorField][0]
        }
      }

      // Mensaje basado en el código de estado HTTP
      switch (error.response.status) {
        case 400:
          return "Solicitud incorrecta"
        case 401:
          return "No autorizado"
        case 403:
          return "Acceso denegado"
        case 404:
          return "Recurso no encontrado"
        case 422:
          return "Datos de formulario inválidos"
        case 429:
          return "Demasiadas solicitudes"
        case 500:
          return "Error interno del servidor"
        default:
          return `Error ${error.response.status}`
      }
    }

    // Si hay un error de solicitud (red, timeout, etc.)
    if (error.request) {
      return "No se pudo conectar con el servidor"
    }
  }

  // Si es un Error estándar
  if (error instanceof Error) {
    return error.message
  }

  // Para cualquier otro tipo de error
  return "Ha ocurrido un error inesperado"
}

// Función para verificar si es un error de Axios
function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === "object" && error !== null && "isAxiosError" in error
}

// Función para manejar errores de API
export function handleApiError(error: unknown): { message: string; details?: unknown } {
  const message = getErrorMessage(error)

  // Registrar el error en la consola
  console.error("API Error:", error)

  return {
    message,
    details: error,
  }
}

export default {
  getErrorMessage,
  handleApiError,
}
