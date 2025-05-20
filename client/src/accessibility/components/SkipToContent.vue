<template>
  <a 
    href="#main-content" 
    class="skip-to-content"
    @click.prevent="skipToContent"
    @keydown.enter="skipToContent"
  >
    Saltar al contenido principal
  </a>
</template>

<script>
export default {
  name: 'SkipToContent',
  methods: {
    skipToContent() {
      const mainContent = document.getElementById('main-content')
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1')
        mainContent.focus()
        // Restaurar el scroll si es necesario
        window.scrollTo(0, mainContent.offsetTop)
      }
    }
  }
}
</script>

<style scoped>
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background-color: var(--color-primary, #4A90E2);
  color: white;
  z-index: 9999;
  transition: top 0.3s;
  text-decoration: none;
  font-weight: bold;
}

.skip-to-content:focus {
  top: 0;
  outline: 2px solid white;
  outline-offset: 2px;
}
</style>
