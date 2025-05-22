/* Composable para crear un "focus trap" */
export function useFocusTrap() {
  const isBrowser = typeof window !== "undefined"

  const createFocusTrap = (element, options = {}) => {
    if (!isBrowser || !element) return null

    const {
      initialFocus = null,
      escapeDeactivates = true,
      clickOutsideDeactivates = false,
      returnFocusOnDeactivate = true,
    } = options

    const previousActiveElement = document.activeElement

    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )

    const firstFocusableElement = focusableElements[0]
    const lastFocusableElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e) => {
      if (escapeDeactivates && e.key === "Escape") {
        deactivate()
        return
      }

      if (e.key === "Tab") {
        // Si se presiona Shift+Tab y el foco está en el primer elemento, mover al último
        if (e.shiftKey && document.activeElement === firstFocusableElement) {
          e.preventDefault()
          lastFocusableElement.focus()
        }
        else if (!e.shiftKey && document.activeElement === lastFocusableElement) {
          e.preventDefault()
          firstFocusableElement.focus()
        }
      }
    }

    const handleClickOutside = (e) => {
      if (clickOutsideDeactivates && element && !element.contains(e.target)) {
        deactivate()
      }
    }

    //Función para activar 
    const activate = () => {
      document.addEventListener("keydown", handleKeyDown)

      if (clickOutsideDeactivates) {
        document.addEventListener("mousedown", handleClickOutside)
      }

      if (initialFocus) {
        initialFocus.focus()
      } else if (firstFocusableElement) {
        firstFocusableElement.focus()
      } else {
        element.focus()
      }
    }

    //Función para desactivar 
    const deactivate = () => {
      document.removeEventListener("keydown", handleKeyDown)

      if (clickOutsideDeactivates) {
        document.removeEventListener("mousedown", handleClickOutside)
      }

      if (returnFocusOnDeactivate && previousActiveElement) {
        previousActiveElement.focus()
      }
    }

    activate()

    return {
      activate,
      deactivate,
    }
  }

  const destroyFocusTrap = (focusTrap) => {
    if (focusTrap && typeof focusTrap.deactivate === "function") {
      focusTrap.deactivate()
    }
  }

  return {
    createFocusTrap,
    destroyFocusTrap,
  }
}
