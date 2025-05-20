/**
 * Composable simplificado para acceder a los stores de Pinia
 * Proporciona acceso centralizado a todos los stores de la aplicación
 * y evita la creación de múltiples instancias del mismo store
 */
import { storeToRefs } from "pinia"
import { setActivePinia, createPinia } from "pinia"
import {
  useAuthStore,
  useDestinosStore,
  useNavesStore,
  useReservasStore,
  useWebSocketStore,
  useNotificacionesStore,
  useUIStore,
  useCarritoStore,
  useSharedStore,
} from "../stores"

// Caché de stores para evitar múltiples instancias
const storeCache = new Map()

// Verificar si estamos en el cliente
const isClient = typeof window !== "undefined"

// Asegurarse de que siempre haya una instancia de pinia activa
const pinia = createPinia()
setActivePinia(pinia)

/**
 * Obtiene un store de Pinia con caché para evitar múltiples instancias
 * @param {string} storeName - Nombre del store a obtener
 * @returns {Object} - Instancia del store solicitado
 */
export function useStore(storeName) {
  // Si ya tenemos una instancia en caché, devolverla
  if (storeCache.has(storeName)) {
    return storeCache.get(storeName)
  }

  // Crear una nueva instancia según el nombre del store
  let store
  switch (storeName) {
    case "auth":
      store = useAuthStore(pinia)
      break
    case "destinos":
      store = useDestinosStore(pinia)
      break
    case "naves":
      store = useNavesStore(pinia)
      break
    case "reservas":
      store = useReservasStore(pinia)
      break
    case "websocket":
      store = useWebSocketStore(pinia)
      break
    case "notificaciones":
      store = useNotificacionesStore(pinia)
      break
    case "ui":
      store = useUIStore(pinia)
      break
    case "carrito":
      store = useCarritoStore(pinia)
      break
    case "shared":
      store = useSharedStore(pinia)
      break
    default:
      console.error(`Store "${storeName}" no encontrado`)
      return null
  }

  // Guardar en caché y devolver
  storeCache.set(storeName, store)
  return store
}

/**
 * Obtiene un store con sus propiedades reactivas
 * @param {Function} storeHook - Función que devuelve un store de Pinia
 * @param {Array} properties - Propiedades del store que se quieren obtener como refs
 * @returns {Object} - Objeto con el store y las propiedades reactivas
 */
export function useStoreWithRefs(storeHook, properties = []) {
  const store = storeHook()

  // Si no se especifican propiedades, devolver solo el store
  if (!properties.length) {
    return { store }
  }

  // Obtener las propiedades reactivas
  const storeRefs = storeToRefs(store)

  // Filtrar solo las propiedades solicitadas
  const refs = {}
  properties.forEach((prop) => {
    if (prop in storeRefs) {
      refs[prop] = storeRefs[prop]
    }
  })

  return {
    store,
    ...refs,
  }
}

// Exportar funciones específicas para cada store para mantener compatibilidad
const useAuthStoreOptimized = () => useStore("auth")
const useDestinosStoreOptimized = () => useStore("destinos")
const useNavesStoreOptimized = () => useStore("naves")
const useReservasStoreOptimized = () => useStore("reservas")
const useWebSocketStoreOptimized = () => useStore("websocket")
const useNotificacionesStoreOptimized = () => useStore("notificaciones")
const useUIStoreOptimized = () => useStore("ui")
const useCarritoStoreOptimized = () => useStore("carrito")
const useSharedStoreOptimized = () => useStore("shared")

export {
  useAuthStoreOptimized,
  useDestinosStoreOptimized,
  useNavesStoreOptimized,
  useReservasStoreOptimized,
  useWebSocketStoreOptimized,
  useNotificacionesStoreOptimized,
  useUIStoreOptimized,
  useCarritoStoreOptimized,
  useSharedStoreOptimized,
}

export default useStore
