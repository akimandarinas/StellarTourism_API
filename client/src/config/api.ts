/**
 * Configuración centralizada para la API
 */

// Obtener la URL base de la API desde las variables de entorno
// Unificamos el uso de variables de entorno para evitar inconsistencias
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.PUBLIC_API_URL || "http://localhost:8000/api"

// Validar que la URL tenga el formato correcto
const validateApiUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    // Asegurarse de que la URL no termine con una barra
    return urlObj.href.endsWith("/") ? urlObj.href.slice(0, -1) : urlObj.href
  } catch (error) {
    // Si la URL no es válida, intentar arreglarla
    if (!url.startsWith("http")) {
      // Asumir que es una ruta relativa
      const baseUrl = window.location.origin
      return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
    }
    console.error("URL de API inválida:", url, error)
    // Devolver una URL por defecto
    return "http://localhost:8000/api"
  }
}

// Configuración de la API
export const apiConfig = {
  baseUrl: validateApiUrl(API_URL),
  timeout: Number.parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10),
  retryAttempts: Number.parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || "3", 10),
  retryDelay: Number.parseInt(import.meta.env.VITE_API_RETRY_DELAY || "1000", 10),
  version: import.meta.env.VITE_API_VERSION || "v1",
  debug: import.meta.env.VITE_API_DEBUG === "true",
}

// Función para construir URLs de API
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number | boolean>): string => {
  // Normalizar el endpoint
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`

  // Construir la URL base
  let url = `${apiConfig.baseUrl}${normalizedEndpoint}`

  // Añadir parámetros de consulta si existen
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    url = `${url}?${searchParams.toString()}`
  }

  return url
}

// Exportar la configuración
export default apiConfig
