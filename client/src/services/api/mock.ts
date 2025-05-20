// Mock de datos para desarrollo
// Este archivo proporciona datos simulados para desarrollo

export const mockDestinos = [
  {
    id: 1,
    nombre: "Luna",
    descripcion: "Nuestro satélite natural, un destino clásico para los viajeros espaciales.",
    tipo: "Satélite",
    distanciaTierra: 384400,
    tiempoViaje: "3 días",
    gravedad: "1/6 de la Tierra",
    atmosfera: "Ninguna",
    temperatura: "-173°C a 127°C",
    precio: 500000,
    imagen: "/luna-moth.png",
  },
  {
    id: 2,
    nombre: "Marte",
    descripcion: "El planeta rojo te espera. Explora sus vastos cañones y montañas.",
    tipo: "Planeta",
    distanciaTierra: 54600000,
    tiempoViaje: "7 meses",
    gravedad: "38% de la Tierra",
    atmosfera: "Delgada, principalmente CO2",
    temperatura: "-153°C a 20°C",
    precio: 1200000,
    imagen: "/marte.png",
  },
  {
    id: 3,
    nombre: "Estación Espacial Internacional",
    descripcion: "Experimenta la vida en órbita en esta maravilla de la ingeniería humana.",
    tipo: "Estación",
    distanciaTierra: 400,
    tiempoViaje: "6 horas",
    gravedad: "Microgravedad",
    atmosfera: "Artificial, similar a la Tierra",
    temperatura: "Controlada, 18°C a 27°C",
    precio: 350000,
    imagen: "/international-space-station.png",
  },
  {
    id: 4,
    nombre: "Europa (Luna de Júpiter)",
    descripcion: "Visita uno de los lugares más prometedores para encontrar vida extraterrestre.",
    tipo: "Luna",
    distanciaTierra: 628300000,
    tiempoViaje: "6 años",
    gravedad: "13% de la Tierra",
    atmosfera: "Tenue, oxígeno",
    temperatura: "-160°C",
    precio: 2500000,
    imagen: "/placeholder.svg?height=300&width=400&query=Europa",
  },
]

export const mockNaves = [
  {
    id: 1,
    nombre: "Stellar Explorer",
    descripcion: "Nuestra nave insignia, diseñada para viajes interplanetarios de larga duración.",
    tipo: "Crucero Espacial",
    capacidad: 200,
    velocidad: 30,
    autonomia: 500,
    imagen: "/placeholder.svg?height=400&width=600&text=Stellar+Explorer",
  },
  {
    id: 2,
    nombre: "Lunar Shuttle",
    descripcion: "Perfecta para viajes cortos a la Luna, esta nave compacta ofrece una experiencia rápida.",
    tipo: "Transporte",
    capacidad: 50,
    velocidad: 15,
    autonomia: 10,
    imagen: "/placeholder.svg?height=400&width=600&text=Lunar+Shuttle",
  },
  {
    id: 3,
    nombre: "Red Planet Pioneer",
    descripcion: "Especializada en viajes a Marte, esta nave cuenta con sistemas avanzados de soporte vital.",
    tipo: "Explorador",
    capacidad: 100,
    velocidad: 25,
    autonomia: 300,
    imagen: "/placeholder.svg?height=400&width=600&text=Red+Planet+Pioneer",
  },
]

export const mockReservas = [
  {
    id: 1,
    destinoId: 1,
    destinoNombre: "Luna",
    naveId: 2,
    naveNombre: "Lunar Shuttle",
    fechaViaje: "2025-07-15",
    fechaRetorno: "2025-07-22",
    pasajeros: 2,
    estado: "confirmada",
    precio: 1000000,
  },
  {
    id: 2,
    destinoId: 2,
    destinoNombre: "Marte",
    naveId: 3,
    naveNombre: "Red Planet Pioneer",
    fechaViaje: "2025-09-10",
    fechaRetorno: "2026-04-15",
    pasajeros: 3,
    estado: "pendiente",
    precio: 3600000,
  },
]

export const mockActividades = [
  {
    id: 1,
    destinoId: 1,
    nombre: "Paseo Lunar",
    descripcion: "Experimenta la gravedad lunar en un paseo por la superficie.",
    duracion: 3,
    precio: 50000,
    imagen: "/placeholder.svg?height=200&width=300&query=paseo+lunar",
  },
  {
    id: 2,
    destinoId: 1,
    nombre: "Observatorio Estelar",
    descripcion: "Observa las estrellas desde el observatorio lunar.",
    duracion: 2,
    precio: 30000,
    imagen: "/placeholder.svg?height=200&width=300&query=observatorio+lunar",
  },
  {
    id: 3,
    destinoId: 2,
    nombre: "Exploración de Valles Marcianos",
    descripcion: "Recorre los impresionantes valles y cañones de Marte.",
    duracion: 6,
    precio: 80000,
    imagen: "/placeholder.svg?height=200&width=300&query=valles+marte",
  },
]

export const mockResenas = [
  {
    id: 1,
    destinoId: 1,
    usuario: {
      id: 101,
      nombre: "Ana García",
      avatar: null,
    },
    puntuacion: 5,
    comentario: "¡Una experiencia increíble! El paisaje lunar es impresionante.",
    fecha: "2023-06-15",
  },
  {
    id: 2,
    destinoId: 1,
    usuario: {
      id: 102,
      nombre: "Carlos Rodríguez",
      avatar: null,
    },
    puntuacion: 4,
    comentario: "Muy buena experiencia en general. La gravedad reducida es toda una aventura.",
    fecha: "2023-05-22",
  },
]

// Exportar todos los mocks juntos
export const mockData = {
  destinos: mockDestinos,
  naves: mockNaves,
  reservas: mockReservas,
  actividades: mockActividades,
  resenas: mockResenas,
}

export default mockData
