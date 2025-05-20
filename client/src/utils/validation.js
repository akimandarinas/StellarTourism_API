// Validación de email
export const validateEmail = (email) => {
  if (!email) return "El email es obligatorio"

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "El formato del email no es válido"
  }

  return ""
}

// Validación de contraseña
export const validatePassword = (password) => {
  if (!password) return "La contraseña es obligatoria"

  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres"
  }

  // Verificar si contiene al menos un número
  if (!/\d/.test(password)) {
    return "La contraseña debe contener al menos un número"
  }

  // Verificar si contiene al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) {
    return "La contraseña debe contener al menos una letra mayúscula"
  }

  // Verificar si contiene al menos un carácter especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "La contraseña debe contener al menos un carácter especial"
  }

  return ""
}

// Validación de nombre
export const validateName = (name) => {
  if (!name) return "El nombre es obligatorio"

  if (name.length < 2) {
    return "El nombre debe tener al menos 2 caracteres"
  }

  if (name.length > 50) {
    return "El nombre no puede exceder los 50 caracteres"
  }

  return ""
}

// Validación de número de tarjeta
export const validateCardNumber = (cardNumber) => {
  if (!cardNumber) return "El número de tarjeta es obligatorio"

  // Eliminar espacios y guiones
  const cleanedNumber = cardNumber.replace(/[\s-]/g, "")

  // Verificar que solo contiene dígitos
  if (!/^\d+$/.test(cleanedNumber)) {
    return "El número de tarjeta solo debe contener dígitos"
  }

  // Verificar longitud (la mayoría de las tarjetas tienen entre 13 y 19 dígitos)
  if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
    return "El número de tarjeta debe tener entre 13 y 19 dígitos"
  }

  // Algoritmo de Luhn (validación de checksum)
  let sum = 0
  let shouldDouble = false

  for (let i = cleanedNumber.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(cleanedNumber.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  if (sum % 10 !== 0) {
    return "El número de tarjeta no es válido"
  }

  return ""
}

// Validación de fecha de expiración
export const validateCardExpiry = (month, year) => {
  if (!month || !year) return "La fecha de expiración es obligatoria"

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // getMonth() devuelve 0-11

  const expiryMonth = Number.parseInt(month, 10)
  let expiryYear = Number.parseInt(year, 10)

  // Si el año tiene 2 dígitos, convertirlo a 4 dígitos
  if (expiryYear < 100) {
    expiryYear += 2000
  }

  // Verificar que el mes es válido
  if (expiryMonth < 1 || expiryMonth > 12) {
    return "El mes de expiración no es válido"
  }

  // Verificar que la fecha no está en el pasado
  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    return "La tarjeta ha expirado"
  }

  return ""
}

// Validación de CVC
export const validateCardCvc = (cvc, cardType = "") => {
  if (!cvc) return "El código de seguridad es obligatorio"

  // Eliminar espacios
  const cleanedCvc = cvc.replace(/\s/g, "")

  // Verificar que solo contiene dígitos
  if (!/^\d+$/.test(cleanedCvc)) {
    return "El código de seguridad solo debe contener dígitos"
  }

  // American Express requiere 4 dígitos, el resto normalmente usa 3
  const isAmex = cardType.toLowerCase() === "amex" || cardType.toLowerCase() === "american express"
  const expectedLength = isAmex ? 4 : 3

  if (cleanedCvc.length !== expectedLength) {
    return `El código de seguridad debe tener ${expectedLength} dígitos`
  }

  return ""
}

// Composable para validación de formularios
export function useValidation() {
  const validateForm = (formData, validationRules) => {
    const errors = {}
    let isValid = true

    // Aplicar reglas de validación a cada campo
    Object.keys(validationRules).forEach((field) => {
      const value = formData[field]
      const rule = validationRules[field]

      // Si la regla es una función, ejecutarla
      if (typeof rule === "function") {
        const error = rule(value)
        if (error) {
          errors[field] = error
          isValid = false
        }
      }
    })

    return { isValid, errors }
  }

  return {
    validateForm,
    validateEmail,
    validatePassword,
    validateName,
    validateCardNumber,
    validateCardExpiry,
    validateCardCvc,
  }
}
