"use client"

import { ref, watch, onMounted, onUnmounted } from "vue"
import { setState, getState, subscribeToState, removeState } from "../utils/state-manager"

interface UseStateOptions {
  storage?: "local" | "session" | "memory"
  expiry?: number
  defaultValue?: any
  sync?: boolean // Sincronizar con otros componentes
}

/**
 * Composable para gestionar estado persistente
 *
 * @param key Clave única para el estado
 * @param options Opciones de configuración
 * @returns Objeto con el estado reactivo y funciones para manipularlo
 */
export function useState<T = any>(key: string, options: UseStateOptions = {}) {
  const { storage = "local", expiry, defaultValue = null, sync = true } = options

  // Crear ref reactiva con el valor inicial
  const state = ref<T>(getState<T>(key, defaultValue))

  // Función para actualizar el estado
  const updateState = (newValue: T) => {
    state.value = newValue
    setState(key, newValue, { storage, expiry })
  }

  // Función para eliminar el estado
  const clearState = () => {
    state.value = defaultValue
    removeState(key)
  }

  // Suscribirse a cambios externos (otros componentes)
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    if (sync) {
      unsubscribe = subscribeToState(key, (newValue) => {
        if (newValue !== state.value) {
          state.value = newValue === null ? defaultValue : newValue
        }
      })
    }
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  // Observar cambios en el estado y persistirlos
  watch(
    state,
    (newValue) => {
      setState(key, newValue, { storage, expiry })
    },
    { deep: true },
  )

  return {
    state,
    updateState,
    clearState,
  }
}
