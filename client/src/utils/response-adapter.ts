/**
 * Adaptador para normalizar respuestas de la API
 *
 * Este adaptador se encarga de transformar las respuestas de la API
 * para que sean compatibles con lo que espera el cliente.
 */

import type { Destino } from "../services/destinos/destinos-service"
import type { Nave } from "../services/naves/naves-service"
import type { Reserva } from "../services/reservas/reservas-service"

/**
 * Interfaz genérica para respuestas paginadas
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    totalPages: number
    currentPage: number
    perPage: number
  }
}

/**
 * Normaliza una respuesta paginada
 * @param response Respuesta de la API
 * @param normalizeItem Función para normalizar cada item
 * @returns Respuesta paginada normalizada
 */
export function normalizePaginatedResponse<T, R>(response: any, normalizeItem: (item: any) => T): PaginatedResponse<T> {
  // Si la respuesta ya tiene la estructura esperada
  if (response && response.data && response.meta) {
    return {
      data: Array.isArray(response.data) ? response.data.map(normalizeItem) : [],
      meta: {
        total: response.meta.total || 0,
        totalPages: response.meta.totalPages || response.meta.pages || 1,
        currentPage: response.meta.currentPage || response.meta.page || 1,
        perPage: response.meta.perPage || response.meta.limit || 10,
      },
    }
  }

  // Si la respuesta tiene una estructura diferente con 'records'
  if (response && response.records) {
    return {
      data: Array.isArray(response.records) ? response.records.map(normalizeItem) : [],
      meta: {
        total: response.total || response.records.length,
        totalPages: response.pages || Math.ceil((response.total || response.records.length) / (response.limit || 10)),
        currentPage: response.page || 1,
        perPage: response.limit || 10,
      },
    }
  }

  // Si la respuesta es un array simple
  if (Array.isArray(response)) {
    return {
      data: response.map(normalizeItem),
      meta: {
        total: response.length,
        totalPages: 1,
        currentPage: 1,
        perPage: response.length,
      },
    }
  }

  // Si no podemos determinar la estructura, devolvemos un objeto vacío
  console.error("Estructura de respuesta desconocida:", response)
  return {
    data: [],
    meta: {
      total: 0,
      totalPages: 0,
      currentPage: 0,
      perPage: 0,
    },
  }
}

/**
 * Normaliza un objeto destino
 * @param destino Objeto destino de la API
 * @returns Objeto destino normalizado
 */
export function normalizeDestino(destino: any): Destino {
  if (!destino) {
    console.warn("Intentando normalizar un destino nulo o indefinido")
    return {
      id: 0,
      nombre: "",
      descripcion: "",
      imagen: "",
      tipo: "",
      precio: 0,
      duracion: 0,
      distancia: 0,
      popularidad: 0,
      destacado: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

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
 * Normaliza un objeto nave
 * @param nave Objeto nave de la API
 * @returns Objeto nave normalizado
 */
export function normalizeNave(nave: any): Nave {
  if (!nave) {
    console.warn("Intentando normalizar una nave nula o indefinida")
    return {
      id: 0,
      nombre: "",
      descripcion: "",
      imagen: "",
      tipo: "",
      capacidad: 0,
      velocidad: 0,
      autonomia: 0,
      precio: 0,
      disponible: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

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
 * Normaliza un objeto reserva
 * @param reserva Objeto reserva de la API
 * @returns Objeto reserva normalizado
 */
export function normalizeReserva(reserva: any): Reserva {
  if (!reserva) {
    console.warn("Intentando normalizar una reserva nula o indefinida")
    return {
      id: 0,
      userId: "",
      destinoId: 0,
      naveId: 0,
      fechaViaje: "",
      fechaRegreso: "",
      precio: 0,
      estado: "pendiente",
      pasajeros: 0,
      motivoCancelacion: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

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
 * Normaliza una respuesta de destinos
 * @param response Respuesta de la API
 * @returns Respuesta normalizada
 */
export function normalizeDestinosResponse(response: any): PaginatedResponse<Destino> {
  return normalizePaginatedResponse(response, normalizeDestino)
}

/**
 * Normaliza una respuesta de naves
 * @param response Respuesta de la API
 * @returns Respuesta normalizada
 */
export function normalizeNavesResponse(response: any): PaginatedResponse<Nave> {
  return normalizePaginatedResponse(response, normalizeNave)
}

/**
 * Normaliza una respuesta de reservas
 * @param response Respuesta de la API
 * @returns Respuesta normalizada
 */
export function normalizeReservasResponse(response: any): PaginatedResponse<Reserva> {
  return normalizePaginatedResponse(response, normalizeReserva)
}

export default {
  normalizeDestino,
  normalizeNave,
  normalizeReserva,
  normalizeDestinosResponse,
  normalizeNavesResponse,
  normalizeReservasResponse,
  normalizePaginatedResponse,
}
