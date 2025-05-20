import { ref, computed } from "vue"

/**
 * Composable para manejar la carga perezosa (lazy loading) de datos
 * @param {Object} options - Opciones de configuración
 * @param {Function} options.fetchFunction - Función que obtiene los datos (debe aceptar un parámetro de página)
 * @param {number} options.initialPage - Página inicial (por defecto: 1)
 * @param {number} options.itemsPerPage - Elementos por página (por defecto: 10)
 * @param {number} options.maxPages - Número máximo de páginas a cargar (opcional)
 * @param {boolean} options.resetOnError - Si se debe resetear el estado en caso de error (por defecto: false)
 * @param {boolean} options.enableCache - Habilitar caché de resultados (por defecto: true)
 * @param {number} options.cacheTTL - Tiempo de vida de la caché en ms (por defecto: 5 minutos)
 * @returns {Object} - Métodos y estado para manejar la carga perezosa
 */
export function useLazyLoad(options = {}) {
  // Declarar todos los refs al inicio
  const isIntersecting = ref(false)
  const element = ref(null)
  const observer = ref(null)
  const cache = ref(new Map())
  const cacheSize = ref(options.cacheSize || 100)

  const {
    fetchFunction,
    initialPage = 1,
    itemsPerPage = 10,
    maxPages = null,
    resetOnError = false,
    enableCache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutos por defecto
  } = options

  // Estado
  const currentPage = ref(initialPage)
  const loading = ref(false)
  const error = ref(null)
  const items = ref([])
  const totalItems = ref(0)
  const reachedEnd = ref(false)

  // Timestamp para invalidación de caché
  const cacheTimestamp = ref(Date.now())

  // Computed
  const hasMore = computed(() => {
    if (reachedEnd.value) return false
    if (maxPages !== null && currentPage.value >= maxPages) return false
    if (totalItems.value > 0) return items.value.length < totalItems.value
    return true
  })

  /**
   * Obtiene datos de la caché o de la función de carga
   * @param {number} page - Número de página a cargar
   * @returns {Promise<any>} - Datos obtenidos
   */
  const getDataForPage = async (page) => {
    // Verificar caché si está habilitada
    if (enableCache) {
      const cacheKey = `page_${page}_${cacheTimestamp.value}`
      const cachedData = cache.value.get(cacheKey)

      if (cachedData && Date.now() - cachedData.timestamp < cacheTTL) {
        return cachedData.data
      }
    }

    // Si no hay caché o expiró, obtener datos frescos
    const result = await fetchFunction(page)

    // Guardar en caché si está habilitada
    if (enableCache) {
      const cacheKey = `page_${page}_${cacheTimestamp.value}`
      cache.value.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      })

      // Limitar tamaño de caché
      if (cache.value.size > cacheSize.value) {
        // Eliminar las entradas más antiguas
        const entries = Array.from(cache.value.entries())
        const oldestEntries = entries
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .slice(0, Math.max(1, entries.length - cacheSize.value))

        oldestEntries.forEach(([key]) => {
          cache.value.delete(key)
        })
      }
    }

    return result
  }

  // Añadir una función para limpiar la caché periódicamente
  const cleanupCache = () => {
    if (!enableCache || cache.value.size === 0) return

    const now = Date.now()
    const keysToDelete = []

    // Identificar entradas expiradas
    cache.value.forEach((value, key) => {
      if (now - value.timestamp > cacheTTL) {
        keysToDelete.push(key)
      }
    })

    // Eliminar entradas expiradas
    keysToDelete.forEach((key) => {
      cache.value.delete(key)
    })
  }

  /**
   * Cargar más elementos
   * @returns {Promise<Array>} - Nuevos elementos cargados
   */
  const loadMore = async () => {
    if (loading.value || reachedEnd.value) return []
    if (maxPages !== null && currentPage.value >= maxPages) {
      reachedEnd.value = true
      return []
    }

    // Evitar cargas duplicadas
    if (loading.value) return []
    loading.value = true
    error.value = null

    try {
      const nextPage = currentPage.value + 1
      const result = await getDataForPage(nextPage)

      // Verificar formato del resultado
      const newItems = Array.isArray(result) ? result : result.items || result.data || []

      // Actualizar total si está disponible
      if (result.total !== undefined) {
        totalItems.value = result.total
      }

      // Verificar si hemos llegado al final
      if (newItems.length === 0 || newItems.length < itemsPerPage) {
        reachedEnd.value = true
      }

      // Actualizar página actual
      currentPage.value = nextPage

      // Limpiar caché periódicamente
      if (nextPage % 5 === 0) {
        cleanupCache()
      }

      // Devolver nuevos elementos
      return newItems
    } catch (err) {
      console.error("Error en loadMore:", err)
      error.value = err

      if (resetOnError) {
        reset()
      }

      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Resetear el estado
   */
  const reset = () => {
    currentPage.value = initialPage
    items.value = []
    totalItems.value = 0
    reachedEnd.value = false
    error.value = null

    // Invalidar caché
    if (enableCache) {
      cacheTimestamp.value = Date.now()

      // Opcionalmente, limpiar toda la caché
      if (cache.value.size > 50) {
        cache.value.clear()
      }
    }
  }

  // Añadir una función para liberar recursos
  const dispose = () => {
    // Limpiar caché
    if (enableCache) {
      cache.value.clear()
    }

    // Resetear estado
    items.value = []
    error.value = null
    loading.value = false
    reachedEnd.value = false
  }

  /**
   * Cargar la primera página
   * @returns {Promise<Array>} - Elementos de la primera página
   */
  const loadInitial = async () => {
    reset()
    loading.value = true

    try {
      const result = await getDataForPage(initialPage)

      // Verificar formato del resultado
      const newItems = Array.isArray(result) ? result : result.items || result.data || []

      // Actualizar total si está disponible
      if (result.total !== undefined) {
        totalItems.value = result.total
      }

      // Verificar si hemos llegado al final
      if (newItems.length === 0 || newItems.length < itemsPerPage) {
        reachedEnd.value = true
      }

      // Actualizar items
      items.value = newItems

      return newItems
    } catch (err) {
      console.error("Error en loadInitial:", err)
      error.value = err
      items.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Invalidar la caché
   */
  const invalidateCache = () => {
    if (enableCache) {
      cache.value.clear()
      cacheTimestamp.value = Date.now()
    }
  }

  return {
    loadMore,
    loadInitial,
    reset,
    invalidateCache,
    dispose, // Añadir la función dispose
    hasMore,
    loading,
    error,
    items,
    currentPage,
    totalItems,
    reachedEnd,
  }
}
