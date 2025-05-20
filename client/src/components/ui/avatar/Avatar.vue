<template>
  <div :class="['relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', props.class]">
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  class: {
    type: String,
    default: ''
  }
});
</script>
