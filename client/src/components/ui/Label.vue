<template>
  <label
    :class="[
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    ]"
    :for="htmlFor"
    v-bind="$attrs"
  >
    <slot></slot>
  </label>
</template>

<script setup>
defineProps({
  htmlFor: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  }
});
</script>
