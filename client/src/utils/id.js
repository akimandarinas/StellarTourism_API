/**
 * Genera un ID único
 * @returns {string} - ID único
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Genera un ID único con prefijo
 * @param {string} prefix - Prefijo para el ID
 * @returns {string} - ID único con prefijo
 */
export function generatePrefixedId(prefix) {
  return `${prefix}-${generateId()}`
}

/**
 * Genera un ID único basado en timestamp
 * @returns {string} - ID único basado en timestamp
 */
export function generateTimestampId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export default {
  generateId,
  generatePrefixedId,
  generateTimestampId,
}
