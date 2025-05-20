<template>
  <form @submit.prevent="handleSubmit" class="forgot-password-form" novalidate>
    <p class="form-description">
      Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
    </p>
    
    <Alert v-if="error" variant="error" class="mb-4" role="alert">
      {{ error }}
    </Alert>
    
    <Alert v-if="success" variant="success" class="mb-4" role="status">
      Hemos enviado un enlace para restablecer tu contraseña a {{ email }}
    </Alert>
    
    <div class="form-group">
      <label for="email" class="form-label">Correo electrónico</label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="tu@email.com"
        :icon="MailIcon"
        :disabled="loading || success"
        :error="emailError"
        aria-required="true"
        aria-invalid="emailError ? 'true' : 'false'"
        aria-describedby="email-error"
        @blur="validateEmail"
        required
      />
      <span v-if="emailError" id="email-error" class="error-text">{{ emailError }}</span>
    </div>
    
    <div class="form-actions">
      <Button
        v-if="!standalone"
        type="button"
        variant="outline"
        @click="$emit('cancel')"
        :disabled="loading"
        aria-label="Cancelar y volver"
      >
        Cancelar
      </Button>
      
      <Button
        type="submit"
        variant="primary"
        :loading="loading"
        loadingText="Enviando..."
        :disabled="!isEmailValid || success"
        :class="{ 'w-full': standalone }"
        aria-live="polite"
      >
        Enviar enlace
      </Button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { MailIcon } from 'lucide-vue-next';
import Input from '../ui/Input.vue';
import Button from '../ui/Button.vue';
import Alert from '../ui/Alert.vue';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  standalone: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['reset-sent', 'cancel']);

// Estado
const email = ref('');
const error = ref('');
const success = ref(false);
const emailError = ref('');
const attemptedSubmit = ref(false);

// Store
const authStore = useAuthStore();
const loading = computed(() => authStore.loading);

// Validación
const validateEmail = () => {
  emailError.value = '';
  
  if (!email.value) {
    emailError.value = 'El correo electrónico es obligatorio';
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Introduce un correo electrónico válido';
    return false;
  }
  
  return true;
};

const isEmailValid = computed(() => {
  if (attemptedSubmit.value) {
    return validateEmail();
  }
  return email.value.length > 0;
});

// Validar cuando cambia el email
watch(email, () => {
  if (attemptedSubmit.value) validateEmail();
});

// Métodos
const handleSubmit = async () => {
  attemptedSubmit.value = true;
  
  if (!validateEmail()) {
    return;
  }
  
  error.value = '';
  success.value = false;
  
  try {
    const result = await authStore.resetPassword(email.value);
    
    if (result) {
      success.value = true;
      emit('reset-sent', email.value);
      
      // Anunciar para lectores de pantalla
      const statusElement = document.createElement('div');
      statusElement.setAttribute('role', 'status');
      statusElement.setAttribute('aria-live', 'polite');
      statusElement.textContent = `Se ha enviado un enlace para restablecer la contraseña a ${email.value}`;
      document.body.appendChild(statusElement);
      
      setTimeout(() => {
        document.body.removeChild(statusElement);
      }, 5000);
      
      // Cerrar modal después de un breve retraso si no es standalone
      if (!props.standalone) {
        setTimeout(() => {
          emit('cancel');
        }, 3000);
      }
    } else if (authStore.error) {
      error.value = authStore.error;
      
      // Mejorar mensajes de error específicos
      if (error.value.includes('user-not-found')) {
        error.value = 'No existe una cuenta con este correo electrónico.';
      } else if (error.value.includes('invalid-email')) {
        error.value = 'El formato del correo electrónico no es válido.';
      }
    }
  } catch (err) {
    console.error('Error al enviar correo de restablecimiento:', err);
    error.value = err.message || 'Error al enviar correo. Por favor, intenta nuevamente.';
  }
};
</script>

<style scoped>
.forgot-password-form {
  width: 100%;
}

.form-description {
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.w-full {
  width: 100%;
}

.error-text {
  display: block;
  color: var(--color-error, #dc2626);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
</style>
