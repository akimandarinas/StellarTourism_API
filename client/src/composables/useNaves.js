import { computed } from "vue"
import { useNavesStore } from "../stores/naves"

export function useNaves() {
  const navesStore = useNavesStore()

  return {
    naves: computed(() => navesStore.naves),
    naveActual: computed(() => navesStore.naveActual),
    navesRelacionadas: computed(() => navesStore.navesRelacionadas),
    destinosDisponibles: computed(() => navesStore.destinosDisponibles),
    loading: computed(() => navesStore.loading),
    error: computed(() => navesStore.error),
    filtros: computed(() => navesStore.filtros),
    navesFiltradas: computed(() => navesStore.navesFiltradas),
    cargarNaves: navesStore.cargarNaves,
    cargarNave: navesStore.cargarNave,
    cargarNavesRelacionadas: navesStore.cargarNavesRelacionadas,
    cargarDestinosDisponibles: navesStore.cargarDestinosDisponibles,
    aplicarFiltros: navesStore.aplicarFiltros,
    limpiarFiltros: navesStore.limpiarFiltros,
  }
}
