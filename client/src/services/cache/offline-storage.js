/**
 * Servicio de almacenamiento offline para la aplicación
 * Permite guardar y recuperar datos cuando no hay conexión a internet
 */

// Configuración
const CONFIG = {
  PREFIX: "stellar_tourism_",
  VERSION: 1,
  DEFAULT_TTL: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
  STORAGE_TYPE: {
    LOCAL: "localStorage",
    SESSION: "sessionStorage",
    INDEXED_DB: "indexedDB",
  },
}

// Estado interno
const state = {
  isInitialized: false,
  db: null,
  isIndexedDBSupported: typeof indexedDB !== "undefined",
  isLocalStorageSupported: typeof localStorage !== "undefined",
  isSessionStorageSupported: typeof sessionStorage !== "undefined",
}

/**
 * Inicializa el almacenamiento offline
 */
export async function initOfflineStorage() {
  if (state.isInitialized) return

  // Verificar soporte para IndexedDB
  if (state.isIndexedDBSupported) {
    try {
      await initIndexedDB()
      console.log("IndexedDB inicializado correctamente")
    } catch (error) {
      console.error("Error al inicializar IndexedDB:", error)
      console.log("Usando localStorage como fallback")
    }
  } else {
    console.log("IndexedDB no soportado, usando localStorage")
  }

  state.isInitialized = true

  // Limpiar datos expirados
  await cleanExpiredData()

  return state.isInitialized
}

/**
 * Inicializa IndexedDB
 */
async function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`${CONFIG.PREFIX}offline_db`, CONFIG.VERSION)

    request.onerror = (event) => {
      reject(new Error("Error al abrir IndexedDB"))
    }

    request.onsuccess = (event) => {
      state.db = event.target.result
      resolve(state.db)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Crear almacenes de objetos
      if (!db.objectStoreNames.contains("cache")) {
        const store = db.createObjectStore("cache", { keyPath: "key" })
        store.createIndex("expires", "expires", { unique: false })
      }

      if (!db.objectStoreNames.contains("offline_operations")) {
        db.createObjectStore("offline_operations", { keyPath: "id", autoIncrement: true })
      }
    }
  })
}

/**
 * Guarda datos en el almacenamiento offline
 * @param {string} key - Clave para identificar los datos
 * @param {any} data - Datos a guardar
 * @param {Object} options - Opciones adicionales
 * @param {number} options.ttl - Tiempo de vida en milisegundos
 * @param {string} options.storageType - Tipo de almacenamiento a usar
 * @returns {Promise<boolean>} - true si se guardó correctamente
 */
export async function saveToOfflineStorage(key, data, options = {}) {
  if (!key) {
    throw new Error("La clave es requerida")
  }

  // Asegurar que el almacenamiento está inicializado
  if (!state.isInitialized) {
    await initOfflineStorage()
  }

  const { ttl = CONFIG.DEFAULT_TTL, storageType = CONFIG.STORAGE_TYPE.LOCAL } = options

  // Calcular tiempo de expiración
  const expires = Date.now() + ttl

  // Preparar datos para almacenamiento
  const storageData = {
    key: `${CONFIG.PREFIX}${key}`,
    data,
    expires,
    timestamp: Date.now(),
  }

  // Guardar según el tipo de almacenamiento
  try {
    if (storageType === CONFIG.STORAGE_TYPE.INDEXED_DB && state.db) {
      return await saveToIndexedDB(storageData)
    } else if (storageType === CONFIG.STORAGE_TYPE.SESSION && state.isSessionStorageSupported) {
      return saveToSessionStorage(storageData)
    } else if (state.isLocalStorageSupported) {
      return saveToLocalStorage(storageData)
    } else {
      throw new Error("No hay métodos de almacenamiento disponibles")
    }
  } catch (error) {
    console.error("Error al guardar datos offline:", error)

    // Intentar con método alternativo
    if (storageType !== CONFIG.STORAGE_TYPE.LOCAL && state.isLocalStorageSupported) {
      console.log("Intentando guardar en localStorage como fallback")
      return saveToLocalStorage(storageData)
    }

    throw error
  }
}

/**
 * Guarda datos en IndexedDB
 */
