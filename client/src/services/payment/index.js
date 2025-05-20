"use client"

/**
 * Servicio unificado de pagos
 * Soporta múltiples proveedores de pago (Stripe, PayPal, etc.)
 */

import { ref, computed } from "vue"
import { useToast } from "@composables/useToast"
import { loadStripe } from "@stripe/stripe-js"

// Estado compartido
const state = {
  isLoading: ref(false),
  paymentMethods: ref([]),
  selectedPaymentMethod: ref(null),
  error: ref(null),
  lastTransaction: ref(null),
  providers: {
    stripe: {
      instance: null,
      elements: null,
      isInitialized: false,
    },
  },
}

/**
 * Inicializar el servicio de pagos
 * @param {Object} options Opciones de inicialización
 * @returns {Promise<void>}
 */
export async function initializePaymentService(options = {}) {
  const {
    stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    loadStripeOnInit = true,
    loadPayPalOnInit = false,
  } = options

  try {
    state.isLoading.value = true

    // Inicializar Stripe si está habilitado
    if (loadStripeOnInit && stripePublicKey) {
      await initializeStripe(stripePublicKey)
    }

    // Inicializar PayPal si está habilitado
    if (loadPayPalOnInit) {
      await initializePayPal()
    }

    state.isLoading.value = false
  } catch (error) {
    state.error.value = error.message || "Error al inicializar el servicio de pagos"
    state.isLoading.value = false
    console.error("Error al inicializar el servicio de pagos:", error)
  }
}

/**
 * Inicializar Stripe
 * @param {string} publicKey Clave pública de Stripe
 * @returns {Promise<void>}
 */
async function initializeStripe(publicKey) {
  if (!publicKey) {
    throw new Error("Se requiere una clave pública de Stripe")
  }

  try {
    state.providers.stripe.instance = await loadStripe(publicKey)
    state.providers.stripe.isInitialized = true
  } catch (error) {
    console.error("Error al inicializar Stripe:", error)
    throw new Error("No se pudo inicializar Stripe")
  }
}

/**
 * Inicializar PayPal
 * @returns {Promise<void>}
 */
async function initializePayPal() {
  // Implementación de inicialización de PayPal
  console.log("Inicialización de PayPal no implementada")
}

/**
 * Crear elementos de pago de Stripe
 * @param {Object} options Opciones para los elementos
 * @returns {Object} Elementos de Stripe
 */
export function createStripeElements(options = {}) {
  if (!state.providers.stripe.isInitialized) {
    throw new Error("Stripe no está inicializado")
  }

  const { appearance = { theme: "stripe" }, locale = "es" } = options

  const elements = state.providers.stripe.instance.elements({
    appearance,
    locale,
  })

  state.providers.stripe.elements = elements

  return elements
}

/**
 * Procesar pago con Stripe
 * @param {Object} paymentData Datos del pago
 * @returns {Promise<Object>} Resultado del pago
 */
export async function processStripePayment(paymentData) {
  const { amount, currency = "eur", paymentMethodId, customerId, description, metadata = {} } = paymentData

  if (!state.providers.stripe.isInitialized) {
    throw new Error("Stripe no está inicializado")
  }

  try {
    state.isLoading.value = true

    // Crear intención de pago en el servidor
    const response = await fetch("/api/pagos/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        payment_method_id: paymentMethodId,
        customer_id: customerId,
        description,
        metadata,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error al procesar el pago")
    }

    const { clientSecret, id } = await response.json()

    // Confirmar el pago con Stripe
    const { error, paymentIntent } = await state.providers.stripe.instance.confirmCardPayment(clientSecret)

    if (error) {
      throw new Error(error.message || "Error al confirmar el pago")
    }

    // Guardar la transacción exitosa
    state.lastTransaction.value = {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      created: new Date(paymentIntent.created * 1000),
      paymentMethod: paymentIntent.payment_method,
    }

    state.isLoading.value = false

    return {
      success: true,
      paymentIntent,
    }
  } catch (error) {
    state.error.value = error.message || "Error al procesar el pago"
    state.isLoading.value = false

    console.error("Error al procesar el pago con Stripe:", error)

    return {
      success: false,
      error: error.message || "Error al procesar el pago",
    }
  }
}

