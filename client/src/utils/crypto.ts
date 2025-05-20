/**
 * Funciones de encriptación y desencriptación para tokens y datos sensibles
 */

/**
 * Encripta un texto usando una clave
 * @param text Texto a encriptar
 * @param key Clave de encriptación
 * @returns Texto encriptado
 */
export function encrypt(text: string, key: string): string {
  // Implementación simple para desarrollo
  // En producción, usar una biblioteca de encriptación real
  try {
    // Convertir texto y clave a valores numéricos
    let result = ""
    for (let i = 0; i < text.length; i++) {
      // XOR simple con la clave
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      result += String.fromCharCode(charCode)
    }
    // Codificar en base64 para almacenamiento seguro
    return btoa(result)
  } catch (e) {
    console.error("Error al encriptar:", e)
    return text // Fallback a texto plano en caso de error
  }
}

/**
 * Desencripta un texto usando una clave
 * @param encryptedText Texto encriptado
 * @param key Clave de encriptación
 * @returns Texto desencriptado
 */
export function decrypt(encryptedText: string, key: string): string {
  // Implementación simple para desarrollo
  // En producción, usar una biblioteca de encriptación real
  try {
    // Decodificar de base64
    const decoded = atob(encryptedText)
    // Aplicar XOR inverso
    let result = ""
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      result += String.fromCharCode(charCode)
    }
    return result
  } catch (e) {
    console.error("Error al desencriptar:", e)
    return "" // Retornar cadena vacía en caso de error
  }
}

/**
 * Genera un hash simple de un texto
 * @param text Texto a hashear
 * @returns Hash del texto
 */
export function hash(text: string): string {
  // Implementación simple para desarrollo
  // En producción, usar una biblioteca de hash real
  let hash = 0
  if (text.length === 0) return hash.toString(36)

  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convertir a entero de 32 bits
  }

  return hash.toString(36)
}

/**
 * Verifica si un texto coincide con un hash
 * @param text Texto a verificar
 * @param hashedText Hash a comparar
 * @returns true si coinciden
 */
export function verifyHash(text: string, hashedText: string): boolean {
  return hash(text) === hashedText
}
