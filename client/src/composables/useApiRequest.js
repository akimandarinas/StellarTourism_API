
import { ref, computed } from "vue"
import { normalizeApiError } from "@/utils/adapters"

export default function useApiRequest(options = {}) {
  const {
    immediate = false,
    cacheKey = null,
    cacheTTL = 5 * 60 * 1000, // 5 minutos por defecto
    useCache = true,
    retries = 2,
    retryDelay = 1000,
    onSuccess = null,
    onError = null,
    transform = (data) => data,
  } = options

  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastFetched = ref(null)
  const cache = useCache()

  /*
   Realiza la petición a la API
  */

  const execute = async (apiFn, params = {}) => {
    if (!apiFn || typeof apiFn !== "function") {
      throw new Error("Se requiere una función de API válida")
    }

    const effectiveCacheKey = cacheKey || `${apiFn.name || "api"}_${JSON.stringify(params)}`

    // Verificar caché si está habilitado
    if (useCache && effectiveCacheKey) {
      const cachedData = await cache.get(effectiveCacheKey)
      if (cachedData) {
        data.value = transform(cachedData)
        return data.value
      }
    }

    loading.value = true
    error.value = null

    let attempts = 0
    let success = false
    let result = null

    while (attempts <= retries && !success) {
      try {
        result = await apiFn(params)
        success = true
      } catch (err) {
        attempts++

        if (attempts > retries) {
          error.value = normalizeApiError(err)
          loading.value = false

          if (onError) {
            onError(error.value)
          }

          throw error.value
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempts))
      }
    }

    const transformedData = transform(result)
    data.value = transformedData
    lastFetched.value = new Date()
    loading.value = false

    if (useCache && effectiveCacheKey) {
      cache.set(effectiveCacheKey, result, { ttl: cacheTTL })
    }

    if (onSuccess) {
      onSuccess(transformedData)
    }

    return transformedData
  }


  const reset = () => {
    data.value = null
    error.value = null
    lastFetched.value = null
  }


  const invalidateCache = () => {
    if (cacheKey) {
      cache.remove(cacheKey)
    }
  }


  const isStale = computed(() => {
    if (!lastFetched.value) return true
    return Date.now() - lastFetched.value.getTime() > cacheTTL
  })

  return {
    data,
    loading,
    error,
    lastFetched,
    isStale,
    execute,
    reset,
    invalidateCache,
  }
}
