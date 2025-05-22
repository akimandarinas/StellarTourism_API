/**
 * Servicio de API para realizar peticiones HTTP
 */
export const apiService = {
  /**
   * Realiza una petición GET
   * @param {string} url - URL de la petición
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta de la petición
   */
  get: async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error en petición GET:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Realiza una petición POST
   * @param {string} url - URL de la petición
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta de la petición
   */
  post: async (url, data, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Error en petición POST:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Realiza una petición PUT
   * @param {string} url - URL de la petición
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta de la petición
   */
  put: async (url, data, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Error en petición PUT:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Realiza una petición DELETE
   * @param {string} url - URL de la petición
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta de la petición
   */
  delete: async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error en petición DELETE:', error);
      return { success: false, error: error.message };
    }
  }
};

// Alias para compatibilidad con código existente
export const api = apiService;

// Exportar por defecto para compatibilidad con importaciones default
export default apiService;

/**
 * Obtiene los detalles de una reserva
 * @param {string|number} id - ID de la reserva
 * @returns {Promise<Object>} Detalles de la reserva
 */
export async function fetchReserva(id) {
  const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:8000/api';
  const url = `${baseUrl}/reservas/${id}`;
  
  try {
    const response = await apiService.get(url);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener la reserva');
    }
    return response.data;
  } catch (error) {
    console.error('Error en fetchReserva:', error);
    throw error;
  }
}

/**
 * Cancela una reserva existente
 * @param {string|number} id - ID de la reserva
 * @returns {Promise<Object>} Resultado de la cancelación
 */
export async function cancelarReservaAPI(id) {
  const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:8000/api';
  const url = `${baseUrl}/reservas/${id}/cancelar`;
  
  try {
    const response = await apiService.post(url, { id });
    if (!response.success) {
      throw new Error(response.error || 'Error al cancelar la reserva');
    }
    return response.data;
  } catch (error) {
    console.error('Error en cancelarReservaAPI:', error);
    throw error;
  }
}

/**
 * Crea un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario creado
 */
export async function crearUsuario(userData) {
  const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:8000/api';
  const url = `${baseUrl}/usuarios`;
  
  try {
    const response = await apiService.post(url, userData);
    if (!response.success) {
      throw new Error(response.error || 'Error al crear el usuario');
    }
    return response.data;
  } catch (error) {
    console.error('Error en crearUsuario:', error);
    throw error;
  }
}