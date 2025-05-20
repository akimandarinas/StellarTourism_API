import { isBrowser, safeLocalStorage, safeWindow, safeDocument } from "../../utils/client-only"
import { apiClient } from "../api/client"
import tokenService, { tokenStorage } from "./token-service"
import type { ApiResponse } from "../../types/api"

// Tipos para sesiones
export interface Session {
  id: string
  createdAt: string
  lastActiveAt: string
  deviceInfo: {
    browser: string
    os: string
    ip: string
    location?: string
  }
  isCurrent: boolean
}

export interface SessionsResponse {
  sessions: Session[]
  currentSessionId: string
}

export interface SessionInfo {
  id: string
  createdAt: number
  lastActivity: number
  expiresAt: number
  device?: string
  ip?: string
  userAgent?: string
}

/**
 * Servicio para gestionar sesiones de usuario
 */
export class SessionManager {
  private heartbeatInterval: number | null = null
  private sessionTimeoutId: number | null = null
  private readonly HEARTBEAT_INTERVAL = 5 * 60 * 1000 // 5 minutos
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutos
  private readonly SESSION_ACTIVITY_KEY = "stellar_tourism_last_activity"

  constructor() {
    // Solo inicializar listeners en el navegador
    if (isBrowser()) {
      this.initListeners()
    }
  }

  /**
   * Inicia una nueva sesión
   * @param userId ID del usuario
   * @returns Promesa con la respuesta de la API
   */
  async startSession(userId: string): Promise<ApiResponse<{ sessionId: string }>> {
    if (!isBrowser()) {
      return { success: false, data: { sessionId: "" }, status: 400 }
    }

    // Obtener información del dispositivo
    const deviceInfo = this.getDeviceInfo()

    // Crear sesión en el servidor
    const response = await apiClient.post<{ sessionId: string }>("/auth/sessions", {
      userId,
      deviceInfo,
    })

    // Guardar ID de sesión
    if (response.success && response.data) {
      safeLocalStorage.setItem("stellar_session_id", response.data.sessionId)

      // Iniciar heartbeat para mantener la sesión activa
      this.startHeartbeat(response.data.sessionId)
    }

    return response
  }

  /**
   * Cierra una sesión específica
   * @param sessionId ID de la sesión a cerrar
   * @returns Promesa con la respuesta de la API
   */
  async closeSession(sessionId: string): Promise<ApiResponse<void>> {
    if (!isBrowser()) {
      return { success: false, data: undefined, status: 400 }
    }

    // Si es la sesión actual, limpiar tokens
    const currentSessionId = tokenService.getSessionId()
    if (sessionId === currentSessionId) {
      this.stopHeartbeat()
      tokenService.clearTokens()
    }

    return await apiClient.delete<void>(`/auth/sessions/${sessionId}`)
  }

  /**
   * Cierra todas las sesiones excepto la actual
   * @returns Promesa con la respuesta de la API
   */
  async closeOtherSessions(): Promise<ApiResponse<void>> {
    if (!isBrowser()) {
      return { success: false, data: undefined, status: 400 }
    }

    return await apiClient.delete<void>("/auth/sessions/others")
  }

  /**
   * Cierra todas las sesiones, incluida la actual
   * @returns Promesa con la respuesta de la API
   */
  async closeAllSessions(): Promise<ApiResponse<void>> {
    if (!isBrowser()) {
      return { success: false, data: undefined, status: 400 }
    }

    this.stopHeartbeat()
    tokenService.clearTokens()
    return await apiClient.delete<void>("/auth/sessions/all")
  }

  /**
   * Actualiza la última actividad de la sesión actual
   * @returns Promesa con la respuesta de la API
   */
  async updateSessionActivity(): Promise<ApiResponse<void>> {
    if (!isBrowser()) {
      return { success: false, data: undefined, status: 400 }
    }

    const sessionId = tokenService.getSessionId()
    if (!sessionId) return { success: false, data: undefined, status: 400 }

    return await apiClient.put<void>(`/auth/sessions/${sessionId}/activity`, {
      lastActiveAt: new Date().toISOString(),
    })
  }

  /**
   * Inicia el heartbeat para mantener la sesión activa
   * @param sessionId ID de la sesión
   */
  private startHeartbeat(sessionId: string): void {
    if (!isBrowser()) return

    // Detener heartbeat existente si hay uno
    this.stopHeartbeat()

    // Iniciar nuevo heartbeat
    this.heartbeatInterval = safeWindow.setInterval(() => {
      this.updateSessionActivity().catch((error) => {
        console.error("Error al actualizar actividad de sesión:", error)
      })
    }, this.HEARTBEAT_INTERVAL)
  }

