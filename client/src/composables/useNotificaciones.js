import { computed } from "vue"
import { useNotificacionesStore } from "../stores/notificaciones"

export function useNotificaciones() {
  const notificacionesStore = useNotificacionesStore()

  return {
    notificaciones: computed(() => notificacionesStore.notificaciones),
    notificacionesNoLeidas: computed(() => notificacionesStore.notificacionesNoLeidas),
    cantidadNoLeidas: computed(() => notificacionesStore.cantidadNoLeidas),
    loading: computed(() => notificacionesStore.loading),
    error: computed(() => notificacionesStore.error),
    cargarNotificaciones: notificacionesStore.cargarNotificaciones,
    marcarNotificacionLeida: notificacionesStore.marcarNotificacionLeida,
    marcarTodasLeidas: notificacionesStore.marcarTodasLeidas,
    agregarNotificacion: notificacionesStore.agregarNotificacion,
  }
}
