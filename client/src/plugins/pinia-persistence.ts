import type { PiniaPluginContext } from "pinia"

/**
 * Plugin de Pinia para persistir el estado en localStorage
 * @param options Opciones de configuración
 */
export function createPiniaPersistencePlugin(
  options = {
    key: "pinia",
    storage: localStorage,
    paths: [],
  },
) {
  return ({ store }: PiniaPluginContext) => {
    // Cargar estado guardado cuando se crea el store
    const storageKey = `${options.key}-${store.$id}`

    try {
      const fromStorage = options.storage.getItem(storageKey)

      if (fromStorage) {
        const savedState = JSON.parse(fromStorage)

        // Si hay paths específicos, solo restaurar esos
        if (options.paths && options.paths.length > 0) {
          options.paths.forEach((path) => {
            if (savedState[path] !== undefined) {
              store.$patch({ [path]: savedState[path] })
            }
          })
        } else {
          // Restaurar todo el estado
          store.$patch(savedState)
        }
      }
    } catch (error) {
      console.error("Error al cargar el estado persistente:", error)
      // Eliminar el estado corrupto
      options.storage.removeItem(storageKey)
    }

    // Suscribirse a cambios para guardar el estado
    store.$subscribe((mutation, state) => {
      try {
        const stateToPersist =
          options.paths && options.paths.length > 0
            ? options.paths.reduce((obj, path) => {
                obj[path] = state[path]
                return obj
              }, {})
            : state

        options.storage.setItem(storageKey, JSON.stringify(stateToPersist))
      } catch (error) {
        console.error("Error al persistir el estado:", error)
      }
    })

    // Añadir método para limpiar el estado persistente
    return {
      clearPersistedState() {
        options.storage.removeItem(storageKey)
      },
    }
  }
}
