/**
 * Utilidades para manejar el foco y la navegación por teclado
 */

/**
 * Obtiene todos los elementos focusables dentro de un contenedor
 * @param {HTMLElement} container - Elemento contenedor
 * @returns {Array} Array de elementos focusables
 */
export function getFocusableElements(container) {
  if (!container) return []

  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => {
    // Verificar que el elemento sea visible
    return el.offsetWidth > 0 && el.offsetHeight > 0
  })
}

/**
 * Enfoca el primer elemento focusable dentro de un contenedor
 * @param {HTMLElement} container - Elemento contenedor
 * @returns {boolean} True si se pudo enfocar un elemento
 */
export function focusFirstElement(container) {
  const elements = getFocusableElements(container)

  if (elements.length > 0) {
    elements[0].focus()
    return true
  }

  return false
}

/**
 * Enfoca el último elemento focusable dentro de un contenedor
 * @param {HTMLElement} container - Elemento contenedor
 * @returns {boolean} True si se pudo enfocar un elemento
 */
export function focusLastElement(container) {
  const elements = getFocusableElements(container)

  if (elements.length > 0) {
    elements[elements.length - 1].focus()
    return true
  }

  return false
}

/**
 * Verifica si un elemento es visible para lectores de pantalla
 * @param {HTMLElement} element - Elemento a verificar
 * @returns {boolean} True si el elemento es visible para lectores de pantalla
 */
export function isVisibleToScreenReader(element) {
  if (!element) return false

  const style = window.getComputedStyle(element)

  // Verificar si el elemento está oculto
  if (
    element.hasAttribute("hidden") ||
    (element.hasAttribute("aria-hidden") && element.getAttribute("aria-hidden") === "true") ||
    style.display === "none" ||
    style.visibility === "hidden"
  ) {
    return false
  }

  // Verificar si el elemento tiene tamaño cero
  if (element.offsetWidth === 0 && element.offsetHeight === 0) {
    // Verificar si es un elemento sr-only (visible solo para lectores de pantalla)
    return (
      style.position === "absolute" && style.width === "1px" && style.height === "1px" && style.overflow === "hidden"
    )
  }

  return true
}

/**
 * Aplica estilos para hacer un elemento visible solo para lectores de pantalla
 * @param {HTMLElement} element - Elemento a modificar
 */
export function makeScreenReaderOnly(element) {
  if (!element) return

  element.classList.add("sr-only")
}
