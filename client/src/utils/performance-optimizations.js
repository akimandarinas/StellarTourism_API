/**
 * Utilidades para optimización de rendimiento en la aplicación StellarTourism
 *
 * Este módulo proporciona funciones para mejorar el rendimiento de la aplicación,
 * incluyendo memoización, virtualización, lazy loading y optimización de renderizado.
 */

import { ref, computed, onMounted, onUnmounted, nextTick } from "vue"

/**
 * Memoiza una función para evitar cálculos repetidos con los mismos argumentos
 * @param {Function} fn - Función a memoizar
 * @param {Function} keyGenerator - Función para generar la clave de caché (opcional)
 * @returns {Function} Función memoizada
 */
export function memoize(fn, keyGenerator = JSON.stringify) {
  const cache = new Map()

  return function memoized(...args) {
    const key = keyGenerator(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn.apply(this, args)
    cache.set(key, result)

    return result
  }
}

/**
 * Composable para implementar virtualización de listas
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Propiedades y métodos para virtualización
 */
export function useVirtualList(options = {}) {
  const { itemHeight = 50, overscan = 5, getItemKey = (_, index) => index } = options

  const containerRef = ref(null)
  const scrollTop = ref(0)
  const visibleCount = ref(0)
  const items = ref([])
  const totalHeight = computed(() => items.value.length * itemHeight)

  // Índices de los elementos visibles
  const visibleRange = computed(() => {
    if (!items.value.length) return { start: 0, end: 0 }

    const start = Math.floor(scrollTop.value / itemHeight) - overscan
    const end = start + visibleCount.value + 2 * overscan

    return {
      start: Math.max(0, start),
      end: Math.min(items.value.length, end),
    }
  })

  // Elementos visibles
  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    return items.value.slice(start, end).map((item, index) => ({
      data: item,
      index: start + index,
      key: getItemKey(item, start + index),
    }))
  })

  // Estilo para el contenedor de elementos
  const containerStyle = computed(() => ({
    height: `${totalHeight.value}px`,
    position: "relative",
  }))

  // Estilo para el contenedor de elementos visibles
  const wrapperStyle = computed(() => ({
    transform: `translateY(${visibleRange.value.start * itemHeight}px)`,
  }))

  // Manejar evento de scroll
  const handleScroll = (e) => {
    scrollTop.value = e.target.scrollTop
  }

  // Calcular elementos visibles basado en el tamaño del contenedor
  const updateVisibleCount = () => {
    if (containerRef.value) {
      const { height } = containerRef.value.getBoundingClientRect()
      visibleCount.value = Math.ceil(height / itemHeight)
    }
  }

  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener("scroll", handleScroll)
      updateVisibleCount()

      // Observar cambios de tamaño
      if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(updateVisibleCount)
        resizeObserver.observe(containerRef.value)

        onUnmounted(() => {
          resizeObserver.disconnect()
        })
      }
    }
  })

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener("scroll", handleScroll)
    }
  })

  return {
    containerRef,
    items,
    visibleItems,
    containerStyle,
    wrapperStyle,
    scrollTo: (index) => {
      if (containerRef.value) {
        containerRef.value.scrollTop = index * itemHeight
      }
    },
    setItems: (newItems) => {
      items.value = newItems
    },
  }
}

/**
 * Composable para implementar lazy loading de imágenes
 * @returns {Object} Propiedades y métodos para lazy loading
 */
export function useLazyImage() {
  const imageRef = ref(null)
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  const loadImage = async (src) => {
    if (!src) return

    isLoading.value = true
    error.value = null

    try {
      await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = reject
        img.src = src
      })

      isLoaded.value = true
    } catch (err) {
      error.value = err
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    if (!("IntersectionObserver" in window)) {
      // Fallback para navegadores que no soportan IntersectionObserver
      if (imageRef.value && imageRef.value.dataset.src) {
        loadImage(imageRef.value.dataset.src)
      }
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imageRef.value) {
            const src = imageRef.value.dataset.src
            if (src) {
              loadImage(src)
              observer.unobserve(imageRef.value)
            }
          }
        })
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.1,
      },
    )

    if (imageRef.value) {
      observer.observe(imageRef.value)
    }

    onUnmounted(() => {
      if (imageRef.value) {
        observer.unobserve(imageRef.value)
      }
    })
  })

  return {
    imageRef,
    isLoaded,
    isLoading,
    error,
  }
}

/**
 * Composable para implementar debounce en funciones
 * @param {Function} fn - Función a aplicar debounce
 * @param {number} delay - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 */
export function useDebounce(fn, delay = 300) {
  let timeout = null

  const debouncedFn = (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(...args)
    }, delay)
  }

  onUnmounted(() => {
    clearTimeout(timeout)
  })

  return debouncedFn
}