async function saveToIndexedDB(storageData) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(["cache"], "readwrite")
    const store = transaction.objectStore("cache")

    const request = store.put(storageData)

    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(new Error("Error al guardar en IndexedDB"))
  })
}

/**
 * Guarda datos en localStorage
 */
function saveToLocalStorage(storageData) {
  try {
    localStorage.setItem(
      storageData.key,
      JSON.stringify({
        data: storageData.data,
        expires: storageData.expires,
        timestamp: storageData.timestamp,
      }),
    )
    return true
  } catch (error) {
    console.error("Error al guardar en localStorage:", error)

    // Si es error de cuota, intentar limpiar datos antiguos
    if (error.name === "QuotaExceededError" || error.code === 22) {
      cleanOldestData(CONFIG.STORAGE_TYPE.LOCAL)

      // Reintentar
      try {
        localStorage.setItem(
          storageData.key,
          JSON.stringify({
            data: storageData.data,
            expires: storageData.expires,
            timestamp: storageData.timestamp,
          }),
        )
        return true
      } catch (retryError) {
        throw retryError
      }
    }

    throw error
  }
}

/**
 * Guarda datos en sessionStorage
 */
function saveToSessionStorage(storageData) {
  try {
    sessionStorage.setItem(
      storageData.key,
      JSON.stringify({
        data: storageData.data,
        expires: storageData.expires,
        timestamp: storageData.timestamp,
      }),
    )
    return true
  } catch (error) {
    console.error("Error al guardar en sessionStorage:", error)
    throw error
  }
}

/**
 * Obtiene datos del almacenamiento offline
 * @param {string} key - Clave para identificar los datos
 * @param {Object} options - Opciones adicionales
 * @param {string} options.storageType - Tipo de almacenamiento a usar
 * @returns {Promise<any>} - Datos almacenados o null si no existen o han expirado
 */
export async function getOfflineStorage(key, options = {}) {
  if (!key) {
    throw new Error("La clave es requerida")
  }

  // Asegurar que el almacenamiento está inicializado
  if (!state.isInitialized) {
    await initOfflineStorage()
  }

  const { storageType = CONFIG.STORAGE_TYPE.LOCAL } = options

  const fullKey = `${CONFIG.PREFIX}${key}`

  // Obtener según el tipo de almacenamiento
  try {
    let result = null

    if (storageType === CONFIG.STORAGE_TYPE.INDEXED_DB && state.db) {
      result = await getFromIndexedDB(fullKey)
    } else if (storageType === CONFIG.STORAGE_TYPE.SESSION && state.isSessionStorageSupported) {
      result = getFromSessionStorage(fullKey)
    } else if (state.isLocalStorageSupported) {
      result = getFromLocalStorage(fullKey)
    } else {
      throw new Error("No hay métodos de almacenamiento disponibles")
    }

    // Verificar si los datos han expirado
    if (result && result.expires < Date.now()) {
      // Eliminar datos expirados
      await removeFromOfflineStorage(fullKey, { storageType })
      return null
    }

    return result ? result.data : null
  } catch (error) {
    console.error("Error al obtener datos offline:", error)

    // Intentar con método alternativo
    if (storageType !== CONFIG.STORAGE_TYPE.LOCAL && state.isLocalStorageSupported) {
      console.log("Intentando obtener de localStorage como fallback")
      const result = getFromLocalStorage(fullKey)

      if (result && result.expires < Date.now()) {
        await removeFromOfflineStorage(fullKey, { storageType: CONFIG.STORAGE_TYPE.LOCAL })
        return null
      }

      return result ? result.data : null
    }

    return null
  }
}

/**
 * Obtiene datos de IndexedDB
 */
async function getFromIndexedDB(key) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(["cache"], "readonly")
    const store = transaction.objectStore("cache")

    const request = store.get(key)

    request.onsuccess = (event) => {
      const result = event.target.result
      resolve(result)
    }

    request.onerror = () => reject(new Error("Error al obtener de IndexedDB"))
  })
}

/**
 * Obtiene datos de localStorage
 */
function getFromLocalStorage(key) {
  const item = localStorage.getItem(key)

  if (!item) return null

  try {
    return JSON.parse(item)
  } catch (error) {
    console.error("Error al parsear datos de localStorage:", error)
    return null
  }
}

