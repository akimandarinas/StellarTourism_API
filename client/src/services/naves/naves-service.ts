/**
 * Servicio para gestionar naves espaciales
 */
import { BaseService } from "../base-service"
import { apiClient } from "../api/client"
import { withErrorHandling } from "../../utils/api-error-handler"
import type { ApiRequestOptions } from "../../types/api"

// Tipos para el servicio de naves
export interface Nave {
  id: number | string
  nombre: string
  descripcion: string
  imagen: string
  tipo: string
  capacidad: number
  velocidad: number
  autonomia: number
  precio: number
  disponible: boolean
  created_at: string
  updated_at: string
}

export interface NaveFiltros {
  tipo?: string
  capacidad_min?: number
  capacidad_max?: number
  precio_min?: number
  precio_max?: number
  disponible?: boolean
  ordenar_por?: string
  orden?: "asc" | "desc"
  busqueda?: string
}

/**
 * Servicio para gestionar naves
 */
export class NavesService extends BaseService<Nave> {
  constructor() {
    super({
      resourceName: "naves",
      cacheTTL: 15 * 60 * 1000, // 15 minutos
      cacheOptions: {
        maxSize: 50,
        persistToStorage: true,
      },
    })
  }

  /**
   * Busca naves por término
   * @param query Término de búsqueda
   * @param options Opciones de consulta
   * @returns Resultados de búsqueda
   */
  search = withErrorHandling(async (query: string, options: ApiRequestOptions = {}): Promise<Nave[]> => {
    if (!query) return this.getAll(options)

    const cacheKey = `search:${query}:${JSON.stringify(options)}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await apiClient.get<Nave[]>(`/${this.resourceName}/buscar`, {
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
   * Obtiene naves disponibles para un destino y fechas
   * @param destinoId ID del destino
   * @param fechaInicio Fecha de inicio
   * @param fechaFin Fecha de fin
   * @param options Opciones de consulta
   * @returns Naves disponibles
   */
  getDisponibles = withErrorHandling(
    async (
      destinoId: number | string,
      fechaInicio: string,
      fechaFin: string,
      options: ApiRequestOptions = {},
    ): Promise<Nave[]> => {
      if (!destinoId) throw new Error("ID de destino requerido")
      if (!fechaInicio || !fechaFin) throw new Error("Fechas requeridas")

      const response = await apiClient.get<Nave[]>(`/${this.resourceName}/disponibles`, {
        ...options,
        params: {
          ...options.params,
          destino_id: destinoId,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        },
        skipCache: true, // Siempre obtener datos frescos para disponibilidad
      })

      return response.data || []
    },
  )

  /**
   * Obtiene los tipos de nave disponibles
   * @param options Opciones de consulta
   * @returns Tipos de nave
   */
  getTypes = withErrorHandling(async (options: ApiRequestOptions = {}): Promise<string[]> => {
    const cacheKey = `types`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await apiClient.get<string[]>(`/${this.resourceName}/tipos`, options)
    const data = response.data || []

    if (this.enableCache) {
      await this.cache.set(cacheKey, data, 60 * 60 * 1000) // 1 hora para tipos
    }

    return data
  })
}

// Exportar instancia singleton
export const navesService = new NavesService()
