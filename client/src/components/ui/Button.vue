<template>
  <button
    :type="type"
    class="button"
    :class="[
      `variant-${variant}`,
      `size-${size}`,
      { 'button-full': fullWidth, 'button-loading': loading }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <span v-if="$slots.icon && iconPosition === 'left'" class="button-icon left">
      <slot name="icon"></slot>
    </span>
    <span class="button-content">
      <slot></slot>
    </span>
    <span v-if="$slots.icon && iconPosition === 'right'" class="button-icon right">
      <slot name="icon"></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost', 'link', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  iconPosition: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value)
  }
});
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tamaños */
.size-sm {
  height: 2rem;
  padding: 0 0.75rem;
  font-size: 0.75rem;
}

.size-md {
  height: 2.5rem;
  padding: 0 1rem;
  font-size: 0.875rem;
}

.size-lg {
  height: 3rem;
  padding: 0 1.5rem;
  font-size: 1rem;
}

/* Variantes */
.variant-primary {
  background: linear-gradient(90deg, var(--color-primary, #6366f1), var(--color-primary-light, #818cf8));
  color: white;
  border: none;
  box-shadow: 0 2px 5px rgba(99, 102, 241, 0.3);
}

.variant-primary:hover:not(:disabled) {
  background: linear-gradient(90deg, var(--color-primary-dark, #4f46e5), var(--color-primary, #6366f1));
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

.variant-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.3);
}

.variant-secondary {
  background-color: var(--color-background-secondary, #f3f4f6);
  color: var(--color-text, #374151);
  border: 1px solid var(--color-border, #e5e7eb);
}

.variant-secondary:hover:not(:disabled) {
  background-color: var(--color-background, #ffffff);
  border-color: var(--color-primary, #6366f1);
  color: var(--color-primary, #6366f1);
}

.variant-outline {
  background-color: transparent;
  color: var(--color-primary, #6366f1);
  border: 1px solid var(--color-primary, #6366f1);
}

.variant-outline:hover:not(:disabled) {
  background-color: rgba(99, 102, 241, 0.1);
}

.variant-ghost {
  background-color: transparent;
  color: var(--color-text, #374151);
  border: none;
}

.variant-ghost:hover:not(:disabled) {
  background-color: var(--color-background-secondary, #f3f4f6);
}

.variant-link {
  background-color: transparent;
  color: var(--color-primary, #6366f1);
  border: none;
  padding: 0;
  height: auto;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.variant-link:hover:not(:disabled) {
  color: var(--color-primary-dark, #4f46e5);
}

.variant-danger {
  background-color: var(--color-error, #ef4444);
  color: white;
  border: none;
  box-shadow: 0 2px 5px rgba(239, 68, 68, 0.3);
}

.variant-danger:hover:not(:disabled) {
  background-color: var(--color-error-dark, #dc2626);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.variant-danger:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
}

/* Ancho completo */
.button-full {
  width: 100%;
}

/* Iconos */
.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-icon.left {
  margin-right: 0.5rem;
}

.button-icon.right {
  margin-left: 0.5rem;
}

/* Estado de carga */
.button-loading {
  color: transparent !important;
}

.loading-spinner {
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-right-color: transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tema oscuro */
:root.dark .variant-secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
}

:root.dark .variant-secondary:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: var(--color-primary, #6366f1);
}

:root.dark .variant-ghost {
  color: rgba(255, 255, 255, 0.9);
}

:root.dark .variant-ghost:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
