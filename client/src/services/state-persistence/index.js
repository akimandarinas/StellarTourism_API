/**
 * Servicio para persistir el estado entre navegaciones
 * Permite guardar y recuperar el estado de diferentes partes de la aplicación
 */

// Constantes
const STORAGE_KEY_PREFIX = "stellar_tourism_state_"
const STATE_EXPIRY_TIME = 30 * 60 * 1000 // 30 minutos en milisegundos

/**
 * Guarda el estado en localStorage con una marca de tiempo
 * @param {string} key - Clave única para el estado
 * @param {any} state - Estado a guardar
 * @param {Object} options - Opciones adicionales
 * @param {number} options.expiryTime - Tiempo de expiración personalizado en milisegundos
 */
export const saveState = (key, state, options = {}) => {
  try {
    const stateWithTimestamp = {
      data: state,
      timestamp: Date.now(),
      expiryTime: options.expiryTime || STATE_EXPIRY_TIME,
    }

    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(stateWithTimestamp))

    return true
  } catch (error) {
    console.error("Error al guardar el estado:", error)
    return false
  }
}

/**
 * Recupera el estado desde localStorage si no ha expirado
 * @param {string} key - Clave única para el estado
 * @param {any} defaultValue - Valor por defecto si no se encuentra el estado o ha expirado
 * @returns {any} El estado recuperado o el valor por defecto
 */
export const loadState = (key, defaultValue = null) => {
  try {
    const storedItem = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`)

    if (!storedItem) {
      return defaultValue
    }

    const { data, timestamp, expiryTime } = JSON.parse(storedItem)
    const now = Date.now()

    // Comprobar si el estado ha expirado
    if (now - timestamp > expiryTime) {
      // Eliminar el estado expirado
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`)
      return defaultValue
    }

    return data
  } catch (error) {
    console.error("Error al cargar el estado:", error)
    return defaultValue
  }
}

/**
 * Elimina el estado guardado
 * @param {string} key - Clave única para el estado
 */
export const clearState = (key) => {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`)
    return true
  } catch (error) {
    console.error("Error al eliminar el estado:", error)
    return false
  }
}

/**
 * Limpia todos los estados expirados
 */
export const cleanupExpiredStates = () => {
  try {
    const now = Date.now()

    // Recorrer todas las claves en localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)

      // Comprobar si la clave pertenece a nuestro sistema de estado
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const { timestamp, expiryTime } = JSON.parse(localStorage.getItem(key))

          // Eliminar si ha expirado
          if (now - timestamp > expiryTime) {
            localStorage.removeItem(key)
          }
        } catch (e) {
          // Si hay un error al parsear, eliminar la entrada
          localStorage.removeItem(key)
        }
      }
    }

    return true
  } catch (error) {
    console.error("Error al limpiar estados expirados:", error)
    return false
  }
}

// Exportar un objeto con todas las funciones
export default {
  saveState,
  loadState,
  clearState,
  cleanupExpiredStates,
}
