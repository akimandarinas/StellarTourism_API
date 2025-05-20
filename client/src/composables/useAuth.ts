"use client"

import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { authService } from "../services/auth/auth-service"
import { useToast } from "./useToast"

// Tipos
export interface UseAuthOptions {
  redirectOnLogin?: string
  redirectOnLogout?: string
}

/**
 * Composable simplificado para gestionar la autenticación
 * Utiliza el servicio de autenticación unificado
 */
export function useAuth(options: UseAuthOptions = {}) {
  const { redirectOnLogin = "/", redirectOnLogout = "/login" } = options

  const router = useRouter()
  const toast = useToast()

  // Estado
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => !!user.value?.roles?.includes("admin"))

  // Listener de cambios de estado de autenticación
  let unsubscribe: (() => void) | null = null

  /**
   * Inicializa el listener de estado de autenticación
   */
  const initAuthListener = () => {
    unsubscribe = authService.onAuthStateChanged((newUser) => {
      user.value = newUser
      loading.value = false
    })
  }

  // Métodos simplificados que delegan al servicio de autenticación
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      const loggedUser = await authService.login(credentials)

      toast.success("Sesión iniciada", {
        description: `Bienvenido de nuevo, ${loggedUser.displayName || loggedUser.email}`,
      })

      const redirect = new URLSearchParams(window.location.search).get("redirect") || redirectOnLogin
      router.push(redirect)

      return loggedUser
    } catch (err: any) {
      error.value = err

      toast.error("Error al iniciar sesión", {
        description: err.message,
      })

      return null
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = async () => {
    loading.value = true
    error.value = null

    try {
      const loggedUser = await authService.loginWithGoogle()

      toast.success("Sesión iniciada", {
        description: `Bienvenido, ${loggedUser.displayName || loggedUser.email}`,
      })

      const redirect = new URLSearchParams(window.location.search).get("redirect") || redirectOnLogin
      router.push(redirect)

      return loggedUser
    } catch (err: any) {
      error.value = err

      toast.error("Error al iniciar sesión con Google", {
        description: err.message,
      })

      return null
    } finally {
      loading.value = false
    }
  }

  const register = async (data) => {
    loading.value = true
    error.value = null

    try {
      const newUser = await authService.register(data)

      toast.success("Registro completado", {
        description: "Tu cuenta ha sido creada correctamente",
      })

      const redirect = new URLSearchParams(window.location.search).get("redirect") || redirectOnLogin
      router.push(redirect)

      return newUser
    } catch (err: any) {
      error.value = err

      toast.error("Error al registrar usuario", {
        description: err.message,
      })

      return null
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    error.value = null

    try {
      await authService.logout()

      toast.success("Sesión cerrada", {
        description: "Has cerrado sesión correctamente",
      })

      router.push(redirectOnLogout)

      return true
    } catch (err: any) {
      error.value = err

      toast.error("Error al cerrar sesión", {
        description: err.message,
      })

      return false
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email) => {
    loading.value = true
    error.value = null

    try {
      await authService.resetPassword(email)

      toast.success("Correo enviado", {
        description: "Se ha enviado un correo para restablecer tu contraseña",
      })

      return true
    } catch (err: any) {
      error.value = err

      toast.error("Error al enviar correo de recuperación", {
        description: err.message,
      })

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
      const updatedUser = await authService.updateProfile(data)

      toast.success("Perfil actualizado", {
        description: "Tu perfil ha sido actualizado correctamente",
      })

      return updatedUser
    } catch (err: any) {
      error.value = err

      toast.error("Error al actualizar perfil", {
        description: err.message,
      })

      return null
    } finally {
      loading.value = false
    }
  }

  // Ciclo de vida
  onMounted(() => {
    initAuthListener()
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

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
