import { ref, onMounted } from "vue"

//Composable para gestionar características de accesibilidad
export function useAccessibility() {
  const highContrast = ref(false)
  const largeText = ref(false)
  const reducedMotion = ref(false)
  const screenReader = ref(false)

  const loadPreferences = () => {
    try {
      const savedPrefs = localStorage.getItem("accessibility_preferences")
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs)
        highContrast.value = prefs.highContrast || false
        largeText.value = prefs.largeText || false
        reducedMotion.value = prefs.reducedMotion || false
        screenReader.value = prefs.screenReader || false
        applyPreferences()
      } else {
        detectSystemPreferences()
      }
    } catch (error) {
      console.error("Error al cargar preferencias de accesibilidad:", error)
    }
  }

  //Detectar preferencias del sistema
  const detectSystemPreferences = () => {
    if (window.matchMedia("(prefers-contrast: more)").matches) {
      highContrast.value = true
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reducedMotion.value = true
    }
    savePreferences()
  }

  //Guardar preferencias del usuario
  const savePreferences = () => {
    try {
      const prefs = {
        highContrast: highContrast.value,
        largeText: largeText.value,
        reducedMotion: reducedMotion.value,
        screenReader: screenReader.value,
      }
      localStorage.setItem("accessibility_preferences", JSON.stringify(prefs))
    } catch (error) {
      console.error("Error al guardar preferencias de accesibilidad:", error)
    }
  }

  const applyPreferences = () => {
    const htmlElement = document.documentElement

    //Aplicar alto contraste
    if (highContrast.value) {
      htmlElement.classList.add("high-contrast")
    } else {
      htmlElement.classList.remove("high-contrast")
    }

    //Aplicar texto grande
    if (largeText.value) {
      htmlElement.classList.add("large-text")
    } else {
      htmlElement.classList.remove("large-text")
    }

    //Aplicar movimiento reducido
    if (reducedMotion.value) {
      htmlElement.classList.add("reduced-motion")
    } else {
      htmlElement.classList.remove("reduced-motion")
    }

    //Aplicar soporte para lector de pantalla
    if (screenReader.value) {
      htmlElement.classList.add("screen-reader-support")
    } else {
      htmlElement.classList.remove("screen-reader-support")
    }
  }

  const toggleHighContrast = () => {
    highContrast.value = !highContrast.value
    savePreferences()
    applyPreferences()
  }

  const toggleLargeText = () => {
    largeText.value = !largeText.value
    savePreferences()
    applyPreferences()
  }

  const toggleReducedMotion = () => {
    reducedMotion.value = !reducedMotion.value
    savePreferences()
    applyPreferences()
  }

  const toggleScreenReader = () => {
    screenReader.value = !screenReader.value
    savePreferences()
    applyPreferences()
  }

  onMounted(() => {
    loadPreferences()
  })

  return {
    highContrast,
    largeText,
    reducedMotion,
    screenReader,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    toggleScreenReader,
    loadPreferences,
    savePreferences,
    applyPreferences,
  }
}

export { useFocusTrap } from "./useFocusTrap"
export { useAnnouncer } from "./useAnnouncer"
