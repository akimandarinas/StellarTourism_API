"use client"

// Servicio de autenticación para Stellar Tourism con SSR

import { ref } from "vue"
import { apiService } from "../api/index"

// Estado de autenticación
const isAuthenticated = ref(false)
const currentUser = ref(null)
const authError = ref(null)
const isLoading = ref(false)

// Comprobar si hay un token almacenado
const checkAuth = async () => {
  try {
    isLoading.value = true

    // Verificar si estamos en el cliente
    if (typeof window === "undefined") {
      return false
    }

    const token = localStorage.getItem("auth_token")

    if (!token) {
      isAuthenticated.value = false
      currentUser.value = null
      return false
    }

    // Verificar el token con el servidor
    try {
      // Usar una versión segura de apiService que funcione en SSR
      const api = apiService || {
        get: () => Promise.resolve({ data: null }),
        post: () => Promise.resolve({ data: null }),
      }

      const response = await api.get("/auth/me")

      if (response && response.data) {
        currentUser.value = response.data
        isAuthenticated.value = true
        return true
      } else {
        // Token inválido
        localStorage.removeItem("auth_token")
        isAuthenticated.value = false
        currentUser.value = null
        return false
      }
    } catch (error) {
      console.error("Error al verificar token:", error)
      localStorage.removeItem("auth_token")
      isAuthenticated.value = false
      currentUser.value = null
      return false
    }
  } catch (error) {
    console.error("Error en checkAuth:", error)
    return false
  } finally {
    isLoading.value = false
  }
}

// Iniciar sesión
const login = async (email, password) => {
  try {
    isLoading.value = true
    authError.value = null

    // Verificar si estamos en el cliente
    if (typeof window === "undefined") {
      throw new Error("No se puede iniciar sesión durante SSR")
    }

    // Usar una versión segura de apiService que funcione en SSR
    const api = apiService || {
      get: () => Promise.resolve({ data: null }),
      post: () => Promise.resolve({ data: null }),
    }

    // En desarrollo, simular login
    if (process.env.NODE_ENV === "development") {
      await new Promise((resolve) => setTimeout(resolve, 800))

      if (email === "demo@example.com" && password === "password") {
        const mockUser = {
          id: 1,
          email: "demo@example.com",
          nombre: "Usuario Demo",
          rol: "usuario",
        }

        const mockToken = "mock-jwt-token-" + Date.now()

        localStorage.setItem("auth_token", mockToken)
        currentUser.value = mockUser
        isAuthenticated.value = true

        return { user: mockUser, token: mockToken }
      } else {
        throw new Error("Credenciales incorrectas")
      }
    }

    // En producción, hacer la petición real
    const response = await api.post("/auth/login", { email, password })

    if (response && response.data && response.data.token) {
      localStorage.setItem("auth_token", response.data.token)
      currentUser.value = response.data.user
      isAuthenticated.value = true

      return response.data
    } else {
      throw new Error("Respuesta inválida del servidor")
    }
  } catch (error) {
    console.error("Error de login:", error)
    authError.value = error.message || "Error al iniciar sesión"
    isAuthenticated.value = false
    currentUser.value = null
    throw error
  } finally {
    isLoading.value = false
  }
}

// Cerrar sesión
const logout = () => {
  try {
    // Verificar si estamos en el cliente
    if (typeof window === "undefined") {
      return
    }

    localStorage.removeItem("auth_token")
    isAuthenticated.value = false
    currentUser.value = null

    // Opcional: notificar al servidor
    if (apiService) {
      apiService.post("/auth/logout").catch((err) => {
        console.error("Error al notificar logout al servidor:", err)
      })
    }
  } catch (error) {
    console.error("Error en logout:", error)
  }
}

