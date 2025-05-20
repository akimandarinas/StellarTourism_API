/**
 * Servicio base que implementa patrones comunes para todos los servicios de negocio
 */
import { apiClient } from "./api/client"
import { createCacheClient } from "./cache"
import { withErrorHandling } from "../utils/api-error-handler"
import type { ApiRequestOptions, Result } from "../types/api"

export interface BaseServiceOptions {
  /** Nombre del recurso para las rutas de API */
  resourceName: string
  /** Tiempo de vida del caché en milisegundos */
  cacheTTL?: number
  /** Habilitar caché */
  enableCache?: boolean
  /** Prefijo para las claves de caché */
  cachePrefix?: string
  /** Opciones adicionales para el cliente de caché */
  cacheOptions?: Record<string, any>
}

/**
 * Clase base para servicios de negocio
 */
export class BaseService<T extends { id: string | number }> {
  protected resourceName: string
  protected cache: any
  protected enableCache: boolean

  constructor(options: BaseServiceOptions) {
    this.resourceName = options.resourceName
    this.enableCache = options.enableCache !== false

    if (this.enableCache) {
      this.cache = createCacheClient(options.cachePrefix || options.resourceName, {
        defaultTTL: options.cacheTTL || 5 * 60 * 1000, // 5 minutos por defecto
        ...options.cacheOptions,
      })
    }
  }

  /**
   * Obtiene todos los recursos
   * @param options Opciones de consulta
   * @returns Lista de recursos
   */
  getAll = withErrorHandling(async (options: ApiRequestOptions = {}): Promise<T[]> => {
    const cacheKey = `all:${JSON.stringify(options)}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await apiClient.get<T[]>(`/${this.resourceName}`, options)
    const data = response.data || []

    if (this.enableCache) {
      await this.cache.set(cacheKey, data)
    }

    return data
  })

  /**
   * Obtiene un recurso por ID
   * @param id ID del recurso
   * @param options Opciones de consulta
   * @returns Recurso
   */
  getById = withErrorHandling(async (id: string | number, options: ApiRequestOptions = {}): Promise<T> => {
    if (!id) throw new Error(`ID de ${this.resourceName} requerido`)

    const cacheKey = `detail:${id}`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await apiClient.get<T>(`/${this.resourceName}/${id}`, options)
    const data = response.data as T

    if (this.enableCache && data) {
      await this.cache.set(cacheKey, data)
    }

    return data
  })

  /**
   * Crea un nuevo recurso
   * @param data Datos del recurso
   * @param options Opciones de consulta
   * @returns Recurso creado
   */
  create = withErrorHandling(async (data: Partial<T>, options: ApiRequestOptions = {}): Promise<T> => {
    const response = await apiClient.post<T>(`/${this.resourceName}`, data, options)
    const createdData = response.data as T

    if (this.enableCache) {
      // Invalidar caché de listados
      await this.cache.clearByPrefix("all:")
    }

    return createdData
  })

  /**
   * Actualiza un recurso existente
   * @param id ID del recurso
   * @param data Datos a actualizar
   * @param options Opciones de consulta
   * @returns Recurso actualizado
   */
  update = withErrorHandling(
    async (id: string | number, data: Partial<T>, options: ApiRequestOptions = {}): Promise<T> => {
      if (!id) throw new Error(`ID de ${this.resourceName} requerido`)

      const response = await apiClient.put<T>(`/${this.resourceName}/${id}`, data, options)
      const updatedData = response.data as T

      if (this.enableCache) {
        // Invalidar caché específica y listados
        await this.cache.delete(`detail:${id}`)
        await this.cache.clearByPrefix("all:")
      }

      return updatedData
    },
  )

  /**
   * Elimina un recurso
   * @param id ID del recurso
   * @param options Opciones de consulta
   * @returns true si se eliminó correctamente
   */
  delete = withErrorHandling(async (id: string | number, options: ApiRequestOptions = {}): Promise<boolean> => {
    if (!id) throw new Error(`ID de ${this.resourceName} requerido`)

    await apiClient.delete(`/${this.resourceName}/${id}`, options)

    if (this.enableCache) {
      // Invalidar caché específica y listados
      await this.cache.delete(`detail:${id}`)
      await this.cache.clearByPrefix("all:")
    }

    return true
  })

  /**
   * Versión de getAll que devuelve un Result
   * @param options Opciones de consulta
   * @returns Result con datos o error
   */
  getAllResult = async (options: ApiRequestOptions = {}): Promise<Result<T[]>> => {
    try {
      const data = await this.getAll(options)
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    }
  }

  /**
   * Versión de getById que devuelve un Result
   * @param id ID del recurso
   * @param options Opciones de consulta
   * @returns Result con datos o error
   */
  getByIdResult = async (id: string | number, options: ApiRequestOptions = {}): Promise<Result<T>> => {
    try {
      const data = await this.getById(id, options)
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    }
  }

  /**
   * Limpia toda la caché del servicio
   */
  clearCache = async (): Promise<void> => {
    if (this.enableCache) {
      await this.cache.clear()
    }
  }
}
