import { ref } from "vue"

/**
 * Composable para gestionar caché en memoria y localStorage
 * @param {Object} options - Opciones de configuración
 * @param {number} options.defaultExpiration - Tiempo de expiración por defecto en ms (default: 5 minutos)
 * @param {boolean} options.useLocalStorage - Indica si se debe usar localStorage además de memoria (default: true)
 * @param {string} options.prefix - Prefijo para las claves en localStorage (default: 'stellar_cache_')
 * @returns {Object} - Métodos para gestionar la caché
 */
export function useCache(options = {}) {
  const {
    defaultExpiration = 5 * 60 * 1000, // 5 minutos
    useLocalStorage = true,
    prefix = "stellar_cache_",
  } = options

  // Caché en memoria
  const memoryCache = ref(new Map())

  /**
   * Obtiene un valor de la caché
   * @param {string} key - Clave del valor a obtener
   * @returns {any} - Valor almacenado o null si no existe o expiró
   */
  const get = (key) => {
    // Intentar obtener de la caché en memoria primero
    if (memoryCache.value.has(key)) {
      const cacheItem = memoryCache.value.get(key)

      // Verificar si el item ha expirado
      if (cacheItem.expiration > Date.now()) {
        return cacheItem.value
      } else {
        // Si expiró, eliminarlo
        memoryCache.value.delete(key)
      }
    }

    // Si no está en memoria o expiró, intentar obtener de localStorage
    if (useLocalStorage && typeof localStorage !== "undefined") {
      try {
        const storedItem = localStorage.getItem(`${prefix}${key}`)

        if (storedItem) {
          const parsedItem = JSON.parse(storedItem)

          // Verificar si el item ha expirado
          if (parsedItem.expiration > Date.now()) {
            // Guardar en memoria para acceso más rápido la próxima vez
            memoryCache.value.set(key, parsedItem)
            return parsedItem.value
          } else {
            // Si expiró, eliminarlo
            localStorage.removeItem(`${prefix}${key}`)
          }
        }
      } catch (error) {
        console.error("Error al obtener de localStorage:", error)
      }
    }

    return null
  }

  /**
   * Almacena un valor en la caché
   * @param {string} key - Clave para almacenar el valor
   * @param {any} value - Valor a almacenar
   * @param {number} expiration - Tiempo de expiración en ms (opcional)
   */
  const set = (key, value, expiration = defaultExpiration) => {
    const expirationTime = Date.now() + expiration

    const cacheItem = {
      value,
      expiration: expirationTime,
    }

    // Guardar en memoria
    memoryCache.value.set(key, cacheItem)

    // Guardar en localStorage si está habilitado
    if (useLocalStorage && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(`${prefix}${key}`, JSON.stringify(cacheItem))
      } catch (error) {
        console.error("Error al guardar en localStorage:", error)

        // Si hay error (ej: localStorage lleno), intentar limpiar items expirados
        if (error instanceof DOMException && error.name === "QuotaExceededError") {
          clearExpired()

          // Intentar guardar de nuevo
          try {
            localStorage.setItem(`${prefix}${key}`, JSON.stringify(cacheItem))
          } catch (retryError) {
            console.error("Error al guardar después de limpiar caché:", retryError)
          }
        }
      }
    }
  }

  /**
   * Elimina un valor de la caché
   * @param {string} key - Clave del valor a eliminar
   */
  const remove = (key) => {
    // Eliminar de memoria
    memoryCache.value.delete(key)

    // Eliminar de localStorage
    if (useLocalStorage && typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem(`${prefix}${key}`)
      } catch (error) {
        console.error("Error al eliminar de localStorage:", error)
      }
    }
  }

  /**
   * Limpia todos los valores de la caché
   */
  const clear = () => {
    // Limpiar memoria
    memoryCache.value.clear()

    // Limpiar localStorage
    if (useLocalStorage && typeof localStorage !== "undefined") {
      try {
        // Solo eliminar items con el prefijo específico
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.error("Error al limpiar localStorage:", error)
      }
    }
  }

  /**
   * Limpia solo los valores expirados de la caché
   */
  const clearExpired = () => {
    const now = Date.now()

    // Limpiar memoria
    for (const [key, cacheItem] of memoryCache.value.entries()) {
      if (cacheItem.expiration <= now) {
        memoryCache.value.delete(key)
      }
    }

    // Limpiar localStorage
    if (useLocalStorage && typeof localStorage !== "undefined") {
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(prefix)) {
            try {
              const item = JSON.parse(localStorage.getItem(key))
              if (item && item.expiration <= now) {
                localStorage.removeItem(key)
              }
            } catch (e) {
              // Si no se puede parsear, eliminar el item
              localStorage.removeItem(key)
            }
          }
        })
      } catch (error) {
        console.error("Error al limpiar items expirados de localStorage:", error)
      }
    }
  }

  /**
   * Verifica si una clave existe en la caché y no ha expirado
   * @param {string} key - Clave a verificar
   * @returns {boolean} - true si existe y no ha expirado
   */
  const has = (key) => {
    return get(key) !== null
  }

  return {
    get,
    set,
    remove,
    clear,
    clearExpired,
    has,
  }
}

// Exportar una instancia por defecto para uso común
export default useCache
