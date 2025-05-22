<template>
  <FormField :id="id" :label="label" :error="error" :description="description">
    <Select 
      :id="id"
      :name="name"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :disabled="disabled"
      :required="required"
      :class="{ 'border-red-500': error }"
    >
      <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
      <slot></slot>
    </Select>
  </FormField>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import FormField from './FormField.vue';
import Select from '../Select.vue';

defineProps({
  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substring(2, 9)}`
  },
  name: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [String, Number],
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
  description: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);
</script>
