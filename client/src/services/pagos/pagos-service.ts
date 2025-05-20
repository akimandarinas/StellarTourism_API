/**
 * Servicio para gestionar pagos
 */
import { BaseService } from "../base-service"
import { apiClient } from "../api/client"
import { withErrorHandling } from "../../utils/api-error-handler"
import type { ApiRequestOptions } from "../../types/api"

// Tipos para el servicio de pagos
export interface Pago {
  id: number | string
  reservaId: number | string
  cantidad: number
  metodoPago: string
  estado: "pendiente" | "completado" | "fallido" | "reembolsado"
  idTransaccion?: string
  idStripePago?: string
  fecha: string
  created_at: string
  updated_at: string
}

export interface PaymentIntentData {
  reservaId?: number | string
  amount?: number
  currency?: string
  paymentMethodId?: string
  customerId?: string
  description?: string
  metadata?: Record<string, any>
}

export interface CheckoutSessionData {
  reservaId?: number | string
  items?: Array<{
    name: string
    description?: string
    amount: number
    quantity?: number
    metadata?: Record<string, any>
  }>
  currency?: string
  customer?: string
  customerEmail?: string
  successUrl?: string
  cancelUrl?: string
  allowPromotionCodes?: boolean
  metadata?: Record<string, any>
}

/**
 * Servicio para gestionar pagos
 */
export class PagosService extends BaseService<Pago> {
  constructor() {
    super({
      resourceName: "pagos",
      cacheTTL: 2 * 60 * 1000, // 2 minutos
      cacheOptions: {
        maxSize: 20,
        persistToStorage: false, // No persistir datos sensibles de pagos
      },
    })
  }

  /**
   * Obtiene los pagos de una reserva
   * @param reservaId ID de la reserva
   * @param options Opciones de consulta
   * @returns Pagos de la reserva
   */
  getByReserva = withErrorHandling(
    async (reservaId: number | string, options: ApiRequestOptions = {}): Promise<Pago[]> => {
      if (!reservaId) throw new Error("ID de reserva requerido")

      const cacheKey = `reserva:${reservaId}`

      if (this.enableCache) {
        const cached = await this.cache.get(cacheKey)
        if (cached) return cached
      }

      const response = await apiClient.get<Pago[]>(`/${this.resourceName}`, {
        ...options,
        params: { ...options.params, reservation_id: reservaId },
      })

      const data = response.data || []

      if (this.enableCache) {
        await this.cache.set(cacheKey, data)
      }

      return data
    },
  )

  /**
   * Crea una intención de pago con Stripe
   * @param data Datos para la intención de pago
   * @param options Opciones de consulta
   * @returns Datos de la intención de pago
   */
  createPaymentIntent = withErrorHandling(
    async (data: PaymentIntentData, options: ApiRequestOptions = {}): Promise<any> => {
      if (!data.reservaId && !data.amount) {
        throw new Error("Se requiere reservaId o amount para crear una intención de pago")
      }

      const response = await apiClient.post(
        `/${this.resourceName}`,
        {
          action: "create_payment_intent",
          ...data,
        },
        {
          ...options,
          headers: {
            ...options.headers,
            "Idempotency-Key": `pi_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          },
        },
      )

      return response.data
    },
  )

  /**
   * Crea una sesión de checkout con Stripe
   * @param data Datos para la sesión de checkout
   * @param options Opciones de consulta
   * @returns Datos de la sesión de checkout
   */
  createCheckoutSession = withErrorHandling(
    async (data: CheckoutSessionData, options: ApiRequestOptions = {}): Promise<any> => {
      if (!data.reservaId && !data.items) {
        throw new Error("Se requiere reservaId o items para crear una sesión de checkout")
      }

      const response = await apiClient.post(
        `/${this.resourceName}`,
        {
          action: "create_checkout_session",
          ...data,
        },
        {
          ...options,
          headers: {
            ...options.headers,
            "Idempotency-Key": `cs_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          },
        },
      )

      return response.data
    },
  )

  /**
   * Confirma un pago
   * @param paymentIntentId ID de la intención de pago
   * @param reservaId ID de la reserva
   * @param paymentMethodId ID del método de pago (opcional)
   * @param options Opciones de consulta
   * @returns Resultado de la confirmación
   */
  confirmPayment = withErrorHandling(
    async (
      paymentIntentId: string,
      reservaId: number | string,
      paymentMethodId?: string,
      options: ApiRequestOptions = {},
    ): Promise<any> => {
      if (!paymentIntentId || !reservaId) {
        throw new Error("Se requiere payment_intent_id y reserva_id para confirmar un pago")
      }

      const response = await apiClient.post(
        `/${this.resourceName}`,
        {
          action: "confirm_payment",
          payment_intent_id: paymentIntentId,
          reserva_id: reservaId,
          payment_method_id: paymentMethodId,
        },
        {
          ...options,
          headers: {
            ...options.headers,
            "Idempotency-Key": `cf_${paymentIntentId}_${Date.now()}`,
          },
        },
      )

      return response.data
    },
  )

  /**
   * Verifica el estado de una sesión de checkout
   * @param sessionId ID de la sesión de checkout
   * @param options Opciones de consulta
   * @returns Estado de la sesión
   */
  verifyCheckoutSession = withErrorHandling(
    async (sessionId: string, options: ApiRequestOptions = {}): Promise<any> => {
      if (!sessionId) throw new Error("ID de sesión requerido")

      const response = await apiClient.get(`/${this.resourceName}`, {
        ...options,
        params: { ...options.params, verify_session: sessionId },
      })

      return response.data
    },
  )
}

// Exportar instancia singleton
export const pagosService = new PagosService()
