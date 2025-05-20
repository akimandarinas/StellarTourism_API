"use client"

import { computed, watch, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"

/**
 * Composable para manejar parámetros de URL de manera consistente
 * @param {Object} options - Opciones de configuración
 * @param {string} options.paramName - Nombre del parámetro de URL a manejar
 * @param {Function} options.loadData - Función para cargar datos basados en el parámetro
 * @param {Function} options.validateParam - Función para validar el parámetro (opcional)
 * @param {string} options.redirectPath - Ruta a la que redirigir si el parámetro es inválido
 * @returns {Object} - Objeto con el parámetro y funciones relacionadas
 */
export function useRouteParams(options) {
  const route = useRoute()
  const router = useRouter()

  const { paramName, loadData, validateParam = (param) => !!param, redirectPath = "/" } = options

  // Obtener el valor del parámetro como computed para reactividad
  const paramValue = computed(() => route.params[paramName])

  // Función para validar y cargar datos
  const validateAndLoad = async () => {
    // Validar el parámetro
    if (!validateParam(paramValue.value)) {
      console.warn(`Parámetro inválido: ${paramName}=${paramValue.value}`)
      router.push(redirectPath)
      return false
    }

    // Cargar datos si el parámetro es válido
    try {
      await loadData(paramValue.value)
      return true
    } catch (error) {
      console.error(`Error al cargar datos con ${paramName}=${paramValue.value}:`, error)
      return false
    }
  }

  // Vigilar cambios en el parámetro para recargar datos
  watch(
    () => route.params[paramName],
    (newValue, oldValue) => {
      if (newValue !== oldValue) {
        validateAndLoad()
      }
    },
  )

  // Cargar datos iniciales al montar el componente
  onMounted(() => {
    validateAndLoad()
  })

  return {
    paramValue,
    validateAndLoad,
  }
}
