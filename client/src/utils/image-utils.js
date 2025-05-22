/**
 * Utilidades para el manejo de imágenes en la aplicación
 */

// URL de imagen de respaldo principal
export const DEFAULT_FALLBACK_IMAGE =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aurora-estelar-cruiser-RQ8yt03mV9GFflJm8wrfYK83vB6ImU.png"

// Mapeo de nombres de archivo a URLs de blob para las imágenes de naves
export const NAVE_IMAGE_MAP = {
  "nave-estelar.png":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aurora-estelar-cruiser-RQ8yt03mV9GFflJm8wrfYK83vB6ImU.png",
  "aurora-estelar-cruiser.png":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aurora-estelar-cruiser-RQ8yt03mV9GFflJm8wrfYK83vB6ImU.png",
  "halcon-lunar-shuttle.png":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/halcon-lunar-shuttle-QTNlppBIVLAihLCoKfG0xXzkPzD2xa.png",
  "voyager-marciano-cruiser.png":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/voyager-marciano-cruiser.png-1lRnc8nBmVPVlMp40AuMoMTn0DErpu.jpeg",
  "nexus-orbital-station.png":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nexus-orbital-station-5RJo0cfI0NUItzyPF6fCwYa04RduiQ.png",
  "solar-explorer-research.png":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/solar-explorer-research-T31AK5CsKfqxRlxZo9uHODArM3ZrGQ.png",
  "artemisa-lunar-base.png":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/artemisa-lunar-base.png-yinGoQ8HIqYQ3U9FfA2B8ZlER5CH6n.webp",
  "eea7728b-18e0-4b08-8e12-128b50fbe0e2.png":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eea7728b-18e0-4b08-8e12-128b50fbe0e2-xZASfQCe9tuHSpxcGQOGI1aNj05qsP.png",
  "8778798.png": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8778798-fRteSwuh3yAfsk85nOtVyq3lwjJreq.png",
  "bb155376-b4ec-492e-b057-614eedacff24.png":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bb155376-b4ec-492e-b057-614eedacff24-6vMOPBQJ7xYEu9TLIf75qX4WPfPipq.png",
}

/**
 * Obtiene la URL de una imagen de nave
 * @param {string} filename - Nombre del archivo de imagen
 * @returns {string} - URL de la imagen
 */
export function getNaveImageUrl(filename) {
  // Si la imagen existe en el mapeo, devolver la URL del blob
  if (NAVE_IMAGE_MAP[filename]) {
    return NAVE_IMAGE_MAP[filename]
  }

  // Si no, devolver la imagen de respaldo
  return DEFAULT_FALLBACK_IMAGE
}

/**
 * Maneja errores de carga de imágenes
 * @param {Event} event - Evento de error
 */
export function handleImageError(event) {
  console.log("Error al cargar imagen, usando imagen de respaldo")
  event.target.src = DEFAULT_FALLBACK_IMAGE
}

/**
 * Reemplaza todas las rutas de imágenes locales con URLs de Vercel Blob Storage
 * @param {string} html - HTML que puede contener rutas de imágenes locales
 * @returns {string} - HTML con rutas de imágenes reemplazadas
 */
export function replaceLocalImagePaths(html) {
  if (!html) return html

  // Reemplazar rutas de imágenes locales con URLs de Vercel Blob Storage
  let result = html

  // Reemplazar /images/nave-estelar.png
  result = result.replace(/\/images\/nave-estelar\.png/g, DEFAULT_FALLBACK_IMAGE)

  // Reemplazar otras rutas de imágenes locales
  Object.entries(NAVE_IMAGE_MAP).forEach(([filename, url]) => {
    result = result.replace(new RegExp(`/images/naves/${filename}`, "g"), url)
    result = result.replace(new RegExp(`/images/${filename}`, "g"), url)
  })

  return result
}
