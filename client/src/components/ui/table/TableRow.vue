<template>
  <tr
    class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
    :class="className"
  >
    <slot></slot>
  </tr>
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: ''
  }
});
</script>
