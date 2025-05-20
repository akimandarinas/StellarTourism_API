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
import { useRouter, useRoute } from 'vue-router';
import { authService } from '../../services/auth/auth-service';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import Button from '../ui/Button.vue';

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

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const isAuthorized = ref(false);
const isRedirecting = ref(false);
const unsubscribe = ref<(() => void) | null>(null);

// Verificar si el usuario tiene los roles requeridos
const hasRequiredRoles = computed(() => {
  const user = authService.getCurrentUser();
  
  if (!props.roles.length) return true;
  if (!user || !user.roles) return false;
  
  return props.roles.some(role => user.roles?.includes(role));
});

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
    // El usuario está autenticado pero no tiene los roles requeridos
    isAuthorized.value = false;
    isRedirecting.value = false;
  } else {
    isAuthorized.value = true;
    isRedirecting.value = false;
  }
  
  loading.value = false;
};

// Redirigir a la página de inicio de sesión
const redirectToLogin = () => {
  // Construir la URL de redirección preservando los parámetros de consulta actuales
  const currentQuery = { ...route.query };
  const redirectQuery = { 
    redirect: route.fullPath,
    ...currentQuery
  };
  
  // Evitar duplicar el parámetro redirect
  delete redirectQuery.redirect;
  
  router.replace({
    path: props.redirectTo,
    query: { 
      redirect: route.fullPath,
      ...redirectQuery
    }
  });
};

// Ciclo de vida
onMounted(() => {
  // Suscribirse a cambios en el estado de autenticación
  unsubscribe.value = authService.onAuthStateChanged(() => {
    checkAuthorization();
  });
  
  // Verificar autorización inicial
  checkAuthorization();
});

// Observar cambios en la ruta
watch(() => route.path, checkAuthorization);

// Limpiar suscripción al desmontar
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
