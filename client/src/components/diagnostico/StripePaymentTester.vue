<template>
  <div class="stripe-payment-tester">
    <h3 class="text-lg font-semibold mb-4">Prueba de Pagos con Stripe</h3>
    
    <div v-if="!stripeInitialized" class="mb-4">
      <p class="text-yellow-600 bg-yellow-100 p-3 rounded">
        Inicializando Stripe... Si este mensaje persiste, puede que haya un problema con la configuración de Stripe.
      </p>
      <button 
        @click="initializeStripe" 
        class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Reintentar inicialización
      </button>
    </div>
    
    <div v-else>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Monto de prueba
        </label>
        <div class="flex space-x-2">
          <button 
            v-for="(amount, key) in testAmounts" 
            :key="key"
            @click="selectedAmount = amount"
            class="px-3 py-1 rounded border"
            :class="selectedAmount === amount ? 'bg-blue-100 border-blue-500' : 'border-gray-300'"
          >
            {{ formatAmount(amount) }}
          </button>
          <input 
            type="number" 
            v-model.number="customAmount" 
            @input="selectedAmount = customAmount"
            placeholder="Personalizado" 
            class="border border-gray-300 rounded px-2 py-1 w-24"
            min="50"
            max="100000"
          />
        </div>
      </div>
      
      <div v-if="showCardForm" class="mb-6">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Datos de tarjeta
          </label>
          <div id="card-element" class="border border-gray-300 rounded p-3 bg-white"></div>
          <div id="card-errors" class="text-red-600 text-sm mt-1"></div>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tarjetas de prueba
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div v-for="(card, type) in testCards" :key="type" class="p-2 bg-gray-100 rounded">
              <p><strong>{{ type }}:</strong> {{ card }}</p>
            </div>
          </div>
        </div>
        
        <button 
          @click="processPayment" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          :disabled="processing"
        >
          {{ processing ? 'Procesando...' : 'Procesar pago de prueba' }}
        </button>
      </div>
      
      <div v-else class="mb-4">
        <button 
          @click="showCardForm = true" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Mostrar formulario de pago
        </button>
      </div>
      
      <div v-if="paymentResult" class="mt-4 p-4 rounded" :class="paymentResultClass">
        <h4 class="font-medium mb-2">Resultado del pago:</h4>
        <p><strong>Estado:</strong> {{ paymentResult.status }}</p>
        <p v-if="paymentResult.message"><strong>Mensaje:</strong> {{ paymentResult.message }}</p>
        <p v-if="paymentResult.id"><strong>ID:</strong> {{ paymentResult.id }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import stripeService from '../../services/stripe/stripe-service';
import { getStripeConfig, getPaymentConfig, isDevMode } from '../../config/stripe';

// Estado
const stripeInitialized = ref(false);
const cardElement = ref(null);
const showCardForm = ref(false);
const processing = ref(false);
const selectedAmount = ref(999); // 9.99 por defecto
const customAmount = ref(null);
const paymentResult = ref(null);

// Datos de configuración
const testAmounts = computed(() => {
  const config = getPaymentConfig();
  return config.development?.testAmounts || {
    small: 999,
    medium: 2500,
    large: 9999,
  };
});

const testCards = computed(() => {
  const config = getStripeConfig();
  return config.testCards || {
    visa: '4242 4242 4242 4242',
    declined: '4000 0000 0000 0002',
  };
});

// Clases CSS para el resultado del pago
const paymentResultClass = computed(() => {
  if (!paymentResult.value) return '';
  
  const status = paymentResult.value.status;
  if (status === 'succeeded' || status === 'success') {
    return 'bg-green-100 text-green-800 border border-green-200';
  } else if (status === 'requires_action' || status === 'requires_confirmation') {
    return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  } else {
    return 'bg-red-100 text-red-800 border border-red-200';
  }
});

// Métodos
const initializeStripe = async () => {
  try {
    const initialized = await stripeService.initialize();
    if (initialized) {
      stripeInitialized.value = true;
    }
  } catch (error) {
    console.error('Error al inicializar Stripe:', error);
  }
};

const setupCardElement = async () => {
  if (!stripeInitialized.value) return;
  
  try {
    const elements = await stripeService.createElements();
    if (!elements) {
      console.error('No se pudieron crear los elementos de Stripe');
      return;
    }
    
    // Crea el elemento de tarjeta
    cardElement.value = elements.create('card', {
      hidePostalCode: true,
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
    
    // Monta el elemento en el DOM
    setTimeout(() => {
      if (cardElement.value && document.getElementById('card-element')) {
        cardElement.value.mount('#card-element');
        
        // Maneja los errores
        cardElement.value.on('change', (event) => {
          const displayError = document.getElementById('card-errors');
          if (displayError) {
            displayError.textContent = event.error ? event.error.message : '';
          }
        });
      }
    }, 100);
  } catch (error) {
    console.error('Error al configurar el elemento de tarjeta:', error);
  }
};

const processPayment = async () => {
  if (!cardElement.value) {
    console.error('El elemento de tarjeta no está inicializado');
    return;
  }
  
  processing.value = true;
  paymentResult.value = null;
  
  try {
    // En un entorno real, esto vendría de tu backend
    // Para pruebas, simulamos una intención de pago
    const paymentIntent = await stripeService.createTestPaymentIntent(selectedAmount.value);
    
    // Simula un pago exitoso
    setTimeout(() => {
      paymentResult.value = {
        status: 'succeeded',
        message: 'Pago simulado procesado correctamente',
        id: paymentIntent.clientSecret,
        amount: selectedAmount.value,
        currency: 'eur',
      };
      processing.value = false;
    }, 1500);
  } catch (error: any) {
    paymentResult.value = {
      status: 'failed',
      message: error.message || 'Error al procesar el pago',
    };
    processing.value = false;
  }
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount / 100);
};

// Lifecycle hooks
onMounted(async () => {
  await initializeStripe();
  if (stripeInitialized.value) {
    setupCardElement();
  }
});

onUnmounted(() => {
  // Limpia el elemento de tarjeta
  if (cardElement.value) {
    cardElement.value.unmount();
  }
});

// Observa cambios en showCardForm
watch(showCardForm, (newValue) => {
  if (newValue && !cardElement.value) {
    setupCardElement();
  }
});
</script>
