import { isClient } from "./ssr-safe"

// Interfaces
interface ServiceConfig {
  url: string
  healthEndpoint: string
}

interface ServicesConfig {
  [key: string]: ServiceConfig
}

// Configuración de servicios
const servicesConfig: ServicesConfig = {
  api: {
    url: isClient ? import.meta.env.VITE_API_URL || "http://localhost:8000/api" : "http://api",
    healthEndpoint: "/health",
  },
  client: {
    url: isClient ? import.meta.env.VITE_APP_URL || "http://localhost:3000" : "http://client:3000",
    healthEndpoint: "/",
  },
  db: {
    url: "http://db:3306",
    healthEndpoint: "/",
  },
}

// Obtener URL de un servicio
export function getServiceUrl(serviceName: string): string {
  if (!servicesConfig[serviceName]) {
    console.warn(`Service "${serviceName}" not found in configuration`)
    return ""
  }

  return servicesConfig[serviceName].url
}

// Verificar la salud de un servicio
export async function checkServiceHealth(serviceName: string): Promise<boolean> {
  if (!isClient) {
    return true // En SSR, asumimos que los servicios están disponibles
  }

  if (!servicesConfig[serviceName]) {
    console.warn(`Service "${serviceName}" not found in configuration`)
    return false
  }

  const { url, healthEndpoint } = servicesConfig[serviceName]

  try {
    const response = await fetch(`${url}${healthEndpoint}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(2000), // Timeout de 2 segundos
    })

    return response.ok
  } catch (error) {
    console.error(`Health check failed for service ${serviceName}:`, error)
    return false
  }
}

// Obtener información sobre los servicios disponibles
export async function getServicesInfo(): Promise<Record<string, boolean>> {
  if (!isClient) {
    return Object.keys(servicesConfig).reduce(
      (acc, service) => {
        acc[service] = true
        return acc
      },
      {} as Record<string, boolean>,
    )
  }

  const results: Record<string, boolean> = {}

  await Promise.all(
    Object.keys(servicesConfig).map(async (service) => {
      results[service] = await checkServiceHealth(service)
    }),
  )

  return results
}

// Registrar un servicio personalizado
export function registerService(serviceName: string, config: ServiceConfig): void {
  servicesConfig[serviceName] = config
}
