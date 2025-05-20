/**
 * Utilidad para verificar y mejorar el contraste de colores
 * Basado en las pautas WCAG 2.1 para accesibilidad
 */

/**
 * Calcula la luminancia relativa de un color RGB
 * Fórmula según WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @param {number} r - Valor de rojo (0-255)
 * @param {number} g - Valor de verde (0-255)
 * @param {number} b - Valor de azul (0-255)
 * @returns {number} Luminancia relativa (0-1)
 */
function calcularLuminancia(r, g, b) {
  // Normalizar valores RGB a rango 0-1
  const rSRGB = r / 255
  const gSRGB = g / 255
  const bSRGB = b / 255

  // Convertir a espacio de color lineal
  const rLineal = rSRGB <= 0.03928 ? rSRGB / 12.92 : Math.pow((rSRGB + 0.055) / 1.055, 2.4)
  const gLineal = gSRGB <= 0.03928 ? gSRGB / 12.92 : Math.pow((gSRGB + 0.055) / 1.055, 2.4)
  const bLineal = bSRGB <= 0.03928 ? bSRGB / 12.92 : Math.pow((bSRGB + 0.055) / 1.055, 2.4)

  // Calcular luminancia según fórmula WCAG
  return 0.2126 * rLineal + 0.7152 * gLineal + 0.0722 * bLineal
}

/**
 * Convierte un color hexadecimal a valores RGB
 * @param {string} hex - Color en formato hexadecimal (#RRGGBB o #RGB)
 * @returns {Object} Objeto con valores r, g, b
 */
function hexARGB(hex) {
  // Eliminar # si existe
  hex = hex.replace(/^#/, "")

  // Expandir formato corto (#RGB a #RRGGBB)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("")
  }

  // Convertir a valores RGB
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)

  return { r, g, b }
}

/**
 * Calcula la relación de contraste entre dos colores
 * @param {string} color1 - Primer color en formato hexadecimal
 * @param {string} color2 - Segundo color en formato hexadecimal
 * @returns {number} Relación de contraste (1-21)
 */
export function calcularContraste(color1, color2) {
  const rgb1 = hexARGB(color1)
  const rgb2 = hexARGB(color2)

  const luminancia1 = calcularLuminancia(rgb1.r, rgb1.g, rgb1.b)
  const luminancia2 = calcularLuminancia(rgb2.r, rgb2.g, rgb2.b)

  // Calcular contraste según fórmula WCAG
  const contrasteRatio =
    luminancia1 > luminancia2
      ? (luminancia1 + 0.05) / (luminancia2 + 0.05)
      : (luminancia2 + 0.05) / (luminancia1 + 0.05)

  return contrasteRatio
}

/**
 * Verifica si un par de colores cumple con los requisitos de contraste WCAG
 * @param {string} colorTexto - Color del texto en formato hexadecimal
 * @param {string} colorFondo - Color del fondo en formato hexadecimal
 * @param {string} nivel - Nivel de conformidad ('AA' o 'AAA')
 * @param {boolean} textoGrande - Indica si el texto es grande (≥18pt o ≥14pt negrita)
 * @returns {boolean} True si cumple con los requisitos de contraste
 */
export function verificarContraste(colorTexto, colorFondo, nivel = "AA", textoGrande = false) {
  const contrasteRatio = calcularContraste(colorTexto, colorFondo)

  // Umbrales según WCAG 2.1
  if (nivel === "AAA") {
    return textoGrande ? contrasteRatio >= 4.5 : contrasteRatio >= 7
  } else {
    // AA por defecto
    return textoGrande ? contrasteRatio >= 3 : contrasteRatio >= 4.5
  }
}

/**
 * Ajusta un color para mejorar el contraste con el fondo
 * @param {string} colorTexto - Color del texto en formato hexadecimal
 * @param {string} colorFondo - Color del fondo en formato hexadecimal
 * @param {number} contrasteObjetivo - Relación de contraste objetivo (por defecto 4.5)
 * @returns {string} Color ajustado en formato hexadecimal
 */
