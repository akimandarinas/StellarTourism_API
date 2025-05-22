/* Detectar preferencias de accesibilidad del usuario */

export function isHighContrastMode() {
  return (
    window.matchMedia("(forced-colors: active)").matches ||
    window.matchMedia("(-ms-high-contrast: active)").matches ||
    window.matchMedia("(prefers-contrast: more)").matches
  )
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}


export function prefersDarkMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}


export function prefersLargerText() {
  //Verificar si el usuario ha aumentado el tamaño de fuente del navegador
  const fontSize = window.getComputedStyle(document.documentElement).fontSize
  return Number.parseFloat(fontSize) > 16
}

export function listenForPreferenceChange(preference, callback) {
  let mediaQuery

  switch (preference) {
    case "contrast":
      mediaQuery = window.matchMedia("(prefers-contrast: more)")
      break
    case "motion":
      mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      break
    case "color-scheme":
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      break
    default:
      return () => {}
  }

  const handler = (e) => callback(e.matches)
  mediaQuery.addEventListener("change", handler)

  callback(mediaQuery.matches)

  return () => mediaQuery.removeEventListener("change", handler)
}
