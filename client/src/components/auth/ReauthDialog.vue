<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="onCancel" aria-modal="true" role="dialog" aria-labelledby="reauth-title">
    <div class="modal max-w-md w-full" ref="modalRef">
      <div class="modal-header">
        <h2 id="reauth-title" class="text-xl font-semibold">Confirmar identidad</h2>
        <button 
          @click="onCancel" 
          class="btn btn-ghost btn-sm btn-icon"
          aria-label="Cerrar"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>
      <div class="modal-body">
        <p class="mb-4">
          Por razones de seguridad, necesitamos verificar tu identidad antes de continuar.
        </p>
        
        <form @submit.prevent="handleSubmit" novalidate>
          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              v-model="password"
              class="form-control"
              :class="{ 'error': passwordError }"
              placeholder="Ingresa tu contraseña actual"
              required
              :disabled="loading"
              ref="passwordInput"
              aria-required="true"
              aria-invalid="passwordError ? 'true' : 'false'"
              aria-describedby="password-error"
            />
            <p v-if="error" id="password-error" class="form-error mt-1" role="alert">{{ error }}</p>
            <p v-else-if="passwordError" id="password-error" class="form-error mt-1">{{ passwordError }}</p>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button 
              type="button" 
              class="btn btn-tertiary" 
              @click="onCancel"
              :disabled="loading"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="loading || !password"
              aria-live="polite"
            >
              <span v-if="loading" class="flex items-center">
                <LoaderIcon class="animate-spin mr-2 h-4 w-4" />
                Verificando...
              </span>
              <span v-else>Confirmar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import { XIcon, LoaderIcon } from '@/utils/lucide-adapter';
import firebaseAuthService from '../../services/auth/firebase-auth';
import { handleFirebaseError } from '@/utils/error-handler';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['success', 'cancel']);

const password = ref('');
const passwordError = ref('');
const error = ref('');
const loading = ref(false);
const passwordInput = ref(null);
const modalRef = ref(null);
const previousActiveElement = ref(null);

onMounted(() => {
  if (props.isOpen) {
    focusPasswordInput();
    trapFocus();
  }
});

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    previousActiveElement.value = document.activeElement;
    
    nextTick(() => {
      focusPasswordInput();
      trapFocus();
    });
  } else {
    // Restaurar el foco al elemento anterior
    if (previousActiveElement.value) {
      previousActiveElement.value.focus();
    }
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

//Validar contraseña
const validatePassword = () => {
  passwordError.value = '';
  
  if (!password.value) {
    passwordError.value = 'Por favor, ingresa tu contraseña';
    return false;
  }
  
  return true;
};

async function focusPasswordInput() {
  await nextTick();
  if (passwordInput.value) {
    passwordInput.value.focus();
  }
}

function trapFocus() {
  document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(event) {
  // Cerrar al presionar Escape
  if (event.key === 'Escape') {
    onCancel();
    event.preventDefault();
    return;
  }
  
  if (event.key === 'Tab' && modalRef.value) {
    const focusableElements = modalRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  }
}

async function handleSubmit() {
  if (!validatePassword()) {
    return;
  }

  error.value = '';
  loading.value = true;

  try {
    await firebaseAuthService.reauthenticate(password.value);
    
    //Emitir evento de éxito
    emit('success');
    
    password.value = '';
    passwordError.value = '';
  } catch (err) {
    error.value = handleFirebaseError(err, { toast: false, silent: true });
    
    if (error.value.includes('wrong-password')) {
      error.value = 'La contraseña es incorrecta. Por favor, inténtalo de nuevo.';
    } else if (error.value.includes('too-many-requests')) {
      error.value = 'Demasiados intentos fallidos. Por favor, intenta más tarde.';
    }
  } finally {
    loading.value = false;
  }
}

function onCancel() {
  password.value = '';
  passwordError.value = '';
  error.value = '';
  emit('cancel');
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-body {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.form-control.error {
  border-color: var(--color-error, #dc2626);
}

.form-error {
  color: var(--color-error, #dc2626);
  font-size: 0.875rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary, #3b82f6);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark, #2563eb);
}

.btn-tertiary {
  background-color: transparent;
  color: var(--color-text, #1f2937);
}

.btn-tertiary:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05);
}

.btn-ghost {
  background-color: transparent;
  padding: 0.25rem;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-end {
  justify-content: flex-end;
}

.gap-2 {
  gap: 0.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
