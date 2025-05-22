<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        <AlertTriangleIcon size="32" />
      </div>
      <h3 class="error-title">Ha ocurrido un error</h3>
      <p class="error-message">{{ error.message || 'Se produjo un error inesperado.' }}</p>
      <div class="error-actions">
        <slot>
          <button @click="retry" class="retry-button">
            <RefreshCwIcon size="16" class="icon" />
            Reintentar
          </button>
        </slot>
      </div>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script>
import { ref, onErrorCaptured } from 'vue';
import { AlertTriangleIcon, RefreshCwIcon } from '@/utils/lucide-adapter';

export default {
  name: 'ErrorBoundary',
  components: {
    AlertTriangleIcon,
    RefreshCwIcon
  },
  props: {
    error: {
      type: Error,
      default: null
    }
  },
  emits: ['retry'],
  setup(props, { emit }) {
    const localError = ref(null);
    
    onErrorCaptured((err) => {
      localError.value = err;
      return false; // Evitar que el error se propague
    });
    
    const retry = () => {
      localError.value = null;
      emit('retry');
    };
    
    return {
      localError,
      retry
    };
  }
}
</script>

<style scoped>
.error-boundary {
  padding: 2rem;
  border-radius: 0.5rem;
  background-color: #fff1f2;
  border: 1px solid #fecdd3;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.error-icon {
  color: #e11d48;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #be123c;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #9f1239;
  margin-bottom: 1.5rem;
}

.error-actions {
  display: flex;
  justify-content: center;
}

.retry-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #be123c;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #9f1239;
}

.icon {
  width: 1rem;
  height: 1rem;
}
</style>
