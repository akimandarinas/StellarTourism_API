import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const authInitialized = ref(false)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userProfile = computed(() => user.value)
  const displayName = computed(() => user.value?.displayName || "")

  // Actions
  function setUser(newUser) {
    user.value = newUser
    authInitialized.value = true

    // Si hay un usuario, guardarlo en localStorage como respaldo
    if (newUser) {
      try {
        localStorage.setItem("stellar-tourism-user", JSON.stringify(newUser))
      } catch (e) {
        console.error("Error al guardar usuario en localStorage:", e)
      }
    } else {
      localStorage.removeItem("stellar-tourism-user")
    }
  }

  function setLoading(status) {
    isLoading.value = status
  }

  function setError(newError) {
    error.value = newError
  }

  function clearError() {
    error.value = null
  }

  // Initialize auth state
  function initAuth() {
    // Intentar recuperar el usuario desde localStorage
    try {
      const savedUser = localStorage.getItem("stellar-tourism-user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (e) {
      console.error("Error al recuperar usuario de localStorage:", e)
      localStorage.removeItem("stellar-tourism-user")
    }

    authInitialized.value = true
    return { user: user.value, isAuthenticated: isAuthenticated.value }
  }

  // Logout
  function logout() {
    setUser(null)
    localStorage.removeItem("stellar-tourism-user")
  }

  // Inicializar automáticamente
  initAuth()

  return {
    user,
    isLoading,
    error,
    authInitialized,
    isAuthenticated,
    userProfile,
    displayName,
    setUser,
    setLoading,
    setError,
    clearError,
    initAuth,
    logout,
  }
})
