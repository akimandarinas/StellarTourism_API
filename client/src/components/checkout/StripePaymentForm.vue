<template>
  <div class="stripe-payment-form">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner message="Cargando procesador de pagos..." />
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <AlertCircle class="error-icon" />
        <p>{{ error }}</p>
      </div>
      <button @click="initializePayment" class="btn btn-primary">
        Reintentar
      </button>
    </div>
    
    <div v-else>
      <form @submit.prevent="handleSubmit" class="payment-form">
        <div class="form-section">
          <h3>Información de pago</h3>
          
          <div class="form-group">
            <label for="card-holder-name">Nombre en la tarjeta</label>
            <input 
              type="text" 
              id="card-holder-name" 
              v-model="billingDetails.name" 
              placeholder="Nombre completo" 
              required
              class="form-input"
              :disabled="processing"
              data-testid="card-holder-name"
            />
          </div>
          
          <div class="form-group">
            <label for="card-element">Datos de la tarjeta</label>
            <div 
              id="card-element" 
              class="card-element" 
              :class="{ 'card-element-error': cardError }"
              data-testid="card-element"
            ></div>
            <div v-if="cardError" class="card-error" data-testid="card-error">{{ cardError }}</div>
          </div>
          
          <div class="form-group">
            <label for="billing-email">Email</label>
            <input 
              type="email" 
              id="billing-email" 
              v-model="billingDetails.email" 
              placeholder="correo@ejemplo.com" 
              required
              class="form-input"
              :disabled="processing"
              data-testid="billing-email"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="billing-country">País</label>
              <select 
                id="billing-country" 
                v-model="billingDetails.address.country" 
                required
                class="form-select"
                :disabled="processing"
                data-testid="billing-country"
              >
                <option value="">Selecciona un país</option>
                <option v-for="country in countries" :key="country.code" :value="country.code">
                  {{ country.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="billing-postal-code">Código postal</label>
              <input 
                type="text" 
                id="billing-postal-code" 
                v-model="billingDetails.address.postal_code" 
                placeholder="28001" 
                required
                class="form-input"
                :disabled="processing"
                data-testid="billing-postal-code"
              />
            </div>
          </div>
          
          <div v-if="saveCardOption" class="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="save-card" 
              v-model="saveCard"
              class="form-checkbox"
              :disabled="processing"
              data-testid="save-card"
            />
            <label for="save-card">Guardar esta tarjeta para futuros pagos</label>
          </div>
        </div>
        
        <div class="payment-actions">
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="processing || !stripeLoaded || !isFormValid"
            data-testid="pay-button"
          >
            <Loader2 v-if="processing" class="spinner" size="16" />
            <span v-else>{{ payButtonText }}</span>
          </button>
          
          <button 
            type="button" 
            class="btn btn-outline" 
            @click="$emit('cancel')"
            :disabled="processing"
            data-testid="cancel-button"
          >
            Cancelar
          </button>
        </div>
      </form>
      
      <div v-if="showTestCards" class="test-cards">
        <h4>Tarjetas de prueba</h4>
        <p class="test-cards-info">Usa estas tarjetas para probar diferentes escenarios:</p>
        
        <div class="test-card-list">
          <div class="test-card" v-for="(card, type) in testCards" :key="type">
            <div class="test-card-type">{{ type }}</div>
            <div class="test-card-number">{{ card }}</div>
            <button @click="fillTestCard(card)" class="btn-text" data-testid="use-test-card">
              Usar
            </button>
          </div>
        </div>
        
        <p class="test-cards-note">
          <InfoIcon size="14" class="info-icon" />
          Para cualquier tarjeta de prueba, usa una fecha futura válida (MM/AA) y cualquier CVC de 3 dígitos (4 para Amex).
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useStripePayment } from '../../composables/useStripePayment';
import { useAuth } from '../../composables/useAuth';
import { PAYMENT_CONFIG } from '../../config/stripe';
import { retry, withTimeout } from '../../utils/async-utils';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { AlertCircle, Loader2, InfoIcon } from '@/utils/lucide-adapter';
import { useToast } from '../../composables/useToast';
import { useStatePersistence } from '../../composables/useStatePersistence';

// Lista de países
const countries = [
  { code: 'ES', name: 'España' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Perú' },
  { code: 'DE', name: 'Alemania' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'PT', name: 'Portugal' },
];

const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'eur'
  },
  description: {
    type: String,
    default: 'Pago de reserva'
  },
  saveCardOption: {
    type: Boolean,
    default: true
  },
  showTestCards: {
    type: Boolean,
    default: process.env.NODE_ENV !== 'production'
  },
  payButtonText: {
    type: String,
    default: 'Pagar ahora'
  },
  metadata: {
    type: Object,
    default: () => ({})
  },
  persistForm: {
    type: Boolean,
    default: true
  },
  formId: {
    type: String,
    default: 'payment-form'
  }
});

