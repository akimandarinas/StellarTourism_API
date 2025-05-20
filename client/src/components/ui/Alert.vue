<template>
  <div :class="['alert', variantClass]" role="alert">
    <div v-if="$slots.icon" class="alert-icon">
      <slot name="icon"></slot>
    </div>
    <div class="alert-content">
      <div v-if="title" class="alert-title">{{ title }}</div>
      <div class="alert-description">
        <slot></slot>
      </div>
    </div>
    <button 
      v-if="dismissible" 
      @click="dismiss" 
      class="alert-dismiss" 
      aria-label="Cerrar alerta"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-dismiss-icon">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'info', 'success', 'warning', 'error'].includes(value)
  },
  dismissible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['dismiss']);

const isVisible = ref(true);

const variantClass = computed(() => {
  return {
    'alert-default': props.variant === 'default',
    'alert-info': props.variant === 'info',
    'alert-success': props.variant === 'success',
    'alert-warning': props.variant === 'warning',
    'alert-error': props.variant === 'error'
  };
});

const dismiss = () => {
  isVisible.value = false;
  emit('dismiss');
};
</script>

<style scoped>
.alert {
  position: relative;
  display: flex;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
}

.alert-icon {
  display: flex;
  align-items: flex-start;
  margin-right: 0.75rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert-description {
  font-size: 0.875rem;
  line-height: 1.5;
}

.alert-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  margin: -0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.alert-dismiss:hover {
  opacity: 1;
}

.alert-dismiss-icon {
  width: 1rem;
  height: 1rem;
}

/* Variantes */
.alert-default {
  background-color: var(--color-background-secondary, #f9fafb);
  border-color: var(--color-border, #e5e7eb);
  color: var(--color-text, #374151);
}

.alert-info {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.alert-success {
  background-color: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.alert-warning {
  background-color: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.alert-error {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* Tema oscuro */
:root.dark .alert-default {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}
</style>
