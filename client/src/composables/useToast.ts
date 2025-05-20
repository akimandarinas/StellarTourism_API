"use client"

import { reactive } from "vue"

export interface Toast {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  duration: number
  timestamp: number
}

// Array reactivo para almacenar los toasts
export const toasts = reactive<Toast[]>([])

// Contador para generar IDs únicos
let toastCounter = 0

/**
 * Composable para gestionar notificaciones toast
 */
export function useToast() {
  // Duración por defecto de los toasts (5 segundos)
  const DEFAULT_DURATION = 5000

  /**
   * Añade un nuevo toast
   * @param title Título del toast
   * @param message Mensaje del toast
   * @param type Tipo de toast
   * @param duration Duración en ms (0 para no auto-cerrar)
   * @returns ID del toast creado
   */
  const add = (
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    duration: number = DEFAULT_DURATION,
  ): string => {
    const id = `toast-${++toastCounter}`

    const newToast: Toast = {
      id,
      title,
      message,
      type,
      duration,
      timestamp: Date.now(),
    }

    toasts.push(newToast)

    // Si tiene duración, programar su eliminación
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  /**
   * Elimina un toast por su ID
   * @param id ID del toast a eliminar
   */
  const remove = (id: string): void => {
    const index = toasts.findIndex((toast) => toast.id === id)
    if (index !== -1) {
      toasts.splice(index, 1)
    }
  }

  /**
   * Elimina todos los toasts
   */
  const clear = (): void => {
    toasts.splice(0, toasts.length)
  }

  /**
   * Crea un toast de tipo info
   * @param title Título
   * @param message Mensaje
   * @param duration Duración en ms
   * @returns ID del toast
   */
  const info = (title: string, message: string, duration?: number): string => {
    return add(title, message, "info", duration)
  }

  /**
   * Crea un toast de tipo success
   * @param title Título
   * @param message Mensaje
   * @param duration Duración en ms
   * @returns ID del toast
   */
  const success = (title: string, message: string, duration?: number): string => {
    return add(title, message, "success", duration)
  }

  /**
   * Crea un toast de tipo warning
   * @param title Título
   * @param message Mensaje
   * @param duration Duración en ms
   * @returns ID del toast
   */
  const warning = (title: string, message: string, duration?: number): string => {
    return add(title, message, "warning", duration)
  }

  /**
   * Crea un toast de tipo error
   * @param title Título
   * @param message Mensaje
   * @param duration Duración en ms
   * @returns ID del toast
   */
  const error = (title: string, message: string, duration?: number): string => {
    return add(title, message, "error", duration)
  }

  return {
    toasts,
    add,
    remove,
    clear,
    info,
    success,
    warning,
    error,
  }
}

export default useToast
