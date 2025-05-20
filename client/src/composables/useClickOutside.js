import { onMounted, onUnmounted } from "vue"

/**
 * Composable para detectar clics fuera de un elemento específico
 * @param {Ref<HTMLElement>} elementRef - Referencia al elemento que queremos monitorear
 * @param {Function} callback - Función a ejecutar cuando se detecta un clic fuera del elemento
 */
export function useClickOutside(elementRef, callback) {
  if (!elementRef) return

  const handleClickOutside = (event) => {
    if (elementRef.value && !elementRef.value.contains(event.target)) {
      callback(event)
    }
  }

  onMounted(() => {
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener("mousedown", handleClickOutside)
    document.removeEventListener("touchstart", handleClickOutside)
  })

  return {
    handleClickOutside,
  }
}
