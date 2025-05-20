<template>
  <ClientOnly>
    <div v-if="stripeLoaded">
      <div v-if="error" class="error-message">
        {{ error.message }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <label for="card-element">
            Credit or debit card
          </label>
          <div id="card-element" ref="cardElement" class="card-element"></div>
          <div id="card-errors" role="alert" class="card-errors"></div>
        </div>
        
        <button 
          type="submit" 
          :disabled="isProcessing" 
          class="submit-button"
        >
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Pay {{ formatAmount(amount) }}</span>
        </button>
      </form>
    </div>
    
    <template #placeholder>
      <div class="stripe-placeholder">
        <div class="loading-indicator">Loading payment form...</div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import ClientOnly from './ClientOnly.vue';
import { useStripe } from '../composables/useStripe';
import { useErrorHandler } from '../composables/useErrorHandler';

const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  clientSecret: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['payment-success', 'payment-error']);

const cardElement = ref<HTMLElement | null>(null);
const stripeLoaded = ref(false);
const isProcessing = ref(false);
const { stripe, isLoading, error: stripeError } = useStripe();
const { error, handleError, clearError } = useErrorHandler();

let card: any = null;

// Formatear cantidad para mostrar
const formatAmount = (amount: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.currency,
  });
  
  return formatter.format(amount / 100);
};

// Inicializar Stripe Elements
const initializeStripeElements = async () => {
  if (!stripe.value || !cardElement.value) return;
  
  try {
    const elements = stripe.value.elements();
    
    // Crear elemento de tarjeta
    card = elements.create('card', {
      style: {
        base: {
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
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
    
    // Montar elemento de tarjeta
    card.mount(cardElement.value);
    
    // Manejar errores de validación
    card.on('change', (event: any) => {
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        displayError.textContent = event.error ? event.error.message : '';
      }
    });
    
    stripeLoaded.value = true;
  } catch (err) {
    handleError(err, 'Stripe Elements');
  }
};

// Manejar envío del formulario
const handleSubmit = async () => {
  if (!stripe.value || !card) return;
  
  isProcessing.value = true;
  clearError();
  
  try {
    const result = await stripe.value.confirmCardPayment(props.clientSecret, {
      payment_method: {
        card: card,
        billing_details: {
          // Opcional: añadir detalles de facturación
        }
      }
    });
    
    if (result.error) {
      // Mostrar error al usuario
      handleError(result.error, 'Payment');
      emit('payment-error', result.error);
    } else {
      // El pago se procesó correctamente
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        emit('payment-success', result.paymentIntent);
      }
    }
  } catch (err) {
    handleError(err, 'Payment');
    emit('payment-error', err);
  } finally {
    isProcessing.value = false;
  }
};

// Inicializar cuando el componente se monta
onMounted(async () => {
  if (typeof window !== 'undefined') {
    await initializeStripeElements();
  }
});

// Observar cambios en stripe
watch(stripe, async (newStripe) => {
  if (newStripe && cardElement.value) {
    await initializeStripeElements();
  }
});

// Observar errores de Stripe
watch(stripeError, (newError) => {
  if (newError) {
    error.value = newError;
  }
});
</script>

<style scoped>
.card-element {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: box-shadow 150ms ease;
}

.card-element:focus {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(66, 153, 225, 0.5);
  outline: none;
}

.card-errors {
  color: #fa755a;
  font-size: 14px;
  margin-top: 8px;
  min-height: 20px;
}

.form-row {
  margin-bottom: 16px;
}

.form-row label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.submit-button {
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.submit-button:hover {
  background-color: #4338ca;
}

.submit-button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.stripe-placeholder {
  padding: 24px;
  background-color: #f9fafb;
  border-radius: 4px;
  border: 1px dashed #d1d5db;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-indicator {
  color: #6b7280;
  font-size: 14px;
}
</style>
