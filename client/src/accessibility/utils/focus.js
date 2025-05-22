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

export function focusFirstElement(container) {
  const elements = getFocusableElements(container)

  if (elements.length > 0) {
    elements[0].focus()
    return true
  }

  return false
}

export function focusLastElement(container) {
  const elements = getFocusableElements(container)

  if (elements.length > 0) {
    elements[elements.length - 1].focus()
    return true
  }

  return false
}

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

export function makeScreenReaderOnly(element) {
  if (!element) return

  element.classList.add("sr-only")
}
