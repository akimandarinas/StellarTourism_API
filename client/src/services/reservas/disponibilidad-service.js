/**
 * Servicio para validación en tiempo real de disponibilidad
 * Maneja la verificación de disponibilidad de fechas, asientos y recursos
 */
import { apiService } from "../api"
import { createCacheClient } from "../cache"

// Cliente de caché con TTL corto para datos de disponibilidad (2 minutos)
const disponibilidadCache = createCacheClient("disponibilidad", 2 * 60 * 1000)

// Endpoints
const ENDPOINTS = {
  VERIFICAR_FECHA: "/disponibilidad/fecha",
  VERIFICAR_ASIENTOS: "/disponibilidad/asientos",
  RESERVA_TEMPORAL: "/disponibilidad/reserva-temporal",
  LIBERAR_RESERVA: "/disponibilidad/liberar",
}

/**
 * Verifica la disponibilidad de una fecha para un destino y nave específicos
 * @param {Object} params - Parámetros de consulta
 * @returns {Promise<Object>} Resultado de disponibilidad
 */
export async function verificarDisponibilidadFecha({ destinoId, naveId, fecha }) {
  if (!destinoId || !naveId || !fecha) {
    throw new Error("Parámetros incompletos para verificar disponibilidad de fecha")
  }

  const cacheKey = `fecha_${destinoId}_${naveId}_${fecha}`

  try {
    // Intentar obtener de caché primero
    return await disponibilidadCache.getOrSet(cacheKey, async () => {
      const response = await apiService.get(ENDPOINTS.VERIFICAR_FECHA, {
        params: { destinoId, naveId, fecha },
      })
      return response.data
    })
  } catch (error) {
    console.error("Error al verificar disponibilidad de fecha:", error)
    throw error
  }
}

/**
 * Verifica la disponibilidad de asientos para una nave en una fecha específica
 * @param {Object} params - Parámetros de consulta
 * @returns {Promise<Array>} Lista de asientos con su disponibilidad
 */
export async function verificarDisponibilidadAsientos({ naveId, fecha, tipoCabina }) {
  if (!naveId || !fecha) {
    throw new Error("Parámetros incompletos para verificar disponibilidad de asientos")
  }

  const cacheKey = `asientos_${naveId}_${fecha}_${tipoCabina || "todos"}`

  try {
    // Usar caché con TTL muy corto para datos de asientos (30 segundos)
    return await disponibilidadCache.getOrSet(
      cacheKey,
      async () => {
        const response = await apiService.get(ENDPOINTS.VERIFICAR_ASIENTOS, {
          params: { naveId, fecha, tipoCabina },
        })
        return response.data
      },
      30 * 1000,
    ) // 30 segundos TTL
  } catch (error) {
    console.error("Error al verificar disponibilidad de asientos:", error)
    throw error
  }
}

/**
 * Crea una reserva temporal para mantener recursos bloqueados durante el proceso de reserva
 * @param {Object} datos - Datos de la reserva temporal
 * @returns {Promise<Object>} Datos de la reserva temporal creada
 */
export async function crearReservaTemporal(datos) {
  if (!datos.destinoId || !datos.naveId || !datos.fecha) {
    throw new Error("Datos incompletos para crear reserva temporal")
  }

  try {
    const response = await apiService.post(ENDPOINTS.RESERVA_TEMPORAL, datos)
    return response.data
  } catch (error) {
    console.error("Error al crear reserva temporal:", error)
    throw error
  }
}

/**
 * Actualiza una reserva temporal existente
 * @param {string} reservaId - ID de la reserva temporal
 * @param {Object} datos - Nuevos datos para la reserva
 * @returns {Promise<Object>} Datos actualizados de la reserva temporal
 */
export async function actualizarReservaTemporal(reservaId, datos) {
  if (!reservaId) {
    throw new Error("ID de reserva temporal requerido")
  }

  try {
    const response = await apiService.put(`${ENDPOINTS.RESERVA_TEMPORAL}/${reservaId}`, datos)
    return response.data
  } catch (error) {
    console.error("Error al actualizar reserva temporal:", error)
    throw error
  }
}

/**
 * Libera una reserva temporal
 * @param {string} reservaId - ID de la reserva temporal
 * @returns {Promise<boolean>} True si se liberó correctamente
 */
export async function liberarReservaTemporal(reservaId) {
  if (!reservaId) {
    throw new Error("ID de reserva temporal requerido")
  }

  try {
    await apiService.delete(`${ENDPOINTS.LIBERAR}/${reservaId}`)
    return true
  } catch (error) {
    console.error("Error al liberar reserva temporal:", error)
    return false
  }
}

/**
 * Invalida la caché de disponibilidad para una fecha específica
 * @param {Object} params - Parámetros para identificar la caché a invalidar
 */
export function invalidarCacheDisponibilidad({ destinoId, naveId, fecha, tipoCabina }) {
  if (destinoId && naveId && fecha) {
    disponibilidadCache.delete(`fecha_${destinoId}_${naveId}_${fecha}`)
  }

  if (naveId && fecha) {
    disponibilidadCache.delete(`asientos_${naveId}_${fecha}_${tipoCabina || "todos"}`)
  }
}

/**
 * Simula la verificación de disponibilidad (para desarrollo/pruebas)
 * @param {Object} params - Parámetros de consulta
 * @returns {Promise<Object>} Resultado simulado de disponibilidad
 */
export async function simularVerificacionDisponibilidad(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const disponible = Math.random() > 0.2 // 80% de probabilidad de disponibilidad
      resolve({
        disponible,
        plazasDisponibles: disponible ? Math.floor(Math.random() * 50) + 1 : 0,
        mensaje: disponible ? "Fecha disponible" : "Lo sentimos, no hay disponibilidad para la fecha seleccionada",
      })
    }, 500) // Simular latencia de red
  })
}

export default {
  verificarDisponibilidadFecha,
  verificarDisponibilidadAsientos,
  crearReservaTemporal,
  actualizarReservaTemporal,
  liberarReservaTemporal,
  invalidarCacheDisponibilidad,
  simularVerificacionDisponibilidad,
}
