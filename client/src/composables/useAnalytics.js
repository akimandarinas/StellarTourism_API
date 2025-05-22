//Verificar si estamos en un navegador
const isBrowser = () => typeof window !== "undefined"

//Verificar si estamos en modo de desarrollo
const isDev = import.meta.env?.DEV || false

const sendToAnalyticsService = (eventName, eventData) => {
  if (isDev) {
    console.log(`[Analytics] ${eventName}:`, eventData)
    return Promise.resolve({ success: true })
  }

  //Aquí iría la lógica para enviar el evento a un servicio real de análisis
  return Promise.resolve({ success: true })
}

const trackEvent = (eventName, eventData = {}) => {
  if (!isBrowser()) return Promise.resolve({ success: false, reason: "not-browser" })

  return sendToAnalyticsService(eventName, {
    ...eventData,
    timestamp: new Date().toISOString(),
  })
}

const trackPageView = (pageName, pageData = {}) => {
  if (!isBrowser()) return Promise.resolve({ success: false, reason: "not-browser" })

  return sendToAnalyticsService("page_view", {
    page_name: pageName,
    page_path: window.location.pathname,
    ...pageData,
    timestamp: new Date().toISOString(),
  })
}

const trackConversion = (conversionType, conversionData = {}) => {
  if (!isBrowser()) return Promise.resolve({ success: false, reason: "not-browser" })

  return sendToAnalyticsService("conversion", {
    conversion_type: conversionType,
    ...conversionData,
    timestamp: new Date().toISOString(),
  })
}

const trackError = (errorType, errorMessage, errorData = {}) => {
  if (!isBrowser()) return Promise.resolve({ success: false, reason: "not-browser" })

  return sendToAnalyticsService("error", {
    error_type: errorType,
    error_message: errorMessage,
    ...errorData,
    timestamp: new Date().toISOString(),
  })
}

const setUserProperties = (properties = {}) => {
  if (!isBrowser()) return Promise.resolve({ success: false, reason: "not-browser" })

  return sendToAnalyticsService("set_user_properties", {
    ...properties,
    timestamp: new Date().toISOString(),
  })
}

export const useAnalytics = () => {
  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackError,
    setUserProperties,
  }
}
