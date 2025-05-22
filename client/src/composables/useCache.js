import { ref } from "vue"

/**
 * Composable para gestionar caché en memoria y localStorage
 * @returns {Object} - Métodos para gestionar la caché
 */
export function useCache() {
  // Caché en memoria
  const memoryCache = ref(new Map())

  // Prefijo para las claves en localStorage
  const STORAGE_PREFIX = "stellar_tourism_cache_"

  /**
   * Obtiene un valor de la caché
   * @param {string} key - Clave del valor
   * @param {boolean} useStorage - Si debe buscar también en localStorage
   * @returns {any} - Valor almacenado o undefined si no existe
   */
  const get = (key, useStorage = true) => {
    // Primero buscar en memoria
    if (memoryCache.value.has(key)) {
      const item = memoryCache.value.get(key)

      // Verificar si el valor ha expirado
      if (item.expiry && item.expiry < Date.now()) {
        memoryCache.value.delete(key)
        return undefined
      }

      return item.value
    }

    // Si no está en memoria y useStorage es true, buscar en localStorage
    if (useStorage) {
      try {
        const storageKey = `${STORAGE_PREFIX}${key}`
        const storedItem = localStorage.getItem(storageKey)

        if (storedItem) {
          const item = JSON.parse(storedItem)

          // Verificar si el valor ha expirado
          if (item.expiry && item.expiry < Date.now()) {
            localStorage.removeItem(storageKey)
            return undefined
          }

          // Guardar en memoria para acceso más rápido
          memoryCache.value.set(key, item)

          return item.value
        }
      } catch (error) {
        console.error("Error al leer de localStorage:", error)
      }
    }

    return undefined
  }

  /**
   * Guarda un valor en la caché
   * @param {string} key - Clave del valor
   * @param {any} value - Valor a guardar
   * @param {number} ttl - Tiempo de vida en milisegundos (0 para no expirar)
   * @param {boolean} useStorage - Si debe guardar también en localStorage
   */
  const set = (key, value, ttl = 0, useStorage = true) => {
    const item = {
      value,
      expiry: ttl > 0 ? Date.now() + ttl : null,
    }

    // Guardar en memoria
    memoryCache.value.set(key, item)

    // Si useStorage es true, guardar en localStorage
    if (useStorage) {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(item))
      } catch (error) {
        console.error("Error al escribir en localStorage:", error)
      }
    }
  }

  /**
   * Elimina un valor de la caché
   * @param {string} key - Clave del valor
   * @param {boolean} useStorage - Si debe eliminar también de localStorage
   */
  const remove = (key, useStorage = true) => {
    // Eliminar de memoria
    memoryCache.value.delete(key)

    // Si useStorage es true, eliminar de localStorage
    if (useStorage) {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
      } catch (error) {
        console.error("Error al eliminar de localStorage:", error)
      }
    }
  }

  /**
   * Limpia toda la caché
   * @param {boolean} useStorage - Si debe limpiar también localStorage
   */
  const clear = (useStorage = true) => {
    // Limpiar memoria
    memoryCache.value.clear()

    // Si useStorage es true, limpiar localStorage
    if (useStorage) {
      try {
        // Solo eliminar las claves que empiezan con el prefijo
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.error("Error al limpiar localStorage:", error)
      }
    }
  }

  /**
   * Obtiene un valor de la caché o lo establece si no existe
   * @param {string} key - Clave del valor
   * @param {Function} fallbackFn - Función para obtener el valor si no existe
   * @param {number} ttl - Tiempo de vida en milisegundos
   * @param {boolean} useStorage - Si debe usar localStorage
   * @returns {Promise<any>} - Valor almacenado o resultado de fallbackFn
   */
  const getOrSet = async (key, fallbackFn, ttl = 0, useStorage = true) => {
    const cachedValue = get(key, useStorage)

    if (cachedValue !== undefined) {
      return cachedValue
    }

    try {
      const value = await fallbackFn()
      set(key, value, ttl, useStorage)
      return value
    } catch (error) {
      console.error("Error al obtener valor para caché:", error)
      throw error
    }
  }

  return {
    get,
    set,
    remove,
    clear,
    getOrSet,
  }
}

// Exportar también como default para compatibilidad
export default useCache
