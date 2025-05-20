/**
 * Utilidades para la autenticación
 */

// Verificar si el usuario está autenticado
export function isAuthenticated() {
  const token = localStorage.getItem("stellar_auth_token")
  const user = localStorage.getItem("stellar_current_user")

  return !!token && !!user
}

// Obtener el usuario actual
export function getCurrentUser() {
  const userJson = localStorage.getItem("stellar_current_user")
  if (!userJson) return null

  try {
    return JSON.parse(userJson)
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

// Obtener el token de autenticación
export function getAuthToken() {
  return localStorage.getItem("stellar_auth_token")
}

// Cerrar sesión
export function logout() {
  localStorage.removeItem("stellar_auth_token")
  localStorage.removeItem("stellar_current_user")

  // Mantener la preferencia de "recordarme"
  const rememberMe = localStorage.getItem("stellar_remember_me")
  if (!rememberMe) {
    localStorage.removeItem("stellar_remember_me")
  }

  // Redirigir a la página de inicio de sesión
  window.location.href = "/login"
}

// Verificar si el token ha expirado
export function isTokenExpired() {
  const token = getAuthToken()
  if (!token) return true

  // En una implementación real, decodificaríamos el JWT y verificaríamos la fecha de expiración
  // Para esta simulación, consideramos que el token expira después de 1 hora
  const tokenTimestamp = Number.parseInt(token.split("_").pop(), 10)
  const expirationTime = tokenTimestamp + 60 * 60 * 1000 // 1 hora

  return Date.now() > expirationTime
}

// Renovar el token si es necesario
export function renewTokenIfNeeded() {
  if (isAuthenticated() && isTokenExpired()) {
    // En una implementación real, haríamos una llamada al backend para renovar el token
    // Para esta simulación, simplemente generamos un nuevo token
    localStorage.setItem("stellar_auth_token", "simulated_token_" + Date.now())
  }
}

// Redirigir si no está autenticado
export function redirectIfNotAuthenticated(redirectTo = "/login") {
  if (!isAuthenticated()) {
    window.location.href = redirectTo
  }
}
