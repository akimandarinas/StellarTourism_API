import { isClient } from "./ssr-safe"

// Tipos de almacenamiento
type StorageType = "local" | "session" | "memory"

// Opciones para setState
interface SetStateOptions {
  storage?: StorageType
  expiry?: number // Tiempo de expiración en milisegundos
}

// Almacenamiento en memoria para cuando localStorage/sessionStorage no están disponibles
const memoryStorage: Record<string, any> = {}

/**
 * Guarda un estado en el almacenamiento especificado
 */
export function setState(key: string, value: any, options: SetStateOptions = {}): boolean {
  const { storage = "local", expiry } = options

  try {
    // Preparar el valor a guardar
    const valueToStore = {
      data: value,
      timestamp: Date.now(),
      expiry: expiry ? Date.now() + expiry : null,
    }

    const serialized = JSON.stringify(valueToStore)

    // Guardar según el tipo de almacenamiento
    if (storage === "memory" || !isClient()) {
      memoryStorage[key] = serialized
      return true
    }

    if (storage === "local") {
      localStorage.setItem(key, serialized)
      return true
    }

    if (storage === "session") {
      sessionStorage.setItem(key, serialized)
      return true
    }

    return false
  } catch (error) {
    console.error(`Error al guardar estado para ${key}:`, error)

    // Intentar usar memoria si falla el almacenamiento
    try {
      memoryStorage[key] = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        expiry: expiry ? Date.now() + expiry : null,
      })
      return true
    } catch {
      return false
    }
  }
}

/**
 * Obtiene un estado del almacenamiento especificado
 */
export function getState(key: string, defaultValue: any = null, options: { storage?: StorageType } = {}): any {
  const { storage = "local" } = options

  try {
    let serialized: string | null = null

    // Obtener según el tipo de almacenamiento
    if (storage === "memory" || !isClient()) {
      serialized = memoryStorage[key] || null
    } else if (storage === "local") {
      serialized = localStorage.getItem(key)
    } else if (storage === "session") {
      serialized = sessionStorage.getItem(key)
    }

    if (!serialized) return defaultValue

    const { data, expiry } = JSON.parse(serialized)

    // Verificar si ha expirado
    if (expiry && Date.now() > expiry) {
      removeState(key, { storage })
      return defaultValue
    }

    return data
  } catch (error) {
    console.error(`Error al obtener estado para ${key}:`, error)
    return defaultValue
  }
}

/**
 * Elimina un estado del almacenamiento especificado
 */
export function removeState(key: string, options: { storage?: StorageType } = {}): boolean {
  const { storage = "local" } = options

  try {
    // Eliminar según el tipo de almacenamiento
    if (storage === "memory" || !isClient()) {
      delete memoryStorage[key]
      return true
    }

    if (storage === "local") {
      localStorage.removeItem(key)
      return true
    }

    if (storage === "session") {
      sessionStorage.removeItem(key)
      return true
    }

    return false
  } catch (error) {
    console.error(`Error al eliminar estado para ${key}:`, error)
    return false
  }
}

/**
 * Limpia todos los estados del almacenamiento especificado
 */
export function clearState(options: { storage?: StorageType } = {}): boolean {
  const { storage = "local" } = options

  try {
    // Limpiar según el tipo de almacenamiento
    if (storage === "memory" || !isClient()) {
      Object.keys(memoryStorage).forEach((key) => {
        delete memoryStorage[key]
      })
      return true
    }

    if (storage === "local") {
      localStorage.clear()
      return true
    }

    if (storage === "session") {
      sessionStorage.clear()
      return true
    }

    return false
  } catch (error) {
    console.error(`Error al limpiar estados:`, error)
    return false
  }
}
