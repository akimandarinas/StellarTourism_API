import { api } from "../api/client"
import type { ApiRequestOptions } from "../../types/api"

// Tipos para el servicio de reservas
export interface Reserva {
  id: number | string
  userId: string
  destinoId: number | string
  naveId: number | string
  fechaViaje: string
  fechaRegreso: string
  precio: number
  estado: "pendiente" | "confirmada" | "cancelada" | "completada"
  pasajeros: number
  motivoCancelacion?: string
  created_at: string
  updated_at: string
}

export interface ReservaCreateData {
  destinoId: number | string
  naveId: number | string
  fechaViaje: string
  fechaRegreso: string
  precio: number
  pasajeros: number
}

export interface DisponibilidadParams {
  destinoId?: number | string
  naveId?: number | string
  fechaInicio: string
  fechaFin: string
}

export interface DisponibilidadResponse {
  disponible: boolean
  plazasDisponibles: number
  navesDisponibles?: Array<{
    id: number | string
    nombre: string
    plazasDisponibles: number
  }>
}

/**
 * Servicio para gestionar reservas
 */
export class ReservasService {
  private resourceName = "reservas"
  private enableCache = true
  private cache = {
    get: async (key: string) => null,
    set: async (key: string, data: any) => {},
    delete: async (key: string) => {},
    clearByPrefix: async (prefix: string) => {},
  }

  /**
   * Obtiene las reservas de un usuario
   * @param userId ID del usuario
   * @param options Opciones de consulta
   * @returns Reservas del usuario
   */
  async getUserReservas(userId: string, options: ApiRequestOptions = {}): Promise<Reserva[]> {
    if (!userId) throw new Error("ID de usuario requerido")

    const cacheKey = `user:${userId}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await api.get<Reserva[]>(`/usuarios/${userId}/reservas`, options)
    const data = response.data || []

    if (this.enableCache) {
      await this.cache.set(cacheKey, data)
    }

    return data
  }

  /**
   * Actualiza el estado de una reserva
   * @param id ID de la reserva
   * @param estado Nuevo estado
   * @param motivo Motivo de cancelación (opcional)
   * @param options Opciones de consulta
   * @returns Reserva actualizada
   */
  async updateStatus(
    id: string | number,
    estado: Reserva["estado"],
    motivo?: string,
    options: ApiRequestOptions = {},
  ): Promise<Reserva> {
    if (!id) throw new Error("ID de reserva requerido")
    if (!estado) throw new Error("Estado requerido")

    const response = await api.patch<Reserva>(
      `/${this.resourceName}/${id}/estado`,
      {
        estado,
        motivoCancelacion: motivo,
      },
      options,
    )

    const updatedData = response.data as Reserva

    if (this.enableCache) {
      // Invalidar caché específica y listados
      await this.cache.delete(`detail:${id}`)
      await this.cache.clearByPrefix("all:")
      await this.cache.clearByPrefix("user:")
    }

    return updatedData
  }

  /**
   * Verifica la disponibilidad para una reserva
   * @param params Parámetros de disponibilidad
   * @param options Opciones de consulta
   * @returns Información de disponibilidad
   */
  async checkDisponibilidad(
    params: DisponibilidadParams,
    options: ApiRequestOptions = {},
  ): Promise<DisponibilidadResponse> {
    if (!params.fechaInicio || !params.fechaFin) {
      throw new Error("Fechas requeridas para verificar disponibilidad")
    }

    const response = await api.get<DisponibilidadResponse>(`/${this.resourceName}/disponibilidad`, {
      ...options,
      params: { ...options.params, ...params },
    })

    return response.data
  }

  /**
   * Obtiene estadísticas de reservas
   * @param params Parámetros para las estadísticas
   * @param options Opciones de consulta
   * @returns Estadísticas de reservas
   */
  async getStats(params = {}, options: ApiRequestOptions = {}): Promise<any> {
    const cacheKey = `stats:${JSON.stringify(params)}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await api.get(`/${this.resourceName}/estadisticas`, {
      ...options,
      params: { ...options.params, ...params },
    })

    const data = response.data

    if (this.enableCache) {
      await this.cache.set(cacheKey, data)
    }

    return data
  }

  /**
   * Invalida la caché de reservas de un usuario
   * @param userId ID del usuario
   */
  async invalidateUserReservas(userId: string): Promise<void> {
    if (!userId || !this.enableCache) return

    await this.cache.delete(`user:${userId}`)
  }
}

// Exportar instancia singleton
export const reservasService = new ReservasService()

// Exportar como default para compatibilidad
export default reservasService
