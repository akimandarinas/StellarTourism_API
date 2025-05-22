<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <slot></slot>
  </form>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  onSubmit: {
    type: Function,
    default: () => {}
  }
});

const emit = defineEmits(['submit']);

const handleSubmit = (event) => {
  if (props.onSubmit) {
    props.onSubmit(event);
  }
  emit('submit', event);
};
</script>
