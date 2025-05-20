/**
 * Tipos centralizados para la aplicación StellarTourism
 */

// Tipos de autenticación
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: "user" | "admin" | "staff"
  emailVerified?: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  token: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

// Tipos de destinos
export interface Destino {
  id: string
  nombre: string
  descripcion: string
  imagen: string
  galaxia: string
  distancia: number
  clima: string
  gravedad: number
  temperatura: {
    min: number
    max: number
    unidad: "C" | "F" | "K"
  }
  atracciones: string[]
  peligros: string[]
  requisitosVisa: boolean
  duracionViaje: {
    valor: number
    unidad: "horas" | "dias" | "semanas" | "meses"
  }
  precio: number
  moneda: string
  puntuacion: number
  disponible: boolean
  createdAt: string
  updatedAt: string
}

export interface DestinoFiltros {
  galaxia?: string
  clima?: string
  precioMin?: number
  precioMax?: number
  distanciaMax?: number
  duracionMax?: number
  puntuacionMin?: number
  disponible?: boolean
}

// Tipos de naves
export interface Nave {
  id: string
  nombre: string
  modelo: string
  fabricante: string
  capacidad: number
  velocidadMaxima: number
  autonomia: number
  imagen: string
  descripcion: string
  caracteristicas: string[]
  clase: "economica" | "turista" | "business" | "primera"
  estado: "disponible" | "mantenimiento" | "en_ruta"
  createdAt: string
  updatedAt: string
}

// Tipos de rutas
export interface Ruta {
  id: string
  origen: string
  destino: string
  duracion: number
  distancia: number
  escalas: {
    lugar: string
    duracion: number
  }[]
  precio: number
  moneda: string
  disponible: boolean
  createdAt: string
  updatedAt: string
}

// Tipos de reservas
export interface Reserva {
  id: string
  userId: string
  destinoId: string
  naveId: string
  rutaId: string
  fechaSalida: string
  fechaLlegada: string
  pasajeros: {
    nombre: string
    apellidos: string
    documento: string
    tipoDocumento: "dni" | "pasaporte" | "otro"
  }[]
  estado: "pendiente" | "confirmada" | "cancelada" | "completada"
  pagoId?: string
  precio: number
  moneda: string
  createdAt: string
  updatedAt: string
}

export interface NuevaReserva {
  destinoId: string
  naveId: string
  rutaId: string
  fechaSalida: string
  pasajeros: {
    nombre: string
    apellidos: string
    documento: string
    tipoDocumento: "dni" | "pasaporte" | "otro"
  }[]
}

// Tipos de actividades
export interface Actividad {
  id: string
  nombre: string
  descripcion: string
  imagen: string
  destinoId: string
  duracion: number
  precio: number
  moneda: string
  disponible: boolean
  capacidadMaxima: number
  edadMinima: number
  dificultad: "baja" | "media" | "alta"
  incluye: string[]
  noIncluye: string[]
  createdAt: string
  updatedAt: string
}

// Tipos de reseñas
export interface Resena {
  id: string
  userId: string
  destinoId?: string
  naveId?: string
  actividadId?: string
  puntuacion: number
  comentario: string
  fecha: string
  createdAt: string
  updatedAt: string
}

// Tipos de pagos
export interface Pago {
  id: string
  userId: string
  reservaId: string
  monto: number
  moneda: string
  estado: "pendiente" | "completado" | "fallido" | "reembolsado"
  metodo: "tarjeta" | "paypal" | "transferencia" | "otro"
  referencia: string
  fechaPago: string
  createdAt: string
  updatedAt: string
}

// Tipos de UI
import type { JSX } from "react"

export interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration: number
  createdAt: number
}

export interface Modal {
  id: string
  title: string
  content: string | JSX.Element
  isOpen: boolean
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Tipos de API
export interface ApiResponse<T> {
  status: "success" | "error"
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: Pagination
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string | number | boolean>
  cache?: boolean
  cacheTTL?: number
  retry?: boolean
  retryCount?: number
  retryDelay?: number
  timeout?: number
}

// Tipos de notificaciones
export interface Notificacion {
  id: string
  userId: string
  tipo: "info" | "warning" | "error" | "success"
  titulo: string
  mensaje: string
  leida: boolean
  fecha: string
  enlace?: string
  createdAt: string
  updatedAt: string
}

// Tipos de preferencias de usuario
export interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  accessibility: {
    reduceMotion: boolean
    highContrast: boolean
    largeText: boolean
  }
  currency: string
}

// Exportar todos los tipos
export type {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  Destino,
  DestinoFiltros,
  Nave,
  Ruta,
  Reserva,
  NuevaReserva,
  Actividad,
  Resena,
  Pago,
  Toast,
  Modal,
  Pagination,
  ApiResponse,
  ApiError,
  ApiRequestOptions,
  Notificacion,
  UserPreferences,
}
