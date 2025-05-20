/**
 * Configuración centralizada de la aplicación
 * Este archivo exporta toda la configuración necesaria para la aplicación
 */
import * as firebaseConfig from "./firebase"
import * as stripeConfig from "./stripe"

export const config = {
  firebase: firebaseConfig,
  stripe: stripeConfig,
  api: {
    baseUrl: import.meta.env.VITE_API_URL || "/api",
    timeout: 30000,
    retryAttempts: 3,
  },
  app: {
    name: "Stellar Tourism",
    version: import.meta.env.VITE_APP_VERSION || "1.0.0",
    environment: import.meta.env.MODE || "development",
  },
}

export default config

// Exportar variables individuales para facilitar su uso
export const {
  firebase: FIREBASE_CONFIG,
  stripe: STRIPE_CONFIG,
  api: { baseUrl: API_URL, timeout: API_TIMEOUT, retryAttempts: API_RETRY_COUNT },
  app: { name: APP_NAME, version: APP_VERSION, environment: APP_ENVIRONMENT },
} = config

// Exportar la clave VAPID para notificaciones push
export const FIREBASE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || ""
