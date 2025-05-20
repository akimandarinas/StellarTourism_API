/**
 * Utilidades comunes para evitar duplicación de código
 * Este archivo centraliza funciones utilizadas en múltiples lugares
 * para reducir la duplicación y mejorar la mantenibilidad
 */

/**
 * Genera un ID único
 * @param {string} prefix - Prefijo para el ID (por defecto: id)
 * @returns {string} - ID único
 */
export function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`
}

/**
 * Debounce: limita la frecuencia de ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en milisegundos
 * @param {boolean} immediate - Si debe ejecutarse inmediatamente
 * @returns {Function} - Función con debounce
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout

  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }

    const callNow = immediate && !timeout

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func.apply(this, args)
  }
}

/**
 * Throttle: ejecuta una función como máximo una vez cada cierto tiempo
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite de tiempo en milisegundos
 * @returns {Function} - Función con throttle
 */
export function throttle(func, limit = 300) {
  let inThrottle

  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Compara dos objetos para determinar si son iguales
 * @param {Object} obj1 - Primer objeto
 * @param {Object} obj2 - Segundo objeto
 * @returns {boolean} - true si los objetos son iguales
 */
export function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true

  if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false

    if (!deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

/**
 * Filtra un array de objetos según criterios
 * @param {Array} array - Array a filtrar
 * @param {Object} filters - Criterios de filtrado
 * @returns {Array} - Array filtrado
 */
export function filterObjects(array, filters) {
  if (!array || !Array.isArray(array)) return []
  if (!filters || Object.keys(filters).length === 0) return array

  return array.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      // Si el valor del filtro es null o undefined, no filtrar por esta propiedad
      if (value === null || value === undefined) return true

      // Si el valor del filtro es un array, verificar si el valor del item está en el array
      if (Array.isArray(value)) {
        return value.includes(item[key])
      }

      // Si el valor del filtro es una función, usarla como predicado
      if (typeof value === "function") {
        return value(item[key])
      }

      // Si el valor del item es un string, hacer comparación insensible a mayúsculas/minúsculas
      if (typeof item[key] === "string" && typeof value === "string") {
        return item[key].toLowerCase().includes(value.toLowerCase())
      }

      // Comparación directa para otros tipos
      return item[key] === value
    })
  })
}

/**
 * Ordena un array de objetos según una propiedad
 * @param {Array} array - Array a ordenar
 * @param {string} property - Propiedad por la que ordenar
 * @param {string} direction - Dirección (asc o desc)
 * @returns {Array} - Array ordenado
 */
export function sortObjects(array, property, direction = "asc") {
  if (!array || !Array.isArray(array)) return []
  if (!property) return array

  const sortFactor = direction.toLowerCase() === "desc" ? -1 : 1

  return [...array].sort((a, b) => {
    const valueA = a[property]
    const valueB = b[property]

    // Manejar valores nulos o indefinidos
    if (valueA === null || valueA === undefined) return sortFactor
    if (valueB === null || valueB === undefined) return -sortFactor

    // Comparar según el tipo de dato
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortFactor * valueA.localeCompare(valueB)
    }

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortFactor * (valueA - valueB)
    }

    if (valueA instanceof Date && valueB instanceof Date) {
      return sortFactor * (valueA.getTime() - valueB.getTime())
    }

    // Convertir a string para otros tipos
    return sortFactor * String(valueA).localeCompare(String(valueB))
  })
}

/**
 * Agrupa un array de objetos según una propiedad
 * @param {Array} array - Array a agrupar
 * @param {string} property - Propiedad por la que agrupar
 * @returns {Object} - Objeto con los grupos
 */
export function groupObjects(array, property) {
  if (!array || !Array.isArray(array)) return {}
  if (!property) return { default: array }

  return array.reduce((groups, item) => {
    const key = item[property] || "default"
    groups[key] = groups[key] || []
    groups[key].push(item)
    return groups
  }, {})
}

/**
 * Convierte un objeto a parámetros de URL
 * @param {Object} params - Objeto con los parámetros
 * @returns {string} - String de parámetros URL
 */
export function objectToQueryString(params) {
  if (!params || typeof params !== "object") return ""

  return Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`).join("&")
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join("&")
}

/**
 * Convierte parámetros de URL a un objeto
 * @param {string} queryString - String de parámetros URL
 * @returns {Object} - Objeto con los parámetros
 */
export function queryStringToObject(queryString) {
  if (!queryString) return {}

  const params = {}
  const searchParams = new URLSearchParams(queryString.startsWith("?") ? queryString.substring(1) : queryString)

  for (const [key, value] of searchParams.entries()) {
    // Manejar arrays (parámetros con [])
    if (key.endsWith("[]")) {
      const arrayKey = key.slice(0, -2)
      params[arrayKey] = params[arrayKey] || []
      params[arrayKey].push(value)
    } else {
      params[key] = value
    }
  }

  return params
}

/**
 * Convierte un objeto a FormData
 * @param {Object} data - Objeto a convertir
 * @returns {FormData} - Objeto FormData
 */
export function objectToFormData(data) {
  if (!data || typeof data !== "object") return new FormData()

  const formData = new FormData()

  function appendToFormData(formData, key, value) {
    if (value === null || value === undefined) return

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        appendToFormData(formData, `${key}[${index}]`, item)
      })
    } else if (value instanceof File) {
      formData.append(key, value, value.name)
    } else if (typeof value === "object" && !(value instanceof Date)) {
      Object.entries(value).forEach(([propKey, propValue]) => {
        appendToFormData(formData, `${key}[${propKey}]`, propValue)
      })
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString())
    } else {
      formData.append(key, String(value))
    }
  }

  Object.entries(data).forEach(([key, value]) => {
    appendToFormData(formData, key, value)
  })

  return formData
}
