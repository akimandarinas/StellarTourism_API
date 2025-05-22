<template>
  <div class="select-container" :class="{ 'is-disabled': disabled, 'has-error': error }">
    <label v-if="label" :for="id" class="select-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    
    <div class="select-wrapper">
      <select
        :id="id"
        v-model="localValue"
        class="select-input"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${id}-error` : undefined"
        @change="handleChange"
        @blur="handleBlur"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <slot></slot>
      </select>
      
      <div class="select-icon">
        <ChevronDownIcon size="16" />
      </div>
    </div>
    
    <div v-if="error" :id="`${id}-error`" class="select-error" role="alert">
      {{ error }}
    </div>
    
    <div v-if="helpText && !error" class="select-help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ChevronDownIcon } from '@/utils/lucide-adapter';
import { generateId } from '../../utils/id';

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Seleccionar...'
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
  },
  id: {
    type: String,
    default: () => `select-${generateId()}`
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'blur']);

const localValue = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
});

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

const handleChange = (event) => {
  emit('change', event);
};

const handleBlur = (event) => {
  emit('blur', event);
};
</script>

<style scoped>
.select-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
}

.select-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.required-indicator {
  color: var(--color-error);
  margin-left: 0.25rem;
}

.select-wrapper {
  position: relative;
}

.select-input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  appearance: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text-secondary);
}

.select-error {
  font-size: 0.75rem;
  color: var(--color-error);
  margin-top: 0.25rem;
}

.select-help-text {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.is-disabled .select-input {
  background-color: var(--color-background-disabled);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.has-error .select-input {
  border-color: var(--color-error);
}

.has-error .select-input:focus {
  box-shadow: 0 0 0 2px rgba(var(--color-error-rgb), 0.2);
}
</style>
