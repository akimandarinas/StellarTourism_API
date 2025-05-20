/**
 * Sistema centralizado de gestión de errores
 *
 * Este sistema se encarga de normalizar, registrar y manejar errores
 * de manera consistente en toda la aplicación.
 */

import type { ApiErrorBase } from "./api-error-handler"

// Tipos de errores
export enum ErrorType {
  API = "api",
  NETWORK = "network",
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  SERVER = "server",
  CLIENT = "client",
  UNKNOWN = "unknown",
}

// Códigos de error
export enum ErrorCode {
  // Errores de API
  API_ERROR = "api_error",

  // Errores de red
  NETWORK_ERROR = "network_error",
  TIMEOUT = "timeout",

  // Errores de validación
  VALIDATION_ERROR = "validation_error",
  INVALID_INPUT = "invalid_input",

  // Errores de autenticación
  AUTHENTICATION_ERROR = "authentication_error",
  INVALID_CREDENTIALS = "invalid_credentials",
  SESSION_EXPIRED = "session_expired",

  // Errores de autorización
  AUTHORIZATION_ERROR = "authorization_error",
  FORBIDDEN = "forbidden",

  // Errores de recursos
  NOT_FOUND = "not_found",
  RESOURCE_NOT_FOUND = "resource_not_found",

  // Errores de servidor
  SERVER_ERROR = "server_error",
  INTERNAL_SERVER_ERROR = "internal_server_error",
  SERVICE_UNAVAILABLE = "service_unavailable",

  // Errores de cliente
  CLIENT_ERROR = "client_error",
  UNSUPPORTED_OPERATION = "unsupported_operation",

  // Errores desconocidos
  UNKNOWN_ERROR = "unknown_error",
}

// Interfaz para errores normalizados
export interface NormalizedError {
  type: ErrorType
  code: ErrorCode | string
  message: string
  status?: number
  details?: any
  timestamp: number
  source?: string
  originalError?: any
}

// Mapa de códigos HTTP a tipos de error
const HTTP_STATUS_TO_ERROR_TYPE: Record<number, ErrorType> = {
  400: ErrorType.VALIDATION,
  401: ErrorType.AUTHENTICATION,
  403: ErrorType.AUTHORIZATION,
  404: ErrorType.NOT_FOUND,
  422: ErrorType.VALIDATION,
  500: ErrorType.SERVER,
  502: ErrorType.SERVER,
  503: ErrorType.SERVER,
  504: ErrorType.SERVER,
}

// Mapa de códigos HTTP a códigos de error
const HTTP_STATUS_TO_ERROR_CODE: Record<number, ErrorCode> = {
  400: ErrorCode.VALIDATION_ERROR,
  401: ErrorCode.AUTHENTICATION_ERROR,
  403: ErrorCode.AUTHORIZATION_ERROR,
  404: ErrorCode.NOT_FOUND,
  422: ErrorCode.VALIDATION_ERROR,
  500: ErrorCode.SERVER_ERROR,
  502: ErrorCode.SERVER_ERROR,
  503: ErrorCode.SERVICE_UNAVAILABLE,
  504: ErrorCode.TIMEOUT,
}

// Mapa de códigos de error a mensajes
const ERROR_CODE_TO_MESSAGE: Record<ErrorCode, string> = {
  [ErrorCode.API_ERROR]: "Error en la comunicación con el servidor",
  [ErrorCode.NETWORK_ERROR]: "Error de conexión. Verifica tu conexión a internet",
  [ErrorCode.TIMEOUT]: "La solicitud ha excedido el tiempo de espera",
  [ErrorCode.VALIDATION_ERROR]: "Los datos proporcionados no son válidos",
  [ErrorCode.INVALID_INPUT]: "Los datos proporcionados no son válidos",
  [ErrorCode.AUTHENTICATION_ERROR]: "Error de autenticación",
  [ErrorCode.INVALID_CREDENTIALS]: "Credenciales inválidas",
  [ErrorCode.SESSION_EXPIRED]: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente",
  [ErrorCode.AUTHORIZATION_ERROR]: "No tienes permisos para realizar esta acción",
  [ErrorCode.FORBIDDEN]: "No tienes permisos para realizar esta acción",
  [ErrorCode.NOT_FOUND]: "El recurso solicitado no existe",
  [ErrorCode.RESOURCE_NOT_FOUND]: "El recurso solicitado no existe",
  [ErrorCode.SERVER_ERROR]: "Error en el servidor. Intenta de nuevo más tarde",
  [ErrorCode.INTERNAL_SERVER_ERROR]: "Error interno del servidor. Intenta de nuevo más tarde",
  [ErrorCode.SERVICE_UNAVAILABLE]: "Servicio no disponible. Intenta de nuevo más tarde",
  [ErrorCode.CLIENT_ERROR]: "Error en la aplicación",
  [ErrorCode.UNSUPPORTED_OPERATION]: "Operación no soportada",
  [ErrorCode.UNKNOWN_ERROR]: "Error desconocido",
}

/**
 * Normaliza un error de API
 * @param error Error de API
 * @returns Error normalizado
 */
