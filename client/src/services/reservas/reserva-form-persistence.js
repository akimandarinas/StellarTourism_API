"use client"

/**
 * Servicio para la persistencia del formulario de reserva
 * Maneja el guardado automático, recuperación y limpieza de datos del formulario
 */
import { ref, watch } from "vue"
import { useRouter } from "vue-router"

// Clave para almacenar los datos en localStorage
const STORAGE_KEY = "stellar_tourism_reserva_form"
// Tiempo de expiración: 24 horas en milisegundos
const EXPIRATION_TIME = 24 * 60 * 60 * 1000

/**
 * Guarda los datos del formulario en localStorage con timestamp
 * @param {Object} formData - Datos del formulario a guardar
 */
export function saveFormData(formData) {
  try {
    const dataToSave = {
      data: formData,
      timestamp: Date.now(),
      lastStep: formData.pasoActual || 1,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    console.log("Datos del formulario guardados automáticamente")
    return true
  } catch (error) {
    console.error("Error al guardar datos del formulario:", error)
    return false
  }
}

/**
 * Recupera los datos del formulario desde localStorage
 * @returns {Object|null} Datos del formulario o null si no existen o están expirados
 */
export function loadFormData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (!savedData) return null

    const parsedData = JSON.parse(savedData)

    // Verificar si los datos han expirado
    if (Date.now() - parsedData.timestamp > EXPIRATION_TIME) {
      clearFormData()
      return null
    }

    console.log("Datos del formulario recuperados")
    return parsedData.data
  } catch (error) {
    console.error("Error al cargar datos del formulario:", error)
    return null
  }
}

/**
 * Elimina los datos del formulario de localStorage
 */
export function clearFormData() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log("Datos del formulario eliminados")
    return true
  } catch (error) {
    console.error("Error al eliminar datos del formulario:", error)
    return false
  }
}

/**
 * Verifica si hay datos de formulario guardados
 * @returns {boolean} True si hay datos guardados y no expirados
 */
export function hasFormData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (!savedData) return false

    const parsedData = JSON.parse(savedData)
    return Date.now() - parsedData.timestamp <= EXPIRATION_TIME
  } catch {
    return false
  }
}

/**
 * Obtiene el último paso guardado
 * @returns {number} Último paso guardado o 1 si no hay datos
 */
export function getLastStep() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (!savedData) return 1

    const parsedData = JSON.parse(savedData)
    return parsedData.lastStep || 1
  } catch {
    return 1
  }
}

/**
 * Hook para usar persistencia de formulario con guardado automático
 * @param {Object} formData - Datos reactivos del formulario
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Métodos y estado para manejar la persistencia
 */
export function useFormPersistence(formData, options = {}) {
  const {
    autoSaveDelay = 2000, // Retraso para guardado automático en ms
    confirmOnLeave = true, // Confirmar al salir con cambios sin guardar
    excludeFields = [], // Campos a excluir del guardado
  } = options

  const router = useRouter()
  const lastSaved = ref(Date.now())
  const isDirty = ref(false)
  const isRestoring = ref(false)

  // Temporizador para guardado automático
  let autoSaveTimer = null

  // Guardar datos con retraso para evitar guardados excesivos
  const debouncedSave = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)

    autoSaveTimer = setTimeout(() => {
      saveForm()
    }, autoSaveDelay)
  }

  // Guardar formulario excluyendo campos especificados
  const saveForm = () => {
    const dataToSave = { ...formData.value }

    // Excluir campos especificados
    excludeFields.forEach((field) => {
      delete dataToSave[field]
    })

    saveFormData(dataToSave)
    lastSaved.value = Date.now()
    isDirty.value = false
  }

  // Restaurar datos guardados
  const restoreForm = () => {
    isRestoring.value = true
    const savedData = loadFormData()

    if (savedData) {
      // Fusionar datos guardados con el formulario actual
      Object.keys(savedData).forEach((key) => {
        if (key in formData.value && !excludeFields.includes(key)) {
          formData.value[key] = savedData[key]
        }
      })
    }

    isRestoring.value = false
    isDirty.value = false
    return !!savedData
  }

  // Limpiar datos guardados
  const clearForm = () => {
    clearFormData()
    isDirty.value = false
  }

  // Observar cambios en el formulario para guardado automático
  watch(
    () => formData.value,
    () => {
      if (isRestoring.value) return
      isDirty.value = true
      debouncedSave()
    },
    { deep: true },
  )

  // Configurar confirmación al salir de la página con cambios sin guardar
  if (confirmOnLeave && router) {
    router.beforeEach((to, from, next) => {
      // Si hay cambios sin guardar y estamos navegando fuera del flujo de reserva
      if (isDirty.value && !to.path.includes("/reserva")) {
        const confirmed = window.confirm("Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?")
        if (confirmed) {
          next()
        } else {
          next(false)
        }
      } else {
        next()
      }
    })
  }

  return {
    saveForm,
    restoreForm,
    clearForm,
    hasFormData: hasFormData,
    lastSaved,
    isDirty,
    isRestoring,
  }
}

export default {
  saveFormData,
  loadFormData,
  clearFormData,
  hasFormData,
  getLastStep,
  useFormPersistence,
}
