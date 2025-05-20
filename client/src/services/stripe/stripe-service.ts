import { loadStripe, type Stripe, type StripeElements, type StripeElementsOptions } from "@stripe/stripe-js"
import { getStripeConfig, isDevMode } from "../../config/stripe"

class StripeService {
  private stripe: Stripe | null = null
  private elements: StripeElements | null = null
  private initialized = false
  private initPromise: Promise<boolean> | null = null

  /**
   * Inicializa el servicio de Stripe
   */
  async initialize(): Promise<boolean> {
    // Si ya hay una inicialización en curso, devuelve esa promesa
    if (this.initPromise) {
      return this.initPromise
    }

    // Si ya está inicializado, devuelve true
    if (this.initialized && this.stripe) {
      return true
    }

    // Crea una nueva promesa de inicialización
    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        const config = getStripeConfig()

        if (!config.publishableKey) {
          console.error("No se ha configurado la clave pública de Stripe")
          resolve(false)
          return
        }

        // Carga Stripe
        this.stripe = await loadStripe(config.publishableKey)

        if (!this.stripe) {
          console.error("No se pudo cargar Stripe")
          resolve(false)
          return
        }

        this.initialized = true
        resolve(true)
      } catch (error) {
        console.error("Error al inicializar Stripe:", error)
        reject(error)
      } finally {
        // Limpia la promesa de inicialización
        this.initPromise = null
      }
    })

    return this.initPromise
  }

  /**
   * Crea elementos de Stripe para un formulario de pago
   */
  async createElements(options?: StripeElementsOptions): Promise<StripeElements | null> {
    try {
      // Asegúrate de que Stripe esté inicializado
      const initialized = await this.initialize()
      if (!initialized || !this.stripe) {
        console.error("Stripe no está inicializado")
        return null
      }

      // Configuración por defecto
      const defaultOptions: StripeElementsOptions = {
        locale: "es",
        appearance: getStripeConfig().options.appearance,
      }

      // Crea los elementos
      this.elements = this.stripe.elements({
        ...defaultOptions,
        ...options,
      })

      return this.elements
    } catch (error) {
      console.error("Error al crear elementos de Stripe:", error)
      return null
    }
  }

  /**
   * Crea un token de pago a partir de los elementos
   */
  async createPaymentMethod(type: string, element: any, data?: any): Promise<any> {
    try {
      // Asegúrate de que Stripe esté inicializado
      const initialized = await this.initialize()
      if (!initialized || !this.stripe) {
        throw new Error("Stripe no está inicializado")
      }

      // Crea el método de pago
      const result = await this.stripe.createPaymentMethod({
        type,
        card: element,
        billing_details: data?.billing_details,
      })

      return result
    } catch (error) {
      console.error("Error al crear método de pago:", error)
      throw error
    }
  }

  /**
   * Confirma un pago con Stripe
   */
  async confirmPayment(clientSecret: string, options: any): Promise<any> {
    try {
      // Asegúrate de que Stripe esté inicializado
      const initialized = await this.initialize()
      if (!initialized || !this.stripe) {
        throw new Error("Stripe no está inicializado")
      }

      // Confirma el pago
      return await this.stripe.confirmPayment({
        clientSecret,
        ...options,
      })
    } catch (error) {
      console.error("Error al confirmar pago:", error)
      throw error
    }
  }

  /**
   * Verifica el estado de Stripe
   */
  async checkStatus(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Asegúrate de que Stripe esté inicializado
      const initialized = await this.initialize()
      if (!initialized || !this.stripe) {
        return {
          success: false,
          message: "Stripe no está inicializado",
        }
      }

      // Verifica si estamos en modo desarrollo
      if (isDevMode()) {
        return {
          success: true,
          message: "Stripe está configurado en modo desarrollo",
          details: {
            mode: "development",
            publishableKey: getStripeConfig().publishableKey.substring(0, 8) + "...",
          },
        }
      }

      return {
        success: true,
        message: "Stripe está configurado correctamente",
        details: {
          mode: "production",
          publishableKey: getStripeConfig().publishableKey.substring(0, 8) + "...",
        },
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Error al verificar Stripe: ${error.message || "Error desconocido"}`,
      }
    }
  }

  /**
   * Crea una intención de pago de prueba (solo para desarrollo)
   */
  async createTestPaymentIntent(amount = 1000, currency = "eur"): Promise<any> {
    if (!isDevMode()) {
      throw new Error("Esta función solo está disponible en modo desarrollo")
    }

    try {
      // Simula una respuesta de la API
      return {
        clientSecret: "pi_test_" + Math.random().toString(36).substring(2, 15),
        amount,
        currency,
        status: "requires_payment_method",
      }
    } catch (error) {
      console.error("Error al crear intención de pago de prueba:", error)
      throw error
    }
  }
}

// Exporta una instancia única del servicio
export const stripeService = new StripeService()

export default stripeService
