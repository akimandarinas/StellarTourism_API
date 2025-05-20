import { nextTick } from "vue"
import { createI18n } from "vue-i18n"
import { isClient } from "./ssr-safe"

// Importar mensajes
const messages = {
  es: {
    common: {
      loading: "Cargando...",
      error: "Ha ocurrido un error",
      retry: "Reintentar",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      search: "Buscar",
      filter: "Filtrar",
      sort: "Ordenar",
      close: "Cerrar",
      back: "Volver",
      next: "Siguiente",
      previous: "Anterior",
      yes: "Sí",
      no: "No",
    },
    auth: {
      login: "Iniciar sesión",
      register: "Registrarse",
      logout: "Cerrar sesión",
      email: "Correo electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar contraseña",
      forgotPassword: "¿Olvidaste tu contraseña?",
      resetPassword: "Restablecer contraseña",
      loginSuccess: "Sesión iniciada correctamente",
      loginError: "Error al iniciar sesión",
      registerSuccess: "Registro completado correctamente",
      registerError: "Error al registrarse",
      logoutSuccess: "Sesión cerrada correctamente",
      logoutError: "Error al cerrar sesión",
      resetPasswordSuccess: "Contraseña restablecida correctamente",
      resetPasswordError: "Error al restablecer la contraseña",
    },
    // ... otros mensajes
  },
  en: {
    common: {
      loading: "Loading...",
      error: "An error has occurred",
      retry: "Retry",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      yes: "Yes",
      no: "No",
    },
    auth: {
      login: "Login",
      register: "Register",
      logout: "Logout",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      forgotPassword: "Forgot your password?",
      resetPassword: "Reset password",
      loginSuccess: "Login successful",
      loginError: "Login error",
      registerSuccess: "Registration successful",
      registerError: "Registration error",
      logoutSuccess: "Logout successful",
      logoutError: "Logout error",
      resetPasswordSuccess: "Password reset successful",
      resetPasswordError: "Password reset error",
    },
    // ... otros mensajes
  },
}

// Tipos
type MessageSchema = typeof messages.es

// Función para cambiar el idioma
export async function setLocale(locale: "es" | "en") {
  const i18nInstance = setupI18n()
  i18nInstance.global.locale.value = locale
  document.querySelector("html")?.setAttribute("lang", locale)
  localStorage.setItem("locale", locale)

  return nextTick()
}

// Función para obtener el idioma actual
export function getLocale(): "es" | "en" {
  const i18nInstance = setupI18n()
  return i18nInstance.global.locale.value
}

// Función para inicializar el idioma desde localStorage
export function initLocale() {
  const savedLocale = localStorage.getItem("locale") as "es" | "en" | null
  if (savedLocale && ["es", "en"].includes(savedLocale)) {
    setLocale(savedLocale)
  }
}

// Configurar i18n
export function setupI18n() {
  // Obtener idioma del navegador
  const locale = isClient ? navigator.language.split("-")[0] || "es" : "es"

  // Crear instancia de i18n
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: "es",
    messages,
  })

  return i18n
}
