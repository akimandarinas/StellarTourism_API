/**
 * Utilidades para manejo de errores
 */

/**
 * Maneja errores generales y devuelve un mensaje de error amigable
 * @param {Error} error - Error a manejar
 * @param {Object} options - Opciones adicionales
 * @returns {string} Mensaje de error formateado
 */
export function handleError(error, options = {}) {
  const { toast = true, silent = false } = options;
  
  // Obtener mensaje de error
  let errorMessage = error.message || 'Ha ocurrido un error inesperado';
  
  // Registrar el error en la consola si no es silencioso
  if (!silent) {
    console.error('Error:', error);
  }
  
  // Mostrar toast si está habilitado
  if (toast && window.showToast) {
    window.showToast({
      message: errorMessage,
      type: 'error',
      duration: 5000
    });
  }
  
  return errorMessage;
}

/**
 * Maneja errores de Firebase y devuelve un mensaje de error amigable
 * @param {Error} error - Error de Firebase
 * @param {Object} options - Opciones adicionales
 * @returns {string} Mensaje de error formateado
 */
export function handleFirebaseError(error, options = {}) {
  const { toast = true, silent = false } = options;
  
  // Si es un error de Firebase, extraer el código
  const errorCode = error.code || '';
  
  // Mapeo de códigos de error a mensajes amigables
  const errorMessages = {
    'auth/user-not-found': 'No se encontró ninguna cuenta con este correo electrónico',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Este correo electrónico ya está en uso',
    'auth/weak-password': 'La contraseña es demasiado débil',
    'auth/invalid-email': 'El formato del correo electrónico no es válido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/requires-recent-login': 'Esta operación es sensible y requiere autenticación reciente',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Por favor, inténtalo más tarde',
    'auth/network-request-failed': 'Error de red. Comprueba tu conexión a internet',
    'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
    'auth/unauthorized-domain': 'Este dominio no está autorizado',
    'auth/operation-not-allowed': 'Esta operación no está permitida',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo electrónico pero con diferentes credenciales',
  };
  
  // Obtener mensaje de error
  let errorMessage = errorMessages[errorCode] || error.message || 'Ha ocurrido un error';
  
  // Registrar el error en la consola si no es silencioso
  if (!silent) {
    console.error('Error de Firebase:', error);
  }
  
  // Mostrar toast si está habilitado
  if (toast && window.showToast) {
    window.showToast({
      message: errorMessage,
      type: 'error',
      duration: 5000
    });
  }
  
  return errorMessage;
}

/**
 * Maneja errores generales de la API
 * @param {Error} error - Error de la API
 * @param {Object} options - Opciones adicionales
 * @returns {string} Mensaje de error formateado
 */
export function handleApiError(error, options = {}) {
  const { toast = true, silent = false } = options;
  
  // Obtener mensaje de error
  let errorMessage = error.message || 'Ha ocurrido un error en la comunicación con el servidor';
  
  // Registrar el error en la consola si no es silencioso
  if (!silent) {
    console.error('Error de API:', error);
  }
  
  // Mostrar toast si está habilitado
  if (toast && window.showToast) {
    window.showToast({
      message: errorMessage,
      type: 'error',
      duration: 5000
    });
  }
  
  return errorMessage;
}