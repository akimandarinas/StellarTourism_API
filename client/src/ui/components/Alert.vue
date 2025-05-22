<template>
  <div 
    class="alert" 
    :class="`alert-${variant}`"
    role="alert"
  >
    <div class="alert-icon" v-if="icon">
      <component :is="iconComponent" size="16" />
    </div>
    <div class="alert-content">
      <div v-if="title" class="alert-title">{{ title }}</div>
      <div class="alert-message">
        <slot></slot>
      </div>
    </div>
    <button 
      v-if="dismissible" 
      class="alert-dismiss" 
      @click="$emit('dismiss')"
      aria-label="Cerrar"
    >
      <XIcon size="14" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  AlertCircleIcon, 
  CheckCircleIcon, 
  InfoIcon, 
  AlertTriangleIcon,
  XIcon
} from '@/utils/lucide-adapter';

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: Boolean,
    default: true
  },
  dismissible: {
    type: Boolean,
    default: false
  }
});

defineEmits(['dismiss']);

const iconComponent = computed(() => {
  const icons = {
    info: InfoIcon,
    success: CheckCircleIcon,
    warning: AlertTriangleIcon,
    error: AlertCircleIcon
  };
  
  return icons[props.variant];
});
</script>

<style scoped>
.alert {
  display: flex;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-sm);
  margin-bottom: 1rem;
}

.alert-icon {
  flex-shrink: 0;
  margin-right: 0.75rem;
  display: flex;
  align-items: flex-start;
  padding-top: 0.125rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert-message {
  font-size: 0.875rem;
}

.alert-dismiss {
  flex-shrink: 0;
  margin-left: 0.75rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.alert-dismiss:hover {
  opacity: 1;
}

.alert-info {
  background-color: rgba(var(--color-info-rgb), 0.1);
  border-left: 3px solid var(--color-info);
}

.alert-info .alert-icon,
.alert-info .alert-title {
  color: var(--color-info);
}

.alert-success {
  background-color: rgba(var(--color-success-rgb), 0.1);
  border-left: 3px solid var(--color-success);
}

.alert-success .alert-icon,
.alert-success .alert-title {
  color: var(--color-success);
}

.alert-warning {
  background-color: rgba(var(--color-warning-rgb), 0.1);
  border-left: 3px solid var(--color-warning);
}

.alert-warning .alert-icon,
.alert-warning .alert-title {
  color: var(--color-warning);
}

.alert-error {
  background-color: rgba(var(--color-error-rgb), 0.1);
  border-left: 3px solid var(--color-error);
}

.alert-error .alert-icon,
.alert-error .alert-title {
  color: var(--color-error);
}
</style>
