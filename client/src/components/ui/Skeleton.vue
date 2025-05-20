<template>
  <div 
    class="animate-pulse bg-gray-200 rounded"
    :class="[
      variant === 'circle' ? 'rounded-full' : 'rounded',
      className
    ]"
    :style="{ 
      width: width, 
      height: height 
    }"
  ></div>
</template>

<script setup>
defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '1rem'
  },
  variant: {
    type: String,
    default: 'rectangle',
    validator: (value) => ['rectangle', 'circle', 'text'].includes(value)
  },
  className: {
    type: String,
    default: ''
  }
});
</script>
