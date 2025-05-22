"use client"

import { ref, onMounted } from "vue"
import { useToast } from "./useToast"
import { useErrorHandler } from "./useErrorHandler"

// Datos mock para cuando no hay API disponible
const MOCK_NAVES = [
  {
    id: "1",
    nombre: "Aurora Estelar",
    tipo: "Crucero Orbital",
    capacidad: 120,
    velocidad: "28,000 km/h",
    autonomia: "30 días",
    descripcion:
      "Crucero de lujo diseñado para viajes orbitales alrededor de la Tierra y la Luna, con amplias vistas panorámicas y comodidades de primera clase.",
    imagen:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aurora-estelar-cruiser-RQ8yt03mV9GFflJm8wrfYK83vB6ImU.png",
    multiplicadorPrecio: 1.2,
  },
  {
    id: "2",
    nombre: "Halcón Lunar",
    tipo: "Lanzadera Lunar",
    capacidad: 8,
    velocidad: "40,000 km/h",
    autonomia: "14 días",
    descripcion:
      "Nave compacta y veloz especializada en viajes Tierra-Luna, ideal para expediciones cortas a la superficie lunar.",
    imagen:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/halcon-lunar-shuttle-QTNlppBIVLAihLCoKfG0xXzkPzD2xa.png",
    multiplicadorPrecio: 1.5,
  },
  {
    id: "3",
    nombre: "Voyager Marciano",
    tipo: "Crucero Interplanetario",
    capacidad: 80,
    velocidad: "120,000 km/h",
    autonomia: "180 días",
    descripcion:
      "Nave de largo alcance equipada para viajes a Marte, con sistemas de gravedad artificial y módulos de hibernación para los pasajeros.",
    imagen:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/voyager-marciano-cruiser.png-1lRnc8nBmVPVlMp40AuMoMTn0DErpu.jpeg",
    multiplicadorPrecio: 1.0,
  },
  {
    id: "4",
    nombre: "Estación Orbital Nexus",
    tipo: "Estación Espacial",
    capacidad: 250,
    velocidad: "27,600 km/h",
    autonomia: "Permanente",
    descripcion:
      "Estación espacial de última generación que sirve como punto de partida para expediciones más largas y como destino turístico por sí misma.",
    imagen:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nexus-orbital-station-5RJo0cfI0NUItzyPF6fCwYa04RduiQ.png",
    multiplicadorPrecio: 0.8,
  },
  {
    id: "5",
    nombre: "Explorador Solar",
    tipo: "Nave de Investigación",
    capacidad: 15,
    velocidad: "150,000 km/h",
    autonomia: "90 días",
    descripcion:
      "Nave científica que permite a los turistas participar en expediciones de investigación solar con equipamiento de observación avanzado.",
    imagen:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/solar-explorer-research-T31AK5CsKfqxRlxZo9uHODArM3ZrGQ.png",
    multiplicadorPrecio: 1.8,
  },
  {
    id: "6",
    nombre: "Artemisa Lunar",
    tipo: "Base Lunar Móvil",
    capacidad: 30,
    velocidad: "5,000 km/h",
    autonomia: "60 días",
    descripcion:
      "Base móvil que permite explorar diferentes regiones de la Luna, equipada con vehículos de superficie y módulos habitacionales.",
    imagen:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/artemisa-lunar-base.png-yinGoQ8HIqYQ3U9FfA2B8ZlER5CH6n.webp",
    multiplicadorPrecio: 1.3,
  },
]

// Mapeo de destinos a naves disponibles
const DESTINO_NAVES_MAP = {
  1: [1, 2, 4, 6], // Luna
  2: [3, 5], // Marte
  3: [1, 4], // Estación Orbital
}

export function useNaves(options = {}) {
  const toast = useToast()
  const { handleError } = useErrorHandler()

  // Estado
  const naves = ref([])
  const naveActual = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Detectar si estamos en Astro
  const isAstro = options.isAstro || (typeof window !== "undefined" && window.location.pathname.includes("/reservas"))

  // Cargar todas las naves
  const cargarNaves = async () => {
    if (loading.value) return naves.value

    loading.value = true
    error.value = null

    try {
      // Si estamos en Astro, usar datos mock
      if (isAstro) {
        // Simular una carga asíncrona
        await new Promise((resolve) => setTimeout(resolve, 500))

        naves.value = MOCK_NAVES
        return naves.value
      }

      // En un entorno real, aquí se cargarían las naves desde la API
      // Por ahora, usamos los datos mock
      naves.value = MOCK_NAVES
      return naves.value
    } catch (err) {
      const errorMessage = "No se pudieron cargar las naves"
      error.value = handleError(err, errorMessage)

      toast.error(errorMessage, {
        description: error.value.message,
      })

      return []
    } finally {
      loading.value = false
    }
  }

  // Cargar una nave por ID
  const cargarNave = async (id) => {
    if (!id) return null
    if (loading.value) return naveActual.value

    loading.value = true
    error.value = null

    try {
      // Si estamos en Astro, usar datos mock
      if (isAstro) {
        // Simular una carga asíncrona
        await new Promise((resolve) => setTimeout(resolve, 500))

        const nave = MOCK_NAVES.find((n) => n.id === id)
        naveActual.value = nave || null

        return naveActual.value
      }

      // En un entorno real, aquí se cargaría la nave desde la API
      // Por ahora, usamos los datos mock
      const nave = MOCK_NAVES.find((n) => n.id === id)
      naveActual.value = nave || null

      return naveActual.value
    } catch (err) {
      const errorMessage = `No se pudo cargar la nave ${id}`
      error.value = handleError(err, errorMessage)

      toast.error(errorMessage, {
        description: error.value.message,
      })

      return null
    } finally {
      loading.value = false
    }
  }

  // Cargar naves por destino
  const cargarNavesPorDestino = async (destinoId) => {
    if (!destinoId) return []

    loading.value = true
    error.value = null

    try {
      // Si estamos en Astro, usar datos mock
      if (isAstro) {
        // Simular una carga asíncrona
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Filtrar naves disponibles para este destino
        const navesIds = DESTINO_NAVES_MAP[destinoId] || []
        const navesDisponibles = MOCK_NAVES.filter((n) => navesIds.includes(Number.parseInt(n.id)))

        naves.value = navesDisponibles
        return naves.value
      }

      // En un entorno real, aquí se cargarían las naves disponibles para este destino desde la API
      // Por ahora, usamos los datos mock
      const navesIds = DESTINO_NAVES_MAP[destinoId] || []
      const navesDisponibles = MOCK_NAVES.filter((n) => navesIds.includes(Number.parseInt(n.id)))

      naves.value = navesDisponibles
      return naves.value
    } catch (err) {
      const errorMessage = `No se pudieron cargar las naves para el destino ${destinoId}`
      error.value = handleError(err, errorMessage)

      toast.error(errorMessage, {
        description: error.value.message,
      })

      return []
    } finally {
      loading.value = false
    }
  }

  // Cargar naves al montar el componente
  onMounted(() => {
    if (options.cargarAutomaticamente !== false) {
      cargarNaves()
    }

    // Si hay un ID en las opciones, cargar esa nave
    if (options.naveId) {
      cargarNave(options.naveId)
    }
  })

  return {
    naves,
    naveActual,
    loading,
    error,
    cargarNaves,
    cargarNave,
    cargarNavesPorDestino,
  }
}
