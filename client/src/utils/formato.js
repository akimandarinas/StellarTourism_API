/**
 * Utilidades para formatear diferentes tipos de datos
 */

/**
 * Formatea una distancia en kilómetros a una unidad más legible
 * @param {number} distancia - Distancia en kilómetros
 * @returns {string} Distancia formateada
 */
export function formatearDistancia(distancia) {
  if (!distancia && distancia !== 0) return "N/A"

  // Convertir a número si es string
  const dist = typeof distancia === "string" ? Number.parseFloat(distancia) : distancia

  // Unidades astronómicas
  const UA = 149597870.7 // 1 UA en kilómetros

  if (dist >= UA) {
    // Si es mayor a 1 UA, mostrar en UAs
    const uas = dist / UA
    return `${uas.toFixed(2)} UA`
  } else if (dist >= 1000000) {
    // Si es mayor a 1 millón de km, mostrar en millones
    const millones = dist / 1000000
    return `${millones.toFixed(2)} millones km`
  } else if (dist >= 1000) {
    // Si es mayor a 1000 km, mostrar en miles
    const miles = dist / 1000
    return `${miles.toFixed(2)} mil km`
  } else {
    // De lo contrario, mostrar en km
    return `${dist.toLocaleString()} km`
  }
}

/**
 * Formatea una temperatura en grados Celsius
 * @param {number} temperatura - Temperatura en grados Celsius
 * @param {boolean} incluirUnidad - Si se debe incluir la unidad en el resultado
 * @returns {string} Temperatura formateada
 */
export function formatearTemperatura(temperatura, incluirUnidad = true) {
  if (temperatura === undefined || temperatura === null) {
    return "No disponible"
  }

  // Convertir a número si es string
  const temp = typeof temperatura === "string" ? Number.parseFloat(temperatura) : temperatura

  // Verificar si es un número válido
  if (isNaN(temp)) {
    return "No disponible"
  }

  return (
    temp.toLocaleString("es-ES", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    }) + (incluirUnidad ? " °C" : "")
  )
}

/**
 * Formatea un porcentaje
 * @param {number} valor - Valor entre 0 y 1
 * @param {boolean} incluirUnidad - Si se debe incluir el símbolo % en el resultado
 * @returns {string} Porcentaje formateado
 */
export function formatearPorcentaje(valor, incluirUnidad = true) {
  if (valor === undefined || valor === null) {
    return "No disponible"
  }

  // Convertir a número si es string
  const porcentaje = typeof valor === "string" ? Number.parseFloat(valor) : valor

  // Verificar si es un número válido
  if (isNaN(porcentaje)) {
    return "No disponible"
  }

  // Convertir a porcentaje (multiplicar por 100 si está en escala 0-1)
  const valorPorcentaje = porcentaje <= 1 ? porcentaje * 100 : porcentaje

  return (
    valorPorcentaje.toLocaleString("es-ES", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    }) + (incluirUnidad ? "%" : "")
  )
}

/**
 * Formatea una duración en días
 * @param {number} dias - Duración en días
 * @returns {string} Duración formateada
 */
export function formatearDuracion(dias) {
  if (!dias && dias !== 0) return "N/A"

  if (dias < 1) {
    // Menos de un día, mostrar en horas
    const horas = Math.round(dias * 24)
    return `${horas} ${horas === 1 ? "hora" : "horas"}`
  } else if (dias < 30) {
    // Menos de un mes, mostrar en días
    return `${dias} ${dias === 1 ? "día" : "días"}`
  } else if (dias < 365) {
    // Menos de un año, mostrar en meses
    const meses = Math.round(dias / 30)
    return `${meses} ${meses === 1 ? "mes" : "meses"}`
  } else {
    // Más de un año, mostrar en años
    const anos = Math.round((dias / 365) * 10) / 10
    return `${anos} ${anos === 1 ? "año" : "años"}`
  }
}

/**
 * Formatea un número con separadores de miles
 * @param {number} numero - Número a formatear
 * @param {number} decimales - Cantidad de decimales a mostrar
 * @returns {string} Número formateado
 */
export function formatearNumero(numero, decimales = 0) {
  if (numero === undefined || numero === null) {
    return "No disponible"
  }

  // Convertir a número si es string
  const num = typeof numero === "string" ? Number.parseFloat(numero) : numero

  // Verificar si es un número válido
  if (isNaN(num)) {
    return "No disponible"
  }

  return num.toLocaleString("es-ES", {
    maximumFractionDigits: decimales,
    minimumFractionDigits: decimales,
  })
}

