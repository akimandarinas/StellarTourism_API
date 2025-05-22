"use client"

import { ref, computed } from "vue"

const mockUser = {
  id: "1",
  email: "usuario@ejemplo.com",
  displayName: "Usuario Ejemplo",
  photoURL: "/images/placeholder-user.jpg",
  roles: ["user"],
}

//Estado compartido 
const user = ref(null)
const loading = ref(false)
const error = ref(null)

export function useAuth(options = {}) {
  const isBrowser = typeof window !== "undefined"

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => !!user.value?.roles?.includes("admin"))

  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      user.value = mockUser

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
      await new Promise((resolve) => setTimeout(resolve, 1000))

      user.value = {
        ...mockUser,
        displayName: "Usuario Google",
        photoURL: "/images/placeholder-user.jpg",
      }

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
      await new Promise((resolve) => setTimeout(resolve, 1000))

      user.value = {
        ...mockUser,
        email: data.email,
        displayName: data.name || "Nuevo Usuario",
      }

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
      await new Promise((resolve) => setTimeout(resolve, 500))

      user.value = null

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
      await new Promise((resolve) => setTimeout(resolve, 1000))

      user.value = {
        ...user.value,
        ...data,
      }

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
