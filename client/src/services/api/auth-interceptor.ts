import { tokenStorage } from "../auth/token-service"
import { isBrowser } from "../../utils/client-only"

// Función para registrar el interceptor de autenticación
export function registerAuthInterceptor(axiosInstance) {
  // Verificar si estamos en el navegador y si axiosInstance existe
  if (!isBrowser() || !axiosInstance || !axiosInstance.interceptors) {
    console.log("[Auth Interceptor] No se pudo registrar el interceptor (entorno SSR o instancia inválida)")
    // Devolver una función vacía para mantener la consistencia de la API
    return () => {}
  }

  console.log("[Auth Interceptor] Registrando interceptor de autenticación")

  // Interceptor de solicitud para añadir el token de autenticación
  const requestInterceptor = axiosInstance.interceptors.request.use(
    (config) => {
      const token = tokenStorage.getToken()

      if (token) {
        config.headers = config.headers || {}
        config.headers["Authorization"] = `Bearer ${token}`
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // Interceptor de respuesta para manejar errores de autenticación
  const responseInterceptor = axiosInstance.interceptors.response.use(
    (response) => {
      return response
    },
    async (error) => {
      if (!error.config) {
        return Promise.reject(error)
      }

      const originalRequest = error.config

      // Si el error es 401 (No autorizado) y no hemos intentado renovar el token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          // Intentar renovar el token
          const refreshToken = tokenStorage.getRefreshToken()

          if (refreshToken) {
            // Llamar al endpoint de renovación de token
            const response = await axiosInstance.post("/auth/refresh", {
              refresh_token: refreshToken,
            })

            const { token, refresh_token } = response.data

            // Guardar los nuevos tokens
            tokenStorage.setToken(token)
            tokenStorage.setRefreshToken(refresh_token)

            // Actualizar el token en la solicitud original
            originalRequest.headers["Authorization"] = `Bearer ${token}`

            // Reintentar la solicitud original
            return axiosInstance(originalRequest)
          }
        } catch (refreshError) {
          // Si falla la renovación, limpiar los tokens y redirigir al login
          tokenStorage.clearTokens()

          // Disparar evento de sesión expirada solo en el navegador
          if (isBrowser()) {
            window.dispatchEvent(new CustomEvent("auth:session-expired"))
          }

          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    },
  )

  // Devolver función para eliminar los interceptores
  return () => {
    if (axiosInstance && axiosInstance.interceptors) {
      axiosInstance.interceptors.request.eject(requestInterceptor)
      axiosInstance.interceptors.response.eject(responseInterceptor)
    }
  }
}

export default registerAuthInterceptor
