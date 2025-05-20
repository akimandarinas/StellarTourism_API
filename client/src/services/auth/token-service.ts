import { jwtDecode } from "jwt-decode"
import { encrypt, decrypt } from "../../utils/crypto"
import { isBrowser, safeLocalStorage, safeSessionStorage } from "../../utils/client-only"

// Tipos para tokens
export interface TokenPayload {
  sub: string
  exp: number
  iat: number
  email?: string
  session_id?: string
  [key: string]: any
}

export interface TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number
  sessionId?: string
}

// Constantes
const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const EXPIRES_AT_KEY = "expires_at"
const SESSION_ID_KEY = "session_id"
const ENCRYPTION_KEY =
  isBrowser() && import.meta.env.VITE_TOKEN_ENCRYPTION_KEY
    ? import.meta.env.VITE_TOKEN_ENCRYPTION_KEY
    : "stellar_tourism_default_key"
const TOKEN_KEY = "stellar_tourism_token"
const REFRESH_TOKEN_KEY_STORAGE = "stellar_tourism_refresh_token"
const USER_KEY = "stellar_tourism_user"
const EXPIRATION_KEY = "stellar_tourism_expiration"
const TOKEN_EXPIRY_KEY = "token_expiry_key"

// Tiempo antes de expiración para renovar el token (15 minutos)
const TOKEN_REFRESH_THRESHOLD = 15 * 60 * 1000

/**
 * Servicio para gestionar tokens de autenticación de forma segura
 */
export class TokenService {
  private useSecureCookies: boolean
  private useEncryption: boolean

  constructor(options: { useSecureCookies?: boolean; useEncryption?: boolean } = {}) {
    // Determinar si se pueden usar cookies seguras (solo en HTTPS)
    this.useSecureCookies = options.useSecureCookies ?? (isBrowser() && window.location.protocol === "https:")

    // Usar encriptación para localStorage como fallback
    this.useEncryption = options.useEncryption ?? true
  }

  // Mejorar la seguridad del almacenamiento de tokens y la gestión de expiración

  // 1. Mejorar el método saveTokens para usar almacenamiento más seguro
  saveTokens(tokenData: TokenData, options: { remember?: boolean; secure?: boolean } = {}): void {
    if (!isBrowser()) return

    const { accessToken, refreshToken, expiresAt, sessionId } = tokenData
    const remember = options.remember ?? true
    const secure = options.secure ?? this.useSecureCookies

    // Añadir protección contra XSS usando httpOnly cuando sea posible
    if (secure) {
      // Usar cookies HttpOnly cuando sea posible (requiere configuración del servidor)
      this.setCookie(ACCESS_TOKEN_KEY, accessToken, {
        expires: new Date(expiresAt),
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      })
      this.setCookie(REFRESH_TOKEN_KEY_STORAGE, refreshToken, {
        expires: new Date(expiresAt + 7 * 24 * 60 * 60 * 1000), // 7 días
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      })
      this.setCookie(EXPIRATION_KEY, expiresAt.toString(), {
        expires: new Date(expiresAt),
        secure: true,
        sameSite: "strict",
      })
      if (sessionId) {
        this.setCookie(SESSION_ID_KEY, sessionId, {
          expires: new Date(expiresAt),
          secure: true,
          sameSite: "strict",
        })
      }

      // Añadir una cookie de señalización para detectar manipulación
      const tokenSignature = this.generateTokenSignature(accessToken)
      this.setCookie("token_signature", tokenSignature, {
        expires: new Date(expiresAt),
        secure: true,
        sameSite: "strict",
      })
    } else {
      // Fallback a storage con encriptación mejorada
      const encryptedAccessToken = this.useEncryption ? this.encryptWithSalt(accessToken, ENCRYPTION_KEY) : accessToken
      const encryptedRefreshToken = this.useEncryption
        ? this.encryptWithSalt(refreshToken, ENCRYPTION_KEY)
        : refreshToken

      // Usar storage según la opción de recordar
      const storage = remember ? safeLocalStorage : safeSessionStorage

      storage.setItem(ACCESS_TOKEN_KEY, encryptedAccessToken)
      storage.setItem(REFRESH_TOKEN_KEY_STORAGE, encryptedRefreshToken)
      storage.setItem(EXPIRATION_KEY, expiresAt.toString())
      if (sessionId) {
        storage.setItem(SESSION_ID_KEY, sessionId)
      }

      // Añadir una firma para detectar manipulación
      const tokenSignature = this.generateTokenSignature(accessToken)
      storage.setItem("token_signature", tokenSignature)
    }

    // Registrar evento para debugging
    if (isBrowser()) {
      const event = new CustomEvent("token-saved", {
        detail: {
          expiresAt: new Date(expiresAt).toISOString(),
          secure,
          remember,
        },
      })
      window.dispatchEvent(event)
    }
  }

