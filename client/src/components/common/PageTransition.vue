<template>
  <div class="page-transition-wrapper">
    <transition
      :name="transitionName"
      mode="out-in"
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <slot></slot>
    </transition>
    
    <!-- Indicador de carga global -->
    <div 
      v-if="isLoading" 
      class="global-loading-indicator"
      role="status"
      aria-live="polite"
    >
      <div class="loading-bar"></div>
      <span class="sr-only">Cargando página...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Estado
const isLoading = ref(false);
const transitionComplete = ref(true);

// Router y route
const router = useRouter();
const route = useRoute();

// Computed
const transitionName = computed(() => {
  // Si la transición anterior no ha terminado, usar fade para evitar problemas
  if (!transitionComplete.value) {
    return 'fade';
  }
  
  // Usar la transición definida en la ruta o fade por defecto
  return route.meta.transitionName || 'fade';
});

// Métodos para las transiciones
const beforeEnter = (el) => {
  transitionComplete.value = false;
  el.style.opacity = 0;
  
  // Anunciar para lectores de pantalla que la página está cargando
  announceForScreenReader('Cargando nueva página');
};

const enter = (el, done) => {
  // Forzar un reflow para que la transición funcione correctamente
  el.offsetHeight;
  
  setTimeout(() => {
    el.style.opacity = 1;
    done();
  }, 50);
};

const afterEnter = (el) => {
  transitionComplete.value = true;
  
  // Anunciar para lectores de pantalla que la página ha terminado de cargar
  announceForScreenReader('Página cargada completamente');
  
  // Establecer el foco en el contenido principal si existe
  const mainContent = document.querySelector('main h1') || document.querySelector('main');
  if (mainContent) {
    mainContent.setAttribute('tabindex', '-1');
    mainContent.focus();
    // Eliminar el tabindex después de establecer el foco
    setTimeout(() => {
      mainContent.removeAttribute('tabindex');
    }, 1000);
  }
};

const beforeLeave = (el) => {
  transitionComplete.value = false;
  el.style.opacity = 1;
};

const leave = (el, done) => {
  setTimeout(() => {
    el.style.opacity = 0;
    done();
  }, 50);
};

const afterLeave = () => {
  transitionComplete.value = true;
};

// Función para anunciar mensajes a lectores de pantalla
const announceForScreenReader = (message) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.classList.add('sr-only');
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Manejadores para eventos de navegación
const handleRouteChangeStart = () => {
  isLoading.value = true;
  announceForScreenReader('Navegando a nueva página');
};

const handleRouteChangeComplete = () => {
  isLoading.value = false;
};

const handleRouteChangeError = () => {
  isLoading.value = false;
  announceForScreenReader('Error al cargar la página');
};

// Registrar eventos de navegación
let removeBeforeEach, removeAfterEach, removeOnError;

onMounted(() => {
  removeBeforeEach = router.beforeEach((to, from, next) => {
    handleRouteChangeStart();
    next();
  });
  
  removeAfterEach = router.afterEach(() => {
    handleRouteChangeComplete();
  });
  
  removeOnError = router.onError(() => {
    handleRouteChangeError();
  });
});

onUnmounted(() => {
  // Limpiar eventos
  if (removeBeforeEach) removeBeforeEach();
  if (removeAfterEach) removeAfterEach();
  if (removeOnError) removeOnError();
});
</script>

<style>
.page-transition-wrapper {
  position: relative;
  min-height: 100vh;
}

/* Transición fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transición slide-left */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

/* Transición slide-right */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

/* Transición slide-up */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(30px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}

/* Indicador de carga global */
.global-loading-indicator {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 9999;
  pointer-events: none;
}

.loading-bar {
  height: 100%;
  width: 0;
  background: linear-gradient(to right, var(--color-primary), var(--color-primary-light));
  animation: loading-animation 2s infinite ease-in-out;
}

@keyframes loading-animation {
  0% {
    width: 0;
    left: 0;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Estilos para el indicador de carga a nivel de página */
body.page-loading::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, var(--color-primary), var(--color-primary-light));
  animation: loading-animation 2s infinite ease-in-out;
  z-index: 9999;
}
</style>
