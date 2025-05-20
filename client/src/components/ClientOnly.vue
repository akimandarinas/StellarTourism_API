<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const isMounted = ref(false);
    
    onMounted(() => {
      isMounted.value = true;
    });
    
    return {
      isMounted
    };
  }
};
</script>

<template>
  <template v-if="isMounted">
    <slot />
  </template>
  <template v-else>
    <slot name="fallback">
      <!-- Fallback content while component is mounting -->
      <div class="client-only-placeholder"></div>
    </slot>
  </template>
</template>

<style scoped>
.client-only-placeholder {
  min-height: 1rem;
}
</style>
