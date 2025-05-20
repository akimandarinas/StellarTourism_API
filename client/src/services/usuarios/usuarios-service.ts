/**
 * Servicio para gestionar usuarios
 */
import { BaseService } from "../base-service"
import { apiClient } from "../api/client"
import { withErrorHandling } from "../../utils/api-error-handler"
import type { ApiRequestOptions } from "../../types/api"

// Tipos para el servicio de usuarios
export interface Usuario {
  id: string
  email: string
  nombre: string
  apellidos?: string
  telefono?: string
  foto?: string
  rol: "usuario" | "admin" | "staff"
  verificado: boolean
  created_at: string
  updated_at: string
}

export interface UsuarioUpdateData {
  nombre?: string
  apellidos?: string
  telefono?: string
  foto?: string
}

/**
 * Servicio para gestionar usuarios
 */
export class UsuariosService extends BaseService<Usuario> {
  constructor() {
    super({
      resourceName: "usuarios",
      cacheTTL: 5 * 60 * 1000, // 5 minutos
      cacheOptions: {
        maxSize: 30,
        persistToStorage: true,
      },
    })
  }

  /**
   * Obtiene el perfil del usuario actual
   * @param options Opciones de consulta
   * @returns Perfil del usuario
   */
  getProfile = withErrorHandling(async (options: ApiRequestOptions = {}): Promise<Usuario> => {
    const cacheKey = `profile`

    if (this.enableCache) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const response = await apiClient.get<Usuario>("/auth/me", options)
    const data = response.data as Usuario

    if (this.enableCache && data) {
      await this.cache.set(cacheKey, data)
    }

    return data
  })

  /**
   * Actualiza el perfil del usuario actual
   * @param data Datos a actualizar
   * @param options Opciones de consulta
   * @returns Perfil actualizado
   */
  updateProfile = withErrorHandling(
    async (data: UsuarioUpdateData, options: ApiRequestOptions = {}): Promise<Usuario> => {
      const response = await apiClient.put<Usuario>("/auth/profile", data, options)
      const updatedData = response.data as Usuario

      if (this.enableCache) {
        // Invalidar caché del perfil
        await this.cache.delete(`profile`)
      }

      return updatedData
    },
  )

  /**
   * Cambia la contraseña del usuario actual
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   * @param options Opciones de consulta
   * @returns true si se cambió correctamente
   */
  changePassword = withErrorHandling(
    async (currentPassword: string, newPassword: string, options: ApiRequestOptions = {}): Promise<boolean> => {
      if (!currentPassword || !newPassword) {
        throw new Error("Se requieren ambas contraseñas")
      }

      await apiClient.post(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        options,
      )

      return true
    },
  )
}

// Exportar instancia singleton
export const usuariosService = new UsuariosService()
