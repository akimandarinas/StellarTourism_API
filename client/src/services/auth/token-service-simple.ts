// Constantes
const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const EXPIRES_AT_KEY = "expires_at"
const SESSION_ID_KEY = "session_id"

// Servicio simplificado para gestionar tokens
const tokenService = {
  // Guardar tokens
  saveTokens: (tokens, options = { remember: true }) => {
    const storage = options.remember ? localStorage : sessionStorage

    if (tokens.accessToken) {
      storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    }

    if (tokens.refreshToken) {
      storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
    }

    if (tokens.expiresAt) {
      storage.setItem(EXPIRES_AT_KEY, String(tokens.expiresAt))
    }

    if (tokens.sessionId) {
      storage.setItem(SESSION_ID_KEY, tokens.sessionId)
    }

    // Disparar evento de token guardado
    window.dispatchEvent(new CustomEvent("token-saved"))
  },

  // Obtener token de acceso
  getAccessToken: () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY)
  },

  // Obtener token de actualización
  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY)
  },

  // Obtener ID de sesión
  getSessionId: () => {
    return localStorage.getItem(SESSION_ID_KEY) || sessionStorage.getItem(SESSION_ID_KEY)
  },

  // Verificar si el token está expirado
  isTokenExpired: () => {
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY) || sessionStorage.getItem(EXPIRES_AT_KEY)
    if (!expiresAt) return true

    return Date.now() > Number(expiresAt)
  },

  // Validar token (simplificado)
  validateToken: () => {
    const token = tokenService.getAccessToken()
    if (!token) return false

    return !tokenService.isTokenExpired()
  },

  // Limpiar tokens
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(EXPIRES_AT_KEY)
    localStorage.removeItem(SESSION_ID_KEY)

    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(EXPIRES_AT_KEY)
    sessionStorage.removeItem(SESSION_ID_KEY)

    // Disparar evento de tokens eliminados
    window.dispatchEvent(new Event("tokens-cleared"))
  },
}

export default tokenService
