/**
 * Servicio de autenticación para la aplicación
 */

import { isBrowser, safeLocalStorage } from "../../utils/client-only"

// Verificar si estamos en el navegador
const USERS_STORAGE_KEY = "stellar_tourism_users"
const CURRENT_USER_KEY = "stellar_tourism_current_user"

// Tipos
export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  isAnonymous: boolean
  roles?: string[]
  metadata?: {
    creationTime?: string
    lastSignInTime?: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  email: string
  password: string
  displayName?: string
  photoURL?: string
  metadata?: Record<string, any>
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: number
  sessionId?: string
}

export interface AuthError extends Error {
  code?: string
  status?: number
}

// Clase de servicio de autenticación
class AuthService {
  private currentUser: User | null = null
  private authStateListeners: ((user: User | null) => void)[] = []
  private tokenRenewalCleanup: (() => void) | null = null

  constructor() {
    // Solo ejecutar código relacionado con localStorage en el navegador
    if (isBrowser) {
      try {
        // Cargar usuario actual si existe
        const userJson = safeLocalStorage.getItem(CURRENT_USER_KEY)
        if (userJson) {
          this.currentUser = JSON.parse(userJson)
        }
      } catch (error) {
        console.error("Error al inicializar AuthService:", error)
      }
    }
  }

  /**
   * Notifica a los listeners de cambios en el estado de autenticación
   */
  private notifyAuthStateListeners(): void {
    this.authStateListeners.forEach((listener) => listener(this.currentUser))
  }

  /**
   * Registra un listener para cambios en el estado de autenticación
   */
  public onAuthStateChanged(listener: (user: User | null) => void): () => void {
    this.authStateListeners.push(listener)

    // Notificar inmediatamente con el estado actual
    listener(this.currentUser)

    // Devolver función para eliminar el listener
    return () => {
      this.authStateListeners = this.authStateListeners.filter((l) => l !== listener)
    }
  }

  /**
   * Obtiene el usuario actual
   */
  public getCurrentUser(): User | null {
    return this.currentUser
  }

  /**
   * Inicia sesión con email y contraseña
   */
  public async login(credentials: LoginCredentials): Promise<User> {
    if (!isBrowser) {
      throw new Error("No se puede iniciar sesión en el servidor")
    }

    try {
      const { email, password } = credentials

      // Simulación de autenticación para desarrollo
      // En producción, aquí iría la lógica real de autenticación con Firebase

      // Buscar usuario (simulado)
      let users = []
      try {
        const usersJson = safeLocalStorage.getItem(USERS_STORAGE_KEY)
        users = usersJson ? JSON.parse(usersJson) : []
      } catch (error) {
        console.error("Error al leer usuarios:", error)
        users = []
      }

      const user = users.find((u: any) => u.email === email && u.password === password)

      if (!user) {
        throw new Error("Credenciales incorrectas")
      }

      // Actualizar último inicio de sesión
      user.lastLoginAt = new Date().toISOString()
      safeLocalStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

      // Establecer usuario actual (sin la contraseña)
      const { password: _, ...userWithoutPassword } = user
      this.currentUser = userWithoutPassword as User
      safeLocalStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser))

      // Notificar a los listeners
      this.notifyAuthStateListeners()

