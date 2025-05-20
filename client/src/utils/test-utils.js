/**
 * Utilidades para pruebas unitarias
 * Este archivo proporciona funciones para facilitar la escritura
 * de pruebas unitarias consistentes en toda la aplicación
 */

import { h } from "vue"
import { jest } from "@jest/globals"

/**
 * Crea un mock de un componente Vue
 * @param {Object} options - Opciones del mock
 * @returns {Object} - Mock del componente
 */
export function mockComponent(options = {}) {
  const { name = "MockComponent", props = {}, slots = {}, emits = [], methods = {}, setup = null } = options

  return {
    name,
    props,
    emits,
    setup: setup || (() => methods),
    render() {
      return h("div", { class: `mock-${name.toLowerCase()}` }, [
        Object.entries(slots).map(([slotName, slot]) => {
          return h("div", { class: `mock-slot-${slotName}` }, slot)
        }),
      ])
    },
  }
}

/**
 * Crea un mock de un store Pinia
 * @param {Object} options - Opciones del mock
 * @returns {Object} - Mock del store
 */
export function mockPiniaStore(options = {}) {
  const { name = "mockStore", state = {}, getters = {}, actions = {} } = options

  const store = {
    $id: name,
    $state: { ...state },
    $reset: jest.fn(),
    $patch: jest.fn(),
    $subscribe: jest.fn(),
    $dispose: jest.fn(),
  }

  // Añadir getters
  Object.entries(getters).forEach(([key, value]) => {
    Object.defineProperty(store, key, {
      get: typeof value === "function" ? value : () => value,
      enumerable: true,
    })
  })

  // Añadir acciones
  Object.entries(actions).forEach(([key, value]) => {
    store[key] = typeof value === "function" ? value : jest.fn().mockReturnValue(value)
  })

  // Añadir estado
  Object.entries(state).forEach(([key, value]) => {
    if (!(key in getters) && !(key in actions)) {
      store[key] = value
    }
  })

  return store
}

/**
 * Crea un mock de un router Vue
 * @param {Object} options - Opciones del mock
 * @returns {Object} - Mock del router
 */
export function mockRouter(options = {}) {
  const { routes = [], currentRoute = { path: "/", name: "Home", params: {}, query: {} } } = options

  return {
    routes,
    currentRoute: {
      value: { ...currentRoute },
    },
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    beforeEach: jest.fn(),
    afterEach: jest.fn(),
    resolve: jest.fn().mockImplementation((to) => {
      const route = routes.find((r) => r.path === to || r.name === to)
      return route ? { route } : { route: null }
    }),
    addRoute: jest.fn(),
    removeRoute: jest.fn(),
    hasRoute: jest.fn().mockImplementation((name) => {
      return routes.some((r) => r.name === name)
    }),
    getRoutes: jest.fn().mockReturnValue(routes),
  }
}

/**
 * Crea un mock de una respuesta de API
 * @param {Object} options - Opciones del mock
 * @returns {Object} - Mock de la respuesta
 */
export function mockApiResponse(options = {}) {
  const {
    success = true,
    data = null,
    error = null,
    status = success ? 200 : 400,
    headers = { "Content-Type": "application/json" },
  } = options

  return {
    success,
    data,
    error,
    status,
    headers,
  }
}

/**
 * Crea un mock de un servicio de API
 * @param {Object} methods - Métodos a mockear
 * @returns {Object} - Mock del servicio
 */
export function mockApiService(methods = {}) {
  const defaultMethods = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }

  return {
    ...defaultMethods,
    ...methods,
  }
}

/**
 * Crea un mock de localStorage
 * @returns {Object} - Mock de localStorage
 */
export function mockLocalStorage() {
  const store = {}

  return {
    getItem: jest.fn().mockImplementation((key) => store[key] || null),
    setItem: jest.fn().mockImplementation((key, value) => {
      store[key] = String(value)
    }),
    removeItem: jest.fn().mockImplementation((key) => {
      delete store[key]
    }),
    clear: jest.fn().mockImplementation(() => {
      Object.keys(store).forEach((key) => {
        delete store[key]
      })
    }),
    key: jest.fn().mockImplementation((index) => {
      return Object.keys(store)[index] || null
    }),
    get length() {
      return Object.keys(store).length
    },
  }
}

/**
 * Crea un mock de sessionStorage
 * @returns {Object} - Mock de sessionStorage
 */
export function mockSessionStorage() {
  return mockLocalStorage()
}

/**
 * Crea un mock de fetch
 * @param {Object|Function} response - Respuesta o función que devuelve la respuesta
 * @returns {Function} - Mock de fetch
 */
export function mockFetch(response) {
  return jest.fn().mockImplementation((...args) => {
    const mockResponse = typeof response === "function" ? response(...args) : response

    return Promise.resolve({
      ok: mockResponse.status >= 200 && mockResponse.status < 300,
      status: mockResponse.status,
      statusText: mockResponse.statusText || "",
      headers: new Headers(mockResponse.headers || {}),
      json: () => Promise.resolve(mockResponse.data),
      text: () => Promise.resolve(JSON.stringify(mockResponse.data)),
      blob: () => Promise.resolve(new Blob([JSON.stringify(mockResponse.data)])),
      formData: () => {
        const formData = new FormData()
        Object.entries(mockResponse.data || {}).forEach(([key, value]) => {
          formData.append(key, value)
        })
        return Promise.resolve(formData)
      },
    })
  })
}

/**
 * Espera a que se completen todas las promesas pendientes
 * @returns {Promise} - Promesa que se resuelve cuando se completan todas las promesas
 */
export function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Crea un evento del DOM
 * @param {string} type - Tipo de evento
 * @param {Object} options - Opciones del evento
 * @returns {Event} - Evento del DOM
 */
export function createDOMEvent(type, options = {}) {
  const event = document.createEvent("Event")
  event.initEvent(type, true, true)

  Object.entries(options).forEach(([key, value]) => {
    event[key] = value
  })

  return event
}
