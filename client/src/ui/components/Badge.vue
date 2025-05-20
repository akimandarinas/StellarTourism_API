<template>
  <span 
    class="badge" 
    :class="[
      `badge-${variant}`,
      { 'badge-sm': size === 'sm', 'badge-lg': size === 'lg' }
    ]"
  >
    <slot></slot>
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'error', 'info', 'outline'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-full);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.badge-sm {
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
}

.badge-lg {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.badge-default {
  background-color: var(--color-background-secondary);
  color: var(--color-text);
}

.badge-primary {
  background-color: var(--color-primary);
  color: white;
}

.badge-success {
  background-color: var(--color-success);
  color: white;
}

.badge-warning {
  background-color: var(--color-warning);
  color: var(--color-text-dark);
}

.badge-error {
  background-color: var(--color-error);
  color: white;
}

.badge-info {
  background-color: var(--color-info);
  color: white;
}

.badge-outline {
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
</style>
