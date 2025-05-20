// Función para formatear fechas
export function formatDate(date) {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Función para formatear horas
export function formatTime(date, options = {}) {
  if (!date) return ""

  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    console.error("Invalid date:", date)
    return ""
  }

  const defaultOptions = {
    hour: "2-digit",
    minute: "2-digit",
  }

  const mergedOptions = { ...defaultOptions, ...options }

  try {
    return new Intl.DateTimeFormat("es-ES", mergedOptions).format(dateObj)
  } catch (error) {
    console.error("Error formatting time:", error)
    return ""
  }
}

// Función para formatear precios
export function formatPrice(price) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price)
}

// Función para formatear números
export function formatNumber(number) {
  return new Intl.NumberFormat("es-ES").format(number)
}

// Función para formatear tiempo relativo (hace X minutos, etc.)
export function formatTimeAgo(date) {
  if (!date) return ""

  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    console.error("Invalid date:", date)
    return ""
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now - dateObj) / 1000)

  if (diffInSeconds < 60) {
    return "hace un momento"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)

  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)

  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`
  }

  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays < 7) {
    return `hace ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)

  if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} ${diffInWeeks === 1 ? "semana" : "semanas"}`
  }

  const diffInMonths = Math.floor(diffInDays / 30)

  if (diffInMonths < 12) {
    return `hace ${diffInMonths} ${diffInMonths === 1 ? "mes" : "meses"}`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `hace ${diffInYears} ${diffInYears === 1 ? "año" : "años"}`
}

// Función para truncar texto
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Convierte texto a slug
 * @param {string} text - El texto a convertir
 * @returns {string} El slug generado
 */
export function slugify(text) {
  if (!text) return ""

  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
}

export default {
  formatDate,
  formatTime,
  formatPrice,
  formatNumber,
  formatTimeAgo,
  truncateText,
  slugify,
}
