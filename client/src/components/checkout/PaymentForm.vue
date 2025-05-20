<template>
  <div class="payment-form">
    <div v-if="isLoading" class="loading-container">
      <LoadingSpinner size="medium" text="Procesando pago..." />
    </div>
    
    <div v-else>
      <!-- Selector de método de pago -->
      <div v-if="paymentMethods.length > 0" class="saved-methods mb-6">
        <h3 class="text-lg font-medium mb-3">Métodos de pago guardados</h3>
        
        <div class="grid gap-3">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id"
            class="payment-method-card p-3 border rounded-md cursor-pointer"
            :class="{ 'border-primary bg-primary-50': selectedPaymentMethod === method.id }"
            @click="selectPaymentMethod(method.id)"
          >
            <div class="flex items-center">
              <div class="card-icon mr-3">
                <img 
                  v-if="method.card.brand === 'visa'" 
                  src="/images/visa.svg" 
                  alt="Visa" 
                  class="h-8 w-auto"
                />
                <img 
                  v-else-if="method.card.brand === 'mastercard'" 
                  src="/images/mastercard.svg" 
                  alt="Mastercard" 
                  class="h-8 w-auto"
                />
                <img 
                  v-else-if="method.card.brand === 'amex'" 
                  src="/images/amex.svg" 
                  alt="American Express" 
                  class="h-8 w-auto"
                />
                <div v-else class="h-8 w-12 bg-gray-200 rounded flex items-center justify-center">
                  <span class="text-xs uppercase">{{ method.card.brand }}</span>
                </div>
              </div>
              
              <div class="card-details">
                <div class="text-sm font-medium">•••• •••• •••• {{ method.card.last4 }}</div>
                <div class="text-xs text-gray-500">
                  Expira {{ method.card.exp_month }}/{{ method.card.exp_year }}
                </div>
              </div>
              
              <div class="ml-auto">
                <button 
                  type="button"
                  class="text-red-600 hover:text-red-800"
                  @click.stop="handleDeletePaymentMethod(method.id)"
                  aria-label="Eliminar método de pago"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <button 
            type="button"
            class="text-primary hover:text-primary-dark text-sm font-medium"
            @click="showNewCardForm = !showNewCardForm"
          >
            {{ showNewCardForm ? 'Cancelar' : 'Añadir nueva tarjeta' }}
          </button>
        </div>
      </div>
      
      <!-- Formulario de nueva tarjeta -->
      <div v-if="showNewCardForm || paymentMethods.length === 0">
        <h3 class="text-lg font-medium mb-3">
          {{ paymentMethods.length > 0 ? 'Añadir nueva tarjeta' : 'Información de pago' }}
        </h3>
        
        <div class="card-element-container mb-4">
          <div ref="cardElement" class="p-3 border rounded-md"></div>
          <div v-if="cardError" class="mt-2 text-sm text-red-600">{{ cardError }}</div>
        </div>
        
        <div class="flex items-center mb-6">
          <input 
            type="checkbox" 
            id="save-card" 
            v-model="saveCard"
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label for="save-card" class="ml-2 block text-sm text-gray-700">
            Guardar esta tarjeta para futuros pagos
          </label>
        </div>
      </div>
      
      <!-- Resumen del pago -->
      <div class="payment-summary bg-gray-50 p-4 rounded-md mb-6">
        <h3 class="text-lg font-medium mb-2">Resumen del pago</h3>
        
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Subtotal</span>
          <span>{{ formatCurrency(amount - calculateTax()) }}</span>
        </div>
        
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Impuestos</span>
          <span>{{ formatCurrency(calculateTax()) }}</span>
        </div>
        
        <div class="border-t border-gray-200 my-2"></div>
        
        <div class="flex justify-between font-medium">
          <span>Total</span>
          <span>{{ formatCurrency(amount) }}</span>
        </div>
      </div>
      
      <!-- Botón de pago -->
      <button 
        type="button"
        class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        :disabled="isProcessing || (!selectedPaymentMethod && !cardComplete)"
        @click="handleSubmit"
      >
        <span v-if="isProcessing" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Procesando...
        </span>
        <span v-else>Pagar {{ formatCurrency(amount) }}</span>
      </button>
      
      <!-- Mensaje de error -->
      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
// Actualizar importaciones para usar los componentes consolidados
import { Form, FormField } from '@/components/form/Form.vue';
import { useCache } from '@/services/cache/unified-cache.js';
import { usePaymentService } from '@/services/payment';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { deletePaymentMethod } from '@/services/payment'; // Declare the variable before using it

