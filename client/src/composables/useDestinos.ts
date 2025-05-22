"use client"

import { ref, computed, onMounted, watch, type Ref, type ComputedRef } from "vue"
import { destinosService, type Destino, type DestinoFilter } from "@/services/destinos"
import { useToast } from "./useToast"
import { useErrorHandler } from "./useErrorHandler"

// Datos mock para cuando no hay API disponible
const MOCK_DESTINOS = [
  {
    id: "1",
    nombre: "Luna Base Artemisa",
    descripcion: "Primera base permanente en la Luna, con vistas espectaculares de la Tierra.",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luna-base-RQ8yt03mV9GFflJm8wrfYK83vB6ImU.png",
    precio: 1200000,
    duracion: "7 días",
    distancia: "384,400 km",
    popularidad: 4.8,
    capacidad: 20,
    categoria: "orbital",
  },
  {
    id: "2",
    nombre: "Marte Olympus",
    descripcion: "Explora la montaña más alta del sistema solar en el planeta rojo.",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marte-QTNlppBIVLAihLCoKfG0xXzkPzD2xa.png",
    precio: 2500000,
    duracion: "30 días",
    distancia: "54.6 millones km",
    popularidad: 4.5,
    capacidad: 8,
    categoria: "planetario",
  },
  {
    id: "3",
    nombre: "Estación Orbital Internacional",
    descripcion: "Experimenta la ingravidez en la estación espacial más avanzada.",
    imagen:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/estacion-orbital-1lRnc8nBmVPVlMp40AuMoMTn0DErpu.png",
    precio: 950000,
    duracion: "10 días",
    distancia: "400 km",
    popularidad: 4.9,
    capacidad: 12,
    categoria: "orbital",
  },
]

export interface UseDestinosOptions {
  page?: number
  limit?: number
  filtros?: DestinoFilter
  cargarAutomaticamente?: boolean
  enableCache?: boolean
  prefetch?: boolean
  destinoId?: string // Añadimos esta opción para cuando no hay router
  isAstro?: boolean // Indicador explícito para modo Astro
}

