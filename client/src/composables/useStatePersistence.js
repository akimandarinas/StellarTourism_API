import { ref, watch, onMounted, onUnmounted } from "vue"
import { saveState, loadState, clearState } from "../services/state-persistence"

/**
 * Composable para persistir el estado entre navegaciones
 * @param {string} key - Clave única para el estado
 * @param {any} initialValue - Valor inicial si no hay estado guardado
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.immediate - Si debe cargar el estado inmediatamente (por defecto: true)
 * @param {number} options.expiryTime - Tiempo de expiración personalizado en milisegundos
 * @param {Function} options.onLoad - Callback que se ejecuta después de cargar el estado
 * @returns {Object} - Estado reactivo y métodos para gestionarlo
 */
export function useStatePersistence(key, initialValue = null, options = {}) {
  const { immediate = true, expiryTime = undefined, onLoad = null, watchOptions = { deep: true } } = options

  // Estado reactivo
  const state = ref(initialValue)
  const isLoaded = ref(false)

  // Cargar el estado desde el almacenamiento
  const load = () => {
    const savedState = loadState(key, initialValue)
    state.value = savedState
    isLoaded.value = true

    if (onLoad && typeof onLoad === "function") {
      onLoad(savedState)
    }

    return savedState
  }

  // Guardar el estado en el almacenamiento
  const save = (newState = undefined) => {
    const stateToSave = newState !== undefined ? newState : state.value
    return saveState(key, stateToSave, { expiryTime })
  }

  // Limpiar el estado
  const clear = () => {
    state.value = initialValue
    return clearState(key)
  }

  // Observar cambios en el estado para guardarlo automáticamente
  const stopWatcher = watch(
    state,
    (newValue) => {
      save(newValue)
    },
    watchOptions,
  )

  // Cargar el estado al montar el componente si immediate es true
  onMounted(() => {
    if (immediate) {
      load()
    }
  })

  // Limpiar el watcher al desmontar el componente
  onUnmounted(() => {
    stopWatcher()
  })

  return {
    state,
    isLoaded,
    load,
    save,
    clear,
  }
}

export default useStatePersistence