const emit = defineEmits(['success', 'error', 'cancel', 'processing-start', 'processing-end']);

// Estado
const {
  loading: stripeLoading,
  error: stripeError,
  cardElement,
  initializeStripe,
  createCardElement,
  createPaymentIntent,
  confirmCardPayment,
  createPaymentMethod,
  savePaymentMethod,
  clearCardElement,
  destroyCardElement
} = useStripePayment();

const { user } = useAuth();
const { toast } = useToast();

// Persistencia del formulario
const { state: savedForm, save: saveForm, clear: clearForm } = 
  useStatePersistence(`payment-form-${props.formId}`, null, { 
    expiryTime: 30 * 60 * 1000 // 30 minutos
  });

const loading = ref(false);
const error = ref(null);
const cardError = ref(null);
const processing = ref(false);
const stripeLoaded = ref(false);
const saveCard = ref(false);
const card = ref(null);
const paymentAttempts = ref(0);
const maxPaymentAttempts = 3;

// Datos de facturación
const billingDetails = ref({
  name: '',
  email: user.value?.email || '',
  address: {
    country: 'ES',
    postal_code: ''
  }
});

// Tarjetas de prueba
const testCards = computed(() => ({
  'Visa (Pago exitoso)': PAYMENT_CONFIG.testCards.visa,
  'Mastercard (Pago exitoso)': PAYMENT_CONFIG.testCards.mastercard,
  'Visa (Pago rechazado)': PAYMENT_CONFIG.testCards.declined,
  'Visa (Fondos insuficientes)': PAYMENT_CONFIG.testCards.insufficient,
  'Visa (Requiere autenticación)': PAYMENT_CONFIG.testCards.authentication
}));

// Validación del formulario
const isFormValid = computed(() => {
  return (
    billingDetails.value.name.trim() !== '' &&
    isValidEmail(billingDetails.value.email) &&
    billingDetails.value.address.country !== '' &&
    billingDetails.value.address.postal_code.trim() !== '' &&
    !cardError.value
  );
});

// Inicializar Stripe al montar el componente
const paymentInitialization = ref(false);

// Cargar datos guardados si existen
const loadSavedForm = () => {
  if (savedForm.value && props.persistForm) {
    billingDetails.value = {
      ...billingDetails.value,
      ...savedForm.value.billingDetails
    };
    saveCard.value = savedForm.value.saveCard || false;
  }
};

const initializePayment = async () => {
  if (paymentInitialization.value) return;

  paymentInitialization.value = true;
  loading.value = true;
  error.value = null;
  cardError.value = null;
  
  try {
    // Cargar datos guardados
    loadSavedForm();
    
    // Inicializar Stripe con timeout y reintentos
    await withTimeout(
      () => retry(
        () => initializeStripe(),
        2, // máximo 2 reintentos
        1000 // 1 segundo entre reintentos
      ),
      10000 // timeout de 10 segundos
    );
    
    // Crear elemento de tarjeta
    setTimeout(() => {
      try {
        card.value = createCardElement('card-element', {
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '16px',
              '::placeholder': {
                color: '#aab7c4'
              }
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a'
            }
          }
        });
        
        // Escuchar cambios en el elemento de tarjeta
        if (card.value) {
          card.value.addEventListener('change', (event) => {
            cardError.value = event.error ? event.error.message : null;
          });
          
          // Manejar tecla Enter en el elemento de tarjeta
          card.value.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && isFormValid.value && !processing.value) {
              event.preventDefault();
              handleSubmit();
            }
          });
        }
        
        stripeLoaded.value = true;
      } catch (err) {
        console.error('Error al crear elemento de tarjeta:', err);
        error.value = 'No se pudo inicializar el elemento de tarjeta. Por favor, recarga la página e intenta nuevamente.';
      } finally {
        loading.value = false;
      }
    }, 100);
  } catch (err) {
    console.error('Error al inicializar el pago:', err);
    error.value = 'No se pudo inicializar el procesador de pagos. Por favor, inténtalo de nuevo.';
    loading.value = false;
  } finally {
    paymentInitialization.value = false;
  }
};

