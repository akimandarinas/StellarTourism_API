import { ref, onMounted, onBeforeUnmount } from "vue"

/**
 * Composable para usar IntersectionObserver
 * @param {Object} options - Opciones de configuración
 * @param {Function} options.onIntersect - Función a ejecutar cuando el elemento es intersectado
 * @param {Object} options.observerOptions - Opciones para el IntersectionObserver
 * @returns {Object} - Métodos y estado para manejar la intersección
 */
export function useIntersectionObserver(options = {}) {
  const {
    onIntersect = () => {},
    observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    },
  } = options

  const elementRef = ref(null)
  const isIntersecting = ref(false)
  const observer = ref(null)

  // Función para inicializar el observer
  const initObserver = () => {
    if (!window.IntersectionObserver) {
      console.warn("IntersectionObserver no está soportado en este navegador")
      return
    }

    observer.value = new IntersectionObserver((entries) => {
      const entry = entries[0]
      isIntersecting.value = entry.isIntersecting

      if (entry.isIntersecting) {
        onIntersect(entry)
      }
    }, observerOptions)

    if (elementRef.value) {
      observer.value.observe(elementRef.value)
    }
  }

  // Función para desconectar el observer
  const disconnectObserver = () => {
    if (observer.value) {
      observer.value.disconnect()
      observer.value = null
    }
  }

  // Función para observar un elemento
  const observe = (element) => {
    if (!element) return

    if (observer.value) {
      observer.value.observe(element)
    } else {
      elementRef.value = element
      initObserver()
    }
  }

  // Función para dejar de observar un elemento
  const unobserve = (element) => {
    if (observer.value && element) {
      observer.value.unobserve(element)
    }
  }

  onMounted(() => {
    if (elementRef.value) {
      initObserver()
    }
  })

  onBeforeUnmount(() => {
    disconnectObserver()
  })

  return {
    elementRef,
    isIntersecting,
    observe,
    unobserve,
    disconnectObserver,
  }
}
