/**
 * Composable para rastrear eventos de análisis en la aplicación
 */

// Verificar si estamos en un navegador
const isBrowser = () => typeof window !== "undefined"

// Verificar si estamos en modo de desarrollo
const isDev = import.meta.env?.DEV || false

/**
 * Simula el envío de eventos a un servicio de análisis
 * En producción, esto se reemplazaría con llamadas reales a servicios como
 * Google Analytics, Mixpanel, etc.
 */
const sendToAnalyticsService = (eventName, eventData) => {
  if (isDev) {
    console.log(`[Analytics] ${eventName}:`, eventData)
    return Promise.resolve({ success: true })
  }

  // Aquí iría la lógica para enviar el evento a un servicio real de análisis
  // Por ejemplo, Google Analytics, Mixpanel, etc.
  return Promise.resolve({ success: true })
}

/**
 * Rastrear un evento específico con datos adicionales
 * @param {string} eventName - Nombre del evento
 * @param {Object} eventData - Datos adicionales del evento
 * @returns {Promise} - Promesa que se resuelve cuando el evento se ha enviado
 */
const trackEvent = (eventName, eventData = {}) => {
  if (!isBrowser()) return Promise.resolve({ success: false, reason: "not-browser" })

  return sendToAnalyticsService(eventName, {
    ...eventData,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Rastrear una vista de página
 * @param {string} pageName - Nombre de la página
 * @param {Object} pageData - Datos adicionales de la página
 * @returns {Promise} - Promesa que se resuelve cuando el evento se ha enviado
 */
const trackPageView = (pageName, pageData = {}) => {
  if (!isBrowser()) return Promise.resolve({ success: false, reason: "not-browser" })

  return sendToAnalyticsService("page_view", {
    page_name: pageName,
    page_path: window.location.pathname,
    ...pageData,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Rastrear una conversión (compra, registro, etc.)
 * @param {string} conversionType - Tipo de conversión
 * @param {Object} conversionData - Datos adicionales de la conversión
 * @returns {Promise} - Promesa que se resuelve cuando el evento se ha enviado
 */
const trackConversion = (conversionType, conversionData = {}) => {
  if (!isBrowser()) return Promise.resolve({ success: false, reason: "not-browser" })

  return sendToAnalyticsService("conversion", {
    conversion_type: conversionType,
    ...conversionData,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Rastrear un error
 * @param {string} errorType - Tipo de error
 * @param {string} errorMessage - Mensaje de error
 * @param {Object} errorData - Datos adicionales del error
 * @returns {Promise} - Promesa que se resuelve cuando el evento se ha enviado
 */
const trackError = (errorType, errorMessage, errorData = {}) => {
  if (!isBrowser()) return Promise.resolve({ success: false, reason: "not-browser" })

  return sendToAnalyticsService("error", {
    error_type: errorType,
    error_message: errorMessage,
    ...errorData,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Establecer propiedades del usuario
 * @param {Object} properties - Propiedades del usuario
 * @returns {Promise} - Promesa que se resuelve cuando las propiedades se han establecido
 */
const setUserProperties = (properties = {}) => {
  if (!isBrowser()) return Promise.resolve({ success: false, reason: "not-browser" })

  return sendToAnalyticsService("set_user_properties", {
    ...properties,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Composable para rastrear eventos de análisis
 * @returns {Object} - Funciones para rastrear eventos
 */
export const useAnalytics = () => {
  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackError,
    setUserProperties,
  }
}
