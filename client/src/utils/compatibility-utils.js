/**
 * Utilidades de compatibilidad para la aplicación StellarTourism
 *
 * Este módulo proporciona funciones para mejorar la compatibilidad de la aplicación
 * con diferentes navegadores, dispositivos y entornos.
 */

/**
 * Verifica la compatibilidad del navegador con características específicas
 * @returns {Object} Estado de compatibilidad de características
 */
export function checkBrowserCompatibility() {
  return {
    // API Web modernas
    intersectionObserver: "IntersectionObserver" in window,
    resizeObserver: "ResizeObserver" in window,
    mutationObserver: "MutationObserver" in window,
    webAnimations: "Animation" in window,
    webShare: "share" in navigator,
    webStorage: "localStorage" in window,
    indexedDB: "indexedDB" in window,
    serviceWorker: "serviceWorker" in navigator,
    webWorker: "Worker" in window,

    // Características CSS modernas
    cssGrid: CSS.supports("display", "grid"),
    cssFlexbox: CSS.supports("display", "flex"),
    cssVariables: CSS.supports("--test", "0"),
    cssStickyPosition: CSS.supports("position", "sticky"),

    // Características JavaScript modernas
    asyncAwait: (() => {
      try {
        eval("(async function() {})()")
        return true
      } catch (e) {
        return false
      }
    })(),
    arrowFunctions: (() => {
      try {
        eval("(() => {})()")
        return true
      } catch (e) {
        return false
      }
    })(),
    destructuring: (() => {
      try {
        eval("const { a } = { a: 1 }")
        return true
      } catch (e) {
        return false
      }
    })(),

    // Características multimedia
    webGL: (() => {
      try {
        const canvas = document.createElement("canvas")
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        )
      } catch (e) {
        return false
      }
    })(),
    webGL2: (() => {
      try {
        const canvas = document.createElement("canvas")
        return !!(window.WebGL2RenderingContext && canvas.getContext("webgl2"))
      } catch (e) {
        return false
      }
    })(),
    webP: (() => {
      const elem = document.createElement("canvas")
      if (elem.getContext && elem.getContext("2d")) {
        return elem.toDataURL("image/webp").indexOf("data:image/webp") === 0
      }
      return false
    })(),

    // Características de red
    fetch: "fetch" in window,
    websockets: "WebSocket" in window,

    // Características de seguridad
    secureContext: window.isSecureContext,
    contentSecurityPolicy: !!window.trustedTypes,
  }
}

/**
 * Verifica si el navegador es compatible con la aplicación
 * @returns {Object} Resultado de la verificación
 */
export function isCompatibleBrowser() {
  const compatibility = checkBrowserCompatibility()

  // Características mínimas requeridas
  const requiredFeatures = ["intersectionObserver", "webStorage", "cssGrid", "cssFlexbox", "asyncAwait", "fetch"]

  // Verificar características requeridas
  const missingFeatures = requiredFeatures.filter((feature) => !compatibility[feature])

  return {
    isCompatible: missingFeatures.length === 0,
    missingFeatures,
    compatibility,
  }
}

/**
 * Detecta el navegador y la versión
 * @returns {Object} Información del navegador
 */
