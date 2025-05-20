// Servicio API para Stellar Tourism
// Este archivo exporta todas las funciones necesarias para interactuar con la API

import axios from "axios"

// Determinar si estamos en modo desarrollo
const isDevelopment = import.meta.env ? import.meta.env.DEV : true

// Configuración base para axios
const defaultApiConfig = {
  baseURL: import.meta.env?.VITE_API_URL || "http://localhost:8000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
}

// Crear instancia de axios
const apiService = axios.create(defaultApiConfig)

// Configurar interceptores
apiService.interceptors.request.use(
  (config) => {
    // Añadir token de autenticación si existe
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor para manejar errores
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores específicos
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error("Error de respuesta:", error.response.status, error.response.data)

      // Manejar errores de autenticación
      if (error.response.status === 401) {
        // Limpiar token y redirigir a login si es necesario
        localStorage.removeItem("auth_token")
        // Si estamos en el navegador, podemos redirigir
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:logout"))
        }
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error("Error de solicitud:", error.request)
    } else {
      // Algo ocurrió al configurar la solicitud
      console.error("Error:", error.message)
    }

    return Promise.reject(error)
  },
)

// Funciones de utilidad para manejar respuestas
const handleResponse = (response) => response.data
const handleError = (error) => {
  console.error("API Error:", error)
  throw error
}

