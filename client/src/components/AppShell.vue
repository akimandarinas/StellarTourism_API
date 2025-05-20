<template>
  <div class="app-shell">
    <ClientOnly>
      <AstroVueRouter :interceptLinks="true" :updateBrowserUrl="true">
        <template #fallback>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando aplicación...</p>
          </div>
        </template>
      </AstroVueRouter>
    </ClientOnly>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { isClient } from '../utils/ssr-safe';
import AstroVueRouter from './AstroVueRouter.vue';
import ClientOnly from './ClientOnly.vue';

// Estado para controlar si la aplicación está lista
const isAppReady = ref(false);

// Inicializar la aplicación solo en el cliente
onMounted(() => {
  if (isClient()) {
    // Inicializar la aplicación
    isAppReady.value = true;
    console.log('App Shell mounted');
  }
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #0070f3;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
