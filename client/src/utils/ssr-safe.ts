/**
 * Verifica si el código se está ejecutando en el cliente
 */
export function isClient(): boolean {
  return typeof window !== "undefined"
}

/**
 * Verifica si el código se está ejecutando en el servidor
 */
export function isServer(): boolean {
  return typeof window === "undefined"
}

/**
 * Ejecuta una función solo en el cliente
 */
export function runOnClient(fn: Function): void {
  if (isClient()) {
    fn()
  }
}

/**
 * Ejecuta una función solo en el servidor
 */
export function runOnServer(fn: Function): void {
  if (isServer()) {
    fn()
  }
}

/**
 * Obtiene un valor del localStorage de forma segura (solo en cliente)
 */
export function safeLocalStorage(key: string, defaultValue: any = null): any {
  if (!isClient()) return defaultValue

  try {
    const value = localStorage.getItem(key)
    return value !== null ? value : defaultValue
  } catch (e) {
    console.error(`Error al acceder a localStorage para la clave ${key}:`, e)
    return defaultValue
  }
}

/**
 * Establece un valor en localStorage de forma segura (solo en cliente)
 */
export function setSafeLocalStorage(key: string, value: any): boolean {
  if (!isClient()) return false

  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    console.error(`Error al establecer localStorage para la clave ${key}:`, e)
    return false
  }
}

/**
 * Elimina un valor de localStorage de forma segura (solo en cliente)
 */
export function removeSafeLocalStorage(key: string): boolean {
  if (!isClient()) return false

  try {
    localStorage.removeItem(key)
    return true
  } catch (e) {
    console.error(`Error al eliminar localStorage para la clave ${key}:`, e)
    return false
  }
}