// Simular retraso para mocks
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Datos mock para desarrollo
const mockDestinos = [
  {
    id: 1,
    nombre: "Luna - Base Artemisa",
    descripcion:
      "Visita la primera colonia humana permanente en la Luna. Experimenta la baja gravedad y observa la Tierra desde nuestro satélite natural.",
    tipo: "planetario",
    duracion_viaje: 3,
    precio_base: 500000,
    imagen: "/images/luna-base.png",
    imagenPanoramica: "/images/lunar-base-artemisa-panorama.png",
    galeria: [
      {
        titulo: "Módulo de habitación lunar",
        descripcion: "Interior de los módulos habitacionales de la Base Artemisa",
        imagen: "/images/lunar-module-interior.png",
      },
      {
        titulo: "Vista de la Tierra",
        descripcion: "Impresionante vista de la Tierra desde la superficie lunar",
        imagen: "/images/earth-from-moon.png",
      },
      {
        titulo: "Exploración con rover",
        descripcion: "Explora la superficie lunar con nuestros rovers especializados",
        imagen: "/images/lunar-rover-exploration.png",
      },
    ],
    actividades: [
      {
        titulo: "Caminata lunar",
        descripcion: "Experimenta la sensación de caminar en la superficie lunar con solo 1/6 de la gravedad terrestre",
        duracion: 3,
        precio: 50000,
        incluido: true,
      },
      {
        titulo: "Observatorio astronómico",
        descripcion:
          "Visita el observatorio lunar y disfruta de vistas increíbles del espacio sin atmósfera que interfiera",
        duracion: 2,
        precio: 30000,
        incluido: true,
      },
      {
        titulo: "Conducción de rover",
        descripcion: "Conduce un rover lunar por la superficie y explora cráteres cercanos",
        duracion: 4,
        precio: 75000,
        incluido: false,
      },
    ],
    caracteristicas: [
      "Gravedad: 1/6 de la Tierra",
      "Temperatura: -173°C a 127°C",
      "Atmósfera: Ninguna",
      "Trajes espaciales incluidos",
      "Alojamiento en módulos presurizados",
      "Comunicación con la Tierra en tiempo real",
    ],
  },
  {
    id: 2,
    nombre: "Marte - Colonia Olympus",
    descripcion:
      "Explora el planeta rojo y la primera colonia humana en otro planeta. Visita el Monte Olympus, el volcán más grande del sistema solar.",
    tipo: "planetario",
    duracion_viaje: 210,
    precio_base: 1200000,
    imagen: "/images/marte.png",
    imagenPanoramica: "/images/mars-olympus-mons-panorama.png",
    galeria: [
      {
        titulo: "Domo de la colonia",
        descripcion: "Interior del domo principal de la Colonia Olympus",
        imagen: "/images/mars-colony-dome-interior.png",
      },
      {
        titulo: "Valles marcianos",
        descripcion: "Los impresionantes valles marcianos vistos desde un mirador",
        imagen: "/images/valles-marte.png",
      },
      {
        titulo: "Vista del Monte Olympus",
        descripcion: "El majestuoso Monte Olympus, el volcán más grande del sistema solar",
        imagen: "/images/olympus-mons-vista.png",
      },
    ],
    actividades: [
      {
        titulo: "Expedición al Monte Olympus",
        descripcion: "Viaje de tres días a la base del volcán más grande del sistema solar",
        duracion: 72,
        precio: 150000,
        incluido: true,
      },
      {
        titulo: "Exploración de cuevas marcianas",
        descripcion:
          "Descubre las cuevas formadas por antiguos tubos de lava, posibles ubicaciones para futuros asentamientos",
        duracion: 5,
        precio: 80000,
        incluido: true,
      },
      {
        titulo: "Búsqueda de evidencia de agua",
        descripcion: "Participa en una expedición científica para buscar evidencia de agua pasada o presente",
        duracion: 8,
        precio: 120000,
        incluido: false,
      },
    ],
    caracteristicas: [
      "Gravedad: 38% de la Tierra",
      "Temperatura: -125°C a 20°C",
      "Atmósfera: Muy tenue, principalmente CO2",
      "Trajes espaciales incluidos",
      "Alojamiento en hábitats presurizados",
      "Comunicación con la Tierra con 4-24 minutos de retraso",
    ],
  },
  {
    id: 3,
    nombre: "Estación Espacial Internacional",
    descripcion:
      "Experimenta la vida en órbita en esta maravilla de la ingeniería humana. Vive como un astronauta profesional.",
    tipo: "orbital",
    duracion_viaje: 0.125,
    precio_base: 350000,
    imagen: "/images/international-space-station.png",
    imagenPanoramica: "/images/earth-view.png",
    galeria: [
      {
        titulo: "Módulo de observación",
        descripcion: "La cúpula de observación con vistas panorámicas de la Tierra",
        imagen: "/images/earth-view.png",
      },
      {
        titulo: "Laboratorio científico",
        descripcion: "Participa en experimentos científicos en microgravedad",
        imagen: "/images/international-space-station.png",
      },
      {
        titulo: "Paseo espacial",
        descripcion: "Experimenta un paseo espacial fuera de la estación (opcional)",
        imagen: "/images/international-space-station.png",
      },
    ],
    actividades: [
      {
        titulo: "Observación de la Tierra",
        descripcion: "Disfruta de vistas espectaculares de nuestro planeta desde la cúpula de observación",
        duracion: 2,
        precio: 10000,
        incluido: true,
      },
      {
        titulo: "Experimentos en microgravedad",
        descripcion: "Participa en experimentos científicos reales en condiciones de ingravidez",
        duracion: 3,
        precio: 25000,
        incluido: true,
      },
      {
        titulo: "Paseo espacial",
        descripcion: "Experimenta la sensación de flotar en el espacio con un paseo espacial guiado",
        duracion: 4,
        precio: 150000,
        incluido: false,
      },
    ],
    caracteristicas: [
      "Gravedad: Microgravedad (ingravidez)",
      "Órbita: 400 km sobre la Tierra",
      "Velocidad: 28,000 km/h",
      "Entrenamiento de adaptación incluido",
      "Alojamiento en módulos habitacionales",
      "Comunicación con la Tierra en tiempo real",
    ],
  },
  {
    id: 4,
    nombre: "Venus - Observatorio Atmosférico",
    descripcion:
      "Visita nuestra estación orbital alrededor de Venus y observa las densas nubes y la atmósfera del planeta más caliente.",
    tipo: "orbital",
    duracion_viaje: 150,
    precio_base: 1800000,
    imagen: "/images/venus-clouds.png",
    imagenPanoramica: "/images/venus-panorama.png",
    galeria: [
      {
        titulo: "Nubes de Venus",
        descripcion: "Las características nubes amarillentas de Venus vistas desde la estación",
        imagen: "/images/venus-clouds.png",
      },
      {
        titulo: "Estación orbital",
        descripcion: "La estación orbital que orbita Venus a una distancia segura",
        imagen: "/images/venus-station.png",
      },
      {
        titulo: "Laboratorio atmosférico",
        descripcion: "Laboratorio especializado para el estudio de la atmósfera venusiana",
        imagen: "/images/venus-laboratory.png",
      },
    ],
    actividades: [
      {
        titulo: "Observación atmosférica",
        descripcion: "Observa las complejas capas de nubes y patrones atmosféricos de Venus",
        duracion: 3,
        precio: 30000,
        incluido: true,
      },
      {
        titulo: "Análisis de muestras",
        descripcion: "Participa en el análisis de muestras atmosféricas recolectadas por sondas",
        duracion: 4,
        precio: 45000,
        incluido: true,
      },
      {
        titulo: "Despliegue de sondas",
        descripcion: "Observa el lanzamiento de sondas atmosféricas hacia las nubes de Venus",
        duracion: 2,
        precio: 60000,
        incluido: false,
      },
    ],
    caracteristicas: [
      "Gravedad: Microgravedad (en la estación)",
      "Temperatura exterior: 462°C (en la superficie de Venus)",
      "Atmósfera: Extremadamente densa, principalmente CO2",
      "Observación segura desde la estación orbital",
      "Alojamiento en módulos presurizados",
      "Comunicación con la Tierra con 5-15 minutos de retraso",
    ],
  },
  {
    id: 5,
    nombre: "Júpiter - Crucero de las Lunas",
    descripcion:
      "Un crucero espacial alrededor del planeta más grande del sistema solar y sus fascinantes lunas: Ío, Europa, Ganímedes y Calisto.",
    tipo: "orbital",
    duracion_viaje: 600,
    precio_base: 2500000,
    imagen: "/images/jupiter-moons.png",
    imagenPanoramica: "/images/earth-view.png",
    galeria: [
      {
        titulo: "Superficie helada de Europa",
        descripcion: "La fascinante superficie helada de Europa, con potencial para albergar vida",
        imagen: "/images/mars-olympus-mons-panorama.png",
      },
      {
        titulo: "Actividad volcánica en Ío",
        descripcion: "Los impresionantes volcanes activos de Ío, la luna más volcánicamente activa",
        imagen: "/images/venus-clouds.png",
      },
      {
        titulo: "Descenso en Ganímedes",
        descripcion: "Aproximación a la superficie de Ganímedes, la luna más grande del sistema solar",
        imagen: "/images/lunar-rover-exploration.png",
      },
    ],
    actividades: [
      {
        titulo: "Observación de la Gran Mancha Roja",
        descripcion: "Observa de cerca la icónica tormenta gigante de Júpiter",
        duracion: 2,
        precio: 50000,
        incluido: true,
      },
      {
        titulo: "Tour por las lunas galileanas",
        descripcion: "Visita cercana a las cuatro lunas principales descubiertas por Galileo",
        duracion: 14,
        precio: 200000,
        incluido: true,
      },
      {
        titulo: "Descenso en sonda a Europa",
        descripcion: "Envía una sonda a la superficie de Europa y observa en tiempo real",
        duracion: 3,
        precio: 300000,
        incluido: false,
      },
    ],
    caracteristicas: [
      "Gravedad: Variable (dependiendo de la luna)",
      "Radiación: Alta (protección incluida)",
      "Distancia de observación segura",
      "Nave espacial con escudos de radiación",
      "Alojamiento en camarotes espaciales de lujo",
      "Comunicación con la Tierra con 35-50 minutos de retraso",
    ],
  },
  {
    id: 6,
    nombre: "Saturno - Anillos Majestuosos",
    descripcion:
      "Navega entre los icónicos anillos de Saturno y visita algunas de sus lunas más interesantes, incluyendo Titán y Encélado.",
    tipo: "orbital",
    duracion_viaje: 800,
    precio_base: 2800000,
    imagen: "/images/saturn-rings.png",
    imagenPanoramica: "/images/venus-panorama.png",
    galeria: [
      {
        titulo: "Navegación entre anillos",
        descripcion: "Experiencia única navegando entre las partículas de los anillos de Saturno",
        imagen: "/images/olympus-mons-vista.png",
      },
      {
        titulo: "Lagos de metano en Titán",
        descripcion: "Los fascinantes lagos de metano líquido en la superficie de Titán",
        imagen: "/images/mars-colony-dome-interior.png",
      },
      {
        titulo: "Géiseres de Encélado",
        descripcion: "Los géiseres de agua que erupciona desde el polo sur de Encélado",
        imagen: "/images/international-space-station.png",
      },
    ],
    actividades: [
      {
        titulo: "Vuelo a través de los anillos",
        descripcion: "Experimenta un vuelo seguro a través de una sección de los anillos de Saturno",
        duracion: 5,
        precio: 150000,
        incluido: true,
      },
      {
        titulo: "Observación de Titán",
        descripcion: "Observa la luna más grande de Saturno con su densa atmósfera y lagos de metano",
        duracion: 3,
        precio: 100000,
        incluido: true,
      },
      {
        titulo: "Misión a los géiseres de Encélado",
        descripcion: "Acércate a los géiseres de agua del polo sur de Encélado",
        duracion: 4,
        precio: 200000,
        incluido: false,
      },
    ],
    caracteristicas: [
      "Gravedad: Variable (dependiendo de la luna)",
      "Temperatura: Extremadamente fría",
      "Distancia de observación segura",
      "Nave espacial con sistemas de calefacción avanzados",
      "Alojamiento en camarotes espaciales de lujo",
      "Comunicación con la Tierra con 70-90 minutos de retraso",
    ],
  },
]

