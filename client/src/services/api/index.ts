// Servicio API para Stellar Tourism
// Este archivo exporta todas las funciones necesarias para interactuar con la API

import axios from "axios"
import { mockDestinos, mockNaves, mockReservas, mockActividades, mockResenas } from "./mock"
import { isBrowser } from "../../utils/client-only"

// Determinar si estamos en modo desarrollo
const isDevelopment = import.meta.env.DEV

// Configuración base para axios
const defaultApiConfig = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
}

// Crear instancia de axios solo en el navegador
let apiService = null

if (isBrowser()) {
  apiService = axios.create(defaultApiConfig)

  // Configurar interceptores y otras opciones específicas del navegador
  console.log("[API Service] Inicializado en el navegador")

  // Interceptor para añadir token de autenticación
  apiService.interceptors.request.use(
    (config) => {
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
} else {
  // Versión simulada para SSR
  console.log("[API Service] Inicializado en modo SSR (simulado)")

  // Crear un objeto simulado para SSR que no cause errores
  apiService = {
    get: () => Promise.resolve({ data: null }),
    post: () => Promise.resolve({ data: null }),
    put: () => Promise.resolve({ data: null }),
    delete: () => Promise.resolve({ data: null }),
    patch: () => Promise.resolve({ data: null }),
    interceptors: {
      request: { use: () => 0, eject: () => {} },
      response: { use: () => 0, eject: () => {} },
    },
  }
}

// Funciones de utilidad para manejar respuestas
const handleResponse = (response) => response.data
const handleError = (error) => {
  console.error("API Error:", error)
  throw error
}

// Simular retraso para mocks
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

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
    // Excluir el destino actual y devolver hasta 3 destinos relacionados
    return mockDestinos.filter((d) => d.id != id).slice(0, 3)
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

// Exportar apiService para que pueda ser usado directamente
export { apiService }

// Exportar por defecto para compatibilidad con importaciones existentes
export default apiService
