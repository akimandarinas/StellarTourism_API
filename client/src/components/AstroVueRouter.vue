<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { isClient } from '../utils/ssr-safe';
import { getRouter } from '../router'; // Ahora importa desde el archivo correcto

// Props para configurar el comportamiento del router
const props = defineProps({
  // Si es true, intercepta los clics en enlaces para usar Vue Router
  interceptLinks: {
    type: Boolean,
    default: true
  },
  // Selector para los enlaces que deben ser interceptados
  linkSelector: {
    type: String,
    default: 'a[href^="/app/"]'
  },
  // Si es true, actualiza la URL del navegador
  updateBrowserUrl: {
    type: Boolean,
    default: true
  },
  // Ruta inicial para SSR
  initialPath: {
    type: String,
    default: '/'
  }
});

// Estado para controlar si el componente está montado
const isMounted = ref(false);
const router = ref(null);

// Función para interceptar clics en enlaces
function handleLinkClick(event) {
  if (!isClient() || !props.interceptLinks || !router.value) return;
  
  // Verificar si el clic fue en un enlace que debemos interceptar
  const link = (event.target).closest(props.linkSelector);
  if (!link) return;
  
  // Verificar si el enlace es interno y debe ser manejado por Vue Router
  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return;
  
  // Prevenir la navegación predeterminada
  event.preventDefault();
  
  // Navegar usando Vue Router
  router.value.push(href);
}

// Montar el interceptor de enlaces
onMounted(() => {
  if (isClient()) {
    // Inicializar el router solo en el cliente
    router.value = getRouter();
    isMounted.value = true;
    
    if (props.interceptLinks) {
      document.addEventListener('click', handleLinkClick);
      
      // Si hay una ruta inicial, navegar a ella
      if (props.initialPath && router.value) {
        router.value.push(props.initialPath);
      }
    }
  }
});

// Limpiar el interceptor al desmontar
onUnmounted(() => {
  if (isClient() && props.interceptLinks) {
    document.removeEventListener('click', handleLinkClick);
  }
});

// Emitir eventos de cambio de ruta
const emit = defineEmits(['route-change']);

// Observar cambios en la ruta solo si estamos en el cliente y el router está inicializado
onMounted(() => {
  if (isClient() && router.value) {
    watch(() => router.value.currentRoute.value.fullPath, (newPath) => {
      emit('route-change', newPath);
    });
  }
});
</script>

<template>
  <div class="astro-vue-router">
    <router-view v-if="isMounted" />
    <slot v-else name="fallback">
      <div class="router-loading">
        Cargando...
      </div>
    </slot>
  </div>
</template>

<style scoped>
.astro-vue-router {
  display: contents;
}

.router-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #666;
}
</style>
