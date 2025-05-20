/**
 * Utilidades para manejar el contraste y los colores
 */

/**
 * Verifica si el contraste entre dos colores es suficiente según WCAG
 * @param {string} foreground - Color de primer plano (formato hex)
 * @param {string} background - Color de fondo (formato hex)
 * @param {string} level - Nivel de conformidad ('AA' o 'AAA')
 * @param {boolean} isLargeText - Si el texto es grande (>= 18pt o >= 14pt bold)
 * @returns {boolean} - True si el contraste es suficiente
 */
export function hasAdequateContrast(foreground, background, level = "AA", isLargeText = false) {
  // Convertir colores hex a RGB
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)

    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  // Calcular luminancia relativa
  const getLuminance = (color) => {
    const rgb = hexToRgb(color)
    if (!rgb) return 0

    const { r, g, b } = rgb

    const toSRGB = (value) => {
      value /= 255
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
    }

    return 0.2126 * toSRGB(r) + 0.7152 * toSRGB(g) + 0.0722 * toSRGB(b)
  }

  // Calcular ratio de contraste
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)

  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  // Verificar según nivel WCAG
  if (level === "AAA") {
    return isLargeText ? ratio >= 4.5 : ratio >= 7
  }

  // Nivel AA por defecto
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}

/**
 * Aplica estilos de alto contraste a un elemento
 * @param {HTMLElement} element - Elemento a modificar
 * @param {boolean} enabled - Si el alto contraste está habilitado
 */
export function applyHighContrast(element, enabled = true) {
  if (!element) return

  if (enabled) {
    element.classList.add("high-contrast")
  } else {
    element.classList.remove("high-contrast")
  }
}
