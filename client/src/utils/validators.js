/**
 * Utilidades de validación para formularios
 */

/**
 * Verifica si un valor no está vacío
 * @param {*} value - El valor a verificar
 * @returns {boolean} - true si el valor no está vacío
 */
export function isNotEmpty(value) {
  if (value === null || value === undefined) return false
  if (typeof value === "string") return value.trim().length > 0
  if (typeof value === "object") {
    if (Array.isArray(value)) return value.length > 0
    return Object.keys(value).length > 0
  }
  return true
}

/**
 * Verifica si un valor tiene una longitud válida
 * @param {string} value - El valor a verificar
 * @param {number} min - Longitud mínima
 * @param {number} max - Longitud máxima
 * @returns {boolean} - true si el valor tiene una longitud válida
 */
export function hasValidLength(value, min, max) {
  if (!value || typeof value !== "string") return false
  const length = value.trim().length
  return length >= min && length <= max
}

/**
 * Verifica si un valor es un email válido
 * @param {string} value - El email a verificar
 * @returns {boolean} - true si el email es válido
 */
export function isValidEmail(value) {
  if (!value || typeof value !== "string") return false
  // Expresión regular simple para validar emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * Verifica si un valor es un número
 * @param {*} value - El valor a verificar
 * @returns {boolean} - true si el valor es un número
 */
export function isNumber(value) {
  if (value === null || value === undefined || value === "") return false
  return !isNaN(Number(value))
}

/**
 * Verifica si un valor está dentro de un rango numérico
 * @param {number} value - El valor a verificar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} - true si el valor está dentro del rango
 */
export function isInRange(value, min, max) {
  if (!isNumber(value)) return false
  const num = Number(value)
  return num >= min && num <= max
}

/**
 * Verifica si un valor es una URL válida
 * @param {string} value - La URL a verificar
 * @returns {boolean} - true si la URL es válida
 */
export function isValidUrl(value) {
  if (!value || typeof value !== "string") return false
  try {
    new URL(value)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Verifica si un archivo tiene un tipo MIME válido
 * @param {File} file - El archivo a verificar
 * @param {string[]} allowedTypes - Lista de tipos MIME permitidos
 * @returns {boolean} - true si el archivo tiene un tipo válido
 */
export function hasValidFileType(file, allowedTypes) {
  if (!file || !allowedTypes || !Array.isArray(allowedTypes)) return false
  return allowedTypes.includes(file.type)
}

/**
 * Verifica si un archivo tiene un tamaño válido
 * @param {File} file - El archivo a verificar
 * @param {number} maxSizeInBytes - Tamaño máximo en bytes
 * @returns {boolean} - true si el archivo tiene un tamaño válido
 */
export function hasValidFileSize(file, maxSizeInBytes) {
  if (!file || !maxSizeInBytes) return false
  return file.size <= maxSizeInBytes
}

/**
 * Verifica si una fecha es válida
 * @param {string} dateString - La fecha a verificar en formato string
 * @returns {boolean} - true si la fecha es válida
 */
export function isValidDate(dateString) {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Verifica si una fecha está en el futuro
 * @param {string} dateString - La fecha a verificar en formato string
 * @returns {boolean} - true si la fecha está en el futuro
 */
export function isFutureDate(dateString) {
  if (!isValidDate(dateString)) return false
  const date = new Date(dateString)
  const now = new Date()
  return date > now
}

/**
 * Verifica si una fecha está en el pasado
 * @param {string} dateString - La fecha a verificar en formato string
 * @returns {boolean} - true si la fecha está en el pasado
 */
export function isPastDate(dateString) {
  if (!isValidDate(dateString)) return false
  const date = new Date(dateString)
  const now = new Date()
  return date < now
}
