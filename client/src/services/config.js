/**
 * Servicio mejorado de configuración centralizada
 */
import { ref, reactive, readonly, watch } from "vue"
import appConfig from "../config/app-config"

// Estado reactivo para la configuración
const config = reactive({ ...appConfig })
const configUpdated = ref(false)

// Almacenamiento local para persistencia
const STORAGE_KEY = "stellar_app_config"

/**
 * Carga la configuración desde el almacenamiento local
 */
const loadFromStorage = () => {
  try {
    const storedConfig = localStorage.getItem(STORAGE_KEY)
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig)
      Object.assign(config, parsedConfig)
    }
  } catch (error) {
    console.error("Error al cargar configuración:", error)
  }
}

/**
 * Guarda la configuración en el almacenamiento local
 */
const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (error) {
    console.error("Error al guardar configuración:", error)
  }
}

/**
 * Obtiene un valor de configuración
 * @param {string} path - Ruta de la configuración (con notación de punto)
 * @param {any} defaultValue - Valor por defecto si no existe
 * @returns {any} - Valor de configuración
 */
const get = (path, defaultValue) => {
  if (!path) return config

  const keys = path.split(".")
  let current = config

  for (const key of keys) {
    if (current === undefined || current === null) {
      return defaultValue
    }
    current = current[key]
  }

  return current !== undefined ? current : defaultValue
}

/**
 * Establece un valor de configuración
 * @param {string} path - Ruta de la configuración (con notación de punto)
 * @param {any} value - Valor a establecer
 */
const set = (path, value) => {
  if (!path) return

  const keys = path.split(".")
  const lastKey = keys.pop()
  let current = config

  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      current[key] = {}
    }
    current = current[key]
  }

  current[lastKey] = value
  configUpdated.value = true
}

/**
 * Restablece la configuración a los valores por defecto
 * @param {string} path - Ruta opcional para restablecer solo una parte
 */
const reset = (path) => {
  if (!path) {
    // Restablecer toda la configuración
    Object.keys(config).forEach((key) => {
      delete config[key]
    })
    Object.assign(config, appConfig)
  } else {
    // Restablecer solo una parte
    const keys = path.split(".")
    const lastKey = keys.pop()

    let currentConfig = config
    let currentDefault = appConfig

    for (const key of keys) {
      if (currentConfig[key] === undefined) {
        return // La ruta no existe
      }
      currentConfig = currentConfig[key]
      currentDefault = currentDefault?.[key]
    }

    if (currentDefault !== undefined) {
      currentConfig[lastKey] = currentDefault[lastKey]
    } else {
      delete currentConfig[lastKey]
    }
  }

  configUpdated.value = true
}

/**
 * Fusiona nuevos valores en la configuración
 * @param {Object} newConfig - Nuevos valores de configuración
 * @param {boolean} persist - Si se debe persistir en almacenamiento
 */
const merge = (newConfig, persist = true) => {
  const deepMerge = (target, source) => {
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {}
        deepMerge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  }

  deepMerge(config, newConfig)
  configUpdated.value = true

  if (persist) {
    saveToStorage()
  }
}

// Observar cambios en la configuración para guardar automáticamente
watch(configUpdated, (updated) => {
  if (updated) {
    saveToStorage()
    configUpdated.value = false
  }
})

// Cargar configuración al inicializar
loadFromStorage()

// Exportar servicio de configuración
const configService = {
  // Métodos principales
  get,
  set,
  reset,
  merge,

  // Acceso directo a la configuración (solo lectura)
  config: readonly(config),

  // Métodos de conveniencia para secciones comunes
  api: {
    get: (path, defaultValue) => get(`API.${path}`, defaultValue),
    set: (path, value) => set(`API.${path}`, value),
    baseUrl: get("API.BASE_URL"),
  },
  app: {
    get: (path, defaultValue) => get(`APP.${path}`, defaultValue),
    set: (path, value) => set(`APP.${path}`, value),
    name: get("APP.NAME"),
    version: get("APP.VERSION"),
  },
  theme: {
    get: (path, defaultValue) => get(`APP.THEME.${path}`, defaultValue),
    set: (path, value) => set(`APP.THEME.${path}`, value),
    primaryColor: get("APP.THEME.PRIMARY_COLOR"),
  },
  routes: {
    get: (path, defaultValue) => get(`ROUTES.${path}`, defaultValue),
    set: (path, value) => set(`ROUTES.${path}`, value),
  },
}

export default configService
