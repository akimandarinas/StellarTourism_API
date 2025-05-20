/**
 * Utilidades para manejar código que solo debe ejecutarse en el cliente
 */

/**
 * Verifica si el código se está ejecutando en un navegador
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

/**
 * Ejecuta una función solo si estamos en el navegador
 * @param fn Función a ejecutar
 * @param fallback Valor a devolver si no estamos en el navegador
 */
export function executeOnClient<T>(fn: () => T, fallback: T): T {
  if (isBrowser()) {
    return fn()
  }
  return fallback
}

/**
 * Wrapper para localStorage que funciona tanto en cliente como en servidor
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    return executeOnClient(() => localStorage.getItem(key), null)
  },
  setItem: (key: string, value: string): void => {
    executeOnClient(() => localStorage.setItem(key, value), undefined)
  },
  removeItem: (key: string): void => {
    executeOnClient(() => localStorage.removeItem(key), undefined)
  },
  clear: (): void => {
    executeOnClient(() => localStorage.clear(), undefined)
  },
  key: (index: number): string | null => {
    return executeOnClient(() => localStorage.key(index), null)
  },
  length: (): number => {
    return executeOnClient(() => localStorage.length, 0)
  },
}

/**
 * Wrapper para sessionStorage que funciona tanto en cliente como en servidor
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    return executeOnClient(() => sessionStorage.getItem(key), null)
  },
  setItem: (key: string, value: string): void => {
    executeOnClient(() => sessionStorage.setItem(key, value), undefined)
  },
  removeItem: (key: string): void => {
    executeOnClient(() => sessionStorage.removeItem(key), undefined)
  },
  clear: (): void => {
    executeOnClient(() => sessionStorage.clear(), undefined)
  },
  key: (index: number): string | null => {
    return executeOnClient(() => sessionStorage.key(index), null)
  },
  length: (): number => {
    return executeOnClient(() => sessionStorage.length, 0)
  },
}

/**
 * Wrapper para window que funciona tanto en cliente como en servidor
 */
export const safeWindow = {
  addEventListener: (
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void => {
    executeOnClient(() => window.addEventListener(event, handler, options), undefined)
  },
  removeEventListener: (
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void => {
    executeOnClient(() => window.removeEventListener(event, handler, options), undefined)
  },
  setTimeout: (handler: TimerHandler, timeout?: number): number => {
    return executeOnClient(() => window.setTimeout(handler, timeout), 0)
  },
  clearTimeout: (id: number): void => {
    executeOnClient(() => window.clearTimeout(id), undefined)
  },
  setInterval: (handler: TimerHandler, timeout?: number): number => {
    return executeOnClient(() => window.setInterval(handler, timeout), 0)
  },
  clearInterval: (id: number): void => {
    executeOnClient(() => window.clearInterval(id), undefined)
  },
  dispatchEvent: (event: Event): boolean => {
    return executeOnClient(() => window.dispatchEvent(event), false)
  },
  location: {
    href: executeOnClient(() => window.location.href, ""),
    pathname: executeOnClient(() => window.location.pathname, ""),
    search: executeOnClient(() => window.location.search, ""),
    hash: executeOnClient(() => window.location.hash, ""),
  },
  navigator: {
    userAgent: executeOnClient(() => window.navigator.userAgent, ""),
    language: executeOnClient(() => window.navigator.language, ""),
    platform: executeOnClient(() => window.navigator.platform, ""),
  },
}

/**
 * Wrapper para document que funciona tanto en cliente como en servidor
 */
export const safeDocument = {
  addEventListener: (
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void => {
    executeOnClient(() => document.addEventListener(event, handler, options), undefined)
  },
  removeEventListener: (
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void => {
    executeOnClient(() => document.removeEventListener(event, handler, options), undefined)
  },
  createElement: (tagName: string): HTMLElement => {
    return executeOnClient(() => document.createElement(tagName), {} as HTMLElement)
  },
  getElementById: (id: string): HTMLElement | null => {
    return executeOnClient(() => document.getElementById(id), null)
  },
  querySelector: (selector: string): Element | null => {
    return executeOnClient(() => document.querySelector(selector), null)
  },
  querySelectorAll: (selector: string): NodeListOf<Element> => {
    return executeOnClient(() => document.querySelectorAll(selector), [] as unknown as NodeListOf<Element>)
  },
  body: {
    appendChild: (child: Node): Node => {
      return executeOnClient(() => document.body.appendChild(child), child)
    },
    removeChild: (child: Node): Node => {
      return executeOnClient(() => document.body.removeChild(child), child)
    },
    contains: (child: Node): boolean => {
      return executeOnClient(() => document.body.contains(child), false)
    },
  },
  visibilityState: executeOnClient(() => document.visibilityState, "hidden"),
}

/**
 * Componente de alto orden que solo renderiza su contenido en el cliente
 * @param Component Componente a renderizar solo en el cliente
 */
export function withClientOnly(Component) {
  return function ClientOnlyComponent(props) {
    if (!isBrowser()) {
      return null
    }
    return Component(props)
  }
}