// Registrar nuevo usuario
const register = async (userData) => {
  try {
    isLoading.value = true
    authError.value = null

    // Verificar si estamos en el cliente
    if (typeof window === "undefined") {
      throw new Error("No se puede registrar durante SSR")
    }

    // Usar una versión segura de apiService que funcione en SSR
    const api = apiService || {
      get: () => Promise.resolve({ data: null }),
      post: () => Promise.resolve({ data: null }),
    }

    // En desarrollo, simular registro
    if (process.env.NODE_ENV === "development") {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const mockUser = {
        id: Date.now(),
        email: userData.email,
        nombre: userData.nombre,
        rol: "usuario",
        createdAt: new Date().toISOString(),
      }

      const mockToken = "mock-jwt-token-" + Date.now()

      localStorage.setItem("auth_token", mockToken)
      currentUser.value = mockUser
      isAuthenticated.value = true

      return { user: mockUser, token: mockToken }
    }

    // En producción, hacer la petición real
    const response = await api.post("/auth/register", userData)

    if (response && response.data && response.data.token) {
      localStorage.setItem("auth_token", response.data.token)
      currentUser.value = response.data.user
      isAuthenticated.value = true

      return response.data
    } else {
      throw new Error("Respuesta inválida del servidor")
    }
  } catch (error) {
    console.error("Error de registro:", error)
    authError.value = error.message || "Error al registrar usuario"
    throw error
  } finally {
    isLoading.value = false
  }
}

// Recuperar contraseña
const forgotPassword = async (email) => {
  try {
    isLoading.value = true
    authError.value = null

    // Verificar si estamos en el cliente
    if (typeof window === "undefined") {
      throw new Error("No se puede solicitar recuperación durante SSR")
    }

    // Usar una versión segura de apiService que funcione en SSR
    const api = apiService || {
      post: () => Promise.resolve({ data: null }),
    }

    // En desarrollo, simular solicitud
    if (process.env.NODE_ENV === "development") {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { success: true, message: "Se ha enviado un correo de recuperación (simulado)" }
    }

    // En producción, hacer la petición real
    const response = await api.post("/auth/forgot-password", { email })

    return response.data
  } catch (error) {
    console.error("Error en recuperación de contraseña:", error)
    authError.value = error.message || "Error al solicitar recuperación de contraseña"
    throw error
  } finally {
    isLoading.value = false
  }
}

// Restablecer contraseña
const resetPassword = async (token, newPassword) => {
  try {
    isLoading.value = true
    authError.value = null

    // Verificar si estamos en el cliente
    if (typeof window === "undefined") {
      throw new Error("No se puede restablecer contraseña durante SSR")
    }

    // Usar una versión segura de apiService que funcione en SSR
    const api = apiService || {
      post: () => Promise.resolve({ data: null }),
    }

    // En desarrollo, simular restablecimiento
    if (process.env.NODE_ENV === "development") {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { success: true, message: "Contraseña restablecida correctamente (simulado)" }
    }

    // En producción, hacer la petición real
    const response = await api.post("/auth/reset-password", { token, newPassword })

    return response.data
  } catch (error) {
    console.error("Error al restablecer contraseña:", error)
    authError.value = error.message || "Error al restablecer contraseña"
    throw error
  } finally {
    isLoading.value = false
  }
}

// Verificar si el usuario tiene un rol específico
const hasRole = (role) => {
  if (!currentUser.value) return false

  if (Array.isArray(currentUser.value.roles)) {
    return currentUser.value.roles.includes(role)
  }

  return currentUser.value.rol === role
}

// Exportar funciones y estado
export {
  isAuthenticated,
  currentUser,
  authError,
  isLoading,
  checkAuth,
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
  hasRole,
}

// Crear un composable para usar en componentes
export function useAuth() {
  return {
    isAuthenticated,
    currentUser,
    authError,
    isLoading,
    checkAuth,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    hasRole,
  }
}

// Inicializar automáticamente si estamos en el cliente
if (typeof window !== "undefined") {
  checkAuth().catch((err) => {
    console.error("Error al inicializar auth:", err)
  })
}
