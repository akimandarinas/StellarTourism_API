<template>
  <div :class="['loading-spinner', size]" role="status" aria-label="Cargando...">
    <div class="spinner"></div>
    <span v-if="text" class="spinner-text">{{ text }}</span>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    text: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 3px solid rgba(124, 58, 237, 0.2);
  border-radius: 50%;
  border-top: 3px solid var(--color-primary, #7c3aed);
  animation: spin 1s linear infinite;
}

.spinner-text {
  margin-top: 0.75rem;
  color: var(--color-text-secondary, #4a5568);
  font-size: 0.875rem;
}

/* Tamaños */
.sm .spinner {
  width: 1.5rem;
  height: 1.5rem;
}

.md .spinner {
  width: 2.5rem;
  height: 2.5rem;
}

.lg .spinner {
  width: 3.5rem;
  height: 3.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
