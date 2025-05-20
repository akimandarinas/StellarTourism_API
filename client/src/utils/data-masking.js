/**
 * Utilidades para enmascarar datos sensibles
 */

// Función para enmascarar un número de tarjeta de crédito
export function maskCreditCard(cardNumber) {
  if (!cardNumber) return ""

  // Eliminar espacios y guiones
  const cleaned = cardNumber.replace(/[\s-]/g, "")

  // Verificar que sea un número de tarjeta válido
  if (!/^\d{13,19}$/.test(cleaned)) return cardNumber

  // Mostrar solo los últimos 4 dígitos
  return "•••• ".repeat(3) + cleaned.slice(-4)
}

// Función para enmascarar un correo electrónico
export function maskEmail(email) {
  if (!email) return ""

  // Verificar que sea un correo válido
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return email

  const [username, domain] = email.split("@")

  // Mostrar solo el primer y último carácter del nombre de usuario
  const maskedUsername =
    username.charAt(0) + "•".repeat(Math.max(1, username.length - 2)) + username.charAt(username.length - 1)

  return `${maskedUsername}@${domain}`
}

// Función para enmascarar un número de teléfono
export function maskPhone(phone) {
  if (!phone) return ""

  // Eliminar espacios, guiones y paréntesis
  const cleaned = phone.replace(/[\s\-()]/g, "")

  // Verificar que sea un número de teléfono válido
  if (!/^\+?\d{8,15}$/.test(cleaned)) return phone

  // Mostrar solo los últimos 4 dígitos
  return "•••• " + cleaned.slice(-4)
}

// Función para enmascarar un nombre completo
export function maskName(name) {
  if (!name) return ""

  const parts = name.split(" ")

  // Mostrar solo la primera letra de cada parte
  return parts.map((part) => part.charAt(0) + "•".repeat(Math.max(1, part.length - 1))).join(" ")
}

// Función para enmascarar una dirección
export function maskAddress(address) {
  if (!address) return ""

  // Dividir la dirección en partes
  const parts = address.split(", ")

  // Mostrar solo la primera parte (calle) parcialmente enmascarada
  if (parts.length > 0) {
    const street = parts[0]
    const maskedStreet =
      street.charAt(0) + "•".repeat(Math.max(1, street.length - 2)) + street.charAt(street.length - 1)
    parts[0] = maskedStreet
  }

  return parts.join(", ")
}

// Función para enmascarar un documento de identidad
export function maskIdentity(id) {
  if (!id) return ""

  // Mostrar solo los últimos 3 caracteres
  return "•".repeat(Math.max(1, id.length - 3)) + id.slice(-3)
}

// Función para enmascarar datos en logs
export function maskSensitiveDataInLogs(data) {
  if (!data) return data

  // Crear una copia para no modificar el original
  const masked = JSON.parse(JSON.stringify(data))

  // Lista de campos sensibles a enmascarar
  const sensitiveFields = [
    "password",
    "contraseña",
    "token",
    "secret",
    "key",
    "clave",
    "pin",
    "cardNumber",
    "numeroTarjeta",
    "cvv",
    "cvc",
    "expiry",
    "vencimiento",
    "ssn",
    "socialSecurity",
    "dni",
    "passport",
    "pasaporte",
    "licencia",
    "dob",
    "birthDate",
    "fechaNacimiento",
    "dateOfBirth",
  ]

  // Función recursiva para enmascarar campos sensibles
  function maskRecursive(obj) {
    if (typeof obj !== "object" || obj === null) return

    Object.keys(obj).forEach((key) => {
      // Si es un campo sensible, enmascararlo
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        obj[key] = typeof obj[key] === "string" ? "••••••••" : null
      }
      // Si es un objeto o array, procesarlo recursivamente
      else if (typeof obj[key] === "object" && obj[key] !== null) {
        maskRecursive(obj[key])
      }
    })
  }

  maskRecursive(masked)
  return masked
}

// Exportar todas las funciones
export default {
  maskCreditCard,
  maskEmail,
  maskPhone,
  maskName,
  maskAddress,
  maskIdentity,
  maskSensitiveDataInLogs,
}
