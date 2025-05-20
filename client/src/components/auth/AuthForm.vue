<script setup>
import { ref, computed, watch } from 'vue';
import { Mail, Lock, Eye, EyeOff, User, Loader2, X } from 'lucide-vue-next';
// Actualizar importaciones para usar los componentes consolidados
import { Form, FormField } from '@/components/form/Form.vue';
import { Checkbox } from '@/ui/components/Checkbox.vue';
import { useValidation } from '@/utils/validation.js';
import { useAuth } from '../../composables/useAuth';
import { CheckIcon } from 'lucide-vue-next';

const emit = defineEmits(['login-success', 'register-success']);

// Auth composable
const { handleLogin: login, handleRegister: register, handleGoogleAuth, resetPassword, loading, loadingGoogle } = useAuth();

// Estado
const activeTab = ref('login');
const showPassword = ref(false);
const showForgotPassword = ref(false);
const error = ref(null);
const resetEmail = ref('');
const resetLoading = ref(false);
const resetSuccess = ref(false);
const success = ref(false);
const successMessage = ref('');
const formSubmitted = ref(false);

// Formularios
const loginForm = ref({
  email: '',
  password: '',
  remember: false
});

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
});

// Computed
const passwordMismatch = computed(() => {
  return registerForm.value.password && 
         registerForm.value.confirmPassword && 
         registerForm.value.password !== registerForm.value.confirmPassword;
});