  // 2. Añadir método para generar firma de token
  private generateTokenSignature(token: string): string {
    // Crear una firma simple basada en partes del token y user agent
    const tokenParts = token.split(".")
    if (tokenParts.length < 2) return ""

    const userAgent = isBrowser() ? navigator.userAgent : ""
    const baseSignature = tokenParts[1].substring(0, 10) + userAgent.substring(0, 10)

    // Crear un hash simple
    let hash = 0
    for (let i = 0; i < baseSignature.length; i++) {
      const char = baseSignature.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convertir a entero de 32 bits
    }

    return hash.toString(36)
  }

  // 3. Mejorar el método para encriptar con salt
  private encryptWithSalt(text: string, key: string): string {
    try {
      // Añadir un salt aleatorio para cada encriptación
      const salt = Math.random().toString(36).substring(2, 15)
      const saltedText = salt + text

      return salt + encrypt(saltedText, key)
    } catch (e) {
      console.error("Error al encriptar token", e)
      return text // Fallback a texto plano en caso de error
    }
  }

  // 4. Mejorar el método para desencriptar con salt
  private decryptWithSalt(encryptedText: string, key: string): string {
    try {
      if (encryptedText.length < 13) return encryptedText

      // Extraer el salt (primeros caracteres)
      const salt = encryptedText.substring(0, 13)
      const encryptedWithoutSalt = encryptedText.substring(13)

      const decrypted = decrypt(encryptedWithoutSalt, key)

      // Remover el salt del texto desencriptado
      if (decrypted.startsWith(salt)) {
        return decrypted.substring(salt.length)
      }

      return decrypted
    } catch (e) {
      console.error("Error al desencriptar token", e)
      return "" // Retornar cadena vacía en caso de error
    }
  }

  /**
   * Obtiene el token de acceso
   * @returns Token de acceso o null si no existe
   */
  getAccessToken(): string | null {
    if (!isBrowser()) return null

    if (this.useSecureCookies) {
      // En producción, el token se obtendría automáticamente en las solicitudes
      const token = this.getCookie(ACCESS_TOKEN_KEY)

      // Verificar la integridad del token con la firma
      if (token) {
        const storedSignature = this.getCookie("token_signature")
        const calculatedSignature = this.generateTokenSignature(token)

        if (storedSignature !== calculatedSignature) {
          console.warn("Posible manipulación de token detectada")
          this.clearTokens()
          return null
        }
      }

      return token
    } else {
      // Intentar obtener de localStorage primero, luego de sessionStorage
      let encryptedToken = safeLocalStorage.getItem(ACCESS_TOKEN_KEY)

      if (!encryptedToken) {
        encryptedToken = safeSessionStorage.getItem(ACCESS_TOKEN_KEY)
      }

      if (!encryptedToken) return null

      // Verificar la integridad del token con la firma
      const storedSignature =
        safeLocalStorage.getItem("token_signature") || safeSessionStorage.getItem("token_signature")

      const decryptedToken = this.useEncryption ? this.decryptWithSalt(encryptedToken, ENCRYPTION_KEY) : encryptedToken

      if (decryptedToken && storedSignature) {
        const calculatedSignature = this.generateTokenSignature(decryptedToken)

        if (storedSignature !== calculatedSignature) {
          console.warn("Posible manipulación de token detectada")
          this.clearTokens()
          return null
        }
      }

      return decryptedToken
    }
  }

