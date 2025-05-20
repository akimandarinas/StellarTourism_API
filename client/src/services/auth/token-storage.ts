import { isBrowser, safeLocalStorage, safeSessionStorage } from "../../utils/client-only"

// Constantes
const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const EXPIRES_AT_KEY = "expires_at"
const SESSION_ID_KEY = "session_id"
const REMEMBER_KEY = "remember_token"

// Interfaz para opciones de guardado
interface SaveOptions {
  remember?: boolean
}

// Interfaz para tokens
interface TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number
  sessionId?: string
}

/**
 * Clase para gestionar el almacenamiento de tokens
 */
class TokenStorage {
  /**
   * Guarda los tokens en el almacenamiento
   * @param tokens Datos de los tokens
   * @param options Opciones de guardado
   */
  saveTokens(tokens: TokenData, options: SaveOptions = {}): void {
    if (!isBrowser) return

    const { accessToken, refreshToken, expiresAt, sessionId } = tokens
    const { remember = false } = options

    // Determinar el almacenamiento a usar
    const storage = remember ? safeLocalStorage : safeSessionStorage

    // Guardar tokens
    storage.setItem(ACCESS_TOKEN_KEY, accessToken)
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    storage.setItem(EXPIRES_AT_KEY, expiresAt.toString())

    if (sessionId) {
      storage.setItem(SESSION_ID_KEY, sessionId)
    }

    // Guardar preferencia de recordar
    safeLocalStorage.setItem(REMEMBER_KEY, remember.toString())

    // Disparar evento de tokens guardados
    if (isBrowser) {
      window.dispatchEvent(
        new CustomEvent("tokens-saved", {
          detail: { expiresAt: new Date(expiresAt).toISOString() },
        }),
      )
    }
  }

  /**
   * Limpia todos los tokens almacenados
   */
  clearTokens(): void {
    if (!isBrowser) return

    // Limpiar en ambos almacenamientos
    safeLocalStorage.removeItem(ACCESS_TOKEN_KEY)
    safeLocalStorage.removeItem(REFRESH_TOKEN_KEY)
    safeLocalStorage.removeItem(EXPIRES_AT_KEY)
    safeLocalStorage.removeItem(SESSION_ID_KEY)

    safeSessionStorage.removeItem(ACCESS_TOKEN_KEY)
    safeSessionStorage.removeItem(REFRESH_TOKEN_KEY)
    safeSessionStorage.removeItem(EXPIRES_AT_KEY)
    safeSessionStorage.removeItem(SESSION_ID_KEY)

    // Disparar evento de tokens eliminados
    if (isBrowser) {
      window.dispatchEvent(new Event("tokens-cleared"))
    }
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken(): string | null {
    if (!isBrowser) return null

    // Verificar primero en sessionStorage, luego en localStorage
    return safeSessionStorage.getItem(ACCESS_TOKEN_KEY) || safeLocalStorage.getItem(ACCESS_TOKEN_KEY)
  }

  /**
   * Obtiene el token de refresco
   */
  getRefreshToken(): string | null {
    if (!isBrowser) return null

    // Verificar primero en sessionStorage, luego en localStorage
    return safeSessionStorage.getItem(REFRESH_TOKEN_KEY) || safeLocalStorage.getItem(REFRESH_TOKEN_KEY)
  }

  /**
   * Obtiene la fecha de expiración del token
   */
  getExpiresAt(): number | null {
    if (!isBrowser) return null

    // Verificar primero en sessionStorage, luego en localStorage
    const expiresAt = safeSessionStorage.getItem(EXPIRES_AT_KEY) || safeLocalStorage.getItem(EXPIRES_AT_KEY)

    return expiresAt ? Number.parseInt(expiresAt, 10) : null
  }

  /**
   * Obtiene el ID de sesión
   */
  getSessionId(): string | null {
    if (!isBrowser) return null

    // Verificar primero en sessionStorage, luego en localStorage
    return safeSessionStorage.getItem(SESSION_ID_KEY) || safeLocalStorage.getItem(SESSION_ID_KEY)
  }

  /**
   * Verifica si el token ha expirado
   */
  isTokenExpired(): boolean {
    if (!isBrowser) return true

    const expiresAt = this.getExpiresAt()

    if (!expiresAt) {
      return true
    }

    // Comprobar si ha expirado (con un margen de 10 segundos)
    return Date.now() >= expiresAt - 10000
  }

  /**
   * Verifica si el token necesita ser renovado
   * (cuando está a menos de 5 minutos de expirar)
   */
  needsRefresh(): boolean {
    if (!isBrowser) return true

    const expiresAt = this.getExpiresAt()

    if (!expiresAt) {
      return true
    }

    // Comprobar si está a menos de 5 minutos de expirar
    const fiveMinutesInMs = 5 * 60 * 1000
    return Date.now() >= expiresAt - fiveMinutesInMs
  }

  /**
   * Valida la estructura del token
   */
  validateToken(): boolean {
    if (!isBrowser) return false

    const token = this.getAccessToken()

    if (!token) {
      return false
    }

    // Verificar formato básico (3 partes separadas por puntos)
    const parts = token.split(".")
    return parts.length === 3
  }
}

// Exportar instancia única
export const tokenStorage = new TokenStorage()

// Exportar como default para compatibilidad
export default tokenStorage