  /**
   * Detiene el heartbeat
   */
  private stopHeartbeat(): void {
    if (!isBrowser()) return

    if (this.heartbeatInterval !== null) {
      safeWindow.clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Obtiene información del dispositivo actual
   * @returns Información del dispositivo
   */
  private getDeviceInfo(): { browser: string; os: string; ip: string } {
    if (!isBrowser()) {
      return {
        browser: "Unknown",
        os: "Unknown",
        ip: "0.0.0.0",
      }
    }

    // En un entorno real, obtendríamos esta información de forma más robusta
    // y la IP se obtendría del servidor
    const userAgent = safeWindow.navigator.userAgent

    let browser = "Desconocido"
    if (userAgent.indexOf("Chrome") > -1) browser = "Chrome"
    else if (userAgent.indexOf("Firefox") > -1) browser = "Firefox"
    else if (userAgent.indexOf("Safari") > -1) browser = "Safari"
    else if (userAgent.indexOf("Edge") > -1) browser = "Edge"
    else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) browser = "Internet Explorer"

    let os = "Desconocido"
    if (userAgent.indexOf("Windows") > -1) os = "Windows"
    else if (userAgent.indexOf("Mac") > -1) os = "MacOS"
    else if (userAgent.indexOf("Linux") > -1) os = "Linux"
    else if (userAgent.indexOf("Android") > -1) os = "Android"
    else if (userAgent.indexOf("iOS") > -1) os = "iOS"

    return {
      browser,
      os,
      ip: "0.0.0.0", // En un entorno real, esto se obtendría del servidor
    }
  }

  /**
   * Inicializa los listeners para eventos de sesión
   */
  private initListeners(): void {
    if (!isBrowser()) return

    // Listener para actividad del usuario
    const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"]

    activityEvents.forEach((event) => {
      safeWindow.addEventListener(event, this.handleUserActivity.bind(this), { passive: true })
    })

    // Listener para cambios de visibilidad
    safeDocument.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this))

    // Listener para eventos de autenticación
    safeWindow.addEventListener("tokens-saved", this.startSessionMonitoring.bind(this))
    safeWindow.addEventListener("tokens-cleared", this.stopSessionMonitoring.bind(this))
    safeWindow.addEventListener("session-expired", this.handleSessionExpired.bind(this))

