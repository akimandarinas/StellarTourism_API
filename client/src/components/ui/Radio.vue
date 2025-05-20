<template>
  <div class="radio-container">
    <label class="radio-wrapper" :for="radioId">
      <input
        :id="radioId"
        type="radio"
        :checked="modelValue === value"
        :disabled="disabled"
        :required="required"
        :name="name"
        :value="value"
        :aria-checked="modelValue === value ? 'true' : 'false'"
        :aria-describedby="getAriaDescribedBy"
        :aria-required="required ? 'true' : undefined"
        :aria-invalid="error ? 'true' : 'false'"
        :aria-disabled="disabled ? 'true' : undefined"
        class="radio-input"
        @change="$emit('update:modelValue', value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <span 
        class="radio-custom" 
        :class="{ 'radio-error': error }"
        aria-hidden="true"
      ></span>
      <span class="radio-label">
        <slot>{{ label }}</slot>
      </span>
    </label>
    
    <div 
      v-if="error" 
      :id="`${radioId}-error`" 
      class="radio-error-message" 
      role="alert"
    >
      {{ error }}
    </div>
    
    <div 
      v-if="helpText" 
      :id="`${radioId}-help`" 
      class="radio-help-text"
    >
      {{ helpText }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    required: true
  },
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  id: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  label: {
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
  helpText: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue', 'blur', 'focus']);

// Generar un ID único si no se proporciona uno
const uniqueId = ref(`radio-${Math.random().toString(36).substring(2, 11)}`);
const radioId = computed(() => props.id || uniqueId.value);

// Construir el atributo aria-describedby
const getAriaDescribedBy = computed(() => {
  const ids = [];
  
  if (props.error) {
    ids.push(`${radioId.value}-error`);
  }
  
  if (props.helpText) {
    ids.push(`${radioId.value}-help`);
  }
  
  return ids.length > 0 ? ids.join(' ') : undefined;
});
</script>

<style scoped>
.radio-container {
  margin-bottom: 1rem;
}

.radio-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.radio-wrapper.radio-disabled {
  cursor: not-allowed;
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.radio-input:focus-visible + .radio-custom {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.radio-custom {
  position: relative;
  height: 1.25rem;
  width: 1.25rem;
  min-width: 1.25rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.radio-input:checked + .radio-custom {
  border-color: var(--color-primary);
}

.radio-custom:after {
  content: "";
  position: absolute;
  display: none;
  left: 0.3rem;
  top: 0.3rem;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--color-primary);
}

.radio-input:checked + .radio-custom:after {
  display: block;
}

.radio-input:disabled + .radio-custom {
  opacity: 0.7;
  background-color: var(--color-background-alt);
}

.radio-label {
  margin-left: 0.5rem;
  font-size: 1rem;
  color: var(--color-text);
}

.radio-wrapper.radio-disabled .radio-label {
  opacity: 0.7;
}

.radio-error {
  border-color: var(--color-error);
}

.radio-error-message {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-error);
  padding-left: 1.75rem;
}

.radio-help-text {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  padding-left: 1.75rem;
}
</style>
