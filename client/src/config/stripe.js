/**
 * Configuración de Stripe para la aplicación
 */

// Configuración para el entorno de desarrollo y producción
const STRIPE_CONFIG = {
  development: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_DEV || "pk_test_sample",
    apiVersion: "2023-10-16",
    locale: "es",
    elements: {
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#0a2540",
          colorBackground: "#ffffff",
          colorText: "#30313d",
          colorDanger: "#df1b41",
          fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
          spacingUnit: "4px",
          borderRadius: "4px",
        },
        rules: {
          ".Input": {
            border: "1px solid #e6e6e6",
            boxShadow: "0 1px 3px 0 #e6ebf1",
          },
          ".Input:focus": {
            border: "1px solid #0a2540",
            boxShadow: "0 1px 3px 0 #cfd7df",
          },
        },
      },
    },
  },
  production: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_live_sample",
    apiVersion: "2023-10-16",
    locale: "es",
    elements: {
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#0a2540",
          colorBackground: "#ffffff",
          colorText: "#30313d",
          colorDanger: "#df1b41",
          fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
          spacingUnit: "4px",
          borderRadius: "4px",
        },
      },
    },
  },
}

// Configuración para pagos
export const PAYMENT_CONFIG = {
  currency: "eur",
  supportedCountries: ["ES", "US", "GB", "FR", "DE", "IT"],
  paymentMethods: ["card", "sepa_debit", "ideal", "bancontact"],
  allowSavePaymentMethod: true,
  billingDetails: {
    required: ["name", "email"],
    optional: ["phone", "address"],
  },
  webhookEndpoint: "/api/webhooks/stripe",
  successUrl: "/pago-completado",
  cancelUrl: "/pago-cancelado",
}

/**
 * Determina si la aplicación está en modo desarrollo
 * @returns {boolean} true si está en modo desarrollo
 */
export function isDevMode() {
  return import.meta.env.DEV || import.meta.env.MODE === "development"
}

/**
 * Obtiene la configuración de Stripe según el entorno
 * @returns {Object} Configuración de Stripe
 */
export function getStripeConfig() {
  return isDevMode() ? STRIPE_CONFIG.development : STRIPE_CONFIG.production
}

/**
 * Obtiene la configuración de pagos
 * @returns {Object} Configuración de pagos
 */
export function getPaymentConfig() {
  return PAYMENT_CONFIG
}

export default {
  getStripeConfig,
  getPaymentConfig,
  isDevMode,
  PAYMENT_CONFIG,
}
