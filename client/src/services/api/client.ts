"use client"

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { type ApiErrorBase, handleFetchError, toResult } from "../../utils/api-error-handler"
import { type ApiRequestOptions, type Result, RetryStrategy } from "../../types/api"
import { withRetry } from "./retry-strategy"
import { setupErrorInterceptor } from "./error-interceptor"
import { apiConfig as baseApiConfig, buildApiUrl } from "../../config/api"

/**
 * Tipo para interceptores de solicitud
 */
type RequestInterceptor = (
  config: AxiosRequestConfig & { url: string },
) => Promise<AxiosRequestConfig & { url?: string }> | (AxiosRequestConfig & { url?: string })

/**
 * Opciones para el cliente API
 */
export interface ApiClientOptions {
  baseUrl: string
  defaultHeaders?: Record<string, string>
  timeout?: number
  retries?: number
  retryStrategy?: RetryStrategy
  retryDelay?: number
  onError?: (error: ApiErrorBase) => void
  onRequest?: (url: string, options: AxiosRequestConfig) => void
  onResponse?: (response: AxiosResponse) => void
  enableCache?: boolean
  cacheTTL?: number
  showErrorToasts?: boolean
  debug?: boolean
}

/**
 * Cliente API con manejo de errores consistente, soporte para reintentos y caché
 */
export class ApiClient {
  private options: ApiClientOptions
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private requestInterceptors: RequestInterceptor[] = []
  private authInterceptor: RequestInterceptor | null = null

  constructor(options: ApiClientOptions) {
    this.options = {
      timeout: baseApiConfig.timeout,
      retries: baseApiConfig.retryAttempts,
      retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      retryDelay: baseApiConfig.retryDelay,
      enableCache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutos por defecto
      showErrorToasts: true,
      debug: baseApiConfig.debug,
      ...options,
    }

    if (this.options.debug) {
      console.log("[ApiClient] Initialized with options:", this.options)
    }
  }

  /**
   * Añade un interceptor de solicitud
   * @param interceptor Función interceptora
   * @returns Función para eliminar el interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor)
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor)
      if (index !== -1) {
        this.requestInterceptors.splice(index, 1)
      }
    }
  }

  /**
   * Establece el interceptor de autenticación
   * @param interceptor Función interceptora de autenticación
   */
  setAuthInterceptor(interceptor: RequestInterceptor): void {
    this.authInterceptor = interceptor
  }

  /**
   * Aplica todos los interceptores a una configuración de solicitud
   * @param url URL de la solicitud
   * @param config Configuración inicial
   * @returns Configuración modificada por los interceptores
   */
  private async applyInterceptors(
    url: string,
    config: AxiosRequestConfig,
  ): Promise<{ url: string; config: AxiosRequestConfig }> {
    let currentConfig: AxiosRequestConfig & { url: string } = { ...config, url }

    // Aplicar interceptor de autenticación primero si existe
    if (this.authInterceptor) {
      try {
        const result = await this.authInterceptor(currentConfig)
        currentConfig = { ...currentConfig, ...result }
      } catch (error) {
        console.error("Error en interceptor de autenticación:", error)
      }
    }

    // Aplicar el resto de interceptores
    for (const interceptor of this.requestInterceptors) {
      try {
        const result = await interceptor(currentConfig)
        currentConfig = { ...currentConfig, ...result }
      } catch (error) {
        console.error("Error en interceptor de solicitud:", error)
      }
    }

    // Extraer la URL actualizada y la configuración
    const { url: updatedUrl, ...updatedConfig } = currentConfig
    return { url: updatedUrl, config: updatedConfig }
  }

  /**
   * Construye la URL completa para una solicitud
   * @param endpoint Endpoint de la API
   * @returns URL completa
   */
  private buildUrl(endpoint: string): string {
    // Usar la función centralizada para construir URLs
    return buildApiUrl(endpoint)
  }

