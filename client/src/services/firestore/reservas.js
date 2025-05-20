import { firestoreService } from "./index"

const COLLECTION_NAME = "reservas"

/**
 * Servicio para gestionar reservas en Firestore
 */
export const reservasService = {
  /**
   * Obtiene todas las reservas
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} - Array de reservas
   */
  async getReservas(options = {}) {
    return firestoreService.getDocuments(COLLECTION_NAME, options)
  },

  /**
   * Obtiene las reservas de un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones adicionales de consulta
   * @returns {Promise<Array>} - Array de reservas del usuario
   */
  async getReservasUsuario(userId, options = {}) {
    const filters = [{ field: "userId", operator: "==", value: userId }]

    return firestoreService.getDocuments(COLLECTION_NAME, {
      ...options,
      filters: [...(options.filters || []), ...filters],
    })
  },

  /**
   * Obtiene una reserva por ID
   * @param {string} id - ID de la reserva
   * @returns {Promise<Object|null>} - Reserva o null si no existe
   */
  async getReserva(id) {
    return firestoreService.getDocument(COLLECTION_NAME, id)
  },

  /**
   * Crea una nueva reserva
   * @param {Object} data - Datos de la reserva
   * @returns {Promise<Object>} - Reserva creada
   */
  async createReserva(data) {
    return firestoreService.createDocument(COLLECTION_NAME, data)
  },

  /**
   * Actualiza una reserva existente
   * @param {string} id - ID de la reserva
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Reserva actualizada
   */
  async updateReserva(id, data) {
    return firestoreService.updateDocument(COLLECTION_NAME, id, data)
  },

  /**
   * Elimina una reserva
   * @param {string} id - ID de la reserva
   * @returns {Promise<void>}
   */
  async deleteReserva(id) {
    return firestoreService.deleteDocument(COLLECTION_NAME, id)
  },

  /**
   * Escucha cambios en una reserva
   * @param {string} id - ID de la reserva
   * @param {Function} callback - Función a ejecutar cuando hay cambios
   * @returns {Function} - Función para cancelar la suscripción
   */
  listenToReserva(id, callback) {
    return firestoreService.listenToDocument(COLLECTION_NAME, id, callback)
  },

  /**
   * Escucha cambios en todas las reservas
   * @param {Object} options - Opciones de consulta
   * @param {Function} callback - Función a ejecutar cuando hay cambios
   * @returns {Function} - Función para cancelar la suscripción
   */
  listenToReservas(options = {}, callback) {
    return firestoreService.listenToCollection(COLLECTION_NAME, options, callback)
  },

  /**
   * Escucha cambios en las reservas de un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones adicionales de consulta
   * @param {Function} callback - Función a ejecutar cuando hay cambios
   * @returns {Function} - Función para cancelar la suscripción
   */
  listenToReservasUsuario(userId, options = {}, callback) {
    const filters = [{ field: "userId", operator: "==", value: userId }]

    return firestoreService.listenToCollection(
      COLLECTION_NAME,
      {
        ...options,
        filters: [...(options.filters || []), ...filters],
      },
      callback,
    )
  },
}

export default reservasService
