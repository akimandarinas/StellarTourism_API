/**
 * Servicio para gestionar reseñas
 */
import { BaseService } from "../base-service"
import { apiClient } from "../api/client"
import { withErrorHandling } from "../../utils/api-error-handler"
import type { ApiRequestOptions } from "../../types/api"

// Tipos para el servicio de reseñas
export interface Resena {
  id: number | string
  userId: string
  destinoId?: number | string
  actividadId?: number | string
  naveId?: number | string
  titulo: string
  contenido: string
  puntuacion: number
  fecha: string
  created_at: string
  updated_at: string
}

export interface ResenaCreateData {
  destinoId?: number | string
  actividadId?: number | string
  naveId?: number | string
  titulo: string
  contenido: string
  puntuacion: number
}

/**
 * Servicio para gestionar reseñas
 */
export class ResenasService extends BaseService<Resena> {
  constructor() {
    super({
      resourceName: "resenas",
      cacheTTL: 10 * 60 * 1000, // 10 minutos
      cacheOptions: {
        maxSize: 50,
        persistToStorage: true,
      },
    })
  }

  /**
   * Obtiene reseñas por destino
   * @param destinoId ID del destino
   * @param options Opciones de consulta
   * @returns Reseñas del destino
   */
  getByDestino = withErrorHandling(
    async (destinoId: number | string, options: ApiRequestOptions = {}): Promise<Resena[]> => {
      if (!destinoId) throw new Error("ID de destino requerido")

      const cacheKey = `destino:${destinoId}`

      if (this.enableCache) {
        const cached = await this.cache.get(cacheKey)
        if (cached) return cached
      }

      const response = await apiClient.get<Resena[]>(`/destinos/${destinoId}/resenas`, options)
      const data = response.data || []

      if (this.enableCache) {
        await this.cache.set(cacheKey, data)
      }

      return data
    },
  )

  /**
   * Obtiene reseñas por actividad
   * @param actividadId ID de la actividad
   * @param options Opciones de consulta
   * @returns Reseñas de la actividad
   */
  getByActividad = withErrorHandling(
    async (actividadId: number | string, options: ApiRequestOptions = {}): Promise<Resena[]> => {
      if (!actividadId) throw new Error("ID de actividad requerido")

      const cacheKey = `actividad:${actividadId}`

      if (this.enableCache) {
        const cached = await this.cache.get(cacheKey)
        if (cached) return cached
      }

      const response = await apiClient.get<Resena[]>(`/actividades/${actividadId}/resenas`, options)
      const data = response.data || []

      if (this.enableCache) {
        await this.cache.set(cacheKey, data)
      }

      return data
    },
  )

  /**
   * Obtiene reseñas por nave
   * @param naveId ID de la nave
   * @param options Opciones de consulta
   * @returns Reseñas de la nave
   */
  getByNave = withErrorHandling(async (naveId: number | string, options: ApiRequestOptions = {}): Promise<Resena[]> => {
    if (!naveId) throw new Error("ID de nave requerido")

    const cacheKey = `nave:${naveId}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await apiClient.get<Resena[]>(`/naves/${naveId}/resenas`, options)
    const data = response.data || []

    if (this.enableCache) {
      await this.cache.set(cacheKey, data)
    }

    return data
  })

  /**
   * Obtiene reseñas por usuario
   * @param userId ID del usuario
   * @param options Opciones de consulta
   * @returns Reseñas del usuario
   */
  getByUsuario = withErrorHandling(async (userId: string, options: ApiRequestOptions = {}): Promise<Resena[]> => {
    if (!userId) throw new Error("ID de usuario requerido")

    const cacheKey = `usuario:${userId}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await apiClient.get<Resena[]>(`/usuarios/${userId}/resenas`, options)
    const data = response.data || []

    if (this.enableCache) {
      await this.cache.set(cacheKey, data)
    }

    return data
  })
}

// Exportar instancia singleton
export const resenasService = new ResenasService()
