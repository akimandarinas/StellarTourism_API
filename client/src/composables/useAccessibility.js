import { ref, onMounted, onBeforeUnmount } from "vue"

/**
 * Composable para manejar funcionalidades de accesibilidad
 * Proporciona utilidades reutilizables para implementar características de accesibilidad
 * de manera consistente en toda la aplicación
 */
export function useAccessibility() {
  // Anunciador para lectores de pantalla
  const announcer = ref(null)

  // Inicializar anunciador
  onMounted(() => {
    // Verificar si ya existe un anunciador global
    let existingAnnouncer = document.getElementById("a11y-announcer")

    if (!existingAnnouncer) {
      existingAnnouncer = document.createElement("div")
      existingAnnouncer.id = "a11y-announcer"
      existingAnnouncer.setAttribute("aria-live", "polite")
      existingAnnouncer.setAttribute("aria-atomic", "true")
      existingAnnouncer.style.position = "absolute"
      existingAnnouncer.style.width = "1px"
      existingAnnouncer.style.height = "1px"
      existingAnnouncer.style.padding = "0"
      existingAnnouncer.style.overflow = "hidden"
      existingAnnouncer.style.clip = "rect(0, 0, 0, 0)"
      existingAnnouncer.style.whiteSpace = "nowrap"
      existingAnnouncer.style.border = "0"

      document.body.appendChild(existingAnnouncer)
    }

    announcer.value = existingAnnouncer
  })

  /**
   * Anuncia un mensaje a los lectores de pantalla
   * @param {string} message - Mensaje a anunciar
   * @param {string} priority - Prioridad del anuncio ('polite' o 'assertive')
   */
  const announce = (message, priority = "polite") => {
    if (!announcer.value) return

    // Actualizar el atributo aria-live
    announcer.value.setAttribute("aria-live", priority)

    // Limpiar el anunciador y luego establecer el mensaje
    // (esto asegura que los lectores de pantalla anuncien el cambio)
    announcer.value.textContent = ""

    // Usar setTimeout para asegurar que el cambio se anuncia
    setTimeout(() => {
      announcer.value.textContent = message
    }, 50)
  }

  /**
   * Genera un ID único para elementos accesibles
   * @param {string} prefix - Prefijo para el ID
   * @returns {string} ID único
   */
  const generateId = (prefix = "a11y") => {
    return `${prefix}-${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Obtiene propiedades ARIA para un botón
   * @param {Object} options - Opciones de configuración
   * @returns {Object} Propiedades ARIA
   */
  const getButtonProps = (options = {}) => {
    const { label, disabled = false, pressed = null, expanded = null, controls = null, haspopup = null } = options

    const props = {}

    // Etiqueta
    if (label) {
      props["aria-label"] = label
    }

    // Deshabilitado
    if (disabled) {
      props["aria-disabled"] = "true"
      props.disabled = true
    }

    // Presionado (para botones de alternancia)
    if (pressed !== null) {
      props["aria-pressed"] = pressed ? "true" : "false"
    }

    // Expandido (para botones que controlan paneles desplegables)
    if (expanded !== null) {
      props["aria-expanded"] = expanded ? "true" : "false"
    }

    // Controla (para botones que controlan otros elementos)
    if (controls) {
      props["aria-controls"] = controls
    }

    // Tiene menú emergente
    if (haspopup) {
      props["aria-haspopup"] = "true"
    }

    return props
  }

  /**
   * Obtiene propiedades ARIA para un campo de formulario
   * @param {Object} options - Opciones de configuración
   * @returns {Object} Propiedades ARIA
   */
  const getInputProps = (options = {}) => {
    const {
      id,
      label,
      required = false,
      invalid = false,
      errorId,
      describedBy,
      disabled = false,
      readonly = false,
      autocomplete = null,
    } = options

    const props = {}

    // ID
    if (id) {
      props.id = id
    }

    // Etiqueta
    if (label && !document.querySelector(`label[for="${id}"]`)) {
      props["aria-label"] = label
    }

    // Requerido
    if (required) {
      props["aria-required"] = "true"
    }

    // Inválido
    if (invalid) {
      props["aria-invalid"] = "true"

      // Asociar con mensaje de error
      if (errorId) {
        props["aria-errormessage"] = errorId
      }
    }

    // Descripción
    if (describedBy) {
      props["aria-describedby"] = describedBy
    }

    // Deshabilitado
    if (disabled) {
      props["aria-disabled"] = "true"
      props.disabled = true
    }

    // Solo lectura
    if (readonly) {
      props["aria-readonly"] = "true"
      props.readonly = true
    }

    // Autocompletado
    if (autocomplete) {
      props.autocomplete = autocomplete
    }

    return props
  }

  /**
   * Obtiene propiedades ARIA para un elemento de diálogo
   * @param {Object} options - Opciones de configuración
   * @returns {Object} Propiedades ARIA
   */
  const getDialogProps = (options = {}) => {
    const { titleId, descriptionId, modal = true, role = "dialog" } = options

    const props = {
      role: role,
      "aria-modal": modal ? "true" : "false",
    }

    if (titleId) {
      props["aria-labelledby"] = titleId
    }

    if (descriptionId) {
      props["aria-describedby"] = descriptionId
    }

    return props
  }

  /**
   * Verifica si el modo de alto contraste está activado
   * @returns {boolean} True si el modo de alto contraste está activado
   */
  const isHighContrastMode = () => {
    return (
      window.matchMedia("(forced-colors: active)").matches || window.matchMedia("(-ms-high-contrast: active)").matches
    )
  }

  /**
   * Verifica si el modo de reducción de movimiento está activado
   * @returns {boolean} True si el modo de reducción de movimiento está activado
   */
  const prefersReducedMotion = () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }

  /**
   * Implementa una trampa de foco para modales y diálogos
   * @param {Object} options - Opciones de configuración
   * @returns {Object} Métodos y propiedades para la trampa de foco
   */
  const useFocusTrap = (options = {}) => {
    const {
      autoFocus = true,
      initialFocusElement = null,
      returnFocusOnDeactivate = true,
      escapeDeactivates = true,
      onActivate = null,
      onDeactivate = null,
    } = options

    const containerRef = ref(null)
    const isActive = ref(false)
    let previouslyFocusedElement = null

    // Obtener todos los elementos focusables dentro del contenedor
    const getFocusableElements = () => {
      if (!containerRef.value) return []

      return Array.from(
        containerRef.value.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => {
        // Verificar que el elemento sea visible
        return el.offsetWidth > 0 && el.offsetHeight > 0
      })
    }

    // Activar la trampa de foco
    const activate = () => {
      if (isActive.value) return

      // Guardar el elemento actualmente enfocado
      previouslyFocusedElement = document.activeElement

      // Establecer el foco inicial
      if (autoFocus) {
        setTimeout(() => {
          let elementToFocus

          if (initialFocusElement && typeof initialFocusElement === "function") {
            elementToFocus = initialFocusElement()
          } else if (initialFocusElement) {
            elementToFocus = initialFocusElement
          } else {
            const focusableElements = getFocusableElements()
            elementToFocus = focusableElements[0] || containerRef.value
          }

          if (elementToFocus && typeof elementToFocus.focus === "function") {
            elementToFocus.focus()
          }
        }, 0)
      }

      isActive.value = true

      if (onActivate) {
        onActivate()
      }
    }

    // Desactivar la trampa de foco
    const deactivate = () => {
      if (!isActive.value) return

      isActive.value = false

      // Devolver el foco al elemento anterior
      if (returnFocusOnDeactivate && previouslyFocusedElement) {
        setTimeout(() => {
          if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === "function") {
            previouslyFocusedElement.focus()
          }
        }, 0)
      }

      if (onDeactivate) {
        onDeactivate()
      }
    }

    // Manejar eventos de teclado
    const handleKeyDown = (event) => {
      if (!isActive.value) return

      // Desactivar con Escape
      if (escapeDeactivates && event.key === "Escape") {
        event.preventDefault()
        deactivate()
        return
      }

      // Manejar navegación con Tab
      if (event.key === "Tab") {
        const focusableElements = getFocusableElements()

        if (focusableElements.length === 0) {
          event.preventDefault()
          return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        // Shift+Tab en el primer elemento -> ir al último
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
        // Tab en el último elemento -> ir al primero
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Configurar eventos al montar el componente
    onMounted(() => {
      document.addEventListener("keydown", handleKeyDown)
    })

    // Limpiar eventos al desmontar
    onBeforeUnmount(() => {
      document.removeEventListener("keydown", handleKeyDown)

      // Asegurar que se devuelve el foco si el componente se desmonta mientras está activo
      if (isActive.value && returnFocusOnDeactivate && previouslyFocusedElement) {
        previouslyFocusedElement.focus()
      }
    })

    return {
      containerRef,
      isActive,
      activate,
      deactivate,
      getFocusableElements,
    }
  }

  return {
    announce,
    generateId,
    getButtonProps,
    getInputProps,
    getDialogProps,
    isHighContrastMode,
    prefersReducedMotion,
    useFocusTrap,
  }
}
