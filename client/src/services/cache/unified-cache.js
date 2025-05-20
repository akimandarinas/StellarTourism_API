/**
 * Servicio de caché unificado
 * Combina todas las funcionalidades de caché en un solo servicio
 */

// Configuración por defecto
const DEFAULT_CONFIG = {
  ttl: 5 * 60 * 1000, // 5 minutos en milisegundos
  maxSize: 100, // Máximo número de elementos en caché
  debug: false, // Modo debug desactivado por defecto
  storage: "memory", // Tipo de almacenamiento: 'memory', 'local', 'session'
  prefix: "st_cache_", // Prefijo para las claves en localStorage/sessionStorage
  version: "1.0", // Versión del caché para invalidación
}

export class UnifiedCache {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.cache = new Map()
    this.storage = this._initStorage()
    this.log("Cache initialized with config:", this.config)
  }

  /**
   * Inicializa el almacenamiento según la configuración
   * @returns {Object} Interfaz de almacenamiento
   */
  _initStorage() {
    switch (this.config.storage) {
      case "local":
        return {
          get: (key) => {
            try {
              const item = localStorage.getItem(this.config.prefix + key)
              return item ? JSON.parse(item) : null
            } catch (e) {
              this.log("Error getting from localStorage:", e)
              return null
            }
          },
          set: (key, value) => {
            try {
              localStorage.setItem(this.config.prefix + key, JSON.stringify(value))
              return true
            } catch (e) {
              this.log("Error setting to localStorage:", e)
              return false
            }
          },
          remove: (key) => {
            try {
              localStorage.removeItem(this.config.prefix + key)
              return true
            } catch (e) {
              this.log("Error removing from localStorage:", e)
              return false
            }
          },
          clear: () => {
            try {
              // Solo eliminar las claves que comienzan con el prefijo
              Object.keys(localStorage)
                .filter((key) => key.startsWith(this.config.prefix))
                .forEach((key) => localStorage.removeItem(key))
              return true
            } catch (e) {
              this.log("Error clearing localStorage:", e)
              return false
            }
          },
        }
      case "session":
        return {
          get: (key) => {
            try {
              const item = sessionStorage.getItem(this.config.prefix + key)
              return item ? JSON.parse(item) : null
            } catch (e) {
              this.log("Error getting from sessionStorage:", e)
              return null
            }
          },
          set: (key, value) => {
            try {
              sessionStorage.setItem(this.config.prefix + key, JSON.stringify(value))
              return true
            } catch (e) {
              this.log("Error setting to sessionStorage:", e)
              return false
            }
          },
          remove: (key) => {
            try {
              sessionStorage.removeItem(this.config.prefix + key)
              return true
            } catch (e) {
              this.log("Error removing from sessionStorage:", e)
              return false
            }
          },
          clear: () => {
            try {
              // Solo eliminar las claves que comienzan con el prefijo
              Object.keys(sessionStorage)
                .filter((key) => key.startsWith(this.config.prefix))
                .forEach((key) => sessionStorage.removeItem(key))
              return true
            } catch (e) {
              this.log("Error clearing sessionStorage:", e)
              return false
            }
          },
        }
      case "memory":
      default:
        return {
          get: (key) => this.cache.get(key),
          set: (key, value) => {
            this.cache.set(key, value)
            return true
          },
          remove: (key) => {
            return this.cache.delete(key)
          },
          clear: () => {
            this.cache.clear()
            return true
          },
        }
    }
  }

  /**
   * Registra mensajes de log si el modo debug está activado
   */
  log(...args) {
    if (this.config.debug) {
      console.log("[Cache]", ...args)
    }
  }

  /**
   * Obtiene un valor del caché
   * @param {string} key - Clave del valor a obtener
   * @param {Function} fetchFn - Función para obtener el valor si no está en caché
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<any>} Valor obtenido
   */
  async get(key, fetchFn = null, options = {}) {
    const cacheKey = `${this.config.version}:${key}`
    const cachedItem = this.storage.get(cacheKey)

    // Si hay un valor en caché y no ha expirado, devolverlo
    if (cachedItem && cachedItem.expires > Date.now()) {
      this.log(`Cache hit for key: ${key}`)
      return cachedItem.value
    }

    // Si no hay valor en caché o ha expirado, y no hay función para obtenerlo, devolver null
    if (!fetchFn) {
      this.log(`Cache miss for key: ${key} and no fetch function provided`)
      return null
    }

    // Obtener el valor usando la función proporcionada
    this.log(`Cache miss for key: ${key}, fetching data...`)
    try {
      const value = await fetchFn()

      // Guardar el valor en caché
      const ttl = options.ttl || this.config.ttl
      this.set(key, value, { ttl })

      return value
    } catch (error) {
      this.log(`Error fetching data for key: ${key}`, error)
      throw error
    }
  }

  /**
   * Guarda un valor en el caché
   * @param {string} key - Clave para guardar el valor
   * @param {any} value - Valor a guardar
   * @param {Object} options - Opciones adicionales
   * @returns {boolean} Éxito de la operación
   */
  set(key, value, options = {}) {
    const cacheKey = `${this.config.version}:${key}`
    const ttl = options.ttl || this.config.ttl

    const item = {
      value,
      expires: Date.now() + ttl,
      created: Date.now(),
    }

    // Controlar el tamaño máximo del caché (solo para almacenamiento en memoria)
    if (this.config.storage === "memory" && this.cache.size >= this.config.maxSize) {
      // Eliminar la entrada más antigua
      const oldestKey = this._getOldestKey()
      if (oldestKey) {
        this.cache.delete(oldestKey)
        this.log(`Cache full, removed oldest key: ${oldestKey}`)
      }
    }

    // Guardar el valor en el almacenamiento
    const result = this.storage.set(cacheKey, item)
    this.log(`Set cache for key: ${key}, expires in ${ttl}ms`)
    return result
  }

  /**
   * Elimina un valor del caché
   * @param {string} key - Clave del valor a eliminar
   * @returns {boolean} Éxito de la operación
   */
  remove(key) {
    const cacheKey = `${this.config.version}:${key}`
    const result = this.storage.remove(cacheKey)
    this.log(`Removed cache for key: ${key}`)
    return result
  }

  /**
   * Limpia todo el caché
   * @returns {boolean} Éxito de la operación
   */
  clear() {
    const result = this.storage.clear()
    this.log("Cache cleared")
    return result
  }

  /**
   * Obtiene la clave más antigua del caché (solo para almacenamiento en memoria)
   * @returns {string|null} Clave más antigua o null si el caché está vacío
   */
  _getOldestKey() {
    if (this.cache.size === 0) return null

    let oldestKey = null
    let oldestTime = Number.POSITIVE_INFINITY

    for (const [key, value] of this.cache.entries()) {
      if (value.created < oldestTime) {
        oldestTime = value.created
        oldestKey = key
      }
    }

    return oldestKey
  }

  /**
   * Obtiene estadísticas del caché
   * @returns {Object} Estadísticas del caché
   */
  getStats() {
    const stats = {
      size: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      avgAge: 0,
    }

    if (this.config.storage === "memory") {
      stats.size = this.cache.size

      let totalAge = 0
      let validItems = 0
      const now = Date.now()

      for (const value of this.cache.values()) {
        if (value.expires > now) {
          validItems++
          totalAge += now - value.created
        }
      }

      stats.avgAge = validItems > 0 ? totalAge / validItems : 0
    }

    return stats
  }
}

// Exportar una instancia por defecto
export const cache = new UnifiedCache()

/**
 * Crea una nueva instancia de caché con la configuración proporcionada
 * @param {Object} config - Configuración del caché
 * @returns {UnifiedCache} Nueva instancia de caché
 */
export function createCache(config = {}) {
  return new UnifiedCache(config)
}

// Exportar una función para inicializar el caché con configuración
export function initializeCache(debug = false) {
  return new UnifiedCache({ debug })
}

// Exportar un hook para usar el caché
export function useCache() {
  return {
    get: cache.get.bind(cache),
    set: cache.set.bind(cache),
    remove: cache.remove.bind(cache),
    clear: cache.clear.bind(cache),
    getStats: cache.getStats.bind(cache),
  }
}

// Exportar como default
export default {
  cache,
  UnifiedCache,
  createCache,
  initializeCache,
  useCache,
}
