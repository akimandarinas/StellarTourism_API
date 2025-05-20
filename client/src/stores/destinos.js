import { defineStore } from "pinia"
import { ref, computed } from "vue"
import {
  fetchDestinos,
  fetchDestino,
  fetchDestinosRelacionados,
  fetchActividades,
  fetchResenas,
  enviarResena,
} from "../services/api"

export const useDestinosStore = defineStore("destinos", () => {
  // Estado
  const destinos = ref([])
  const destinoActual = ref(null)
  const destinosRelacionados = ref([])
  const actividades = ref([])
  const resenas = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filtros = ref({
    nombre: "",
    precioMin: null,
    precioMax: null,
    puntuacion: null,
    categoria: null,
    ordenarPor: "popularidad",
  })
  const paginacion = ref({
    pagina: 1,
    porPagina: 10,
    total: 0,
  })

  // Getters
  const destinosFiltrados = computed(() => {
    let resultado = [...destinos.value]

    // Aplicar filtros
    if (filtros.value.nombre) {
      resultado = resultado.filter((d) => d.nombre.toLowerCase().includes(filtros.value.nombre.toLowerCase()))
    }

    if (filtros.value.precioMin !== null) {
      resultado = resultado.filter((d) => d.precio >= filtros.value.precioMin)
    }

    if (filtros.value.precioMax !== null) {
      resultado = resultado.filter((d) => d.precio <= filtros.value.precioMax)
    }

    if (filtros.value.puntuacion !== null) {
      resultado = resultado.filter((d) => d.puntuacion >= filtros.value.puntuacion)
    }

    if (filtros.value.categoria) {
      resultado = resultado.filter((d) => d.categoria === filtros.value.categoria)
    }

    // Ordenar resultados
    switch (filtros.value.ordenarPor) {
      case "precio-asc":
        resultado.sort((a, b) => a.precio - b.precio)
        break
      case "precio-desc":
        resultado.sort((a, b) => b.precio - a.precio)
        break
      case "puntuacion":
        resultado.sort((a, b) => b.puntuacion - a.puntuacion)
        break
      case "nombre":
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
      case "popularidad":
      default:
        resultado.sort((a, b) => b.popularidad - a.popularidad)
        break
    }

    return resultado
  })

  const totalPaginas = computed(() => {
    return Math.ceil(paginacion.value.total / paginacion.value.porPagina)
  })

  // Acciones
  const cargarDestinos = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetchDestinos({
        page: paginacion.value.pagina,
        per_page: paginacion.value.porPagina,
        ...params,
      })

      destinos.value = response.data
      paginacion.value.total = response.meta?.total || response.data.length

      return response
    } catch (err) {
      error.value = err.message || "Error al cargar destinos"
      throw err
    } finally {
      loading.value = false
    }
  }

  const cargarDestino = async (id) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetchDestino(id)
      destinoActual.value = response

      return response
    } catch (err) {
      error.value = err.message || `Error al cargar destino ${id}`
      throw err
    } finally {
      loading.value = false
    }
  }

  const cargarDestinosRelacionados = async (id) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetchDestinosRelacionados(id)
      destinosRelacionados.value = response

      return response
    } catch (err) {
      error.value = err.message || `Error al cargar destinos relacionados para ${id}`
      throw err
    } finally {
      loading.value = false
    }
  }

  const cargarActividades = async (destinoId) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetchActividades({ destino_id: destinoId })
      actividades.value = response

      return response
    } catch (err) {
      error.value = err.message || `Error al cargar actividades para destino ${destinoId}`
      throw err
    } finally {
      loading.value = false
    }
  }

  const cargarResenas = async (destinoId) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetchResenas({ destino_id: destinoId })
      resenas.value = response

      return response
    } catch (err) {
      error.value = err.message || `Error al cargar reseñas para destino ${destinoId}`
      throw err
    } finally {
      loading.value = false
    }
  }

  const agregarResena = async (data) => {
    loading.value = true
    error.value = null

    try {
      const response = await enviarResena(data)

      // Actualizar la lista de reseñas
      if (data.destino_id && resenas.value.length > 0) {
        resenas.value.unshift(response)
      }

      return response
    } catch (err) {
      error.value = err.message || "Error al enviar reseña"
      throw err
    } finally {
      loading.value = false
    }
  }

  const actualizarFiltros = (nuevosFiltros) => {
    filtros.value = { ...filtros.value, ...nuevosFiltros }
    paginacion.value.pagina = 1 // Resetear paginación al cambiar filtros
  }

  const cambiarPagina = (pagina) => {
    paginacion.value.pagina = pagina
  }

  const limpiarFiltros = () => {
    filtros.value = {
      nombre: "",
      precioMin: null,
      precioMax: null,
      puntuacion: null,
      categoria: null,
      ordenarPor: "popularidad",
    }
    paginacion.value.pagina = 1
  }

  return {
    // Estado
    destinos,
    destinoActual,
    destinosRelacionados,
    actividades,
    resenas,
    loading,
    error,
    filtros,
    paginacion,

    // Getters
    destinosFiltrados,
    totalPaginas,

    // Acciones
    cargarDestinos,
    cargarDestino,
    cargarDestinosRelacionados,
    cargarActividades,
    cargarResenas,
    agregarResena,
    actualizarFiltros,
    cambiarPagina,
    limpiarFiltros,
  }
})

export default useDestinosStore
