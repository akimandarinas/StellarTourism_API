/**
 * Adaptador para normalizar las respuestas de la API
 *
 * Este adaptador se encarga de transformar las respuestas de la API
 * para que sean compatibles con lo que espera el cliente, independientemente
 * de la estructura que devuelva la API.
 */

import type { Destino } from "../services/destinos/destinos-service"
import type { Nave } from "../services/naves/naves-service"
import type { Reserva } from "../services/reservas/reservas-service"

/**
 * Normaliza la respuesta de destinos
 * @param apiResponse Respuesta de la API
 * @returns Respuesta normalizada
 */
export function normalizeDestinosResponse(apiResponse: any): Destino[] {
  // Si la respuesta ya es un array, asumimos que es un array de destinos
  if (Array.isArray(apiResponse)) {
    return apiResponse.map(normalizeDestino)
  }

  // Si la respuesta tiene una propiedad 'records', asumimos que es una respuesta paginada
  if (apiResponse && apiResponse.records) {
    return apiResponse.records.map(normalizeDestino)
  }

  // Si la respuesta tiene una propiedad 'data', asumimos que es una respuesta con metadata
  if (apiResponse && apiResponse.data) {
    return Array.isArray(apiResponse.data)
      ? apiResponse.data.map(normalizeDestino)
      : [normalizeDestino(apiResponse.data)]
  }

  // Si no podemos determinar la estructura, devolvemos un array vacío
  console.error("Estructura de respuesta de destinos desconocida:", apiResponse)
  return []
}

/**
 * Normaliza un objeto destino
 * @param destino Objeto destino de la API
 * @returns Objeto destino normalizado
 */
export function normalizeDestino(destino: any): Destino {
  // Asegurarse de que todas las propiedades esperadas existan y tengan el tipo correcto
  return {
    id: destino.id || destino.ID || 0,
    nombre: destino.nombre || destino.NOMBRE || "",
    descripcion: destino.descripcion || destino.DESCRIPCION || "",
    imagen: destino.imagen || destino.imagen_principal || destino.IMAGEN || "",
    tipo: destino.tipo || destino.TIPO || "",
    precio:
      typeof destino.precio === "number"
        ? destino.precio
        : typeof destino.PRECIO === "number"
          ? destino.PRECIO
          : Number.parseFloat(destino.precio || destino.PRECIO || "0"),
    duracion:
      typeof destino.duracion === "number"
        ? destino.duracion
        : typeof destino.DURACION === "number"
          ? destino.DURACION
          : Number.parseInt(destino.duracion || destino.DURACION || "0", 10),
    distancia:
      typeof destino.distancia === "number"
        ? destino.distancia
        : typeof destino.DISTANCIA === "number"
          ? destino.DISTANCIA
          : Number.parseFloat(destino.distancia || destino.DISTANCIA || "0"),
    popularidad:
      typeof destino.popularidad === "number"
        ? destino.popularidad
        : typeof destino.POPULARIDAD === "number"
          ? destino.POPULARIDAD
          : Number.parseFloat(destino.popularidad || destino.POPULARIDAD || "0"),
    destacado:
      destino.destacado === true ||
      destino.destacado === "true" ||
      destino.DESTACADO === true ||
      destino.DESTACADO === "true" ||
      destino.destacado === 1 ||
      destino.DESTACADO === 1,
    created_at: destino.created_at || destino.CREATED_AT || new Date().toISOString(),
    updated_at: destino.updated_at || destino.UPDATED_AT || new Date().toISOString(),
  }
}

/**
 * Normaliza la respuesta de naves
 * @param apiResponse Respuesta de la API
 * @returns Respuesta normalizada
 */
export function normalizeNavesResponse(apiResponse: any): Nave[] {
  // Si la respuesta ya es un array, asumimos que es un array de naves
  if (Array.isArray(apiResponse)) {
    return apiResponse.map(normalizeNave)
  }

  // Si la respuesta tiene una propiedad 'records', asumimos que es una respuesta paginada
  if (apiResponse && apiResponse.records) {
    return apiResponse.records.map(normalizeNave)
  }

  // Si la respuesta tiene una propiedad 'data', asumimos que es una respuesta con metadata
  if (apiResponse && apiResponse.data) {
    return Array.isArray(apiResponse.data) ? apiResponse.data.map(normalizeNave) : [normalizeNave(apiResponse.data)]
  }

  // Si no podemos determinar la estructura, devolvemos un array vacío
  console.error("Estructura de respuesta de naves desconocida:", apiResponse)
  return []
}

/**
 * Normaliza un objeto nave
 * @param nave Objeto nave de la API
 * @returns Objeto nave normalizado
 */
