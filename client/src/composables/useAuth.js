"use client"

import { ref, computed } from "vue"

// Mock de datos de usuario para desarrollo
const mockUser = {
  id: "1",
  email: "usuario@ejemplo.com",
  displayName: "Usuario Ejemplo",
  photoURL: "/images/placeholder-user.jpg",
  roles: ["user"],
}

// Estado compartido para mantener la sesión entre componentes
const user = ref(null)
const loading = ref(false)
const error = ref(null)

/**
 * Composable para gestionar la autenticación
 */
export function useAuth(options = {}) {
  // Verificar si estamos en un navegador
  const isBrowser = typeof window !== "undefined"

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => !!user.value?.roles?.includes("admin"))

  // Métodos
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      // Simulación de login
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // En un entorno real, aquí se haría la llamada a la API
      user.value = mockUser

      // Guardar en localStorage si estamos en un navegador
      if (isBrowser) {
        localStorage.setItem("user", JSON.stringify(mockUser))
      }

      return user.value
    } catch (err) {
      error.value = err
      return null
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = async () => {
    loading.value = true
    error.value = null

    try {
      // Simulación de login con Google
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // En un entorno real, aquí se haría la autenticación con Google
      user.value = {
        ...mockUser,
        displayName: "Usuario Google",
        photoURL: "/images/placeholder-user.jpg",
      }

      // Guardar en localStorage si estamos en un navegador
      if (isBrowser) {
        localStorage.setItem("user", JSON.stringify(user.value))
      }

      return user.value
    } catch (err) {
      error.value = err
      return null
    } finally {
      loading.value = false
    }
  }

  const register = async (data) => {
    loading.value = true
    error.value = null

    try {
      // Simulación de registro
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // En un entorno real, aquí se haría la llamada a la API
      user.value = {
        ...mockUser,
        email: data.email,
        displayName: data.name || "Nuevo Usuario",
      }

      // Guardar en localStorage si estamos en un navegador
      if (isBrowser) {
        localStorage.setItem("user", JSON.stringify(user.value))
      }

      return user.value
    } catch (err) {
      error.value = err
      return null
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    error.value = null

    try {
      // Simulación de logout
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Limpiar el estado
      user.value = null

      // Limpiar localStorage si estamos en un navegador
      if (isBrowser) {
        localStorage.removeItem("user")
      }

      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email) => {
    loading.value = true
    error.value = null

    try {
      // Simulación de envío de correo
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (data) => {
    if (!user.value) return null

    loading.value = true
    error.value = null

    try {
      // Simulación de actualización de perfil
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Actualizar datos del usuario
      user.value = {
        ...user.value,
        ...data,
      }

      // Actualizar localStorage si estamos en un navegador
      if (isBrowser) {
        localStorage.setItem("user", JSON.stringify(user.value))
      }

      return user.value
    } catch (err) {
      error.value = err
      return null
    } finally {
      loading.value = false
    }
  }

  // Cargar usuario desde localStorage al iniciar (solo en navegador)
  if (isBrowser && !user.value) {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error("Error parsing stored user:", e)
        localStorage.removeItem("user")
      }
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updateProfile,
  }
}

export default useAuth
