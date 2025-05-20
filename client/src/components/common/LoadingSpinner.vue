<template>
  <div 
    :class="['loading-spinner', size]" 
    :aria-label="ariaLabel"
    role="status"
    :aria-live="ariaLive"
  >
    <div class="spinner-circle"></div>
    <span v-if="text" class="spinner-text">{{ text }}</span>
    <span v-if="text" class="sr-only">{{ text }}</span>
    <span v-else class="sr-only">Cargando...</span>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    text: {
      type: String,
      default: ''
    },
    ariaLabel: {
      type: String,
      default: 'Cargando'
    },
    ariaLive: {
      type: String,
      default: 'polite',
      validator: (value) => ['off', 'polite', 'assertive'].includes(value)
    }
  }
}
</script>

<style scoped>
.loading-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner-circle {
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: spin 0.75s linear infinite;
}

.spinner-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

/* Tamaños */
.small .spinner-circle {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}

.medium .spinner-circle {
  width: 2rem;
  height: 2rem;
  border-width: 3px;
}

.large .spinner-circle {
  width: 3rem;
  height: 3rem;
  border-width: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