// Manejar envío del formulario
const handleSubmit = async () => {
  if (processing.value || !stripeLoaded.value || !isFormValid.value) return;
  
  // Guardar datos del formulario
  if (props.persistForm) {
    saveForm({
      billingDetails: { ...billingDetails.value },
      saveCard: saveCard.value
    });
  }
  
  processing.value = true;
  error.value = null;
  cardError.value = null;
  
  // Emitir evento de inicio de procesamiento
  emit('processing-start');
  
  try {
    // Incrementar contador de intentos
    paymentAttempts.value++;
    
    // Mostrar mensaje de procesamiento
    const processingToast = toast({
      title: 'Procesando pago',
      description: 'Por favor, espera mientras procesamos tu pago...',
      variant: 'default',
      duration: 10000
    });
    
    // Crear intención de pago
    const paymentData = {
      amount: props.amount,
      currency: props.currency,
      description: props.description,
      metadata: {
        ...props.metadata,
        userId: user.value?.uid || 'guest'
      }
    };
    
    let clientSecret;
    try {
      const { clientSecret: secret } = await createPaymentIntent(paymentData);
      clientSecret = secret;
    } catch (err) {
      handleApiError(err, 'crear intención de pago');
      return;
    }
    
    // Crear método de pago
    let paymentMethod;
    try {
      paymentMethod = await createPaymentMethod(card.value, billingDetails.value);
    } catch (err) {
      handleStripeError(err, 'crear método de pago');
      return;
    }
    
    // Confirmar pago con tarjeta
    let paymentResult;
    try {
      paymentResult = await confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
        setup_future_usage: saveCard.value ? 'off_session' : undefined
      });
    } catch (err) {
      handleStripeError(err, 'confirmar pago');
      return;
    }
    
    // Cerrar toast de procesamiento
    if (processingToast) {
      toast.dismiss(processingToast);
    }
    
    // Si el pago requiere autenticación adicional
    if (paymentResult.status === 'requires_action') {
      toast({
        title: 'Autenticación requerida',
        description: 'Por favor, completa la autenticación para finalizar tu pago.',
        variant: 'warning',
        duration: 5000
      });
      return;
    }
    
    // Si el pago es exitoso y el usuario quiere guardar la tarjeta
    if (paymentResult.status === 'succeeded' && saveCard.value) {
      try {
        // Guardar método de pago
        await savePaymentMethod(paymentMethod.id);
        
        toast({
          title: 'Tarjeta guardada',
          description: 'Tu tarjeta ha sido guardada para futuros pagos.',
          variant: 'success',
          duration: 5000
        });
      } catch (err) {
        console.error('Error al guardar la tarjeta:', err);
        toast({
          title: 'No se pudo guardar la tarjeta',
          description: 'El pago se procesó correctamente, pero no pudimos guardar tu tarjeta.',
          variant: 'warning',
          duration: 5000
        });
      }
    }
    
    // Limpiar formulario guardado
    if (props.persistForm) {
      clearForm();
    }
    
    // Emitir evento de éxito
    emit('success', {
      ...paymentResult,
      paymentMethod,
      billingDetails: billingDetails.value
    });
    
    // Limpiar formulario
    clearCardElement();
    billingDetails.value = {
      name: '',
      email: user.value?.email || '',
      address: {
        country: 'ES',
        postal_code: ''
      }
    };
    saveCard.value = false;
    
    // Mostrar mensaje de éxito
    toast({
      title: 'Pago completado',
      description: 'Tu pago ha sido procesado correctamente.',
      variant: 'success',
      duration: 5000
    });
  } catch (err) {
    console.error('Error al procesar el pago:', err);
    
    // Verificar si debemos reintentar
    if (paymentAttempts.value < maxPaymentAttempts) {
      toast({
        title: 'Reintentando pago',
        description: `Hubo un problema. Reintentando (${paymentAttempts.value}/${maxPaymentAttempts})...`,
        variant: 'warning',
        duration: 3000
      });
      
      // Esperar un momento antes de reintentar
      setTimeout(() => {
        processing.value = false;
        handleSubmit();
      }, 2000);
      return;
    }
    
    error.value = err.message || 'Error al procesar el pago. Por favor, verifica los datos e inténtalo de nuevo.';
    emit('error', err);
  } finally {
    processing.value = false;
    
    // Emitir evento de fin de procesamiento
    emit('processing-end');
  }
};

// Rellenar tarjeta de prueba
const fillTestCard = (cardNumber) => {
  // No podemos modificar directamente el valor del elemento de tarjeta,
  // pero podemos mostrar el número para que el usuario lo copie
  navigator.clipboard.writeText(cardNumber)
    .then(() => {
      toast({
        title: 'Número copiado',
        description: `Número de tarjeta copiado al portapapeles: ${cardNumber}`,
        variant: 'success',
        duration: 3000
      });
    })
    .catch(err => {
      console.error('Error al copiar al portapapeles:', err);
      alert(`Usa este número de tarjeta: ${cardNumber}`);
    });
};

// Validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Manejar errores de API
const handleApiError = (err, action) => {
  console.error(`Error al ${action}:`, err);
  
  let errorMessage = `Error al ${action}. Por favor, inténtalo de nuevo.`;
  
  if (err.response?.status === 429) {
    errorMessage = 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.';
  } else if (err.response?.status === 400) {
    errorMessage = 'Los datos proporcionados no son válidos. Por favor, verifica la información e intenta nuevamente.';
  } else if (err.response?.status === 403) {
    errorMessage = 'No tienes permiso para realizar esta operación.';
  } else if (err.message?.includes('network') || err.code === 'ECONNABORTED') {
    errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.';
  }
  
  error.value = errorMessage;
  
  toast({
    title: 'Error',
    description: errorMessage,
    variant: 'destructive',
    duration: 5000
  });
  
  emit('error', {
    message: errorMessage,
    originalError: err,
    action
  });
  
  processing.value = false;
};

// Manejar errores de Stripe
const handleStripeError = (err, action) => {
  console.error(`Error de Stripe al ${action}:`, err);
  
  let errorMessage = `Error al ${action}. Por favor, inténtalo de nuevo.`;
  
  const stripeErrorMessages = {
    'card_declined': 'La tarjeta fue rechazada. Por favor, intenta con otra tarjeta.',
    'expired_card': 'La tarjeta ha expirado. Por favor, intenta con otra tarjeta.',
    'incorrect_cvc': 'El código de seguridad es incorrecto. Por favor, verifica e intenta nuevamente.',
    'processing_error': 'Ocurrió un error al procesar la tarjeta. Por favor, intenta nuevamente.',
    'insufficient_funds': 'La tarjeta no tiene fondos suficientes. Por favor, intenta con otra tarjeta.'
  };
  
  if (err.type === 'StripeCardError') {
    errorMessage = stripeErrorMessages[err.code] || 'Error al procesar la tarjeta. Por favor, verifica los datos e intenta nuevamente.';
  } else if (err.type === 'StripeInvalidRequestError') {
    errorMessage = 'La solicitud no es válida. Por favor, verifica los datos e intenta nuevamente.';
  } else if (err.type === 'StripeAPIError') {
    errorMessage = 'Error en el servicio de pagos. Por favor, intenta nuevamente más tarde.';
  } else if (err.type === 'StripeConnectionError') {
    errorMessage = 'Error de conexión con el servicio de pagos. Por favor, verifica tu conexión e intenta nuevamente.';
  } else if (err.type === 'StripeAuthenticationError') {
    errorMessage = 'Error de autenticación con el servicio de pagos. Por favor, contacta a soporte.';
  }
  
  error.value = errorMessage;
  
  toast({
    title: 'Error de pago',
    description: errorMessage,
    variant: 'destructive',
    duration: 5000
  });
  
  emit('error', {
    message: errorMessage,
    originalError: err,
    action
  });
  
  processing.value = false;
};

// Observar cambios en el usuario para actualizar el email
watch(() => user.value?.email, (newEmail) => {
  if (newEmail && !billingDetails.value.email) {
    billingDetails.value.email = newEmail;
  }
});

// Ciclo de vida
onMounted(() => {
  initializePayment();
});

onUnmounted(() => {
  destroyCardElement();
});
</script>

<style scoped>
.stripe-payment-form {
  width: 100%;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.error-message {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: var(--color-error);
}

.error-icon {
  margin-right: 0.5rem;
}

.payment-form {
  width: 100%;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: rgba(26, 26, 46, 0.5);
  color: var(--color-text);
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.card-element {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: rgba(26, 26, 46, 0.5);
  color: var(--color-text);
}

.card-element-error {
  border-color: var(--color-error);
}

.card-error {
  color: var(--color-error);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.form-checkbox {
  margin-right: 0.5rem;
}

.payment-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background-color: rgba(0, 180, 216, 0.1);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.test-cards {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-sm);
  border-left: 4px solid var(--color-primary);
}

.test-cards h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
}

.test-cards-info {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.test-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.test-card {
  padding: 0.75rem;
  background-color: rgba(26, 26, 46, 0.8);
  border-radius: var(--border-radius-sm);
  display: flex;
  flex-direction: column;
}

.test-card-type {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.test-card-number {
  font-family: monospace;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0.25rem 0;
  font-weight: 500;
  text-align: left;
}

.test-cards-note {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.info-icon {
  margin-right: 0.5rem;
  color: var(--color-primary);
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .payment-actions {
    flex-direction: column;
  }
  
  .test-card-list {
    grid-template-columns: 1fr;
  }
}
</style>
