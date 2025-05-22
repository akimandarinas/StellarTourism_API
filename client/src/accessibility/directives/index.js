/*Directivas Vue para accesibilidad*/

const vSrOnly = {
  mounted(el) {
    el.classList.add("sr-only")
  },
  updated(el, binding) {
    if (binding.value === false) {
      el.classList.remove("sr-only")
    } else {
      el.classList.add("sr-only")
    }
  },
}

const vAnnounce = {
  mounted(el, binding) {
    if (!binding.value) return

    // Crear o reutilizar el anunciador
    let announcer = document.getElementById("a11y-announcer")
    if (!announcer) {
      announcer = document.createElement("div")
      announcer.id = "a11y-announcer"
      announcer.setAttribute("aria-live", binding.arg || "polite")
      announcer.setAttribute("aria-atomic", "true")
      announcer.style.position = "absolute"
      announcer.style.width = "1px"
      announcer.style.height = "1px"
      announcer.style.padding = "0"
      announcer.style.overflow = "hidden"
      announcer.style.clip = "rect(0, 0, 0, 0)"
      announcer.style.whiteSpace = "nowrap"
      announcer.style.border = "0"
      document.body.appendChild(announcer)
    }

    announcer.textContent = ""
    setTimeout(() => {
      announcer.textContent = binding.value
    }, 50)
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      const announcer = document.getElementById("a11y-announcer")
      if (announcer) {
        announcer.setAttribute("aria-live", binding.arg || "polite")
        announcer.textContent = ""
        setTimeout(() => {
          announcer.textContent = binding.value
        }, 50)
      }
    }
  },
}

const vFocusTrap = {
  mounted(el, binding) {
    if (binding.value === false) return

    el._focusTrap = {
      handleKeyDown: (event) => {
        if (event.key !== "Tab") return

        const focusableElements = Array.from(
          el.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetWidth > 0 && el.offsetHeight > 0)

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
      },
    }

    // Añadir event listener
    document.addEventListener("keydown", el._focusTrap.handleKeyDown)

    if (binding.modifiers.autoFocus !== false) {
      setTimeout(() => {
        const focusableElements = Array.from(
          el.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetWidth > 0 && el.offsetHeight > 0)

        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        }
      }, 0)
    }
  },
  beforeUnmount(el) {
    if (el._focusTrap) {
      document.removeEventListener("keydown", el._focusTrap.handleKeyDown)
      delete el._focusTrap
    }
  },
  updated(el, binding) {
    if (binding.value === false && el._focusTrap) {
      document.removeEventListener("keydown", el._focusTrap.handleKeyDown)
      delete el._focusTrap
    } else if (binding.value !== false && !el._focusTrap) {
      // Reinicializar la trampa de foco
      const directive = vFocusTrap.mounted
      directive(el, binding)
    }
  },
}

const vContrast = {
  mounted(el, binding) {
    const prefersHighContrast = window.matchMedia("(prefers-contrast: more)").matches

    if (binding.value || prefersHighContrast) {
      el.classList.add("high-contrast")
    }
  },
  updated(el, binding) {
    if (binding.value) {
      el.classList.add("high-contrast")
    } else {
      el.classList.remove("high-contrast")
    }
  },
}

const vReduceMotion = {
  mounted(el, binding) {
    // Verificar si el usuario prefiere reducción de movimiento
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (binding.value || prefersReducedMotion) {
      el.classList.add("reduce-motion")
    }
  },
  updated(el, binding) {
    if (binding.value) {
      el.classList.add("reduce-motion")
    } else {
      el.classList.remove("reduce-motion")
    }
  },
}

const focusVisible = {
  mounted(el) {
    el.addEventListener("focus", () => {
      el.classList.add("focus-visible")
    })
    el.addEventListener("blur", () => {
      el.classList.remove("focus-visible")
    })
  },
  unmounted(el) {
    el.removeEventListener("focus", () => {})
    el.removeEventListener("blur", () => {})
  },
}

const announce = {
  mounted(el, binding) {
    if (binding.value) {
      const announcer = document.createElement("span")
      announcer.setAttribute("role", "status")
      announcer.setAttribute("aria-live", binding.arg || "polite")
      announcer.classList.add("sr-only")
      announcer.textContent = binding.value
      el.appendChild(announcer)
    }
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      const announcer = el.querySelector('[role="status"]')
      if (announcer) {
        announcer.textContent = binding.value
      }
    }
  },
}

// Exportar todas las directivas
export default {
  install(app) {
    app.directive("sr-only", vSrOnly)
    app.directive("announce", vAnnounce)
    app.directive("focus-trap", vFocusTrap)
    app.directive("contrast", vContrast)
    app.directive("reduce-motion", vReduceMotion)
    app.directive("focus-visible", focusVisible)
    app.directive("announce2", announce)
  },
}

export { vSrOnly, vAnnounce, vFocusTrap, vContrast, vReduceMotion, focusVisible, announce }
