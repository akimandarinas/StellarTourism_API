<template>
  <div class="select-wrapper" :class="{ 'select-error': error }">
    <select
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="select"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
      :id="id"
      v-bind="$attrs"
    >
      <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
      <slot></slot>
    </select>
    <div class="select-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  </div>
  <div v-if="error" :id="`${id}-error`" class="select-error-message" role="alert">
    {{ error }}
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substring(2, 9)}`
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.select-wrapper {
  position: relative;
  background-color: var(--color-background, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 0.375rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.select-wrapper:focus-within {
  border-color: var(--color-primary, #6366f1);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.select-wrapper.select-error {
  border-color: var(--color-error, #ef4444);
}

.select-wrapper.select-error:focus-within {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.select {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 0.75rem;
  background-color: transparent;
  border: none;
  outline: none;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text, #374151);
  appearance: none;
}

.select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.select-icon {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text-secondary, #9ca3af);
}

.select-error-message {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-error, #ef4444);
}

/* Tema oscuro */
:root.dark .select-wrapper {
  background-color: var(--color-background-secondary, #1f2937);
  border-color: rgba(255, 255, 255, 0.1);
}

:root.dark .select {
  color: var(--color-text, rgba(255, 255, 255, 0.9));
}

:root.dark .select-icon {
  color: rgba(255, 255, 255, 0.5);
}
</style>
