<template>
  <div class="register-form">
    <h2 id="register-title" class="form-title">Crear Cuenta</h2>
    
    <Alert v-if="error" variant="error" class="mb-4" role="alert">
      {{ error }}
    </Alert>
    
    <form @submit.prevent="handleSubmit" novalidate role="form" aria-labelledby="register-title">
      <div class="form-row">
        <div class="form-group">
          <label for="nombre" class="form-label" id="nombre-label">Nombre</label>
          <Input
            id="nombre"
            v-model="nombre"
            type="text"
            placeholder="Tu nombre"
            :disabled="loading"
            :error="nombreError"
            :success="nombre && !nombreError && attemptedSubmit"
            aria-required="true"
            aria-invalid="nombreError ? 'true' : 'false'"
            aria-describedby="nombre-error nombre-description"
            @blur="validateNombre"
            @focus="clearError('nombreError')"
            required
          />
          <span v-if="nombreError" id="nombre-error" class="error-text" role="alert">{{ nombreError }}</span>
          <span id="nombre-description" class="sr-only">Ingresa tu nombre</span>
        </div>
        
        <div class="form-group">
          <label for="apellido" class="form-label">Apellido</label>
          <Input
            id="apellido"
            v-model="apellido"
            type="text"
            placeholder="Tu apellido"
            :disabled="loading"
            :error="apellidoError"
            aria-invalid="apellidoError ? 'true' : 'false'"
            aria-describedby="apellido-error"
            @blur="validateApellido"
            @focus="clearError('apellidoError')"
          />
          <span v-if="apellidoError" id="apellido-error" class="error-text">{{ apellidoError }}</span>
        </div>
      </div>
      
      <div class="form-group">
        <label for="email" class="form-label">Correo electrónico</label>
        <Input
          id="email"
          v-model="email"
          type="email"
          placeholder="tu@email.com"
          :icon="MailIcon"
          :disabled="loading"
          :error="emailError"
          aria-required="true"
          aria-invalid="emailError ? 'true' : 'false'"
          aria-describedby="email-error"
          @blur="validateEmail"
          @focus="clearError('emailError')"
          required
        />
        <span v-if="emailError" id="email-error" class="error-text">{{ emailError }}</span>
      </div>
      
      <div class="form-group">
        <label for="telefono" class="form-label">Teléfono (opcional)</label>
        <Input
          id="telefono"
          v-model="telefono"
          type="tel"
          placeholder="+34 600 000 000"
          :icon="PhoneIcon"
          :disabled="loading"
          :error="telefonoError"
          aria-invalid="telefonoError ? 'true' : 'false'"
          aria-describedby="telefono-error"
          @blur="validateTelefono"
          @focus="clearError('telefonoError')"
        />
        <span v-if="telefonoError" id="telefono-error" class="error-text">{{ telefonoError }}</span>
      </div>
      
      <div class="form-group">
        <label for="password" class="form-label">Contraseña</label>
        <Input
          id="password"
          v-model="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          :icon="LockIcon"
          :disabled="loading"
          :error="passwordError"
          aria-required="true"
          aria-invalid="passwordError ? 'true' : 'false'"
          aria-describedby="password-error password-strength"
          @blur="validatePassword"
          @focus="clearError('passwordError')"
          required
        />
        <span v-if="passwordError" id="password-error" class="error-text">{{ passwordError }}</span>
        
        <div v-if="password" id="password-strength" class="password-strength-container" aria-live="polite">
          <div class="password-strength-label">
            Seguridad de la contraseña: 
            <span class="password-strength-text" :class="passwordStrengthClass">
              {{ passwordStrengthText }}
            </span>
          </div>
          <div class="password-strength-bar" role="progressbar" :aria-valuenow="calculatePasswordStrength" aria-valuemin="0" aria-valuemax="6" :aria-valuetext="passwordStrengthText">
            <div class="password-strength-progress" :class="passwordStrengthClass" :style="{ width: passwordStrengthPercentage + '%' }"></div>
          </div>
          <div class="password-requirements" aria-live="polite">
            <ul>
              <li :class="{ 'requirement-met': password.length >= 8 }">
                Al menos 8 caracteres
              </li>
              <li :class="{ 'requirement-met': /[A-Z]/.test(password) }">
                Al menos una mayúscula
              </li>
              <li :class="{ 'requirement-met': /[0-9]/.test(password) }">
                Al menos un número
              </li>
              <li :class="{ 'requirement-met': /[^A-Za-z0-9]/.test(password) }">
                Al menos un carácter especial
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="confirmPassword" class="form-label">Confirmar contraseña</label>
        <Input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          placeholder="Repite tu contraseña"
          :icon="LockIcon"
          :disabled="loading"
          :error="confirmPasswordError"
          aria-required="true"
          aria-invalid="confirmPasswordError ? 'true' : 'false'"
          aria-describedby="confirm-password-error"
          @blur="validateConfirmPassword"
          @focus="clearError('confirmPasswordError')"
          required
        />
        <span v-if="confirmPasswordError" id="confirm-password-error" class="error-text">{{ confirmPasswordError }}</span>
      </div>
      
      <div class="form-group terms">
        <Checkbox 
          id="terms" 
          v-model="acceptTerms" 
          :error="termsError"
          aria-required="true"
          aria-invalid="termsError ? 'true' : 'false'"
          aria-describedby="terms-error"
          required
        >
          Acepto los <a href="#" class="terms-link" @click.prevent="showTerms">Términos y Condiciones</a> y la <a href="#" class="terms-link" @click.prevent="showPrivacy">Política de Privacidad</a>
        </Checkbox>
        <span v-if="termsError" id="terms-error" class="error-text">{{ termsError }}</span>
      </div>
      
      <Button
        type="submit"
        variant="primary"
        class="w-full"
        :loading="loading"
        loadingText="Creando cuenta..."
        :disabled="!isFormValid || loading"
        aria-live="polite"
        aria-busy="loading"
      >
        Crear cuenta
      </Button>
    </form>
    
    <div v-if="registerSuccess" class="success-message" role="status" aria-live="polite">
      Cuenta creada exitosamente. Redirigiendo...
    </div>

    <div class="form-footer">
      <p>
        ¿Ya tienes una cuenta?
        <a href="#" class="login-link" @click.prevent="$emit('switch-to-login')" aria-label="Iniciar sesión con tu cuenta existente">
          Iniciar sesión
        </a>
      </p>
      
      <p class="mt-2">
        <router-link to="/recuperar-contrasena" class="forgot-link" aria-label="¿Olvidaste tu contraseña? Haz clic para recuperarla">
          ¿Olvidaste tu contraseña?
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';
import { MailIcon, LockIcon, PhoneIcon } from '@/utils/lucide-adapter';
import Input from '../ui/Input.vue';
import Button from '../ui/Button.vue';
import Checkbox from '../ui/Checkbox.vue';
import Alert from '../ui/Alert.vue';
import { useAuthStore } from '../../stores/auth';
import { storeToRefs } from 'pinia';

