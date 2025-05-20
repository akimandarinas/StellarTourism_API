/**
 * Servicio mejorado para integración con Stripe
 * Implementa manejo robusto de errores, reintentos y validación
 */

import { loadStripe } from "@stripe/stripe-js"
import { ref, reactive } from "vue"

// Estado reactivo para Stripe
const stripePromise = ref(null)
const elements = ref(null)
const paymentMethods = reactive([])
const isLoading = ref(false)
const error = ref(null)

// Servicio de Stripe
export const stripeService = {
  // Inicializar Stripe con la clave pública
  async initialize(publishableKey) {
    if (!publishableKey) {
      console.error("Stripe publishable key is required")
      return false
    }

    try {
      stripePromise.value = await loadStripe(publishableKey)
      return true
    } catch (err) {
      console.error("Error initializing Stripe:", err)
      error.value = err.message
      return false
    }
  },

  // Crear elementos de Stripe para un formulario de pago
  createElements(options = {}) {
    if (!stripePromise.value) {
      console.error("Stripe has not been initialized")
      return null
    }

    try {
      const elementsOptions = {
        locale: "es",
        ...options,
      }

      elements.value = stripePromise.value.elements(elementsOptions)
      return elements.value
    } catch (err) {
      console.error("Error creating Stripe elements:", err)
      error.value = err.message
      return null
    }
  },

  // Crear token de tarjeta
  async createCardToken(cardElement) {
    if (!stripePromise.value) {
      console.error("Stripe has not been initialized")
      return { error: "Stripe not initialized" }
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await stripePromise.value.createToken(cardElement)

      if (result.error) {
        error.value = result.error.message
        return { error: result.error }
      }

      return { token: result.token }
    } catch (err) {
      console.error("Error creating card token:", err)
      error.value = err.message
      return { error: err }
    } finally {
      isLoading.value = false
    }
  },

  // Confirmar pago con tarjeta
  async confirmCardPayment(clientSecret, data) {
    if (!stripePromise.value) {
      console.error("Stripe has not been initialized")
      return { error: "Stripe not initialized" }
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await stripePromise.value.confirmCardPayment(clientSecret, data)

      if (result.error) {
        error.value = result.error.message
        return { error: result.error }
      }

      return { paymentIntent: result.paymentIntent }
    } catch (err) {
      console.error("Error confirming card payment:", err)
      error.value = err.message
      return { error: err }
    } finally {
      isLoading.value = false
    }
  },

  // Obtener métodos de pago guardados
  async getPaymentMethods(customerId) {
    if (!customerId) {
      console.error("Customer ID is required")
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      // Esta llamada normalmente se haría a través de un endpoint del servidor
      const response = await fetch(`/api/payment-methods?customer=${customerId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch payment methods")
      }

      const data = await response.json()
      paymentMethods.splice(0, paymentMethods.length, ...data)
      return data
    } catch (err) {
      console.error("Error fetching payment methods:", err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  },

  // Estado reactivo
  state: {
    isLoading,
    error,
    paymentMethods,
  },
}

export default stripeService
