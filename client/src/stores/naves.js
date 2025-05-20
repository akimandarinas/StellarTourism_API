import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { navesService } from "../services/naves"

export const useNavesStore = defineStore("naves", () => {
  // Estado
  const naves = ref([])
  const naveActual = ref(null)
  const navesRelacionadas = ref([])
  const destinosDisponibles = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filtros = ref({
    tipo: null,
    capacidadMin: null,
    capacidadMax: null,
    precioMin: null,
    precioMax: null,
    disponibilidad: null,
  })

  // Getters
  const navesFiltradas = computed(() => {
    let resultado = [...naves.value]

    if (filtros.value.tipo) {
      resultado = resultado.filter((nave) => nave.tipo.toLowerCase() === filtros.value.tipo.toLowerCase())
    }

    if (filtros.value.capacidadMin !== null) {
      resultado = resultado.filter((nave) => nave.capacidad >= filtros.value.capacidadMin)
    }

    if (filtros.value.capacidadMax !== null) {
      resultado = resultado.filter((nave) => nave.capacidad <= filtros.value.capacidadMax)
    }

    if (filtros.value.precioMin !== null) {
      resultado = resultado.filter((nave) => nave.precio >= filtros.value.precioMin)
    }

    if (filtros.value.precioMax !== null) {
      resultado = resultado.filter((nave) => nave.precio <= filtros.value.precioMax)
    }

    if (filtros.value.disponibilidad !== null) {
      resultado = resultado.filter((nave) => nave.disponibilidad === filtros.value.disponibilidad)
    }

    return resultado
  })

  // Acciones
  const cargarNaves = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await navesService.getNaves()
      naves.value = data
    } catch (err) {
      console.error("Error al cargar naves:", err)
      error.value = "No se pudieron cargar las naves. Por favor, intenta nuevamente."
    } finally {
      loading.value = false
    }
  }

  const cargarNave = async (id) => {
    loading.value = true
    error.value = null

    try {
      const data = await navesService.getNave(id)
      naveActual.value = data
      return data
    } catch (err) {
      console.error("Error al cargar nave:", err)
      error.value = "No se pudo cargar la información de la nave. Por favor, intenta nuevamente."
      return null
    } finally {
      loading.value = false
    }
  }

  const cargarNavesRelacionadas = async (naveId) => {
    try {
      const data = await navesService.getNavesRelacionadas(naveId)
      navesRelacionadas.value = data
      return data
    } catch (err) {
      console.error("Error al cargar naves relacionadas:", err)
      return []
    }
  }

  const cargarDestinosDisponibles = async (naveId) => {
    try {
      const data = await navesService.getDestinosDisponibles(naveId)
      destinosDisponibles.value = data
      return data
    } catch (err) {
      console.error("Error al cargar destinos disponibles:", err)
      return []
    }
  }

  const aplicarFiltros = (nuevosFiltros) => {
    filtros.value = { ...filtros.value, ...nuevosFiltros }
  }

  const limpiarFiltros = () => {
    filtros.value = {
      tipo: null,
      capacidadMin: null,
      capacidadMax: null,
      precioMin: null,
      precioMax: null,
      disponibilidad: null,
    }
  }

  return {
    // Estado
    naves,
    naveActual,
    navesRelacionadas,
    destinosDisponibles,
    loading,
    error,
    filtros,

    // Getters
    navesFiltradas,

    // Acciones
    cargarNaves,
    cargarNave,
    cargarNavesRelacionadas,
    cargarDestinosDisponibles,
    aplicarFiltros,
    limpiarFiltros,
  }
})