const passwordStrength = computed(() => {
  const password = registerForm.value.password;
  
  if (!password) {
    return { score: 0, text: '', class: '' };
  }
  
  // Criterios de fortaleza
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;
  
  // Calcular puntuación
  let score = 0;
  if (hasLowerCase) score++;
  if (hasUpperCase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;
  if (isLongEnough) score++;
  
  // Determinar texto y clase
  let text = '';
  let className = '';
  
  switch (score) {
    case 0:
    case 1:
      text = 'Muy débil';
      className = 'very-weak';
      break;
    case 2:
      text = 'Débil';
      className = 'weak';
      break;
    case 3:
      text = 'Media';
      className = 'medium';
      break;
    case 4:
      text = 'Fuerte';
      className = 'strong';
      break;
    case 5:
      text = 'Muy fuerte';
      className = 'very-strong';
      break;
  }
  
  return { score, text, class: className };
});

// Métodos
const clearError = () => {
  if (error.value) error.value = null;
};

const showSuccess = (message) => {
  success.value = true;
  successMessage.value = message;
  setTimeout(() => {
    success.value = false;
    successMessage.value = '';
  }, 3000);
};

const handleLogin = async () => {
  formSubmitted.value = true;
  clearError();
  
  try {
    const result = await login(loginForm.value.email, loginForm.value.password);
    
    if (result.success) {
      showSuccess('Inicio de sesión exitoso');
      emit('login-success', result.user);
    } else {
      error.value = result.error;
    }
  } catch (err) {
    console.error('Error in login:', err);
    error.value = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
  } finally {
    formSubmitted.value = false;
  }
};

const handleRegister = async () => {
  error.value = null;
  
  if (passwordMismatch.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }
  
  try {
    const result = await register(
      registerForm.value.name,
      registerForm.value.email,
      registerForm.value.password
    );
    
    if (result.success) {
      emit('register-success', result.user);
    } else {
      error.value = result.error;
    }
  } catch (err) {
    console.error('Error in register:', err);
    error.value = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
  }
};

const handleGoogleLogin = async () => {
  error.value = null;
  
  try {
    const result = await handleGoogleAuth();
    
    if (result.success) {
      emit(activeTab.value === 'login' ? 'login-success' : 'register-success', result.user);
    } else {
      error.value = result.error;
    }
  } catch (err) {
    console.error('Error in Google login:', err);
    error.value = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
  }
};

const handleResetPassword = async () => {
  resetLoading.value = true;
  error.value = null;
  
  try {
    const result = await resetPassword(resetEmail.value);
    
    if (result.success) {
      resetSuccess.value = true;
      
      // Mostrar notificación de éxito
      if (window.$notifications) {
        window.$notifications.success(
          'Correo enviado',
          'Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.'
        );
      }
      
      // Cerrar modal después de un breve retraso
      setTimeout(() => {
        showForgotPassword.value = false;
        resetEmail.value = '';
        resetSuccess.value = false;
      }, 2000);
    } else {
      error.value = result.error;
    }
  } catch (err) {
    console.error('Error in reset password:', err);
    error.value = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
  } finally {
    resetLoading.value = false;
  }
};

// Limpiar error al cambiar de pestaña
watch(activeTab, () => {
  error.value = null;
});
</script>

<template>
  <div class="auth-form">
    <div class="form-tabs">
      <button 
        @click="activeTab = 'login'" 
        class="tab-btn" 
        :class="{ active: activeTab === 'login' }"
      >
        Iniciar Sesión
      </button>
      <button 
        @click="activeTab = 'register'" 
        class="tab-btn" 
        :class="{ active: activeTab === 'register' }"
      >
        Registrarse
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="success" class="success-message" role="status">
      {{ successMessage }}
    </div>
    
    <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="login-form" role="form" aria-labelledby="login-heading">
      <h2 id="login-heading" class="sr-only">Formulario de inicio de sesión</h2>
      <div class="form-group">
        <label for="login-email" id="email-label">Correo electrónico</label>
        <div class="input-container" :class="{ 'input-error': error && error.includes('email'), 'input-success': loginForm.email && !error }">
          <Mail size="18" class="input-icon" aria-hidden="true" />
          <input 
            type="email" 
            id="login-email" 
            v-model="loginForm.email" 
            placeholder="tu@email.com" 
            required
            aria-required="true"
            aria-invalid="error && error.includes('email') ? 'true' : 'false'"
            aria-describedby="email-error"
            @focus="clearError"
          />
          <div v-if="loginForm.email && !error" class="input-success-icon" aria-hidden="true">
            <CheckIcon size="18" />
          </div>
        </div>
        <div v-if="error && error.includes('email')" id="email-error" class="error-message" role="alert">
          {{ error }}
        </div>
      </div>
      
      <div class="form-group">
        <label for="login-password">Contraseña</label>
        <div class="input-container">
          <Lock size="18" class="input-icon" />
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="login-password" 
            v-model="loginForm.password" 
            placeholder="Tu contraseña" 
            required
          />
          <button 
            type="button" 
            @click="showPassword = !showPassword" 
            class="password-toggle"
            aria-label="Mostrar contraseña"
          >
            <Eye v-if="!showPassword" size="18" />
            <EyeOff v-else size="18" />
          </button>
        </div>
      </div>
      
      <div class="form-options">
        <div class="remember-me">
          <input type="checkbox" id="remember-me" v-model="loginForm.remember" />
          <label for="remember-me">Recordarme</label>
        </div>
        
        <button type="button" @click="showForgotPassword = true" class="forgot-password">
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      
      <button type="submit" class="btn btn-primary" :disabled="loading" aria-busy="loading">
        <Loader2 v-if="loading" class="spinner" size="16" aria-hidden="true" />
        <span v-else>Iniciar Sesión</span>
      </button>
      
      <div class="social-login">
        <div class="divider">
          <span>O continúa con</span>
        </div>
        
        <button type="button" @click="handleGoogleLogin" class="btn btn-google" :disabled="loadingGoogle">
          <Loader2 v-if="loadingGoogle" class="spinner" size="16" />
          <span v-else>Google</span>
        </button>
      </div>
    </form>
    
    <form v-else-if="activeTab === 'register'" @submit.prevent="handleRegister" class="register-form" role="form" aria-labelledby="register-heading">
      <h2 id="register-heading" class="sr-only">Formulario de registro</h2>
      <div class="form-group">
        <label for="register-name">Nombre completo</label>
        <div class="input-container">
          <User size="18" class="input-icon" />
          <input 
            type="text" 
            id="register-name" 
            v-model="registerForm.name" 
            placeholder="Tu nombre completo" 
            required
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="register-email">Correo electrónico</label>
        <div class="input-container">
          <Mail size="18" class="input-icon" />
          <input 
            type="email" 
            id="register-email" 
            v-model="registerForm.email" 
            placeholder="tu@email.com" 
            required
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="register-password">Contraseña</label>
        <div class="input-container">
          <Lock size="18" class="input-icon" />
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="register-password" 
            v-model="registerForm.password" 
            placeholder="Crea una contraseña" 
            required
          />
          <button 
            type="button" 
            @click="showPassword = !showPassword" 
            class="password-toggle"
            aria-label="Mostrar contraseña"
          >
            <Eye v-if="!showPassword" size="18" />
            <EyeOff v-else size="18" />
          </button>
        </div>
        <div class="password-strength" v-if="registerForm.password">
          <div class="strength-meter">
            <div 
              class="strength-value" 
              :style="{ width: `${passwordStrength.score * 25}%` }"
              :class="passwordStrength.class"
            ></div>
          </div>
          <span class="strength-text" :class="passwordStrength.class">{{ passwordStrength.text }}</span>
        </div>
      </div>
      
      <div class="form-group">
        <label for="register-confirm">Confirmar contraseña</label>
        <div class="input-container">
          <Lock size="18" class="input-icon" />
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="register-confirm" 
            v-model="registerForm.confirmPassword" 
            placeholder="Confirma tu contraseña" 
            required
          />
        </div>
        <div v-if="passwordMismatch" class="password-mismatch">
          Las contraseñas no coinciden
        </div>
      </div>
      
      <div class="form-group">
        <label for="register-terms">Términos y condiciones</label>
        <div class="input-container">
          <input type="checkbox" id="register-terms" v-model="registerForm.terms" required />
          <label for="register-terms">Acepto los términos y condiciones</label>
        </div>
      </div>
      
      <button type="submit" class="btn btn-primary" :disabled="loading" aria-busy="loading">
        <Loader2 v-if="loading" class="spinner" size="16" aria-hidden="true" />
        <span v-else>Registrarse</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
.input-container.input-error {
  border-color: var(--color-error);
  background-color: rgba(var(--color-error-rgb), 0.05);
}

.input-container.input-success {
  border-color: var(--color-success);
}

.input-success-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-success);
}

.success-message {
  background-color: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
  padding: 0.75rem;
  border-radius: 0.25rem;
  margin-top: 1rem;
  text-align: center;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
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
</style>
