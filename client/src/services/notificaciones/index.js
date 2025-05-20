import { apiClient } from "../api/client"; 
 
// Callbacks para manejar notificaciones 
const notificationCallbacks = new Set(); 
 
/** 
 * Servicio para gestionar las notificaciones 
 */ 
export const notificacionesService = { 
  /** 
   * Solicita permiso para recibir notificaciones push 
   * @returns {Promise<boolean>} true si se concedió permiso, false en caso contrario 
   */ 
  async requestPermission() { 
    try { 
      console.log("Solicitando permiso para notificaciones (mock)..."); 
      return true; 
    } catch (error) { 
      console.error("Error al solicitar permiso para notificaciones:", error); 
      return false; 
    } 
  }, 
 
  /** 
   * Registra un token de notificación en la API 
   * @param {string} token - Token de notificación 
   * @returns {Promise<Object>} Resultado del registro 
   */ 
  async registerToken(token) { 
    try { 
      console.log("Registrando token de notificación (mock):", token); 
      return { success: true }; 
    } catch (error) { 
      console.error("Error al registrar token de notificación:", error); 
      throw error; 
    } 
  }, 
 
  /** 
   * Obtiene las notificaciones del usuario 
   * @param {Object} options - Opciones de la petición 
   * @returns {Promise<Array>} Lista de notificaciones 
   */ 
  async getNotifications(options = {}) { 
    const { limit = 20, offset = 0, includeRead = false } = options; 
 
    try { 
      // Datos mock para desarrollo 
      const mockNotifications = [ 
        { 
          id: "1", 
          title: "Oferta especial", 
          message: "¡50% de descuento en tu próximo viaje a Marte!", 
          data: {}, 
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás 
          read: false, 
        }, 
        { 
          id: "2", 
          title: "Recordatorio de viaje", 
          message: "Tu viaje a la Luna comienza en 3 días", 
          data: {}, 
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás 
          read: includeRead, 
        }, 
        { 
          id: "3", 
          title: "Actualización de itinerario", 
          message: "Se ha actualizado el itinerario de tu viaje a Júpiter", 
          data: {}, 
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás 
          read: true, 
        }, 
      ]; 
 
      // Filtrar notificaciones leídas si es necesario 
      const filteredNotifications = includeRead 
        ? mockNotifications 
        : mockNotifications.filter(n => !n.read); 
 
      // Aplicar paginación 
      const paginatedNotifications = filteredNotifications.slice(offset, offset + limit); 
 
      console.log("Obteniendo notificaciones (mock):", paginatedNotifications); 
      return paginatedNotifications; 
    } catch (error) { 
      console.error("Error al obtener notificaciones:", error); 
      throw error; 
    } 
  }, 
 
  /** 
   * Marca una notificación como leída 
   * @param {string} notificationId - ID de la notificación 
   * @returns {Promise<Object>} Resultado de la operación 
   */ 
  async markAsRead(notificationId) { 
    try { 
      console.log(`Marcando notificación ${notificationId} como leída (mock)`); 
      return { success: true }; 
    } catch (error) { 
      console.error(`Error al marcar notificación ${notificationId} como leída:`, error); 
      throw error; 
    } 
  }, 
 
  /** 
   * Marca todas las notificaciones como leídas 
   * @returns {Promise<Object>} Resultado de la operación 
   */ 
  async markAllAsRead() { 
    try { 
      console.log("Marcando todas las notificaciones como leídas (mock)"); 
      return { success: true }; 
    } catch (error) { 
      console.error("Error al marcar todas las notificaciones como leídas:", error); 
      throw error; 
    } 
  }, 
 
  /** 
   * Elimina una notificación 
   * @param {string} notificationId - ID de la notificación 
   * @returns {Promise<Object>} Resultado de la operación 
   */ 
  async deleteNotification(notificationId) { 
    try { 
      console.log(`Eliminando notificación ${notificationId} (mock)`); 
      return { success: true }; 
    } catch (error) { 
      console.error(`Error al eliminar notificación ${notificationId}:`, error); 
      throw error; 
    } 
  }, 
 
  /** 
   * Elimina todas las notificaciones 
   * @returns {Promise<Object>} Resultado de la operación 
   */ 
  async deleteAllNotifications() { 
    try { 
      console.log("Eliminando todas las notificaciones (mock)"); 
      return { success: true }; 
    } catch (error) { 
      console.error("Error al eliminar todas las notificaciones:", error); 
      throw error; 
    } 
  }, 
 
  /** 
   * Registra un callback para recibir notificaciones en tiempo real 
   * @param {Function} callback - Función a llamar cuando se recibe una notificación 
   * @returns {Function} Función para cancelar el registro 
   */ 
  onNotification(callback) { 
    notificationCallbacks.add(callback); 
 
    // Devolver función para cancelar el registro 
    return () => { 
      notificationCallbacks.delete(callback); 
    }; 
  }, 
 
  /** 
   * Verifica si las notificaciones están disponibles 
   * @returns {boolean} true si las notificaciones están disponibles, false en caso contrario 
   */ 
  isAvailable() { 
    return true; // Siempre disponible en mock 
  }, 
 
  /** 
   * Verifica si se ha concedido permiso para notificaciones 
   * @returns {boolean} true si se ha concedido permiso, false en caso contrario 
   */ 
  hasPermission() { 
    return true; // Siempre con permiso en mock 
  }, 
}; 
 
// También exportamos como default para compatibilidad 
export default notificacionesService; 
