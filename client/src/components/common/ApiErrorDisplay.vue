<template>
  <div class="api-error" :class="severityClass">
    <div class="api-error-icon">
      <AlertCircleIcon v-if="severity === 'error'" />
      <AlertTriangleIcon v-else-if="severity === 'warning'" />
      <InfoIcon v-else />
    </div>
    <div class="api-error-content">
      <h3 v-if="title" class="api-error-title">{{ title }}</h3>
      <p class="api-error-message">{{ message }}</p>
      <div v-if="details && showDetails" class="api-error-details">
        <pre>{{ formattedDetails }}</pre>
      </div>
      <div v-if="hasActions" class="api-error-actions">
        <button 
          v-if="details && canShowDetails" 
          class="api-error-toggle-details" 
          @click="toggleDetails"
          type="button"
        >
          {{ showDetails ? 'Ocultar detalles' : 'Mostrar detalles' }}
        </button>
        <button 
          v-if="canRetry" 
          class="api-error-retry" 
          @click="$emit('retry')"
          type="button"
        >
          <RefreshCwIcon class="w-4 h-4 mr-1" />
          Reintentar
        </button>
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { AlertCircleIcon, AlertTriangleIcon, InfoIcon, RefreshCwIcon } from '@/utils/lucide-adapter';
import { ApiError } from '../../types/api';
import { getErrorMessage } from '../../utils/api-error-handler';
import { useSlots } from 'vue';

const props = defineProps({
  error: {
    type: Object as () => ApiError | Error | any,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    default: 'error',
    validator: (value: string) => ['info', 'warning', 'error'].includes(value)
  },
  canRetry: {
    type: Boolean,
    default: false
  },
  canShowDetails: {
    type: Boolean,
    default: process.env.NODE_ENV !== 'production'
  },
  defaultMessage: {
    type: String,
    default: 'Se ha producido un error inesperado'
  }
});

defineEmits(['retry']);

const showDetails = ref(false);
const $slots = useSlots();

// Extraer mensaje de error
const message = computed(() => {
  return getErrorMessage(props.error) || props.defaultMessage;
});

// Extraer detalles del error
const details = computed(() => {
  if (!props.error) return null;
  
  // Si el error tiene detalles específicos
  if (props.error.details) {
    return props.error.details;
  }
  
  // Si es un error de validación con errores por campo
  if (props.error.code === 'validation_error' && props.error.errors) {
    return props.error.errors;
  }
  
  // Si es un error estándar con stack trace
  if (props.error instanceof Error && props.error.stack) {
    return props.error.stack;
  }
  
  // Si el error tiene información de depuración
  if (props.error.debug) {
    return props.error.debug;
  }
  
  return null;
});

// Formatear detalles para mostrar
const formattedDetails = computed(() => {
  if (!details.value) return '';
  
  if (typeof details.value === 'string') {
    return details.value;
  }
  
  return JSON.stringify(details.value, null, 2);
});

// Clase CSS basada en la severidad
const severityClass = computed(() => {
  return `api-error--${props.severity}`;
});

// Verificar si hay acciones disponibles
const hasActions = computed(() => {
  return (props.details && props.canShowDetails) || props.canRetry || !!$slots.actions;
});

// Alternar visibilidad de detalles
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>

<style scoped>
.api-error {
  display: flex;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  gap: 1rem;
  align-items: flex-start;
}

.api-error--error {
  background-color: var(--color-error-bg, #fee2e2);
  border: 1px solid var(--color-error-border, #fecaca);
}

.api-error--warning {
  background-color: var(--color-warning-bg, #fef3c7);
  border: 1px solid var(--color-warning-border, #fde68a);
}

.api-error--info {
  background-color: var(--color-info-bg, #dbeafe);
  border: 1px solid var(--color-info-border, #bfdbfe);
}

.api-error-icon {
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.api-error--error .api-error-icon {
  color: var(--color-error, #dc2626);
}

.api-error--warning .api-error-icon {
  color: var(--color-warning, #d97706);
}

.api-error--info .api-error-icon {
  color: var(--color-info, #2563eb);
}

.api-error-content {
  flex: 1;
}

.api-error-title {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.api-error--error .api-error-title {
  color: var(--color-error, #dc2626);
}

.api-error--warning .api-error-title {
  color: var(--color-warning, #d97706);
}

.api-error--info .api-error-title {
  color: var(--color-info, #2563eb);
}

.api-error-message {
  margin: 0;
}

.api-error-details {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.25rem;
  overflow-x: auto;
}

.api-error-details pre {
  margin: 0;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.api-error-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.api-error-toggle-details,
.api-error-retry {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  border: 1px solid;
  background-color: transparent;
  transition: background-color 0.2s, color 0.2s;
}

.api-error-toggle-details {
  border-color: currentColor;
}

.api-error--error .api-error-toggle-details {
  color: var(--color-error, #dc2626);
}

.api-error--warning .api-error-toggle-details {
  color: var(--color-warning, #d97706);
}

.api-error--info .api-error-toggle-details {
  color: var(--color-info, #2563eb);
}

.api-error-retry {
  background-color: var(--color-primary, #3b82f6);
  color: white;
  border-color: var(--color-primary, #3b82f6);
}

.api-error-retry:hover {
  background-color: var(--color-primary-dark, #2563eb);
}

.api-error-toggle-details:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