/**
 * Obtiene datos de sessionStorage
 */
function getFromSessionStorage(key) {
  const item = sessionStorage.getItem(key)

  if (!item) return null

  try {
    return JSON.parse(item)
  } catch (error) {
    console.error("Error al parsear datos de sessionStorage:", error)
    return null
  }
}

/**
 * Elimina datos del almacenamiento offline
 * @param {string} key - Clave para identificar los datos
 * @param {Object} options - Opciones adicionales
 * @param {string} options.storageType - Tipo de almacenamiento a usar
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export async function removeFromOfflineStorage(key, options = {}) {
  if (!key) {
    throw new Error("La clave es requerida")
  }

  // Asegurar que el almacenamiento está inicializado
  if (!state.isInitialized) {
    await initOfflineStorage()
  }

  const { storageType = CONFIG.STORAGE_TYPE.LOCAL } = options

  const fullKey = `${CONFIG.PREFIX}${key}`

  // Eliminar según el tipo de almacenamiento
  try {
    if (storageType === CONFIG.STORAGE_TYPE.INDEXED_DB && state.db) {
      return await removeFromIndexedDB(fullKey)
    } else if (storageType === CONFIG.STORAGE_TYPE.SESSION && state.isSessionStorageSupported) {
      return removeFromSessionStorage(fullKey)
    } else if (state.isLocalStorageSupported) {
      return removeFromLocalStorage(fullKey)
    } else {
      throw new Error("No hay métodos de almacenamiento disponibles")
    }
  } catch (error) {
    console.error("Error al eliminar datos offline:", error)
    return false
  }
}

/**
 * Elimina datos de IndexedDB
 */
async function removeFromIndexedDB(key) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(["cache"], "readwrite")
    const store = transaction.objectStore("cache")

    const request = store.delete(key)

    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(new Error("Error al eliminar de IndexedDB"))
  })
}

/**
 * Elimina datos de localStorage
 */
function removeFromLocalStorage(key) {
  localStorage.removeItem(key)
  return true
}

/**
 * Elimina datos de sessionStorage
 */
function removeFromSessionStorage(key) {
  sessionStorage.removeItem(key)
  return true
}

/**
 * Limpia datos expirados del almacenamiento
 */
export async function cleanExpiredData() {
  const now = Date.now()

  // Limpiar IndexedDB
  if (state.db) {
    try {
      await cleanExpiredFromIndexedDB(now)
    } catch (error) {
      console.error("Error al limpiar datos expirados de IndexedDB:", error)
    }
  }

  // Limpiar localStorage
  if (state.isLocalStorageSupported) {
    try {
      cleanExpiredFromLocalStorage(now)
    } catch (error) {
      console.error("Error al limpiar datos expirados de localStorage:", error)
    }
  }

  // Limpiar sessionStorage
  if (state.isSessionStorageSupported) {
    try {
      cleanExpiredFromSessionStorage(now)
    } catch (error) {
      console.error("Error al limpiar datos expirados de sessionStorage:", error)
    }
  }
}

/**
 * Limpia datos expirados de IndexedDB
 */
async function cleanExpiredFromIndexedDB(now) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(["cache"], "readwrite")
    const store = transaction.objectStore("cache")
    const index = store.index("expires")

    const range = IDBKeyRange.upperBound(now)
    const request = index.openCursor(range)

    request.onsuccess = (event) => {
      const cursor = event.target.result

      if (cursor) {
        store.delete(cursor.primaryKey)
        cursor.continue()
      } else {
        resolve(true)
      }
    }

    request.onerror = () => reject(new Error("Error al limpiar datos expirados de IndexedDB"))
  })
}

/**
 * Limpia datos expirados de localStorage
 */
function cleanExpiredFromLocalStorage(now) {
  const keysToRemove = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    if (key.startsWith(CONFIG.PREFIX)) {
      try {
        const item = JSON.parse(localStorage.getItem(key))

        if (item && item.expires && item.expires < now) {
          keysToRemove.push(key)
        }
      } catch (error) {
        // Ignorar errores de parseo
      }
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key))
}

/**
 * Limpia datos expirados de sessionStorage
 */