export function mejorarContraste(colorTexto, colorFondo, contrasteObjetivo = 4.5) {
  const rgb = hexARGB(colorTexto)
  const luminanciaFondo = calcularLuminancia(hexARGB(colorFondo).r, hexARGB(colorFondo).g, hexARGB(colorFondo).b)

  // Determinar si oscurecer o aclarar el color
  const oscurecer = luminanciaFondo > 0.5

  // Ajustar color iterativamente hasta alcanzar el contraste objetivo
  const ajustado = { ...rgb }
  let pasos = 0
  let contrasteActual = calcularContraste(colorTexto, colorFondo)

  while (contrasteActual < contrasteObjetivo && pasos < 100) {
    if (oscurecer) {
      // Oscurecer el color
      ajustado.r = Math.max(0, ajustado.r - 1)
      ajustado.g = Math.max(0, ajustado.g - 1)
      ajustado.b = Math.max(0, ajustado.b - 1)
    } else {
      // Aclarar el color
      ajustado.r = Math.min(255, ajustado.r + 1)
      ajustado.g = Math.min(255, ajustado.g + 1)
      ajustado.b = Math.min(255, ajustado.b + 1)
    }

    const colorAjustado = `#${ajustado.r.toString(16).padStart(2, "0")}${ajustado.g.toString(16).padStart(2, "0")}${ajustado.b.toString(16).padStart(2, "0")}`
    contrasteActual = calcularContraste(colorAjustado, colorFondo)
    pasos++
  }

  return `#${ajustado.r.toString(16).padStart(2, "0")}${ajustado.g.toString(16).padStart(2, "0")}${ajustado.b.toString(16).padStart(2, "0")}`
}

/**
 * Genera una paleta de colores accesible basada en un color primario
 * @param {string} colorPrimario - Color primario en formato hexadecimal
 * @param {string} colorFondo - Color de fondo en formato hexadecimal
 * @returns {Object} Paleta de colores accesible
 */
export function generarPaletaAccesible(colorPrimario, colorFondo = "#FFFFFF") {
  const rgb = hexARGB(colorPrimario)

  // Generar variaciones del color primario
  const variaciones = {
    claro: `#${Math.min(255, rgb.r + 40)
      .toString(16)
      .padStart(2, "0")}${Math.min(255, rgb.g + 40)
      .toString(16)
      .padStart(2, "0")}${Math.min(255, rgb.b + 40)
      .toString(16)
      .padStart(2, "0")}`,
    oscuro: `#${Math.max(0, rgb.r - 40)
      .toString(16)
      .padStart(2, "0")}${Math.max(0, rgb.g - 40)
      .toString(16)
      .padStart(2, "0")}${Math.max(0, rgb.b - 40)
      .toString(16)
      .padStart(2, "0")}`,
  }

  // Asegurar que todas las variaciones cumplan con el contraste mínimo
  const paletaAccesible = {
    primario: verificarContraste(colorPrimario, colorFondo)
      ? colorPrimario
      : mejorarContraste(colorPrimario, colorFondo),
    claro: verificarContraste(variaciones.claro, colorFondo)
      ? variaciones.claro
      : mejorarContraste(variaciones.claro, colorFondo),
    oscuro: verificarContraste(variaciones.oscuro, colorFondo)
      ? variaciones.oscuro
      : mejorarContraste(variaciones.oscuro, colorFondo),
  }

  return paletaAccesible
}

/**
 * Evalúa la accesibilidad de un conjunto de colores
 * @param {Object} colores - Objeto con pares de colores texto/fondo a evaluar
 * @returns {Object} Resultados de la evaluación
 */
export function evaluarAccesibilidadColores(colores) {
  const resultados = {}

  for (const [nombre, par] of Object.entries(colores)) {
    const { texto, fondo } = par
    const contraste = calcularContraste(texto, fondo)

    resultados[nombre] = {
      contraste,
      cumpleAA: verificarContraste(texto, fondo, "AA", false),
      cumpleAATextoGrande: verificarContraste(texto, fondo, "AA", true),
      cumpleAAA: verificarContraste(texto, fondo, "AAA", false),
      cumpleAAATextoGrande: verificarContraste(texto, fondo, "AAA", true),
    }
  }

  return resultados
}
