<script setup lang="ts">
import { provide, reactive, readonly, onMounted, ref } from 'vue';
import { isClient } from '../utils/ssr-safe';

// Clave para el contexto SSR
export const SSR_CONTEXT_KEY = Symbol('ssr-context');

// Estado inicial para SSR
const initialState = ref<Record<string, any>>(
  isClient() && window.__INITIAL_STATE__ 
    ? window.__INITIAL_STATE__ 
    : {}
);

// Estado reactivo para SSR
const ssrState = reactive<Record<string, any>>(initialState.value);

// Función para actualizar el estado
function updateState(key: string, value: any) {
  ssrState[key] = value;
  
  // En el cliente, actualizar el estado global
  if (isClient()) {
    window.__INITIAL_STATE__ = window.__INITIAL_STATE__ || {};
    window.__INITIAL_STATE__[key] = value;
  }
}

// Proporcionar el contexto SSR a los componentes hijos
provide(SSR_CONTEXT_KEY, {
  state: readonly(ssrState),
  updateState
});

// Limpiar el estado inicial después de la hidratación
onMounted(() => {
  if (isClient() && window.__INITIAL_STATE__) {
    // Mantener el estado en memoria pero eliminar la variable global
    // para evitar fugas de memoria
    setTimeout(() => {
      delete window.__INITIAL_STATE__;
    }, 0);
  }
});
</script>

<template>
  <slot />
</template>

<script lang="ts">
// Declarar el tipo para la ventana global
declare global {
  interface Window {
    __INITIAL_STATE__?: Record<string, any>;
  }
}
</script>
