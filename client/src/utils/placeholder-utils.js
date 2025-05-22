/**
 * Utilidades para manejar imágenes placeholder
 */

/**
 * Obtiene una URL de imagen placeholder para un destino
 * @param {string} name - Nombre del destino
 * @returns {string} - URL de la imagen placeholder
 */
export function getDestinationPlaceholder(name) {
  // Simplemente devuelve la ruta a la imagen placeholder local
  return "/images/placeholder.svg"
}

/**
 * Obtiene una URL de imagen placeholder para una nave
 * @param {string} name - Nombre de la nave
 * @returns {string} - URL de la imagen placeholder
 */
export function getShipPlaceholder(name) {
  // Simplemente devuelve la ruta a la imagen placeholder local
  return "/images/placeholder.svg"
}

/**
 * Obtiene una URL de imagen placeholder para una actividad
 * @param {string} name - Nombre de la actividad
 * @returns {string} - URL de la imagen placeholder
 */
export function getActivityPlaceholder(name) {
  // Simplemente devuelve la ruta a la imagen placeholder local
  return "/images/placeholder.svg"
}

/**
 * Obtiene una URL de imagen placeholder para un usuario
 * @returns {string} - URL de la imagen placeholder
 */
export function getUserPlaceholder() {
  // Simplemente devuelve la ruta a la imagen placeholder de usuario local
  return "/images/placeholder-user.jpg"
}

/**
 * Obtiene una URL de imagen placeholder genérica
 * @returns {string} - URL de la imagen placeholder
 */
export function getPlaceholderUrl() {
  // Simplemente devuelve la ruta a la imagen placeholder local
  return "/images/placeholder.svg"
}

export default {
  getDestinationPlaceholder,
  getShipPlaceholder,
  getActivityPlaceholder,
  getUserPlaceholder,
  getPlaceholderUrl,
}
