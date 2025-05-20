import { apiClient } from "../api/client"
import { createCacheClient } from "../cache"
import { withErrorHandling } from "../../utils/api-error-handler"

/**
 * Servicio para gestionar reservas
 */
const reservasService = () => {
  // Crear cliente de caché para reservas con TTL de 2 minutos
  const cache = createCacheClient("reservas", {
    defaultTTL: 2 * 60 * 1000,
    maxSize: 50,
    persistToStorage: true,
    versionKey: "reservas_v1",
  })

  // Prefijos para diferentes tipos de consultas
  const CACHE_PREFIXES = {
    ALL: "all",
    DETAIL: "detail",
    USER: "user",
    STATS: "stats",
  }

  /**
   * Obtiene todas las reservas
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} - Reservas y metadatos
   */
  const getAll = withErrorHandling(async (options = {}) => {
    const { page = 1, limit = 10, ...filters } = options

    // Las reservas son datos sensibles y cambiantes, no cacheamos la lista completa
    const response = await apiClient.get("/reservas", {
      params: { page, limit, ...filters },
    })

    return {
      data: response.data || [],
      meta: {
        total: response.meta?.total || 0,
        totalPages: response.meta?.totalPages || 1,
        currentPage: page,
      },
    }
  })

  /**
   * Obtiene una reserva por su ID
   * @param {string|number} id - ID de la reserva
   * @returns {Promise<Object>} - Reserva
   */
  const getById = withErrorHandling(async (id) => {
    if (!id) throw new Error("ID de reserva requerido")

    // Generar clave de caché
    const cacheKey = `${CACHE_PREFIXES.DETAIL}:${id}`

    return cache.getOrSet(cacheKey, async () => {
      const response = await apiClient.get(`/reservas/${id}`)
      return response.data
    })
  })

  /**
   * Obtiene las reservas de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} - Reservas del usuario
   */
  const getUserReservas = withErrorHandling(async (userId) => {
    if (!userId) throw new Error("ID de usuario requerido")

    // Generar clave de caché
    const cacheKey = `${CACHE_PREFIXES.USER}:${userId}`

    return cache.getOrSet(cacheKey, async () => {
      const response = await apiClient.get(`/usuarios/${userId}/reservas`)
      return response.data
    })
  })

  /**
   * Crea una nueva reserva
   * @param {Object} data - Datos de la reserva
   * @returns {Promise<Object>} - Reserva creada
   */
  const create = withErrorHandling(async (data) => {
    const response = await apiClient.post("/reservas", data)

    // Invalidar caché de usuario
    if (data.userId || data.ID_USUARIO) {
      invalidateUserReservas(data.userId || data.ID_USUARIO)
    }

    return response.data
  })

  /**
   * Actualiza una reserva
   * @param {string|number} id - ID de la reserva
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Reserva actualizada
   */
  const update = withErrorHandling(async (id, data) => {
    if (!id) throw new Error("ID de reserva requerido")

    const response = await apiClient.put(`/reservas/${id}`, data)

    // Invalidar caché
    invalidateReserva(id)

    // Si tiene userId, invalidar caché de usuario
    if (data.userId || data.ID_USUARIO) {
      invalidateUserReservas(data.userId || data.ID_USUARIO)
    }

    return response.data
  })

  /**
   * Actualiza el estado de una reserva
   * @param {string|number} id - ID de la reserva
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object>} - Reserva actualizada
   */
  const updateStatus = withErrorHandling(async (id, status) => {
    if (!id) throw new Error("ID de reserva requerido")
    if (!status) throw new Error("Estado requerido")

    const response = await apiClient.patch(`/reservas/${id}/estado`, {
      estado: status,
    })

    // Invalidar caché
    invalidateReserva(id)

    return response.data
  })

  /**
   * Elimina una reserva
   * @param {string|number} id - ID de la reserva
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  const deleteReserva = withErrorHandling(async (id) => {
    if (!id) throw new Error("ID de reserva requerido")

    await apiClient.delete(`/reservas/${id}`)

    // Invalidar caché
    invalidateReserva(id)

    return true
  })

  /**
   * Verifica la disponibilidad para una reserva
   * @param {Object} params - Parámetros de disponibilidad
   * @returns {Promise<Object>} - Información de disponibilidad
   */
  const checkDisponibilidad = withErrorHandling(async (params) => {
    if (!params.fechaInicio || !params.fechaFin) {
      throw new Error("Fechas requeridas para verificar disponibilidad")
    }

    const response = await apiClient.get("/reservas/disponibilidad", {
      params,
      skipCache: true, // Siempre obtener datos frescos para disponibilidad
    })

    return response.data
  })

  /**
   * Obtiene estadísticas de reservas
   * @param {Object} params - Parámetros para las estadísticas
   * @returns {Promise<Object>} - Estadísticas de reservas
   */
  const getStats = withErrorHandling(async (params = {}) => {
    // Generar clave de caché
    const cacheKey = `${CACHE_PREFIXES.STATS}:${JSON.stringify(params)}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        const response = await apiClient.get("/reservas/estadisticas", {
          params,
        })
        return response.data
      },
      5 * 60 * 1000, // 5 minutos de caché para estadísticas
    )
  })

  /**
   * Invalida la caché para una reserva específica
   * @param {string|number} id - ID de la reserva
   */
  const invalidateReserva = (id) => {
    if (!id) return

    cache.delete(`${CACHE_PREFIXES.DETAIL}:${id}`)
    console.log(`Caché invalidada para reserva ${id}`)
  }

  /**
   * Invalida la caché de reservas de un usuario
   * @param {string} userId - ID del usuario
   */
  const invalidateUserReservas = (userId) => {
    if (!userId) return

    cache.delete(`${CACHE_PREFIXES.USER}:${userId}`)
    console.log(`Caché invalidada para reservas del usuario ${userId}`)
  }

  /**
   * Invalida toda la caché de reservas
   */
  const invalidateAll = () => {
    cache.clear()
    console.log("Toda la caché de reservas ha sido invalidada")
  }

  return {
    getAll,
    getById,
    getUserReservas,
    create,
    update,
    updateStatus,
    delete: deleteReserva,
    checkDisponibilidad,
    getStats,
    invalidateReserva,
    invalidateUserReservas,
    invalidateAll,
  }
}

// Exportar una instancia del servicio para uso general
export default reservasService()

// Exportar la función factory para casos donde se necesite una instancia personalizada
export { reservasService }
