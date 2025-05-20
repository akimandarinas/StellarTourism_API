/**
 * Genera una URL de imagen placeholder basada en el nombre del destino
 * @param {string} nombre - Nombre del destino
 * @returns {string} URL de la imagen placeholder
 */
export function getDestinationPlaceholder(nombre) {
  if (!nombre) return "/images/placeholder.svg"

  // Mapeo de palabras clave a imágenes específicas
  const keywordMap = {
    luna: "/images/luna-base.png",
    marte: "/images/marte.png",
    estación: "/images/estacion-orbital.png",
    venus: "/images/venus-clouds.png",
    júpiter: "/images/jupiter-moons.png",
    saturno: "/images/saturn-rings.png",
  }

  // Buscar coincidencias en el nombre (case insensitive)
  const nombreLower = nombre.toLowerCase()
  for (const [keyword, image] of Object.entries(keywordMap)) {
    if (nombreLower.includes(keyword.toLowerCase())) {
      return image
    }
  }

  // Si no hay coincidencias, generar un placeholder basado en el nombre
  return `/images/placeholder.svg?text=${encodeURIComponent(nombre)}`
}