// Declarar todos los refs al inicio
const nombre = ref('');
const apellido = ref('');
const email = ref('');
const telefono = ref('');
const password = ref('');
const confirmPassword = ref('');
const acceptTerms = ref(false);
const error = ref('');
const nombreError = ref('');
const apellidoError = ref('');
const emailError = ref('');
const telefonoError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const termsError = ref('');
const registerSuccess = ref(false);
const attemptedSubmit = ref(false);

const props = defineProps({
  redirectUrl: {
    type: String,
    default: '/dashboard'
  }
});

const emit = defineEmits(['register-success', 'switch-to-login']);
const router = useRouter();

const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);

//Validación
const validateNombre = () => {
  nombreError.value = '';
  
  if (!nombre.value.trim()) {
    nombreError.value = 'El nombre es obligatorio';
    return false;
  }
  
  if (nombre.value.trim().length < 2) {
    nombreError.value = 'El nombre debe tener al menos 2 caracteres';
    return false;
  }
  
  return true;
};

const validateApellido = () => {
  apellidoError.value = '';
  
  if (apellido.value.trim() && apellido.value.trim().length < 2) {
    apellidoError.value = 'El apellido debe tener al menos 2 caracteres';
    return false;
  }
  
  return true;
};

const validateTelefono = () => {
  telefonoError.value = '';
  
  if (telefono.value) {
    const telefonoRegex = /^(\+\d{1,3}\s?)?\d{9,}$/;
    if (!telefonoRegex.test(telefono.value)) {
      telefonoError.value = 'Introduce un número de teléfono válido';
      return false;
    }
  }
  
  return true;
};

