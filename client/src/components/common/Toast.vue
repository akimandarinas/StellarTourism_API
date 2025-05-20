<template>
  <div 
    class="toast"
    :class="[
      `toast-${variant}`,
      { 'toast-with-icon': $slots.icon || icon }
    ]"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
  >
    <div v-if="$slots.icon || icon" class="toast-icon">
      <slot name="icon">
        <component :is="icon" v-if="icon" />
      </slot>
    </div>
    
    <div class="toast-content">
      <div v-if="title" class="toast-title">{{ title }}</div>
      <div class="toast-message">
        <slot>{{ message }}</slot>
      </div>
    </div>
    
    <button v-if="dismissible" class="toast-close" @click="$emit('close')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'error', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  icon: {
    type: Object,
    default: null
  },
  dismissible: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);
</script>

<style scoped>
.toast {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: var(--border-radius-md);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-md);
  margin-bottom: 1rem;
  max-width: 350px;
  width: 100%;
  animation: toast-in 0.3s ease-out;
}

.toast-with-icon {
  padding-left: 0.75rem;
}

.toast-default {
  border-left: 4px solid var(--color-text-secondary);
}

.toast-primary {
  border-left: 4px solid var(--color-primary);
}

.toast-success {
  border-left: 4px solid var(--color-success);
}

.toast-warning {
  border-left: 4px solid var(--color-warning);
}

.toast-error {
  border-left: 4px solid var(--color-error);
}

.toast-info {
  border-left: 4px solid var(--color-info);
}

.toast-icon {
  flex-shrink: 0;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.toast-primary .toast-icon {
  color: var(--color-primary);
}

.toast-success .toast-icon {
  color: var(--color-success);
}

.toast-warning .toast-icon {
  color: var(--color-warning);
}

.toast-error .toast-icon {
  color: var(--color-error);
}

.toast-info .toast-icon {
  color: var(--color-info);
}

.toast-content {
  flex-grow: 1;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text);
}

.toast-message {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.toast-close {
  flex-shrink: 0;
  margin-left: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  opacity: 0.7;
  transition: opacity 0.2s ease;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  opacity: 1;
}

@keyframes toast-in {
  from {
    transform: translateY(1rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
