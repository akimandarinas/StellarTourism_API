/**
 * Exportación centralizada de utilidades
 * Versión simplificada que elimina duplicaciones
 */

// Utilidades de validación
export * from "./validation"

// Utilidades de formato
export * from "./format"

// Utilidades de ID
export * from "./id"

// Utilidades de manejo de errores
export * from "./error-handling"

// Utilidades de manejo de errores de API
export * from "./api-error-handler"

// Utilidades de enmascaramiento de datos
export * from "./data-masking"

// Utilidades de verificación de contraste
export * from "./contrast-checker"

// Utilidades de foco visible
export * from "./focus-visible"

// Utilidades de compatibilidad
export * from "./compatibility-utils"

// Utilidades de rendimiento
export * from "./performance-optimizations"

// Utilidades comunes
export * from "./common-functions"

// Utilidades asíncronas
export * from "./async-utils"

// Utilidades de seguridad
export * from "./security"

// Utilidades de criptografía
export * from "./crypto"

// Utilidades de patrones de diseño
export * from "./design-patterns"

// Función de utilidad para combinar clases condicionales
export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}
