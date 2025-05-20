"use client"

import { defineStore } from "pinia"
import { ref, computed, watch, shallowRef } from "vue"
import { useToast } from "../composables/useToast"
import { useAuthStore } from "./auth"
import { useWebSocketStore } from "./websocket"
import {
  fetchReservas,
  fetchReserva,
  crearReserva as apiCrearReserva,
  cancelarReserva as apiCancelarReserva,
  modificarReserva as apiModificarReserva,
} from "../services/api"

export const useReservasStore = defineStore("reservas", () => {
  const toast = useToast()
  const authStore = useAuthStore()
  const wsStore = useWebSocketStore()

  // Estado
  const reservas = shallowRef([])
  const reservaActual = shallowRef(null)
  const loading = ref(false)
  const loadingReserva = ref(false)
  const loadingCreacion = ref(false)
  const loadingCancelacion = ref(false)
  const loadingModificacion = ref(false)
  const error = ref(null)
  const errorReserva = ref(null)
  const errorCreacion = ref(null)
  const errorCancelacion = ref(null)
  const errorModificacion = ref(null)
  const filtros = ref({
    estado: "",
    fechaInicio: null,
    fechaFin: null,
    destino: null,
    nave: null,
  })
  const paginacion = ref({
    pagina: 1,
    porPagina: 10,
    total: 0,
  })

  // Estado para optimistic updates
  const pendingUpdates = ref(new Map())
  const optimisticUpdates = ref(new Map())

  // Caché de reservas con control de tamaño y TTL
  const reservasCache = new Map()
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutos
  const MAX_CACHE_SIZE = 50 // Limitar tamaño de caché
  const cacheMetrics = ref({
    hits: 0,
    misses: 0,
    size: 0,
    lastCleanup: Date.now(),
  })

  // Función para gestionar el tamaño de la caché
  function manageCache() {
    if (reservasCache.size <= MAX_CACHE_SIZE) {
      cacheMetrics.value.size = reservasCache.size
      return
    }

    // Si la caché excede el tamaño máximo, eliminar las entradas más antiguas
    const entriesToDelete = reservasCache.size - MAX_CACHE_SIZE
    const entries = [...reservasCache.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, entriesToDelete)

    for (const [key] of entries) {
      reservasCache.delete(key)
    }

    cacheMetrics.value.size = reservasCache.size
    cacheMetrics.value.lastCleanup = Date.now()
  }

  // Getters
  const reservasFiltradas = computed(() => {
    let resultado = [...reservas.value]

    // Aplicar filtro de estado
    if (filtros.value.estado) {
      resultado = resultado.filter((reserva) => reserva.estado === filtros.value.estado)
    }

    // Aplicar filtro de fecha de inicio
    if (filtros.value.fechaInicio) {
      const fechaInicio = new Date(filtros.value.fechaInicio)
      resultado = resultado.filter((reserva) => {
        const fechaReserva = new Date(reserva.fechaViaje || reserva.fechaCreacion)
        return fechaReserva >= fechaInicio
      })
    }

    // Aplicar filtro de fecha de fin
    if (filtros.value.fechaFin) {
      const fechaFin = new Date(filtros.value.fechaFin)
      fechaFin.setHours(23, 59, 59, 999) // Fin del día
      resultado = resultado.filter((reserva) => {
        const fechaReserva = new Date(reserva.fechaViaje || reserva.fechaCreacion)
        return fechaReserva <= fechaFin
      })
    }

    // Aplicar filtro de destino
    if (filtros.value.destino) {
      resultado = resultado.filter(
        (reserva) => reserva.destino?.id === filtros.value.destino || reserva.destinoId === filtros.value.destino,
      )
    }

    // Aplicar filtro de nave
    if (filtros.value.nave) {
      resultado = resultado.filter(
        (reserva) => reserva.nave?.id === filtros.value.nave || reserva.naveId === filtros.value.nave,
      )
    }

    // Aplicar actualizaciones optimistas
    resultado = resultado.map((reserva) => {
      const optimisticUpdate = optimisticUpdates.value.get(reserva.id)
      if (optimisticUpdate) {
        return { ...reserva, ...optimisticUpdate }
      }
      return reserva
    })

    return resultado
  })

  const reservasPaginadas = computed(() => {
    const inicio = (paginacion.value.pagina - 1) * paginacion.value.porPagina
    const fin = inicio + paginacion.value.porPagina
    return reservasFiltradas.value.slice(inicio, fin)
  })

  const totalPaginas = computed(() => {
    return Math.ceil(reservasFiltradas.value.length / paginacion.value.porPagina)
  })

  // Reservas por estado
  const reservasPendientes = computed(() => reservas.value.filter((r) => r.estado === "pendiente"))

  const reservasConfirmadas = computed(() => reservas.value.filter((r) => r.estado === "confirmada"))

  const reservasCanceladas = computed(() => reservas.value.filter((r) => r.estado === "cancelada"))

  const reservasCompletadas = computed(() => reservas.value.filter((r) => r.estado === "completada"))

  // Próxima reserva (la más cercana en fecha que no esté cancelada)
  const proximaReserva = computed(() => {
    const hoy = new Date()

    return (
      reservas.value
        .filter((r) => r.estado !== "cancelada" && new Date(r.fechaViaje) >= hoy)
        .sort((a, b) => new Date(a.fechaViaje) - new Date(b.fechaViaje))[0] || null
    )
  })

  // Obtener una reserva por ID con actualizaciones optimistas aplicadas
  const getReservaById = (id) => {
    const reserva = reservas.value.find((r) => r.id === id) || null
    const optimisticUpdate = optimisticUpdates.value.get(id)

    if (reserva && optimisticUpdate) {
      return { ...reserva, ...optimisticUpdate }
    }

    return reserva
  }

  // Acciones
  async function cargarReservas(forzarRecarga = false) {
    if (!authStore.isAuthenticated) {
      return []
    }

    if (reservas.value.length > 0 && !forzarRecarga) {
      return reservas.value
    }

    loading.value = true
    error.value = null

    try {
      const data = await fetchReservas()
      reservas.value = data
      return data
    } catch (err) {
      console.error("Error al cargar reservas:", err)
      error.value = "No se pudieron cargar las reservas. Por favor, intenta nuevamente."

      // Mostrar toast solo si el error no es de cancelación
      if (!err.message?.includes("canceled")) {
        toast.error("Error", error.value)
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  // Nueva función para cargar reservas paginadas
  async function cargarReservasPaginadas(options = {}) {
    if (!authStore.isAuthenticated) {
      return { items: [], total: 0 }
    }

    loading.value = true
    error.value = null

    try {
      const { page = 1, limit = 10, ...restOptions } = options

      const response = await fetchReservas({
        page,
        limit,
        ...restOptions,
      })

      // Si es la primera página, reemplazar las reservas
      // Si no, añadir a las existentes
      if (page === 1) {
        reservas.value = response.data || []
      } else {
        // Evitar duplicados
        const newReservas = (response.data || []).filter(
          (newReserva) => !reservas.value.some((r) => r.id === newReserva.id),
        )
        reservas.value = [...reservas.value, ...newReservas]
      }

      // Actualizar paginación
      paginacion.value = {
        pagina: page,
        porPagina: limit,
        total: response.meta?.total || reservas.value.length,
      }

      return {
        items: response.data || [],
        total: response.meta?.total || 0,
        page,
        limit,
      }
    } catch (err) {
      console.error("Error al cargar reservas paginadas:", err)
      error.value = "No se pudieron cargar las reservas. Por favor, intenta nuevamente."

      // Mostrar toast solo si el error no es de cancelación
      if (!err.message?.includes("canceled")) {
        toast.error("Error", error.value)
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  async function cargarReserva(id) {
    if (!id) {
      console.error("ID de reserva no válido")
      return null
    }

    // Verificar caché
    const cacheKey = `reserva_${id}`
    const cachedData = reservasCache.get(cacheKey)

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      cacheMetrics.value.hits++
      reservaActual.value = cachedData.data
      return cachedData.data
    }

    cacheMetrics.value.misses++

    // Evitar múltiples solicitudes simultáneas para el mismo ID
    if (loadingReserva.value) {
      // Esperar a que termine la carga actual
      await new Promise((resolve) => {
        const unwatch = watch(loadingReserva, (newValue) => {
          if (!newValue) {
            unwatch()
            resolve()
          }
        })
      })

      // Verificar si ya se cargó la reserva que necesitamos
      if (reservaActual.value && reservaActual.value.id === id) {
        return reservaActual.value
      }
    }

    // Si ya tenemos la reserva en el array de reservas, usarla
    const reservaEnCache = getReservaById(id)
    if (reservaEnCache) {
      reservaActual.value = reservaEnCache

      // Actualizar caché
      reservasCache.set(cacheKey, {
        data: reservaEnCache,
        timestamp: Date.now(),
      })

      manageCache()
      return reservaEnCache
    }

    loadingReserva.value = true
    errorReserva.value = null

    try {
      const data = await fetchReserva(id)

      // Verificar que los datos sean válidos
      if (!data || !data.id) {
        throw new Error("Datos de reserva inválidos")
      }

      reservaActual.value = data

      // Actualizar también en el array de reservas si existe
      const index = reservas.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        const nuevasReservas = [...reservas.value]
        nuevasReservas[index] = data
        reservas.value = nuevasReservas
      } else {
        // Si no existe, añadirla
        reservas.value = [...reservas.value, data]
      }

      // Actualizar caché
      reservasCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      })

      manageCache()
      return data
    } catch (err) {
      console.error("Error al cargar reserva:", err)
      errorReserva.value = "No se pudo cargar la información de la reserva. Por favor, intenta nuevamente."

      // Mostrar toast solo si el error no es de cancelación
      if (!err.message?.includes("canceled")) {
        toast.error("Error", errorReserva.value)
      }

      throw err
    } finally {
      loadingReserva.value = false
    }
  }

  async function crearReserva(datosReserva) {
    loadingCreacion.value = true
    errorCreacion.value = null

    try {
      const data = await apiCrearReserva(datosReserva)

      // Añadir la nueva reserva al array de reservas
      reservas.value = [data, ...reservas.value]

      // Actualizar caché
      const cacheKey = `reserva_${data.id}`
      reservasCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      })

      toast.success("Reserva creada", "Tu reserva ha sido creada correctamente")
      return data
    } catch (err) {
      console.error("Error al crear reserva:", err)
      errorCreacion.value = "No se pudo crear la reserva. Por favor, intenta nuevamente."

      // Mostrar toast con mensaje específico si está disponible
      const mensajeError = err.response?.data?.message || errorCreacion.value
      toast.error("Error", mensajeError)

      throw err
    } finally {
      loadingCreacion.value = false
    }
  }

  async function cancelarReserva(id, motivo) {
    // Validar parámetros
    if (!id) {
      console.error("ID de reserva no válido")
      return null
    }

    // Guardar el estado actual para poder revertir si falla
    const reservaOriginal = getReservaById(id)
    if (!reservaOriginal) {
      console.error(`No se encontró la reserva con ID ${id}`)
      return
    }

    // Generar un ID único para esta operación
    const operationId = `cancel-${id}-${Date.now()}`

    // Aplicar actualización optimista
    optimisticUpdates.value.set(id, { estado: "cancelada", motivoCancelacion: motivo })
    pendingUpdates.value.set(operationId, { id, tipo: "cancelar" })

    // Actualizar inmediatamente la UI para mejor experiencia
    const index = reservas.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      const nuevasReservas = [...reservas.value]
      nuevasReservas[index] = {
        ...nuevasReservas[index],
        estado: "cancelada",
        motivoCancelacion: motivo,
        _isOptimistic: true, // Marcar como actualización optimista
      }
      reservas.value = nuevasReservas
    }

    loadingCancelacion.value = true
    errorCancelacion.value = null

    try {
      const data = await apiCancelarReserva(id, motivo)

      // Actualizar el estado de la reserva en el array con los datos reales del servidor
      const indexActualizado = reservas.value.findIndex((r) => r.id === id)
      if (indexActualizado !== -1) {
        const nuevasReservas = [...reservas.value]
        nuevasReservas[indexActualizado] = {
          ...nuevasReservas[indexActualizado],
          ...data,
          _isOptimistic: false, // Quitar marca de optimista
        }
        reservas.value = nuevasReservas
      }

      // Si la reserva actual es la que se está cancelando, actualizarla también
      if (reservaActual.value && reservaActual.value.id === id) {
        reservaActual.value = { ...reservaActual.value, ...data, _isOptimistic: false }
      }

      // Actualizar caché
      const cacheKey = `reserva_${id}`
      if (reservasCache.has(cacheKey)) {
        reservasCache.set(cacheKey, {
          data: { ...reservasCache.get(cacheKey).data, ...data, _isOptimistic: false },
          timestamp: Date.now(),
        })
      }

      // Eliminar la actualización optimista y la operación pendiente
      optimisticUpdates.value.delete(id)
      pendingUpdates.value.delete(operationId)

      toast.success("Reserva cancelada", "Tu reserva ha sido cancelada correctamente")
      return data
    } catch (err) {
      console.error("Error al cancelar reserva:", err)
      errorCancelacion.value = "No se pudo cancelar la reserva. Por favor, intenta nuevamente."

      // Mostrar toast con mensaje específico si está disponible
      const mensajeError = err.response?.data?.message || errorCancelacion.value
      toast.error("Error", mensajeError)

      // Revertir la actualización optimista en el array
      const indexRevertir = reservas.value.findIndex((r) => r.id === id)
      if (indexRevertir !== -1) {
        const nuevasReservas = [...reservas.value]
        nuevasReservas[indexRevertir] = reservaOriginal
        reservas.value = nuevasReservas
      }

      // Revertir la reserva actual si es necesario
      if (reservaActual.value && reservaActual.value.id === id) {
        reservaActual.value = reservaOriginal
      }

      // Revertir la actualización optimista
      optimisticUpdates.value.delete(id)
      pendingUpdates.value.delete(operationId)

      throw err
    } finally {
      loadingCancelacion.value = false
    }
  }

  async function modificarReserva(id, datosModificados) {
    // Validar parámetros
    if (!id) {
      console.error("ID de reserva no válido")
      return null
    }

    if (!datosModificados || Object.keys(datosModificados).length === 0) {
      console.error("No se proporcionaron datos para modificar")
      return null
    }

    // Guardar el estado actual para poder revertir si falla
    const reservaOriginal = getReservaById(id)
    if (!reservaOriginal) {
      console.error(`No se encontró la reserva con ID ${id}`)
      return
    }

    // Generar un ID único para esta operación
    const operationId = `modify-${id}-${Date.now()}`

    // Aplicar actualización optimista
    optimisticUpdates.value.set(id, datosModificados)
    pendingUpdates.value.set(operationId, { id, tipo: "modificar" })

    // Actualizar inmediatamente la UI para mejor experiencia
    const index = reservas.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      const nuevasReservas = [...reservas.value]
      nuevasReservas[index] = {
        ...nuevasReservas[index],
        ...datosModificados,
        _isOptimistic: true, // Marcar como actualización optimista
      }
      reservas.value = nuevasReservas
    }

    loadingModificacion.value = true
    errorModificacion.value = null

    try {
      const data = await apiModificarReserva(id, datosModificados)

      // Actualizar la reserva en el array con los datos reales del servidor
      const indexActualizado = reservas.value.findIndex((r) => r.id === id)
      if (indexActualizado !== -1) {
        const nuevasReservas = [...reservas.value]
        nuevasReservas[indexActualizado] = {
          ...nuevasReservas[indexActualizado],
          ...data,
          _isOptimistic: false, // Quitar marca de optimista
        }
        reservas.value = nuevasReservas
      }

      // Si la reserva actual es la que se está modificando, actualizarla también
      if (reservaActual.value && reservaActual.value.id === id) {
        reservaActual.value = { ...reservaActual.value, ...data, _isOptimistic: false }
      }

      // Actualizar caché
      const cacheKey = `reserva_${id}`
      if (reservasCache.has(cacheKey)) {
        reservasCache.set(cacheKey, {
          data: { ...reservasCache.get(cacheKey).data, ...data, _isOptimistic: false },
          timestamp: Date.now(),
        })
      }

      // Eliminar la actualización optimista y la operación pendiente
      optimisticUpdates.value.delete(id)
      pendingUpdates.value.delete(operationId)

      toast.success("Reserva modificada", "Tu reserva ha sido modificada correctamente")
      return data
    } catch (err) {
      console.error("Error al modificar reserva:", err)
      errorModificacion.value = "No se pudo modificar la reserva. Por favor, intenta nuevamente."

      // Mostrar toast con mensaje específico si está disponible
      const mensajeError = err.response?.data?.message || errorModificacion.value
      toast.error("Error", mensajeError)

      // Revertir la actualización optimista en el array
      const indexRevertir = reservas.value.findIndex((r) => r.id === id)
      if (indexRevertir !== -1) {
        const nuevasReservas = [...reservas.value]
        nuevasReservas[indexRevertir] = reservaOriginal
        reservas.value = nuevasReservas
      }

      // Revertir la reserva actual si es necesario
      if (reservaActual.value && reservaActual.value.id === id) {
        reservaActual.value = reservaOriginal
      }

      // Revertir la actualización optimista
      optimisticUpdates.value.delete(id)
      pendingUpdates.value.delete(operationId)

      throw err
    } finally {
      loadingModificacion.value = false
    }
  }

  function aplicarFiltros(nuevosFiltros) {
    filtros.value = { ...filtros.value, ...nuevosFiltros }
    paginacion.value.pagina = 1 // Resetear paginación al aplicar filtros
  }

  function limpiarFiltros() {
    filtros.value = {
      estado: "",
      fechaInicio: null,
      fechaFin: null,
      destino: null,
      nave: null,
    }
    paginacion.value.pagina = 1
  }

  function cambiarPagina(pagina) {
    paginacion.value.pagina = pagina
  }

  // Limpiar caché
  function limpiarCache() {
    reservasCache.clear()
  }

  // Invalidar caché para una reserva específica
  function invalidarCacheReserva(id) {
    const cacheKey = `reserva_${id}`
    reservasCache.delete(cacheKey)
  }

  // Manejar actualizaciones en tiempo real
  function handleReservaActualizada(data) {
    const { id, ...cambios } = data

    // Actualizar en el array de reservas
    const index = reservas.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      const nuevasReservas = [...reservas.value]
      nuevasReservas[index] = { ...nuevasReservas[index], ...cambios }
      reservas.value = nuevasReservas
    }

    // Actualizar la reserva actual si es la misma
    if (reservaActual.value && reservaActual.value.id === id) {
      reservaActual.value = { ...reservaActual.value, ...cambios }
    }

    // Actualizar caché
    const cacheKey = `reserva_${id}`
    if (reservasCache.has(cacheKey)) {
      reservasCache.set(cacheKey, {
        data: { ...reservasCache.get(cacheKey).data, ...cambios },
        timestamp: Date.now(),
      })
    }

    // Notificar al usuario
    toast.info("Reserva actualizada", `La reserva #${id} ha sido actualizada`)
  }

  // Configurar suscripción a eventos de WebSocket
  function setupWebSocketListeners() {
    if (wsStore.isConnected) {
      wsStore.subscribe("reserva_actualizada", handleReservaActualizada)
    }
  }

  const setupCacheCleanup = () => {
    const cleanupInterval = 10 * 60 * 1000 // 10 minutos

    const cleanup = () => {
      const now = Date.now()
      let expiredCount = 0
      let totalCount = 0

      // Limpiar caché de reservas
      for (const [key, value] of reservasCache.entries()) {
        totalCount++
        if (now - value.timestamp > CACHE_TTL) {
          reservasCache.delete(key)
          expiredCount++
        }
      }

      // Actualizar métricas
      cacheMetrics.value = {
        ...cacheMetrics.value,
        size: reservasCache.size,
        lastCleanup: now,
        expiredRemoved: expiredCount,
        totalChecked: totalCount,
      }

      // Limpiar actualizaciones optimistas pendientes que puedan haber quedado huérfanas
      for (const [operationId, operation] of pendingUpdates.value.entries()) {
        // Si la operación tiene más de 1 hora, considerarla huérfana
        if (now - Number.parseInt(operationId.split("-")[2]) > 60 * 60 * 1000) {
          pendingUpdates.value.delete(operationId)
          // También eliminar la actualización optimista asociada
          if (operation.id) {
            optimisticUpdates.value.delete(operation.id)
          }
        }
      }
    }

    // Ejecutar limpieza inicial
    cleanup()

    // Configurar intervalo de limpieza
    const interval = setInterval(cleanup, cleanupInterval)

    // Limpiar intervalo cuando se destruya el store
    const stopCleanup = () => {
      clearInterval(interval)
    }

    return stopCleanup
  }

  // Añadir una nueva función para sincronizar datos con el servidor:
  async function sincronizarReservas() {
    if (!authStore.isAuthenticated) {
      return false
    }

    try {
      // Obtener reservas actualizadas del servidor
      const data = await fetchReservas()

      // Crear un mapa de las reservas actuales para facilitar la comparación
      const reservasActualesMap = new Map(reservas.value.map((reserva) => [reserva.id, reserva]))

      // Identificar reservas nuevas o actualizadas
      const reservasActualizadas = []
      const reservasNuevas = []

      for (const reservaServidor of data) {
        const reservaLocal = reservasActualesMap.get(reservaServidor.id)

        if (!reservaLocal) {
          // Es una reserva nueva
          reservasNuevas.push(reservaServidor)
        } else if (
          // Verificar si hay cambios significativos
          reservaLocal.estado !== reservaServidor.estado ||
          reservaLocal.fechaActualizacion !== reservaServidor.fechaActualizacion
        ) {
          // Es una actualización
          reservasActualizadas.push(reservaServidor)
        }

        // Eliminar del mapa para identificar reservas eliminadas
        reservasActualesMap.delete(reservaServidor.id)
      }

      // Las reservas que quedan en el mapa son las que ya no existen en el servidor
      const reservasEliminadas = Array.from(reservasActualesMap.values())

      // Actualizar el estado
      if (reservasNuevas.length || reservasActualizadas.length || reservasEliminadas.length) {
        // Crear una nueva lista combinando las reservas existentes con las actualizaciones
        const nuevasReservas = [...reservas.value]
          // Eliminar las reservas que ya no existen
          .filter((r) => !reservasEliminadas.some((eliminada) => eliminada.id === r.id))
          // Actualizar las reservas existentes
          .map((r) => {
            const actualizada = reservasActualizadas.find((a) => a.id === r.id)
            return actualizada ? { ...r, ...actualizada } : r
          })
          // Añadir las nuevas reservas
          .concat(reservasNuevas)

        // Actualizar el estado
        reservas.value = nuevasReservas

        // Actualizar caché para las reservas actualizadas y nuevas
        for (const reserva of [...reservasActualizadas, ...reservasNuevas]) {
          const cacheKey = `reserva_${reserva.id}`
          reservasCache.set(cacheKey, {
            data: reserva,
            timestamp: Date.now(),
          })
        }

        // Invalidar caché para las reservas eliminadas
        for (const reserva of reservasEliminadas) {
          invalidarCacheReserva(reserva.id)
        }

        // Notificar al usuario si hay cambios importantes
        if (reservasNuevas.length) {
          toast.info("Nuevas reservas", `Se han añadido ${reservasNuevas.length} nuevas reservas`)
        }

        if (reservasActualizadas.length) {
          toast.info("Reservas actualizadas", `Se han actualizado ${reservasActualizadas.length} reservas`)
        }

        return true
      }

      return false
    } catch (error) {
      console.error("Error al sincronizar reservas:", error)
      return false
    }
  }

  // Configurar limpieza automática de caché

  // Iniciar limpieza de caché
  const stopCacheCleanup = setupCacheCleanup()

  // Inicializar
  function init() {
    setupWebSocketListeners()

    // Volver a suscribirse si el WebSocket se reconecta
    watch(
      () => wsStore.isConnected,
      (isConnected) => {
        if (isConnected) {
          setupWebSocketListeners()
        }
      },
    )

    // Recargar reservas cuando cambie el estado de autenticación
    watch(
      () => authStore.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated) {
          cargarReservas(true)
        } else {
          reservas.value = []
          reservaActual.value = null
          limpiarCache()
        }
      },
    )
  }

  // Inicializar al crear el store
  init()

  return {
    // Estado
    reservas,
    reservaActual,
    loading,
    loadingReserva,
    loadingCreacion,
    loadingCancelacion,
    loadingModificacion,
    error,
    errorReserva,
    errorCreacion,
    errorCancelacion,
    errorModificacion,
    filtros,
    paginacion,
    cacheMetrics,

    // Getters
    reservasFiltradas,
    reservasPaginadas,
    totalPaginas,
    reservasPendientes,
    reservasConfirmadas,
    reservasCanceladas,
    reservasCompletadas,
    proximaReserva,

    // Acciones
    cargarReservas,
    cargarReservasPaginadas,
    cargarReserva,
    crearReserva,
    cancelarReserva,
    modificarReserva,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    getReservaById,
    handleReservaActualizada,
    limpiarCache,
    invalidarCacheReserva,
    sincronizarReservas,

    // Cleanup
    $dispose() {
      stopCacheCleanup()
    },
  }
})
