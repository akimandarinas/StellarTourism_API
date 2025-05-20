/**
 * Punto de entrada unificado para servicios de autenticación
 * Exporta el servicio de autenticación y funciones relacionadas
 */

import { authService, type User, type LoginCredentials, type RegisterData } from "./auth-service"
import { tokenService } from "./token-service"

// Re-exportar para facilitar el uso
export { authService, tokenService, type User, type LoginCredentials, type RegisterData }

// Función para obtener el usuario actual
export function getCurrentUser(): User | null {
  return authService.getCurrentUser()
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  return authService.isAuthenticated()
}

// Función para iniciar sesión
export async function login(credentials: LoginCredentials): Promise<User> {
  return authService.login(credentials)
}

// Función para registrar un nuevo usuario
export async function register(data: RegisterData): Promise<User> {
  return authService.register(data)
}

// Función para cerrar sesión
export async function logout(): Promise<void> {
  return authService.logout()
}

// Exportar todo como objeto por defecto para compatibilidad con código existente
export default {
  authService,
  tokenService,
  getCurrentUser,
  isAuthenticated,
  login,
  register,
  logout,
}