  // 6. Mejorar el método getRefreshToken de manera similar
  getRefreshToken(): string | null {
    if (!isBrowser()) return null

    if (this.useSecureCookies) {
      return this.getCookie(REFRESH_TOKEN_KEY_STORAGE)
    } else {
      // Intentar obtener de localStorage primero, luego de sessionStorage
      let encryptedToken = safeLocalStorage.getItem(REFRESH_TOKEN_KEY_STORAGE)

      if (!encryptedToken) {
        encryptedToken = safeSessionStorage.getItem(REFRESH_TOKEN_KEY_STORAGE)
      }

      if (!encryptedToken) return null

      return this.useEncryption ? this.decryptWithSalt(encryptedToken, ENCRYPTION_KEY) : encryptedToken
    }
  }

  /**
   * Obtiene la fecha de expiración del token
   */
  getExpiresAt(): number | null {
    if (!isBrowser()) return null

    const expiresAt = safeLocalStorage.getItem(EXPIRES_AT_KEY) || safeSessionStorage.getItem(EXPIRES_AT_KEY)
    return expiresAt ? Number(expiresAt) : null
  }

  /**
   * Obtiene el ID de sesión
   * @returns ID de sesión o null si no existe
   */
  getSessionId(): string | null {
    if (!isBrowser()) return null

    if (this.useSecureCookies) {
      return this.getCookie(SESSION_ID_KEY)
    } else {
      return safeLocalStorage.getItem(SESSION_ID_KEY)
    }
  }

  // 7. Mejorar el método clearTokens para limpiar todos los storages
  clearTokens(): void {
    if (!isBrowser()) return

    // Limpiar cookies
    if (this.useSecureCookies) {
      this.removeCookie(ACCESS_TOKEN_KEY)
      this.removeCookie(REFRESH_TOKEN_KEY_STORAGE)
      this.removeCookie(TOKEN_EXPIRY_KEY)
      this.removeCookie(SESSION_ID_KEY)
      this.removeCookie("token_signature")
    }

    // Limpiar localStorage
    safeLocalStorage.removeItem(ACCESS_TOKEN_KEY)
    safeLocalStorage.removeItem(REFRESH_TOKEN_KEY_STORAGE)
    safeLocalStorage.removeItem(TOKEN_EXPIRY_KEY)
    safeLocalStorage.removeItem(SESSION_ID_KEY)
    safeLocalStorage.removeItem("token_signature")
    safeLocalStorage.removeItem(USER_KEY)
    safeLocalStorage.removeItem(EXPIRATION_KEY)

    // Limpiar sessionStorage
    safeSessionStorage.removeItem(ACCESS_TOKEN_KEY)
    safeSessionStorage.removeItem(REFRESH_TOKEN_KEY_STORAGE)
    safeSessionStorage.removeItem(TOKEN_EXPIRY_KEY)
    safeSessionStorage.removeItem(SESSION_ID_KEY)
    safeSessionStorage.removeItem("token_signature")

    // Disparar evento de tokens eliminados
    if (isBrowser()) {
      window.dispatchEvent(new Event("tokens-cleared"))
    }
  }

  /**
   * Verifica si el token de acceso está expirado
   * @param safetyMarginMs Margen de seguridad en ms (por defecto 30 segundos)
   * @returns true si el token está expirado o no existe
   */
  isTokenExpired(safetyMarginMs = 30000): boolean {
    if (!isBrowser()) return true

    const token = this.getAccessToken()
    if (!token) return true

    try {
      const decoded = this.decodeToken(token)
      const now = Date.now()

      // Token está expirado si la fecha actual más el margen de seguridad
      // es mayor que la fecha de expiración
      return now + safetyMarginMs >= decoded.exp * 1000
    } catch (error) {
      console.error("Error al decodificar token:", error)
      return true
    }
  }

