/**
 * Utilidades de seguridad para la aplicación
 *
 * Este módulo unifica las funcionalidades de security.js y security-utils.js
 */

// Función simple para sanitizar HTML sin DOMPurify
function simpleSanitizeHtml(html) {
  if (!html) return ""

  // Crear un elemento div temporal
  const tempDiv = document.createElement("div")
  tempDiv.textContent = html // Esto convierte automáticamente entidades HTML

  // Devolver el HTML sanitizado
  return tempDiv.innerHTML
}

/**
 * Sanitiza HTML para prevenir ataques XSS
 * @param {string} html - HTML a sanitizar
 * @returns {string} - HTML sanitizado
 */
export function sanitizeHtml(html) {
  if (!html) return ""

  // Usar nuestra función simple en lugar de DOMPurify
  return simpleSanitizeHtml(html)
}

/**
 * Función para sanitizar texto y prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export function sanitizeText(text) {
  if (!text) return ""

  // Convertir caracteres especiales a entidades HTML
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Escapa caracteres especiales en una cadena para uso en RegExp
 * @param {string} string - Cadena a escapar
 * @returns {string} - Cadena escapada
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Sanitiza una URL para prevenir ataques de inyección de JavaScript
 * @param {string} url - URL a sanitizar
 * @param {Array} allowedDomains - Dominios permitidos
 * @returns {string} - URL sanitizada o cadena vacía si es inválida
 */
export function sanitizeUrl(url, allowedDomains = []) {
  if (!url) return ""

  // Eliminar caracteres de control y espacios
  url = url.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, "")

  // Verificar protocolos peligrosos
  if (/^(javascript|data|vbscript|file):/i.test(url)) {
    return ""
  }

  // Si la URL es relativa, está bien
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url
  }

  // Verificar si la URL es válida
  try {
    const parsedUrl = new URL(url)

    // Permitir solo protocolos seguros
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return ""
    }

    // Si hay dominios permitidos, verificar
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some((domain) => {
        if (domain instanceof RegExp) {
          return domain.test(parsedUrl.hostname)
        }
        return parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      })

      if (!isAllowed) {
        return ""
      }
    }

    return url
  } catch (e) {
    // Si no es una URL válida, devolver cadena vacía
    return ""
  }
}

/**
 * Función para validar entrada según tipo
 * @param {string} value - Valor a validar
 * @param {string} type - Tipo de entrada
 * @returns {boolean} - true si la entrada es válida
 */
export function validateInput(value, type) {
  if (value === null || value === undefined) return false

  switch (type) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    case "phone":
      return /^\+?[0-9]{8,15}$/.test(value)
    case "url":
      return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value)
    case "number":
      return !isNaN(Number.parseFloat(value)) && isFinite(value)
    case "integer":
      return Number.isInteger(Number(value))
    case "date":
      return !isNaN(Date.parse(value))
    case "alphanumeric":
      return /^[a-zA-Z0-9]+$/.test(value)
    case "text":
      return typeof value === "string" && value.length > 0
    default:
      return true
  }
}

/**
 * Sanitiza datos de entrada para prevenir inyección
 * @param {string|object} input - Entrada a sanitizar
 * @returns {string|object} - Entrada sanitizada
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return input

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Valida un token para prevenir ataques CSRF
 * @param {string} token - Token a validar
 * @returns {boolean} - true si el token es válido
 */
const validateCsrfToken = (token) => {
  const storedToken = localStorage.getItem("csrf_token")

  // Eliminar el token después de validarlo (one-time use)
  localStorage.removeItem("csrf_token")

  return token === storedToken
}

/**
 * Genera un token CSRF y lo almacena en localStorage
 * @returns {string} - Token CSRF generado
 */
export function generateCsrfToken() {
  // Generar un token aleatorio
  const array = new Uint8Array(16)
  window.crypto.getRandomValues(array)
  const token = Array.from(array, (byte) => ("0" + (byte & 0xff).toString(16)).slice(-2)).join("")

  // Almacenar el token en localStorage
  localStorage.setItem("csrf_token", token)

  return token
}

/**
 * Obtiene el token CSRF actual
 * @returns {string} - Token CSRF actual
 */
export function getCsrfToken() {
  let token = localStorage.getItem("csrf_token")

  // Si no existe, generar uno nuevo
  if (!token) {
    token = generateCsrfToken()
  }

  return token
}