const validateConfirmPassword = () => {
  confirmPasswordError.value = '';
  
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Debes confirmar la contraseña';
    return false;
  }
  
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Las contraseñas no coinciden';
    return false;
  }
  
  return true;
};

const validateTerms = () => {
  termsError.value = '';
  
  if (!acceptTerms.value) {
    termsError.value = 'Debes aceptar los términos y condiciones';
    return false;
  }
  
  return true;
};

//Calcular fortaleza de la contraseña
const calculatePasswordStrength = computed(() => {
  if (!password.value) return 0;
  
  let strength = 0;
  
  //Longitud
  if (password.value.length >= 8) strength += 1;
  if (password.value.length >= 12) strength += 1;
  
  //Complejidad
  if (/[A-Z]/.test(password.value)) strength += 1; // Mayúsculas
  if (/[a-z]/.test(password.value)) strength += 1; // Minúsculas
  if (/[0-9]/.test(password.value)) strength += 1; // Números
  if (/[^A-Za-z0-9]/.test(password.value)) strength += 1; // Caracteres especiales
  
  return strength;
});

const passwordStrengthPercentage = computed(() => {
  return (calculatePasswordStrength.value / 6) * 100;
});

const passwordStrengthText = computed(() => {
  const strength = calculatePasswordStrength.value;
  
  if (strength <= 1) return 'Muy débil';
  if (strength <= 2) return 'Débil';
  if (strength <= 4) return 'Media';
  if (strength <= 5) return 'Fuerte';
  return 'Muy fuerte';
});

const passwordStrengthClass = computed(() => {
  const strength = calculatePasswordStrength.value;
  
  if (strength <= 1) return 'very-weak';
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  if (strength <= 5) return 'strong';
  return 'very-strong';
});

const isFormValid = computed(() => {
  if (attemptedSubmit.value) {
    return (
      validateNombre() &&
      validateApellido() &&
      validateEmail(email.value) &&
      validateTelefono() &&
      validatePassword(password.value) &&
      validateConfirmPassword() &&
      validateTerms()
    );
  }
  return true;
});

watch(nombre, () => {
  if (attemptedSubmit.value) validateNombre();
});

watch(apellido, () => {
  if (attemptedSubmit.value) validateApellido();
});

watch(email, () => {
  if (attemptedSubmit.value) validateEmail(email.value);
});

watch(telefono, () => {
  if (attemptedSubmit.value) validateTelefono();
});

watch(password, () => {
  if (attemptedSubmit.value) {
    validatePassword(password.value);
    if (confirmPassword.value) validateConfirmPassword();
  }
});

watch(confirmPassword, () => {
  if (attemptedSubmit.value) validateConfirmPassword();
});

watch(acceptTerms, () => {
  if (attemptedSubmit.value) validateTerms();
});

const clearError = (errorField) => {
  if (errorField && typeof errorField === 'string') {
    if (window[errorField]) {
      window[errorField] = '';
    }
  }
};

