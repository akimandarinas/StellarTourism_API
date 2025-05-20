<template>
  <div :data-theme="theme" :data-reduced-motion="reducedMotion" :data-high-contrast="highContrast">
    <slot></slot>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, onUnmounted } from 'vue';
import { useUIStore } from '../../stores/ui';

const uiStore = useUIStore();

// Computed properties para los atributos de datos
const theme = computed(() => uiStore.theme);
const reducedMotion = computed(() => uiStore.reducedMotion ? 'true' : 'false');
const highContrast = computed(() => uiStore.highContrast ? 'true' : 'false');

// Inicializar preferencias del usuario
onMounted(() => {
  // Detectar preferencias del sistema
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Aplicar preferencias si no están ya establecidas
  if (!uiStore.themeInitialized) {
    uiStore.setTheme(prefersDarkMode ? 'dark' : 'light');
  }
  
  if (!uiStore.reducedMotionInitialized && prefersReducedMotion) {
    uiStore.setReducedMotion(true);
  }
  
  // Escuchar cambios en las preferencias del sistema
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  const handleDarkModeChange = (e) => {
    if (!uiStore.themeManuallySet) {
      uiStore.setTheme(e.matches ? 'dark' : 'light');
    }
  };
  
  const handleReducedMotionChange = (e) => {
    if (!uiStore.reducedMotionManuallySet) {
      uiStore.setReducedMotion(e.matches);
    }
  };
  
  darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
  reducedMotionMediaQuery.addEventListener('change', handleReducedMotionChange);
  
  // Limpiar event listeners
  onUnmounted(() => {
    darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
    reducedMotionMediaQuery.removeEventListener('change', handleReducedMotionChange);
  });
});

// Aplicar tema al elemento HTML para estilos globales
watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme);
}, { immediate: true });

watch(reducedMotion, (newValue) => {
  document.documentElement.setAttribute('data-reduced-motion', newValue);
}, { immediate: true });

watch(highContrast, (newValue) => {
  document.documentElement.setAttribute('data-high-contrast', newValue);
}, { immediate: true });
</script>
