"use client"

/**
 * Servicio unificado para gestionar destinos
 */
import apiService from "./api"
import cacheService from "./cache"

// Endpoints de la API de destinos
const ENDPOINTS = {
  BASE: "/destinos",
  DETALLE: (id) => `/destinos/${id}`,
  BUSCAR: "/destinos/buscar",
  POPULARES: "/destinos/populares",
  IMAGENES: (id) => `/destinos/${id}/imagenes`,
  ACTIVIDADES: (id) => `/destinos/${id}/actividades`,
}

// Tiempos de caché
const CACHE_TTL = {
  LISTA: 5 * 60 * 1000, // 5 minutos
  DETALLE: 10 * 60 * 1000, // 10 minutos
  BUSQUEDA: 2 * 60 * 1000, // 2 minutos
}

/**
 * Normaliza un destino recibido de la API
 * @param {Object} destino - Destino recibido de la API
 * @returns {Object} - Destino normalizado para el frontend
 */
const normalizeDestino = (destino) => {
  if (!destino) return null

  return {
    id: destino.ID || destino.id,
    nombre: destino.NOMBRE || destino.nombre,
    tipo: destino.TIPO || destino.tipo,
    descripcion: destino.DESCRIPCION || destino.descripcion,
    distanciaTierra: destino.DISTANCIA_TIERRA || destino.distanciaTierra,
    tiempoViaje: destino.TIEMPO_VIAJE || destino.tiempoViaje,
    detalles:
      typeof destino.DETALLES === "string" ? JSON.parse(destino.DETALLES) : destino.DETALLES || destino.detalles || {},
    gravedad: destino.GRAVEDAD || destino.gravedad,
    atmosfera: destino.ATMOSFERA || destino.atmosfera,
    temperatura: destino.TEMPERATURA || destino.temperatura,
    imagenes: destino.imagenes || [],
    actividades: destino.actividades || [],
    createdAt: destino.CREATED_AT || destino.createdAt,
    updatedAt: destino.UPDATED_AT || destino.updatedAt,
  }
}

/**
 * Prepara un destino para enviarlo a la API
 * @param {Object} destino - Destino normalizado del frontend
 * @returns {Object} - Destino preparado para la API
 */