const props = defineProps({
  amount: {
    type: Number,
    required: true,
    validator: (value) => {
      if (!value && value !== 0) {
        console.error('La propiedad amount es requerida en PaymentForm');
        return false;
      }
      return value >= 0;
    }
  },
  currency: {
    type: String,
    default: 'eur'
  },
  customerId: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  metadata: {
    type: Object,
    default: () => ({})
  },
  taxRate: {
    type: Number,
    default: 0.21 // 21% IVA por defecto
  }
});

const emit = defineEmits(['success', 'error']);

// Referencias
const cardElement = ref(null);

// Estado local
const cardComplete = ref(false);
const cardError = ref('');
const isProcessing = ref(false);
const showNewCardForm = ref(false);
const saveCard = ref(true);
const stripeElements = ref(null);
const stripeCardElement = ref(null);

// Obtener el servicio de pagos
const {
  isLoading,
  paymentMethods,
  selectedPaymentMethod,
  error,
  initializePaymentService,
  createStripeElements,
  processPayment,
  fetchSavedPaymentMethods,
  selectPaymentMethod,
  clearError
} = usePaymentService();

// Calcular impuestos
const calculateTax = () => {
  return Math.round(props.amount * props.taxRate);
};

// Formatear moneda
const formatCurrency = (amount) => {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: props.currency.toUpperCase(),
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount / 100);
};

// Inicializar Stripe
const initializeStripe = async () => {
  try {
    await initializePaymentService({
      stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY
    });
    
    // Cargar métodos de pago guardados si hay un customerId
    if (props.customerId) {
      await fetchSavedPaymentMethods(props.customerId);
    }
    
    // Crear elementos de Stripe
    stripeElements.value = createStripeElements({
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          colorDanger: '#ef4444',
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          spacingUnit: '4px',
          borderRadius: '4px'
        }
      }
    });
    
    // Montar el elemento de tarjeta
    if (cardElement.value) {
      stripeCardElement.value = stripeElements.value.create('card', {
        hidePostalCode: true,
        style: {
          base: {
            fontSize: '16px',
            color: '#1f2937',
            '::placeholder': {
              color: '#9ca3af'
            }
          }
        }
      });
      
      stripeCardElement.value.mount(cardElement.value);
      
      // Escuchar eventos
      stripeCardElement.value.on('change', (event) => {
        cardComplete.value = event.complete;
        cardError.value = event.error ? event.error.message : '';
      });
    }
  } catch (error) {
    console.error('Error al inicializar Stripe:', error);
    cardError.value = 'Error al inicializar el formulario de pago. Por favor, recarga la página.';
  }
};

// Manejar envío del formulario
const handleSubmit = async () => {
  clearError();
  isProcessing.value = true;
  
  try {
    let paymentMethodId = selectedPaymentMethod.value;
    
    // Si no hay un método de pago seleccionado, crear uno nuevo
    if (!paymentMethodId) {
      const { error, paymentMethod } = await stripeElements.value.submit();
      
      if (error) {
        throw new Error(error.message || 'Error al procesar la tarjeta');
      }
      
      paymentMethodId = paymentMethod.id;
    }
    
    // Procesar el pago
    const result = await processPayment({
      amount: props.amount,
      currency: props.currency,
      paymentMethodId,
      customerId: props.customerId,
      description: props.description,
      metadata: {
        ...props.metadata,
        saveCard: saveCard.value
      }
    });
    
    if (result.success) {
      emit('success', result.paymentIntent);
    } else {
      emit('error', result.error);
    }
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    cardError.value = error.message || 'Error al procesar el pago';
    emit('error', error.message || 'Error al procesar el pago');
  } finally {
    isProcessing.value = false;
  }
};

// Eliminar método de pago
const handleDeletePaymentMethod = async (paymentMethodId) => {
  if (confirm('¿Estás seguro de que deseas eliminar este método de pago?')) {
    try {
      await deletePaymentMethod({
        customerId: props.customerId,
        paymentMethodId
      });
      
      // Si el método eliminado era el seleccionado, deseleccionarlo
      if (selectedPaymentMethod.value === paymentMethodId) {
        selectPaymentMethod(null);
      }
    } catch (error) {
      console.error('Error al eliminar el método de pago:', error);
    }
  }
};

// Inicializar al montar el componente
onMounted(() => {
  initializeStripe();
});

// Limpiar al desmontar
onBeforeUnmount(() => {
  if (stripeCardElement.value) {
    stripeCardElement.value.unmount();
  }
});

// Observar cambios en los métodos de pago
watch(paymentMethods, (newMethods) => {
  // Si hay métodos de pago y no hay uno seleccionado, seleccionar el primero
  if (newMethods.length > 0 && !selectedPaymentMethod.value) {
    selectPaymentMethod(newMethods[0].id);
  }
});
</script>

<style scoped>
.payment-form {
  position: relative;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.payment-method-card {
  transition: all 0.2s ease;
}

.payment-method-card:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-50);
}
</style>
