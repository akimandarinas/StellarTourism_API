/**
 * Tipos para la API
 */

// Estrategias de reintento
export enum RetryStrategy {
  CONSTANT = "constant",
  LINEAR = "linear",
  EXPONENTIAL_BACKOFF = "exponential_backoff",
}

// Opciones para solicitudes API
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  timeout?: number
  retries?: number
  retryStrategy?: RetryStrategy
  retryDelay?: number
  abortSignal?: AbortSignal
  skipCache?: boolean
  showErrorToast?: boolean
}

// Respuesta de la API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: Record<string, any>
}

// Error de la API
export interface ApiError {
  code: string
  message: string
  status?: number
  details?: any
}

// Resultado genérico
export interface Result<T> {
  success: boolean
  data?: T
  error?: any
  meta?: Record<string, any>
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  totalPages: number
  currentPage: number
}

// Opciones de caché
export interface CacheOptions {
  defaultTTL?: number
  maxSize?: number
  persistToStorage?: boolean
  compressionThreshold?: number
  versionKey?: string
}

// Opciones para obtener de caché
export interface GetCacheOptions {
  ignoreExpiration?: boolean
  background?: boolean
}

// Opciones para establecer en caché
export interface SetCacheOptions {
  ttl?: number
  staleWhileRevalidate?: boolean
  background?: boolean
  prefetch?: (cachedData: any) => Promise<void>
  onError?: (error: any) => { extendTTL?: number } | void
}
