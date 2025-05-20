/**
 * Servicio para gestionar notificaciones
 */
import { BaseService } from "../base-service"
import { apiClient } from "../api/client"
import { withErrorHandling } from "../../utils/api-error-handler"
import type { ApiRequestOptions } from "../../types/api"

// Tipos para el servicio de notificaciones
export interface Notificacion {
  id: number | string
  userId: string
  titulo: string
  mensaje: string
  tipo: "info" | "success" | "warning" | "error"
  leida: boolean
  fecha: string
  enlace?: string
  created_at: string
  updated_at: string
}

/**
 * Servicio para gestionar notificaciones
 */
export class NotificacionesService extends BaseService<Notificacion> {
  constructor() {
    super({
      resourceName: "notificaciones",
      cacheTTL: 1 * 60 * 1000, // 1 minuto (datos muy volátiles)
      cacheOptions: {
        maxSize: 50,
        persistToStorage: false, // No persistir notificaciones
      },
    })
  }

  /**
   * Obtiene notificaciones del usuario actual
   * @param options Opciones de consulta
   * @returns Notificaciones del usuario
   */
  getMine = withErrorHandling(async (options: ApiRequestOptions = {}): Promise<Notificacion[]> => {
    const cacheKey = `mine`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await apiClient.get<Notificacion[]>(`/${this.resourceName}/mine`, options)
    const data = response.data || []

    if (this.enableCache) {
      await this.cache.set(cacheKey, data)
    }

    return data
  })

  /**
   * Marca una notificación como leída
   * @param id ID de la notificación
   * @param options Opciones de consulta
   * @returns Notificación actualizada
   */
  markAsRead = withErrorHandling(
    async (id: number | string, options: ApiRequestOptions = {}): Promise<Notificacion> => {
      if (!id) throw new Error("ID de notificación requerido")

      const response = await apiClient.patch<Notificacion>(`/${this.resourceName}/${id}/read`, {}, options)
      const updatedData = response.data as Notificacion

      if (this.enableCache) {
        // Invalidar caché específica y listados
        await this.cache.delete(`detail:${id}`)
        await this.cache.delete(`mine`)
      }

      return updatedData
    },
  )

  /**
   * Marca todas las notificaciones como leídas
   * @param options Opciones de consulta
   * @returns true si se marcaron correctamente
   */
  markAllAsRead = withErrorHandling(async (options: ApiRequestOptions = {}): Promise<boolean> => {
    await apiClient.post(`/${this.resourceName}/mark-all-read`, {}, options)

    if (this.enableCache) {
      // Invalidar caché
      await this.cache.delete(`mine`)
    }

    return true
  })

  /**
   * Elimina todas las notificaciones leídas
   * @param options Opciones de consulta
   * @returns true si se eliminaron correctamente
   */
  deleteAllRead = withErrorHandling(async (options: ApiRequestOptions = {}): Promise<boolean> => {
    await apiClient.delete(`/${this.resourceName}/read`, options)

    if (this.enableCache) {
      // Invalidar caché
      await this.cache.delete(`mine`)
    }

    return true
  })
}

// Exportar instancia singleton
export const notificacionesService = new NotificacionesService()