export function normalizeNave(nave: any): Nave {
  // Asegurarse de que todas las propiedades esperadas existan y tengan el tipo correcto
  return {
    id: nave.id || nave.ID || 0,
    nombre: nave.nombre || nave.NOMBRE || "",
    descripcion: nave.descripcion || nave.DESCRIPCION || "",
    imagen: nave.imagen || nave.URL || "",
    tipo: nave.tipo || nave.TIPO || "",
    capacidad:
      typeof nave.capacidad === "number"
        ? nave.capacidad
        : typeof nave.CAPACIDAD === "number"
          ? nave.CAPACIDAD
          : Number.parseInt(nave.capacidad || nave.CAPACIDAD || "0", 10),
    velocidad:
      typeof nave.velocidad === "number"
        ? nave.velocidad
        : typeof nave.VELOCIDAD === "number"
          ? nave.VELOCIDAD
          : Number.parseFloat(nave.velocidad || nave.VELOCIDAD || "0"),
    autonomia:
      typeof nave.autonomia === "number"
        ? nave.autonomia
        : typeof nave.RANGO === "number"
          ? nave.RANGO
          : Number.parseFloat(nave.autonomia || nave.RANGO || "0"),
    precio:
      typeof nave.precio === "number"
        ? nave.precio
        : typeof nave.PRECIO === "number"
          ? nave.PRECIO
          : Number.parseFloat(nave.precio || nave.PRECIO || "0"),
    disponible:
      nave.disponible === true ||
      nave.disponible === "true" ||
      nave.IS_ACTIVE === "SI" ||
      nave.IS_ACTIVE === true ||
      nave.disponible === 1 ||
      nave.IS_ACTIVE === 1,
    created_at: nave.created_at || nave.CREATED_AT || new Date().toISOString(),
    updated_at: nave.updated_at || nave.UPDATED_AT || new Date().toISOString(),
  }
}

/**
 * Normaliza la respuesta de reservas
 * @param apiResponse Respuesta de la API
 * @returns Respuesta normalizada
 */
export function normalizeReservasResponse(apiResponse: any): Reserva[] {
  // Si la respuesta ya es un array, asumimos que es un array de reservas
  if (Array.isArray(apiResponse)) {
    return apiResponse.map(normalizeReserva)
  }

  // Si la respuesta tiene una propiedad 'records', asumimos que es una respuesta paginada
  if (apiResponse && apiResponse.records) {
    return apiResponse.records.map(normalizeReserva)
  }

  // Si la respuesta tiene una propiedad 'data', asumimos que es una respuesta con metadata
  if (apiResponse && apiResponse.data) {
    return Array.isArray(apiResponse.data)
      ? apiResponse.data.map(normalizeReserva)
      : [normalizeReserva(apiResponse.data)]
  }

  // Si no podemos determinar la estructura, devolvemos un array vacío
  console.error("Estructura de respuesta de reservas desconocida:", apiResponse)
  return []
}

/**
 * Normaliza un objeto reserva
 * @param reserva Objeto reserva de la API
 * @returns Objeto reserva normalizado
 */
export function normalizeReserva(reserva: any): Reserva {
  // Asegurarse de que todas las propiedades esperadas existan y tengan el tipo correcto
  return {
    id: reserva.id || reserva.ID || 0,
    userId: reserva.userId || reserva.usuario_id || reserva.USUARIO_ID || "",
    destinoId: reserva.destinoId || reserva.destino_id || reserva.DESTINO_ID || 0,
    naveId: reserva.naveId || reserva.nave_id || reserva.NAVE_ID || 0,
    fechaViaje: reserva.fechaViaje || reserva.fecha_viaje || reserva.FECHA_VIAJE || "",
    fechaRegreso: reserva.fechaRegreso || reserva.fecha_regreso || reserva.FECHA_REGRESO || "",
    precio:
      typeof reserva.precio === "number"
        ? reserva.precio
        : typeof reserva.PRECIO === "number"
          ? reserva.PRECIO
          : Number.parseFloat(reserva.precio || reserva.PRECIO || "0"),
    estado: reserva.estado || reserva.ESTADO || "pendiente",
    pasajeros:
      typeof reserva.pasajeros === "number"
        ? reserva.pasajeros
        : typeof reserva.PASAJEROS === "number"
          ? reserva.PASAJEROS
          : Number.parseInt(reserva.pasajeros || reserva.PASAJEROS || "0", 10),
    motivoCancelacion: reserva.motivoCancelacion || reserva.motivo_cancelacion || reserva.MOTIVO_CANCELACION || "",
    created_at: reserva.created_at || reserva.CREATED_AT || new Date().toISOString(),
    updated_at: reserva.updated_at || reserva.UPDATED_AT || new Date().toISOString(),
  }
}

/**
 * Normaliza los parámetros de consulta para que sean compatibles con la API
 * @param params Parámetros de consulta del cliente
 * @returns Parámetros normalizados
 */
export function normalizeQueryParams(params: Record<string, any>): Record<string, any> {
  const normalizedParams: Record<string, any> = {}

  // Mapeo de nombres de parámetros del cliente a nombres de parámetros de la API
  const paramMapping: Record<string, string> = {
    // Parámetros generales
    page: "page",
    limit: "limit",
    sort: "order_by",
    order: "order_dir",
    search: "q",

    // Parámetros específicos de destinos
    minPrice: "precio_min",
    maxPrice: "precio_max",
    minDuration: "duracion_min",
    maxDuration: "duracion_max",
    type: "tipo",
    featured: "destacado",

    // Parámetros específicos de naves
    minCapacity: "capacidad_min",
    maxCapacity: "capacidad_max",
    available: "disponible",

    // Parámetros específicos de reservas
    userId: "usuario_id",
    destinationId: "destino_id",
    shipId: "nave_id",
    status: "estado",
    startDate: "fecha_inicio",
    endDate: "fecha_fin",
  }

  // Normalizar parámetros
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue

    const apiKey = paramMapping[key] || key
    normalizedParams[apiKey] = value
  }

  return normalizedParams
}
