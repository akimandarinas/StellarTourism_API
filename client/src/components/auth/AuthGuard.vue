<template>
  <div>
    <LoadingSpinner v-if="loading" />
    <div v-else-if="isRedirecting" class="auth-redirect" role="alert" aria-live="assertive">
      <p>Redirigiendo a la página de inicio de sesión...</p>
    </div>
    <slot v-else-if="isAuthorized" />
    <div v-else class="auth-error" role="alert">
      <p>No tienes permiso para acceder a esta página.</p>
      <Button @click="redirectToLogin" variant="primary" class="mt-4">
        Iniciar sesión
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import Button from '../ui/Button.vue';

//Intentar importar el router y la ruta, pero no fallar si no están disponibles
let useRouter, useRoute;
try {
  const vueRouter = await import('vue-router');
  useRouter = vueRouter.useRouter;
  useRoute = vueRouter.useRoute;
} catch (e) {
  console.log('Vue Router no está disponible, usando modo Astro');
}

//Intentar importar el servicio de autenticación
let authService;
try {
  const authModule = await import('../../services/auth/auth-service');
  authService = authModule.authService;
} catch (e) {
  console.log('Servicio de autenticación no disponible, usando modo mock');
  authService = {
    getCurrentUser: () => {
      return { uid: 'astro-user', roles: ['user'] };
    },
    onAuthStateChanged: (callback) => {
      callback({ uid: 'astro-user', roles: ['user'] });
      return () => {}; // Función de limpieza
    }
  };
}

const props = defineProps({
  requireAuth: {
    type: Boolean,
    default: true
  },
  redirectTo: {
    type: String,
    default: '/login'
  },
  roles: {
    type: Array as () => string[],
    default: () => []
  }
});

//Obtener el router y la ruta si están disponibles
const router = useRouter ? useRouter() : null;
const route = useRoute ? useRoute() : { path: '/reservas', query: {} };

const loading = ref(true);
const isAuthorized = ref(false);
const isRedirecting = ref(false);
const unsubscribe = ref<(() => void) | null>(null);

const hasRequiredRoles = computed(() => {
  const user = authService.getCurrentUser();
  
  if (!props.roles.length) return true;
  if (!user || !user.roles) return false;
  
  return props.roles.some(role => user.roles?.includes(role));
});

//Redirigir a la página de inicio de sesión
const redirectToLogin = () => {
  if (router) {
    // Si estamos en Vue Router, usar el router para redirigir
    const currentQuery = { ...route.query };
    const redirectQuery = { 
      redirect: route.path,
      ...currentQuery
    };
    
    delete redirectQuery.redirect;
    
    router.replace({
      path: props.redirectTo,
      query: { 
        redirect: route.path,
        ...redirectQuery
      }
    });
  } else {
    //Si estamos en Astro, usar window.location
    window.location.href = props.redirectTo;
  }
};

// Verificar autorización
const checkAuthorization = () => {
  loading.value = true;
  
  const user = authService.getCurrentUser();
  
  if (props.requireAuth && !user) {
    // Redirigir si se requiere autenticación pero el usuario no está autenticado
    isAuthorized.value = false;
    isRedirecting.value = true;
    
    // Usar setTimeout para permitir que el componente muestre el estado de redirección
    setTimeout(() => {
      redirectToLogin();
    }, 500);
  } else if (props.requireAuth && !hasRequiredRoles.value) {
    isAuthorized.value = false;
    isRedirecting.value = false;
  } else {
    isAuthorized.value = true;
    isRedirecting.value = false;
  }
  
  loading.value = false;
};

onMounted(() => {
  if (authService && authService.onAuthStateChanged) {
    unsubscribe.value = authService.onAuthStateChanged(() => {
      checkAuthorization();
    });
  }
  
  checkAuthorization();
});

if (route && watch) {
  watch(() => route.path, () => {
    checkAuthorization();
  });
}

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});
</script>

<style scoped>
.auth-redirect, .auth-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 200px;
}

.auth-error {
  color: var(--color-error, #dc2626);
}

.mt-4 {
  margin-top: 1rem;
}
</style>
