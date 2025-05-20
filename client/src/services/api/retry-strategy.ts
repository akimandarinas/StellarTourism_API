import { RetryStrategy } from "../../types/api"

/**
 * Opciones para la estrategia de reintentos
 */
export interface RetryOptions {
  maxRetries: number
  strategy: RetryStrategy
  initialDelay: number
  shouldRetry?: (error: any, attempt: number) => boolean
}

/**
 * Calcula el tiempo de espera según la estrategia de reintento
 * @param attempt Número de intento actual
 * @param options Opciones de reintento
 * @returns Tiempo de espera en milisegundos
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  const { strategy, initialDelay } = options

  switch (strategy) {
    case RetryStrategy.IMMEDIATE:
      return 0

    case RetryStrategy.FIXED_DELAY:
      return initialDelay

    case RetryStrategy.LINEAR_BACKOFF:
      return initialDelay * attempt

    case RetryStrategy.EXPONENTIAL_BACKOFF:
      return initialDelay * Math.pow(2, attempt - 1)

    default:
      return initialDelay
  }
}

/**
 * Ejecuta una función con reintentos automáticos
 * @param fn Función a ejecutar
 * @param options Opciones de reintento
 * @returns Resultado de la función
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { maxRetries, shouldRetry } = options
  let attempt = 1
  let lastError: any

  while (attempt <= maxRetries + 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Verificar si debemos reintentar
      if (shouldRetry && !shouldRetry(error, attempt)) {
        throw error
      }

      // Si es el último intento, lanzar el error
      if (attempt > maxRetries) {
        throw error
      }

      // Calcular tiempo de espera
      const delay = calculateDelay(attempt, options)

      // Esperar antes de reintentar
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      // Incrementar contador de intentos
      attempt++
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  throw lastError
}

/**
 * Verifica si un error es recuperable (se puede reintentar)
 * @param error Error a verificar
 * @returns true si el error es recuperable
 */
export function isRetryableError(error: any): boolean {
  // Errores de red son recuperables
  if (error instanceof TypeError || error.name === "TypeError") {
    return true
  }

  // Errores de timeout son recuperables
  if (error.name === "AbortError") {
    return true
  }

  // Errores de servidor (5xx) son recuperables
  if (error instanceof Response && error.status >= 500 && error.status < 600) {
    return true
  }

  // Errores específicos de API
  if (error.code === "network_error" || error.code === "timeout" || error.code === "service_unavailable") {
    return true
  }

  return false
}
