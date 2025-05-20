import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { notificacionesService } from "../services/notificaciones"

export const useNotificacionesStore = defineStore("notificaciones", () => {
  // Estado
  const notificaciones = ref([])
  const cargando = ref(false)
  const error = ref(null)
  const permisoConcedido = ref(false)
  const notificacionesNoLeidas = ref(0)

  // Getters
  const tieneNotificacionesNoLeidas = computed(() => notificacionesNoLeidas.value > 0)
  const notificacionesOrdenadas = computed(() =>
    [...notificaciones.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
  )

  // Acciones
  async function cargarNotificaciones(incluirLeidas = false) {
    cargando.value = true
    error.value = null

    try {
      const data = await notificacionesService.getNotifications({
        includeRead: incluirLeidas,
      })

      notificaciones.value = data
      actualizarContadorNoLeidas()
    } catch (err) {
      console.error("Error al cargar notificaciones:", err)
      error.value = "No se pudieron cargar las notificaciones"
    } finally {
      cargando.value = false
    }
  }

  async function solicitarPermiso() {
    try {
      permisoConcedido.value = await notificacionesService.requestPermission()
      return permisoConcedido.value
    } catch (err) {
      console.error("Error al solicitar permiso:", err)
      error.value = "No se pudo solicitar permiso para notificaciones"
      return false
    }
  }

  async function marcarComoLeida(id) {
    try {
      await notificacionesService.markAsRead(id)

      // Actualizar estado local
      const notificacion = notificaciones.value.find((n) => n.id === id)
      if (notificacion) {
        notificacion.read = true
        actualizarContadorNoLeidas()
      }
    } catch (err) {
      console.error(`Error al marcar notificación ${id} como leída:`, err)
      error.value = "No se pudo marcar la notificación como leída"
    }
  }

  async function marcarTodasComoLeidas() {
    try {
      await notificacionesService.markAllAsRead()

      // Actualizar estado local
      notificaciones.value.forEach((n) => (n.read = true))
      notificacionesNoLeidas.value = 0
    } catch (err) {
      console.error("Error al marcar todas las notificaciones como leídas:", err)
      error.value = "No se pudieron marcar todas las notificaciones como leídas"
    }
  }

  async function eliminarNotificacion(id) {
    try {
      await notificacionesService.deleteNotification(id)

      // Actualizar estado local
      notificaciones.value = notificaciones.value.filter((n) => n.id !== id)
      actualizarContadorNoLeidas()
    } catch (err) {
      console.error(`Error al eliminar notificación ${id}:`, err)
      error.value = "No se pudo eliminar la notificación"
    }
  }

  async function eliminarTodasLasNotificaciones() {
    try {
      await notificacionesService.deleteAllNotifications()

      // Actualizar estado local
      notificaciones.value = []
      notificacionesNoLeidas.value = 0
    } catch (err) {
      console.error("Error al eliminar todas las notificaciones:", err)
      error.value = "No se pudieron eliminar todas las notificaciones"
    }
  }

  function actualizarContadorNoLeidas() {
    notificacionesNoLeidas.value = notificaciones.value.filter((n) => !n.read).length
  }

  function agregarNotificacion(notificacion) {
    notificaciones.value.unshift(notificacion)
    if (!notificacion.read) {
      notificacionesNoLeidas.value++
    }
  }

  // Inicializar escucha de notificaciones en tiempo real
  let unsubscribe = null
  function iniciarEscuchaNotificaciones() {
    if (unsubscribe) {
      unsubscribe()
    }

    unsubscribe = notificacionesService.onNotification((notificacion) => {
      agregarNotificacion(notificacion)
    })
  }

  function detenerEscuchaNotificaciones() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  return {
    // Estado
    notificaciones,
    cargando,
    error,
    permisoConcedido,
    notificacionesNoLeidas,

    // Getters
    tieneNotificacionesNoLeidas,
    notificacionesOrdenadas,

    // Acciones
    cargarNotificaciones,
    solicitarPermiso,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    eliminarTodasLasNotificaciones,
    iniciarEscuchaNotificaciones,
    detenerEscuchaNotificaciones,
  }
})
