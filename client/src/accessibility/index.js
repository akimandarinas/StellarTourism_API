// Actualizar el archivo index.js para exportar correctamente los componentes y utilidades

// Exportar componentes
export * from "./components"

// Exportar composables
export * from "./composables"

// Exportar utilidades
export * from "./utils/aria"
export * from "./utils/focus"
export * from "./utils/contrast"
export * from "./utils/motion"
export * from "./utils/preferences"

// Exportar función de registro
export { registerAccessibilityComponents } from "./register"
