// Servicio de destinos con caché
import { fetchDestino, fetchDestinos, fetchDestinosRelacionados } from "./api"

// Caché en memoria
const destinosCache = new Map()
const destinosRelacionadosCache = new Map()
const todosDestinosCache = {
  data: null,
  timestamp: 0,
}

// Tiempo de expiración de la caché (5 minutos)
const CACHE_EXPIRY = 5 * 60 * 1000

// Verificar si la caché ha expirado
const isCacheExpired = (timestamp) => {
  return Date.now() - timestamp > CACHE_EXPIRY
}

// Servicio con caché
export const destinosCachedService = {
  // Obtener un destino por ID
  async getById(id) {
    // Verificar si está en caché y no ha expirado
    if (destinosCache.has(id)) {
      const cached = destinosCache.get(id)
      if (!isCacheExpired(cached.timestamp)) {
        console.log(`[Cache] Usando destino en caché para ID: ${id}`)
        return cached.data
      }
    }

    try {
      // Si no está en caché o ha expirado, obtener de la API
      console.log(`[API] Obteniendo destino para ID: ${id}`)
      const destino = await fetchDestino(id)

      // Guardar en caché
      destinosCache.set(id, {
        data: destino,
        timestamp: Date.now(),
      })

      return destino
    } catch (error) {
      console.error(`Error al obtener destino ${id}:`, error)

      // Si hay un error pero tenemos datos en caché (aunque hayan expirado), usarlos como fallback
      if (destinosCache.has(id)) {
        console.log(`[Cache] Usando destino en caché (expirado) como fallback para ID: ${id}`)
        return destinosCache.get(id).data
      }

      throw error
    }
  },

  // Obtener todos los destinos
  async getAll() {
    // Verificar si está en caché y no ha expirado
    if (todosDestinosCache.data && !isCacheExpired(todosDestinosCache.timestamp)) {
      console.log("[Cache] Usando lista de destinos en caché")
      return todosDestinosCache.data
    }

    try {
      // Si no está en caché o ha expirado, obtener de la API
      console.log("[API] Obteniendo lista de destinos")
      const response = await fetchDestinos()
      const destinos = response.data || []

      // Guardar en caché
      todosDestinosCache.data = destinos
      todosDestinosCache.timestamp = Date.now()

      // También guardar cada destino individualmente en la caché
      destinos.forEach((destino) => {
        destinosCache.set(destino.id.toString(), {
          data: destino,
          timestamp: Date.now(),
        })
      })

      return destinos
    } catch (error) {
      console.error("Error al obtener lista de destinos:", error)

      // Si hay un error pero tenemos datos en caché (aunque hayan expirado), usarlos como fallback
      if (todosDestinosCache.data) {
        console.log("[Cache] Usando lista de destinos en caché (expirada) como fallback")
        return todosDestinosCache.data
      }

      // Si no hay datos en caché, devolver un array vacío
      return []
    }
  },

  // Obtener destinos relacionados
  async getRelacionados(id) {
    // Verificar si está en caché y no ha expirado
    if (destinosRelacionadosCache.has(id)) {
      const cached = destinosRelacionadosCache.get(id)
      if (!isCacheExpired(cached.timestamp)) {
        console.log(`[Cache] Usando destinos relacionados en caché para ID: ${id}`)
        return cached.data
      }
    }

    try {
      // Si no está en caché o ha expirado, obtener de la API
      console.log(`[API] Obteniendo destinos relacionados para ID: ${id}`)
      const relacionados = await fetchDestinosRelacionados(id)

      // Guardar en caché
      destinosRelacionadosCache.set(id, {
        data: relacionados,
        timestamp: Date.now(),
      })

      return relacionados
    } catch (error) {
      console.error(`Error al obtener destinos relacionados para ${id}:`, error)

      // Si hay un error pero tenemos datos en caché (aunque hayan expirado), usarlos como fallback
      if (destinosRelacionadosCache.has(id)) {
        console.log(`[Cache] Usando destinos relacionados en caché (expirados) como fallback para ID: ${id}`)
        return destinosRelacionadosCache.get(id).data
      }

      // Si no hay datos en caché, devolver un array vacío
      return []
    }
  },

  // Limpiar la caché
  clearCache() {
    destinosCache.clear()
    destinosRelacionadosCache.clear()
    todosDestinosCache.data = null
    todosDestinosCache.timestamp = 0
    console.log("[Cache] Caché de destinos limpiada")
  },
}

export default destinosCachedService
