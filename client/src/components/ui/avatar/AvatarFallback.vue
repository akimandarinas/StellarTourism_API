<template>
  <div
    :class="[
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      props.class
    ]"
  >
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