/**
 * Formatea un valor monetario
 * @param {number} valor - Valor monetario
 * @param {string} moneda - Código de moneda (por defecto EUR)
 * @returns {string} Valor monetario formateado
 */
export function formatearMoneda(valor, moneda = "EUR") {
  if (valor === undefined || valor === null) {
    return "No disponible"
  }

  // Convertir a número si es string
  const val = typeof valor === "string" ? Number.parseFloat(valor) : valor

  // Verificar si es un número válido
  if (isNaN(val)) {
    return "No disponible"
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val)
}

/**
 * Formatea una fecha en formato local
 * @param {Date|string} fecha - Fecha a formatear
 * @param {string} formato - Formato de fecha ('corto', 'medio', 'largo', 'completo')
 * @returns {string} Fecha formateada
 */
export function formatearFecha(fecha, formato = "medio") {
  if (!fecha) return "N/A"

  const date = fecha instanceof Date ? fecha : new Date(fecha)

  // Verificar si es una fecha válida
  if (isNaN(date.getTime())) {
    return "Fecha inválida"
  }

  const opciones = {
    corto: { day: "numeric", month: "numeric", year: "numeric" },
    medio: { day: "numeric", month: "long", year: "numeric" },
    largo: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
    completo: { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" },
  }

  return new Intl.DateTimeFormat("es-ES", opciones[formato] || opciones.medio).format(date)
}

/**
 * Formatea un tamaño de archivo en bytes, KB, MB, etc.
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export function formatearTamanoArchivo(bytes) {
  if (bytes === undefined || bytes === null) {
    return "No disponible"
  }

  // Convertir a número si es string
  const size = typeof bytes === "string" ? Number.parseFloat(bytes) : bytes

  // Verificar si es un número válido
  if (isNaN(size)) {
    return "No disponible"
  }

  const unidades = ["B", "KB", "MB", "GB", "TB", "PB"]
  let i = 0
  let valor = size

  while (valor >= 1024 && i < unidades.length - 1) {
    valor /= 1024
    i++
  }

  return (
    valor.toLocaleString("es-ES", {
      maximumFractionDigits: 2,
      minimumFractionDigits: i > 0 ? 2 : 0,
    }) +
    " " +
    unidades[i]
  )
}

/**
 * Formatea un texto para mostrarlo truncado con puntos suspensivos
 * @param {string} texto - Texto a formatear
 * @param {number} longitud - Longitud máxima
 * @returns {string} Texto truncado
 */
export function truncarTexto(texto, longitud = 100) {
  if (!texto) {
    return ""
  }

  if (texto.length <= longitud) {
    return texto
  }

  return texto.substring(0, longitud) + "..."
}

/**
 * Formatea un nombre para mostrar iniciales
 * @param {string} nombre - Nombre completo
 * @param {number} cantidad - Cantidad de iniciales a mostrar
 * @returns {string} Iniciales
 */
export function obtenerIniciales(nombre, cantidad = 2) {
  if (!nombre) {
    return ""
  }

  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, cantidad)
}

/**
 * Formatea una velocidad en km/h o m/s
 * @param {number} velocidad - Velocidad en km/h
 * @param {string} unidad - Unidad de medida ('kmh' o 'ms')
 * @returns {string} Velocidad formateada
 */
export function formatearVelocidad(velocidad, unidad = "kmh") {
  if (velocidad === undefined || velocidad === null) {
    return "No disponible"
  }

  // Convertir a número si es string
  const vel = typeof velocidad === "string" ? Number.parseFloat(velocidad) : velocidad

  // Verificar si es un número válido
  if (isNaN(vel)) {
    return "No disponible"
  }

  if (unidad === "ms") {
    // Convertir de km/h a m/s si es necesario
    const velMs = vel / 3.6
    return (
      velMs.toLocaleString("es-ES", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }) + " m/s"
    )
  }

  return (
    vel.toLocaleString("es-ES", {
      maximumFractionDigits: 0,
    }) + " km/h"
  )
}

/**
 * Formatea un precio en dólares
 * @param {number} precio - Precio en dólares
 * @returns {string} Precio formateado
 */
export function formatearPrecio(precio) {
  if (!precio && precio !== 0) return "N/A"

  return `$${precio.toLocaleString()}`
}

export default {
  formatearDistancia,
  formatearTemperatura,
  formatearPorcentaje,
  formatearDuracion,
  formatearNumero,
  formatearMoneda,
  formatearFecha,
  formatearTamanoArchivo,
  truncarTexto,
  obtenerIniciales,
  formatearVelocidad,
  formatearPrecio,
}
