import { getActivePinia, setActivePinia } from "pinia"

/**
 * Obtiene la instancia de Pinia de manera segura, incluso fuera de componentes
 */
export function getSafePinia() {
  // Intentar obtener la instancia activa de Pinia
  let pinia = getActivePinia()

  // Si no hay una instancia activa, intentar obtenerla desde window.__pinia
  if (!pinia && typeof window !== "undefined" && window.__pinia) {
    setActivePinia(window.__pinia)
    pinia = window.__pinia
  }

  return pinia
}

/**
 * Wrapper para usar stores de manera segura, incluso fuera de componentes
 * @param useStoreFunction - La función del store que se quiere usar
 * @returns La instancia del store o un objeto vacío si no se puede obtener
 */
export function useSafeStore(useStoreFunction) {
  const pinia = getSafePinia()
  if (pinia) {
    return useStoreFunction(pinia)
  } else {
    console.warn("No se pudo obtener una instancia de Pinia. Devolviendo un store simulado.")
    return createMockStore()
  }
}

/**
 * Crea un store simulado para evitar errores cuando Pinia no está disponible
 */
function createMockStore() {
  return {
    isAuthenticated: false,
    userProfile: null,
    displayName: "",
    // Añadir otras propiedades y métodos según sea necesario
  }
}

// Añadir la declaración de tipos para window.__pinia
declare global {
  interface Window {
    __pinia: any
  }
}
