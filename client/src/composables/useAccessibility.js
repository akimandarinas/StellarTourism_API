import { ref, onMounted, onBeforeUnmount } from "vue"

export function useAccessibility() {
  const announcer = ref(null)

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

  
  const announce = (message, priority = "polite") => {
    if (!announcer.value) return

    announcer.value.setAttribute("aria-live", priority)

    // Limpiar el anunciador y luego establecer el mensaje
    // (esto asegura que los lectores de pantalla anuncien el cambio)
    announcer.value.textContent = ""

    setTimeout(() => {
      announcer.value.textContent = message
    }, 50)
  }

  
  const generateId = (prefix = "a11y") => {
    return `${prefix}-${Math.random().toString(36).substring(2, 11)}`
  }

  
  const getButtonProps = (options = {}) => {
    const { label, disabled = false, pressed = null, expanded = null, controls = null, haspopup = null } = options

    const props = {}

    if (label) {
      props["aria-label"] = label
    }

    if (disabled) {
      props["aria-disabled"] = "true"
      props.disabled = true
    }

    if (pressed !== null) {
      props["aria-pressed"] = pressed ? "true" : "false"
    }

    if (expanded !== null) {
      props["aria-expanded"] = expanded ? "true" : "false"
    }

    if (controls) {
      props["aria-controls"] = controls
    }

    if (haspopup) {
      props["aria-haspopup"] = "true"
    }

    return props
  }

  
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

    //ID
    if (id) {
      props.id = id
    }

    //Etiqueta
    if (label && !document.querySelector(`label[for="${id}"]`)) {
      props["aria-label"] = label
    }

    //Requerido
    if (required) {
      props["aria-required"] = "true"
    }

    //Inválido
    if (invalid) {
      props["aria-invalid"] = "true"

      //Asociar con mensaje de error
      if (errorId) {
        props["aria-errormessage"] = errorId
      }
    }

    //Descripción
    if (describedBy) {
      props["aria-describedby"] = describedBy
    }

    //Deshabilitado
    if (disabled) {
      props["aria-disabled"] = "true"
      props.disabled = true
    }

    //Solo lectura
    if (readonly) {
      props["aria-readonly"] = "true"
      props.readonly = true
    }

    //Autocompletado
    if (autocomplete) {
      props.autocomplete = autocomplete
    }

    return props
  }

  
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

  const isHighContrastMode = () => {
    return (
      window.matchMedia("(forced-colors: active)").matches || window.matchMedia("(-ms-high-contrast: active)").matches
    )
  }

  const prefersReducedMotion = () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }


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

    const activate = () => {
      if (isActive.value) return

      previouslyFocusedElement = document.activeElement

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

    const deactivate = () => {
      if (!isActive.value) return

      isActive.value = false

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

    const handleKeyDown = (event) => {
      if (!isActive.value) return

      if (escapeDeactivates && event.key === "Escape") {
        event.preventDefault()
        deactivate()
        return
      }

      if (event.key === "Tab") {
        const focusableElements = getFocusableElements()

        if (focusableElements.length === 0) {
          event.preventDefault()
          return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    onMounted(() => {
      document.addEventListener("keydown", handleKeyDown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener("keydown", handleKeyDown)

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