  /**
   * Construye los headers para una solicitud
   * @param customHeaders Headers personalizados
   * @returns Headers combinados
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Client-Version": import.meta.env.VITE_APP_VERSION || "1.0.0",
      "X-Client-Platform": "web",
      ...this.options.defaultHeaders,
      ...customHeaders,
    }

    return headers
  }

  /**
   * Serializa parámetros para URL
   * @param params Parámetros a serializar
   * @returns String de consulta
   */
  private serializeParams(params?: Record<string, string | number | boolean | undefined>): string {
    if (!params || Object.keys(params).length === 0) {
      return ""
    }

    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })

    return searchParams.toString()
  }

  /**
   * Genera una clave de caché para una solicitud
   * @param url URL de la solicitud
   * @param method Método HTTP
   * @param body Cuerpo de la solicitud
   * @returns Clave de caché
   */
  private getCacheKey(url: string, method: string, body?: any): string {
    const bodyString = body ? JSON.stringify(body) : ""
    return `${method}:${url}:${bodyString}`
  }

  /**
   * Verifica si hay una respuesta en caché válida
   * @param cacheKey Clave de caché
   * @returns Datos en caché o null si no hay o expiró
   */
  private getFromCache<T>(cacheKey: string): T | null {
    if (!this.options.enableCache) return null

    const cached = this.cache.get(cacheKey)
    if (!cached) return null

    const now = Date.now()
    const maxAge = this.options.cacheTTL || 5 * 60 * 1000 // 5 minutos por defecto

    if (now - cached.timestamp > maxAge) {
      // Caché expirado, eliminar
      this.cache.delete(cacheKey)
      return null
    }

    return cached.data
  }

  /**
   * Guarda una respuesta en caché
   * @param cacheKey Clave de caché
   * @param data Datos a almacenar
   */
  private saveToCache(cacheKey: string, data: any): void {
    if (!this.options.enableCache) return

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })
  }

  // Modificar el método handleApiError para no usar toast directamente
  private handleApiError(error: ApiErrorBase, endpoint: string): void {
    // Enriquecer el error con información adicional
    error.endpoint = endpoint
    error.timestamp = Date.now()

    // Registrar el error en un formato más estructurado
    console.error(`API Error [${error.code || "unknown"}] ${endpoint}:`, {
      message: error.message,
      status: error.status,
      timestamp: new Date(error.timestamp).toISOString(),
      details: error.details || {},
      originalError: error.originalError,
    })

    // Notificar sobre el error
    if (this.options.onError) {
      this.options.onError(error)
    }

    // Mostrar toast de error si está habilitado
    if (this.options.showErrorToasts) {
      const title = this.getErrorTitle(error)
      const message = error.message || "Se ha producido un error inesperado"

      // Usar un evento personalizado para notificar sobre el error
      const errorEvent = new CustomEvent("api-error", {
        detail: { title, message, error },
      })
      window.dispatchEvent(errorEvent)
    }
  }

  // Añadir un método auxiliar para obtener el título del error
  private getErrorTitle(error: ApiErrorBase): string {
    switch (error.code) {
      case "authentication_error":
        return "Error de autenticación"
      case "authorization_error":
        return "Error de autorización"
      case "validation_error":
        return "Error de validación"
      case "not_found":
        return "No encontrado"
      case "network_error":
        return "Error de red"
      case "timeout":
        return "Tiempo de espera agotado"
      case "server_error":
        return "Error del servidor"
      default:
        return "Error"
    }
  }

  /**
   * Realiza una solicitud HTTP
   * @param endpoint Endpoint de la API
   * @param method Método HTTP
   * @param options Opciones de la solicitud
   * @returns Respuesta de la API
   */
  private async request<T>(
    endpoint: string,
    method: string,
    options: ApiRequestOptions = {},
  ): Promise<AxiosResponse<T>> {
    const {
      headers,
      params,
      timeout = this.options.timeout,
      retries = this.options.retries,
      retryStrategy = this.options.retryStrategy,
      retryDelay = this.options.retryDelay,
      abortSignal,
      skipCache = false,
      showErrorToast = this.options.showErrorToasts,
      ...axiosOptions
    } = options

    // Construir URL con parámetros
    const url = this.buildUrl(endpoint)
    const queryParams = this.serializeParams(params)
    let fullUrl = queryParams ? `${url}?${queryParams}` : url

    // Construir opciones de axios
    let requestOptions: AxiosRequestConfig = {
      method,
      headers: this.buildHeaders(headers),
      ...axiosOptions,
    }

    // Añadir cuerpo para métodos que lo soportan
    if (["POST", "PUT", "PATCH"].includes(method) && axiosOptions.data) {
      requestOptions.data = axiosOptions.data
    }

    // Aplicar interceptores
    const { url: interceptedUrl, config: interceptedConfig } = await this.applyInterceptors(fullUrl, requestOptions)
    fullUrl = interceptedUrl
    requestOptions = interceptedConfig

    // Verificar caché para solicitudes GET
    if (method === "GET" && !skipCache) {
      const cacheKey = this.getCacheKey(fullUrl, method)
      const cachedData = this.getFromCache<AxiosResponse<T>>(cacheKey)
      if (cachedData) {
        return cachedData
      }
    }

    // Crear controlador de aborto para timeout
    let abortController: AbortController | undefined
    let timeoutId: NodeJS.Timeout | undefined

    if (!abortSignal && timeout) {
      abortController = new AbortController()
      requestOptions.signal = abortController.signal

      timeoutId = setTimeout(() => {
        abortController?.abort()
      }, timeout)
    } else if (abortSignal) {
      requestOptions.signal = abortSignal
    }

    // Notificar sobre la solicitud
    if (this.options.onRequest) {
      this.options.onRequest(fullUrl, requestOptions)
    }

    try {
      // Realizar solicitud con reintentos si es necesario
      const response = await withRetry(
        async () => {
          const res = await axios.request<T>({ url: fullUrl, ...requestOptions })

          // Notificar sobre la respuesta
          if (this.options.onResponse) {
            this.options.onResponse(res)
          }

          return res
        },
        {
          maxRetries: retries,
          strategy: retryStrategy,
          initialDelay: retryDelay,
          shouldRetry: (error, attempt) => {
            // No reintentar después del segundo intento para errores que no sean de red
            if (attempt >= 2 && !(error instanceof TypeError)) {
              return false
            }

            // Solo reintentar errores de red o errores 5xx específicos
            if (error instanceof TypeError) return true // Error de red

            if (typeof error === "object" && error !== null && "status" in error) {
              const status = (error as AxiosResponse).status

              // Errores de servidor que suelen ser temporales
              const temporaryServerErrors = [
                503, // Service Unavailable
                504, // Gateway Timeout
                507, // Insufficient Storage
                508, // Loop Detected
                509, // Bandwidth Limit Exceeded
                529, // Site is overloaded
              ]

              // No reintentar errores de cliente (4xx) excepto 408 (timeout) y 429 (rate limit)
              if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
                return false
              }

              // Reintentar errores temporales específicos
              return temporaryServerErrors.includes(status) || (status >= 500 && status < 600) // Todos los 5xx
            }

            return false
          },
        },
      )

      // Guardar en caché para solicitudes GET exitosas
      if (method === "GET" && response.status === 200 && !skipCache) {
        const cacheKey = this.getCacheKey(fullUrl, method)
        this.saveToCache(cacheKey, response)
      }

      return response
    } catch (error) {
      // Convertir error a formato estándar
      const apiError = handleFetchError(error)

      // Manejar el error
      if (showErrorToast) {
        this.handleApiError(apiError, endpoint)
      } else if (this.options.onError) {
        this.options.onError(apiError)
      }

      throw apiError
    } finally {
      // Limpiar timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }

  /**
   * Realiza una solicitud GET
   * @param endpoint Endpoint de la API
   * @param options Opciones de la solicitud
   * @returns Respuesta de la API
   */
  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<AxiosResponse<T>> {
    return this.request<T>(endpoint, "GET", options)
  }

  /**
   * Realiza una solicitud POST
   * @param endpoint Endpoint de la API
   * @param data Datos a enviar
   * @param options Opciones de la solicitud
   * @returns Respuesta de la API
   */
  async post<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<AxiosResponse<T>> {
    return this.request<T>(endpoint, "POST", { ...options, data: data })
  }

  /**
   * Realiza una solicitud PUT
   * @param endpoint Endpoint de la API
   * @param data Datos a enviar
   * @param options Opciones de la solicitud
   * @returns Respuesta de la API
   */
  async put<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<AxiosResponse<T>> {
    return this.request<T>(endpoint, "PUT", { ...options, data: data })
  }

  /**
   * Realiza una solicitud PATCH
   * @param endpoint Endpoint de la API
   * @param data Datos a enviar
   * @param options Opciones de la solicitud
   * @returns Respuesta de la API
   */
  async patch<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<AxiosResponse<T>> {
    return this.request<T>(endpoint, "PATCH", { ...options, data: data })
  }

  /**
   * Realiza una solicitud DELETE
   * @param endpoint Endpoint de la API
   * @param options Opciones de la solicitud
   * @returns Respuesta de la API
   */
  async delete<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<AxiosResponse<T>> {
    return this.request<T>(endpoint, "DELETE", options)
  }

  /**
   * Versión de GET que devuelve un Result
   * @param endpoint Endpoint de la API
   * @param options Opciones de la solicitud
   * @returns Result con datos o error
   */
  getResult<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<Result<T>> {
    return toResult(this.get.bind(this))<T, [string, ApiRequestOptions]>(endpoint, options)
  }

  /**
   * Versión de POST que devuelve un Result
   * @param endpoint Endpoint de la API
   * @param data Datos a enviar
   * @param options Opciones de la solicitud
   * @returns Result con datos o error
   */
  postResult<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<Result<T>> {
    return toResult(this.post.bind(this))<T, [string, any, ApiRequestOptions]>(endpoint, data, options)
  }

  /**
   * Versión de PUT que devuelve un Result
   * @param endpoint Endpoint de la API
   * @param data Datos a enviar
   * @param options Opciones de la solicitud
   * @returns Result con datos o error
   */
  putResult<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<Result<T>> {
    return toResult(this.put.bind(this))<T, [string, any, ApiRequestOptions]>(endpoint, data, options)
  }

  /**
   * Versión de PATCH que devuelve un Result
   * @param endpoint Endpoint de la API
   * @param data Datos a enviar
   * @param options Opciones de la solicitud
   * @returns Result con datos o error
   */
  patchResult<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<Result<T>> {
    return toResult(this.patch.bind(this))<T, [string, any, ApiRequestOptions]>(endpoint, data, options)
  }

  /**
   * Versión de DELETE que devuelve un Result
   * @param endpoint Endpoint de la API
   * @param options Opciones de la solicitud
   * @returns Result con datos o error
   */
  deleteResult<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<Result<T>> {
    return toResult(this.delete.bind(this))<T, [string, ApiRequestOptions]>(endpoint, options)
  }

  /**
   * Limpia la caché del cliente
   * @param pattern Patrón para limpiar solo ciertas claves (opcional)
   * @param maxAge Edad máxima en ms para limpiar solo entradas antiguas (opcional)
   */
  clearCache(pattern?: RegExp, maxAge?: number): void {
    if (!pattern && !maxAge) {
      this.cache.clear()
      return
    }

    const now = Date.now()
    const keysToDelete: string[] = []

    // Identificar claves a eliminar
    for (const [key, value] of this.cache.entries()) {
      const shouldDeleteByPattern = pattern && pattern.test(key)
      const shouldDeleteByAge = maxAge && now - value.timestamp > maxAge

      if (shouldDeleteByPattern || shouldDeleteByAge) {
        keysToDelete.push(key)
      }
    }

    // Eliminar las claves identificadas
    keysToDelete.forEach((key) => this.cache.delete(key))

    if (keysToDelete.length > 0 && this.options.debug) {
      console.log(`[ApiClient] Cleared ${keysToDelete.length} cache entries`)
    }
  }

  /**
   * Invalida la caché basada en un prefijo de clave
   * @param prefix Prefijo de las claves a invalidar
   * @returns Número de entradas invalidadas
   */
  invalidateCacheByPrefix(prefix: string): number {
    let count = 0

    for (const key of this.cache.keys()) {
      if (key.includes(prefix)) {
        this.cache.delete(key)
        count++
      }
    }

    if (count > 0 && this.options.debug) {
      console.log(`[ApiClient] Invalidated ${count} cache entries with prefix: ${prefix}`)
    }

    return count
  }

  /**
   * Precalienta la caché con datos conocidos
   * @param url URL de la solicitud
   * @param method Método HTTP
   * @param data Datos a almacenar en caché
   * @param ttl Tiempo de vida en ms (opcional)
   */
  preloadCache<T>(url: string, method: string, data: T, ttl?: number): void {
    if (!this.options.enableCache) return

    const cacheKey = this.getCacheKey(url, method)
    const cacheTTL = ttl || this.options.cacheTTL || 5 * 60 * 1000

    this.cache.set(cacheKey, {
      data: {
        status: 200,
        data: data,
        headers: {},
        config: {},
        request: {},
        statusText: "OK",
      },
      timestamp: Date.now(),
    })

    if (this.options.debug) {
      console.log(`[ApiClient] Preloaded cache for ${method} ${url}`)
    }
  }
}

// Configuración base para axios
const defaultApiConfig: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
}

// Crear instancia de Axios
const axiosInstance: AxiosInstance = axios.create(defaultApiConfig)

// Configurar interceptor de errores
setupErrorInterceptor(axiosInstance)

// Exportar la instancia configurada
// Configuración base para axios
// Crear instancia de axios
const axiosInstance2: AxiosInstance = axios.create(defaultApiConfig)

// Exportar la instancia de API como 'api'
export const api = axiosInstance2

// También exportar como apiClient para mantener compatibilidad
export const apiClient = axiosInstance2

// Exportar por defecto
export default axiosInstance2