  /**
   * Verifica si el token necesita ser renovado pronto
   * @param thresholdMs Umbral en ms para considerar que el token necesita renovación
   * @returns true si el token expirará pronto
   */
  needsRefresh(thresholdMs: number = TOKEN_REFRESH_THRESHOLD): boolean {
    if (!isBrowser()) return true

    const token = this.getAccessToken()
    if (!token) return true

    try {
      const decoded = this.decodeToken(token)
      const now = Date.now()

      // Token necesita renovación si expirará en menos del umbral definido
      return now >= decoded.exp * 1000 - thresholdMs
    } catch (error) {
      console.error("Error al decodificar token:", error)
      return true
    }
  }

  /**
   * Obtiene información sobre el token actual
   * @returns Información del token o null si no hay token
   */
  getTokenInfo(): { isValid: boolean; expiresIn: number; payload: TokenPayload } | null {
    if (!isBrowser()) return null

    const token = this.getAccessToken()
    if (!token) return null

    try {
      const decoded = this.decodeToken(token)
      const now = Date.now()
      const expiresAt = decoded.exp * 1000

      return {
        isValid: now < expiresAt,
        expiresIn: Math.max(0, expiresAt - now),
        payload: decoded,
      }
    } catch (error) {
      console.error("Error al decodificar token:", error)
      return null
    }
  }

  // 8. Mejorar la validación de tokens para detectar tokens manipulados
  validateToken(): boolean {
    if (!isBrowser()) return false

    const token = this.getAccessToken()
    if (!token) return false

    try {
      const decoded = this.decodeToken(token)
      const now = Date.now()

      // Verificar si el token es válido
      if (now >= decoded.exp * 1000) {
        // Token expirado, eliminarlo
        this.clearTokens()
        return false
      }

      // Verificar la integridad del token
      const storedSignature = this.useSecureCookies
        ? this.getCookie("token_signature")
        : safeLocalStorage.getItem("token_signature") || safeSessionStorage.getItem("token_signature")

      if (storedSignature) {
        const calculatedSignature = this.generateTokenSignature(token)

        if (storedSignature !== calculatedSignature) {
          console.warn("Posible manipulación de token detectada")
          this.clearTokens()
          return false
        }
      }

      return true
    } catch (error) {
      // Error al decodificar, token inválido
      console.error("Error al validar token:", error)
      this.clearTokens()
      return false
    }
  }

  /**
   * Decodifica un token JWT
   * @param token Token JWT
   * @returns Payload del token
   */
  decodeToken(token: string): TokenPayload {
    return jwtDecode<TokenPayload>(token)
  }

  /**
   * Establece una cookie
   * @param name Nombre de la cookie
   * @param value Valor de la cookie
   * @param options Opciones de la cookie
   */
  private setCookie(
    name: string,
    value: string,
    options: { expires?: Date; secure?: boolean; httpOnly?: boolean; sameSite?: "strict" | "lax" | "none" } = {},
  ): void {
    if (!isBrowser()) return

    let cookie = `${name}=${encodeURIComponent(value)}`

    if (options.expires) {
      cookie += `; expires=${options.expires.toUTCString()}`
    }

    if (options.secure) {
      cookie += "; secure"
    }

    if (options.httpOnly) {
      cookie += "; httpOnly"
    }

    if (options.sameSite) {
      cookie += `; sameSite=${options.sameSite}`
    }

    cookie += "; path=/"

    document.cookie = cookie
  }