const prepareDestinoForApi = (destino) => {
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
 * Servicio unificado de destinos con caché integrado
 */
export const destinosService = {
  /**
   * Obtiene todos los destinos (con caché)
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise<Array>} - Lista de destinos normalizada
   */
  async getAll(params = {}) {
    const cacheKey = `destinos:all:${JSON.stringify(params)}`

    try {
      // Intentar obtener de caché
      const cached = cacheService.get(cacheKey)
      if (cached) return cached

      // Si no está en caché, obtener de API
      const response = await apiService.get(ENDPOINTS.BASE, params)

      let destinos = []
      if (response && response.records) {
        destinos = response.records.map(normalizeDestino)
        // Guardar en caché
        cacheService.set(cacheKey, destinos, CACHE_TTL.LISTA)
      }

      return destinos
    } catch (error) {
      console.error("Error al obtener destinos:", error)
      throw error
    }
  },

  /**
   * Obtiene un destino por su ID (con caché)
   * @param {number|string} id - ID del destino
   * @returns {Promise<Object>} - Destino normalizado
   */
  async getById(id) {
    const cacheKey = `destinos:${id}`

    try {
      // Intentar obtener de caché
      const cached = cacheService.get(cacheKey)
      if (cached) return cached

      // Si no está en caché, obtener de API
      const response = await apiService.get(ENDPOINTS.DETALLE(id))
      const destino = normalizeDestino(response)

      // Guardar en caché
      cacheService.set(cacheKey, destino, CACHE_TTL.DETALLE)

      return destino
    } catch (error) {
      console.error(`Error al obtener destino ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene los destinos populares (con caché)
   * @returns {Promise<Array>} - Lista de destinos populares normalizada
   */
  async getPopulares() {
    const cacheKey = "destinos:populares"

    try {
      // Intentar obtener de caché
      const cached = cacheService.get(cacheKey)
      if (cached) return cached

      // Si no está en caché, obtener de API
      const response = await apiService.get(ENDPOINTS.POPULARES)

      let destinos = []
      if (response && response.records) {
        destinos = response.records.map(normalizeDestino)
        // Guardar en caché
        cacheService.set(cacheKey, destinos, CACHE_TTL.LISTA)
      }

      return destinos
    } catch (error) {
      console.error("Error al obtener destinos populares:", error)
      throw error
    }
  },

  /**
   * Busca destinos por término (con caché)
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} - Lista de destinos normalizada
   */
  async buscar(query) {
    const cacheKey = `destinos:buscar:${query}`

    try {
      // Para búsquedas cortas, no usar caché
      if (query.length < 3) {
        const response = await apiService.get(ENDPOINTS.BUSCAR, { q: query })
        return response && response.records ? response.records.map(normalizeDestino) : []
      }

      // Intentar obtener de caché
      const cached = cacheService.get(cacheKey)
      if (cached) return cached

      // Si no está en caché, obtener de API
      const response = await apiService.get(ENDPOINTS.BUSCAR, { q: query })

      let destinos = []
      if (response && response.records) {
        destinos = response.records.map(normalizeDestino)
        // Guardar en caché
        cacheService.set(cacheKey, destinos, CACHE_TTL.BUSQUEDA)
      }

      return destinos
    } catch (error) {
      console.error("Error al buscar destinos:", error)
      throw error
    }
  },

  /**
   * Crea un nuevo destino
   * @param {Object} destino - Datos del destino
   * @returns {Promise<Object>} - Respuesta de la API
   */
  async crear(destino) {
    try {
      const apiData = prepareDestinoForApi(destino)
      const response = await apiService.post(ENDPOINTS.BASE, apiData)

      // Invalidar caché
      cacheService.clear("destinos:all")
      cacheService.clear("destinos:populares")

      return response
    } catch (error) {
      console.error("Error al crear destino:", error)
      throw error
    }
  },

  /**
   * Actualiza un destino existente
   * @param {number|string} id - ID del destino
   * @param {Object} destino - Datos actualizados del destino
   * @returns {Promise<Object>} - Respuesta de la API
   */
  async actualizar(id, destino) {
    try {
      const apiData = prepareDestinoForApi({ ...destino, id })
      const response = await apiService.put(ENDPOINTS.DETALLE(id), apiData)

      // Invalidar caché
      cacheService.remove(`destinos:${id}`)
      cacheService.clear("destinos:all")
      cacheService.clear("destinos:populares")
      cacheService.clear("destinos:buscar")

      return response
    } catch (error) {
      console.error(`Error al actualizar destino ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un destino
   * @param {number|string} id - ID del destino
   * @returns {Promise<Object>} - Respuesta de la API
   */
  async eliminar(id) {
    try {
      const response = await apiService.delete(ENDPOINTS.DETALLE(id))

      // Invalidar caché
      cacheService.remove(`destinos:${id}`)
      cacheService.clear("destinos:all")
      cacheService.clear("destinos:populares")
      cacheService.clear("destinos:buscar")

      return response
    } catch (error) {
      console.error(`Error al eliminar destino ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene las imágenes de un destino
   * @param {number|string} id - ID del destino
   * @returns {Promise<Array>} - Lista de imágenes
   */
  async getImagenes(id) {
    const cacheKey = `destinos:${id}:imagenes`

    try {
      // Intentar obtener de caché
      const cached = cacheService.get(cacheKey)
      if (cached) return cached

      // Si no está en caché, obtener de API
      const response = await apiService.get(ENDPOINTS.IMAGENES(id))

      // Guardar en caché
      cacheService.set(cacheKey, response || [], CACHE_TTL.DETALLE)

      return response || []
    } catch (error) {
      console.error(`Error al obtener imágenes del destino ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene las actividades de un destino
   * @param {number|string} id - ID del destino
   * @returns {Promise<Array>} - Lista de actividades
   */
  async getActividades(id) {
    const cacheKey = `destinos:${id}:actividades`

    try {
      // Intentar obtener de caché
      const cached = cacheService.get(cacheKey)
      if (cached) return cached

      // Si no está en caché, obtener de API
      const response = await apiService.get(ENDPOINTS.ACTIVIDADES(id))

      // Guardar en caché
      cacheService.set(cacheKey, response || [], CACHE_TTL.DETALLE)

      return response || []
    } catch (error) {
      console.error(`Error al obtener actividades del destino ${id}:`, error)
      throw error
    }
  },

  // Métodos para gestión de caché

  /**
   * Limpia toda la caché de destinos
   */
  clearCache() {
    cacheService.clear("destinos:")
  },

  /**
   * Limpia la caché de un destino específico
   * @param {number|string} id - ID del destino
   */
  clearCacheForDestino(id) {
    cacheService.remove(`destinos:${id}`)
    cacheService.remove(`destinos:${id}:imagenes`)
    cacheService.remove(`destinos:${id}:actividades`)
  },
}

export default destinosService