/**
 * Composable para implementar throttle en funciones
 * @param {Function} fn - Función a aplicar throttle
 * @param {number} limit - Tiempo mínimo entre ejecuciones en ms
 * @returns {Function} Función con throttle
 */
export function useThrottle(fn, limit = 300) {
  let inThrottle = false

  const throttledFn = (...args) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }

  return throttledFn
}

/**
 * Optimiza el renderizado de componentes pesados
 * @param {Function} renderFn - Función de renderizado
 * @param {Object} options - Opciones de optimización
 * @returns {Object} Componente optimizado
 */
export function optimizeRendering(renderFn, options = {}) {
  const { deferRender = true, renderDelay = 0, skipHydration = false } = options

  return {
    setup(props, context) {
      const isClient = ref(false)
      const isReady = ref(!deferRender)

      onMounted(() => {
        isClient.value = true

        if (deferRender) {
          // Diferir el renderizado para mejorar la percepción de velocidad
          setTimeout(() => {
            nextTick(() => {
              isReady.value = true
            })
          }, renderDelay)
        }
      })

      return () => {
        // Si estamos en el servidor o el componente está listo, renderizar normalmente
        if (!isClient.value || isReady.value) {
          return renderFn(props, context)
        }

        // Renderizar un placeholder mientras se prepara el componente
        return context.slots.placeholder ? (
          context.slots.placeholder()
        ) : (
          <div class="deferred-render-placeholder" style="min-height: 100px;"></div>
        )
      }
    },
  }
}

/**
 * Composable para medir y reportar métricas de rendimiento
 * @param {string} componentName - Nombre del componente
 * @returns {Object} Funciones para medir rendimiento
 */
export function usePerformanceMetrics(componentName) {
  const metrics = ref({
    mountTime: 0,
    renderTime: 0,
    updateCount: 0,
    lastUpdateTime: 0,
  })

  let startTime = 0
  let renderStartTime = 0

  onMounted(() => {
    metrics.value.mountTime = performance.now() - startTime

    // Reportar métricas a un servicio de análisis si está en producción
    if (process.env.NODE_ENV === "production") {
      reportMetricToAnalytics("component_mount", {
        component: componentName,
        duration: metrics.value.mountTime,
      })
    }
  })

  const startRender = () => {
    renderStartTime = performance.now()
  }

  const endRender = () => {
    const renderTime = performance.now() - renderStartTime
    metrics.value.renderTime = renderTime
    metrics.value.updateCount++
    metrics.value.lastUpdateTime = Date.now()

    // Reportar métricas de renderizado si es significativamente lento
    if (renderTime > 16 && process.env.NODE_ENV === "production") {
      reportMetricToAnalytics("slow_render", {
        component: componentName,
        duration: renderTime,
      })
    }
  }

  // Función simulada para reportar métricas
  const reportMetricToAnalytics = (metricName, data) => {
    // En una implementación real, esto enviaría datos a un servicio de análisis
    console.debug(`[Performance] ${metricName}:`, data)
  }

  startTime = performance.now()

  return {
    metrics,
    startRender,
    endRender,
    reportMetric: (name, value) => {
      reportMetricToAnalytics(name, {
        component: componentName,
        value,
      })
    },
  }
}

/**
 * Optimiza las operaciones de lista para evitar re-renderizados innecesarios
 * @param {Array} list - Lista original
 * @returns {Object} Métodos optimizados para manipular la lista
 */
export function createOptimizedList(list = []) {
  const items = ref(list)

  return {
    items,

    // Añadir un elemento sin causar re-renderizado completo
    add: (item) => {
      const newList = [...items.value, item]
      items.value = newList
    },

    // Eliminar un elemento por índice
    removeAt: (index) => {
      if (index < 0 || index >= items.value.length) return

      const newList = [...items.value]
      newList.splice(index, 1)
      items.value = newList
    },

    // Eliminar un elemento por condición
    removeWhere: (predicate) => {
      const index = items.value.findIndex(predicate)
      if (index !== -1) {
        const newList = [...items.value]
        newList.splice(index, 1)
        items.value = newList
      }
    },

    // Actualizar un elemento por índice
    updateAt: (index, newItem) => {
      if (index < 0 || index >= items.value.length) return

      const newList = [...items.value]
      newList[index] = newItem
      items.value = newList
    },

    // Actualizar un elemento por condición
    updateWhere: (predicate, updater) => {
      const index = items.value.findIndex(predicate)
      if (index !== -1) {
        const newList = [...items.value]
        newList[index] = typeof updater === "function" ? updater(newList[index]) : updater
        items.value = newList
      }
    },

    // Reemplazar toda la lista
    replace: (newList) => {
      items.value = newList
    },

    // Limpiar la lista
    clear: () => {
      items.value = []
    },
  }
}
