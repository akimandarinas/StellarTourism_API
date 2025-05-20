<template>
  <td
    class="p-4 align-middle [&:has([role=checkbox])]:pr-0"
    :class="className"
  >
    <slot></slot>
  </td>
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: ''
  }
});
</script>