const mockNaves = [
  {
    id: 1,
    nombre: "Estrella Fugaz",
    tipo: "Transporte rápido",
    capacidad: 20,
    velocidad: 40000,
    autonomia: 5000000,
    imagen: "/images/nave-estelar.png",
  },
  {
    id: 2,
    nombre: "Explorador Cósmico",
    tipo: "Nave de exploración",
    capacidad: 8,
    velocidad: 30000,
    autonomia: 8000000,
    imagen: "/images/nave-estelar.png",
  },
  {
    id: 3,
    nombre: "Crucero Galáctico",
    tipo: "Crucero espacial",
    capacidad: 100,
    velocidad: 25000,
    autonomia: 10000000,
    imagen: "/images/nave-estelar.png",
  },
]

const mockReservas = [
  {
    id: 1,
    destinoId: 1,
    destinoNombre: "Luna - Base Artemisa",
    naveId: 1,
    naveNombre: "Estrella Fugaz",
    fechaViaje: "2025-06-15",
    fechaRetorno: "2025-06-22",
    pasajeros: 2,
    estado: "confirmada",
    precio: 1050000,
  },
  {
    id: 2,
    destinoId: 3,
    destinoNombre: "Estación Espacial Internacional",
    naveId: 2,
    naveNombre: "Explorador Cósmico",
    fechaViaje: "2025-08-10",
    fechaRetorno: "2025-08-17",
    pasajeros: 1,
    estado: "pendiente",
    precio: 350000,
  },
]

