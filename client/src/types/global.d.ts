// Declaraciones globales para TypeScript

// Extender Window para estado inicial de SSR
interface Window {
  __INITIAL_STATE__?: Record<string, any>
}

// Extender HTMLElement para directivas personalizadas
interface HTMLElement {
  _clickOutsideHandler?: (event: MouseEvent) => void
  _focusTrapHandler?: (event: KeyboardEvent) => void
  _lazyLoadObserver?: IntersectionObserver
}

// Extender Performance para métricas de rendimiento
interface Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}
