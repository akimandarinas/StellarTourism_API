import { ref, onMounted } from "vue"
import { isClient } from "../utils/ssr-safe"

// Tipos para Stripe
interface StripeElement {
  mount: (element: HTMLElement | string) => void
  unmount: () => void
  update: (options: any) => void
  on: (event: string, handler: (event: any) => void) => void
}

interface StripeElements {
  create: (type: string, options?: any) => StripeElement
  getElement: (type: string) => StripeElement | null
}

interface StripeInstance {
  elements: (options?: any) => StripeElements
  confirmCardPayment: (clientSecret: string, data: any) => Promise<any>
  confirmCardSetup: (clientSecret: string, data: any) => Promise<any>
  createPaymentMethod: (data: any) => Promise<any>
}

// Estado compartido para evitar múltiples inicializaciones
const stripeInitialized = ref(false)
const stripeInstance = ref<StripeInstance | null>(null)
const stripeElements = ref<StripeElements | null>(null)
const stripeLoading = ref(true)
const stripeError = ref<Error | null>(null)

// Composable para usar Stripe
export function useStripe(options?: { elementsOptions?: any }) {
  // Inicializar Stripe solo en el cliente
  async function initializeStripe() {
    if (!isClient() || stripeInitialized.value) return

    try {
      // Importar Stripe de manera dinámica
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

      stripeInstance.value = stripe

      // Inicializar Elements si se proporcionan opciones
      if (options?.elementsOptions) {
        stripeElements.value = stripe.elements(options.elementsOptions)
      }

      stripeInitialized.value = true
      stripeLoading.value = false
    } catch (error) {
      console.error("Error inicializando Stripe:", error)
      stripeError.value = error instanceof Error ? error : new Error("Error inicializando Stripe")
      stripeLoading.value = false
    }
  }

  // Inicializar Stripe al montar el componente
  onMounted(() => {
    if (isClient() && !stripeInitialized.value) {
      initializeStripe()
    }
  })

  // Crear un elemento de Stripe
  function createElement(type: string, options?: any): StripeElement | null {
    if (!stripeElements.value) {
      if (!stripeInstance.value) {
        console.error("Stripe no inicializado")
        return null
      }

      stripeElements.value = stripeInstance.value.elements(options?.elementsOptions)
    }

    return stripeElements.value.create(type, options)
  }

  // Confirmar pago con tarjeta
  async function confirmCardPayment(clientSecret: string, data: any) {
    if (!stripeInstance.value) {
      throw new Error("Stripe no inicializado")
    }

    try {
      return await stripeInstance.value.confirmCardPayment(clientSecret, data)
    } catch (error) {
      console.error("Error confirmando pago:", error)
      throw error
    }
  }

  // Confirmar configuración de tarjeta
  async function confirmCardSetup(clientSecret: string, data: any) {
    if (!stripeInstance.value) {
      throw new Error("Stripe no inicializado")
    }

    try {
      return await stripeInstance.value.confirmCardSetup(clientSecret, data)
    } catch (error) {
      console.error("Error confirmando configuración de tarjeta:", error)
      throw error
    }
  }

  // Crear método de pago
  async function createPaymentMethod(data: any) {
    if (!stripeInstance.value) {
      throw new Error("Stripe no inicializado")
    }

    try {
      return await stripeInstance.value.createPaymentMethod(data)
    } catch (error) {
      console.error("Error creando método de pago:", error)
      throw error
    }
  }

  // Devolver funciones y estado
  return {
    // Estado
    stripe: stripeInstance,
    elements: stripeElements,
    loading: stripeLoading,
    error: stripeError,
    isInitialized: stripeInitialized,

    // Funciones
    initializeStripe,
    createElement,
    confirmCardPayment,
    confirmCardSetup,
    createPaymentMethod,
  }
}
