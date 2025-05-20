/**
 * Composable para crear un "focus trap" que mantiene el foco dentro de un elemento
 * Útil para modales, menús desplegables, etc.
 */
export function useFocusTrap() {
  // Verificar si estamos en un navegador
  const isBrowser = typeof window !== "undefined"

  /**
   * Crea un focus trap en el elemento especificado
   * @param {HTMLElement} element - El elemento en el que se creará el focus trap
   * @param {Object} options - Opciones de configuración
   * @returns {Object} - Objeto con métodos para controlar el focus trap
   */
  const createFocusTrap = (element, options = {}) => {
    if (!isBrowser || !element) return null

    const {
      initialFocus = null,
      escapeDeactivates = true,
      clickOutsideDeactivates = false,
      returnFocusOnDeactivate = true,
    } = options

    // Guardar el elemento que tenía el foco antes de activar el trap
    const previousActiveElement = document.activeElement

    // Encontrar todos los elementos focusables dentro del elemento
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )

    const firstFocusableElement = focusableElements[0]
    const lastFocusableElement = focusableElements[focusableElements.length - 1]

    // Función para manejar el evento keydown
    const handleKeyDown = (e) => {
      // Si se presiona Escape y escapeDeactivates está habilitado, desactivar el trap
      if (escapeDeactivates && e.key === "Escape") {
        deactivate()
        return
      }

      // Si se presiona Tab, mantener el foco dentro del elemento
      if (e.key === "Tab") {
        // Si se presiona Shift+Tab y el foco está en el primer elemento, mover al último
        if (e.shiftKey && document.activeElement === firstFocusableElement) {
          e.preventDefault()
          lastFocusableElement.focus()
        }
        // Si se presiona Tab y el foco está en el último elemento, mover al primero
        else if (!e.shiftKey && document.activeElement === lastFocusableElement) {
          e.preventDefault()
          firstFocusableElement.focus()
        }
      }
    }

    // Función para manejar clics fuera del elemento
    const handleClickOutside = (e) => {
      if (clickOutsideDeactivates && element && !element.contains(e.target)) {
        deactivate()
      }
    }

    // Función para activar el focus trap
    const activate = () => {
      // Añadir event listeners
      document.addEventListener("keydown", handleKeyDown)

      if (clickOutsideDeactivates) {
        document.addEventListener("mousedown", handleClickOutside)
      }

      // Establecer el foco inicial
      if (initialFocus) {
        initialFocus.focus()
      } else if (firstFocusableElement) {
        firstFocusableElement.focus()
      } else {
        element.focus()
      }
    }

    // Función para desactivar el focus trap
    const deactivate = () => {
      // Eliminar event listeners
      document.removeEventListener("keydown", handleKeyDown)

      if (clickOutsideDeactivates) {
        document.removeEventListener("mousedown", handleClickOutside)
      }

      // Devolver el foco al elemento que lo tenía antes
      if (returnFocusOnDeactivate && previousActiveElement) {
        previousActiveElement.focus()
      }
    }

    // Activar el focus trap
    activate()

    // Devolver un objeto con métodos para controlar el focus trap
    return {
      activate,
      deactivate,
    }
  }

  /**
   * Destruye un focus trap
   * @param {Object} focusTrap - El focus trap a destruir
   */
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
