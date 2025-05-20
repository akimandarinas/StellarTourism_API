/**
 * Servicio para procesar y optimizar imágenes
 */

// Formatos soportados para optimización
const SUPPORTED_FORMATS = ["webp", "avif", "jpeg", "png", "jpg"]

// Calidad por defecto para la compresión de imágenes
const DEFAULT_QUALITY = 80

// Caché de verificación de soporte de formato
const formatSupportCache = new Map()

// Caché de imágenes verificadas
const imageCacheStatus = new Map()

/**
 * Comprueba si el navegador soporta un formato de imagen específico
 * @param {string} format - Formato a comprobar (webp, avif, etc.)
 * @returns {Promise<boolean>} - Promesa que se resuelve con true si el formato es soportado
 */
export const isFormatSupported = async (format) => {
  if (!format || !SUPPORTED_FORMATS.includes(format.toLowerCase())) {
    return false
  }

  // Verificar caché primero
  if (formatSupportCache.has(format)) {
    return formatSupportCache.get(format)
  }

  // Para WebP y AVIF podemos usar la API de createImageBitmap
  if (typeof createImageBitmap === "function") {
    try {
      // Crear una imagen pequeña en el formato especificado
      const blob = await fetch(`data:image/${format};base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=`).then((r) => r.blob())
      await createImageBitmap(blob)
      formatSupportCache.set(format, true)
      return true
    } catch (e) {
      formatSupportCache.set(format, false)
      return false
    }
  }

  // Fallback: comprobar mediante un elemento de imagen
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      formatSupportCache.set(format, true)
      resolve(true)
    }
    img.onerror = () => {
      formatSupportCache.set(format, false)
      resolve(false)
    }
    img.src = `data:image/${format};base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=`
  })
}

/**
 * Determina el mejor formato de imagen basado en el soporte del navegador
 * @returns {Promise<string>} - Promesa que se resuelve con el mejor formato soportado
 */
export const getBestSupportedFormat = async () => {
  if (await isFormatSupported("avif")) return "avif"
  if (await isFormatSupported("webp")) return "webp"
  return "jpeg"
}

/**
 * Genera una URL optimizada para una imagen
 * @param {string} src - URL original de la imagen
 * @param {Object} options - Opciones de optimización
 * @param {number} [options.width] - Ancho deseado
 * @param {number} [options.height] - Alto deseado
 * @param {number} [options.quality] - Calidad de la imagen (1-100)
 * @param {string} [options.format] - Formato deseado (webp, avif, jpeg, png)
 * @returns {string} - URL optimizada
 */
export const getOptimizedImageUrl = (src, options = {}) => {
  if (!src) return ""

  // Si es una URL de datos o ya está optimizada, devolverla tal cual
  if (src.startsWith("data:") || src.includes("imagedelivery.net")) {
    return src
  }

  try {
    const url = new URL(src, window.location.origin)

    // Si es una URL externa, devolver la original
    if (url.origin !== window.location.origin && !src.startsWith("/")) {
      return src
    }

    // Verificar si la URL ya tiene parámetros de optimización
    const existingParams = new URLSearchParams(url.search)
    if (existingParams.has("w") || existingParams.has("h") || existingParams.has("q") || existingParams.has("f")) {
      // Ya está optimizada, devolver tal cual
      return src
    }

    // Construir parámetros de optimización
    const params = new URLSearchParams()

    if (options.width) params.append("w", options.width)
    if (options.height) params.append("h", options.height)
    if (options.quality) params.append("q", options.quality)
    if (options.format) params.append("f", options.format)

    // Si hay parámetros, añadirlos a la URL
    const paramsString = params.toString()
    if (paramsString) {
      return `${src}${src.includes("?") ? "&" : "?"}${paramsString}`
    }
  } catch (e) {
    console.warn("Error al optimizar la URL de la imagen:", e)
  }

  return src
}

/**
 * Genera un conjunto de URLs para diferentes tamaños (srcset)
 * @param {string} src - URL original de la imagen
 * @param {Object} options - Opciones de optimización
 * @param {number[]} [options.breakpoints=[640, 768, 1024, 1280, 1536]] - Puntos de ruptura para los diferentes tamaños
 * @param {number} [options.quality=80] - Calidad de la imagen
 * @param {string} [options.format='auto'] - Formato de la imagen
 * @returns {string} - Atributo srcset generado
 */
export const generateSrcSet = (src, options = {}) => {
  if (!src || src.startsWith("data:")) return ""

  const { breakpoints = [640, 768, 1024, 1280, 1536], quality = DEFAULT_QUALITY, format = "auto" } = options

  try {
    return breakpoints
      .map((width) => {
        const optimizedUrl = getOptimizedImageUrl(src, { width, quality, format })
        return `${optimizedUrl} ${width}w`
      })
      .join(", ")
  } catch (e) {
    console.warn("Error al generar srcset:", e)
    return ""
  }
}

