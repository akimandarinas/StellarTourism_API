<template>
  <FormField :id="id" :label="label" :error="error" :description="description">
    <Input 
      :id="id"
      :name="name"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="{ 'border-red-500': error }"
    />
  </FormField>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import FormField from './FormField.vue';
import Input from '../Input.vue';

defineProps({
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
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
  description: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);
</script>
