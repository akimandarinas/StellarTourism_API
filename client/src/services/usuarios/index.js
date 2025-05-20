import { apiService } from "../api"

/**
 * Servicio para gestionar usuarios
 */
export const usuariosService = {
  /**
   * Obtiene el perfil de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} - Perfil del usuario
   */
  async getProfile(userId) {
    if (!userId) throw new Error("ID de usuario requerido")

    try {
      const response = await apiService.get(`/usuarios/${userId}/perfil`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener perfil del usuario ${userId}:`, error)
      throw error
    }
  },

  /**
   * Actualiza el perfil de un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Perfil actualizado
   */
  async updateProfile(userId, data) {
    if (!userId) throw new Error("ID de usuario requerido")

    try {
      const response = await apiService.put(`/usuarios/${userId}/perfil`, data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar perfil del usuario ${userId}:`, error)
      throw error
    }
  },

  /**
   * Obtiene las preferencias de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} - Preferencias del usuario
   */
  async getPreferences(userId) {
    if (!userId) throw new Error("ID de usuario requerido")

    try {
      const response = await apiService.get(`/usuarios/${userId}/preferencias`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener preferencias del usuario ${userId}:`, error)
      throw error
    }
  },

  /**
   * Actualiza las preferencias de un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} preferences - Preferencias a actualizar
   * @returns {Promise<Object>} - Preferencias actualizadas
   */
  async updatePreferences(userId, preferences) {
    if (!userId) throw new Error("ID de usuario requerido")

    try {
      const response = await apiService.put(`/usuarios/${userId}/preferencias`, preferences)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar preferencias del usuario ${userId}:`, error)
      throw error
    }
  },

  /**
   * Obtiene los métodos de pago de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} - Métodos de pago del usuario
   */
  async getPaymentMethods(userId) {
    if (!userId) throw new Error("ID de usuario requerido")

    try {
      const response = await apiService.get(`/usuarios/${userId}/metodos-pago`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener métodos de pago del usuario ${userId}:`, error)
      throw error
    }
  },

  /**
   * Añade un método de pago a un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} paymentMethod - Método de pago a añadir
   * @returns {Promise<Object>} - Método de pago añadido
   */
  async addPaymentMethod(userId, paymentMethod) {
    if (!userId) throw new Error("ID de usuario requerido")

    try {
      const response = await apiService.post(`/usuarios/${userId}/metodos-pago`, paymentMethod)
      return response.data
    } catch (error) {
      console.error(`Error al añadir método de pago al usuario ${userId}:`, error)
      throw error
    }
  },

  /**
   * Elimina un método de pago de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} paymentMethodId - ID del método de pago
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deletePaymentMethod(userId, paymentMethodId) {
    if (!userId) throw new Error("ID de usuario requerido")
    if (!paymentMethodId) throw new Error("ID de método de pago requerido")

    try {
      await apiService.delete(`/usuarios/${userId}/metodos-pago/${paymentMethodId}`)
      return true
    } catch (error) {
      console.error(`Error al eliminar método de pago ${paymentMethodId} del usuario ${userId}:`, error)
      throw error
    }
  },
}

export default usuariosService