/**
 * Añade el token CSRF a una solicitud
 * @param {Object} config - Configuración de la solicitud
 * @returns {Object} - Configuración de la solicitud con el token CSRF añadido
 */
export function addCsrfTokenToRequest(config) {
  const token = getCsrfToken()

  if (!config.headers) {
    config.headers = {}
  }

  config.headers["X-CSRF-Token"] = token

  return config
}

/**
 * Verifica si una contraseña cumple con los requisitos de seguridad
 * @param {string} password - Contraseña a verificar
 * @returns {boolean} - true si la contraseña es segura
 */
export function isPasswordSecure(password) {
  // Debe tener al menos 8 caracteres
  if (password.length < 8) return false

  // Debe tener al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) return false

  // Debe tener al menos una letra minúscula
  if (!/[a-z]/.test(password)) return false

  // Debe tener al menos un número
  if (!/[0-9]/.test(password)) return false

  // Debe tener al menos un carácter especial
  if (!/[^A-Za-z0-9]/.test(password)) return false

  return true
}

/**
 * Sanitiza una contraseña para prevenir inyección
 * @param {string} password - Contraseña a sanitizar
 * @returns {string} - Contraseña sanitizada
 */
export function sanitizePassword(password) {
  return escapeRegExp(password)
}

/**
 * Verifica si una contraseña cumple con los requisitos de seguridad
 * @param {string} password - Contraseña a verificar
 * @returns {Object} Resultado de la verificación
 */
export function validatePasswordStrength(password) {
  if (!password) {
    return {
      isValid: false,
      score: 0,
      feedback: "La contraseña no puede estar vacía",
    }
  }

  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  let score = 0
  const feedback = []

  // Verificar longitud
  if (password.length < minLength) {
    feedback.push(`La contraseña debe tener al menos ${minLength} caracteres`)
  } else {
    score += 1
  }

  // Verificar complejidad
  if (!hasUppercase) {
    feedback.push("Debe incluir al menos una letra mayúscula")
  } else {
    score += 1
  }

  if (!hasLowercase) {
    feedback.push("Debe incluir al menos una letra minúscula")
  } else {
    score += 1
  }

  if (!hasNumbers) {
    feedback.push("Debe incluir al menos un número")
  } else {
    score += 1
  }

  if (!hasSpecialChars) {
    feedback.push("Debe incluir al menos un carácter especial")
  } else {
    score += 1
  }

  // Verificar patrones comunes
  const commonPatterns = [/12345/, /qwerty/, /password/i, /admin/i, /user/i, /welcome/i]

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    feedback.push("La contraseña contiene patrones comunes fáciles de adivinar")
    score = Math.max(0, score - 1)
  }

  // Verificar repeticiones
  if (/(.)\1{2,}/.test(password)) {
    feedback.push("La contraseña contiene caracteres repetidos")
    score = Math.max(0, score - 1)
  }

  return {
    isValid: score >= 3 && password.length >= minLength,
    score: score,
    feedback: feedback.length > 0 ? feedback.join(". ") : "Contraseña segura",
  }
}

/**
 * Genera un hash de una cadena (solo para uso del lado del cliente)
 * @param {string} input - Cadena a hashear
 * @returns {Promise<string>} Hash generado
 */
