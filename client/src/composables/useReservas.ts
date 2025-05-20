"use client"

import { ref, computed, onMounted, watch, type Ref, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import { reservasService, type Reserva, type ReservaCreateData } from "@/services/reservas"
import { useToast } from "./useToast"
import { useAuth } from "./useAuth"
import { useErrorHandler } from "./useErrorHandler"

export interface UseReservasOptions {
  autoLoad?: boolean
  enableCache?: boolean
}

export interface UseReservasReturn {
  reservas: Ref<Reserva[]>
  reservaActual: Ref<Reserva | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  reservasActivas: ComputedRef<Reserva[]>
  reservasPendientes: ComputedRef<Reserva[]>
  reservasConfirmadas: ComputedRef<Reserva[]>
  reservasPorEstado: (estado: string) => ComputedRef<Reserva[]>
  cargarReservas: () => Promise<Reserva[]>
  cargarReserva: (id: string) => Promise<Reserva | null>
  crearReserva: (datos: ReservaCreateData) => Promise<Reserva | null>
  cancelarReserva: (id: string, motivo?: string) => Promise<boolean>
  actualizarReserva: (id: string, datos: Partial<Reserva>) => Promise<Reserva | null>
}

/**
 * Composable para gestionar reservas
 * @param options Opciones de configuración
 * @returns Métodos y estado para gestionar reservas
 */
export function useReservas(options: UseReservasOptions = {}): UseReservasReturn {
  const router = useRouter()
  const toast = useToast()
  const { user, isAuthenticated } = useAuth()
  const { handleError } = useErrorHandler()

  // Estado
  const reservas = ref<Reserva[]>([]) as Ref<Reserva[]>
  const reservaActual = ref<Reserva | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Opciones
  const autoLoad = options.autoLoad !== false
  const enableCache = options.enableCache !== false

  /**
   * Cargar reservas del usuario con manejo de errores mejorado
   */
  const cargarReservas = async (): Promise<Reserva[]> => {
    if (!isAuthenticated.value) return []
    if (loading.value) return reservas.value

    loading.value = true
    error.value = null

    try {
      const data = await reservasService.getUserReservas(user.value?.uid || "")
      reservas.value = data
      return data
    } catch (err) {
      const errorMessage = "No se pudieron cargar tus reservas"
      error.value = handleError(err, errorMessage)

      toast.error(errorMessage, {
        description: error.value.message,
      })

      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Cargar una reserva por ID con manejo de errores mejorado
   */
  const cargarReserva = async (id: string): Promise<Reserva | null> => {
    if (!id) return null
    if (loading.value) return reservaActual.value

    loading.value = true
    error.value = null

    try {
      const reserva = await reservasService.getById(id)
      reservaActual.value = reserva
      return reserva
    } catch (err) {
      const errorMessage = `No se pudo cargar la reserva ${id}`
      error.value = handleError(err, errorMessage)

      toast.error(errorMessage, {
        description: error.value.message,
      })

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear una nueva reserva con manejo de errores mejorado
   */
  const crearReserva = async (datos: ReservaCreateData): Promise<Reserva | null> => {
    if (!isAuthenticated.value) {
      router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`)
      return null
    }

    loading.value = true
    error.value = null

    try {
      const reservaData = {
        ...datos,
        userId: user.value?.uid || "",
        estado: "pendiente",
        fechaCreacion: new Date().toISOString(),
      }

      const nuevaReserva = await reservasService.create(reservaData)

      // Actualizar la lista local
      reservas.value = [...reservas.value, nuevaReserva]

      toast.success("Reserva creada", {
        description: "Tu reserva ha sido creada correctamente",
      })

      return nuevaReserva
    } catch (err) {
      const errorMessage = "No se pudo crear la reserva"
      error.value = handleError(err, errorMessage)

      toast.error(errorMessage, {
        description: error.value.message,
      })

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancelar una reserva con manejo de errores mejorado
   */
  const cancelarReserva = async (id: string, motivo = ""): Promise<boolean> => {
    if (!id) return false
    if (loading.value) return false

    loading.value = true
    error.value = null

    try {
      await reservasService.updateStatus(id, "cancelada", motivo)

      // Actualizar la lista local
      const index = reservas.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        reservas.value[index] = {
          ...reservas.value[index],
          estado: "cancelada",
          motivoCancelacion: motivo,
          fechaActualizacion: new Date().toISOString(),
        }
      }

      toast.success("Reserva cancelada", {
        description: "Tu reserva ha sido cancelada correctamente",
      })

      return true
    } catch (err) {
      const errorMessage = `No se pudo cancelar la reserva ${id}`
      error.value = handleError(err, errorMessage)

      toast.error(errorMessage, {
        description: error.value.message,
      })

      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar una reserva con manejo de errores mejorado
   */
  const actualizarReserva = async (id: string, datos: Partial<Reserva>): Promise<Reserva | null> => {
    if (!id) return null
    if (loading.value) return null

    loading.value = true
    error.value = null

    try {
      const reservaActualizada = await reservasService.update(id, datos)

      // Actualizar la lista local
      const index = reservas.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        reservas.value[index] = reservaActualizada
      }

      // Actualizar reserva actual si es la misma
      if (reservaActual.value?.id === id) {
        reservaActual.value = reservaActualizada
      }

      toast.success("Reserva actualizada", {
        description: "Tu reserva ha sido actualizada correctamente",
      })

      return reservaActualizada
    } catch (err) {
      const errorMessage = `No se pudo actualizar la reserva ${id}`
      error.value = handleError(err, errorMessage)

      toast.error(errorMessage, {
        description: error.value.message,
      })

      return null
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const reservasActivas = computed(() => {
    return reservas.value.filter((r) => r.estado !== "cancelada")
  })

  const reservasPendientes = computed(() => {
    return reservas.value.filter((r) => r.estado === "pendiente")
  })

  const reservasConfirmadas = computed(() => {
    return reservas.value.filter((r) => r.estado === "confirmada")
  })

  const reservasPorEstado = (estado: string) => {
    return computed(() => reservas.value.filter((r) => r.estado === estado))
  }

  // Ciclo de vida
  onMounted(() => {
    if (autoLoad && isAuthenticated.value) {
      cargarReservas()
    }
  })

  // Observar cambios en el usuario
  watch(
    () => user.value,
    (newUser) => {
      if (newUser && autoLoad) {
        cargarReservas()
      } else if (!newUser) {
        reservas.value = []
        reservaActual.value = null
      }
    },
  )

  return {
    reservas,
    reservaActual,
    loading,
    error,
    reservasActivas,
    reservasPendientes,
    reservasConfirmadas,
    reservasPorEstado,
    cargarReservas,
    cargarReserva,
    crearReserva,
    cancelarReserva,
    actualizarReserva,
  }
}
