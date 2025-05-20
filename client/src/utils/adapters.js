/**
 * Adaptadores para normalizar datos entre la API y el cliente
 */

/**
 * Normaliza un destino recibido de la API
 * @param {Object} destinoApi - Destino recibido de la API
 * @returns {Object} - Destino normalizado para el cliente
 */
export function normalizeDestino(destinoApi) {
  if (!destinoApi) return null

  return {
    id: destinoApi.ID,
    nombre: destinoApi.NOMBRE,
    tipo: destinoApi.TIPO,
    descripcion: destinoApi.DESCRIPCION,
    distanciaTierra: destinoApi.DISTANCIA_TIERRA,
    tiempoViaje: destinoApi.TIEMPO_VIAJE,
    detalles: typeof destinoApi.DETALLES === "string" ? JSON.parse(destinoApi.DETALLES) : destinoApi.DETALLES,
    gravedad: destinoApi.GRAVEDAD,
    atmosfera: destinoApi.ATMOSFERA,
    temperatura: destinoApi.TEMPERATURA,
    createdAt: destinoApi.CREATED_AT,
    updatedAt: destinoApi.UPDATED_AT,
    imagenes: Array.isArray(destinoApi.imagenes)
      ? destinoApi.imagenes.map((img) => ({
          id: img.ID,
          url: img.URL_IMAGEN,
          altText: img.ALT_TEXT,
        }))
      : [],
    actividades: Array.isArray(destinoApi.actividades)
      ? destinoApi.actividades.map((act) => normalizeActividad(act))
      : [],
  }
}

/**
 * Normaliza una actividad recibida de la API
 * @param {Object} actividadApi - Actividad recibida de la API
 * @returns {Object} - Actividad normalizada para el cliente
 */
export function normalizeActividad(actividadApi) {
  if (!actividadApi) return null

  return {
    id: actividadApi.ID,
    idDestino: actividadApi.ID_DESTINO,
    nombre: actividadApi.NOMBRE,
    descripcion: actividadApi.DESCRIPCION,
    duracion: actividadApi.DURACION,
    precio: Number.parseFloat(actividadApi.PRECIO),
    maxParticipantes: Number.parseInt(actividadApi.MAX_PARTICIPANTES, 10),
    dificultad: actividadApi.DIFICULTAD,
    equipoNecesario: actividadApi.EQUIPO_NECESARIO,
    activo: actividadApi.ACTIVO === "SI",
    createdAt: actividadApi.CREATED_AT,
    updatedAt: actividadApi.UPDATED_AT,
    destinoNombre: actividadApi.DESTINO_NOMBRE,
  }
}

/**
 * Normaliza una nave recibida de la API
 * @param {Object} naveApi - Nave recibida de la API
 * @returns {Object} - Nave normalizada para el cliente
 */
export function normalizeNave(naveApi) {
  if (!naveApi) return null

  return {
    id: naveApi.ID,
    nombre: naveApi.NOMBRE,
    capacidad: Number.parseInt(naveApi.CAPACIDAD, 10),
    url: naveApi.URL,
    especificaciones:
      typeof naveApi.ESPECIFICACIONES === "string" ? JSON.parse(naveApi.ESPECIFICACIONES) : naveApi.ESPECIFICACIONES,
    caracteristicas:
      typeof naveApi.CARACTERISTICAS === "string" ? JSON.parse(naveApi.CARACTERISTICAS) : naveApi.CARACTERISTICAS,
    velocidad: Number.parseFloat(naveApi.VELOCIDAD),
    tamaño: naveApi.TAMAÑO,
    propulsion: naveApi.PROPULSION,
    rango: naveApi.RANGO,
    activo: naveApi.IS_ACTIVE === "SI",
    createdAt: naveApi.CREATED_AT,
    updatedAt: naveApi.UPDATED_AT,
    imagenes: Array.isArray(naveApi.imagenes)
      ? naveApi.imagenes.map((img) => ({
          id: img.ID,
          url: img.URL_IMAGEN,
          altText: img.ALT_TEXT,
        }))
      : [],
    comodidades: Array.isArray(naveApi.comodidades)
      ? naveApi.comodidades.map((com) => ({
          id: com.ID,
          url: com.URL_IMAGEN,
          altText: com.ALT_TEXT,
        }))
      : [],
  }
}

