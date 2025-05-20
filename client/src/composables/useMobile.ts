"use client"

import { ref, onMounted, onUnmounted, type Ref } from "vue"

export interface UseMobileOptions {
  mobileBreakpoint?: number
  tabletBreakpoint?: number
  watchResize?: boolean
}

export interface UseMobileReturn {
  isMobile: Ref<boolean>
  isTablet: Ref<boolean>
  isDesktop: Ref<boolean>
  windowWidth: Ref<number>
  windowHeight: Ref<number>
  orientation: Ref<"portrait" | "landscape">
}

/**
 * Composable para detectar si el dispositivo es móvil
 * @param options Opciones de configuración
 * @returns Estado y métodos para detectar dispositivo móvil
 */
export function useMobile(options: UseMobileOptions = {}): UseMobileReturn {
  const { mobileBreakpoint = 640, tabletBreakpoint = 1024, watchResize = true } = options

  // Estado
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(true)
  const windowWidth = ref(0)
  const windowHeight = ref(0)
  const orientation = ref<"portrait" | "landscape">("landscape")

  /**
   * Actualiza el estado según el ancho de la ventana
   */
  const updateDimensions = (): void => {
    if (typeof window === "undefined") return

    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight

    // Actualizar tipo de dispositivo
    isMobile.value = windowWidth.value < mobileBreakpoint
    isTablet.value = windowWidth.value >= mobileBreakpoint && windowWidth.value < tabletBreakpoint
    isDesktop.value = windowWidth.value >= tabletBreakpoint

    // Actualizar orientación
    orientation.value = windowWidth.value > windowHeight.value ? "landscape" : "portrait"
  }

  // Inicializar y configurar listener al montar
  onMounted(() => {
    updateDimensions()

    if (watchResize) {
      window.addEventListener("resize", updateDimensions)
      window.addEventListener("orientationchange", updateDimensions)
    }
  })

  // Limpiar listener al desmontar
  onUnmounted(() => {
    if (watchResize) {
      window.removeEventListener("resize", updateDimensions)
      window.removeEventListener("orientationchange", updateDimensions)
    }
  })

  return {
    isMobile,
    isTablet,
    isDesktop,
    windowWidth,
    windowHeight,
    orientation,
  }
}

// Exportar por defecto para facilitar la importación
export default useMobile
