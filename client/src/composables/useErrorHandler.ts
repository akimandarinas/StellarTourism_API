import { ref, type Ref, reactive } from "vue"
import type { ApiError } from "@/types/api"

export interface ErrorHandlerOptions {
  logToConsole?: boolean
  logToService?: boolean
  defaultMessage?: string
  captureStack?: boolean
  includeContext?: boolean
  errorPrefix?: string
  groupErrors?: boolean
  maxErrorsStored?: number
}

export interface UseErrorHandlerReturn {
  lastError: Ref<Error | null>
  errors: Ref<Error[]>
  handleError: <T extends Error>(error: unknown, userMessage?: string, context?: Record<string, any>) => T
  clearError: () => void
  clearAllErrors: () => void
  isApiError: (error: unknown) => error is ApiError
  formatErrorMessage: (error: unknown) => string
  getErrorStats: () => { count: number; byType: Record<string, number> }
  isLoading: Ref<boolean>
  withErrorHandling: <T>(fn: () => Promise<T>, context?: string) => Promise<{ data: T | null; error: Error | null }>
}

/**
 * Composable para manejar errores de forma centralizada
 * @param options Opciones de configuración
 * @returns Métodos y estado para manejar errores
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const {
    logToConsole = true,
    logToService = process.env.NODE_ENV === "production",
    defaultMessage = "Ha ocurrido un error inesperado",
    captureStack = true,
    includeContext = true,
    errorPrefix = "",
    groupErrors = true,
    maxErrorsStored = 10,
  } = options

  const lastError = ref<Error | null>(null)
  const errors = ref<Error[]>([])
  const errorStats = reactive<Record<string, number>>({})
  const isLoading = ref(false)

  /**
   * Determina si un error es un ApiError
   */
  const isApiError = (error: unknown): error is ApiError => {
    return typeof error === "object" && error !== null && "status" in error && "message" in error
  }

  /**
   * Formatea un mensaje de error para mostrar al usuario
   */
  const formatErrorMessage = (error: unknown): string => {
    if (typeof error === "string") {
      return error
    }

    if (error instanceof Error) {
      return error.message
    }

    if (isApiError(error)) {
      return error.message || `Error ${error.status}: ${error.statusText || "Error de API"}`
    }

    return defaultMessage
  }

  /**
   * Genera un ID único para el error
   */
  const generateErrorId = (): string => {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Extrae información detallada del error
   */
  const extractErrorDetails = (error: unknown): Record<string, any> => {
    if (!includeContext) return {}

    const details: Record<string, any> = {
      timestamp: new Date().toISOString(),
      errorId: generateErrorId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    // Añadir información de rendimiento
    if (window.performance) {
      details.performance = {
        memory: window.performance.memory
          ? {
              usedJSHeapSize: window.performance.memory.usedJSHeapSize,
              totalJSHeapSize: window.performance.memory.totalJSHeapSize,
            }
          : undefined,
        navigation: window.performance.getEntriesByType("navigation")[0],
      }
    }

    // Añadir información específica según el tipo de error
    if (error instanceof Error) {
      details.name = error.name
      details.message = error.message
      if (captureStack) {
        details.stack = error.stack
      }
    } else if (isApiError(error)) {
      details.status = error.status
      details.statusText = error.statusText
      details.code = error.code
      details.data = error.data
    } else if (typeof error === "object" && error !== null) {
      Object.entries(error).forEach(([key, value]) => {
        if (key !== "toJSON" && key !== "toString" && typeof value !== "function") {
          details[key] = value
        }
      })
    }

    return details
  }

  /**
   * Actualiza las estadísticas de errores
   */
  const updateErrorStats = (error: Error): void => {
    const errorType = error.name || "Unknown"
    errorStats[errorType] = (errorStats[errorType] || 0) + 1
  }

  /**
   * Maneja un error, lo registra y devuelve un error formateado
   */
  const handleError = <T extends Error>(error: unknown, userMessage?: string, context: Record<string, any> = {}): T => {
    // Convertir a Error si no lo es
    const normalizedError = error instanceof Error ? error : new Error(formatErrorMessage(error))

    // Añadir prefijo al mensaje si está configurado
    if (errorPrefix && !normalizedError.message.startsWith(errorPrefix)) {
      normalizedError.message = `${errorPrefix}: ${normalizedError.message}`
    }

    // Guardar el último error
    lastError.value = normalizedError

    // Añadir a la lista de errores
    errors.value.push(normalizedError)
    if (errors.value.length > maxErrorsStored) {
      errors.value.shift()
    }

    // Actualizar estadísticas
    updateErrorStats(normalizedError)

    // Añadir mensaje para el usuario si se proporciona
    if (userMessage) {
      normalizedError.message = userMessage
    }

    // Añadir contexto y detalles al error
    const errorDetails = extractErrorDetails(error)
    Object.assign(normalizedError, {
      details: {
        ...errorDetails,
        ...context,
        originalError: error,
      },
    })

    // Registrar en consola si está habilitado
    if (logToConsole) {
      if (groupErrors) {
        console.group(`Error: ${normalizedError.message}`)
        console.error("Error capturado:", normalizedError)

        // Registrar detalles adicionales si es un error de API
        if (isApiError(error)) {
          console.error("Detalles del error de API:", {
            status: error.status,
            statusText: error.statusText,
            data: error.data,
          })
        }

        // Registrar contexto adicional
        if (Object.keys(context).length > 0) {
          console.info("Contexto adicional:", context)
        }

        console.groupEnd()
      } else {
        console.error("Error capturado:", normalizedError)
      }
    }

    // Enviar a servicio de registro si está habilitado
    if (logToService) {
      // Implementar envío a servicio de registro de errores
      const logData = {
        message: normalizedError.message,
        name: normalizedError.name,
        stack: captureStack ? normalizedError.stack : undefined,
        details: errorDetails,
        context,
      }

      // Enviar a un endpoint de logging o servicio externo
      fetch("/api/log/client-error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      }).catch((loggingError) => {
        console.error("Error al enviar log al servidor:", loggingError)

        // Almacenar localmente si falla el envío
        try {
          const storedErrors = JSON.parse(localStorage.getItem("offlineErrors") || "[]")
          storedErrors.push({
            ...logData,
            storedAt: new Date().toISOString(),
          })
          localStorage.setItem("offlineErrors", JSON.stringify(storedErrors))
        } catch (e) {
          console.error("Error al almacenar error localmente:", e)
        }
      })
    }

    // Opcional: enviar el error a un servicio de monitoreo
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("app-error", {
          detail: { error: error, context: context },
        }),
      )
    }

    return normalizedError as T
  }

  /**
   * Limpia el último error registrado
   */
  const clearError = (): void => {
    lastError.value = null
  }

  /**
   * Limpia todos los errores registrados
   */
  const clearAllErrors = (): void => {
    lastError.value = null
    errors.value = []
    Object.keys(errorStats).forEach((key) => {
      errorStats[key] = 0
    })
  }

  /**
   * Obtiene estadísticas de errores
   */
  const getErrorStats = () => {
    return {
      count: errors.value.length,
      byType: { ...errorStats },
    }
  }

  /**
   * Envuelve una función con manejo de errores
   */
  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<{ data: T | null; error: Error | null }> => {
    isLoading.value = true
    clearError()

    try {
      const result = await fn()
      return { data: result, error: null }
    } catch (err) {
      handleError(err, context)
      return { data: null, error: lastError.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    lastError,
    errors,
    handleError,
    clearError,
    clearAllErrors,
    isApiError,
    formatErrorMessage,
    getErrorStats,
    isLoading,
    withErrorHandling,
  }
}