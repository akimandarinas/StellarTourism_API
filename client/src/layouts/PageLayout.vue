<template>
  <div class="page-layout">
    <div class="container mx-auto px-4 py-4">
      <nav aria-label="Migas de pan" v-if="showBreadcrumbs">
        <Breadcrumb :customRoutes="breadcrumbRoutes" />
      </nav>
      
      <h1 v-if="title" class="page-title" tabindex="-1">{{ title }}</h1>
      
      <div class="page-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Breadcrumb from '../components/common/Breadcrumb.vue';

const props = defineProps({
  // Título de la página
  title: {
    type: String,
    default: ''
  },
  // Si se deben mostrar los breadcrumbs
  showBreadcrumbs: {
    type: Boolean,
    default: true
  },
  // Rutas personalizadas para los breadcrumbs
  breadcrumbRoutes: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.page-layout {
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
}

.page-content {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }
}
</style>
