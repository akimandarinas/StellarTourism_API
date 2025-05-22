<template>
  <component 
    :is="icon" 
    :size="size" 
    :stroke-width="strokeWidth" 
    :class="className"
  />
</template>

<script setup>
import { computed } from 'vue';
import * as icons from '@/utils/lucide-icons';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 24
  },
  strokeWidth: {
    type: [Number, String],
    default: 2
  },
  className: {
    type: String,
    default: ''
  }
});

const icon = computed(() => {
  return icons[props.name] || null;
});
</script>