export async function generateHash(input) {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Verifica si el navegador soporta características de seguridad modernas
 * @returns {Object} Estado de soporte de características
 */
export function checkSecurityFeatures() {
  return {
    secureContext: window.isSecureContext,
    contentSecurityPolicy: !!window.trustedTypes,
    crossOriginIsolation: window.crossOriginIsolated,
    credentialsMode: "credentials" in navigator,
    cryptoAPI: !!window.crypto && !!window.crypto.subtle,
    serviceWorker: "serviceWorker" in navigator,
  }
}

/**
 * Aplica protección contra clickjacking
 */
export function applyClickjackingProtection() {
  // Verificar si estamos en un iframe
  if (window.self !== window.top) {
    // Si la página está siendo cargada en un iframe, redirigir a la versión normal
    window.top.location.href = window.self.location.href
  }
}

/**
 * Enmascara datos sensibles para registro o visualización
 * @param {string} data - Datos a enmascarar
 * @param {Object} options - Opciones de enmascaramiento
 * @returns {string} - Datos enmascarados
 */
export function maskSensitiveData(data, options = {}) {
  if (!data) return ""

  const { visibleStart = 0, visibleEnd = 0, maskChar = "*", type = "default" } = options

  // Si es un número de tarjeta, usar un formato específico
  if (type === "creditCard") {
    // Mostrar solo los últimos 4 dígitos
    return data.replace(/\s/g, "").replace(/\d(?=\d{4})/g, maskChar)
  }

  // Si es un email, mantener el dominio visible
  if (type === "email" && data.includes("@")) {
    const [username, domain] = data.split("@")
    const maskedUsername = username.charAt(0) + maskChar.repeat(username.length - 1)
    return `${maskedUsername}@${domain}`
  }

  // Enmascaramiento general
  if (data.length <= visibleStart + visibleEnd) {
    return data
  }

  const start = data.substring(0, visibleStart)
  const middle = maskChar.repeat(data.length - visibleStart - visibleEnd)
  const end = data.substring(data.length - visibleEnd)

  return start + middle + end
}

/**
 * Verifica si una contraseña ha sido comprometida (simulación)
 * En una implementación real, esto consultaría un servicio como "Have I Been Pwned"
 * @param {string} password - Contraseña a verificar
 * @returns {Promise<boolean>} - true si la contraseña ha sido comprometida
 */
export async function isPasswordCompromised(password) {
  try {
    // Generar un hash SHA-1 de la contraseña
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest("SHA-1", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

    // En una implementación real, aquí se consultaría la API de "Have I Been Pwned"
    // usando el método k-anonimity (enviando solo los primeros 5 caracteres del hash)

    // Simulación: algunas contraseñas comunes se consideran comprometidas
    const commonPasswords = [
      "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8", // "password"
      "5e884898da28047151d0e56f8dc6292773603d0d", // "password1"
      "6367c48dd193d56ea7b0baad25b19455e529f5ee", // "abc123"
      "7c4a8d09ca3762af61e59520943dc26494f8941b", // "123456"
      "f7c3bc1d808e04732adf679965ccc34ca7ae3441", // "admin"
    ]

    return commonPasswords.includes(hashHex)
  } catch (error) {
    console.error("Error al verificar si la contraseña ha sido comprometida:", error)
    return false
  }
}

/**
 * Genera una contraseña segura aleatoria
 * @param {Object} options - Opciones de generación
 * @returns {string} - Contraseña generada
 */
export function generateSecurePassword(options = {}) {
  const {
    length = 12,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options

  let charset = ""
  if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
  if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  if (includeNumbers) charset += "0123456789"
  if (includeSymbols) charset += "!@#$%^&*()_-+={}[]|:;<>,.?"

  // Asegurar que el charset no esté vacío
  if (!charset) {
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  }

  // Generar la contraseña
  let password = ""
  const values = new Uint8Array(length)
  window.crypto.getRandomValues(values)

  for (let i = 0; i < length; i++) {
    password += charset[values[i] % charset.length]
  }

  return password
}

/**
 * Añade un campo honeypot
 * @returns {string} - Campo honeypot vacío
 */
export const createHoneypot = () => {
  return ""
}

/**
 * Valida un campo honeypot
 * @param {string} value - Valor del campo honeypot
 * @returns {boolean} - true si el campo honeypot está vacío
 */
export const validateHoneypot = (value) => {
  // El campo honeypot debe estar vacío
  return value === ""
}

/**
 * Valida que una entrada no contiene scripts
 * @param {string} input - Entrada a validar
 * @returns {boolean} - true si la entrada no contiene scripts
 */
export const validateNoScript = (input) => {
  if (typeof input !== "string") return true

  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
  const eventPattern = /\bon\w+\s*=/gi

  return !scriptPattern.test(input) && !eventPattern.test(input)
}

/**
 * Función para crear un objeto con utilidades de seguridad (para compatibilidad con el composable anterior)
 * @returns {Object} - Objeto con utilidades de seguridad
 */
export const useSecurityUtils = () => {
  return {
    addCSRFToken: generateCsrfToken,
    validateCSRFToken: validateCsrfToken,
    addHoneypot: createHoneypot,
    validateHoneypot,
    sanitizeInput,
    validateNoScript,
  }
}

// Exportar todas las funciones
export default {
  sanitizeText,
  validateInput,
  generateCsrfToken,
  getCsrfToken,
  addCsrfTokenToRequest,
  isPasswordSecure,
}
