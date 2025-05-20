<template>
  <!-- Este componente no renderiza nada visible -->
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  resources: {
    type: Array,
    default: () => []
  },
  enabled: {
    type: Boolean,
    default: true
  }
});

// Recursos críticos por defecto
const defaultResources = [
  '/fonts/Inter-Regular.woff2',
  '/fonts/Inter-Bold.woff2',
  '/images/logo.svg',
  '/images/hero-background.jpg'
];

// Combinar recursos personalizados con los predeterminados
const allResources = [...defaultResources, ...props.resources];

// Crear y añadir link preload
const createPreloadLink = (href, as = 'image') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  // Determinar el tipo de recurso basado en la extensión
  if (href.endsWith('.woff2')) {
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
  } else if (href.endsWith('.js')) {
    link.as = 'script';
  } else if (href.endsWith('.css')) {
    link.as = 'style';
  } else if (href.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
    link.as = 'image';
  }
  
  document.head.appendChild(link);
  return link;
};

// Crear y añadir link prefetch para rutas
const createPrefetchLink = (href) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
  return link;
};

// Rutas comunes que podrían ser prefetch
const commonRoutes = [
  '/destinos',
  '/naves',
  '/login',
  '/register'
];

let createdLinks = ref([]);
let isEnabled = ref(false);

onMounted(() => {
  isEnabled.value = props.enabled;

  if (isEnabled.value) {
    // Precargar recursos críticos
    allResources.forEach(resource => {
      const link = createPreloadLink(resource);
      createdLinks.value.push(link);
    });
    
    // Prefetch rutas comunes
    const route = useRoute();
    commonRoutes.forEach(path => {
      // No hacer prefetch de la ruta actual
      if (route.path !== path) {
        const link = createPrefetchLink(path);
        createdLinks.value.push(link);
      }
    });
  }
});

onBeforeUnmount(() => {
  // Limpiar los links creados
  createdLinks.value.forEach(link => {
    if (document.head.contains(link)) {
      document.head.removeChild(link);
    }
  });
  createdLinks.value = [];
});
</script>
