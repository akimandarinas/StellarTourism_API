"use client"

import { ref, computed, watch, onMounted } from "vue"

/**
 * Composable para gestionar el tema de la aplicación
 * @returns {Object} Funciones y estado para gestionar el tema
 */
export default function useTheme() {
  const theme = ref("light")
  const systemTheme = ref("light")
  const themeSource = ref("system") // 'system', 'light', 'dark'

  // Detectar tema del sistema
  const detectSystemTheme = () => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      systemTheme.value = "dark"
    } else {
      systemTheme.value = "light"
    }
  }

  // Calcular el tema actual basado en la fuente
  const currentTheme = computed(() => {
    return themeSource.value === "system" ? systemTheme.value : themeSource.value
  })

  // Aplicar el tema al documento
  const applyTheme = () => {
    document.documentElement.setAttribute("data-theme", currentTheme.value)
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(currentTheme.value)
  }

  // Cambiar la fuente del tema
  const setThemeSource = (source) => {
    if (["system", "light", "dark"].includes(source)) {
      themeSource.value = source
      localStorage.setItem("theme-source", source)
    }
  }

  // Alternar entre temas
  const toggleTheme = () => {
    const newTheme = currentTheme.value === "light" ? "dark" : "light"
    setThemeSource(newTheme)
  }

  // Escuchar cambios en el tema del sistema
  onMounted(() => {
    // Recuperar preferencia guardada
    const savedThemeSource = localStorage.getItem("theme-source")
    if (savedThemeSource) {
      themeSource.value = savedThemeSource
    }

    detectSystemTheme()
    applyTheme()

    // Escuchar cambios en el tema del sistema
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      systemTheme.value = e.matches ? "dark" : "light"
    })
  })

  // Aplicar tema cuando cambie
  watch(currentTheme, () => {
    applyTheme()
  })

  return {
    theme: currentTheme,
    themeSource,
    setThemeSource,
    toggleTheme,
    isDark: computed(() => currentTheme.value === "dark"),
    isLight: computed(() => currentTheme.value === "light"),
  }
}
