import { ref, computed, watch } from "vue"

// Función segura para verificar si estamos en el navegador
const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined"

// Temas disponibles
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
}

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

// Estado del tema
const currentTheme = ref(getStorageItem("theme", THEMES.SYSTEM))

// Detectar preferencia del sistema
const systemPrefersDark = ref(false)
if (isBrowser()) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  systemPrefersDark.value = mediaQuery.matches

  // Escuchar cambios en la preferencia del sistema
  mediaQuery.addEventListener("change", (e) => {
    systemTheme.value = e.matches ? THEMES.DARK : THEMES.LIGHT
  })
}

const systemTheme = ref(systemPrefersDark.value ? THEMES.DARK : THEMES.LIGHT)

// Tema efectivo (considerando la preferencia del sistema)
const effectiveTheme = computed(() => {
  return currentTheme.value === THEMES.SYSTEM ? systemTheme.value : currentTheme.value
})

// Aplicar tema al documento
if (isBrowser()) {
  watch(
    effectiveTheme,
    (newTheme) => {
      document.documentElement.classList.remove(THEMES.LIGHT, THEMES.DARK)
      document.documentElement.classList.add(newTheme)
    },
    { immediate: true },
  )
}

// Cambiar tema
export function setTheme(theme) {
  if (Object.values(THEMES).includes(theme)) {
    currentTheme.value = theme
    setStorageItem("theme", theme)
  }
}

// Obtener tema actual
export function getTheme() {
  return currentTheme.value
}

// Obtener tema efectivo
export function getEffectiveTheme() {
  return effectiveTheme.value
}

// Comprobar si el tema actual es oscuro
export function isDarkTheme() {
  // Verificar si estamos en el navegador
  if (!isBrowser()) {
    return false
  }

  return effectiveTheme.value === THEMES.DARK
}

// Alternar entre temas claro y oscuro
export function toggleTheme() {
  const newTheme = effectiveTheme.value === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK

  setTheme(newTheme)
  return newTheme
}

// Añadir una función para obtener todas las propiedades del tema
export function getThemeProperties() {
  const isDark = isDarkTheme()

  return {
    isDark,
    colors: {
      primary: isDark ? "var(--color-primary)" : "var(--color-primary)",
      background: isDark ? "var(--color-background)" : "var(--color-background)",
      text: isDark ? "var(--color-text)" : "var(--color-text)",
      // Añadir más colores según sea necesario
    },
  }
}
