import { defineStore } from "pinia"
import { ref, computed, onMounted } from "vue"
import firebaseAuthService from "../services/auth/firebase-auth"
import { apiService } from "../services/api"
import tokenService from "../services/auth/token-service"
import sessionManager from "../services/auth/session-manager"
import registerAuthInterceptor from "../services/api/auth-interceptor"
import { isBrowser } from "../utils/client-only"

// Asegurarse de que Firebase esté inicializado solo en el navegador
let unregisterAuthInterceptor = null

export const useAuthStore = defineStore("auth", () => {
  // Estado
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const authInitialized = ref(false)
  const activeSessions = ref([])
  const sessionsLoading = ref(false)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = computed(() => loading.value)
  const userProfile = computed(() => user.value)
  const userId = computed(() => user.value?.uid)
  const userEmail = computed(() => user.value?.email)
  const displayName = computed(() => user.value?.displayName || "Usuario")
  const currentSessionId = computed(() => tokenService.getSessionId())

  // Inicializar el store
  function init() {
    if (isBrowser()) {
      console.log("[Auth Store] Inicializando en el navegador")

      // Registrar el interceptor de autenticación
      if (apiService && !unregisterAuthInterceptor) {
        unregisterAuthInterceptor = registerAuthInterceptor(apiService)
      }

      // Cargar usuario desde localStorage si existe
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          user.value = JSON.parse(storedUser)
        }
      } catch (e) {
        console.error("[Auth Store] Error al cargar usuario desde localStorage:", e)
      }

      // Escuchar eventos de autenticación
      window.addEventListener("auth:login", handleLogin)
      window.addEventListener("auth:logout", handleLogout)
      window.addEventListener("auth:session-expired", handleSessionExpired)
    } else {
      console.log("[Auth Store] Inicializando en SSR (modo limitado)")
    }

    loading.value = false
  }

  // Manejar evento de inicio de sesión
  function handleLogin(event) {
    if (event && event.detail) {
      user.value = event.detail
      if (isBrowser()) {
        try {
          localStorage.setItem("user", JSON.stringify(event.detail))
        } catch (e) {
          console.error("[Auth Store] Error al guardar usuario en localStorage:", e)
        }
      }
    }
  }

  // Manejar evento de cierre de sesión
  function handleLogout() {
    user.value = null
    if (isBrowser()) {
      try {
        localStorage.removeItem("user")
        localStorage.removeItem("auth_token")
        localStorage.removeItem("refresh_token")
      } catch (e) {
        console.error("[Auth Store] Error al eliminar datos de autenticación:", e)
      }
    }
  }

  // Manejar evento de sesión expirada
  function handleSessionExpired() {
    handleLogout()
    error.value = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
  }

  // Limpiar recursos al desmontar
  function cleanup() {
    if (isBrowser()) {
      window.removeEventListener("auth:login", handleLogin)
      window.removeEventListener("auth:logout", handleLogout)
      window.removeEventListener("auth:session-expired", handleSessionExpired)

      if (unregisterAuthInterceptor) {
        unregisterAuthInterceptor()
        unregisterAuthInterceptor = null
      }
    }
  }

  // Inicializar automáticamente en componentes Vue
  if (isBrowser()) {
    onMounted(() => {
      init()
      return cleanup
    })
  }

  // Acciones

  /**
   * Inicializa la autenticación
   */
  const initAuth = async () => {
    // No inicializar en el servidor
    if (!isBrowser()) {
      authInitialized.value = true
      loading.value = false
      return
    }

    loading.value = true
    error.value = null

    try {
      // Esperar a que Firebase Auth esté listo
      await firebaseAuthService.isAuthReady()

      // Verificar si hay un token válido
      const token = tokenService.getAccessToken()
      const isExpired = tokenService.isTokenExpired()
      const isValid = tokenService.validateToken()

      if (token && !isExpired && isValid) {
        // Hay un token válido, obtener información del usuario
        try {
          const response = await apiService.get("/auth/me", {
            // Añadir timeout para no bloquear la inicialización
            timeout: 5000,
          })

          if (response.success && response.data) {
            user.value = response.data

            // Registrar inicio de sesión exitoso
            console.log("[AuthStore] Usuario autenticado desde token existente")
          }
        } catch (err) {
          console.error("Error al obtener información del usuario:", err)
          // Limpiar tokens en caso de error
          tokenService.clearTokens()
          user.value = null
        }
      } else if (token && (isExpired || !isValid)) {
        // Token inválido o expirado, limpiarlo
        console.warn("[AuthStore] Token inválido o expirado, limpiando")
        tokenService.clearTokens()
        user.value = null
      }

      // Configurar observador de cambios de autenticación
      firebaseAuthService.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          // Usuario autenticado en Firebase
          const hasToken = !!tokenService.getAccessToken()

          if (!hasToken) {
            // No hay token, el usuario debe iniciar sesión de nuevo
            user.value = null
            console.warn("[AuthStore] Usuario autenticado en Firebase pero sin token JWT")
          } else if (!user.value) {
            // Tenemos token pero no usuario, actualizar usuario
            user.value = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              isAnonymous: firebaseUser.isAnonymous,
            }
            console.log("[AuthStore] Usuario actualizado desde Firebase")
          }
        } else {
          // No hay usuario autenticado en Firebase
          if (user.value) {
            console.log("[AuthStore] Cerrando sesión por cambio en Firebase Auth")
          }

          user.value = null
          tokenService.clearTokens()
        }

        loading.value = false
        authInitialized.value = true
      })

      // Configurar listener para eventos de token
      if (window) {
        window.addEventListener("tokens-cleared", () => {
          user.value = null
          console.log("[AuthStore] Tokens eliminados, actualizando estado")
        })

        window.addEventListener("token-renewed", () => {
          console.log("[AuthStore] Token renovado, verificando estado de usuario")
          // Verificar si necesitamos actualizar la información del usuario
          if (user.value && !loading.value) {
            apiService
              .get("/auth/me", { skipErrorHandling: true })
              .then((response) => {
                if (response.success && response.data) {
                  // Actualizar solo si hay cambios
                  if (JSON.stringify(user.value) !== JSON.stringify(response.data)) {
                    user.value = response.data
                    console.log("[AuthStore] Información de usuario actualizada")
                  }
                }
              })
              .catch((err) => {
                console.warn("[AuthStore] Error al actualizar información de usuario:", err)
              })
          }
        })
      }
    } catch (err) {
      error.value = err.message || "Error al inicializar autenticación"
      loading.value = false
      authInitialized.value = true
    }
  }

  /**
   * Asegura que la autenticación esté inicializada
   */
  const ensureAuthReady = async () => {
    if (authInitialized.value) return
    return initAuth()
  }

  /**
   * Inicia sesión con correo y contraseña
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   */
  const login = async (email, password, remember = true) => {
    // No ejecutar en el servidor
    if (!isBrowser()) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      const result = await firebaseAuthService.login(email, password)

      // Obtener token de Firebase
      const firebaseToken = await result.user.getIdToken()

      // Iniciar sesión en el servidor
      const response = await apiService.post("/auth/login", {
        uid: result.user.uid,
        email: result.user.email,
        firebaseToken,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      })

      if (!response.success || !response.data?.accessToken) {
        throw new Error("Error al iniciar sesión en el servidor")
      }

      // Guardar tokens con la opción de recordar
      tokenService.saveTokens(
        {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresAt: response.data.expiresAt,
          sessionId: response.data.sessionId,
        },
        { remember },
      )

      // Almacenar la opción de recordar
      localStorage.setItem("access_token_remember", String(remember))

      // Iniciar sesión en el gestor de sesiones
      await sessionManager.startSession(result.user.uid)

      // Actualizar usuario
      user.value = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
        isAnonymous: result.user.isAnonymous,
      }

      // Registrar inicio de sesión exitoso
      console.log("[AuthStore] Inicio de sesión exitoso")

      return true
    } catch (err) {
      // Manejar errores específicos
      if (err.code) {
        switch (err.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
            error.value = "Credenciales incorrectas"
            break
          case "auth/too-many-requests":
            error.value = "Demasiados intentos fallidos. Inténtalo más tarde"
            break
          case "auth/user-disabled":
            error.value = "Esta cuenta ha sido deshabilitada"
            break
          default:
            error.value = err.message || "Error al iniciar sesión"
        }
      } else {
        error.value = err.message || "Error al iniciar sesión"
      }

      // Registrar error de inicio de sesión
      console.error("[AuthStore] Error al iniciar sesión:", err)

      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Inicia sesión con Google
   */
  const loginWithGoogle = async () => {
    // No ejecutar en el servidor
    if (!isBrowser()) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      const result = await firebaseAuthService.loginWithGoogle()

      // Obtener token de Firebase
      const firebaseToken = await result.user.getIdToken()

      // Iniciar sesión en el servidor
      const response = await apiService.post("/auth/login/google", {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        firebaseToken,
      })

      if (!response.success || !response.data?.accessToken) {
        throw new Error("Error al iniciar sesión en el servidor")
      }

      // Guardar tokens
      tokenService.saveTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresAt: response.data.expiresAt,
        sessionId: response.data.sessionId,
      })

      // Iniciar sesión en el gestor de sesiones
      await sessionManager.startSession(result.user.uid)

      // Actualizar usuario
      user.value = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
        isAnonymous: result.user.isAnonymous,
      }

      return true
    } catch (err) {
      error.value = err.message || "Error al iniciar sesión con Google"
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Registra un nuevo usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @param {string} displayName - Nombre a mostrar
   */
  const register = async (email, password, displayName) => {
    // No ejecutar en el servidor
    if (!isBrowser()) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      const result = await firebaseAuthService.register(email, password, displayName)

      // Obtener token de Firebase
      const firebaseToken = await result.user.getIdToken()

      // Registrar en el servidor
      const response = await apiService.post("/auth/register", {
        uid: result.user.uid,
        email: result.user.email,
        displayName,
        firebaseToken,
      })

      if (!response.success || !response.data?.accessToken) {
        throw new Error("Error al registrar usuario en el servidor")
      }

      // Guardar tokens
      tokenService.saveTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresAt: response.data.expiresAt,
        sessionId: response.data.sessionId,
      })

      // Iniciar sesión en el gestor de sesiones
      await sessionManager.startSession(result.user.uid)

      // Actualizar usuario
      user.value = {
        uid: result.user.uid,
        email: result.user.email,
        displayName,
        photoURL: null,
        emailVerified: result.user.emailVerified,
        isAnonymous: result.user.isAnonymous,
      }

      return true
    } catch (err) {
      error.value = err.message || "Error al registrar usuario"
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Cierra la sesión actual
   */
  const logout = async () => {
    // No ejecutar en el servidor
    if (!isBrowser()) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      // Guardar el ID de sesión antes de cerrar sesión
      const sessionId = tokenService.getSessionId()

      // Cerrar sesión en Firebase
      await firebaseAuthService.logout()

      // Cerrar sesión en el servidor
      if (sessionId) {
        try {
          await sessionManager.closeSession(sessionId)
        } catch (err) {
          console.warn("[AuthStore] Error al cerrar sesión en el servidor:", err)
          // Continuar con el cierre de sesión local
        }
      }

      // Limpiar tokens
      tokenService.clearTokens()

      // Limpiar estado
      user.value = null
      activeSessions.value = []

      // Limpiar datos adicionales
      if (localStorage) {
        localStorage.removeItem("access_token_remember")
      }

      // Registrar cierre de sesión exitoso
      console.log("[AuthStore] Cierre de sesión exitoso")

      return true
    } catch (err) {
      error.value = err.message || "Error al cerrar sesión"

      // Asegurar que los tokens se limpien incluso si hay error
      tokenService.clearTokens()
      user.value = null
      activeSessions.value = []

      // Registrar error de cierre de sesión
      console.error("[AuthStore] Error al cerrar sesión:", err)

      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Cierra todas las sesiones
   */
  const logoutAllSessions = async () => {
    // No ejecutar en el servidor
    if (!isBrowser()) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      // Cerrar sesión en Firebase
      await firebaseAuthService.logout()

      // Cerrar todas las sesiones en el servidor
      await sessionManager.closeAllSessions()

      // Limpiar tokens
      tokenService.clearTokens()

      // Limpiar estado
      user.value = null
      activeSessions.value = []

      return true
    } catch (err) {
      error.value = err.message || "Error al cerrar todas las sesiones"
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Cierra otras sesiones (mantiene la actual)
   */
  const logoutOtherSessions = async () => {
    // No ejecutar en el servidor
    if (!isBrowser()) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      // Cerrar otras sesiones en el servidor
      await sessionManager.closeOtherSessions()

      // Actualizar lista de sesiones
      await fetchActiveSessions()

      return true
    } catch (err) {
      error.value = err.message || "Error al cerrar otras sesiones"
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Cierra una sesión específica
   * @param {string} sessionId - ID de la sesión a cerrar
   */
  const closeSession = async (sessionId) => {
    // No ejecutar en el servidor
    if (!isBrowser()) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      // Cerrar sesión en el servidor
      await sessionManager.closeSession(sessionId)

      // Si es la sesión actual, cerrar sesión completa
      if (sessionId === tokenService.getSessionId()) {
        await logout()
      } else {
        // Actualizar lista de sesiones
        await fetchActiveSessions()
      }

      return true
    } catch (err) {
      error.value = err.message || "Error al cerrar sesión"
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene las sesiones activas
   */
  const fetchActiveSessions = async () => {
    // No ejecutar en el servidor
    if (!isBrowser() || !isAuthenticated.value) {
      return []
    }

    sessionsLoading.value = true

    try {
      const response = await sessionManager.getSessions()

      if (response.success && response.data) {
        activeSessions.value = response.data.sessions
      }

      return activeSessions.value
    } catch (err) {
      console.error("Error al obtener sesiones activas:", err)
      return []
    } finally {
      sessionsLoading.value = false
    }
  }

  /**
   * Envía un correo para restablecer contraseña
   * @param {string} email - Correo electrónico
   */
  const resetPassword = async (email) => {
    // No ejecutar en el servidor
    if (!isBrowser()) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      await firebaseAuthService.resetPassword(email)
      return true
    } catch (err) {
      error.value = err.message || "Error al enviar correo de recuperación"
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza el perfil del usuario
   * @param {Object} profileData - Datos del perfil
   */
  const updateProfile = async (profileData) => {
    // No ejecutar en el servidor
    if (!isBrowser()) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      // Actualizar en Firebase Auth
      await firebaseAuthService.updateProfile(profileData)

      // Actualizar en el servidor
      await apiService.put("/auth/profile", profileData)

      // Actualizar estado local
      user.value = {
        ...user.value,
        ...profileData,
      }

      return true
    } catch (err) {
      error.value = err.message || "Error al actualizar perfil"
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {boolean} - true si tiene el rol
   */
  const hasRole = (role) => {
    // Implementar lógica de roles según necesidades
    return true
  }

  return {
    // Estado
    user,
    loading,
    error,
    authInitialized,
    activeSessions,
    sessionsLoading,

    // Getters
    isAuthenticated,
    userProfile,
    userId,
    userEmail,
    displayName,
    currentSessionId,
    isLoading,

    // Acciones
    init,
    ensureAuthReady,
    login,
    loginWithGoogle,
    register,
    logout,
    logoutAllSessions,
    logoutOtherSessions,
    closeSession,
    fetchActiveSessions,
    resetPassword,
    updateProfile,
    hasRole,
    cleanup,
  }
})