export interface UseDestinosReturn {
  destinos: Ref<Destino[]>
  destinoActual: Ref<Destino | null>
  destinosRelacionados: Ref<Destino[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  totalItems: Ref<number>
  currentPage: Ref<number>
  itemsPerPage: Ref<number>
  filtros: Ref<DestinoFilter>
  totalPaginas: ComputedRef<number>
  cargarDestinos: () => Promise<Destino[]>
  cargarDestino: (id: string) => Promise<Destino | null>
  cargarDestinosRelacionados: (id: string) => Promise<Destino[]>
  buscarDestinos: (query: string) => Promise<Destino[]>
  aplicarFiltros: (nuevosFiltros: DestinoFilter) => void
  limpiarFiltros: () => void
  cambiarPagina: (pagina: number) => void
  refrescarDatos: () => Promise<void>
  isStale: ComputedRef<boolean>
}

/**
 * Composable para gestionar destinos
 * @param options Opciones de configuración
 * @returns Métodos y estado para gestionar destinos
 */
export function useDestinos(options: UseDestinosOptions = {}): UseDestinosReturn {
  const toast = useToast()
  const { handleError } = useErrorHandler()

  // Estado
  const destinos = ref<Destino[]>([]) as Ref<Destino[]>
  const destinoActual = ref<Destino | null>(null)
  const destinosRelacionados = ref<Destino[]>([]) as Ref<Destino[]>
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const totalItems = ref(0)
  const currentPage = ref(options.page || 1)
  const itemsPerPage = ref(options.limit || 12)
  const filtros = ref<DestinoFilter>(options.filtros || {})
  const lastFetched = ref<Date | null>(null)

  // Detectar si estamos en Astro
  const isAstro = options.isAstro || (typeof window !== "undefined" && window.location.pathname.includes("/reservas"))

  // Opciones
  const enableCache = options.enableCache !== false
  const prefetch = options.prefetch !== false

  /**
   * Cargar destinos con manejo de errores mejorado
   */
  const cargarDestinos = async (): Promise<Destino[]> => {
    if (loading.value) return destinos.value

    loading.value = true
    error.value = null

    try {
      // Si estamos en Astro, usar datos mock
      if (isAstro) {
        // Simular una carga asíncrona
        await new Promise((resolve) => setTimeout(resolve, 500))

        destinos.value = MOCK_DESTINOS as Destino[]
        totalItems.value = MOCK_DESTINOS.length
        lastFetched.value = new Date()

        return destinos.value
      }

      // Si no estamos en Astro, usar el servicio real
      const response = await destinosService.getAll({
        page: currentPage.value,
        limit: itemsPerPage.value,
        ...filtros.value,
      })

      destinos.value = response.data
      totalItems.value = response.meta.total
      lastFetched.value = new Date()

      return destinos.value
    } catch (err) {
      const errorMessage = "No se pudieron cargar los destinos"
      error.value = handleError(err, errorMessage)

      toast.error(errorMessage, {
        description: error.value.message,
      })

      // En caso de error, usar datos mock
      destinos.value = MOCK_DESTINOS as Destino[]
      totalItems.value = MOCK_DESTINOS.length
      lastFetched.value = new Date()

      return destinos.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Cargar un destino por ID con manejo de errores mejorado
   */
  const cargarDestino = async (id: string): Promise<Destino | null> => {
    if (!id) return null
    if (loading.value) return destinoActual.value

    loading.value = true
    error.value = null

    try {
      // Si estamos en Astro, usar datos mock
      if (isAstro) {
        // Simular una carga asíncrona
        await new Promise((resolve) => setTimeout(resolve, 500))

        const destino = MOCK_DESTINOS.find((d) => d.id === id) as Destino
        destinoActual.value = destino || null

        return destinoActual.value
      }

      // Si no estamos en Astro, usar el servicio real
      const destino = await destinosService.getById(id)
      destinoActual.value = destino

      // Prefetch relacionados si está habilitado
      if (prefetch) {
        cargarDestinosRelacionados(id).catch(() => {
          // Silenciar errores de prefetch
        })
      }

      return destino
    } catch (err) {
      const errorMessage = `No se pudo cargar el destino ${id}`
      error.value = handleError(err, errorMessage)

      toast.error(errorMessage, {
        description: error.value.message,
      })

      // En caso de error, buscar en datos mock
      const destino = MOCK_DESTINOS.find((d) => d.id === id) as Destino
      destinoActual.value = destino || null

      return destinoActual.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Cargar destinos relacionados con manejo de errores mejorado
   */
  const cargarDestinosRelacionados = async (id: string): Promise<Destino[]> => {
    if (!id) return []

    try {
      // Si estamos en Astro, usar datos mock
      if (isAstro) {
        // Simular una carga asíncrona
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Excluir el destino actual y tomar hasta 3 destinos relacionados
        const relacionados = MOCK_DESTINOS.filter((d) => d.id !== id).slice(0, 3) as Destino[]

        destinosRelacionados.value = relacionados
        return relacionados
      }

      // Si no estamos en Astro, usar el servicio real
      const relacionados = await destinosService.getRelated(id)
      destinosRelacionados.value = relacionados
      return relacionados
    } catch (err) {
      console.error(`Error al cargar destinos relacionados para ${id}:`, err)

      // En caso de error, usar datos mock
      const relacionados = MOCK_DESTINOS.filter((d) => d.id !== id).slice(0, 3) as Destino[]

      destinosRelacionados.value = relacionados
      return relacionados
    }
  }

  /**
   * Buscar destinos con manejo de errores mejorado
   */
  const buscarDestinos = async (query: string): Promise<Destino[]> => {
    if (!query) {
      return cargarDestinos()
    }

    loading.value = true
    error.value = null

    try {
      // Si estamos en Astro, usar datos mock
      if (isAstro) {
        // Simular una carga asíncrona
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Filtrar destinos que coincidan con la búsqueda
        const resultados = MOCK_DESTINOS.filter(
          (d) =>
            d.nombre.toLowerCase().includes(query.toLowerCase()) ||
            d.descripcion.toLowerCase().includes(query.toLowerCase()),
        ) as Destino[]

        destinos.value = resultados
        totalItems.value = resultados.length
        lastFetched.value = new Date()

        return destinos.value
      }

      // Si no estamos en Astro, usar el servicio real
      const response = await destinosService.search(query, {
        page: currentPage.value,
        limit: itemsPerPage.value,
      })

      destinos.value = response.data
      totalItems.value = response.meta.total
      lastFetched.value = new Date()

      return destinos.value
    } catch (err) {
      const errorMessage = `No se pudieron buscar los destinos con término "${query}"`
      error.value = handleError(err, errorMessage)

      toast.error(errorMessage, {
        description: error.value.message,
      })

      // En caso de error, usar datos mock filtrados
      const resultados = MOCK_DESTINOS.filter(
        (d) =>
          d.nombre.toLowerCase().includes(query.toLowerCase()) ||
          d.descripcion.toLowerCase().includes(query.toLowerCase()),
      ) as Destino[]

      destinos.value = resultados
      totalItems.value = resultados.length
      lastFetched.value = new Date()

      return destinos.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Aplicar filtros a la búsqueda
   */
  const aplicarFiltros = (nuevosFiltros: DestinoFilter): void => {
    filtros.value = { ...filtros.value, ...nuevosFiltros }
    currentPage.value = 1 // Resetear a primera página
  }

  /**
   * Limpiar todos los filtros
   */
  const limpiarFiltros = (): void => {
    filtros.value = {}
    currentPage.value = 1
    cargarDestinos()
  }

  /**
   * Cambiar a una página específica
   */
  const cambiarPagina = (pagina: number): void => {
    if (pagina < 1 || pagina > totalPaginas.value) return

    currentPage.value = pagina
    cargarDestinos()
  }

  /**
   * Refrescar todos los datos
   */
  const refrescarDatos = async (): Promise<void> => {
    if (destinoActual.value) {
      await cargarDestino(destinoActual.value.id)
    } else {
      await cargarDestinos()
    }
  }

  // Computed properties
  const totalPaginas = computed(() => {
    return Math.ceil(totalItems.value / itemsPerPage.value) || 1
  })

  const isStale = computed(() => {
    if (!lastFetched.value) return true

    // Considerar datos obsoletos después de 5 minutos
    const staleTime = 5 * 60 * 1000
    return Date.now() - lastFetched.value.getTime() > staleTime
  })

  // Ciclo de vida
  onMounted(() => {
    if (options.cargarAutomaticamente !== false) {
      cargarDestinos()
    }

    // Si hay un ID en las opciones, cargar ese destino
    if (options.destinoId) {
      cargarDestino(options.destinoId)
    }
  })

  // Observar cambios en filtros
  watch(
    filtros,
    () => {
      cargarDestinos()
    },
    { deep: true },
  )

  return {
    destinos,
    destinoActual,
    destinosRelacionados,
    loading,
    error,
    totalItems,
    currentPage,
    itemsPerPage,
    filtros,
    totalPaginas,
    cargarDestinos,
    cargarDestino,
    cargarDestinosRelacionados,
    buscarDestinos,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    refrescarDatos,
    isStale,
  }
}
