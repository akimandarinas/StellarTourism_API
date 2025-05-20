import { apiClient } from "../services/api/client"

/**
 * Verifica la conexión con la API
 * @returns Promise con el resultado de la verificación
 */
export async function checkApiConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // Intentar hacer una solicitud simple a la API
    const response = await apiClient.get("/health", {
      timeout: 5000,
      skipAuthInterceptor: true,
      skipCache: true,
    })

    return {
      success: true,
      message: "Conexión con la API establecida correctamente",
      details: response.data,
    }
  } catch (error) {
    console.error("Error al verificar conexión con la API:", error)

    return {
      success: false,
      message: "No se pudo establecer conexión con la API",
      details: error,
    }
  }
}

/**
 * Verifica que los endpoints principales estén disponibles
 * @returns Promise con el resultado de la verificación
 */
export async function checkMainEndpoints(): Promise<{
  success: boolean
  results: Record<string, { success: boolean; status?: number; message: string }>
}> {
  // Lista de endpoints principales a verificar
  const endpoints = ["/destinos", "/naves", "/actividades", "/auth/status"]

  const results: Record<string, { success: boolean; status?: number; message: string }> = {}
  let overallSuccess = true

  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.get(endpoint, {
        timeout: 5000,
        skipAuthInterceptor: true,
        skipCache: true,
      })

      results[endpoint] = {
        success: true,
        status: response.status,
        message: "Endpoint disponible",
      }
    } catch (error: any) {
      overallSuccess = false
      results[endpoint] = {
        success: false,
        status: error.status,
        message: error.message || "Error desconocido",
      }
    }
  }

  return {
    success: overallSuccess,
    results,
  }
}
