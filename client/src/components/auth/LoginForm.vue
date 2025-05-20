<template>
  <div class="login-form">
    <h2 id="login-title" class="form-title">Iniciar Sesión</h2>
    
    <Alert v-if="errorComputed" variant="error" class="mb-4" role="alert">
      {{ errorComputed }}
    </Alert>
    
    <form @submit.prevent="handleSubmit" novalidate role="form" aria-labelledby="login-title">
      <div class="form-group">
        <label for="email" class="form-label" id="email-label">Correo electrónico</label>
        <Input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="tu@email.com"
          :icon="MailIcon"
          :disabled="loading"
          :error="errors.email"
          :success="form.email && !errors.email && attemptedSubmit"
          aria-required="true"
          aria-invalid="errors.email ? 'true' : 'false'"
          aria-describedby="email-error email-description"
          required
          @focus="clearFieldError('email')"
        />
        <span v-if="errors.email" id="email-error" class="error-text" role="alert">{{ errors.email }}</span>
        <span id="email-description" class="sr-only">Ingresa tu dirección de correo electrónico</span>
      </div>
      
      <div class="form-group">
        <div class="password-header">
          <label for="password" class="form-label">Contraseña</label>
          <router-link to="/recuperar-contrasena" class="forgot-link" aria-label="¿Olvidaste tu contraseña? Haz clic para recuperarla">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>
        <Input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          :icon="LockIcon"
          :disabled="loading"
          :error="errors.password"
          :success="form.password && !errors.password && attemptedSubmit"
          aria-required="true"
          aria-invalid="errors.password ? 'true' : 'false'"
          aria-describedby="password-error"
          required
          @focus="clearFieldError('password')"
        />
        <span v-if="errors.password" id="password-error" class="error-text">{{ errors.password }}</span>
      </div>
      
      <div class="form-group remember-me">
        <Checkbox 
          id="remember" 
          v-model="form.remember"
          aria-label="Recordarme en este dispositivo"
        >
          Recordarme
        </Checkbox>
      </div>
      
      <Button
        type="submit"
        variant="primary"
        class="w-full"
        :loading="loading"
        loadingText="Iniciando sesión..."
        :disabled="!isFormValid || loading"
        aria-live="polite"
        aria-busy="loading"
      >
        Iniciar sesión
      </Button>

      <div v-if="loginSuccess" class="success-message" role="status" aria-live="polite">
        Inicio de sesión exitoso. Redirigiendo...
      </div>
      
      <div class="social-login">
        <div class="divider">
          <span>O continúa con</span>
        </div>
        
        <Button
          type="button"
          variant="outline"
          class="w-full mt-3"
          :loading="loadingGoogle"
          loadingText="Iniciando sesión..."
          :disabled="loading || loadingGoogle"
          @click="handleGoogleLogin"
        >
          <GoogleIcon class="mr-2" />
          Google
        </Button>
      </div>
    </form>
    
    <div class="form-footer">
      <p>
        ¿No tienes una cuenta?
        <a href="#" class="register-link" @click.prevent="$emit('switch-to-register')" aria-label="Regístrate para crear una cuenta nueva">
          Regístrate
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { MailIcon, LockIcon } from 'lucide-vue-next';
import Input from '../ui/Input.vue';
import Button from '../ui/Button.vue';
import Checkbox from '../ui/Checkbox.vue';
import Alert from '../ui/Alert.vue';
import GoogleIcon from '../icons/GoogleIcon.vue';
import { useAuth } from '../../composables/useAuth';
import { validateEmail as validateEmailFn, validatePassword as validatePasswordFn } from '../../utils/validation';

const emit = defineEmits(['login-success', 'switch-to-register']);

// Declarar todos los refs al inicio
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const rememberMe = ref(false);

// Estado del formulario
const form = reactive({
  email: '',
  password: '',
  remember: false
});

// Estado de validación
const errors = reactive({
  email: '',
  password: ''
});

// Estado de envío
const attemptedSubmit = ref(false);
const loginSuccess = ref(false);

// Auth composable
const { login, loginWithGoogle, loading: authLoading, error: authError } = useAuth();

// Estado adicional
const loadingGoogle = ref(false);

const errorComputed = computed(() => authError.value?.message || '');

// Validación
const validateEmail = () => {
  errors.email = validateEmailFn(form.email);
};

const validatePassword = () => {
  errors.password = validatePasswordFn(form.password);
};

const isFormValid = computed(() => {
  if (!attemptedSubmit.value) return true;
  return !errors.email && !errors.password && form.email && form.password;
});

// Métodos
const clearFieldError = (field) => {
  if (errors[field]) errors[field] = '';
};

const handleSubmit = async () => {
  attemptedSubmit.value = true;
  
  // Validar campos
  validateEmail();
  validatePassword();
  
  if (!isFormValid.value) return;
  
  try {
    // Iniciar sesión
    const user = await login({
      email: form.email,
      password: form.password,
      remember: form.remember
    });
    
    if (user) {
      loginSuccess.value = true;
      // Esperar un momento antes de emitir el evento para mostrar el mensaje de éxito
      setTimeout(() => {
        emit('login-success', user);
      }, 1000);
    }
  } catch (err) {
    // Manejar error
  }
};

const handleGoogleLogin = async () => {
  loadingGoogle.value = true;
  
  try {
    const user = await loginWithGoogle();
    
    if (user) {
      emit('login-success', user);
    }
  } finally {
    loadingGoogle.value = false;
  }
};
</script>

<style scoped>
.login-form {
  width: 100%;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--color-text);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.forgot-link {
  font-size: 0.75rem;
  color: var(--color-primary);
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.remember-me {
  display: flex;
  align-items: center;
}

.social-login {
  margin-top: 1.5rem;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border);
}

.divider span {
  padding: 0 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.register-link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

.w-full {
  width: 100%;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.error-text {
  display: block;
  color: var(--color-error, #dc2626);
  font-size: 0.75rem;
  margin-top: 0.25rem;
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
