<template>
  <div class="input-wrapper" :class="{ 'input-error': error }">
    <div v-if="$slots.prefix" class="input-prefix">
      <slot name="prefix"></slot>
    </div>
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="input"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
      :id="id"
      v-bind="$attrs"
    />
    <div v-if="$slots.suffix" class="input-suffix">
      <slot name="suffix"></slot>
    </div>
  </div>
  <div v-if="error" :id="`${id}-error`" class="input-error-message" role="alert">
    {{ error }}
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
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
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--color-background, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 0.375rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.input-wrapper:focus-within {
  border-color: var(--color-primary, #6366f1);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.input-wrapper.input-error {
  border-color: var(--color-error, #ef4444);
}

.input-wrapper.input-error:focus-within {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  background-color: transparent;
  border: none;
  outline: none;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text, #374151);
}

.input::placeholder {
  color: var(--color-text-secondary, #9ca3af);
}

.input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.input-prefix,
.input-suffix {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  color: var(--color-text-secondary, #9ca3af);
}

.input-error-message {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-error, #ef4444);
}

/* Tema oscuro */
:root.dark .input-wrapper {
  background-color: var(--color-background-secondary, #1f2937);
  border-color: rgba(255, 255, 255, 0.1);
}

:root.dark .input {
  color: var(--color-text, rgba(255, 255, 255, 0.9));
}

:root.dark .input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
</style>
