/**
 * Composable para manejar eventos de teclado
 */
import { onMounted, onUnmounted } from "vue"

export function useKeyboard() {
  // Mapa de manejadores de eventos
  const keyHandlers = new Map()

  // Manejar eventos de teclado
  const handleKeyDown = (event) => {
    // Ejecutar todos los manejadores registrados
    keyHandlers.forEach((handler) => {
      handler(event)
    })
  }

  // Registrar un manejador de eventos
  const onKeyDown = (handler) => {
    // Generar un ID único para el manejador
    const handlerId = Symbol("keyHandler")

    // Registrar el manejador
    keyHandlers.set(handlerId, handler)

    // Devolver una función para eliminar el manejador
    return () => {
      keyHandlers.delete(handlerId)
    }
  }

  // Registrar un manejador para una tecla específica
  const onKey = (key, handler) => {
    return onKeyDown((event) => {
      if (event.key === key) {
        handler(event)
      }
    })
  }

  // Registrar un manejador para una combinación de teclas
  const onKeyCombo = (combo, handler) => {
    // Parsear la combinación de teclas
    const keys = combo.toLowerCase().split("+")

    return onKeyDown((event) => {
      // Verificar si todas las teclas modificadoras están presionadas
      const modifiersMatch = {
        ctrl: keys.includes("ctrl") === event.ctrlKey,
        alt: keys.includes("alt") === event.altKey,
        shift: keys.includes("shift") === event.shiftKey,
        meta: keys.includes("meta") === event.metaKey,
      }

      // Verificar si todas las condiciones de modificadores coinciden
      const allModifiersMatch = Object.values(modifiersMatch).every((match) => match)

      // Obtener la tecla principal (la última en la combinación)
      const mainKey = keys.filter((key) => !["ctrl", "alt", "shift", "meta"].includes(key))[0]

      // Ejecutar el manejador si todas las condiciones coinciden
      if (allModifiersMatch && (!mainKey || event.key.toLowerCase() === mainKey)) {
        handler(event)
      }
    })
  }

  // Registrar manejadores para eventos de teclado al montar el componente
  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown)
  })

  // Eliminar manejadores al desmontar el componente
  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown)
  })

  return {
    onKeyDown,
    onKey,
    onKeyCombo,
  }
}