export function detectBrowser() {
  const userAgent = navigator.userAgent
  let browser = "Unknown"
  let version = "Unknown"

  // Chrome
  if (/Chrome/.test(userAgent) && !/Chromium|Edge|Edg|OPR|Opera/.test(userAgent)) {
    browser = "Chrome"
    version = userAgent.match(/Chrome\/(\d+\.\d+)/)[1]
  }
  // Firefox
  else if (/Firefox/.test(userAgent)) {
    browser = "Firefox"
    version = userAgent.match(/Firefox\/(\d+\.\d+)/)[1]
  }
  // Safari
  else if (/Safari/.test(userAgent) && !/Chrome|Chromium|Edge|Edg|OPR|Opera/.test(userAgent)) {
    browser = "Safari"
    version = userAgent.match(/Version\/(\d+\.\d+)/)[1]
  }
  // Edge (Chromium)
  else if (/Edg/.test(userAgent)) {
    browser = "Edge"
    version = userAgent.match(/Edg\/(\d+\.\d+)/)[1]
  }
  // Edge (Legacy)
  else if (/Edge/.test(userAgent)) {
    browser = "Edge (Legacy)"
    version = userAgent.match(/Edge\/(\d+\.\d+)/)[1]
  }
  // Opera
  else if (/OPR|Opera/.test(userAgent)) {
    browser = "Opera"
    version = userAgent.match(/(?:OPR|Opera)\/(\d+\.\d+)/)[1]
  }
  // IE
  else if (/MSIE|Trident/.test(userAgent)) {
    browser = "Internet Explorer"
    version = userAgent.match(/(?:MSIE |rv:)(\d+\.\d+)/)[1]
  }

  return {
    browser,
    version,
    userAgent,
  }
}

/**
 * Detecta el sistema operativo
 * @returns {Object} Información del sistema operativo
 */
export function detectOS() {
  const userAgent = navigator.userAgent
  let os = "Unknown"
  let version = "Unknown"

  // Windows
  if (/Windows/.test(userAgent)) {
    os = "Windows"
    if (/Windows NT 10.0/.test(userAgent)) version = "10"
    else if (/Windows NT 6.3/.test(userAgent)) version = "8.1"
    else if (/Windows NT 6.2/.test(userAgent)) version = "8"
    else if (/Windows NT 6.1/.test(userAgent)) version = "7"
    else if (/Windows NT 6.0/.test(userAgent)) version = "Vista"
    else if (/Windows NT 5.1/.test(userAgent)) version = "XP"
  }
  // macOS
  else if (/Macintosh/.test(userAgent)) {
    os = "macOS"
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/)
    if (match) {
      version = match[1].replace("_", ".")
    }
  }
  // iOS
  else if (/iPhone|iPad|iPod/.test(userAgent)) {
    os = "iOS"
    const match = userAgent.match(/OS (\d+[._]\d+)/)
    if (match) {
      version = match[1].replace("_", ".")
    }
  }
  // Android
  else if (/Android/.test(userAgent)) {
    os = "Android"
    const match = userAgent.match(/Android (\d+\.\d+)/)
    if (match) {
      version = match[1]
    }
  }
  // Linux
  else if (/Linux/.test(userAgent)) {
    os = "Linux"
  }

  return {
    os,
    version,
  }
}

/**
 * Detecta el tipo de dispositivo
 * @returns {Object} Información del dispositivo
 */
export function detectDevice() {
  const userAgent = navigator.userAgent
  let deviceType = "Desktop"
  let isMobile = false
  let isTablet = false

  // Verificar si es móvil
  if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    isMobile = true
    deviceType = "Mobile"

    // Verificar si es tablet
    if (/Tablet|iPad/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent))) {
      isTablet = true
      deviceType = "Tablet"
    }
  }

  return {
    deviceType,
    isMobile,
    isTablet,
    hasTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  }
}

/**
 * Aplica polyfills para características no soportadas
 * @param {Array} features - Características a verificar
 * @returns {Promise} Promesa que se resuelve cuando los polyfills están cargados
 */
export async function applyPolyfills(features = []) {
  const compatibility = checkBrowserCompatibility()
  const polyfillsToLoad = []

  // Verificar características específicas
  if (features.includes("intersectionObserver") && !compatibility.intersectionObserver) {
    polyfillsToLoad.push(import("intersection-observer"))
  }

  if (features.includes("resizeObserver") && !compatibility.resizeObserver) {
    polyfillsToLoad.push(import("resize-observer-polyfill"))
  }

  // Cargar polyfills
  await Promise.all(polyfillsToLoad)
}
