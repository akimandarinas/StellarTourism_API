<template>
  <option :value="value" v-bind="$attrs">
    <slot></slot>
  </option>
</template>

<script setup>
defineProps({
  value: {
    type: [String, Number],
    required: true
  }
});
</script>