const handleSubmit = async () => {
  attemptedSubmit.value = true;
  
  // Validar todos los campos
  const isNombreValid = validateNombre();
  const isApellidoValid = validateApellido();
  const isEmailValid = validateEmail(email.value);
  const isTelefonoValid = validateTelefono();
  const isPasswordValid = validatePassword(password.value);
  const isConfirmPasswordValid = validateConfirmPassword();
  const isTermsValid = validateTerms();
  
  if (!isNombreValid || !isApellidoValid || !isEmailValid || !isTelefonoValid || 
      !isPasswordValid || !isConfirmPasswordValid || !isTermsValid) {
    // Anunciar errores para lectores de pantalla
    announceErrors();
    return;
  }
  
  error.value = '';
  
  try {
    const userData = {
      nombre: nombre.value,
      apellido: apellido.value,
      telefono: telefono.value
    };
    
    const result = await authStore.register(email.value, password.value, userData);
    
    if (result) {
      registerSuccess.value = true;
      announceSuccess();
      setTimeout(() => {
        emit('register-success', { email: email.value, nombre: nombre.value });
      }, 1500);
    } else if (authStore.error) {
      error.value = authStore.error;
      announceError(error.value);
      
      //Mejorar mensajes de error específicos
      if (error.value.includes('email-already-in-use')) {
        error.value = 'Este correo electrónico ya está registrado. Por favor, inicia sesión o utiliza otro correo.';
      } else if (error.value.includes('weak-password')) {
        error.value = 'La contraseña es demasiado débil. Por favor, elige una contraseña más segura.';
      }
    }
  } catch (err) {
    console.error('Error de registro:', err);
    error.value = 'Error al crear la cuenta. Por favor, intenta nuevamente.';
    announceError(error.value);
  }
};

const showTerms = () => {
  router.push('/terminos-y-condiciones');
};

const showPrivacy = () => {
  router.push('/politica-de-privacidad');
};

const announceErrors = () => {
  const errorMessages = [];
  if (nombreError.value) errorMessages.push(`Nombre: ${nombreError.value}`);
  if (apellidoError.value) errorMessages.push(`Apellido: ${apellidoError.value}`);
  if (emailError.value) errorMessages.push(`Email: ${emailError.value}`);
  if (telefonoError.value) errorMessages.push(`Teléfono: ${telefonoError.value}`);
  if (passwordError.value) errorMessages.push(`Contraseña: ${passwordError.value}`);
  if (confirmPasswordError.value) errorMessages.push(`Confirmar contraseña: ${confirmPasswordError.value}`);
  if (termsError.value) errorMessages.push(`Términos: ${termsError.value}`);
  
  if (errorMessages.length > 0) {
    const announcement = `Por favor, corrige los siguientes errores: ${errorMessages.join(', ')}`;
    announceToScreenReader(announcement);
  }
};

const announceSuccess = () => {
  announceToScreenReader('Cuenta creada exitosamente. Serás redirigido en breve.');
};

const announceError = (message) => {
  announceToScreenReader(`Error: ${message}`);
};

const announceToScreenReader = (message) => {
  console.log('Anuncio para lector de pantalla:', message);
};
</script>

<style scoped>
.register-form {
  width: 100%;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--color-text);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
  flex: 1;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.terms {
  margin-top: 0.5rem;
}

.terms-link {
  color: var(--color-primary);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.login-link, .forgot-link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}

.login-link:hover, .forgot-link:hover {
  text-decoration: underline;
}

.w-full {
  width: 100%;
}

.mt-2 {
  margin-top: 0.5rem;
}

.error-text {
  display: block;
  color: var(--color-error, #dc2626);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.password-strength-container {
  margin-top: 0.5rem;
}

.password-strength-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.password-strength-text {
  font-weight: 500;
}

.password-strength-bar {
  height: 4px;
  background-color: var(--color-gray-200, #e5e7eb);
  border-radius: 2px;
  overflow: hidden;
}

.password-strength-progress {
  height: 100%;
  transition: width 0.3s ease;
}

.very-weak {
  color: #ef4444;
  background-color: #ef4444;
}

.weak {
  color: #f97316;
  background-color: #f97316;
}

.medium {
  color: #eab308;
  background-color: #eab308;
}

.strong {
  color: #22c55e;
  background-color: #22c55e;
}

.very-strong {
  color: #15803d;
  background-color: #15803d;
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}

.requirement-met {
  color: var(--color-success);
}

.requirement-met::before {
  content: "✓ ";
}

.password-requirements {
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.password-requirements ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.password-requirements li {
  margin-bottom: 0.25rem;
  color: var(--color-text-secondary);
}

.success-message {
  color: var(--color-success);
  text-align: center;
  margin-top: 1rem;
}
</style>
