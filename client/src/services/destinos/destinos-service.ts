/**
 * Servicio para gestionar destinos turísticos
 */
import { BaseService } from "../base-service"
import { apiClient } from "../api/client"
import { withErrorHandling } from "../../utils/api-error-handler"
import type { ApiRequestOptions } from "../../types/api"
import { normalizeDestino, normalizeDestinosResponse } from "../../utils/response-adapter"
import { normalizeQueryParams, normalizePaginationParams } from "../../utils/query-adapter"
import { ResourceType, ResourceAction, getEndpointPath } from "../../config/endpoints"

// Tipos para el servicio de destinos
export interface Destino {
  id: number | string
  nombre: string
  descripcion: string
  imagen: string
  tipo: string
  precio: number
  duracion: number
  distancia: number
  popularidad: number
  destacado: boolean
  created_at: string
  updated_at: string
}

export interface DestinoFiltros {
  tipo?: string
  precio_min?: number
  precio_max?: number
  duracion_min?: number
  duracion_max?: number
  destacado?: boolean
  ordenar_por?: string
  orden?: "asc" | "desc"
  busqueda?: string
}

export interface DestinosResponse {
  data: Destino[]
  meta: {
    total: number
    totalPages: number
    currentPage: number
    perPage: number
  }
}

/**
 * Servicio para gestionar destinos
 */
export class DestinosService extends BaseService<Destino> {
  constructor() {
    super({
      resourceName: ResourceType.DESTINOS,
      cacheTTL: 10 * 60 * 1000, // 10 minutos
      cacheOptions: {
        maxSize: 100,
        persistToStorage: true,
      },
    })
  }

  /**
   * Obtiene todos los destinos con filtros opcionales
   * @param options Opciones de consulta
   * @returns Lista de destinos
   */
  getAll = withErrorHandling(async (options: ApiRequestOptions = {}): Promise<Destino[]> => {
    // Normalizar parámetros de consulta
    if (options.params) {
      options.params = normalizeQueryParams(options.params)
    }

    const cacheKey = `getAll:${JSON.stringify(options)}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    try {
      const endpoint = getEndpointPath(ResourceType.DESTINOS, ResourceAction.LIST)
      const response = await apiClient.get(endpoint, options)

      // Normalizar respuesta
      const result = normalizeDestinosResponse(response.data)
      const destinos = result.data

      if (this.enableCache) {
        await this.cache.set(cacheKey, destinos)
      }

      return destinos
    } catch (error) {
      console.error(`[DestinosService] Error en getAll:`, error)
      throw error
    }
  })

  /**
   * Obtiene un destino por ID
   * @param id ID del destino
   * @param options Opciones de consulta
   * @returns Destino
   */
  getById = withErrorHandling(async (id: string | number, options: ApiRequestOptions = {}): Promise<Destino> => {
    if (!id) throw new Error("ID de destino requerido")

    const cacheKey = `get:${id}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    try {
      const endpoint = getEndpointPath(ResourceType.DESTINOS, ResourceAction.GET, { id })
      const response = await apiClient.get(endpoint, options)

      // Normalizar respuesta
      const destino = normalizeDestino(response.data)

      if (this.enableCache) {
        await this.cache.set(cacheKey, destino)
      }

      return destino
    } catch (error) {
      console.error(`[DestinosService] Error en getById:`, error)
      throw error
    }
  })

  /**
   * Busca destinos por término
   * @param query Término de búsqueda
   * @param page Página actual
   * @param limit Límite de resultados por página
   * @param options Opciones de consulta
   * @returns Resultados de búsqueda paginados
   */
  search = withErrorHandling(
    async (query: string, page = 1, limit = 10, options: ApiRequestOptions = {}): Promise<DestinosResponse> => {
      if (!query) {
        const data = await this.getAll(options)
        return {
          data,
          meta: {
            total: data.length,
            totalPages: 1,
            currentPage: 1,
            perPage: data.length,
          },
        }
      }

      // Normalizar parámetros
      const paginationParams = normalizePaginationParams(page, limit)
      const queryParams = normalizeQueryParams({ ...options.params, q: query })
      const params = { ...paginationParams, ...queryParams }

      const cacheKey = `search:${query}:${JSON.stringify(params)}`

      if (this.enableCache) {
        const cached = await this.cache.get(cacheKey)
        if (cached) return cached
      }

      try {
        const endpoint = getEndpointPath(ResourceType.DESTINOS, ResourceAction.SEARCH)
        const response = await apiClient.get(endpoint, {
          ...options,
          params,
        })

        // Normalizar respuesta
        const result = normalizeDestinosResponse(response.data)

        if (this.enableCache) {
          await this.cache.set(cacheKey, result, 5 * 60 * 1000) // 5 minutos para búsquedas
        }

        return result
      } catch (error) {
        console.error(`[DestinosService] Error en search:`, error)
        throw error
      }
    },
  )