const mockActividades = [
  {
    id: 1,
    destinoId: 1,
    titulo: "Caminata lunar",
    descripcion: "Experimenta la sensación de caminar en la superficie lunar con solo 1/6 de la gravedad terrestre",
    duracion: 3,
    precio: 50000,
    incluido: true,
  },
  {
    id: 2,
    destinoId: 1,
    titulo: "Observatorio astronómico",
    descripcion:
      "Visita el observatorio lunar y disfruta de vistas increíbles del espacio sin atmósfera que interfiera",
    duracion: 2,
    precio: 30000,
    incluido: true,
  },
  {
    id: 3,
    destinoId: 2,
    titulo: "Expedición al Monte Olympus",
    descripcion: "Viaje de tres días a la base del volcán más grande del sistema solar",
    duracion: 72,
    precio: 150000,
    incluido: true,
  },
]

const mockResenas = [
  {
    id: 1,
    destinoId: 1,
    usuario: {
      id: 101,
      nombre: "Ana García",
      avatar: "/images/avatar-woman-1.png",
    },
    puntuacion: 5,
    comentario:
      "¡Una experiencia increíble! Caminar en la Luna fue surrealista, las vistas de la Tierra son indescriptibles. El alojamiento en la Base Artemisa superó mis expectativas.",
    fecha: "2024-03-15",
  },
  {
    id: 2,
    destinoId: 1,
    usuario: {
      id: 102,
      nombre: "Carlos Rodríguez",
      avatar: "/images/avatar-man-1.png",
    },
    puntuacion: 4,
    comentario:
      "El viaje a la Luna fue fascinante. La caminata lunar y el observatorio fueron lo más destacado. Solo le quito una estrella porque el viaje de regreso tuvo algunas turbulencias.",
    fecha: "2024-02-28",
  },
  {
    id: 3,
    destinoId: 2,
    usuario: {
      id: 103,
      nombre: "Elena Martínez",
      avatar: "/images/avatar-woman-2.png",
    },
    puntuacion: 5,
    comentario:
      "Marte superó todas mis expectativas. La Colonia Olympus es impresionante y la expedición al Monte Olympus fue el punto culminante. ¡Totalmente recomendado!",
    fecha: "2024-01-20",
  },
]