/**
 * Normaliza una reserva recibida de la API
 * @param {Object} reservaApi - Reserva recibida de la API
 * @returns {Object} - Reserva normalizada para el cliente
 */
export function normalizeReserva(reservaApi) {
  if (!reservaApi) return null

  return {
    id: reservaApi.ID,
    idUsuario: reservaApi.ID_USUARIO,
    idRuta: reservaApi.ID_RUTA,
    idNave: reservaApi.ID_NAVE,
    fechaSalida: reservaApi.FECHA_SALIDA,
    fechaRegreso: reservaApi.FECHA_REGRESO,
    numPasajeros: Number.parseInt(reservaApi.NUM_PASAJEROS, 10),
    precioTotal: Number.parseFloat(reservaApi.PRECIO_TOTAL),
    estado: reservaApi.ESTADO,
    detalles: typeof reservaApi.DETALLES === "string" ? JSON.parse(reservaApi.DETALLES) : reservaApi.DETALLES,
    createdAt: reservaApi.CREATED_AT,
    updatedAt: reservaApi.UPDATED_AT,
    rutaNombre: reservaApi.RUTA_NOMBRE,
    naveName: reservaApi.NAVE_NOMBRE,
    usuarioNombre: reservaApi.USUARIO_NOMBRE,
  }
}

/**
 * Prepara un destino para enviarlo a la API
 * @param {Object} destino - Destino normalizado en el cliente
 * @returns {Object} - Destino preparado para la API
 */
export function prepareDestinoForApi(destino) {
  return {
    ID: destino.id,
    NOMBRE: destino.nombre,
    TIPO: destino.tipo,
    DESCRIPCION: destino.descripcion,
    DISTANCIA_TIERRA: destino.distanciaTierra,
    TIEMPO_VIAJE: destino.tiempoViaje,
    DETALLES: typeof destino.detalles === "object" ? JSON.stringify(destino.detalles) : destino.detalles,
    GRAVEDAD: destino.gravedad,
    ATMOSFERA: destino.atmosfera,
    TEMPERATURA: destino.temperatura,
  }
}

/**
 * Maneja errores de parsing JSON
 * @param {string} jsonString - String JSON a parsear
 * @param {*} defaultValue - Valor por defecto si falla el parsing
 * @returns {Object} - Objeto parseado o valor por defecto
 */
export function safeJsonParse(jsonString, defaultValue = {}) {
  if (!jsonString) return defaultValue

  try {
    return typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return defaultValue
  }
}

/**
 * Normaliza una respuesta de error de la API
 * @param {Error} error - Error capturado
 * @returns {Object} - Error normalizado
 */
export function normalizeApiError(error) {
  if (!error) return { message: "Error desconocido", status: 500 }

  // Si es un error de Axios con respuesta
  if (error.response) {
    return {
      message: error.response.data.message || error.message || "Error del servidor",
      status: error.response.status,
      data: error.response.data,
      originalError: error,
    }
  }

  // Si es un error de red (sin respuesta)
  if (error.request) {
    return {
      message: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
      status: 0,
      originalError: error,
    }
  }

  // Otro tipo de error
  return {
    message: error.message || "Error desconocido",
    status: 500,
    originalError: error,
  }
}

/**
 * Verifica si un objeto tiene todas las propiedades esperadas
 * @param {Object} obj - Objeto a verificar
 * @param {Array} requiredProps - Array de propiedades requeridas
 * @returns {boolean} - True si tiene todas las propiedades
 */
export function hasRequiredProps(obj, requiredProps) {
  if (!obj || typeof obj !== "object") return false
  return requiredProps.every((prop) => obj.hasOwnProperty(prop))
}
