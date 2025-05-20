/**
 * Corrección de errores comunes en el manejo de promesas
 *
 * 1. Promesas sin manejo de errores
 * 2. Uso de .then() sin .catch()
 * 3. Uso incorrecto de async/await
 */

// Ejemplo de corrección para manejo de promesas
export async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    throw error // Re-lanzar para manejo superior
  }
}

// Ejemplo de corrección para múltiples promesas
export async function fetchMultipleResources(urls) {
  try {
    const results = await Promise.allSettled(urls.map((url) => fetchWithErrorHandling(url)))

    // Procesar resultados, separando éxitos y fallos
    const successful = results.filter((result) => result.status === "fulfilled").map((result) => result.value)

    const failed = results.filter((result) => result.status === "rejected").map((result) => result.reason)

    if (failed.length > 0) {
      console.warn(`${failed.length} recursos fallaron al cargar:`, failed)
    }

    return successful
  } catch (error) {
    console.error("Error al cargar múltiples recursos:", error)
    throw error
  }
}
