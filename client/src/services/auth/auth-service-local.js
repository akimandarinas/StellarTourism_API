/**
 * Servicio de autenticación local para desarrollo
 *
 * Este servicio simula la autenticación con Firebase para desarrollo
 * cuando no se puede conectar al backend o hay problemas de CORS
 */

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined"

// Almacenamiento local para usuarios
const USERS_STORAGE_KEY = "stellar_tourism_users"
const CURRENT_USER_KEY = "stellar_tourism_current_user"

// Clase de servicio de autenticación local
class LocalAuthService {
  constructor() {
    this.currentUser = null
    this.authStateListeners = []

    // Solo ejecutar código relacionado con localStorage en el navegador
    if (isBrowser) {
      // Inicializar almacenamiento de usuarios si no existe
      if (!localStorage.getItem(USERS_STORAGE_KEY)) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]))
      }

      // Cargar usuario actual si existe
      this.currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null")

      // Notificar a los listeners con el estado inicial
      setTimeout(() => {
        this.notifyAuthStateListeners()
      }, 0)
    }
  }

  /**
   * Notifica a los listeners de cambios en el estado de autenticación
   */
  notifyAuthStateListeners() {
    this.authStateListeners.forEach((listener) => listener(this.currentUser))
  }

  /**
   * Registra un listener para cambios en el estado de autenticación
   */
  onAuthStateChanged(listener) {
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
  getCurrentUser() {
    return this.currentUser
  }

  /**
   * Registra un nuevo usuario
   */
  async register(data) {
    if (!isBrowser) {
      console.warn("Intentando registrar usuario en entorno de servidor")
      return null
    }

    const { email, password, displayName } = data

    // Verificar si el email ya está en uso
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY))
    if (users.some((user) => user.email === email)) {
      throw new Error("Este correo electrónico ya está en uso")
    }

    // Crear nuevo usuario
    const newUser = {
      uid: "local_" + Date.now().toString(36) + Math.random().toString(36).substr(2),
      email,
      displayName,
      emailVerified: false,
      isAnonymous: false,
      photoURL: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }

    // Guardar usuario y contraseña (en un entorno real, nunca guardaríamos contraseñas en texto plano)
    users.push({
      ...newUser,
      password, // Solo para desarrollo local
    })
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

    // Establecer usuario actual
    this.currentUser = { ...newUser }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser))

    // Notificar a los listeners
    this.notifyAuthStateListeners()

    return this.currentUser
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async login(credentials) {
    if (!isBrowser) {
      console.warn("Intentando iniciar sesión en entorno de servidor")
      return null
    }

    const { email, password } = credentials

    // Buscar usuario
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY))
    const user = users.find((user) => user.email === email && user.password === password)

    if (!user) {
      throw new Error("Credenciales incorrectas")
    }

    // Actualizar último inicio de sesión
    user.lastLoginAt = new Date().toISOString()
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

    // Establecer usuario actual (sin la contraseña)
    const { password: _, ...userWithoutPassword } = user
    this.currentUser = userWithoutPassword
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser))

    // Notificar a los listeners
    this.notifyAuthStateListeners()

    return this.currentUser
  }

  /**
   * Inicia sesión con Google (simulado)
   */
  async loginWithGoogle() {
    if (!isBrowser) {
      console.warn("Intentando iniciar sesión con Google en entorno de servidor")
      return null
    }

    // Simular un usuario de Google
    const googleUser = {
      uid: "google_" + Date.now().toString(36) + Math.random().toString(36).substr(2),
      email: `user_${Math.floor(Math.random() * 10000)}@gmail.com`,
      displayName: "Usuario de Google",
      emailVerified: true,
      isAnonymous: false,
      photoURL: "https://lh3.googleusercontent.com/a/default-user",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }

    // Guardar usuario
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY))
    users.push(googleUser)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

    // Establecer usuario actual
    this.currentUser = googleUser
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser))

    // Notificar a los listeners
    this.notifyAuthStateListeners()

    return this.currentUser
  }

  /**
   * Cierra la sesión actual
   */
  async logout() {
    if (!isBrowser) {
      console.warn("Intentando cerrar sesión en entorno de servidor")
      return
    }

    // Limpiar usuario actual
    this.currentUser = null
    localStorage.removeItem(CURRENT_USER_KEY)

    // Notificar a los listeners
    this.notifyAuthStateListeners()
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isAuthenticated() {
    return !!this.currentUser
  }

  /**
   * Envía un correo para restablecer la contraseña (simulado)
   */
  async resetPassword(email) {
    if (!isBrowser) {
      console.warn("Intentando restablecer contraseña en entorno de servidor")
      return false
    }

    // Verificar si el email existe
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY))
    const user = users.find((user) => user.email === email)

    if (!user) {
      throw new Error("No existe una cuenta con este correo electrónico")
    }

    // En un entorno real, aquí enviaríamos un correo
    console.log(`[DEV] Se enviaría un correo de restablecimiento a ${email}`)

    return true
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(data) {
    if (!isBrowser) {
      console.warn("Intentando actualizar perfil en entorno de servidor")
      return null
    }

    if (!this.currentUser) {
      throw new Error("No hay usuario autenticado")
    }

    // Actualizar usuario actual
    this.currentUser = {
      ...this.currentUser,
      ...data,
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser))

    // Actualizar en la lista de usuarios
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY))
    const index = users.findIndex((user) => user.uid === this.currentUser.uid)

    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...data,
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    }

    // Notificar a los listeners
    this.notifyAuthStateListeners()

    return this.currentUser
  }
}

// Crear instancia solo si estamos en el navegador
const localAuthService = isBrowser
  ? new LocalAuthService()
  : {
      // Versión de servidor que no hace nada
      currentUser: null,
      authStateListeners: [],
      notifyAuthStateListeners: () => {},
      onAuthStateChanged: (listener) => {
        listener(null)
        return () => {}
      },
      getCurrentUser: () => null,
      register: async () => null,
      login: async () => null,
      loginWithGoogle: async () => null,
      logout: async () => {},
      isAuthenticated: () => false,
      resetPassword: async () => false,
      updateProfile: async () => null,
    }

// Exportar instancia única
export { localAuthService }

// Exportar como default para compatibilidad
export default localAuthService
