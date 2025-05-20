import axios from "axios"
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios"
import { isClient } from "./ssr-safe"
import { useApiStore } from "../stores"

// Configuración por defecto
const DEFAULT_CONFIG = {
  baseURL: isClient() ? import.meta.env.PUBLIC_API_URL || "/api" : "http://api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
  timeout: 30000
}

// Opciones para solicitudes
interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string>
  timeout?: number
  cache?: boolean
  cacheTTL?: number
  retry?: number
  retryDelay?: number
  signal?: AbortSignal
}

// Clase para cliente API
export class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private defaultTimeout: number

  constructor(config = {}) {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config }
    this.baseURL = mergedConfig.baseURL
    this.defaultHeaders = mergedConfig.headers
    this.defaultTimeout = mergedConfig.timeout
  }

  // Método para construir URL
  private buildURL(endpoint: string, params?: Record<string, string>): string {
    // Normalizar endpoint
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    
    // Construir URL base
    let url = `${this.baseURL}${normalizedEndpoint}`
    
    // Añadir parámetros de consulta
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams()
      
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value)
        }
      }
      
      const queryString = queryParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    
    return url
  }

  // Método para realizar solicitudes
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = "GET",
      headers = {},
      body,
      params,
      timeout = this.defaultTimeout,
      cache = false,
      cacheTTL = 5 * 60 * 1000, // 5 minutos
      retry = 0,
      retryDelay = 1000,
      signal
    } = options

    // Obtener store de API
    const apiStore = useApiStore()
    
    // Construir URL
    const url = this.buildURL(endpoint, params)
    
    // Verificar caché
    if (method === "GET" && cache) {
      const cacheKey = `${method}:${url}`
      const cachedData = apiStore.getCacheItem(cacheKey)
      
      if (cachedData) {
        return cachedData
      }
    }
    
    // Construir opciones de fetch
    const fetchOptions: RequestInit = {
      method,
      headers: { ...this.defaultHeaders, ...headers },
      signal
    }
    
    // Añadir cuerpo para métodos que lo soportan
    if (["POST", "PUT", "PATCH"].includes(method) && body !== undefined) {
      fetchOptions.body = JSON.stringify(body)
    }
    
    // Crear controlador de aborto para timeout
    let abortController: AbortController | undefined
    let timeoutId: NodeJS.Timeout | undefined
    
    if (!signal && timeout) {
      abortController = new AbortController()
      fetchOptions.signal = abortController.signal
      
      timeoutId = setTimeout(() => {
        abortController?.abort()
      }, timeout)
    }
    
    // Registrar solicitud
    const requestId = Date.now().toString()
    apiStore.addRequest(requestId, {
      url,
      method,
      params,
      body
    })
    
    try {
      // Realizar solicitud
      const response = await fetch(url, fetchOptions)
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      // Parsear respuesta
      const data = await response.json()
      
      // Guardar en caché si es necesario
      if (method === "GET" && cache) {
        const cacheKey = `${method}:${url}`
        apiStore.setCacheItem(cacheKey, data, cacheTTL)
      }
      
      return data
    } catch (error) {
      // Manejar error
      apiStore.addError(error)
      
      // Reintentar si es necesario
      if (retry > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return this.request<T>(endpoint, {
          ...options,
          retry: retry - 1,
          retryDelay: retryDelay * 2 // Backoff exponencial
        })
      }
      
      throw error
    } finally {
      // Limpiar timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      // Eliminar solicitud
      apiStore.removeRequest(requestId)
    }
  }

  // Métodos para diferentes tipos de solicitudes
  async get<T>(endpoint: string, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, body?: any, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body })
  }

  async put<T>(endpoint: string, body?: any, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body })
  }

  async patch<T>(endpoint: string, body?: any, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body })
  }

  async delete<T>(endpoint: string, options: Omit<RequestOptions, "method"> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

// Crear instancia global
export const apiClient = new ApiClient()

// Exportar funciones de conveniencia
export const get = <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> => {
  return apiClient.get<T>(endpoint, options)
}

export const post = <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "method" | "body">): Promise<T> => {
  return apiClient.post<T>(endpoint, body, options)
}

export const put = <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "method" | "body">): Promise<T> => {
  return apiClient.put<T>(endpoint, body, options)
}

export const patch = <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "method" | "body">): Promise<T> => {
  return apiClient.patch<T>(endpoint, body, options)
}

export const del = <T>(endpoint: string, options?: Omit<RequestOptions, "method">): Promise<T> => {
  return apiClient.delete<T>(endpoint, options)
}
