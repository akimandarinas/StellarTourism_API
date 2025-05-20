<template>
  <div class="checkbox-wrapper">
    <input
      type="checkbox"
      :id="id"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="checkbox-input"
      :disabled="disabled"
      :required="required"
      v-bind="$attrs"
    />
    <label :for="id" class="checkbox-label">
      <span class="checkbox-control">
        <svg
          v-if="modelValue"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="checkbox-icon"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
      <span class="checkbox-text">
        <slot></slot>
      </span>
    </label>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: () => `checkbox-${Math.random().toString(36).substring(2, 9)}`
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-input:disabled + .checkbox-label {
  opacity: 0.7;
  cursor: not-allowed;
}

.checkbox-control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-border, #d1d5db);
  border-radius: 0.25rem;
  background-color: var(--color-background, #ffffff);
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-label .checkbox-control {
  background-color: var(--color-primary, #6366f1);
  border-color: var(--color-primary, #6366f1);
}

.checkbox-input:focus + .checkbox-label .checkbox-control {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
}

.checkbox-icon {
  color: white;
}

.checkbox-text {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text, #374151);
}

/* Tema oscuro */
:root.dark .checkbox-control {
  background-color: var(--color-background-secondary, #1f2937);
  border-color: rgba(255, 255, 255, 0.2);
}

:root.dark .checkbox-text {
  color: var(--color-text, rgba(255, 255, 255, 0.9));
}
</style>
