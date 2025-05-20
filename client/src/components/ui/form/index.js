// Exportar todos los componentes de formulario desde un único punto de entrada
export { default as Form } from "./Form.vue"
export { default as FormField } from "./FormField.vue"
export { default as TextField } from "./TextField.vue"
export { default as TextareaField } from "./TextareaField.vue"
export { default as SelectField } from "./SelectField.vue"
export { default as CheckboxField } from "./CheckboxField.vue"
export { default as RadioField } from "./RadioField.vue"

// Exportar utilidades de validación
export const validateRequired = (value) => {
  if (!value && value !== 0) return "Este campo es obligatorio"
  return true
}

export const validateEmail = (value) => {
  if (!value) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value) ? true : "Email inválido"
}

export const validateMinLength = (min) => (value) => {
  if (!value) return true
  return value.length >= min ? true : `Debe tener al menos ${min} caracteres`
}

export const validateMaxLength = (max) => (value) => {
  if (!value) return true
  return value.length <= max ? true : `Debe tener como máximo ${max} caracteres`
}

export const validateNumber = (value) => {
  if (!value && value !== 0) return true
  return !isNaN(Number(value)) ? true : "Debe ser un número"
}

export const validateInteger = (value) => {
  if (!value && value !== 0) return true
  return Number.isInteger(Number(value)) ? true : "Debe ser un número entero"
}

export const validatePositive = (value) => {
  if (!value && value !== 0) return true
  return Number(value) > 0 ? true : "Debe ser un número positivo"
}

export const validateUrl = (value) => {
  if (!value) return true
  try {
    new URL(value)
    return true
  } catch (e) {
    return "URL inválida"
  }
}

export const validateDate = (value) => {
  if (!value) return true
  const date = new Date(value)
  return !isNaN(date.getTime()) ? true : "Fecha inválida"
}

export const validateFutureDate = (value) => {
  if (!value) return true
  const date = new Date(value)
  const now = new Date()
  return date > now ? true : "La fecha debe ser futura"
}

export const validatePastDate = (value) => {
  if (!value) return true
  const date = new Date(value)
  const now = new Date()
  return date < now ? true : "La fecha debe ser pasada"
}

export const validatePattern = (pattern, message) => (value) => {
  if (!value) return true
  const regex = new RegExp(pattern)
  return regex.test(value) ? true : message || "Formato inválido"
}

export const validateConfirmation = (field, message) => (value, formValues) => {
  if (!value) return true
  return value === formValues[field] ? true : message || "Los valores no coinciden"
}

// Asegurarse de que el archivo de componentes de formulario exporte correctamente los componentes

export { default as Label } from "../Label.vue"
export { default as Textarea } from "../Textarea.vue"
export { default as Checkbox } from "../Checkbox.vue"
export { default as Radio } from "../Radio.vue"
export { default as Switch } from "../Switch.vue"
export { default as Select } from "../../ui/components/Select.vue"
