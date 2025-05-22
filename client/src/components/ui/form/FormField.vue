<template>
  <div class="space-y-2">
    <label v-if="label" :for="id" class="block text-sm font-medium">
      {{ label }}
    </label>
    <slot></slot>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <p v-if="description" class="text-sm text-gray-500">{{ description }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { computed } from 'vue';

const props = defineProps({
  id: {
    type: String,
    default: () => `field-${Math.random().toString(36).substring(2, 9)}`
  },
  name: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
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
</script>
