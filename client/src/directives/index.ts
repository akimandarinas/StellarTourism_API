import type { App } from "vue"

// Directiva para manejar clics fuera de un elemento
const clickOutside = {
  beforeMount(el: HTMLElement, binding: any) {
    el._clickOutsideHandler = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener("click", el._clickOutsideHandler)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener("click", el._clickOutsideHandler)
    delete el._clickOutsideHandler
  },
}

// Directiva para focus trap
const focusTrap = {
  beforeMount(el: HTMLElement, binding: any) {
    el._focusTrapHandler = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const focusableElements = el.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
        )

        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    el.addEventListener("keydown", el._focusTrapHandler)

    if (binding.value !== false) {
      setTimeout(() => {
        const focusableElement = el.querySelector(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ) as HTMLElement

        if (focusableElement) {
          focusableElement.focus()
        }
      }, 0)
    }
  },
  unmounted(el: HTMLElement) {
    el.removeEventListener("keydown", el._focusTrapHandler)
    delete el._focusTrapHandler
  },
}

//Directiva para lazy loading de imágenes
const lazyLoad = {
  beforeMount(el: HTMLElement, binding: any) {
    function loadImage() {
      const imageElement = el.tagName === "IMG" ? el : el.querySelector("img")

      if (imageElement) {
        const src = binding.value
        imageElement.setAttribute("src", src)
        observer.unobserve(el)
      }
    }

    function handleIntersect(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage()
        }
      })
    }

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "50px 0px",
      threshold: 0.01,
    })

    observer.observe(el)

    el._lazyLoadObserver = observer
  },
  unmounted(el: HTMLElement) {
    if (el._lazyLoadObserver) {
      el._lazyLoadObserver.unobserve(el)
      delete el._lazyLoadObserver
    }
  },
}

export function setupDirectives(app: App) {
  app.directive("click-outside", clickOutside)
  app.directive("focus-trap", focusTrap)
  app.directive("lazy-load", lazyLoad)
}
