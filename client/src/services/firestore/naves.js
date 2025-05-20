import { firestoreService } from "./index"

const COLLECTION_NAME = "naves"

/**
 * Servicio para gestionar naves en Firestore
 */
export const navesService = {
  /**
   * Obtiene todas las naves
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} - Array de naves
   */
  async getNaves(options = {}) {
    return firestoreService.getDocuments(COLLECTION_NAME, options)
  },

  /**
   * Obtiene una nave por ID
   * @param {string} id - ID de la nave
   * @returns {Promise<Object|null>} - Nave o null si no existe
   */
  async getNave(id) {
    return firestoreService.getDocument(COLLECTION_NAME, id)
  },

  /**
   * Crea una nueva nave
   * @param {Object} data - Datos de la nave
   * @returns {Promise<Object>} - Nave creada
   */
  async createNave(data) {
    return firestoreService.createDocument(COLLECTION_NAME, data)
  },

  /**
   * Actualiza una nave existente
   * @param {string} id - ID de la nave
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Nave actualizada
   */
  async updateNave(id, data) {
    return firestoreService.updateDocument(COLLECTION_NAME, id, data)
  },

  /**
   * Elimina una nave
   * @param {string} id - ID de la nave
   * @returns {Promise<void>}
   */
  async deleteNave(id) {
    return firestoreService.deleteDocument(COLLECTION_NAME, id)
  },

  /**
   * Escucha cambios en una nave
   * @param {string} id - ID de la nave
   * @param {Function} callback - Función a ejecutar cuando hay cambios
   * @returns {Function} - Función para cancelar la suscripción
   */
  listenToNave(id, callback) {
    return firestoreService.listenToDocument(COLLECTION_NAME, id, callback)
  },

  /**
   * Escucha cambios en todas las naves
   * @param {Object} options - Opciones de consulta
   * @param {Function} callback - Función a ejecutar cuando hay cambios
   * @returns {Function} - Función para cancelar la suscripción
   */
  listenToNaves(options = {}, callback) {
    return firestoreService.listenToCollection(COLLECTION_NAME, options, callback)
  },
}

export default navesService