// API para destinos
export const fetchDestinos = async (params = {}) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchDestinos", params)
    return { data: mockDestinos, meta: { total: mockDestinos.length } }
  }

  try {
    const response = await apiService.get("/destinos", { params })
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const fetchDestino = async (id) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchDestino", id)
    const destino = mockDestinos.find((d) => d.id == id)
    return destino || null
  }

  try {
    const response = await apiService.get(`/destinos/${id}`)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const fetchDestinosRelacionados = async (id) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchDestinosRelacionados", id)
    // Encontrar el destino actual para obtener su tipo
    const destinoActual = mockDestinos.find((d) => d.id == id)
    if (!destinoActual) return []

    // Filtrar destinos del mismo tipo, excluyendo el actual
    return mockDestinos.filter((d) => d.id != id && d.tipo === destinoActual.tipo).slice(0, 3)
  }

  try {
    const response = await apiService.get(`/destinos/${id}/relacionados`)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

// API para actividades
export const fetchActividades = async (params = {}) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchActividades", params)

    if (params.destino_id) {
      return mockActividades.filter((a) => a.destinoId == params.destino_id)
    }

    return mockActividades
  }

  try {
    const response = await apiService.get("/actividades", { params })
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const fetchActividadesPorDestino = async (destinoId) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchActividadesPorDestino", destinoId)
    return mockActividades.filter((a) => a.destinoId == destinoId)
  }

  try {
    const response = await apiService.get(`/destinos/${destinoId}/actividades`)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

// API para reseñas
export const fetchResenas = async (params = {}) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchResenas", params)

    if (params.destino_id) {
      return mockResenas.filter((r) => r.destinoId == params.destino_id)
    }

    return mockResenas
  }

  try {
    const response = await apiService.get("/resenas", { params })
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const fetchResenasPorDestino = async (destinoId) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchResenasPorDestino", destinoId)
    return mockResenas.filter((r) => r.destinoId == destinoId)
  }

  try {
    const response = await apiService.get(`/destinos/${destinoId}/resenas`)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const enviarResena = async (data) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] enviarResena", data)

    // Crear una nueva reseña simulada
    const nuevaResena = {
      id: mockResenas.length + 1,
      destinoId: data.destino_id,
      usuario: {
        id: 999,
        nombre: "Usuario Actual",
        avatar: null,
      },
      puntuacion: data.puntuacion,
      comentario: data.comentario,
      fecha: new Date().toISOString().split("T")[0],
    }

    // En un entorno real, esto se guardaría en la base de datos
    mockResenas.push(nuevaResena)

    return nuevaResena
  }

  try {
    const response = await apiService.post("/resenas", data)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

// API para naves
export const fetchNaves = async (params = {}) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchNaves", params)
    return { naves: mockNaves, total: mockNaves.length }
  }

  try {
    const response = await apiService.get("/naves", { params })
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const fetchNave = async (id) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchNave", id)
    const nave = mockNaves.find((n) => n.id == id)
    return nave || null
  }

  try {
    const response = await apiService.get(`/naves/${id}`)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const fetchNavesRelacionadas = async (id) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchNavesRelacionadas", id)
    // Excluir la nave actual y devolver hasta 2 naves relacionadas
    return mockNaves.filter((n) => n.id != id).slice(0, 2)
  }

  try {
    const response = await apiService.get(`/naves/${id}/relacionadas`)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const fetchDestinosDisponibles = async (naveId) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchDestinosDisponibles", naveId)
    // Simular que todos los destinos están disponibles para todas las naves
    return mockDestinos
  }

  try {
    const response = await apiService.get(`/naves/${naveId}/destinos-disponibles`)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

// API para reservas
export const fetchReservas = async (params = {}) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchReservas", params)
    return mockReservas
  }

  try {
    const response = await apiService.get("/reservas", { params })
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const fetchReserva = async (id) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] fetchReserva", id)
    const reserva = mockReservas.find((r) => r.id == id)
    return reserva || null
  }

  try {
    const response = await apiService.get(`/reservas/${id}`)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const crearReserva = async (data) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] crearReserva", data)

    // Crear una nueva reserva simulada
    const nuevaReserva = {
      id: mockReservas.length + 1,
      destinoId: data.destino_id,
      destinoNombre: mockDestinos.find((d) => d.id == data.destino_id)?.nombre || "Destino Desconocido",
      naveId: data.nave_id,
      naveNombre: mockNaves.find((n) => n.id == data.nave_id)?.nombre || "Nave Desconocida",
      fechaViaje: data.fecha_viaje,
      fechaRetorno: data.fecha_retorno,
      pasajeros: data.pasajeros,
      estado: "pendiente",
      precio: data.precio || 1000000,
    }

    // En un entorno real, esto se guardaría en la base de datos
    mockReservas.push(nuevaReserva)

    return nuevaReserva
  }

  try {
    const response = await apiService.post("/reservas", data)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const modificarReserva = async (id, data) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] modificarReserva", id, data)

    // Buscar la reserva a modificar
    const index = mockReservas.findIndex((r) => r.id == id)

    if (index === -1) {
      throw new Error("Reserva no encontrada")
    }

    // Actualizar la reserva
    mockReservas[index] = { ...mockReservas[index], ...data }

    return mockReservas[index]
  }

  try {
    const response = await apiService.put(`/reservas/${id}`, data)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const cancelarReserva = async (id, motivo = "") => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] cancelarReserva", id, motivo)

    // Buscar la reserva a cancelar
    const index = mockReservas.findIndex((r) => r.id == id)

    if (index === -1) {
      throw new Error("Reserva no encontrada")
    }

    // Actualizar el estado de la reserva
    mockReservas[index] = {
      ...mockReservas[index],
      estado: "cancelada",
      motivoCancelacion: motivo,
    }

    return mockReservas[index]
  }

  try {
    const response = await apiService.post(`/reservas/${id}/cancelar`, { motivo })
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const cancelarReservaAPI = cancelarReserva // Alias para compatibilidad

// API para usuarios
export const crearUsuario = async (data) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] crearUsuario", data)

    // Simular creación de usuario
    return {
      id: "user-" + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    }
  }

  try {
    const response = await apiService.post("/usuarios", data)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

export const actualizarUsuario = async (id, data) => {
  if (isDevelopment) {
    await delay()
    console.log("[MOCK] actualizarUsuario", id, data)

    // Simular actualización de usuario
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    }
  }

  try {
    const response = await apiService.put(`/usuarios/${id}`, data)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

// API para favoritos
export const api = {
  favoritos: {
    getByUser: async (userId) => {
      if (isDevelopment) {
        await delay()
        console.log("[MOCK] api.favoritos.getByUser", userId)

        // Simular favoritos del usuario
        return mockDestinos.slice(0, 2).map((destino) => ({
          id: `fav-${destino.id}`,
          userId,
          destinoId: destino.id,
          nombre: destino.nombre,
          imagen: destino.imagen,
          fechaCreacion: new Date().toISOString(),
        }))
      }

      try {
        const response = await apiService.get(`/usuarios/${userId}/favoritos`)
        return handleResponse(response)
      } catch (error) {
        return handleError(error)
      }
    },
    add: async (userId, data) => {
      if (isDevelopment) {
        await delay()
        console.log("[MOCK] api.favoritos.add", userId, data)

        // Simular añadir favorito
        return {
          id: `fav-${Date.now()}`,
          userId,
          ...data,
          fechaCreacion: new Date().toISOString(),
        }
      }

      try {
        const response = await apiService.post(`/usuarios/${userId}/favoritos`, data)
        return handleResponse(response)
      } catch (error) {
        return handleError(error)
      }
    },
    remove: async (userId, destinoId) => {
      if (isDevelopment) {
        await delay()
        console.log("[MOCK] api.favoritos.remove", userId, destinoId)

        // Simular eliminar favorito
        return { success: true }
      }

      try {
        const response = await apiService.delete(`/usuarios/${userId}/favoritos/${destinoId}`)
        return handleResponse(response)
      } catch (error) {
        return handleError(error)
      }
    },
  },
}

// Exportar por defecto para compatibilidad con importaciones existentes
export default apiService
