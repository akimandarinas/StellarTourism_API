<template>
  <div class="add-payment-method-form">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner message="Cargando procesador de pagos..." />
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <AlertCircle class="error-icon" />
        <p>{{ error }}</p>
      </div>
      <button @click="initializeStripeElements" class="btn btn-primary">
        Reintentar
      </button>
    </div>
    
    <div v-else>
      <form @submit.prevent="handleSubmit" class="payment-form">
        <div class="form-group">
          <label for="card-holder-name">Nombre en la tarjeta</label>
          <input 
            type="text" 
            id="card-holder-name" 
            v-model="billingDetails.name" 
            placeholder="Nombre completo" 
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="card-element">Datos de la tarjeta</label>
          <div id="card-element" class="card-element"></div>
          <div v-if="cardError" class="card-error">{{ cardError }}</div>
        </div>
        
        <div class="form-group">
          <label for="billing-email">Email</label>
          <input 
            type="email" 
            id="billing-email"
            :value="billingDetails.email"
            @input="updateBillingEmail"
            placeholder="correo@ejemplo.com" 
            required
            class="form-input"
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
            >
              <option value="">Selecciona un país</option>
              <option value="ES">España</option>
              <option value="US">Estados Unidos</option>
              <option value="MX">México</option>
              <option value="AR">Argentina</option>
              <option value="CO">Colombia</option>
              <option value="CL">Chile</option>
              <option value="PE">Perú</option>
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
            />
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="processing || !stripeLoaded"
          >
            <Loader2 v-if="processing" class="spinner" size="16" />
            <span v-else>Guardar tarjeta</span>
          </button>
          
          <button 
            type="button" 
            class="btn btn-outline" 
            @click="$emit('cancel')"
            :disabled="processing"
          >
            Cancelar
          </button>
        </div>
      </form>
      
      <div v-if="showTestCards" class="test-cards">
        <h4>Tarjetas de prueba</h4>
        <p class="test-cards-info">Usa estas tarjetas para probar diferentes escenarios:</p>
        
        <div class="test-card-list">
          <div class="test-card">
            <div class="test-card-type">Visa (Pago exitoso)</div>
            <div class="test-card-number">{{ PAYMENT_CONFIG.testCards.visa }}</div>
            <button @click="fillTestCard(PAYMENT_CONFIG.testCards.visa)" class="btn-text">
              Usar
            </button>
          </div>
          
          <div class="test-card">
            <div class="test-card-type">Mastercard (Pago exitoso)</div>
            <div class="test-card-number">{{ PAYMENT_CONFIG.testCards.mastercard }}</div>
            <button @click="fillTestCard(PAYMENT_CONFIG.testCards.mastercard)" class="btn-text">
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useStripePayment } from '../../composables/useStripePayment';
import { useAuth } from '../../composables/useAuth';
import { PAYMENT_CONFIG } from '../../config/stripe';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { AlertCircle, Loader2, InfoIcon } from 'lucide-vue-next';

const props = defineProps({
  showTestCards: {
    type: Boolean,
    default: process.env.NODE_ENV !== 'production'
  }
});

const emit = defineEmits(['success', 'error', 'cancel']);

// Estado
const {
  loading: stripeLoading,
  error: stripeError,
  cardElement,
  initializeStripe,
  createCardElement,
  createPaymentMethod,
  savePaymentMethod,
  clearCardElement,
  destroyCardElement
} = useStripePayment();

const { user } = useAuth();

const loading = ref(false);
const error = ref(null);
const cardError = ref(null);
const processing = ref(false);
const stripeLoaded = ref(false);

const initialBillingDetails = {
  name: '',
  email: user.value?.email || '',
  address: {
    country: 'ES',
    postal_code: ''
  }
};

const billingDetails = ref({ ...initialBillingDetails });

// Función para actualizar el email de facturación
const updateBillingEmail = (event) => {
  if (event && event.target) {
    billingDetails.value.email = event.target.value;
  }
};

// Inicializar Stripe Elements
const initializeStripeElements = async () => {
  loading.value = true;
  error.value = null;
  cardError.value = null;
  
  try {
    // Inicializar Stripe
    await initializeStripe();
    
    // Crear elemento de tarjeta
    setTimeout(() => {
      const card = createCardElement('card-element');
      
      // Escuchar cambios en el elemento de tarjeta
      if (card) {
        card.addEventListener('change', (event) => {
          cardError.value = event.error ? event.error.message : null;
        });
      }
      
      stripeLoaded.value = true;
      loading.value = false;
    }, 100);
  } catch (err) {
    console.error('Error al inicializar Stripe Elements:', err);
    error.value = 'No se pudo inicializar el procesador de pagos. Por favor, inténtalo de nuevo.';
    loading.value = false;
  }
};

// Manejar envío del formulario
const handleSubmit = async () => {
  if (processing.value) return;
  
  processing.value = true;
  error.value = null;
  cardError.value = null;
  
  try {
    // Crear método de pago
    const paymentMethod = await createPaymentMethod(billingDetails.value);
    
    if (!paymentMethod || !paymentMethod.id) {
      throw new Error('No se pudo crear el método de pago');
    }
    
    // Guardar método de pago
    await savePaymentMethod(paymentMethod.id);
    
    // Emitir evento de éxito
    emit('success', paymentMethod);
    
    // Limpiar formulario
    clearCardElement();
    billingDetails.value = { ...initialBillingDetails };
  } catch (err) {
    console.error('Error al guardar método de pago:', err);
    error.value = err.message || 'Error al guardar método de pago. Por favor, verifica los datos e inténtalo de nuevo.';
    emit('error', err);
  } finally {
    processing.value = false;
  }
};

// Rellenar tarjeta de prueba
const fillTestCard = (cardNumber) => {
  if (!cardNumber) return;
  
  // No podemos modificar directamente el valor del elemento de tarjeta,
  // pero podemos mostrar el número para que el usuario lo copie
  navigator.clipboard.writeText(cardNumber)
    .then(() => {
      alert(`Número de tarjeta copiado al portapapeles: ${cardNumber}`);
    })
    .catch(err => {
      console.error('Error al copiar al portapapeles:', err);
      alert(`Usa este número de tarjeta: ${cardNumber}`);
    });
};

// Ciclo de vida
onMounted(() => {
  initializeStripeElements();
});

onUnmounted(() => {
  destroyCardElement();
});
</script>

<style scoped>
.add-payment-method-form {
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

.card-error {
  color: var(--color-error);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.form-actions {
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

.btn-text:hover {
  text-decoration: underline;
}

.test-cards-note {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
}

.info-icon {
  margin-right: 0.5rem;
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .test-card-list {
    grid-template-columns: 1fr;
  }
}
</style>