      return this.currentUser
    } catch (error: any) {
      // Transformar error para mejor manejo
      const authError: AuthError = new Error(error.message || "Error al iniciar sesión")
      authError.code = error.code
      authError.status = error.status

      throw authError
    }
  }

  /**
   * Registra un nuevo usuario
   */
  public async register(data: RegisterData): Promise<User> {
    if (!isBrowser) {
      throw new Error("No se puede registrar en el servidor")
    }

    try {
      const { email, password, displayName, photoURL, metadata } = data

      // Simulación de registro para desarrollo
      // En producción, aquí iría la lógica real de registro con Firebase

      // Verificar si el email ya está en uso
      let users = []
      try {
        const usersJson = safeLocalStorage.getItem(USERS_STORAGE_KEY)
        users = usersJson ? JSON.parse(usersJson) : []
      } catch (error) {
        console.error("Error al leer usuarios:", error)
        users = []
      }

      if (users.some((u: any) => u.email === email)) {
        throw new Error("Este correo electrónico ya está en uso")
      }

      // Crear nuevo usuario
      const newUser: User = {
        uid: "local_" + Date.now().toString(36) + Math.random().toString(36).substr(2),
        email,
        displayName: displayName || null,
        photoURL: photoURL || null,
        emailVerified: false,
        isAnonymous: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      }

      // Guardar usuario y contraseña (en un entorno real, nunca guardaríamos contraseñas en texto plano)
      users.push({
        ...newUser,
        password, // Solo para desarrollo local
      })
      safeLocalStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

      // Establecer usuario actual
      this.currentUser = { ...newUser }
      safeLocalStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser))

      // Notificar a los listeners
      this.notifyAuthStateListeners()

      return this.currentUser
    } catch (error: any) {
      // Transformar error para mejor manejo
      const authError: AuthError = new Error(error.message || "Error al registrar usuario")
      authError.code = error.code
      authError.status = error.status

      throw authError
    }
  }

  /**
   * Inicia sesión con Google
   */
  public async loginWithGoogle(): Promise<User> {
    if (!isBrowser) {
      throw new Error("No se puede iniciar sesión con Google en el servidor")
    }

    try {
      // Simulación de inicio de sesión con Google para desarrollo
      // En producción, aquí iría la lógica real de inicio de sesión con Google

      // Simular un usuario de Google
      const googleUser: User = {
        uid: "google_" + Date.now().toString(36) + Math.random().toString(36).substr(2),
        email: `user_${Math.floor(Math.random() * 10000)}@gmail.com`,
        displayName: "Usuario de Google",
        emailVerified: true,
        isAnonymous: false,
        photoURL: "https://lh3.googleusercontent.com/a/default-user",
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      }

      // Guardar usuario
      let users = []
      try {
        const usersJson = safeLocalStorage.getItem(USERS_STORAGE_KEY)
        users = usersJson ? JSON.parse(usersJson) : []
      } catch (error) {
        console.error("Error al leer usuarios:", error)
        users = []
      }

      users.push(googleUser)
      safeLocalStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

      // Establecer usuario actual
      this.currentUser = googleUser
      safeLocalStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser))

      // Notificar a los listeners
      this.notifyAuthStateListeners()

      return this.currentUser
    } catch (error: any) {
      // Transformar error para mejor manejo
      const authError: AuthError = new Error(error.message || "Error al iniciar sesión con Google")
      authError.code = error.code
      authError.status = error.status

      throw authError
    }
  }

  /**
   * Cierra la sesión actual
   */
  public async logout(): Promise<void> {
    if (!isBrowser) {
      return
    }

    try {
      // Detener renovación automática de tokens
      if (this.tokenRenewalCleanup) {
        this.tokenRenewalCleanup()
        this.tokenRenewalCleanup = null
      }

      // Limpiar usuario actual
      this.currentUser = null
      safeLocalStorage.removeItem(CURRENT_USER_KEY)

      // Notificar a los listeners
      this.notifyAuthStateListeners()

      // Disparar evento de cierre de sesión
      if (isBrowser) {
        window.dispatchEvent(new Event("user-logged-out"))
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)

      // Asegurar que el usuario se limpie incluso si hay error
      this.currentUser = null

      // Re-lanzar el error original
      throw error
    }
  }

  /**
   * Envía un correo para restablecer la contraseña
   */
  public async resetPassword(email: string): Promise<void> {
    if (!isBrowser) {
      throw new Error("No se puede restablecer la contraseña en el servidor")
    }

    try {
      // Simulación de restablecimiento de contraseña para desarrollo
      // En producción, aquí iría la lógica real de restablecimiento de contraseña

      // Verificar si el email existe
      let users = []
      try {
        const usersJson = safeLocalStorage.getItem(USERS_STORAGE_KEY)
        users = usersJson ? JSON.parse(usersJson) : []
      } catch (error) {
        console.error("Error al leer usuarios:", error)
        users = []
      }

      const user = users.find((u: any) => u.email === email)

      if (!user) {
        throw new Error("No existe una cuenta con este correo electrónico")
      }

      // En un entorno real, aquí enviaríamos un correo
      console.log(`[DEV] Se enviaría un correo de recuperación a ${email}`)
    } catch (error: any) {
      // Transformar error para mejor manejo
      const authError: AuthError = new Error(error.message || "Error al enviar correo de recuperación")
      authError.code = error.code
      authError.status = error.status

      throw authError
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  public async updateProfile(data: Partial<User>): Promise<User> {
    if (!isBrowser) {
      throw new Error("No se puede actualizar el perfil en el servidor")
    }

    try {
      if (!this.currentUser) {
        throw new Error("No hay usuario autenticado")
      }

      // Actualizar usuario actual
      this.currentUser = {
        ...this.currentUser,
        ...data,
      }
      safeLocalStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser))

      // Actualizar en la lista de usuarios
      let users = []
      try {
        const usersJson = safeLocalStorage.getItem(USERS_STORAGE_KEY)
        users = usersJson ? JSON.parse(usersJson) : []
      } catch (error) {
        console.error("Error al leer usuarios:", error)
        users = []
      }

      const index = users.findIndex((u: any) => u.uid === this.currentUser!.uid)

      if (index !== -1) {
        users[index] = {
          ...users[index],
          ...data,
        }
        safeLocalStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
      }

      // Notificar a los listeners
      this.notifyAuthStateListeners()

      return this.currentUser
    } catch (error: any) {
      // Transformar error para mejor manejo
      const authError: AuthError = new Error(error.message || "Error al actualizar perfil")
      authError.code = error.code
      authError.status = error.status

      throw authError
    }
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  public isAuthenticated(): boolean {
    return !!this.currentUser
  }

  /**
   * Obtiene un mensaje de error legible según el código de error
   */
  private getErrorMessage(code?: string): string | null {
    if (!code) return null

    switch (code) {
      case "auth/invalid-email":
        return "El correo electrónico no es válido"
      case "auth/user-disabled":
        return "Esta cuenta ha sido deshabilitada"
      case "auth/user-not-found":
        return "No existe una cuenta con este correo electrónico"
      case "auth/wrong-password":
        return "Contraseña incorrecta"
      case "auth/email-already-in-use":
        return "Este correo electrónico ya está en uso"
      case "auth/weak-password":
        return "La contraseña es demasiado débil"
      case "auth/popup-closed-by-user":
        return "Inicio de sesión cancelado"
      case "auth/account-exists-with-different-credential":
        return "Ya existe una cuenta con este correo electrónico pero con otro método de inicio de sesión"
      case "auth/network-request-failed":
        return "Error de conexión. Comprueba tu conexión a internet"
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Inténtalo más tarde"
      case "auth/requires-recent-login":
        return "Esta operación es sensible y requiere autenticación reciente. Inicia sesión de nuevo"
      default:
        return null
    }
  }
}

// Crear instancia solo si estamos en el navegador o proporcionar una versión segura para SSR
const authServiceInstance = isBrowser
  ? new AuthService()
  : {
      // Versión de servidor que no hace nada
      currentUser: null,
      authStateListeners: [],
      notifyAuthStateListeners: () => {},
      onAuthStateChanged: (listener: (user: User | null) => void) => {
        listener(null)
        return () => {}
      },
      getCurrentUser: () => null,
      register: async () => {
        throw new Error("No se puede registrar en el servidor")
      },
      login: async () => {
        throw new Error("No se puede iniciar sesión en el servidor")
      },
      loginWithGoogle: async () => {
        throw new Error("No se puede iniciar sesión con Google en el servidor")
      },
      logout: async () => {},
      isAuthenticated: () => false,
      resetPassword: async () => {
        throw new Error("No se puede restablecer la contraseña en el servidor")
      },
      updateProfile: async () => {
        throw new Error("No se puede actualizar el perfil en el servidor")
      },
    }

// Exportar instancia única
export const authService = authServiceInstance

// Exportar como default para compatibilidad
export default authService