/**
 * Obtener métodos de pago guardados
 * @param {string} customerId ID del cliente
 * @returns {Promise<Array>} Métodos de pago
 */
export async function fetchSavedPaymentMethods(customerId) {
  if (!customerId) {
    throw new Error("Se requiere un ID de cliente")
  }

  try {
    state.isLoading.value = true

    const response = await fetch(`/api/pagos/payment-methods/${customerId}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error al obtener los métodos de pago")
    }

    const { paymentMethods } = await response.json()

    state.paymentMethods.value = paymentMethods
    state.isLoading.value = false

    return paymentMethods
  } catch (error) {
    state.error.value = error.message || "Error al obtener los métodos de pago"
    state.isLoading.value = false

    console.error("Error al obtener los métodos de pago:", error)

    return []
  }
}

/**
 * Guardar un nuevo método de pago
 * @param {Object} paymentMethodData Datos del método de pago
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function savePaymentMethod(paymentMethodData) {
  const { customerId, paymentMethodId, makeDefault = false } = paymentMethodData

  if (!customerId || !paymentMethodId) {
    throw new Error("Se requiere un ID de cliente y un ID de método de pago")
  }

  try {
    state.isLoading.value = true

    const response = await fetch("/api/pagos/save-payment-method", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customerId,
        payment_method_id: paymentMethodId,
        make_default: makeDefault,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error al guardar el método de pago")
    }

    const result = await response.json()

    // Actualizar la lista de métodos de pago
    await fetchSavedPaymentMethods(customerId)

    state.isLoading.value = false

    return {
      success: true,
      paymentMethod: result.paymentMethod,
    }
  } catch (error) {
    state.error.value = error.message || "Error al guardar el método de pago"
    state.isLoading.value = false

    console.error("Error al guardar el método de pago:", error)

    return {
      success: false,
      error: error.message || "Error al guardar el método de pago",
    }
  }
}

/**
 * Eliminar un método de pago
 * @param {Object} data Datos para eliminar el método de pago
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function deletePaymentMethod(data) {
  const { customerId, paymentMethodId } = data

  if (!customerId || !paymentMethodId) {
    throw new Error("Se requiere un ID de cliente y un ID de método de pago")
  }

  try {
    state.isLoading.value = true

    const response = await fetch(`/api/pagos/delete-payment-method`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customerId,
        payment_method_id: paymentMethodId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error al eliminar el método de pago")
    }

    // Actualizar la lista de métodos de pago
    await fetchSavedPaymentMethods(customerId)

    state.isLoading.value = false

    return {
      success: true,
    }
  } catch (error) {
    state.error.value = error.message || "Error al eliminar el método de pago"
    state.isLoading.value = false

    console.error("Error al eliminar el método de pago:", error)

    return {
      success: false,
      error: error.message || "Error al eliminar el método de pago",
    }
  }
}

/**
 * Composable para usar el servicio de pagos
 * @returns {Object} Métodos y estado del servicio de pagos
 */
export function usePaymentService() {
  const toast = useToast()

  // Computed properties
  const isLoading = computed(() => state.isLoading.value)
  const paymentMethods = computed(() => state.paymentMethods.value)
  const selectedPaymentMethod = computed(() => state.selectedPaymentMethod.value)
  const error = computed(() => state.error.value)
  const lastTransaction = computed(() => state.lastTransaction.value)

  // Métodos
  const selectPaymentMethod = (paymentMethodId) => {
    state.selectedPaymentMethod.value = paymentMethodId
  }

  const clearError = () => {
    state.error.value = null
  }

  const processPayment = async (paymentData) => {
    try {
      const result = await processStripePayment(paymentData)

      if (result.success) {
        toast.success("Pago completado", "El pago se ha procesado correctamente")
      } else {
        toast.error("Error en el pago", result.error)
      }

      return result
    } catch (error) {
      toast.error("Error en el pago", error.message || "Error al procesar el pago")
      return {
        success: false,
        error: error.message || "Error al procesar el pago",
      }
    }
  }

  return {
    // Estado
    isLoading,
    paymentMethods,
    selectedPaymentMethod,
    error,
    lastTransaction,

    // Métodos
    initializePaymentService,
    createStripeElements,
    processPayment,
    fetchSavedPaymentMethods,
    savePaymentMethod,
    deletePaymentMethod,
    selectPaymentMethod,
    clearError,
  }
}
