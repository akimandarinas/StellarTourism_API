/**
 * Utilidades para detectar preferencias de accesibilidad del usuario
 */

/**
 * Verifica si el modo de alto contraste está activado
 * @returns {boolean} True si el modo de alto contraste está activado
 */
export function isHighContrastMode() {
  return (
    window.matchMedia("(forced-colors: active)").matches ||
    window.matchMedia("(-ms-high-contrast: active)").matches ||
    window.matchMedia("(prefers-contrast: more)").matches
  )
}

/**
 * Verifica si el modo de reducción de movimiento está activado
 * @returns {boolean} True si el modo de reducción de movimiento está activado
 */
export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Verifica si el modo oscuro está activado
 * @returns {boolean} True si el modo oscuro está activado
 */
export function prefersDarkMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

/**
 * Verifica si se prefiere un tamaño de texto más grande
 * @returns {boolean} True si se prefiere un tamaño de texto más grande
 */
export function prefersLargerText() {
  // Verificar si el usuario ha aumentado el tamaño de fuente del navegador
  const fontSize = window.getComputedStyle(document.documentElement).fontSize
  return Number.parseFloat(fontSize) > 16
}

/**
 * Configura un listener para cambios en las preferencias
 * @param {string} preference - Preferencia a escuchar ('contrast', 'motion', 'color-scheme', etc.)
 * @param {Function} callback - Función a llamar cuando cambia la preferencia
 * @returns {Function} Función para eliminar el listener
 */
export function listenForPreferenceChange(preference, callback) {
  let mediaQuery

  switch (preference) {
    case "contrast":
      mediaQuery = window.matchMedia("(prefers-contrast: more)")
      break
    case "motion":
      mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      break
    case "color-scheme":
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      break
    default:
      return () => {}
  }

  const handler = (e) => callback(e.matches)
  mediaQuery.addEventListener("change", handler)

  // Llamar al callback con el valor inicial
  callback(mediaQuery.matches)

  // Devolver función para eliminar el listener
  return () => mediaQuery.removeEventListener("change", handler)
}
