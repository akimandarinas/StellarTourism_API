"use client"

/**
 * Composable para gestionar estado de formularios
 * Este archivo implementa un patrón de estado específico para formularios
 * para garantizar un manejo consistente del estado en formularios
 */
import { ref, reactive, computed } from "vue"
import { useState } from "./useState"
import { debounce } from "../utils/common-functions"

/**
 * Crea un estado de formulario con validación y seguimiento de cambios
 * @param {Object|Function} initialValues - Valores iniciales o función que los devuelve
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - Estado y métodos para gestionar el formulario
 */
export function useFormState(initialValues = {}, options = {}) {
  const {
    validationSchema = {},
    onSubmit = null,
    onChange = null,
    onReset = null,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    persistent = false,
    storageKey = null,
    storageType = "local",
    debounceValidation = 300,
    transformers = {},
  } = options

  // Crear estado base
  const {
    state: values,
    errors: validationErrors,
    isDirty,
    update: updateValue,
    updateMultiple: updateValues,
    reset: resetValues,
    validate: validateField,
    validateAll,
  } = useState(initialValues, {
    persistent,
    storageKey,
    storageType,
    onChange,
    onReset,
    validators: validationSchema,
    transformers,
  })

  // Estado adicional específico de formularios
  const touched = reactive({})
  const isSubmitting = ref(false)
  const isValidating = ref(false)
  const submitCount = ref(0)
  const submitError = ref(null)
  const submitResult = ref(null)

  // Validación con debounce
  const debouncedValidation = debounce((field) => {
    validateField(field)
    isValidating.value = false
  }, debounceValidation)

  /**
   * Maneja el cambio de un campo
   * @param {Event|string} fieldOrEvent - Evento o nombre del campo
   * @param {any} value - Valor del campo (opcional si se pasa un evento)
   */
  const handleChange = (fieldOrEvent, value) => {
    let field
    let newValue

    if (typeof fieldOrEvent === "string") {
      field = fieldOrEvent
      newValue = value
    } else {
      field = fieldOrEvent.target.name
      newValue = fieldOrEvent.target.type === "checkbox" ? fieldOrEvent.target.checked : fieldOrEvent.target.value
    }

    // Actualizar valor
    updateValue(field, newValue)

    // Marcar como tocado
    touched[field] = true

    // Validar si es necesario
    if (validateOnChange && validationSchema[field]) {
      isValidating.value = true
      debouncedValidation(field)
    }
  }

  /**
   * Maneja el evento blur de un campo
   * @param {Event|string} fieldOrEvent - Evento o nombre del campo
   */
  const handleBlur = (fieldOrEvent) => {
    const field = typeof fieldOrEvent === "string" ? fieldOrEvent : fieldOrEvent.target.name

    // Marcar como tocado
    touched[field] = true

    // Validar si es necesario
    if (validateOnBlur && validationSchema[field]) {
      isValidating.value = true
      validateField(field)
      isValidating.value = false
    }
  }

  /**
   * Maneja el envío del formulario
   * @param {Event} event - Evento de envío
   * @returns {Promise<any>} - Resultado del envío
   */
  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault()
    }

    submitCount.value++
    isSubmitting.value = true
    submitError.value = null
    submitResult.value = null

    try {
      // Validar formulario si es necesario
      if (validateOnSubmit) {
        isValidating.value = true
        const isValid = validateAll()
        isValidating.value = false

        if (!isValid) {
          throw new Error("El formulario contiene errores")
        }
      }

      // Enviar formulario
      if (onSubmit) {
        const result = await onSubmit(values)
        submitResult.value = result
        return result
      }

      return values
    } catch (error) {
      submitError.value = error.message || "Error al enviar el formulario"
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Establece el valor de un campo
   * @param {string} field - Nombre del campo
   * @param {any} value - Valor del campo
   * @param {boolean} shouldValidate - Indica si se debe validar el campo
   */
  const setFieldValue = (field, value, shouldValidate = true) => {
    updateValue(field, value)

    if (shouldValidate && validationSchema[field]) {
      isValidating.value = true
      validateField(field)
      isValidating.value = false
    }
  }

  /**
   * Establece el error de un campo
   * @param {string} field - Nombre del campo
   * @param {string} error - Mensaje de error
   */
  const setFieldError = (field, error) => {
    validationErrors[field] = error
  }

  /**
   * Establece el estado touched de un campo
   * @param {string} fiel  = error;
  };
  
  /**
   * Establece el estado touched de un campo
   * @param {string} field - Nombre del campo
   * @param {boolean} isTouched - Indica si el campo ha sido tocado
   */
  const setFieldTouched = (field, isTouched = true) => {
    touched[field] = isTouched
  }

  /**
   * Establece múltiples valores a la vez
   * @param {Object} newValues - Nuevos valores
   * @param {boolean} shouldValidate - Indica si se deben validar los campos
   */
  const setValues = (newValues, shouldValidate = true) => {
    updateValues(newValues)

    if (shouldValidate && Object.keys(validationSchema).length > 0) {
      isValidating.value = true
      validateAll()
      isValidating.value = false
    }
  }

  /**
   * Establece múltiples errores a la vez
   * @param {Object} newErrors - Nuevos errores
   */
  const setErrors = (newErrors) => {
    Object.entries(newErrors).forEach(([field, error]) => {
      validationErrors[field] = error
    })
  }

  /**
   * Establece múltiples estados touched a la vez
   * @param {Object} newTouched - Nuevos estados touched
   */
  const setTouched = (newTouched) => {
    Object.entries(newTouched).forEach(([field, isTouched]) => {
      touched[field] = isTouched
    })
  }

  /**
   * Resetea el formulario a sus valores iniciales
   * @param {Object} newInitialValues - Nuevos valores iniciales (opcional)
   */
  const resetForm = (newInitialValues = undefined) => {
    // Resetear valores
    resetValues()

    // Si se proporcionan nuevos valores iniciales, establecerlos
    if (newInitialValues) {
      setValues(newInitialValues, false)
    }

    // Resetear errores y touched
    Object.keys(validationErrors).forEach((key) => {
      delete validationErrors[key]
    })

    Object.keys(touched).forEach((key) => {
      delete touched[key]
    })

    // Resetear estado
    isSubmitting.value = false
    isValidating.value = false
    submitError.value = null
    submitResult.value = null
  }

  // Computed properties
  const isValid = computed(() => Object.keys(validationErrors).length === 0)
  const isInvalid = computed(() => !isValid.value)
  const isTouched = computed(() => Object.keys(touched).length > 0)
  const isAllTouched = computed(() => {
    const valueKeys = Object.keys(values)
    const touchedKeys = Object.keys(touched)
    return valueKeys.length > 0 && valueKeys.every((key) => touchedKeys.includes(key))
  })

  return {
    // Estado
    values,
    errors: validationErrors,
    touched,
    isSubmitting,
    isValidating,
    submitCount,
    submitError,
    submitResult,
    isDirty,

    // Computed
    isValid,
    isInvalid,
    isTouched,
    isAllTouched,

    // Métodos
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues,
    setErrors,
    setTouched,
    resetForm,
    validateField,
    validateAll,
  }
}
