/**
 * Mock para date-fns
 * Este archivo proporciona implementaciones simuladas de las funciones más comunes de date-fns
 */

// Formato de fecha simple
export function format(date, formatStr, options = {}) {
  if (!date) return ""

  const d = new Date(date)

  if (isNaN(d.getTime())) {
    console.warn("Invalid date provided to format:", date)
    return "Fecha inválida"
  }

  // Formato simple para fechas
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()

  // Formato simple para horas
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")

  // Formatos comunes
  if (formatStr === "PPP") {
    // Ejemplo: 25 de abril de 2023
    const monthNames = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ]
    return `${day} de ${monthNames[d.getMonth()]} de ${year}`
  }

  if (formatStr === "PP") {
    // Ejemplo: 25 abr. 2023
    const shortMonthNames = [
      "ene.",
      "feb.",
      "mar.",
      "abr.",
      "may.",
      "jun.",
      "jul.",
      "ago.",
      "sep.",
      "oct.",
      "nov.",
      "dic.",
    ]
    return `${day} ${shortMonthNames[d.getMonth()]} ${year}`
  }

  if (formatStr === "P") {
    // Ejemplo: 25/04/2023
    return `${day}/${month}/${year}`
  }

  if (formatStr === "PPPp") {
    // Ejemplo: 25 de abril de 2023, 14:30
    const monthNames = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ]
    return `${day} de ${monthNames[d.getMonth()]} de ${year}, ${hours}:${minutes}`
  }

  if (formatStr === "p") {
    // Ejemplo: 14:30
    return `${hours}:${minutes}`
  }

  // Formato por defecto
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Diferencia en días entre dos fechas
export function differenceInDays(dateLeft, dateRight) {
  const d1 = new Date(dateLeft)
  const d2 = new Date(dateRight)

  // Convertir a días
  const diffTime = Math.abs(d1 - d2)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// Añadir días a una fecha
export function addDays(date, amount) {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}

// Añadir meses a una fecha
export function addMonths(date, amount) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + amount)
  return d
}

// Comprobar si una fecha es anterior a otra
export function isBefore(date, dateToCompare) {
  return new Date(date) < new Date(dateToCompare)
}

// Comprobar si una fecha es posterior a otra
export function isAfter(date, dateToCompare) {
  return new Date(date) > new Date(dateToCompare)
}

// Comprobar si una fecha está entre dos fechas
export function isWithinInterval(date, { start, end }) {
  const d = new Date(date)
  const s = new Date(start)
  const e = new Date(end)
  return d >= s && d <= e
}

// Exportar un objeto con todas las funciones
export const es = {
  // Locales para español
  localize: {
    month: (month) => {
      const months = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ]
      return months[month]
    },
    day: (day) => {
      const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
      return days[day]
    },
  },
  formatLong: {
    date: () => "dd/MM/yyyy",
    time: () => "HH:mm",
    dateTime: () => "dd/MM/yyyy HH:mm",
  },
}

// Exportar todas las funciones como un objeto por defecto
export default {
  format,
  differenceInDays,
  addDays,
  addMonths,
  isBefore,
  isAfter,
  isWithinInterval,
  es,
}
