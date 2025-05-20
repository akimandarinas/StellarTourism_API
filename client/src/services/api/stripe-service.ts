import { apiClient } from "./client"
import { isClient } from "../../utils/ssr-safe"

// Interfaces para Stripe
interface CreatePaymentIntentRequest {
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, string>
}

interface CreatePaymentIntentResponse {
  clientSecret: string
  id: string
  amount: number
  currency: string
}

interface CreateSetupIntentRequest {
  customerId?: string
  metadata?: Record<string, string>
}

interface CreateSetupIntentResponse {
  clientSecret: string
  id: string
}

interface SavePaymentMethodRequest {
  paymentMethodId: string
  customerId?: string
  isDefault?: boolean
}

interface SavePaymentMethodResponse {
  success: boolean
  paymentMethod: {
    id: string
    last4: string
    brand: string
    expMonth: number
    expYear: number
  }
}

// Servicio para interactuar con Stripe a través de la API
export const stripeService = {
  // Crear un Payment Intent
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    if (!isClient()) {
      throw new Error("Esta función solo está disponible en el cliente")
    }

    const response = await apiClient.post<CreatePaymentIntentResponse>("/api/pagos/payment-intent", data)
    return response.data
  },

  // Crear un Setup Intent
  async createSetupIntent(data?: CreateSetupIntentRequest): Promise<CreateSetupIntentResponse> {
    if (!isClient()) {
      throw new Error("Esta función solo está disponible en el cliente")
    }

    const response = await apiClient.post<CreateSetupIntentResponse>("/api/pagos/setup-intent", data)
    return response.data
  },

  // Guardar un método de pago
  async savePaymentMethod(data: SavePaymentMethodRequest): Promise<SavePaymentMethodResponse> {
    if (!isClient()) {
      throw new Error("Esta función solo está disponible en el cliente")
    }

    const response = await apiClient.post<SavePaymentMethodResponse>("/api/pagos/save-payment-method", data)
    return response.data
  },

  // Obtener métodos de pago guardados
  async getPaymentMethods(customerId?: string) {
    if (!isClient()) {
      throw new Error("Esta función solo está disponible en el cliente")
    }

    const response = await apiClient.get("/api/pagos/payment-methods", {
      params: { customerId },
    })
    return response.data
  },

  // Eliminar un método de pago
  async deletePaymentMethod(paymentMethodId: string) {
    if (!isClient()) {
      throw new Error("Esta función solo está disponible en el cliente")
    }

    const response = await apiClient.delete(`/api/pagos/payment-methods/${paymentMethodId}`)
    return response.data
  },

  // Procesar un pago
  async processPayment(paymentIntentId: string, data: any) {
    if (!isClient()) {
      throw new Error("Esta función solo está disponible en el cliente")
    }

    const response = await apiClient.post(`/api/pagos/process/${paymentIntentId}`, data)
    return response.data
  },
}

export default stripeService