function cleanExpiredFromSessionStorage(now) {
  const keysToRemove = []

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)

    if (key.startsWith(CONFIG.PREFIX)) {
      try {
        const item = JSON.parse(sessionStorage.getItem(key))

        if (item && item.expires && item.expires < now) {
          keysToRemove.push(key)
        }
      } catch (error) {
        // Ignorar errores de parseo
      }
    }
  }

  keysToRemove.forEach((key) => sessionStorage.removeItem(key))
}

/**
 * Limpia los datos más antiguos cuando se alcanza la cuota de almacenamiento
 */
function cleanOldestData(storageType) {
  if (storageType === CONFIG.STORAGE_TYPE.INDEXED_DB && state.db) {
    cleanOldestFromIndexedDB()
  } else if (storageType === CONFIG.STORAGE_TYPE.SESSION && state.isSessionStorageSupported) {
    cleanOldestFromSessionStorage()
  } else if (state.isLocalStorageSupported) {
    cleanOldestFromLocalStorage()
  }
}

/**
 * Limpia los datos más antiguos de IndexedDB
 */
function cleanOldestFromIndexedDB() {
  const transaction = state.db.transaction(["cache"], "readwrite")
  const store = transaction.objectStore("cache")

  // Obtener todos los registros
  const request = store.getAll()

  request.onsuccess = (event) => {
    const items = event.target.result

    // Ordenar por timestamp (más antiguos primero)
    items.sort((a, b) => a.timestamp - b.timestamp)

    // Eliminar el 20% más antiguo
    const itemsToDelete = Math.ceil(items.length * 0.2)

    for (let i = 0; i < itemsToDelete; i++) {
      if (items[i]) {
        store.delete(items[i].key)
      }
    }
  }

  request.onerror = () => console.error("Error al limpiar datos antiguos de IndexedDB")
}

/**
 * Limpia los datos más antiguos de localStorage
 */
function cleanOldestFromLocalStorage() {
  const items = []

  // Recopilar todos los items con su timestamp
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    if (key.startsWith(CONFIG.PREFIX)) {
      try {
        const item = JSON.parse(localStorage.getItem(key))

        if (item && item.timestamp) {
          items.push({
            key,
            timestamp: item.timestamp,
          })
        }
      } catch (error) {
        // Ignorar errores de parseo
      }
    }
  }

  // Ordenar por timestamp (más antiguos primero)
  items.sort((a, b) => a.timestamp - b.timestamp)

  // Eliminar el 20% más antiguo
  const itemsToDelete = Math.ceil(items.length * 0.2)

  for (let i = 0; i < itemsToDelete; i++) {
    if (items[i]) {
      localStorage.removeItem(items[i].key)
    }
  }
}

/**
 * Limpia los datos más antiguos de sessionStorage
 */
function cleanOldestFromSessionStorage() {
  const items = []

  // Recopilar todos los items con su timestamp
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)

    if (key.startsWith(CONFIG.PREFIX)) {
      try {
        const item = JSON.parse(sessionStorage.getItem(key))

        if (item && item.timestamp) {
          items.push({
            key,
            timestamp: item.timestamp,
          })
        }
      } catch (error) {
        // Ignorar errores de parseo
      }
    }
  }

  // Ordenar por timestamp (más antiguos primero)
  items.sort((a, b) => a.timestamp - b.timestamp)

  // Eliminar el 20% más antiguo
  const itemsToDelete = Math.ceil(items.length * 0.2)

  for (let i = 0; i < itemsToDelete; i++) {
    if (items[i]) {
      sessionStorage.removeItem(items[i].key)
    }
  }
}

/**
 * Registra una operación para ser ejecutada cuando se recupere la conexión
 * @param {string} type - Tipo de operación
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos de la operación
 * @returns {Promise<string>} - ID de la operación registrada
 */
export async function registerOfflineOperation(type, endpoint, data) {
  // Asegurar que el almacenamiento está inicializado
  if (!state.isInitialized) {
    await initOfflineStorage()
  }

  const operation = {
    type,
    endpoint,
    data,
    timestamp: Date.now(),
    attempts: 0,
  }

  // Guardar en IndexedDB si está disponible
  if (state.db) {
    return await saveOfflineOperationToIndexedDB(operation)
  } else {
    // Fallback a localStorage
    return saveOfflineOperationToLocalStorage(operation)
  }
}

