/**
 * Re-exportación del servicio de destinos para mantener compatibilidad
 */
import { destinosService } from "../destinos"

// Adaptador para mantener la compatibilidad con la API anterior
const destinosServiceAdapter = {
  getDestinos: (options = {}) => destinosService().getAll(options),
  getDestino: (id) => destinosService().getById(id),
  createDestino: (data) => destinosService().createDestino(data),
  updateDestino: (id, data) => destinosService().updateDestino(id, data),
  deleteDestino: (id) => destinosService().invalidateDestino(id),
  listenToDestino: (id, callback) => {
    // Implementación básica de compatibilidad
    let lastData = null
    const checkForChanges = async () => {
      try {
        const data = await destinosService().getById(id)
        if (JSON.stringify(data) !== JSON.stringify(lastData)) {
          lastData = data
          callback(data)
        }
      } catch (error) {
        console.error(`Error en listenToDestino: ${error}`)
      }
    }

    // Verificar cambios cada 30 segundos
    const intervalId = setInterval(checkForChanges, 30000)
    checkForChanges() // Verificar inmediatamente

    // Devolver función para cancelar la suscripción
    return () => clearInterval(intervalId)
  },
  listenToDestinos: (options = {}, callback) => {
    // Implementación básica de compatibilidad
    let lastData = null
    const checkForChanges = async () => {
      try {
        const data = await destinosService().getAll(options)
        if (JSON.stringify(data) !== JSON.stringify(lastData)) {
          lastData = data
          callback(data)
        }
      } catch (error) {
        console.error(`Error en listenToDestinos: ${error}`)
      }
    }

    // Verificar cambios cada 30 segundos
    const intervalId = setInterval(checkForChanges, 30000)
    checkForChanges() // Verificar inmediatamente

    // Devolver función para cancelar la suscripción
    return () => clearInterval(intervalId)
  },
}

export default destinosServiceAdapter
