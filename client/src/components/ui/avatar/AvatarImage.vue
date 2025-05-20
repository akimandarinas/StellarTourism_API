<template>
  <img
    v-if="src"
    :src="src"
    :alt="alt"
    :class="['aspect-square h-full w-full', props.class]"
    @error="onError"
  />
  <slot v-else></slot>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['error']);

const onError = (e) => {
  emit('error', e);
};
</script>
