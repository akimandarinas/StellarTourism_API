import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { THEMES, getTheme, setTheme as setThemeUtil, isDarkTheme } from "../ui/theme"

// Función segura para verificar si estamos en el navegador
const isBrowser = () => typeof window !== "undefined"

// Función segura para acceder a localStorage
const getStorageItem = (key, defaultValue) => {
  if (isBrowser()) {
    try {
      return localStorage.getItem(key) || defaultValue
    } catch (e) {
      console.warn("Error accessing localStorage:", e)
      return defaultValue
    }
  }
  return defaultValue
}

// Función segura para establecer un valor en localStorage
const setStorageItem = (key, value) => {
  if (isBrowser()) {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.warn("Error setting localStorage:", e)
    }
  }
}

export const useUIStore = defineStore("ui", () => {
  // Estado
  const theme = ref(getStorageItem("theme", THEMES.SYSTEM))
  const sidebarOpen = ref(false)
  const mobileMenuOpen = ref(false)

  // Computed
  const darkMode = computed(() => isDarkTheme())

  // Acciones
  function toggleTheme() {
    const newTheme = theme.value === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    theme.value = newTheme
    setStorageItem("theme", newTheme)
    applyTheme()
    return newTheme
  }

  function setTheme(newTheme) {
    if (!Object.values(THEMES).includes(newTheme)) {
      console.warn(`Tema no válido: ${newTheme}. Usando tema por defecto.`)
      newTheme = THEMES.SYSTEM
    }

    theme.value = newTheme
    setStorageItem("theme", newTheme)
    setThemeUtil(newTheme)
    applyTheme()
  }

  function initTheme() {
    theme.value = getTheme()
    applyTheme()
  }

  function applyTheme() {
    // La lógica de aplicación del tema ahora está en ThemeProvider
    // Esta función se mantiene para compatibilidad
    if (isBrowser()) {
      // Solo aplicar cambios al DOM si estamos en el navegador
      const htmlElement = document.documentElement
      if (
        theme.value === THEMES.DARK ||
        (theme.value === THEMES.SYSTEM && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        htmlElement.classList.add("dark")
        htmlElement.classList.remove("light")
      } else {
        htmlElement.classList.add("light")
        htmlElement.classList.remove("dark")
      }
    }
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  function closeMobileMenu() {
    mobileMenuOpen.value = false
  }

  return {
    theme,
    darkMode,
    sidebarOpen,
    mobileMenuOpen,
    toggleTheme,
    setTheme,
    initTheme,
    applyTheme,
    toggleSidebar,
    closeSidebar,
    toggleMobileMenu,
    closeMobileMenu,
  }
})
