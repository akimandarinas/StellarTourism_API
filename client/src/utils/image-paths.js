/**
 * Utilidad para manejar rutas de imágenes en la aplicación
 */

// Rutas base para diferentes tipos de imágenes
const BASE_PATHS = {
  destinos: "/images",
  naves: "/images/naves",
  actividades: "/images/actividades",
  usuarios: "/images",
  placeholder: "/images",
}

// Mapeo de destinos a sus imágenes correspondientes
const DESTINO_IMAGES = {
  luna: "luna-base.png",
  marte: "marte.png",
  "estación espacial": "estacion-orbital.png",
  // Usar imágenes alternativas para Europa y Ceres
  europa: "placeholder.svg", // Imagen de respaldo para Europa
  venus: "venus-clouds.png",
  titán: "titan-lakes.png",
  ceres: "placeholder.svg", // Imagen de respaldo para Ceres
  jupiter: "jupiter-moons.png",
  saturno: "saturn-rings.png",
}

// Destinos que usan imágenes alternativas cuando no existe la imagen específica
const DESTINOS_ALTERNATIVOS = {
  europa: "jupiter-moons.png", // Europa es una luna de Júpiter
  ceres: "marte.png", // Ceres está en el cinturón de asteroides, cerca de Marte
}

// Mapeo de naves a sus imágenes correspondientes
const NAVE_IMAGES = {
  orion: "aurora-estelar-cruiser.png",
  starship: "voyager-marciano-cruiser.png",
  "lunar shuttle": "halcon-lunar-shuttle.png",
  "voyager x": "solar-explorer-research.png",
  "explorer i": "nexus-orbital-station.png",
  "mars pioneer": "artemisa-lunar-base.png",
}

// Mapeo de actividades a sus imágenes correspondientes
const ACTIVIDAD_IMAGES = {
  "paseo lunar": "lunar-walk.png",
  "observatorio estelar": "lunar-observatory.png",
  "exploración de valles": "valles-marte.png",
}

/**
 * Verifica si una imagen existe en el servidor
 * @param {string} imagePath - Ruta de la imagen
 * @returns {boolean} - True si la imagen existe, false en caso contrario
 */
function imageExists(imagePath) {
  // Esta función es solo un placeholder, ya que no podemos verificar la existencia de archivos en el cliente
  // En un entorno real, podrías implementar una verificación del lado del servidor
  return true
}

/**
 * Obtiene la ruta de la imagen para un destino específico
 * @param {string} destinoNombre - Nombre del destino
 * @returns {string} - Ruta de la imagen
 */
export function getDestinoImagePath(destinoNombre) {
  if (!destinoNombre) return `${BASE_PATHS.placeholder}/placeholder.svg`

  const nombreNormalizado = destinoNombre.toLowerCase()

  // Primero intentamos obtener la imagen específica del destino
  let imageName = DESTINO_IMAGES[nombreNormalizado] || "placeholder.svg"

  // Si el destino tiene una imagen alternativa definida y la imagen específica no existe
  if (nombreNormalizado === "europa" || nombreNormalizado === "ceres") {
    // Usar imagen alternativa para estos destinos específicos
    imageName = DESTINOS_ALTERNATIVOS[nombreNormalizado] || imageName
    console.log(`Usando imagen alternativa para ${destinoNombre}: ${imageName}`)
  }

  return `${BASE_PATHS.destinos}/${imageName}`
}

/**
 * Obtiene la ruta de la imagen para una nave específica
 * @param {string} naveName - Nombre de la nave
 * @returns {string} - Ruta de la imagen
 */
export function getNaveImagePath(naveName) {
  if (!naveName) return `${BASE_PATHS.placeholder}/placeholder.svg`

  const nombreNormalizado = naveName.toLowerCase()
  const imageName = NAVE_IMAGES[nombreNormalizado] || "placeholder.svg"

  return `${BASE_PATHS.naves}/${imageName}`
}

/**
 * Obtiene la ruta de la imagen para una actividad específica
 * @param {string} actividadNombre - Nombre de la actividad
 * @returns {string} - Ruta de la imagen
 */
export function getActividadImagePath(actividadNombre) {
  if (!actividadNombre) return `${BASE_PATHS.placeholder}/placeholder.svg`

  const nombreNormalizado = actividadNombre.toLowerCase()
  const imageName = ACTIVIDAD_IMAGES[nombreNormalizado] || "placeholder.svg"

  return `${BASE_PATHS.actividades}/${imageName}`
}

/**
 * Obtiene la ruta de la imagen de perfil para un usuario
 * @param {string} userId - ID del usuario
 * @returns {string} - Ruta de la imagen
 */
export function getUserImagePath(userId) {
  return userId ? `${BASE_PATHS.usuarios}/avatar-${userId}.png` : `${BASE_PATHS.usuarios}/placeholder-user.jpg`
}

/**
 * Obtiene una imagen de placeholder con dimensiones específicas
 * @param {number} width - Ancho de la imagen
 * @param {number} height - Alto de la imagen
 * @param {string} query - Consulta para generar la imagen
 * @returns {string} - URL de la imagen placeholder
 */
export function getPlaceholderImage(width = 300, height = 200, query = "space") {
  return `${BASE_PATHS.placeholder}/placeholder.svg`
}

export default {
  getDestinoImagePath,
  getNaveImagePath,
  getActividadImagePath,
  getUserImagePath,
  getPlaceholderImage,
}
