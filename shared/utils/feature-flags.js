/**
 * Sistema de Feature Flags para controlar la migración gradual
 *
 * Este módulo permite habilitar/deshabilitar características durante la migración
 * y facilita el rollback en caso de problemas.
 */

// Almacenamiento de flags (localStorage en cliente, memoria en servidor)
const storage = typeof window !== "undefined" ? window.localStorage : new Map()

// Valores por defecto para los feature flags
const DEFAULT_FLAGS = {
  // Utilidades
  USE_SHARED_FORMAT_UTILS: false,
  USE_SHARED_VALIDATION_UTILS: false,
  USE_SHARED_HELPERS: false,

  // Servicios API
  USE_SHARED_API_CLIENT: false,
  USE_SHARED_DESTINOS_SERVICE: false,
  USE_SHARED_RESERVAS_SERVICE: false,
  USE_SHARED_AUTH_SERVICE: false,

  // Componentes UI
  USE_SHARED_UI_COMPONENTS: false,
  USE_SHARED_BUTTON_COMPONENT: false,
  USE_SHARED_INPUT_COMPONENT: false,
  USE_SHARED_CARD_COMPONENT: false,
  USE_SHARED_ALERT_COMPONENT: false,
  USE_SHARED_BADGE_COMPONENT: false,

  // Rutas de importación
  USE_ALIAS_IMPORTS: false,
}

// Prefijo para almacenamiento
const STORAGE_PREFIX = "stellar_tourism_ff_"

/**
 * Obtiene el valor de un feature flag
 * @param {string} flagName - Nombre del flag
 * @returns {boolean} - Valor del flag
 */
export function isEnabled(flagName) {
  if (typeof window !== "undefined") {
    // Cliente: usar localStorage
    const storedValue = localStorage.getItem(`${STORAGE_PREFIX}${flagName}`)
    return storedValue !== null ? storedValue === "true" : DEFAULT_FLAGS[flagName] || false
  } else {
    // Servidor: usar Map
    return storage.get(`${STORAGE_PREFIX}${flagName}`) || DEFAULT_FLAGS[flagName] || false
  }
}

/**
 * Establece el valor de un feature flag
 * @param {string} flagName - Nombre del flag
 * @param {boolean} value - Valor a establecer
 */
export function setEnabled(flagName, value) {
  if (typeof window !== "undefined") {
    // Cliente: usar localStorage
    localStorage.setItem(`${STORAGE_PREFIX}${flagName}`, value.toString())
  } else {
    // Servidor: usar Map
    storage.set(`${STORAGE_PREFIX}${flagName}`, value)
  }
}

/**
 * Restablece todos los feature flags a sus valores por defecto
 */
export function resetAllFlags() {
  Object.keys(DEFAULT_FLAGS).forEach((flag) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${STORAGE_PREFIX}${flag}`, DEFAULT_FLAGS[flag].toString())
    } else {
      storage.set(`${STORAGE_PREFIX}${flag}`, DEFAULT_FLAGS[flag])
    }
  })
}

/**
 * Obtiene todos los feature flags y sus valores actuales
 * @returns {Object} - Objeto con todos los flags
 */
export function getAllFlags() {
  const result = {}

  Object.keys(DEFAULT_FLAGS).forEach((flag) => {
    result[flag] = isEnabled(flag)
  })

  return result
}

export default {
  isEnabled,
  setEnabled,
  resetAllFlags,
  getAllFlags,
}