  /**
   * Obtiene el valor de una cookie
   * @param name Nombre de la cookie
   * @returns Valor de la cookie o null si no existe
   */
  private getCookie(name: string): string | null {
    if (!isBrowser()) return null

    const cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.startsWith(name + "=")) {
        return decodeURIComponent(cookie.substring(name.length + 1))
      }
    }
    return null
  }

  /**
   * Elimina una cookie
   * @param name Nombre de la cookie
   */
  private removeCookie(name: string): void {
    if (!isBrowser()) return

    this.setCookie(name, "", { expires: new Date(0) })
  }
}

// Crear una instancia del servicio de tokens
const tokenServiceInstance = new TokenService()

// Interfaz para el almacenamiento de tokens
export interface TokenStorage {
  getToken: () => string | null
  setToken: (token: string) => void
  getRefreshToken: () => string | null
  setRefreshToken: (token: string) => void
  getUser: () => any
  setUser: (user: any) => void
  getExpiration: () => number | null
  setExpiration: (expiration: number) => void
  clearTokens: () => void
  isAuthenticated: () => boolean
  hasValidToken: () => boolean
  getAccessToken: () => string | null
  getSessionId: () => string | null
  isTokenExpired: () => boolean
}

// Implementación del almacenamiento de tokens
export const tokenStorage: TokenStorage = {
  // Obtener token de acceso
  getToken: () => {
    return isBrowser() ? safeLocalStorage.getItem(TOKEN_KEY) : null
  },

  // Establecer token de acceso
  setToken: (token: string) => {
    if (isBrowser()) safeLocalStorage.setItem(TOKEN_KEY, token)
  },

  // Obtener token de actualización
  getRefreshToken: () => {
    return isBrowser() ? safeLocalStorage.getItem(REFRESH_TOKEN_KEY_STORAGE) : null
  },

  // Establecer token de actualización
  setRefreshToken: (token: string) => {
    if (isBrowser()) safeLocalStorage.setItem(REFRESH_TOKEN_KEY_STORAGE, token)
  },

  // Obtener información del usuario
  getUser: () => {
    if (!isBrowser()) return null
    const userJson = safeLocalStorage.getItem(USER_KEY)
    return userJson ? JSON.parse(userJson) : null
  },

  // Establecer información del usuario
  setUser: (user: any) => {
    if (isBrowser()) safeLocalStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  // Obtener tiempo de expiración
  getExpiration: () => {
    if (!isBrowser()) return null
    const expiration = safeLocalStorage.getItem(EXPIRATION_KEY)
    return expiration ? Number.parseInt(expiration, 10) : null
  },

  // Establecer tiempo de expiración
  setExpiration: (expiration: number) => {
    if (isBrowser()) safeLocalStorage.setItem(EXPIRATION_KEY, expiration.toString())
  },

  // Limpiar todos los tokens
  clearTokens: () => {
    if (isBrowser()) {
      safeLocalStorage.removeItem(TOKEN_KEY)
      safeLocalStorage.removeItem(REFRESH_TOKEN_KEY_STORAGE)
      safeLocalStorage.removeItem(USER_KEY)
      safeLocalStorage.removeItem(EXPIRATION_KEY)
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return isBrowser() ? !!tokenStorage.getToken() && tokenStorage.hasValidToken() : false
  },

  // Verificar si el token es válido (no ha expirado)
  hasValidToken: () => {
    if (!isBrowser()) return false
    const expiration = tokenStorage.getExpiration()
    if (!expiration) return false

    return Date.now() < expiration
  },

  // Obtener token de acceso (para compatibilidad con SessionManager)
  getAccessToken: () => {
    return tokenServiceInstance.getAccessToken()
  },

  // Obtener ID de sesión (para compatibilidad con SessionManager)
  getSessionId: () => {
    return tokenServiceInstance.getSessionId()
  },

  // Verificar si el token está expirado (para compatibilidad con SessionManager)
  isTokenExpired: () => {
    return tokenServiceInstance.isTokenExpired()
  },
}

export default tokenServiceInstance
