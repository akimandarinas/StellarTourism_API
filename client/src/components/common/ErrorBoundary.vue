<template>
  <div>
    <div v-if="error" class="error-boundary">
      <div class="error-boundary-content">
        <h2 class="error-boundary-title">Ha ocurrido un error</h2>
        <p class="error-boundary-message">{{ errorMessage }}</p>
        <button 
          @click="resetError" 
          class="error-boundary-button"
        >
          Reintentar
        </button>
        <details v-if="showDetails" class="error-boundary-details">
          <summary>Detalles técnicos</summary>
          <pre>{{ errorDetails }}</pre>
        </details>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script>
import { ref, provide, onErrorCaptured, computed } from 'vue';

export default {
  name: 'ErrorBoundary',
  props: {
    showDetails: {
      type: Boolean,
      default: false
    },
    fallback: {
      type: Function,
      default: null
    }
  },
  setup(props, { slots }) {
    const error = ref(null);
    const errorInfo = ref(null);
    
    // Proporcionar una forma para que los componentes hijos reporten errores
    provide('reportError', (err, info) => {
      error.value = err;
      errorInfo.value = info;
    });
    
    // Capturar errores en componentes hijos
    onErrorCaptured((err, instance, info) => {
      console.error('Error capturado por ErrorBoundary:', err);
      error.value = err;
      errorInfo.value = info;
      
      // Evitar que el error se propague hacia arriba
      return false;
    });
    
    // Mensaje de error formateado
    const errorMessage = computed(() => {
      if (!error.value) return '';
      
      if (typeof error.value === 'string') {
        return error.value;
      }
      
      return error.value.message || 'Error desconocido';
    });
    
    // Detalles técnicos del error
    const errorDetails = computed(() => {
      if (!error.value) return '';
      
      let details = '';
      
      if (error.value.stack) {
        details += error.value.stack;
      }
      
      if (errorInfo.value) {
        details += '\n\nInfo: ' + JSON.stringify(errorInfo.value, null, 2);
      }
      
      return details;
    });
    
    // Función para reiniciar el error
    const resetError = () => {
      error.value = null;
      errorInfo.value = null;
    };
    
    return {
      error,
      errorInfo,
      errorMessage,
      errorDetails,
      resetError
    };
  }
};
</script>

<style scoped>
.error-boundary {
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid var(--color-error, #ef4444);
  border-radius: 0.5rem;
  background-color: var(--color-error-light, #fee2e2);
}

.error-boundary-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.error-boundary-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-error-dark, #b91c1c);
  margin: 0;
}

.error-boundary-message {
  margin: 0;
  color: var(--color-error-text, #7f1d1d);
}

.error-boundary-button {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background-color: var(--color-error, #ef4444);
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.error-boundary-button:hover {
  background-color: var(--color-error-dark, #b91c1c);
}

.error-boundary-details {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.25rem;
}

.error-boundary-details summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--color-error-dark, #b91c1c);
}

.error-boundary-details pre {
  margin: 0.5rem 0 0;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
  overflow-x: auto;
  font-size: 0.875rem;
  white-space: pre-wrap;
}
</style>
