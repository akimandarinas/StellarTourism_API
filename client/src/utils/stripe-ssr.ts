import { isClient, createClientProxy } from "./ssr-safe"
import { ref, shallowRef } from "vue"

// Estado global para Stripe
const stripeInstance = shallowRef(null)
const stripeElements = shallowRef(null)
const isInitialized = ref(false)
const isLoading = ref(false)
const error = ref(null)

// Función para inicializar Stripe de manera segura en SSR
export async function initializeStripe(options = {}) {
  // Si ya está inicializado o está cargando, no hacer nada
  if (isInitialized.value || isLoading.value) {
    return {
      stripe: stripeInstance.value,
      elements: stripeElements.value,
      isInitialized: isInitialized.value,
      isLoading: isLoading.value,
      error: error.value
    }
  }

  // Si estamos en el servidor, devolver objetos simulados
  if (!isClient()) {
    return {
      stripe: createMockStripe(),
      elements: null,
      isInitialized: false,
      isLoading: false,
      error: null
    }
  }

  // Marcar como cargando
  isLoading.value = true
  error.value = null

  try {
    // Cargar Stripe de manera dinámica
    const { loadStripe } = await import("@stripe/stripe-js")

    // Obtener la clave pública de Stripe
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

    if (!publishableKey) {
      throw new Error("Stripe publishable key is not defined")
    }

    // Inicializar Stripe
    const stripe = await loadStripe(publishableKey)

    if (!stripe) {
      throw new Error("Failed to load Stripe")
    }

    // Guardar referencias
    stripeInstance.value = stripe
    isInitialized.value = true

    // Inicializar Elements si se proporcionan opciones
    if (options.elementsOptions) {
      stripeElements.value = stripe.elements(options.elementsOptions)
    }

    return {
      stripe,
      elements: stripeElements.value,
      isInitialized: true,
      isLoading: false,
      error: null
    }
  } catch (err) {
    // Manejar errores
    console.error("Error initializing Stripe:", err)
    error.value = err

    return {
      stripe: createMockStripe(),
      elements: null,
      isInitialized: false,
      isLoading: false,
      error: err
    }
  } finally {
    // Marcar como no cargando
    isLoading.value = false
  }
}

// Función para crear un objeto simulado de Stripe para SSR
function createMockStripe() {
  return createClientProxy(() => ({
    elements: () => ({
      create: () => ({
        mount: () => {},
        unmount: () => {},
        on: () => {},
        update: () => {}
      }),
      getElement: () => null
    }),
    confirmCardPayment: async () => ({
      error: { message: "Stripe is not available in SSR" }
    }),
    confirmCardSetup: async () => ({
      error: { message: "Stripe is not available in SSR" }
    }),
    createPaymentMethod: async () => ({
      error: { message: "Stripe is not available in SSR" }
    })
  }))
}

// Composable para usar Stripe
export function useStripe(options = {}) {
  // Inicializar Stripe si no está inicializado
  if (isClient() && !isInitialized.value && !isLoading.value) {
    initializeStripe(options)
  }

  // Función para crear un elemento de Stripe
  const createElement = (type, elementOptions = {}) => {
    if (!isClient() || !stripeElements.value) {
      return null
    }

    return stripeElements.value.create(type, elementOptions)
  }

  // Función para confirmar un pago
  const confirmCardPayment = async (clientSecret, data) => {
    if (!isClient() || !stripeInstance.value) {
      return { error: { message: "Stripe is not available" } }
    }

    try {
      return await stripeInstance.value.confirmCardPayment(clientSecret, data)
    } catch (err) {
      console.error("Error confirming card payment:", err)
      return { error: err }
    }
  }

  return {
    stripe: stripeInstance,
    elements: stripeElements,
    isInitialized,
    isLoading,
    error,
    initializeStripe,
    createElement,
    confirmCardPayment
  }
}
