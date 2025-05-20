/**
 * Punto de entrada unificado para servicios de caché
 * Exporta el servicio de caché unificado y funciones relacionadas
 */

import { cache, UnifiedCache, createCache, initializeCache } from "./unified-cache"
import {
  initOfflineStorage,
  saveToOfflineStorage,
  getOfflineStorage,
  removeFromOfflineStorage,
  cleanExpiredData,
} from "./offline-storage"

// Composable para usar el caché
import useCache from "../../composables/useCache"

/**
 * Crea un cliente de caché para un namespace específico
 * @param {string} namespace - Namespace para este cliente
 * @param {number} defaultTTL - Tiempo de vida por defecto en milisegundos
 * @returns {Object} - Cliente de caché
 */
export function createCacheClient(namespace, defaultTTL = 5 * 60 * 1000) {
  return {
    /**
     * Obtiene un valor de la caché
     * @param {string} key - Clave
     * @returns {*} - Valor almacenado o undefined si no existe o expiró
     */
    get(key) {
      return cache.get(`${namespace}:${key}`)
    },

    /**
     * Almacena un valor en la caché
     * @param {string} key - Clave
     * @param {*} value - Valor a almacenar
     * @param {number} ttl - Tiempo de vida personalizado (opcional)
     * @returns {*} - Valor almacenado
     */
    set(key, value, ttl = defaultTTL) {
      return cache.set(`${namespace}:${key}`, value, { ttl })
    },

    /**
     * Elimina un valor de la caché
     * @param {string} key - Clave
     * @returns {boolean} - true si se eliminó, false si no existía
     */
    delete(key) {
      return cache.remove(`${namespace}:${key}`)
    },

    /**
     * Elimina todos los valores del namespace
     */
    clear() {
      // Usar expresión regular para limpiar solo las claves del namespace
      const pattern = new RegExp(`^${namespace}:`)
      return cache.clearCache(pattern)
    },

    /**
     * Elimina todos los valores que coinciden con un prefijo
     * @param {string} prefix - Prefijo de la clave
     */
    clearByPrefix(prefix) {
      const pattern = new RegExp(`^${namespace}:${prefix}`)
      return cache.clearCache(pattern)
    },

    /**
     * Obtiene un valor de la caché o lo establece si no existe
     * @param {string} key - Clave
     * @param {Function} fetchFn - Función para obtener el valor
     * @param {number} ttl - Tiempo de vida personalizado (opcional)
     * @returns {Promise<*>} - Valor almacenado o recién obtenido
     */
    async getOrSet(key, fetchFn, ttl = defaultTTL) {
      return cache.get(`${namespace}:${key}`, fetchFn, { ttl })
    },

    /**
     * Obtiene el namespace de este cliente
     * @returns {string} - Namespace
     */
    getNamespace() {
      return namespace
    },
  }
}

// Exportar funciones y clases principales
export {
  cache as cacheManager,
  UnifiedCache,
  createCache,
  initializeCache,
  // Funciones de almacenamiento offline
  initOfflineStorage,
  saveToOfflineStorage,
  getOfflineStorage,
  removeFromOfflineStorage,
  cleanExpiredData,
  // Composable
  useCache,
}

// Exportar instancia por defecto
export default cache