export function normalizeApiError(error: ApiErrorBase): NormalizedError {
  const errorType = error.status ? HTTP_STATUS_TO_ERROR_TYPE[error.status] || ErrorType.API : ErrorType.API
  const errorCode = error.code || (error.status ? HTTP_STATUS_TO_ERROR_CODE[error.status] : ErrorCode.API_ERROR)

  return {
    type: errorType,
    code: errorCode,
    message: error.message || ERROR_CODE_TO_MESSAGE[errorCode as ErrorCode] || "Error desconocido",
    status: error.status,
    details: error.details,
    timestamp: error.timestamp || Date.now(),
    source: "api",
    originalError: error,
  }
}

/**
 * Normaliza un error de red
 * @param error Error de red
 * @returns Error normalizado
 */
export function normalizeNetworkError(error: Error): NormalizedError {
  return {
    type: ErrorType.NETWORK,
    code: ErrorCode.NETWORK_ERROR,
    message: error.message || ERROR_CODE_TO_MESSAGE[ErrorCode.NETWORK_ERROR],
    timestamp: Date.now(),
    source: "network",
    originalError: error,
  }
}

/**
 * Normaliza un error de validación
 * @param error Error de validación
 * @param fieldErrors Errores por campo
 * @returns Error normalizado
 */
export function normalizeValidationError(error: Error, fieldErrors?: Record<string, string>): NormalizedError {
  return {
    type: ErrorType.VALIDATION,
    code: ErrorCode.VALIDATION_ERROR,
    message: error.message || ERROR_CODE_TO_MESSAGE[ErrorCode.VALIDATION_ERROR],
    details: fieldErrors,
    timestamp: Date.now(),
    source: "validation",
    originalError: error,
  }
}

/**
 * Normaliza un error genérico
 * @param error Error genérico
 * @param type Tipo de error
 * @param code Código de error
 * @returns Error normalizado
 */
export function normalizeError(
  error: any,
  type: ErrorType = ErrorType.UNKNOWN,
  code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
): NormalizedError {
  // Si ya es un error normalizado, devolverlo
  if (error && error.type && error.code && error.timestamp) {
    return error as NormalizedError
  }

  // Si es un error de API, normalizarlo como tal
  if (error && (error.status || error.statusCode)) {
    return normalizeApiError(error)
  }

  // Si es un error de red, normalizarlo como tal
  if (error instanceof TypeError && error.message.includes("network")) {
    return normalizeNetworkError(error)
  }

  // Normalizar como error genérico
  return {
    type,
    code,
    message: error?.message || ERROR_CODE_TO_MESSAGE[code] || "Error desconocido",
    timestamp: Date.now(),
    source: "unknown",
    originalError: error,
  }
}

// Registro de errores
const errorLog: NormalizedError[] = []
const MAX_ERROR_LOG_SIZE = 100

/**
 * Registra un error
 * @param error Error a registrar
 */
export function logError(error: NormalizedError | ApiErrorBase | Error | any): void {
  // Normalizar el error si no lo está
  const normalizedError = "type" in error ? error : normalizeError(error)

  // Registrar en consola
  console.error(`[${normalizedError.type.toUpperCase()}] ${normalizedError.code}:`, normalizedError)

  // Añadir al registro
  errorLog.unshift(normalizedError)

  // Limitar tamaño del registro
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.pop()
  }

  // Enviar a servicio de monitoreo si está en producción
  if (import.meta.env.PROD) {
    sendErrorToMonitoring(normalizedError)
  }
}

/**
 * Envía un error al servicio de monitoreo
 * @param error Error normalizado
 */
function sendErrorToMonitoring(error: NormalizedError): void {
  // Implementación para enviar a servicio de monitoreo
  // Por ejemplo, Sentry, LogRocket, etc.
  try {
    // Simulación de envío a servicio de monitoreo
    console.log("[MONITORING] Error enviado al servicio de monitoreo:", error)
  } catch (e) {
    console.error("Error al enviar error al servicio de monitoreo:", e)
  }
}

/**
 * Obtiene el registro de errores
 * @returns Registro de errores
 */
export function getErrorLog(): NormalizedError[] {
  return [...errorLog]
}

/**
 * Limpia el registro de errores
 */
export function clearErrorLog(): void {
  errorLog.length = 0
}

/**
 * Obtiene un mensaje de error amigable
 * @param error Error normalizado o código de error
 * @returns Mensaje de error amigable
 */
export function getFriendlyErrorMessage(error: NormalizedError | ErrorCode | string): string {
  if (typeof error === "string") {
    return ERROR_CODE_TO_MESSAGE[error as ErrorCode] || "Error desconocido"
  }

  return error.message || ERROR_CODE_TO_MESSAGE[error.code as ErrorCode] || "Error desconocido"
}

export default {
  normalizeApiError,
  normalizeNetworkError,
  normalizeValidationError,
  normalizeError,
  logError,
  getErrorLog,
  clearErrorLog,
  getFriendlyErrorMessage,
  ErrorType,
  ErrorCode,
}
