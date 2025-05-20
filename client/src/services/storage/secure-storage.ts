import { encrypt, decrypt } from "../../utils/crypto"

// Interfaz para el almacenamiento
export interface Storage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
}

/**
 * Clase para el almacenamiento seguro
 */
class SecureStorage implements Storage {
  private storage: Storage
  private prefix: string

  constructor(storage: Storage, prefix = "stellar_") {
    this.storage = storage
    this.prefix = prefix
  }

  /**
   * Obtiene un elemento del almacenamiento
   */
  public getItem(key: string): string | null {
    const prefixedKey = this.prefix + key
    const encryptedValue = this.storage.getItem(prefixedKey)

    if (!encryptedValue) {
      return null
    }

    try {
      return decrypt(encryptedValue)
    } catch (error) {
      console.error("Error al desencriptar valor:", error)
      return null
    }
  }

  /**
   * Guarda un elemento en el almacenamiento
   */
  public setItem(key: string, value: string): void {
    const prefixedKey = this.prefix + key

    try {
      const encryptedValue = encrypt(value)
      this.storage.setItem(prefixedKey, encryptedValue)
    } catch (error) {
      console.error("Error al encriptar valor:", error)
    }
  }

  /**
   * Elimina un elemento del almacenamiento
   */
  public removeItem(key: string): void {
    const prefixedKey = this.prefix + key
    this.storage.removeItem(prefixedKey)
  }

  /**
   * Limpia todo el almacenamiento (solo los elementos con el prefijo)
   */
  public clear(): void {
    // Obtener todas las claves
    const keys = Object.keys(this.storage)

    // Eliminar solo las claves con nuestro prefijo
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key)
      }
    })
  }
}

/**
 * Clase para gestionar diferentes tipos de almacenamiento seguro
 */
class SecureStorageManager {
  // Almacenamiento de sesión (se borra al cerrar el navegador)
  public session: Storage

  // Almacenamiento persistente (se mantiene incluso después de cerrar el navegador)
  public persistent: Storage

  constructor() {
    // Crear instancias de almacenamiento seguro
    this.session = new SecureStorage(
      typeof sessionStorage !== "undefined" ? sessionStorage : this.createMemoryStorage(),
      "stellar_session_",
    )

    this.persistent = new SecureStorage(
      typeof localStorage !== "undefined" ? localStorage : this.createMemoryStorage(),
      "stellar_persistent_",
    )
  }

  /**
   * Crea un almacenamiento en memoria para entornos sin localStorage/sessionStorage
   */
  private createMemoryStorage(): Storage {
    const storage: Record<string, string> = {}

    return {
      getItem(key: string): string | null {
        return storage[key] || null
      },
      setItem(key: string, value: string): void {
        storage[key] = value
      },
      removeItem(key: string): void {
        delete storage[key]
      },
      clear(): void {
        Object.keys(storage).forEach((key) => {
          delete storage[key]
        })
      },
    }
  }
}

// Exportar instancia única
export const secureStorage = new SecureStorageManager()
