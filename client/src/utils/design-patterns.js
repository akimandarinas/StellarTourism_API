/**
 * Utilidades para implementar patrones de diseño comunes
 * Este archivo centraliza la implementación de patrones de diseño
 * para promover la consistencia en toda la aplicación
 */

/**
 * Implementación del patrón Singleton
 * @param {Function} constructor - Constructor de la clase
 * @returns {Function} - Función que devuelve la instancia única
 */
export function singleton(constructor) {
  let instance

  return (...args) => {
    if (!instance) {
      instance = new constructor(...args)
    }
    return instance
  }
}

/**
 * Implementación del patrón Factory
 * @param {Object} types - Objeto con los tipos disponibles
 * @returns {Function} - Función factory que crea instancias según el tipo
 */
export function factory(types) {
  return (type, ...args) => {
    if (!types[type]) {
      throw new Error(`Tipo desconocido: ${type}`)
    }
    return new types[type](...args)
  }
}

/**
 * Implementación del patrón Observer
 * @returns {Object} - Objeto con métodos para suscribirse, desuscribirse y notificar
 */
export function createObserver() {
  const observers = new Map()

  return {
    /**
     * Suscribe una función a un evento
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función a ejecutar cuando ocurra el evento
     * @returns {Function} - Función para desuscribirse
     */
    subscribe(event, callback) {
      if (!observers.has(event)) {
        observers.set(event, new Set())
      }

      const callbacks = observers.get(event)
      callbacks.add(callback)

      return () => {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          observers.delete(event)
        }
      }
    },

    /**
     * Desuscribe todas las funciones de un evento
     * @param {string} event - Nombre del evento
     */
    unsubscribeAll(event) {
      observers.delete(event)
    },

    /**
     * Notifica a todos los observadores de un evento
     * @param {string} event - Nombre del evento
     * @param {any} data - Datos a pasar a los observadores
     */
    notify(event, data) {
      if (!observers.has(event)) return

      observers.get(event).forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error en observer de ${event}:`, error)
        }
      })
    },
  }
}

/**
 * Implementación del patrón Strategy
 * @param {Object} strategies - Objeto con las estrategias disponibles
 * @returns {Function} - Función que ejecuta la estrategia seleccionada
 */
export function strategy(strategies) {
  return (name, ...args) => {
    if (!strategies[name]) {
      throw new Error(`Estrategia desconocida: ${name}`)
    }
    return strategies[name](...args)
  }
}

/**
 * Implementación del patrón Decorator
 * @param {Function} component - Componente a decorar
 * @param {Function} decorator - Función decoradora
 * @returns {Function} - Componente decorado
 */
export function decorator(component, decorator) {
  return (...args) => decorator(component, ...args)
}

/**
 * Implementación del patrón Adapter
 * @param {Object} adaptee - Objeto a adaptar
 * @param {Object} targetInterface - Interfaz objetivo
 * @returns {Object} - Objeto adaptado
 */
export function adapter(adaptee, targetInterface) {
  const adapted = {}

  Object.keys(targetInterface).forEach((key) => {
    if (typeof targetInterface[key] === "function") {
      adapted[key] = (...args) => {
        // Implementar la lógica de adaptación específica
        return targetInterface[key](adaptee, ...args)
      }
    } else {
      Object.defineProperty(adapted, key, {
        get: () => targetInterface[key](adaptee),
        enumerable: true,
      })
    }
  })

  return adapted
}

/**
 * Implementación del patrón Command
 * @returns {Object} - Objeto con métodos para ejecutar, deshacer y rehacer comandos
 */
export function createCommandManager() {
  const history = []
  let position = -1

  return {
    /**
     * Ejecuta un comando
     * @param {Object} command - Comando a ejecutar (debe tener métodos execute y undo)
     */
    execute(command) {
      // Eliminar comandos futuros si estamos en medio de la historia
      if (position < history.length - 1) {
        history.splice(position + 1)
      }

      command.execute()
      history.push(command)
      position++

      return true
    },

    /**
     * Deshace el último comando ejecutado
     * @returns {boolean} - true si se pudo deshacer, false si no hay comandos para deshacer
     */
    undo() {
      if (position < 0) return false

      const command = history[position]
      command.undo()
      position--

      return true
    },

    /**
     * Rehace el último comando deshecho
     * @returns {boolean} - true si se pudo rehacer, false si no hay comandos para rehacer
     */
    redo() {
      if (position >= history.length - 1) return false

      position++
      const command = history[position]
      command.execute()

      return true
    },

    /**
     * Verifica si hay comandos para deshacer
     * @returns {boolean} - true si hay comandos para deshacer
     */
    canUndo() {
      return position >= 0
    },

    /**
     * Verifica si hay comandos para rehacer
     * @returns {boolean} - true si hay comandos para rehacer
     */
    canRedo() {
      return position < history.length - 1
    },

    /**
     * Limpia el historial de comandos
     */
    clear() {
      history.length = 0
      position = -1
    },
  }
}
