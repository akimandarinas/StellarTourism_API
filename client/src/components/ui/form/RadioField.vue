<template>
  <div class="flex items-start space-x-2">
    <Radio 
      :id="id"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      @change="$emit('update:modelValue', value)"
      :disabled="disabled"
      :required="required"
      :class="{ 'border-red-500': error }"
    />
    <div class="grid gap-1.5 leading-none">
      <label v-if="label" :for="id" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {{ label }}
      </label>
      <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
      <p v-if="description" class="text-sm text-gray-500">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import Radio from '../Radio.vue';

defineProps({
  id: {
    type: String,
    default: () => `radio-${Math.random().toString(36).substring(2, 9)}`
  },
  name: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  modelValue: {
    type: [String, Number, Boolean],
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
