<template>
  <div>
    <div class="flex justify-between items-center mb-1" v-if="showLabel || showValue">
      <div v-if="showLabel" class="text-sm font-medium text-gray-700">{{ label }}</div>
      <div v-if="showValue" class="text-sm font-medium text-gray-700">{{ value }}%</div>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        class="h-2.5 rounded-full transition-all duration-300 ease-in-out"
        :class="[color]"
        :style="{ width: `${value}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  label: {
    type: String,
    default: ''
  },
  showLabel: {
    type: Boolean,
    default: false
  },
  showValue: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'bg-primary-600'
  }
});
</script>
