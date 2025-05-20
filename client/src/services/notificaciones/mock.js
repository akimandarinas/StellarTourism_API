/**
 * Mock para el servicio de notificaciones
 * Este archivo proporciona implementaciones simuladas para el desarrollo
 */

// Simular notificaciones
const mockNotifications = [
  {
    id: "1",
    title: "Oferta especial",
    message: "¡50% de descuento en tu próximo viaje a Marte!",
    data: { type: "offer", destinationId: "mars-01" },
    timestamp: new Date(Date.now() - 3600000),
    read: false,
  },
  {
    id: "2",
    title: "Recordatorio de viaje",
    message: "Tu viaje a la Luna comienza en 3 días",
    data: { type: "reminder", tripId: "moon-trip-123" },
    timestamp: new Date(Date.now() - 86400000),
    read: true,
  },
  {
    id: "3",
    title: "Actualización de itinerario",
    message: "Se ha modificado el horario de tu excursión en la Estación Espacial",
    data: { type: "update", activityId: "iss-tour-456" },
    timestamp: new Date(Date.now() - 172800000),
    read: false,
  },
]

// Callbacks para manejar notificaciones
const notificationCallbacks = new Set()

/**
 * Servicio mock para gestionar las notificaciones
 */
export const mockNotificacionesService = {
  /**
   * Simula solicitar permiso para recibir notificaciones push
   * @returns {Promise<boolean>} true si se concedió permiso, false en caso contrario
   */
  async requestPermission() {
    console.log("[MOCK] Solicitando permiso para notificaciones...")
    return Promise.resolve(true)
  },

  /**
   * Simula registrar un token de notificación en la API
   * @param {string} token - Token de notificación
   * @returns {Promise<Object>} Resultado del registro
   */
  async registerToken(token) {
    console.log("[MOCK] Registrando token:", token)
    return Promise.resolve({ success: true })
  },

  /**
   * Simula obtener las notificaciones del usuario
   * @param {Object} options - Opciones de la petición
   * @returns {Promise<Array>} Lista de notificaciones
   */
  async getNotifications(options = {}) {
    const { limit = 20, offset = 0, includeRead = false } = options

    console.log("[MOCK] Obteniendo notificaciones:", { limit, offset, includeRead })

    let notifications = [...mockNotifications]

    if (!includeRead) {
      notifications = notifications.filter((n) => !n.read)
    }

    return Promise.resolve(notifications.slice(offset, offset + limit))
  },

  /**
   * Simula marcar una notificación como leída
   * @param {string} notificationId - ID de la notificación
   * @returns {Promise<Object>} Resultado de la operación
   */
  async markAsRead(notificationId) {
    console.log("[MOCK] Marcando notificación como leída:", notificationId)
    return Promise.resolve({ success: true })
  },

  /**
   * Simula marcar todas las notificaciones como leídas
   * @returns {Promise<Object>} Resultado de la operación
   */
  async markAllAsRead() {
    console.log("[MOCK] Marcando todas las notificaciones como leídas")
    return Promise.resolve({ success: true })
  },

  /**
   * Simula eliminar una notificación
   * @param {string} notificationId - ID de la notificación
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteNotification(notificationId) {
    console.log("[MOCK] Eliminando notificación:", notificationId)
    return Promise.resolve({ success: true })
  },

  /**
   * Simula eliminar todas las notificaciones
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteAllNotifications() {
    console.log("[MOCK] Eliminando todas las notificaciones")
    return Promise.resolve({ success: true })
  },

  /**
   * Registra un callback para recibir notificaciones en tiempo real
   * @param {Function} callback - Función a llamar cuando se recibe una notificación
   * @returns {Function} Función para cancelar el registro
   */
  onNotification(callback) {
    notificationCallbacks.add(callback)

    // Simular una notificación después de 5 segundos
    setTimeout(() => {
      const notification = {
        id: Date.now().toString(),
        title: "Notificación simulada",
        message: "Esta es una notificación simulada para desarrollo",
        data: { type: "mock" },
        timestamp: new Date(),
        read: false,
      }

      callback(notification)
    }, 5000)

    // Devolver función para cancelar el registro
    return () => {
      notificationCallbacks.delete(callback)
    }
  },

  /**
   * Verifica si las notificaciones están disponibles
   * @returns {boolean} true si las notificaciones están disponibles, false en caso contrario
   */
  isAvailable() {
    return true
  },

  /**
   * Verifica si se ha concedido permiso para notificaciones
   * @returns {boolean} true si se ha concedido permiso, false en caso contrario
   */
  hasPermission() {
    return true
  },
}

export default mockNotificacionesService