    // Iniciar monitoreo si ya hay una sesión
    try {
      // Verificar si tokenStorage tiene el método getAccessToken
      if (typeof tokenStorage.getAccessToken === "function" && tokenStorage.getAccessToken()) {
        this.startSessionMonitoring()
      } else if (typeof tokenService.getAccessToken === "function" && tokenService.getAccessToken()) {
        // Fallback a tokenService si tokenStorage no tiene el método
        this.startSessionMonitoring()
      }
    } catch (error) {
      console.error("[SessionManager] Error al verificar token:", error)
    }
  }

  /**
   * Maneja la actividad del usuario
   */
  private handleUserActivity(): void {
    if (!isBrowser()) return

    // Actualizar timestamp de última actividad
    safeLocalStorage.setItem(this.SESSION_ACTIVITY_KEY, Date.now().toString())

    // Reiniciar temporizador de inactividad
    this.resetInactivityTimer()
  }

  /**
   * Maneja cambios de visibilidad del documento
   */
  private handleVisibilityChange(): void {
    if (!isBrowser()) return

    if (safeDocument.visibilityState === "visible") {
      // Verificar si la sesión ha expirado por inactividad
      this.checkSessionActivity()

      // Enviar heartbeat
      this.sendHeartbeat()
    }
  }

  /**
   * Maneja eventos de sesión expirada
   */
  private handleSessionExpired(event: CustomEvent): void {
    if (!isBrowser()) return

    console.warn("[SessionManager] Sesión expirada:", event.detail)

    // Detener monitoreo
    this.stopSessionMonitoring()

    // Mostrar mensaje al usuario
    this.showSessionExpiredMessage(event.detail)
  }

  /**
   * Inicia el monitoreo de sesión
   */
  private startSessionMonitoring(): void {
    if (!isBrowser()) return

    console.log("[SessionManager] Iniciando monitoreo de sesión")

    // Registrar actividad inicial
    safeLocalStorage.setItem(this.SESSION_ACTIVITY_KEY, Date.now().toString())

    // Iniciar heartbeat
    if (!this.heartbeatInterval) {
      this.heartbeatInterval = safeWindow.setInterval(this.sendHeartbeat.bind(this), this.HEARTBEAT_INTERVAL)
    }

    // Iniciar temporizador de inactividad
    this.resetInactivityTimer()
  }

  /**
   * Detiene el monitoreo de sesión
   */
  private stopSessionMonitoring(): void {
    if (!isBrowser()) return

    console.log("[SessionManager] Deteniendo monitoreo de sesión")

    // Detener heartbeat
    if (this.heartbeatInterval) {
      safeWindow.clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    // Detener temporizador de inactividad
    if (this.sessionTimeoutId) {
      safeWindow.clearTimeout(this.sessionTimeoutId)
      this.sessionTimeoutId = null
    }

    // Limpiar datos de actividad
    safeLocalStorage.removeItem(this.SESSION_ACTIVITY_KEY)
  }

  /**
   * Envía un heartbeat al servidor
   */
  private async sendHeartbeat(): Promise<void> {
    if (!isBrowser()) return

    // Verificar si hay una sesión activa
    let token = null
    try {
      // Intentar obtener el token de tokenStorage primero
      if (typeof tokenStorage.getAccessToken === "function") {
        token = tokenStorage.getAccessToken()
      }

      // Si no hay token, intentar con tokenService
      if (!token && typeof tokenService.getAccessToken === "function") {
        token = tokenService.getAccessToken()
      }
    } catch (error) {
      console.error("[SessionManager] Error al obtener token:", error)
    }

    if (!token) {
      return
    }

    try {
      // Enviar heartbeat al servidor
      const response = await fetch("/api/auth/heartbeat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: tokenService.getSessionId(),
          lastActivity: safeLocalStorage.getItem(this.SESSION_ACTIVITY_KEY),
        }),
      })

      // Verificar respuesta
      if (!response.ok) {
        console.warn("[SessionManager] Error en heartbeat:", response.status)

        // Si es un error de autenticación, la sesión ha expirado
        if (response.status === 401) {
          if (isBrowser()) {
            window.dispatchEvent(
              new CustomEvent("session-expired", {
                detail: {
                  reason: "heartbeat_failed",
                  status: response.status,
                },
              }),
            )
          }
        }
      }
    } catch (error) {
      console.error("[SessionManager] Error al enviar heartbeat:", error)
    }
  }

  /**
   * Verifica la actividad de la sesión
   */
  private checkSessionActivity(): void {
    if (!isBrowser()) return

    // Verificar si hay una sesión activa
    let token = null
    try {
      // Intentar obtener el token de tokenStorage primero
      if (typeof tokenStorage.getAccessToken === "function") {
        token = tokenStorage.getAccessToken()
      }

      // Si no hay token, intentar con tokenService
      if (!token && typeof tokenService.getAccessToken === "function") {
        token = tokenService.getAccessToken()
      }
    } catch (error) {
      console.error("[SessionManager] Error al obtener token:", error)
    }

    if (!token) {
      return
    }

    // Obtener timestamp de última actividad
    const lastActivityStr = safeLocalStorage.getItem(this.SESSION_ACTIVITY_KEY)
    if (!lastActivityStr) {
      return
    }

    // Verificar si ha pasado demasiado tiempo desde la última actividad
    const lastActivity = Number.parseInt(lastActivityStr, 10)
    const inactiveTime = Date.now() - lastActivity

    if (inactiveTime > this.SESSION_TIMEOUT) {
      console.warn("[SessionManager] Sesión inactiva por demasiado tiempo:", inactiveTime)

      // Disparar evento de sesión expirada
      if (isBrowser()) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: {
              reason: "inactivity",
              inactiveTime,
            },
          }),
        )
      }
    }
  }

  /**
   * Reinicia el temporizador de inactividad
   */
  private resetInactivityTimer(): void {
    if (!isBrowser()) return

    // Cancelar temporizador existente
    if (this.sessionTimeoutId) {
      safeWindow.clearTimeout(this.sessionTimeoutId)
    }

    // Crear nuevo temporizador
    this.sessionTimeoutId = safeWindow.setTimeout(() => {
      this.checkSessionActivity()
    }, this.SESSION_TIMEOUT)
  }

  /**
   * Muestra un mensaje de sesión expirada
   */
  private showSessionExpiredMessage(detail: any): void {
    if (!isBrowser()) return

    // Crear elemento de mensaje
    const messageContainer = safeDocument.createElement("div")
    messageContainer.style.position = "fixed"
    messageContainer.style.top = "20px"
    messageContainer.style.left = "50%"
    messageContainer.style.transform = "translateX(-50%)"
    messageContainer.style.backgroundColor = "#f8d7da"
    messageContainer.style.color = "#721c24"
    messageContainer.style.padding = "10px 20px"
    messageContainer.style.borderRadius = "4px"
    messageContainer.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"
    messageContainer.style.zIndex = "9999"
    messageContainer.style.maxWidth = "90%"
    messageContainer.style.textAlign = "center"

    // Determinar mensaje según la razón
    let message = "Su sesión ha expirado. Por favor, inicie sesión nuevamente."

    if (detail?.reason === "inactivity") {
      message = "Su sesión ha expirado por inactividad. Por favor, inicie sesión nuevamente."
    } else if (detail?.reason === "heartbeat_failed") {
      message = "Su sesión ha expirado en el servidor. Por favor, inicie sesión nuevamente."
    }

    messageContainer.textContent = message

    // Añadir botón de cierre
    const closeButton = safeDocument.createElement("button")
    closeButton.textContent = "×"
    closeButton.style.marginLeft = "10px"
    closeButton.style.background = "none"
    closeButton.style.border = "none"
    closeButton.style.fontSize = "20px"
    closeButton.style.cursor = "pointer"
    closeButton.style.color = "#721c24"
    closeButton.onclick = () => safeDocument.body.removeChild(messageContainer)

    messageContainer.appendChild(closeButton)

    // Añadir al DOM
    safeDocument.body.appendChild(messageContainer)

    // Eliminar después de 10 segundos
    safeWindow.setTimeout(() => {
      if (safeDocument.body.contains(messageContainer)) {
        safeDocument.body.removeChild(messageContainer)
      }
    }, 10000)
  }

  /**
   * Obtiene información de la sesión actual
   */
  getSessionInfo(): SessionInfo | null {
    if (!isBrowser()) return null

    // Verificar si hay una sesión activa
    let token = null
    let sessionId = null
    let expiresAt = null

    try {
      // Intentar obtener datos de tokenStorage primero
      if (typeof tokenStorage.getAccessToken === "function") {
        token = tokenStorage.getAccessToken()
      }

      // Si no hay token, intentar con tokenService
      if (!token && typeof tokenService.getAccessToken === "function") {
        token = tokenService.getAccessToken()
      }

      // Obtener sessionId
      if (typeof tokenStorage.getSessionId === "function") {
        sessionId = tokenStorage.getSessionId()
      } else if (typeof tokenService.getSessionId === "function") {
        sessionId = tokenService.getSessionId()
      }

      // Obtener expiresAt
      if (typeof tokenStorage.getExpiration === "function") {
        expiresAt = tokenStorage.getExpiration()
      } else if (typeof tokenService.getExpiresAt === "function") {
        expiresAt = tokenService.getExpiresAt()
      }
    } catch (error) {
      console.error("[SessionManager] Error al obtener información de sesión:", error)
    }

    if (!token || !sessionId || !expiresAt) {
      return null
    }

    // Obtener timestamp de última actividad
    const lastActivityStr = safeLocalStorage.getItem(this.SESSION_ACTIVITY_KEY)
    const lastActivity = lastActivityStr ? Number.parseInt(lastActivityStr, 10) : Date.now()

    // Crear información de sesión
    return {
      id: sessionId,
      createdAt: expiresAt - 60 * 60 * 1000, // Estimación: 1 hora antes de expirar
      lastActivity,
      expiresAt,
      device: safeWindow.navigator.platform,
      userAgent: safeWindow.navigator.userAgent,
    }
  }

  /**
   * Verifica si la sesión está activa
   */
  isSessionActive(): boolean {
    if (!isBrowser()) return false

    // Verificar si hay un token válido
    let isTokenValid = false
    try {
      if (typeof tokenStorage.isTokenExpired === "function") {
        isTokenValid = !tokenStorage.isTokenExpired()
      } else if (typeof tokenService.isTokenExpired === "function") {
        isTokenValid = !tokenService.isTokenExpired()
      }
    } catch (error) {
      console.error("[SessionManager] Error al verificar validez del token:", error)
      return false
    }

    if (!isTokenValid) {
      return false
    }

    // Verificar actividad reciente
    const lastActivityStr = safeLocalStorage.getItem(this.SESSION_ACTIVITY_KEY)
    if (!lastActivityStr) {
      return false
    }

    // Verificar si ha pasado demasiado tiempo desde la última actividad
    const lastActivity = Number.parseInt(lastActivityStr, 10)
    const inactiveTime = Date.now() - lastActivity

    return inactiveTime <= this.SESSION_TIMEOUT
  }
}

// Crear instancia solo si estamos en el navegador o proporcionar una versión segura para SSR
const sessionManagerInstance = isBrowser()
  ? new SessionManager()
  : {
      // Versión de servidor que no hace nada
      startSession: async () => ({ success: false, data: { sessionId: "" }, status: 400 }),
      closeSession: async () => ({ success: false, data: undefined, status: 400 }),
      closeOtherSessions: async () => ({ success: false, data: undefined, status: 400 }),
      closeAllSessions: async () => ({ success: false, data: undefined, status: 400 }),
      updateSessionActivity: async () => ({ success: false, data: undefined, status: 400 }),
      getSessionInfo: () => null,
      isSessionActive: () => false,
    }

export const sessionManager = sessionManagerInstance
export default sessionManagerInstance