/**
 * Guarda una operación offline en IndexedDB
 */
async function saveOfflineOperationToIndexedDB(operation) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(["offline_operations"], "readwrite")
    const store = transaction.objectStore("offline_operations")

    const request = store.add(operation)

    request.onsuccess = (event) => {
      resolve(event.target.result.toString())
    }

    request.onerror = () => reject(new Error("Error al guardar operación offline en IndexedDB"))
  })
}

/**
 * Guarda una operación offline en localStorage
 */
function saveOfflineOperationToLocalStorage(operation) {
  const operationId = Date.now().toString() + Math.random().toString(36).substring(2, 9)
  operation.id = operationId

  // Obtener operaciones existentes
  const operationsKey = `${CONFIG.PREFIX}offline_operations`
  let operations = []

  try {
    const storedOperations = localStorage.getItem(operationsKey)
    if (storedOperations) {
      operations = JSON.parse(storedOperations)
    }
  } catch (error) {
    console.error("Error al obtener operaciones offline:", error)
  }

  // Añadir nueva operación
  operations.push(operation)

  // Guardar operaciones
  localStorage.setItem(operationsKey, JSON.stringify(operations))

  return operationId
}

/**
 * Obtiene todas las operaciones offline pendientes
 * @returns {Promise<Array>} - Lista de operaciones pendientes
 */
export async function getPendingOfflineOperations() {
  // Asegurar que el almacenamiento está inicializado
  if (!state.isInitialized) {
    await initOfflineStorage()
  }

  // Obtener de IndexedDB si está disponible
  if (state.db) {
    return await getOfflineOperationsFromIndexedDB()
  } else {
    // Fallback a localStorage
    return getOfflineOperationsFromLocalStorage()
  }
}

/**
 * Obtiene operaciones offline de IndexedDB
 */
async function getOfflineOperationsFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(["offline_operations"], "readonly")
    const store = transaction.objectStore("offline_operations")

    const request = store.getAll()

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onerror = () => reject(new Error("Error al obtener operaciones offline de IndexedDB"))
  })
}

/**
 * Obtiene operaciones offline de localStorage
 */
function getOfflineOperationsFromLocalStorage() {
  const operationsKey = `${CONFIG.PREFIX}offline_operations`

  try {
    const storedOperations = localStorage.getItem(operationsKey)
    if (storedOperations) {
      return JSON.parse(storedOperations)
    }
  } catch (error) {
    console.error("Error al obtener operaciones offline:", error)
  }

  return []
}

/**
 * Elimina una operación offline
 * @param {string} id - ID de la operación
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export async function removeFromOfflineOperations(id) {
  if (!id) {
    throw new Error("El ID de la operación es requerido")
  }

  // Asegurar que el almacenamiento está inicializado
  if (!state.isInitialized) {
    await initOfflineStorage()
  }

  // Eliminar según el tipo de almacenamiento
  try {
    if (state.db) {
      return await removeFromIndexedDBOperations(id)
    } else if (state.isLocalStorageSupported) {
      return removeFromLocalStorageOperations(id)
    } else {
      throw new Error("No hay métodos de almacenamiento disponibles")
    }
  } catch (error) {
    console.error("Error al eliminar operación offline:", error)
    return false
  }
}

/**
 * Elimina una operación offline de IndexedDB
 */
async function removeFromIndexedDBOperations(id) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(["offline_operations"], "readwrite")
    const store = transaction.objectStore("offline_operations")

    const request = store.delete(id)

    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(new Error("Error al eliminar operación offline de IndexedDB"))
  })
}

/**
 * Elimina una operación offline de localStorage
 */
function removeFromLocalStorageOperations(id) {
  const operationsKey = `${CONFIG.PREFIX}offline_operations`

  try {
    const storedOperations = localStorage.getItem(operationsKey)
    if (storedOperations) {
      const operations = JSON.parse(storedOperations)
      const updatedOperations = operations.filter((op) => op.id !== id)
      localStorage.setItem(operationsKey, JSON.stringify(updatedOperations))
      return true
    }
  } catch (error) {
    console.error("Error al eliminar operación offline de localStorage:", error)
  }

  return false
}
