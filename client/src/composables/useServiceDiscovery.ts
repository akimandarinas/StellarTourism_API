import { ref, onMounted } from "vue"
import { getServicesInfo, checkServiceHealth } from "../utils/service-discovery"
import { isClient } from "../utils/ssr-safe"

export function useServiceDiscovery() {
  const servicesStatus = ref<Record<string, boolean>>({})
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // Verificar servicios
  const checkServices = async () => {
    if (!isClient) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      servicesStatus.value = await getServicesInfo()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error("Unknown error checking services")
      console.error("Error checking services:", err)
    } finally {
      isLoading.value = false
    }
  }

  // Verificar un servicio específico
  const checkService = async (serviceName: string) => {
    if (!isClient) {
      return true
    }

    try {
      const isHealthy = await checkServiceHealth(serviceName)
      servicesStatus.value = {
        ...servicesStatus.value,
        [serviceName]: isHealthy,
      }
      return isHealthy
    } catch (err) {
      console.error(`Error checking service ${serviceName}:`, err)
      return false
    }
  }

  // Verificar servicios al montar el componente
  onMounted(() => {
    if (isClient) {
      checkServices()
    }
  })

  return {
    servicesStatus,
    isLoading,
    error,
    checkServices,
    checkService,
  }
}
