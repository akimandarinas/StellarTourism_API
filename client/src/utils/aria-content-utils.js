/**
 * Utilidades para mejorar la accesibilidad de contenido interactivo
 */

/**
 * Genera atributos para imágenes accesibles
 * @param {string} alt - Texto alternativo para la imagen
 * @param {boolean} decorative - Indica si la imagen es decorativa
 * @returns {Object} - Objeto con atributos para la imagen
 */
export function getImageAttributes(alt, decorative = false) {
  if (decorative) {
    return {
      alt: "",
      role: "presentation",
      "aria-hidden": "true",
    }
  }

  return {
    alt: alt || "Imagen",
    role: alt ? undefined : "img",
  }
}

/**
 * Genera atributos para contenido interactivo accesible
 * @param {string} label - Etiqueta descriptiva para el elemento
 * @param {boolean} disabled - Indica si el elemento está deshabilitado
 * @returns {Object} - Objeto con atributos para el elemento interactivo
 */
export function getInteractiveContentAttributes(label, disabled = false) {
  const attributes = {
    "aria-label": label,
    role: "button",
    tabindex: disabled ? "-1" : "0",
  }

  if (disabled) {
    attributes["aria-disabled"] = "true"
  }

  return attributes
}

/**
 * Genera atributos para elementos de formulario accesibles
 * @param {string} id - ID del elemento
 * @param {string} label - Etiqueta descriptiva
 * @param {boolean} required - Indica si el campo es requerido
 * @param {boolean} invalid - Indica si el campo tiene un valor inválido
 * @param {string} errorMessage - Mensaje de error si el campo es inválido
 * @returns {Object} - Objeto con atributos para el elemento de formulario
 */
export function getFormFieldAttributes(id, label, required = false, invalid = false, errorMessage = "") {
  const attributes = {
    id,
    "aria-label": label,
    "aria-required": required ? "true" : "false",
  }

  if (invalid) {
    attributes["aria-invalid"] = "true"
    if (errorMessage) {
      attributes["aria-errormessage"] = `${id}-error`
    }
  }

  return attributes
}

/**
 * Genera atributos para elementos que muestran estado o progreso
 * @param {string} label - Etiqueta descriptiva
 * @param {number} value - Valor actual
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {Object} - Objeto con atributos para el elemento de estado
 */
export function getStatusAttributes(label, value, min = 0, max = 100) {
  return {
    role: "status",
    "aria-label": label,
    "aria-valuenow": value,
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-live": "polite",
  }
}

/**
 * Genera atributos para elementos que muestran alertas o notificaciones
 * @param {string} message - Mensaje de la alerta
 * @param {string} type - Tipo de alerta (info, warning, error, success)
 * @returns {Object} - Objeto con atributos para el elemento de alerta
 */
export function getAlertAttributes(message, type = "info") {
  return {
    role: "alert",
    "aria-live": type === "error" ? "assertive" : "polite",
    "data-alert-type": type,
  }
}
