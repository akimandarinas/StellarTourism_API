/**
 * Utilidades para manejar la reducción de movimiento
 */

/**
 * Aplica estilos de reducción de movimiento a un elemento
 * @param {HTMLElement} element - Elemento a modificar
 * @param {boolean} enabled - Si la reducción de movimiento está habilitada
 */
export function applyReducedMotion(element, enabled = true) {
  if (!element) return

  if (enabled) {
    element.classList.add("reduce-motion")
  } else {
    element.classList.remove("reduce-motion")
  }
}

/**
 * Obtiene la duración de una animación teniendo en cuenta las preferencias de reducción de movimiento
 * @param {number} defaultDuration - Duración por defecto en milisegundos
 * @param {boolean} respectReducedMotion - Si se debe respetar la preferencia de reducción de movimiento
 * @returns {number} Duración ajustada en milisegundos
 */
export function getAnimationDuration(defaultDuration, respectReducedMotion = true) {
  if (respectReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Reducir significativamente la duración o eliminar la animación
    return Math.min(defaultDuration * 0.1, 100)
  }

  return defaultDuration
}

/**
 * Crea una versión de una animación que respeta las preferencias de reducción de movimiento
 * @param {Function} animationFn - Función de animación original
 * @param {Function} fallbackFn - Función alternativa para cuando se prefiere reducir el movimiento
 * @returns {Function} Función de animación que respeta las preferencias
 */
export function createAccessibleAnimation(animationFn, fallbackFn) {
  return (...args) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return fallbackFn ? fallbackFn(...args) : null
    }

    return animationFn(...args)
  }
}
