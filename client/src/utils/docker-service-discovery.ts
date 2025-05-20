// Utilidad para descubrir servicios en Docker
export const getServiceUrl = (serviceName: string): string => {
  // En desarrollo, usar las variables de entorno
  if (import.meta.env.DEV) {
    switch (serviceName) {
      case "api":
        return import.meta.env.VITE_API_URL || "http://localhost:8000/api"
      case "client":
        return import.meta.env.VITE_APP_URL || "http://localhost:3000"
      default:
        return `http://localhost:8000/${serviceName}`
    }
  }

  // En producción, usar la detección de servicios de Docker
  // Esto asume que estamos usando Docker Swarm o Kubernetes
  // donde los servicios son accesibles por su nombre
  return `http://${serviceName}`
}

// Verificar la salud de un servicio
export const checkServiceHealth = async (serviceName: string): Promise<boolean> => {
  try {
    const url = `${getServiceUrl(serviceName)}/health`
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      // Timeout corto para no bloquear la UI
      signal: AbortSignal.timeout(2000),
    })

    return response.ok
  } catch (error) {
    console.error(`Health check failed for service ${serviceName}:`, error)
    return false
  }
}

// Obtener información sobre los servicios disponibles
export const getServicesInfo = async (): Promise<Record<string, boolean>> => {
  const services = ["api", "db"]
  const results: Record<string, boolean> = {}

  await Promise.all(
    services.map(async (service) => {
      results[service] = await checkServiceHealth(service)
    }),
  )

  return results
}
