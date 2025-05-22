/* Utilidades para trabajar con atributos ARIA */

//Genera un ID único para elementos accesibles
export function generateId(prefix = "a11y") {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`
}

export function getMenuProps(options = {}) {
  const { label, orientation = "vertical", role = "menu" } = options

  const props = {
    role: role,
    "aria-orientation": orientation,
  }

  if (label) {
    props["aria-label"] = label
  }

  return props
}

export function getListProps(options = {}) {
  const { label, role = null, busy = false, multiselectable = false } = options

  const props = {}

  if (role) {
    props.role = role
  }

  if (label) {
    props["aria-label"] = label
  }

  if (busy) {
    props["aria-busy"] = "true"
  }

  if (multiselectable) {
    props["aria-multiselectable"] = "true"
  }

  return props
}

export function getImageProps(options = {}) {
  const { alt, decorative = false, longdesc = null } = options

  const props = {}

  if (decorative) {
    props.alt = ""
    props.role = "presentation"
    props["aria-hidden"] = "true"
  } else {
    props.alt = alt || ""
  }

  if (longdesc) {
    props.longdesc = longdesc
  }

  return props
}

export function getAlertProps(options = {}) {
  const { live = "polite", atomic = true, role = "alert" } = options

  const props = {
    role: role,
  }

  if (live !== "off") {
    props["aria-live"] = live
  }

  if (atomic) {
    props["aria-atomic"] = "true"
  }

  return props
}

export function getProgressProps(options = {}) {
  const { value, max = 100, valuetext = null, label = null } = options

  const props = {
    role: "progressbar",
    "aria-valuemin": 0,
    "aria-valuemax": max,
    "aria-valuenow": value,
  }

  if (valuetext) {
    props["aria-valuetext"] = valuetext
  }

  if (label) {
    props["aria-label"] = label
  }

  return props
}

export function checkImageAccessibility(img) {
  if (!img || img.tagName !== "IMG") {
    return { isAccessible: false, issues: ["No es un elemento de imagen válido"] }
  }

  const issues = []

  // Verificar alt
  if (!img.hasAttribute("alt")) {
    issues.push("Falta el atributo alt")
  } else if (img.getAttribute("alt") === "" && !img.hasAttribute("role") && !img.hasAttribute("aria-hidden")) {
    // Las imágenes decorativas deben tener alt="" y role="presentation" o aria-hidden="true"
    issues.push('Imagen decorativa sin role="presentation" o aria-hidden="true"')
  }

  if (img.parentElement && img.parentElement.tagName === "A") {
    const link = img.parentElement

    if ((!img.hasAttribute("alt") || img.getAttribute("alt") === "") && link.textContent.trim() === "") {
      issues.push("Enlace con imagen sin texto alternativo")
    }
  }

  return {
    isAccessible: issues.length === 0,
    issues,
  }
}


export function checkFormAccessibility(form) {
  if (!form || form.tagName !== "FORM") {
    return { isAccessible: false, issues: ["No es un elemento de formulario válido"] }
  }

  const issues = []

  // Verificar campos de entrada
  const inputs = form.querySelectorAll("input, select, textarea")
  inputs.forEach((input) => {
    const hasLabel = input.id && form.querySelector(`label[for="${input.id}"]`)
    const hasAriaLabel = input.hasAttribute("aria-label")
    const hasAriaLabelledBy = input.hasAttribute("aria-labelledby")

    if (input.type === "hidden" || input.type === "button" || input.type === "submit" || input.type === "reset") {
      return
    }

    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push(`Campo ${input.name || input.id || "sin nombre"} sin etiqueta asociada`)
    }

    // Verificar campos requeridos
    if (input.hasAttribute("required") && !input.hasAttribute("aria-required")) {
      issues.push(`Campo requerido ${input.name || input.id || "sin nombre"} sin aria-required="true"`)
    }
  })

  const hasSubmitButton = form.querySelector('button[type="submit"], input[type="submit"]')
  if (!hasSubmitButton) {
    issues.push("Formulario sin botón de envío")
  }

  return {
    isAccessible: issues.length === 0,
    issues,
  }
}
