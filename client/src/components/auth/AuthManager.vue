<template>
  <div class="auth-manager">
    <div v-if="isProcessing" class="auth-overlay">
      <div class="auth-loading">
        <LoadingSpinner size="lg" />
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <slot 
      :user="user" 
      :isAuthenticated="isAuthenticated" 
      :isLoading="isLoading"
      :login="login"
      :register="register"
      :logout="logout"
      :resetPassword="resetPassword"
    ></slot>
  </div>
</template>

<script>
import { ref, computed, onMounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { useToast } from '../../composables/useToast';

export default {
  name: 'AuthManager',
  components: {
    LoadingSpinner
  },
  props: {
    redirectTo: {
      type: String,
      default: '/'
    },
    showNotifications: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const router = useRouter();
    const authStore = useAuthStore();
    const toast = useToast();

    const isProcessing = ref(false);
    const loadingMessage = ref('Procesando...');
    const authError = ref(null);
    const lastAuthAction = ref(null);
    const maxRetries = ref(3);
    const retryCount = ref(0);

    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const isLoading = computed(() => authStore.loading);
    const user = computed(() => authStore.user);

    provide('isAuthenticated', isAuthenticated);
    provide('user', user);

    const setProcessing = (isActive, message = 'Procesando...') => {
      isProcessing.value = isActive;
      loadingMessage.value = message;
      
      if (!isActive) {
        retryCount.value = 0;
      }
    };

    const handleAuthError = (error, action) => {
      console.error(`Error de autenticación (${action}):`, error);
      authError.value = error;
      lastAuthAction.value = action;

      if (props.showNotifications) {
        let errorMessage = 'Ha ocurrido un error durante la autenticación';
        
        if (error.code) {
          switch (error.code) {
            case 'auth/user-not-found':
              errorMessage = 'No existe una cuenta con este correo electrónico';
              break;
            case 'auth/wrong-password':
              errorMessage = 'Contraseña incorrecta';
              break;
            case 'auth/email-already-in-use':
              errorMessage = 'Este correo electrónico ya está registrado';
              break;
            case 'auth/weak-password':
              errorMessage = 'La contraseña es demasiado débil';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Error de conexión. Verifica tu conexión a internet';
              
              // Intentar reintento automático para errores de red
              if (retryCount.value < maxRetries.value) {
                retryCount.value++;
                setTimeout(() => {
                  retryAuthAction();
                }, 2000 * retryCount.value); // Backoff exponencial
                
                errorMessage += `. Reintentando (${retryCount.value}/${maxRetries.value})...`;
              }
              break;
            default:
              errorMessage = error.message || errorMessage;
          }
        }
        
        toast.error('Error de autenticación', errorMessage);
      }
    };

    const retryAuthAction = async () => {
      if (!lastAuthAction.value) return;
      
      const action = lastAuthAction.value;
      const actionMap = {
        'login': login,
        'register': register,
        'logout': logout,
        'resetPassword': resetPassword
      };
      
      if (actionMap[action]) {
        await actionMap[action]();
      }
    };

    const login = async (email, password, rememberMe = false) => {
      try {
        setProcessing(true, 'Iniciando sesión...');
        lastAuthAction.value = 'login';
        
        const success = await authStore.login(email, password);
        
        if (success) {
          if (props.showNotifications) {
            toast.success('Inicio de sesión exitoso', '¡Bienvenido de nuevo!');
          }
          
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('lastEmail', email);
          } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('lastEmail');
          }
          
          //Redirigir al usuario
          router.push(props.redirectTo);
          return true;
        } else {
          throw new Error('Credenciales inválidas');
        }
      } catch (error) {
        handleAuthError(error, 'login');
        return false;
      } finally {
        setProcessing(false);
      }
    };

    const register = async (email, password, displayName) => {
      try {
        setProcessing(true, 'Creando cuenta...');
        lastAuthAction.value = 'register';
        
        const success = await authStore.register(email, password, displayName);
        
        if (success) {
          if (props.showNotifications) {
            toast.success('Registro exitoso', '¡Bienvenido a Stellar Tourism!');
          }
          
          router.push(props.redirectTo);
          return true;
        } else {
          throw new Error('No se pudo completar el registro');
        }
      } catch (error) {
        handleAuthError(error, 'register');
        return false;
      } finally {
        setProcessing(false);
      }
    };

    const logout = async () => {
      try {
        setProcessing(true, 'Cerrando sesión...');
        lastAuthAction.value = 'logout';
        
        const success = await authStore.logout();
        
        if (success) {
          if (props.showNotifications) {
            toast.success('Sesión cerrada', 'Has cerrado sesión correctamente');
          }
          
          //Redirigir al usuario a la página de inicio
          router.push('/');
          return true;
        } else {
          throw new Error('No se pudo cerrar sesión');
        }
      } catch (error) {
        handleAuthError(error, 'logout');
        return false;
      } finally {
        setProcessing(false);
      }
    };

    const resetPassword = async (email) => {
      try {
        setProcessing(true, 'Enviando correo de recuperación...');
        lastAuthAction.value = 'resetPassword';
        
        const success = await authStore.resetPassword(email);
        
        if (success) {
          if (props.showNotifications) {
            toast.success(
              'Correo enviado', 
              'Hemos enviado un correo con instrucciones para restablecer tu contraseña'
            );
          }
          return true;
        } else {
          throw new Error('No se pudo enviar el correo de recuperación');
        }
      } catch (error) {
        handleAuthError(error, 'resetPassword');
        return false;
      } finally {
        setProcessing(false);
      }
    };

    //Inicializar autenticación
    onMounted(() => {
      authStore.initAuth();
    });

    return {
      isAuthenticated,
      isLoading,
      isProcessing,
      loadingMessage,
      user,
      login,
      register,
      logout,
      resetPassword
    };
  }
};
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.auth-loading {
  background-color: var(--color-surface);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style>
