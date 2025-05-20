/**
 * Configuración centralizada de endpoints de la API
 *
 * Este archivo define todos los endpoints utilizados por la aplicación,
 * asegurando consistencia y facilitando cambios globales.
 */

// Tipos de recursos
export enum ResourceType {
  DESTINOS = "destinos",
  NAVES = "naves",
  RESERVAS = "reservas",
  USUARIOS = "usuarios",
  ACTIVIDADES = "actividades",
  PAGOS = "pagos",
  RESENAS = "resenas",
  AUTH = "auth",
}

// Acciones comunes para recursos
export enum ResourceAction {
  LIST = "list",
  GET = "get",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  SEARCH = "search",
}

// Interfaz para definir un endpoint
export interface Endpoint {
  path: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  requiresAuth: boolean
  description: string
  version?: string
}

// Tipo para agrupar endpoints por recurso
export type ResourceEndpoints = {
  [key in ResourceAction]?: Endpoint
} & {
  [key: string]: Endpoint
}

// Mapa completo de endpoints
export const endpoints: Record<ResourceType, ResourceEndpoints> = {
  [ResourceType.DESTINOS]: {
    [ResourceAction.LIST]: {
      path: "/destinos",
      method: "GET",
      requiresAuth: false,
      description: "Obtener lista de destinos",
    },
    [ResourceAction.GET]: {
      path: "/destinos/:id",
      method: "GET",
      requiresAuth: false,
      description: "Obtener detalles de un destino",
    },
    [ResourceAction.SEARCH]: {
      path: "/destinos/buscar",
      method: "GET",
      requiresAuth: false,
      description: "Buscar destinos",
    },
    destacados: {
      path: "/destinos/destacados",
      method: "GET",
      requiresAuth: false,
      description: "Obtener destinos destacados",
    },
    tipos: {
      path: "/destinos/tipos",
      method: "GET",
      requiresAuth: false,
      description: "Obtener tipos de destinos",
    },
    relacionados: {
      path: "/destinos/:id/relacionados",
      method: "GET",
      requiresAuth: false,
      description: "Obtener destinos relacionados",
    },
  },
  [ResourceType.NAVES]: {
    [ResourceAction.LIST]: {
      path: "/naves",
      method: "GET",
      requiresAuth: false,
      description: "Obtener lista de naves",
    },
    [ResourceAction.GET]: {
      path: "/naves/:id",
      method: "GET",
      requiresAuth: false,
      description: "Obtener detalles de una nave",
    },
    [ResourceAction.SEARCH]: {
      path: "/naves/buscar",
      method: "GET",
      requiresAuth: false,
      description: "Buscar naves",
    },
    disponibles: {
      path: "/naves/disponibles",
      method: "GET",
      requiresAuth: false,
      description: "Obtener naves disponibles",
    },
    tipos: {
      path: "/naves/tipos",
      method: "GET",
      requiresAuth: false,
      description: "Obtener tipos de naves",
    },
  },
  [ResourceType.RESERVAS]: {
    [ResourceAction.LIST]: {
      path: "/reservas",
      method: "GET",
      requiresAuth: true,
      description: "Obtener lista de reservas",
    },
    [ResourceAction.GET]: {
      path: "/reservas/:id",
      method: "GET",
      requiresAuth: true,
      description: "Obtener detalles de una reserva",
    },
    [ResourceAction.CREATE]: {
      path: "/reservas",
      method: "POST",
      requiresAuth: true,
      description: "Crear una nueva reserva",
    },
    [ResourceAction.UPDATE]: {
      path: "/reservas/:id",
      method: "PUT",
      requiresAuth: true,
      description: "Actualizar una reserva",
    },
    [ResourceAction.DELETE]: {
      path: "/reservas/:id",
      method: "DELETE",
      requiresAuth: true,
      description: "Eliminar una reserva",
    },
    disponibilidad: {
      path: "/reservas/disponibilidad",
      method: "GET",
      requiresAuth: false,
      description: "Verificar disponibilidad para reserva",
    },
    estadisticas: {
      path: "/reservas/estadisticas",
      method: "GET",
      requiresAuth: true,
      description: "Obtener estadísticas de reservas",
    },
    actualizarEstado: {
      path: "/reservas/:id/estado",
      method: "PATCH",
      requiresAuth: true,
      description: "Actualizar estado de una reserva",
    },
    userReservas: {
      path: "/usuarios/:userId/reservas",
      method: "GET",
      requiresAuth: true,
      description: "Obtener reservas de un usuario",
    },
  },
  [ResourceType.USUARIOS]: {
    [ResourceAction.GET]: {
      path: "/usuarios/:id",
      method: "GET",
      requiresAuth: true,
      description: "Obtener detalles de un usuario",
    },
    [ResourceAction.UPDATE]: {
      path: "/usuarios/:id",
      method: "PUT",
      requiresAuth: true,
      description: "Actualizar un usuario",
    },
    perfil: {
      path: "/usuarios/perfil",
      method: "GET",
      requiresAuth: true,
      description: "Obtener perfil del usuario actual",
    },
    actualizarPerfil: {
      path: "/usuarios/perfil",
      method: "PUT",
      requiresAuth: true,
      description: "Actualizar perfil del usuario actual",
    },
  },
  [ResourceType.ACTIVIDADES]: {
    [ResourceAction.LIST]: {
      path: "/actividades",
      method: "GET",
      requiresAuth: false,
      description: "Obtener lista de actividades",
    },
    [ResourceAction.GET]: {
      path: "/actividades/:id",
      method: "GET",
      requiresAuth: false,
      description: "Obtener detalles de una actividad",
    },
    porDestino: {
      path: "/destinos/:destinoId/actividades",
      method: "GET",
      requiresAuth: false,
      description: "Obtener actividades de un destino",
    },
  },
  [ResourceType.PAGOS]: {
    [ResourceAction.LIST]: {
      path: "/pagos",
      method: "GET",
      requiresAuth: true,
      description: "Obtener lista de pagos",
    },
    [ResourceAction.GET]: {
      path: "/pagos/:id",
      method: "GET",
      requiresAuth: true,
      description: "Obtener detalles de un pago",
    },
    [ResourceAction.CREATE]: {
      path: "/pagos",
      method: "POST",
      requiresAuth: true,
      description: "Crear un nuevo pago",
    },
    porReserva: {
      path: "/reservas/:reservaId/pagos",
      method: "GET",
      requiresAuth: true,
      description: "Obtener pagos de una reserva",
    },
    webhook: {
      path: "/pagos/webhook",
      method: "POST",
      requiresAuth: false,
      description: "Webhook para pagos",
    },
    crearIntent: {
      path: "/pagos/intent",
      method: "POST",
      requiresAuth: true,
      description: "Crear intent de pago",
    },
  },
  [ResourceType.RESENAS]: {
    [ResourceAction.LIST]: {
      path: "/resenas",
      method: "GET",
      requiresAuth: false,
      description: "Obtener lista de reseñas",
    },
    [ResourceAction.GET]: {
      path: "/resenas/:id",
      method: "GET",
      requiresAuth: false,
      description: "Obtener detalles de una reseña",
    },
    [ResourceAction.CREATE]: {
      path: "/resenas",
      method: "POST",
      requiresAuth: true,
      description: "Crear una nueva reseña",
    },
    [ResourceAction.UPDATE]: {
      path: "/resenas/:id",
      method: "PUT",
      requiresAuth: true,
      description: "Actualizar una reseña",
    },
    [ResourceAction.DELETE]: {
      path: "/resenas/:id",
      method: "DELETE",
      requiresAuth: true,
      description: "Eliminar una reseña",
    },
    porDestino: {
      path: "/destinos/:destinoId/resenas",
      method: "GET",
      requiresAuth: false,
      description: "Obtener reseñas de un destino",
    },
    porUsuario: {
      path: "/usuarios/:userId/resenas",
      method: "GET",
      requiresAuth: true,
      description: "Obtener reseñas de un usuario",
    },
  },
  [ResourceType.AUTH]: {
    login: {
      path: "/auth/login",
      method: "POST",
      requiresAuth: false,
      description: "Iniciar sesión",
    },
    register: {
      path: "/auth/register",
      method: "POST",
      requiresAuth: false,
      description: "Registrar nuevo usuario",
    },
    logout: {
      path: "/auth/logout",
      method: "POST",
      requiresAuth: true,
      description: "Cerrar sesión",
    },
    refresh: {
      path: "/auth/refresh",
      method: "POST",
      requiresAuth: false,
      description: "Renovar token",
    },
    forgotPassword: {
      path: "/auth/forgot-password",
      method: "POST",
      requiresAuth: false,
      description: "Solicitar recuperación de contraseña",
    },
    resetPassword: {
      path: "/auth/reset-password",
      method: "POST",
      requiresAuth: false,
      description: "Restablecer contraseña",
    },
    verifyEmail: {
      path: "/auth/verify-email",
      method: "POST",
      requiresAuth: false,
      description: "Verificar email",
    },
  },
}

/**
 * Obtiene la ruta de un endpoint
 * @param resource Tipo de recurso
 * @param action Acción o nombre del endpoint
 * @param params Parámetros para reemplazar en la ruta
 * @returns Ruta completa del endpoint
 */
export function getEndpointPath(
  resource: ResourceType,
  action: ResourceAction | string,
  params: Record<string, string | number> = {},
): string {
  const endpoint = endpoints[resource][action]

  if (!endpoint) {
    throw new Error(`Endpoint no encontrado: ${resource}.${action}`)
  }

  let path = endpoint.path

  // Reemplazar parámetros en la ruta
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, String(value))
  })

  return path
}

/**
 * Obtiene la configuración completa de un endpoint
 * @param resource Tipo de recurso
 * @param action Acción o nombre del endpoint
 * @returns Configuración del endpoint
 */
export function getEndpoint(resource: ResourceType, action: ResourceAction | string): Endpoint {
  const endpoint = endpoints[resource][action]

  if (!endpoint) {
    throw new Error(`Endpoint no encontrado: ${resource}.${action}`)
  }

  return endpoint
}

export default endpoints
