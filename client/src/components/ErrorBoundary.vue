<template>
  <div>
    <div v-if="error" class="error-boundary">
      <div class="error-content">
        <h2 class="error-title">{{ title }}</h2>
        <p class="error-message">{{ error.message }}</p>
        
        <div v-if="showDetails" class="error-details">
          <pre>{{ errorDetails }}</pre>
        </div>
        
        <div class="error-actions">
          <button @click="retry" class="retry-button">
            Reintentar
          </button>
          <button v-if="showDetails" @click="toggleDetails" class="details-button">
            Ocultar detalles
          </button>
          <button v-else @click="toggleDetails" class="details-button">
            Mostrar detalles
          </button>
        </div>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured } from 'vue';

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'Ha ocurrido un error'
  },
  onError: {
    type: Function,
    default: null
  },
  onRetry: {
    type: Function,
    default: null
  }
});

// Estado
const error = ref<Error | null>(null);
const showDetails = ref(false);

// Detalles del error
const errorDetails = computed(() => {
  if (!error.value) return '';
  
  return JSON.stringify({
    name: error.value.name,
    message: error.value.message,
    stack: error.value.stack,
  }, null, 2);
});

// Capturar errores
onErrorCaptured((err, instance, info) => {
  error.value = err as Error;
  
  // Llamar al callback onError si existe
  if (props.onError) {
    props.onError(err, instance, info);
  }
  
  // Evitar que el error se propague
  return false;
});

// Reintentar
const retry = () => {
  error.value = null;
  
  // Llamar al callback onRetry si existe
  if (props.onRetry) {
    props.onRetry();
  }
};

// Alternar detalles
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>

<style scoped>
.error-boundary {
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid #f56565;
  border-radius: 0.5rem;
  background-color: #fff5f5;
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-title {
  margin: 0;
  color: #c53030;
  font-size: 1.25rem;
  font-weight: 600;
}

.error-message {
  margin: 0;
  color: #2d3748;
}

.error-details {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #edf2f7;
  border-radius: 0.25rem;
  overflow-x: auto;
}

.error-details pre {
  margin: 0;
  font-size: 0.875rem;
  white-space: pre-wrap;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.retry-button {
  padding: 0.5rem 1rem;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #2c5282;
}

.details-button {
  padding: 0.5rem 1rem;
  background-color: #e2e8f0;
  color: #2d3748;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.details-button:hover {
  background-color: #cbd5e0;
}
</style>
