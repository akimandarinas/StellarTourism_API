import { inject, ref, computed, onMounted } from "vue"
import { SSR_CONTEXT_KEY } from "../components/SSRProvider.vue"
import { isClient } from "../utils/ssr-safe"

interface UseSSRDataOptions<T> {
  key: string
  fetch: () => Promise<T>
  initialData?: T
  refetch?: boolean
  onError?: (error: any) => void
}

export function useSSRData<T>(options: UseSSRDataOptions<T>) {
  const { key, fetch, initialData, refetch = false, onError } = options

  // Obtener el contexto SSR
  const ssrContext = inject(SSR_CONTEXT_KEY, null)

  // Estado para los datos
  const data = ref<T | undefined>(ssrContext?.state[key] || initialData)

  // Estado para la carga
  const loading = ref(!data.value)

  // Estado para errores
  const error = ref<any>(null)

  // Función para cargar los datos
  const loadData = async (force = false) => {
    // Si ya tenemos datos y no se fuerza la recarga, no hacer nada
    if (data.value && !force && !refetch) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const result = await fetch()
      data.value = result

      // Actualizar el estado SSR si está disponible
      if (ssrContext) {
        ssrContext.updateState(key, result)
      }
    } catch (err) {
      error.value = err
      if (onError) {
        onError(err)
      } else {
        console.error(`Error fetching data for key "${key}":`, err)
      }
    } finally {
      loading.value = false
    }
  }

  // Cargar datos en el cliente si es necesario
  onMounted(() => {
    if (isClient() && (refetch || !data.value)) {
      loadData()
    }
  })

  // Computed para verificar si los datos están disponibles
  const hasData = computed(() => !!data.value)

  return {
    data,
    loading,
    error,
    loadData,
    hasData,
  }
}
