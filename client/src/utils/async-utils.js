/**
 * Utilidades para operaciones asíncronas
 */

/**
 * Retrasa la ejecución por un tiempo determinado
 * @param {number} ms - Tiempo en milisegundos
 * @returns {Promise<void>} Promesa que se resuelve después del tiempo especificado
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Ejecuta una función con reintentos
 * @param {Function} fn - Función a ejecutar
 * @param {number} maxRetries - Número máximo de reintentos
 * @param {number} delay - Retraso inicial entre reintentos (ms)
 * @param {number} backoffFactor - Factor de incremento del retraso (por defecto 2)
 * @returns {Promise<any>} Resultado de la función
 */
export const retry = async (fn, maxRetries = 3, delay = 1000, backoffFactor = 2) => {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // No reintentar en ciertos casos
      if (shouldNotRetry(error)) {
        throw error
      }

      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        throw error
      }

      // Calcular retraso con backoff exponencial
      const retryDelay = delay * Math.pow(backoffFactor, attempt)

      // Añadir jitter (variación aleatoria) para evitar sincronización
      const jitter = Math.random() * 0.3 * retryDelay
      const finalDelay = retryDelay + jitter

      console.log(`Reintento ${attempt + 1}/${maxRetries} en ${Math.round(finalDelay)}ms`)

      // Esperar antes del siguiente intento
      await sleep(finalDelay)
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  throw lastError
}

/**
 * Determina si una operación no debe reintentarse
 * @param {Error} error - Error a evaluar
 * @returns {boolean} true si no se debe reintentar
 */
export const shouldNotRetry = (error) => {
  // No reintentar errores de validación
  if (error.response?.status === 400 || error.response?.status === 422) {
    return true
  }

  // No reintentar errores de autenticación
  if (error.response?.status === 401 || error.response?.status === 403) {
    return true
  }

  // No reintentar si el recurso no existe
  if (error.response?.status === 404) {
    return true
  }

  // No reintentar si el error es de cancelación
  if (error.message?.includes("canceled")) {
    return true
  }

  // No reintentar si el error es de red y el navegador está offline
  if (error.message?.includes("network") && !navigator.onLine) {
    return true
  }

  return false
}

/**
 * Ejecuta una función con un timeout
 * @param {Function} fn - Función a ejecutar
 * @param {number} timeout - Tiempo máximo de espera (ms)
 * @returns {Promise<any>} Resultado de la función
 */
export const withTimeout = (fn, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Operación cancelada por timeout (${timeout}ms)`))
    }, timeout)

    fn()
      .then((result) => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

/**
 * Ejecuta múltiples promesas en paralelo con un límite de concurrencia
 * @param {Array<Function>} tasks - Funciones que devuelven promesas
 * @param {number} concurrency - Número máximo de promesas en paralelo
 * @returns {Promise<Array<any>>} Resultados de las promesas
 */
export const parallelLimit = async (tasks, concurrency = 3) => {
  const results = []
  const executing = []

  for (const [index, task] of tasks.entries()) {
    // Crear promesa para esta tarea
    const p = Promise.resolve().then(() => task())

    // Guardar resultado en el orden correcto
    results[index] = p.catch((error) => error)

    // Si alcanzamos el límite de concurrencia, esperar a que termine una tarea
    if (concurrency <= tasks.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)

      if (executing.length >= concurrency) {
        await Promise.race(executing)
      }
    }
  }

  // Esperar a que todas las tareas terminen
  return Promise.all(results)
}

export default {
  sleep,
  retry,
  shouldNotRetry,
  withTimeout,
  parallelLimit,
}
