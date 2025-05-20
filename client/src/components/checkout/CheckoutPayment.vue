<template>
  <div class="checkout-payment">
    <div class="checkout-header">
      <h2>Finalizar Reserva</h2>
      <div class="checkout-steps">
        <div class="step completed">
          <div class="step-number">1</div>
          <div class="step-label">Detalles</div>
        </div>
        <div class="step-line"></div>
        <div class="step active">
          <div class="step-number">2</div>
          <div class="step-label">Pago</div>
        </div>
        <div class="step-line"></div>
        <div class="step" :class="{ completed: paymentCompleted }">
          <div class="step-number">3</div>
          <div class="step-label">Confirmación</div>
        </div>
      </div>
    </div>
    
    <div class="checkout-content">
      <div class="payment-section">
        <div v-if="!paymentCompleted">
          <div class="payment-methods">
            <h3>Método de Pago</h3>
            
            <div class="payment-options">
              <div 
                class="payment-option" 
                :class="{ selected: paymentMethodState === 'card' }"
                @click="selectPaymentMethod('card')"
              >
                <div class="option-icon">
                  <CreditCard size="20" />
                </div>
                <div class="option-content">
                  <div class="option-title">Tarjeta de Crédito/Débito</div>
                  <div class="option-description">Pago seguro con tarjeta</div>
                </div>
                <div v-if="paymentMethodState === 'card'" class="option-check">
                  <Check size="16" />
                </div>
              </div>
              
              <div 
                class="payment-option" 
                :class="{ selected: paymentMethodState === 'saved_card' }"
                @click="selectPaymentMethod('saved_card')"
                v-if="isAuthenticated && hasSavedCards"
              >
                <div class="option-icon">
                  <CreditCard size="20" />
                </div>
                <div class="option-content">
                  <div class="option-title">Tarjeta Guardada</div>
                  <div class="option-description">Usa una de tus tarjetas guardadas</div>
                </div>
                <div v-if="paymentMethodState === 'saved_card'" class="option-check">
                  <Check size="16" />
                </div>
              </div>
              
              <div 
                class="payment-option" 
                :class="{ selected: paymentMethodState === 'checkout' }"
                @click="selectPaymentMethod('checkout')"
              >
                <div class="option-icon">
                  <CreditCard size="20" />
                </div>
                <div class="option-content">
                  <div class="option-title">Checkout de Stripe</div>
                  <div class="option-description">Pago seguro a través de Stripe Checkout</div>
                </div>
                <div v-if="paymentMethodState === 'checkout'" class="option-check">
                  <Check size="16" />
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="paymentMethodState === 'card'" class="payment-form">
            <StripePaymentForm 
              :amount="currentReserva.PRECIO * 100"
              :currency="'eur'"
              :description="`Reserva para ${currentReserva.DESTINO_NOMBRE}`"
              :metadata="{
                reservaId: currentReserva.ID,
                destinoId: currentReserva.ID_DESTINO,
                naveId: currentReserva.ID_NAVE
              }"
              @success="handlePaymentSuccess"
              @error="handlePaymentError"
            />
          </div>
          
          <div v-else-if="paymentMethodState === 'saved_card'" class="payment-form">
            <SavedPaymentMethods 
              @select="handleSavedCardSelect"
            />
            
            <div v-if="selectedPaymentMethod" class="saved-card-payment">
              <h4>Pagar con tarjeta seleccionada</h4>
              <div class="selected-card-info">
                <div class="card-icon">
                  <CreditCard size="20" />
                </div>
                <div class="card-details">
                  <div class="card-name">{{ selectedPaymentMethod.billing_details.name }}</div>
                  <div class="card-number">•••• {{ selectedPaymentMethod.card.last4 }}</div>
                  <div class="card-expiry">Expira: {{ selectedPaymentMethod.card.exp_month }}/{{ selectedPaymentMethod.card.exp_year.toString().slice(-2) }}</div>
                </div>
              </div>
              
              <div class="payment-actions">
                <button 
                  @click="processSavedCardPayment" 
                  class="btn btn-primary" 
                  :disabled="processing"
                >
                  <Loader2 v-if="processing" class="spinner" size="16" />
                  <span v-else>Pagar {{ formatPrice(currentReserva.PRECIO) }}</span>
                </button>
              </div>
            </div>
          </div>
          
          <div v-else-if="paymentMethodState === 'checkout'" class="payment-form">
            <div class="checkout-info">
              <h4>Pago con Stripe Checkout</h4>
              <p>Serás redirigido a la página segura de Stripe para completar tu pago.</p>
              
              <div class="sandbox-info" v-if="isSandboxMode">
                <div class="sandbox-header">
                  <InfoIcon size="16" />
                  <span>Modo Sandbox - Tarjetas de prueba</span>
                </div>
                <div class="test-cards">
                  <div class="test-card" v-for="(card, type) in testCards" :key="type">
                    <div class="card-type">{{ type }}</div>
                    <div class="card-number">{{ card }}</div>
                    <button @click="copyCardNumber(card)" class="copy-btn">
                      <Copy size="14" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="payment-actions">
                <button 
                  @click="processCheckoutPayment" 
                  class="btn btn-primary" 
                  :disabled="processing"
                >
                  <Loader2 v-if="processing" class="spinner" size="16" />
                  <span v-else>Continuar al Checkout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="payment-success">
          <div class="success-icon">
            <CheckCircle size="48" />
          </div>
          <h3>¡Pago Completado!</h3>
          <p>Tu reserva ha sido confirmada. Hemos enviado un correo electrónico con los detalles de tu viaje.</p>
          
          <div class="payment-details">
            <div class="detail-item">
              <span class="detail-label">Número de reserva:</span>
              <span class="detail-value">{{ currentReserva.ID }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Método de pago:</span>
              <span class="detail-value">{{ getPaymentMethodName() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Fecha de pago:</span>
              <span class="detail-value">{{ formatDate(new Date()) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Importe:</span>
              <span class="detail-value">{{ formatPrice(currentReserva.PRECIO) }}</span>
            </div>
          </div>
          
          <div class="success-actions">
            <router-link to="/reservas" class="btn btn-primary">Ver Mis Reservas</router-link>
            <router-link :to="`/reservas/${currentReserva.ID}`" class="btn btn-outline">Ver Detalles</router-link>
          </div>
        </div>
      </div>
      
      <div class="order-summary">
        <h3>Resumen de la Reserva</h3>
        
        <div class="summary-content">
          <div class="summary-destination">
            <h4>{{ currentReserva.DESTINO_NOMBRE }}</h4>
            <p>{{ currentReserva.RUTA_NOMBRE }}</p>
          </div>
          
          <div class="summary-details">
            <div class="summary-item">
              <span class="item-label">Nave:</span>
              <span class="item-value">{{ currentReserva.NAVE_NOMBRE }}</span>
            </div>
            <div class="summary-item">
              <span class="item-label">Fecha de salida:</span>
              <span class="item-value">{{ formatDate(currentReserva.FECHA_DESPEGUE) }}</span>
            </div>
            <div class="summary-item">
              <span class="item-label">Fecha de retorno:</span>
              <span class="item-value">{{ formatDate(currentReserva.FECHA_RETORNO) }}</span>
            </div>
            <div class="summary-item">
              <span class="item-label">Pasajeros:</span>
              <span class="item-value">{{ currentReserva.PASAJEROS }}</span>
            </div>
          </div>
          
          <div class="summary-price">
            <div class="price-item">
              <span>Precio base:</span>
              <span>{{ formatPrice(currentReserva.PRECIO_BASE) }}</span>
            </div>
            <div v-if="currentReserva.PRECIO_ACTIVIDADES" class="price-item">
              <span>Actividades:</span>
              <span>{{ formatPrice(currentReserva.PRECIO_ACTIVIDADES) }}</span>
            </div>
            <div v-if="currentReserva.PRECIO_SEGURO" class="price-item">
              <span>Seguro:</span>
              <span>{{ formatPrice(currentReserva.PRECIO_SEGURO) }}</span>
            </div>
            <div v-if="currentReserva.DESCUENTO" class="price-item discount">
              <span>Descuento:</span>
              <span>-{{ formatPrice(currentReserva.DESCUENTO) }}</span>
            </div>
            <div class="price-item total">
              <span>Total:</span>
              <span>{{ formatPrice(currentReserva.PRECIO) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStripe } from '@/composables/useStripe';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { formatPrice } from '@/utils/format';
import { CreditCard, Check, Loader2, CheckCircle, InfoIcon, Copy } from 'lucide-vue-next';
import StripePaymentForm from './StripePaymentForm.vue';
import SavedPaymentMethods from './SavedPaymentMethods.vue';
import { useReservas } from '../../composables/useReservas';
import { stripeService } from '../../services/stripe';
import { maskCreditCard, maskName } from '../../utils/data-masking';

const props = defineProps({
  reservaId: {
    type: [String, Number],
    required: true
  }
});

const { isAuthenticated, user } = useAuth();
const { showToast } = useToast();
const { currentReserva, processPayment, confirmPayment } = useReservas();

const paymentMethodState = ref('card');
const processing = ref(false);
const paymentCompleted = ref(false);
const selectedPaymentMethod = ref(null);
const savedPaymentMethods = ref([]);

const maskedCardNumber = computed(() => {
  if (!props.reservaId || !props.reservaId.cardNumber) return '';
  return maskCreditCard(props.reservaId.cardNumber);
});

const maskedCardHolder = computed(() => {
  if (!props.reservaId || !props.reservaId.cardHolder) return '';
  return maskName(props.reservaId.cardHolder);
});

const hasSavedCards = computed(() => savedPaymentMethods.value.length > 0);
const isSandboxMode = computed(() => stripeService.isSandboxMode());
const testCards = computed(() => {
  if (!isSandboxMode.value) return {};
  
  return {
    'Visa (Éxito)': stripeService.getTestCard('visa'),
    'Mastercard (Éxito)': stripeService.getTestCard('mastercard'),
    'Visa (Rechazada)': stripeService.getTestCard('declined'),
    'Visa (Fondos insuficientes)': stripeService.getTestCard('insufficient')
  };
});

const loadSavedPaymentMethods = async () => {
  if (!isAuthenticated.value) return;
  
  try {
    const methods = await stripeService.getPaymentMethods(user.value.uid);
    savedPaymentMethods.value = methods;
    
    if (methods.length > 0) {
      paymentMethodState.value = 'saved_card';
    }
  } catch (err) {
    console.error('Error loading saved payment methods:', err);
  }
};

const selectPaymentMethod = (method) => {
  paymentMethodState.value = method;
  if (method !== 'saved_card') {
    selectedPaymentMethod.value = null;
  }
};

const handleSavedCardSelect = (method) => {
  selectedPaymentMethod.value = method;
};

const handlePaymentSuccess = (paymentResult) => {
  confirmPayment(props.reservaId, paymentResult.id);
  paymentCompleted.value = true;
};

const handlePaymentError = (error) => {
  showToast({
    title: 'Error de pago',
    description: error.message || 'Error al procesar el pago. Por favor, inténtalo de nuevo.',
    type: 'error',
  });
};

const processSavedCardPayment = async () => {
  if (!selectedPaymentMethod.value) {
    showToast({
      title: 'Error',
      description: 'Por favor, selecciona una tarjeta para continuar',
      type: 'error',
    });
    return;
  }
  
  processing.value = true;
  
  try {
    const paymentData = {
      payment_method: selectedPaymentMethod.value.id,
      payment_method_types: ['card'],
      customer: user.value.uid
    };
    
    await processPayment(props.reservaId, paymentData);
    paymentCompleted.value = true;
  } catch (err) {
    console.error('Error processing payment with saved card:', err);
    
    showToast({
      title: 'Error de pago',
      description: err.message || 'Error al procesar el pago. Por favor, inténtalo de nuevo.',
      type: 'error',
    });
  } finally {
    processing.value = false;
  }
};

const processCheckoutPayment = async () => {
  processing.value = true;
  
  try {
    await processPayment(props.reservaId, {
      payment_method_types: ['card'],
      allow_promotion_codes: true
    });
    paymentCompleted.value = true;
  } catch (err) {
    console.error('Error processing checkout payment:', err);
    
    showToast({
      title: 'Error de pago',
      description: err.message || 'Error al procesar el pago. Por favor, inténtalo de nuevo.',
      type: 'error',
    });
  } finally {
    processing.value = false;
  }
};

const copyCardNumber = (cardNumber) => {
  navigator.clipboard.writeText(cardNumber).then(() => {
    showToast({
      title: 'Copiado',
      description: 'Número de tarjeta copiado al portapapeles',
      type: 'success',
    });
  }).catch(err => {
    console.error('Error copying to clipboard:', err);
  });
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const getPaymentMethodName = () => {
  switch (paymentMethodState.value) {
    case 'card':
      return 'Tarjeta de Crédito/Débito';
    case 'saved_card':
      return `Tarjeta guardada (${selectedPaymentMethod.value?.card?.last4 || ''})`;
    case 'checkout':
      return 'Stripe Checkout';
    default:
      return '';
  }
};

onMounted(() => {
  loadSavedPaymentMethods();
});
</script>

<style scoped>
.checkout-payment {
  width: 100%;
}

.checkout-header {
  margin-bottom: 2rem;
}

.checkout-header h2 {
  font-size: 1.8rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.checkout-steps {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  border: 2px solid var(--color-text-secondary);
}

.step.active .step-number {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.step.completed .step-number {
  background-color: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.step-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.step.active .step-label {
  color: var(--color-primary);
  font-weight: bold;
}

.step.completed .step-label {
  color: var(--color-success);
}

.step-line {
  flex-grow: 1;
  height: 2px;
  background-color: var(--color-text-secondary);
}

.checkout-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.payment-section {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 2rem;
}

.payment-methods h3, .payment-form h3 {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  background-color: rgba(26, 26, 46, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-option:hover {
  background-color: rgba(26, 26, 46, 0.8);
}

.payment-option.selected {
  background-color: rgba(0, 180, 216, 0.1);
  border: 1px solid var(--color-primary);
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(26, 26, 46, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: var(--color-primary);
}

.option-content {
  flex-grow: 1;
}

.option-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.option-description {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.option-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-form {
  margin-top: 2rem;
}

.saved-card-payment {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-sm);
}

.saved-card-payment h4 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.selected-card-info {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: rgba(26, 26, 46, 0.8);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-primary);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(26, 26, 46, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: var(--color-primary);
}

.card-details {
  flex-grow: 1;
}

.card-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.card-number {
  font-family: monospace;
  margin-bottom: 0.25rem;
}

.card-expiry {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.checkout-info {
  padding: 1.5rem;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-sm);
}

.checkout-info h4 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.checkout-info p {
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
}

.sandbox-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: rgba(255, 193, 7, 0.1);
  border-radius: var(--border-radius-sm);
  border-left: 4px solid var(--color-warning);
}

.sandbox-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: var(--color-warning);
  font-weight: 600;
}

.sandbox-header svg {
  margin-right: 0.5rem;
}

.test-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.test-card {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-sm);
}

.card-type {
  font-size: 0.8rem;
  width: 150px;
  color: var(--color-text-secondary);
}

.card-number {
  flex-grow: 1;
  font-family: monospace;
  font-size: 0.9rem;
}

.copy-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.copy-btn:hover {
  color: var(--color-primary);
}

.payment-actions {
  display: flex;
  justify-content: center;
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
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover {
  background-color: rgba(0, 180, 216, 0.1);
}

.payment-success {
  text-align: center;
  padding: 2rem 0;
}

.success-icon {
  width: 80px;
  height: 80px;
  background-color: var(--color-success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.payment-success h3 {
  font-size: 1.8rem;
  color: var(--color-success);
  margin-bottom: 1rem;
}

.payment-success p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.payment-details {
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-sm);
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-label {
  color: var(--color-text-secondary);
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.order-summary {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  height: fit-content;
}

.order-summary h3 {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.summary-destination h4 {
  font-size: 1.2rem;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.summary-destination p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.summary-details {
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.item-label {
  color: var(--color-text-secondary);
}

.summary-price {
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.price-item.discount {
  color: var(--color-success);
}

.price-item.total {
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 992px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  
  .order-summary {
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .success-actions {
    flex-direction: column;
  }
}
</style>