  /**
   * Obtiene destinos destacados
   * @param limit Límite de resultados
   * @param options Opciones de consulta
   * @returns Destinos destacados
   */
  getFeatured = withErrorHandling(async (limit = 4, options: ApiRequestOptions = {}): Promise<Destino[]> => {
    const cacheKey = `featured:${limit}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    try {
      const endpoint = getEndpointPath(ResourceType.DESTINOS, "destacados")
      const response = await apiClient.get(endpoint, {
        ...options,
        params: normalizeQueryParams({ ...options.params, limit }),
      })

      // Normalizar respuesta
      const result = normalizeDestinosResponse(response.data)
      const destinos = result.data

      if (this.enableCache) {
        await this.cache.set(cacheKey, destinos, 15 * 60 * 1000) // 15 minutos para destacados
      }

      return destinos
    } catch (error) {
      console.error(`[DestinosService] Error en getFeatured:`, error)
      throw error
    }
  })

  /**
   * Obtiene destinos relacionados a un destino
   * @param id ID del destino
   * @param limit Límite de resultados
   * @param options Opciones de consulta
   * @returns Destinos relacionados
   */
  getRelated = withErrorHandling(
    async (id: string | number, limit = 3, options: ApiRequestOptions = {}): Promise<Destino[]> => {
      if (!id) throw new Error("ID de destino requerido")

      const cacheKey = `related:${id}:${limit}`

      if (this.enableCache) {
        const cached = await this.cache.get(cacheKey)
        if (cached) return cached
      }

      try {
        const endpoint = getEndpointPath(ResourceType.DESTINOS, "relacionados", { id })
        const response = await apiClient.get(endpoint, {
          ...options,
          params: normalizeQueryParams({ ...options.params, limit }),
        })

        // Normalizar respuesta
        const result = normalizeDestinosResponse(response.data)
        const destinos = result.data

        if (this.enableCache) {
          await this.cache.set(cacheKey, destinos, 15 * 60 * 1000) // 15 minutos para relacionados
        }

        return destinos
      } catch (error) {
        console.error(`[DestinosService] Error en getRelated:`, error)
        throw error
      }
    },
  )

  /**
   * Obtiene los tipos de destino disponibles
   * @param options Opciones de consulta
   * @returns Tipos de destino
   */
  getTypes = withErrorHandling(async (options: ApiRequestOptions = {}): Promise<string[]> => {
    const cacheKey = `types`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    try {
      const endpoint = getEndpointPath(ResourceType.DESTINOS, "tipos")
      const response = await apiClient.get(endpoint, options)
      const data = response.data || []

      if (this.enableCache) {
        await this.cache.set(cacheKey, data, 60 * 60 * 1000) // 1 hora para tipos
      }

      return data
    } catch (error) {
      console.error(`[DestinosService] Error en getTypes:`, error)
      throw error
    }
  })

  /**
   * Invalida la caché para un destino específico o para todos
   * @param id ID del destino (opcional)
   */
  invalidateCache(id?: string | number): void {
    if (id) {
      // Invalidar solo el destino específico
      this.cache.delete(`get:${id}`)
      // También invalidar listas que podrían contener este destino
      this.cache.deleteByPattern(/^getAll:/)
      this.cache.deleteByPattern(/^search:/)
      this.cache.deleteByPattern(/^featured:/)
    } else {
      // Invalidar toda la caché relacionada con destinos
      this.cache.deleteByPattern(/^get:/)
      this.cache.deleteByPattern(/^getAll:/)
      this.cache.deleteByPattern(/^search:/)
      this.cache.deleteByPattern(/^featured:/)
      this.cache.deleteByPattern(/^related:/)
      this.cache.deleteByPattern(/^types$/)
    }
  }

  /**
   * Precarga datos comunes para mejorar la experiencia de usuario
   */
  preloadCommonData = async (): Promise<void> => {
    try {
      // Verificar si ya tenemos datos en caché antes de hacer solicitudes
      const hasFeaturedCache = await this.cache.has("featured:8")
      const hasTypesCache = await this.cache.has("types")
      const hasDestacadosCache = await this.cache.has("getAll:destacado=true&limit=4")

      // Crear un array de promesas solo para los datos que necesitamos cargar
      const promises = []

      if (!hasFeaturedCache) {
        promises.push(this.getFeatured(8))
      }

      if (!hasTypesCache) {
        promises.push(this.getTypes())
      }

      if (!hasDestacadosCache) {
        promises.push(this.getAll({ params: { destacado: true, limit: 4 } }))
      }

      // Solo hacer solicitudes si hay algo que cargar
      if (promises.length > 0) {
        await Promise.all(promises)
      }
    } catch (error) {
      console.error("[DestinosService] Error en precarga:", error)
    }
  }
}

// Exportar instancia singleton
export const destinosService = new DestinosService()
