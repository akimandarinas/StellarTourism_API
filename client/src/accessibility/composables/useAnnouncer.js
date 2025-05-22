import { ref } from "vue"

/* Composable para anunciar mensajes a lectores de pantalla */
export function useAnnouncer() {
  // Verificar si estamos en un navegador
  const isBrowser = typeof window !== "undefined"

  const message = ref("")
  const politeness = ref("polite") // 'polite' o 'assertive'

  const getAnnouncerElement = () => {
    if (!isBrowser) return null

    let announcer = document.getElementById("sr-announcer")

    if (!announcer) {
      announcer = document.createElement("div")
      announcer.id = "sr-announcer"
      announcer.setAttribute("aria-live", politeness.value)
      announcer.setAttribute("aria-atomic", "true")
      announcer.setAttribute("aria-relevant", "additions text")
      announcer.style.position = "absolute"
      announcer.style.width = "1px"
      announcer.style.height = "1px"
      announcer.style.padding = "0"
      announcer.style.overflow = "hidden"
      announcer.style.clip = "rect(0, 0, 0, 0)"
      announcer.style.whiteSpace = "nowrap"
      announcer.style.border = "0"

      document.body.appendChild(announcer)
    }

    return announcer
  }

  const announce = (text, level = "polite") => {
    if (!isBrowser) return

    message.value = text
    politeness.value = level

    const announcer = getAnnouncerElement()
    if (announcer) {
      announcer.setAttribute("aria-live", level)

      // Limpiar el anunciador antes de añadir el nuevo mensaje
      announcer.textContent = ""

      // Usar setTimeout para asegurar que el cambio sea detectado
      setTimeout(() => {
        announcer.textContent = text
      }, 50)
    }
  }

  const clear = () => {
    if (!isBrowser) return

    message.value = ""

    const announcer = getAnnouncerElement()
    if (announcer) {
      announcer.textContent = ""
    }
  }

  return {
    message,
    politeness,
    announce,
    clear,
  }
}
