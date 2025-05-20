/**
 * Adaptador para normalizar parámetros de consulta
 *
 * Este adaptador se encarga de transformar los parámetros de consulta
 * para que sean compatibles con lo que espera la API.
 */

// Mapeo de nombres de parámetros del cliente a nombres de parámetros de la API
const PARAM_MAPPING: Record<string, string> = {
  // Parámetros generales
  page: "page",
  limit: "limit",
  sort: "order_by",
  order: "order_dir",
  search: "q",

  // Parámetros específicos de destinos
  minPrice: "precio_min",
  maxPrice: "precio_max",
  minDuration: "duracion_min",
  maxDuration: "duracion_max",
  type: "tipo",
  featured: "destacado",

  // Parámetros específicos de naves
  minCapacity: "capacidad_min",
  maxCapacity: "capacidad_max",
  available: "disponible",

  // Parámetros específicos de reservas
  userId: "usuario_id",
  destinationId: "destino_id",
  shipId: "nave_id",
  status: "estado",
  startDate: "fecha_inicio",
  endDate: "fecha_fin",
}

/**
 * Normaliza los parámetros de consulta para que sean compatibles con la API
 * @param params Parámetros de consulta del cliente
 * @returns Parámetros normalizados
 */
export function normalizeQueryParams(params: Record<string, any> = {}): Record<string, any> {
  if (!params || Object.keys(params).length === 0) {
    return {}
  }

  const normalizedParams: Record<string, any> = {}

  // Normalizar parámetros
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue

    const apiKey = PARAM_MAPPING[key] || key

    // Convertir booleanos a 0/1 si es necesario
    if (typeof value === "boolean") {
      normalizedParams[apiKey] = value ? 1 : 0
    } else {
      normalizedParams[apiKey] = value
    }
  }

  return normalizedParams
}

/**
 * Normaliza los parámetros de paginación
 * @param page Número de página
 * @param limit Límite de resultados por página
 * @returns Parámetros de paginación normalizados
 */
export function normalizePaginationParams(page?: number, limit?: number): Record<string, number> {
  const params: Record<string, number> = {}

  if (page !== undefined && page > 0) {
    params.page = page
  }

  if (limit !== undefined && limit > 0) {
    params.limit = limit
  }

  return params
}

/**
 * Normaliza los parámetros de ordenación
 * @param sortBy Campo por el que ordenar
 * @param sortOrder Dirección de ordenación
 * @returns Parámetros de ordenación normalizados
 */
export function normalizeSortParams(sortBy?: string, sortOrder?: "asc" | "desc"): Record<string, string> {
  const params: Record<string, string> = {}

  if (sortBy) {
    params.order_by = sortBy
  }

  if (sortOrder) {
    params.order_dir = sortOrder
  }

  return params
}

/**
 * Normaliza los parámetros de filtrado
 * @param filters Filtros a aplicar
 * @returns Parámetros de filtrado normalizados
 */
export function normalizeFilterParams(filters: Record<string, any> = {}): Record<string, any> {
  return normalizeQueryParams(filters)
}

/**
 * Combina todos los parámetros de consulta
 * @param pagination Parámetros de paginación
 * @param sorting Parámetros de ordenación
 * @param filters Parámetros de filtrado
 * @returns Parámetros combinados
 */
export function combineQueryParams(
  pagination: Record<string, any> = {},
  sorting: Record<string, any> = {},
  filters: Record<string, any> = {},
): Record<string, any> {
  return {
    ...pagination,
    ...sorting,
    ...filters,
  }
}

export default {
  normalizeQueryParams,
  normalizePaginationParams,
  normalizeSortParams,
  normalizeFilterParams,
  combineQueryParams,
}
