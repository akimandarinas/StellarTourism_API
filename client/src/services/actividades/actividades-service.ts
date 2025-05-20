/**
 * Servicio para gestionar actividades turísticas
 */
import { BaseService } from "../base-service"
import { apiClient } from "../api/client"
import { withErrorHandling } from "../../utils/api-error-handler"
import type { ApiRequestOptions } from "../../types/api"

// Tipos para el servicio de actividades
export interface Actividad {
  id: number | string
  nombre: string
  descripcion: string
  imagen: string
  destinoId: number | string
  duracion: number
  precio: number
  dificultad: "baja" | "media" | "alta"
  incluido: string[]
  disponible: boolean
  created_at: string
  updated_at: string
}

export interface ActividadFiltros {
  destinoId?: number | string
  dificultad?: string
  precio_min?: number
  precio_max?: number
  duracion_min?: number
  duracion_max?: number
  disponible?: boolean
  ordenar_por?: string
  orden?: "asc" | "desc"
  busqueda?: string
}

/**
 * Servicio para gestionar actividades
 */
export class ActividadesService extends BaseService<Actividad> {
  constructor() {
    super({
      resourceName: "actividades",
      cacheTTL: 10 * 60 * 1000, // 10 minutos
      cacheOptions: {
        maxSize: 50,
        persistToStorage: true,
      },
    })
  }

  /**
   * Obtiene actividades por destino
   * @param destinoId ID del destino
   * @param options Opciones de consulta
   * @returns Actividades del destino
   */
  getByDestino = withErrorHandling(
    async (destinoId: number | string, options: ApiRequestOptions = {}): Promise<Actividad[]> => {
      if (!destinoId) throw new Error("ID de destino requerido")

      const cacheKey = `destino:${destinoId}`

      if (this.enableCache) {
        const cached = await this.cache.get(cacheKey)
        if (cached) return cached
      }

      const response = await apiClient.get<Actividad[]>(`/destinos/${destinoId}/actividades`, options)
      const data = response.data || []

      if (this.enableCache) {
        await this.cache.set(cacheKey, data)
      }

      return data
    },
  )

  /**
   * Busca actividades por término
   * @param query Término de búsqueda
   * @param options Opciones de consulta
   * @returns Resultados de búsqueda
   */
  search = withErrorHandling(async (query: string, options: ApiRequestOptions = {}): Promise<Actividad[]> => {
    if (!query) return this.getAll(options)

    const cacheKey = `search:${query}:${JSON.stringify(options)}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await apiClient.get<Actividad[]>(`/${this.resourceName}/buscar`, {
      ...options,
      params: { ...options.params, q: query },
    })

    const data = response.data || []

    if (this.enableCache) {
      await this.cache.set(cacheKey, data, 5 * 60 * 1000) // 5 minutos para búsquedas
    }

    return data
  })

  /**
   * Obtiene actividades destacadas
   * @param limit Límite de resultados
   * @param options Opciones de consulta
   * @returns Actividades destacadas
   */
  getFeatured = withErrorHandling(async (limit = 4, options: ApiRequestOptions = {}): Promise<Actividad[]> => {
    const cacheKey = `featured:${limit}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await apiClient.get<Actividad[]>(`/${this.resourceName}/destacadas`, {
      ...options,
      params: { ...options.params, limit },
    })

    const data = response.data || []

    if (this.enableCache) {
      await this.cache.set(cacheKey, data, 15 * 60 * 1000) // 15 minutos para destacadas
    }

    return data
  })

  /**
   * Obtiene los niveles de dificultad disponibles
   * @param options Opciones de consulta
   * @returns Niveles de dificultad
   */
  getDifficultyLevels = withErrorHandling(async (options: ApiRequestOptions = {}): Promise<string[]> => {
    const cacheKey = `difficulty_levels`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await apiClient.get<string[]>(`/${this.resourceName}/dificultades`, options)
    const data = response.data || []

    if (this.enableCache) {
      await this.cache.set(cacheKey, data, 60 * 60 * 1000) // 1 hora para niveles de dificultad
    }

    return data
  })
}

// Exportar instancia singleton
export const actividadesService = new ActividadesService()
