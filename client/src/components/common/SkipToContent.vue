<template>
  <a 
    href="#main-content" 
    class="skip-to-content"
    @focus="focused = true"
    @blur="focused = false"
    :class="{ 'is-focused': focused }"
  >
    Saltar al contenido principal
  </a>
</template>

<script>
export default {
  name: 'SkipToContent',
  data() {
    return {
      focused: false
    };
  }
};
</script>

<style scoped>
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: white;
  z-index: 100;
  transition: top 0.2s;
  border-radius: 0 0 4px 0;
  text-decoration: none;
  font-weight: 500;
}

.skip-to-content.is-focused {
  top: 0;
}
</style>