/**
 * Genera el atributo sizes para imágenes responsivas
 * @param {Object|string} sizes - Configuración de tamaños
 * @returns {string} - Atributo sizes generado
 */
export const generateSizes = (sizes) => {
  if (typeof sizes === "string") {
    return sizes
  }

  if (typeof sizes === "object") {
    return Object.entries(sizes)
      .sort((a, b) => b[0] - a[0]) // Ordenar de mayor a menor breakpoint
      .map(([breakpoint, size]) => `(min-width: ${breakpoint}px) ${size}`)
      .concat(["100vw"]) // Valor por defecto
      .join(", ")
  }

  return "100vw"
}

/**
 * Precarga una imagen para mejorar el rendimiento
 * @param {string} src - URL de la imagen a precargar
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<HTMLImageElement>} - Promesa que se resuelve cuando la imagen está cargada
 */
export const preloadImage = (src, options = {}) => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    if (options.crossOrigin) {
      img.crossOrigin = options.crossOrigin
    }

    img.onload = () => {
      // Marcar como cacheada
      imageCacheStatus.set(src, true)
      resolve(img)
    }

    img.onerror = (e) => {
      // Marcar como no cacheada
      imageCacheStatus.set(src, false)
      reject(e)
    }

    // Establecer atributos para optimizar la carga
    if (options.fetchPriority) {
      img.fetchPriority = options.fetchPriority
    }

    if (options.loading) {
      img.loading = options.loading
    }

    if (options.decoding) {
      img.decoding = options.decoding
    }

    img.src = src
  })
}

/**
 * Comprueba si una imagen está en caché
 * @param {string} src - URL de la imagen
 * @returns {Promise<boolean>} - Promesa que se resuelve con true si la imagen está en caché
 */
export const isImageCached = async (src) => {
  // Verificar primero en nuestra caché interna
  if (imageCacheStatus.has(src)) {
    return imageCacheStatus.get(src)
  }

  try {
    // Verificar si la imagen está en la caché del navegador
    const response = await fetch(src, {
      method: "HEAD",
      cache: "force-cache",
      headers: {
        "Cache-Control": "max-age=0",
      },
    })

    const isCached = response.ok
    imageCacheStatus.set(src, isCached)
    return isCached
  } catch (e) {
    imageCacheStatus.set(src, false)
    return false
  }
}

/**
 * Precarga un conjunto de imágenes críticas
 * @param {string[]} urls - Array de URLs de imágenes a precargar
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<HTMLImageElement[]>} - Promesa que se resuelve cuando todas las imágenes están cargadas
 */
export const preloadCriticalImages = async (urls, options = {}) => {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return []
  }

  // Precargar imágenes en paralelo con límite de concurrencia
  const concurrency = options.concurrency || 3
  const results = []

  // Función para procesar un lote de imágenes
  const processBatch = async (batch) => {
    const promises = batch.map((url) =>
      preloadImage(url, {
        fetchPriority: "high",
        loading: "eager",
        ...options,
      }).catch((err) => {
        console.warn(`Error preloading image ${url}:`, err)
        return null
      }),
    )

    return Promise.all(promises)
  }

  // Procesar imágenes en lotes
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency)
    const batchResults = await processBatch(batch)
    results.push(...batchResults.filter(Boolean))
  }

  return results
}

/**
 * Optimiza una imagen para su uso en canvas
 * @param {string} src - URL de la imagen
 * @param {Object} options - Opciones de optimización
 * @returns {Promise<HTMLImageElement>} - Promesa que se resuelve con la imagen optimizada
 */
export const optimizeImageForCanvas = async (src, options = {}) => {
  const img = await preloadImage(src, {
    crossOrigin: "anonymous",
    ...options,
  })

  // Si no se necesita redimensionar, devolver la imagen tal cual
  if (!options.width && !options.height) {
    return img
  }

  // Crear un canvas para redimensionar
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  // Calcular dimensiones manteniendo la relación de aspecto
  const aspectRatio = img.width / img.height
  let width = options.width || img.width
  let height = options.height || img.height

  if (options.width && !options.height) {
    height = width / aspectRatio
  } else if (options.height && !options.width) {
    width = height * aspectRatio
  }

  // Establecer dimensiones del canvas
  canvas.width = width
  canvas.height = height

  // Dibujar la imagen redimensionada
  ctx.drawImage(img, 0, 0, width, height)

  // Crear una nueva imagen a partir del canvas
  return new Promise((resolve, reject) => {
    const optimizedImg = new Image()
    optimizedImg.onload = () => resolve(optimizedImg)
    optimizedImg.onerror = reject
    optimizedImg.src = canvas.toDataURL(options.format || "image/jpeg", options.quality || 0.8)
  })
}

export default {
  isFormatSupported,
  getBestSupportedFormat,
  getOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
  preloadImage,
  isImageCached,
  preloadCriticalImages,
  optimizeImageForCanvas,
}
