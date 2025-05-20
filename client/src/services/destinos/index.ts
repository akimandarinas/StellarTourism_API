import { apiClient } from "../api/client"
import { createCacheClient } from "../cache"
import type { PaginatedResponse, Result } from "../../types/api"
import { withErrorHandling } from "../../utils/api-error-handler"

// Tipos para el servicio de destinos
export interface Destino {
  id: number
  nombre: string
  descripcion: string
  imagen: string
  tipo: string
  precio_base: number
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
  }
}

/**
 * Servicio para gestionar destinos con caché optimizada
 */
export function destinosService() {
  // Configuración de TTL por tipo de datos
  const TTL_CONFIG = {
    DETAIL: 15 * 60 * 1000, // 15 minutos para detalles
    LIST: 5 * 60 * 1000, // 5 minutos para listas
    FEATURED: 10 * 60 * 1000, // 10 minutos para destacados
    SEARCH: 3 * 60 * 1000, // 3 minutos para búsquedas
    RELATED: 15 * 60 * 1000, // 15 minutos para relacionados
    TYPES: 60 * 60 * 1000, // 1 hora para tipos (cambian raramente)
    STATIC: 24 * 60 * 60 * 1000, // 24 horas para datos estáticos
  }

  // Crear cliente de caché para destinos con configuración avanzada
  const cache = createCacheClient("destinos", {
    defaultTTL: TTL_CONFIG.LIST,
    maxSize: 100, // Limitar tamaño de caché
    persistToStorage: true, // Persistir en localStorage
    compressionThreshold: 1024, // Comprimir entradas grandes
    versionKey: "destinos_v1", // Versionar caché para invalidación global
  })

  // Prefijos para diferentes tipos de consultas
  const CACHE_PREFIXES = {
    ALL: "all",
    DETAIL: "detail",
    FEATURED: "featured",
    SEARCH: "search",
    RELATED: "related",
    TYPES: "types",
  }

  // Memoria caché en memoria para consultas frecuentes (LRU)
  const memoryCache = new Map()
  const MAX_MEMORY_CACHE_SIZE = 20

  // Añadir a caché en memoria
  const addToMemoryCache = (key, value) => {
    if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
      // Eliminar la entrada más antigua
      const firstKey = memoryCache.keys().next().value
      memoryCache.delete(firstKey)
    }
    memoryCache.set(key, {
      value,
      timestamp: Date.now(),
    })
  }

  // Obtener de caché en memoria
  const getFromMemoryCache = (key) => {
    if (!memoryCache.has(key)) return null

    const entry = memoryCache.get(key)
    const now = Date.now()

    // Verificar si la entrada ha expirado (TTL de 30 segundos para memoria)
    if (now - entry.timestamp > 30000) {
      memoryCache.delete(key)
      return null
    }

    // Mover al final para implementar LRU
    memoryCache.delete(key)
    memoryCache.set(key, {
      value: entry.value,
      timestamp: now,
    })

    return entry.value
  }

  /**
   * Obtiene todos los destinos con caché optimizada
   * @param options Opciones de consulta
   * @returns Destinos y metadatos
   */
  const getAll = withErrorHandling(
    async (options: DestinoFiltros & { page?: number; limit?: number } = {}): Promise<DestinosResponse> => {
      const { page = 1, limit = 10, ...filters } = options

      // Generar clave de caché
      const cacheKey = `${CACHE_PREFIXES.ALL}:${page}:${limit}:${JSON.stringify(filters)}`

      // Verificar primero en caché de memoria para respuesta ultra rápida
      const memoryCached = getFromMemoryCache(cacheKey)
      if (memoryCached) {
        console.log(`[DestinosService] Usando caché en memoria para: ${cacheKey}`)
        return memoryCached
      }

      // Usar caché persistente con estrategia stale-while-revalidate
      return cache.getOrSet(
        cacheKey,
        async () => {
          console.log(`[DestinosService] Cargando destinos desde API: ${cacheKey}`)
          const response = await apiClient.get<PaginatedResponse<Destino>>("/destinos", {
            params: { page, limit, ...filters } as any,
          })

          const result = {
            data: response.data?.items || [],
            meta: {
              total: response.data?.total || 0,
              totalPages: response.data?.totalPages || 1,
              currentPage: page,
            },
          }

          // Guardar en caché de memoria
          addToMemoryCache(cacheKey, result)

          return result
        },
        TTL_CONFIG.LIST,
        {
          staleWhileRevalidate: true, // Devolver datos antiguos mientras se revalidan
          background: true, // Revalidar en segundo plano
          onError: (error) => {
            console.error(`Error al cargar destinos: ${error.message}`)
            // Extender TTL de caché en caso de error para evitar tormentas de fallos
            return { extendTTL: 60 * 1000 } // Extender 1 minuto
          },
        },
      )
    },
  )

  /**
   * Obtiene un destino por su ID con caché optimizada
   * @param id ID del destino
   * @returns Destino
   */
  const getById = withErrorHandling(async (id: number | string): Promise<Destino> => {
    if (!id) throw new Error("ID de destino requerido")

    // Generar clave de caché
    const cacheKey = `${CACHE_PREFIXES.DETAIL}:${id}`

    // Verificar primero en caché de memoria
    const memoryCached = getFromMemoryCache(cacheKey)
    if (memoryCached) {
      return memoryCached
    }

    return cache.getOrSet(
      cacheKey,
      async () => {
        const response = await apiClient.get<Destino>(`/destinos/${id}`)
        const result = response.data as Destino

        // Guardar en caché de memoria
        addToMemoryCache(cacheKey, result)

        return result
      },
      TTL_CONFIG.DETAIL,
      {
        staleWhileRevalidate: true,
        prefetch: async (cachedData) => {
          // Si el destino está en caché y es popular, prefetch de destinos relacionados
          if (cachedData && cachedData.popularidad > 7) {
            getRelated(id).catch(() => {}) // Ignorar errores en prefetch
          }
        },
      },
    )
  })

  /**
   * Obtiene destinos destacados con caché optimizada
   * @param limit Límite de resultados
   * @returns Destinos destacados
   */
  const getFeatured = withErrorHandling(async (limit = 4): Promise<Destino[]> => {
    // Generar clave de caché
    const cacheKey = `${CACHE_PREFIXES.FEATURED}:${limit}`

    // Verificar primero en caché de memoria
    const memoryCached = getFromMemoryCache(cacheKey)
    if (memoryCached) {
      return memoryCached
    }

    return cache.getOrSet(
      cacheKey,
      async () => {
        const response = await apiClient.get<Destino[]>("/destinos/destacados", {
          params: { limit: limit.toString() },
        })
        const result = response.data as Destino[]

        // Guardar en caché de memoria
        addToMemoryCache(cacheKey, result)

        // Prefetch de detalles de destinos destacados
        setTimeout(() => {
          result.forEach((destino) => {
            getById(destino.id).catch(() => {}) // Ignorar errores en prefetch
          })
        }, 100)

        return result
      },
      TTL_CONFIG.FEATURED,
      { staleWhileRevalidate: true },
    )
  })

  /**
   * Busca destinos por término con caché optimizada
   * @param query Término de búsqueda
   * @param options Opciones de consulta
   * @returns Resultados de búsqueda
   */
  const search = withErrorHandling(
    async (query: string, options: { page?: number; limit?: number } = {}): Promise<DestinosResponse> => {
      if (!query) return getAll(options)

      const { page = 1, limit = 10 } = options

      // Generar clave de caché
      const cacheKey = `${CACHE_PREFIXES.SEARCH}:${query}:${page}:${limit}`

      // Verificar primero en caché de memoria
      const memoryCached = getFromMemoryCache(cacheKey)
      if (memoryCached) {
        return memoryCached
      }

      return cache.getOrSet(
        cacheKey,
        async () => {
          const response = await apiClient.get<PaginatedResponse<Destino>>("/destinos/buscar", {
            params: { q: query, page: page.toString(), limit: limit.toString() },
          })

          const result = {
            data: response.data?.items || [],
            meta: {
              total: response.data?.total || 0,
              totalPages: response.data?.totalPages || 1,
              currentPage: page,
            },
          }

          // Guardar en caché de memoria
          addToMemoryCache(cacheKey, result)

          return result
        },
        TTL_CONFIG.SEARCH,
      )
    },
  )

  /**
   * Obtiene destinos relacionados a un destino con caché optimizada
   * @param id ID del destino
   * @param limit Límite de resultados
   * @returns Destinos relacionados
   */
  const getRelated = withErrorHandling(async (id: number | string, limit = 3): Promise<Destino[]> => {
    if (!id) throw new Error("ID de destino requerido")

    // Generar clave de caché
    const cacheKey = `${CACHE_PREFIXES.RELATED}:${id}:${limit}`

    // Verificar primero en caché de memoria
    const memoryCached = getFromMemoryCache(cacheKey)
    if (memoryCached) {
      return memoryCached
    }

    return cache.getOrSet(
      cacheKey,
      async () => {
        const response = await apiClient.get<Destino[]>(`/destinos/${id}/relacionados`, {
          params: { limit: limit.toString() },
        })
        const result = response.data as Destino[]

        // Guardar en caché de memoria
        addToMemoryCache(cacheKey, result)

        return result
      },
      TTL_CONFIG.RELATED,
    )
  })

  /**
   * Obtiene los tipos de destino con caché optimizada
   * @returns Tipos de destino
   */
  const getTypes = withErrorHandling(async (): Promise<string[]> => {
    // Generar clave de caché
    const cacheKey = CACHE_PREFIXES.TYPES

    // Verificar primero en caché de memoria
    const memoryCached = getFromMemoryCache(cacheKey)
    if (memoryCached) {
      return memoryCached
    }

    return cache.getOrSet(
      cacheKey,
      async () => {
        const response = await apiClient.get<string[]>("/destinos/tipos")
        const result = response.data as string[]

        // Guardar en caché de memoria
        addToMemoryCache(cacheKey, result)

        return result
      },
      TTL_CONFIG.TYPES,
    )
  })

  /**
   * Versión de getAll que devuelve un Result con manejo de errores mejorado
   * @param options Opciones de consulta
   * @returns Result con destinos o error
   */
  const getAllResult = async (
    options: DestinoFiltros & { page?: number; limit?: number } = {},
  ): Promise<Result<DestinosResponse>> => {
    try {
      const data = await getAll(options)
      return { success: true, data }
    } catch (error) {
      console.error(`Error en getAllResult:`, error)

      // Intentar recuperar datos de caché aunque hayan expirado
      const { page = 1, limit = 10, ...filters } = options
      const cacheKey = `${CACHE_PREFIXES.ALL}:${page}:${limit}:${JSON.stringify(filters)}`

      try {
        const staleData = await cache.get(cacheKey, { ignoreExpiration: true })
        if (staleData) {
          console.log(`Recuperando datos expirados de caché para: ${cacheKey}`)
          return {
            success: true,
            data: staleData,
            meta: { fromStaleCache: true },
          }
        }
      } catch (cacheError) {
        console.error(`Error al recuperar de caché:`, cacheError)
      }

      return { success: false, error }
    }
  }

  /**
   * Versión de getById que devuelve un Result con manejo de errores mejorado
   * @param id ID del destino
   * @returns Result con destino o error
   */
  const getByIdResult = async (id: number | string): Promise<Result<Destino>> => {
    try {
      const data = await getById(id)
      return { success: true, data }
    } catch (error) {
      console.error(`Error en getByIdResult:`, error)

      // Intentar recuperar datos de caché aunque hayan expirado
      const cacheKey = `${CACHE_PREFIXES.DETAIL}:${id}`

      try {
        const staleData = await cache.get(cacheKey, { ignoreExpiration: true })
        if (staleData) {
          console.log(`Recuperando datos expirados de caché para: ${cacheKey}`)
          return {
            success: true,
            data: staleData,
            meta: { fromStaleCache: true },
          }
        }
      } catch (cacheError) {
        console.error(`Error al recuperar de caché:`, cacheError)
      }

      return { success: false, error }
    }
  }

  /**
   * Precarga datos comunes para mejorar la experiencia de usuario
   */
  const preloadCommonData = async (): Promise<void> => {
    console.log("[DestinosService] Precargando datos comunes")

    try {
      // Precarga en paralelo
      await Promise.all([getFeatured(8), getTypes(), getAll({ destacado: true, limit: 4 })])

      console.log("[DestinosService] Precarga completada")
    } catch (error) {
      console.error("[DestinosService] Error en precarga:", error)
    }
  }

  /**
   * Invalida la caché para un destino específico con estrategia inteligente
   * @param id ID del destino
   */
  const invalidateDestino = (id: number | string): void => {
    if (!id) return

    console.log(`[DestinosService] Invalidando caché para destino ${id}`)

    // Eliminar de caché de memoria
    for (const [key] of memoryCache.entries()) {
      if (key.includes(`${id}`)) {
        memoryCache.delete(key)
      }
    }

    // Invalidar detalle
    cache.delete(`${CACHE_PREFIXES.DETAIL}:${id}`)

    // Invalidar relacionados
    cache.clearByPrefix(`${CACHE_PREFIXES.RELATED}:${id}`)

    // Invalidar listas que podrían contener este destino de forma selectiva
    // En lugar de invalidar todas las listas, solo invalidamos las destacadas
    // ya que es más probable que el destino aparezca allí
    cache.clearByPrefix(`${CACHE_PREFIXES.FEATURED}`)

    // Para las demás listas, no hacemos nada especial
  }

  return {
    getAll,
    getById,
    getFeatured,
    search,
    getRelated,
    getTypes,
    getAllResult,
    getByIdResult,
    preloadCommonData,
    invalidateDestino,
  }
}
