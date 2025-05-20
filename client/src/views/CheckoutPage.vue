<template>
  <div class="checkout-page">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner message="Cargando información de pago..." />
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <AlertCircle class="error-icon" />
        <p>{{ error }}</p>
      </div>
      <button @click="loadReserva" class="btn btn-primary">
        Reintentar
      </button>
    </div>
    
    <div v-else-if="paymentFailed" class="payment-failed-container">
      <div class="payment-failed-message">
        <XCircle class="error-icon" />
        <h2>Pago Fallido</h2>
        <p>Tu último intento de pago no pudo ser procesado. Por favor, intenta nuevamente con otro método de pago.</p>
      </div>
      
      <div class="payment-details">
        <h3>Detalles de la Reserva</h3>
        <div class="detail-item">
          <span class="detail-label">Reserva:</span>
          <span class="detail-value">#{{ currentReserva.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Destino:</span>
          <span class="detail-value">{{ currentReserva.destino }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">{{ formatDate(currentReserva.fecha_salida) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Importe:</span>
          <span class="detail-value">{{ formatPrice(currentReserva.precio_total) }}</span>
        </div>
      </div>
      
      <div class="actions">
        <button @click="retryPayment" class="btn btn-primary">
          Intentar Pago Nuevamente
        </button>
        <router-link :to="`/reservas/${reservaId}`" class="btn btn-outline">
          Ver Detalles de la Reserva
        </router-link>
        <router-link to="/reservas" class="btn btn-text">
          Volver a Mis Reservas
        </router-link>
      </div>
    </div>
    
    <div v-else-if="paymentAbandoned" class="payment-abandoned-container">
      <div class="payment-abandoned-message">
        <AlertTriangle class="warning-icon" />
        <h2>Pago Pendiente</h2>
        <p>Tu reserva está pendiente de pago. Por favor, completa el proceso de pago para confirmar tu reserva.</p>
      </div>
      
      <div class="payment-details">
        <h3>Detalles de la Reserva</h3>
        <div class="detail-item">
          <span class="detail-label">Reserva:</span>
          <span class="detail-value">#{{ currentReserva.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Destino:</span>
          <span class="detail-value">{{ currentReserva.destino }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">{{ formatDate(currentReserva.fecha_salida) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Importe:</span>
          <span class="detail-value">{{ formatPrice(currentReserva.precio_total) }}</span>
        </div>
      </div>
      
      <div class="actions">
        <button @click="retryPayment" class="btn btn-primary">
          Completar Pago
        </button>
        <router-link :to="`/reservas/${reservaId}`" class="btn btn-outline">
          Ver Detalles de la Reserva
        </router-link>
        <router-link to="/reservas" class="btn btn-text">
          Volver a Mis Reservas
        </router-link>
      </div>
    </div>
    
    <div v-else-if="currentReserva">
      <CheckoutPayment :reservaId="reservaId" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AlertCircle, XCircle, AlertTriangle } from 'lucide-vue-next';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import CheckoutPayment from '../components/checkout/CheckoutPayment.vue';
import { useReservas } from '../composables/useReservas';
import { formatPrice, formatDate } from '../utils/format';
import { pagosService } from '../services/pagos';
import { useToast } from '../composables/useToast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const reservaId = computed(() => route.params.id);
const { loading, error, currentReserva, loadReserva } = useReservas();
const processingPayment = ref(false);
const reservaEstado = ref(null);

// Computed properties para determinar el estado del pago
const paymentFailed = computed(() => {
  return reservaEstado.value === 'PAGO_FALLIDO';
});

const paymentAbandoned = computed(() => {
  return reservaEstado.value === 'PAGO_ABANDONADO';
});

// Función para reintentar el pago
async function retryPayment() {
  if (processingPayment.value) return;
  
  processingPayment.value = true;
  
  try {
    // Crear una nueva sesión de checkout
    const sessionResponse = await pagosService.createCheckoutSession({
      reservaId: reservaId.value,
      amount: currentReserva.value.precio_total
    });
    
    // Redirigir al checkout de Stripe
    await pagosService.redirectToCheckout(sessionResponse.sessionId);
  } catch (error) {
    console.error('Error al reintentar el pago:', error);
    toast.error('Error', 'No se pudo iniciar el proceso de pago. Por favor, inténtalo nuevamente.');
  } finally {
    processingPayment.value = false;
  }
}

const cargarDatosReserva = async () => {
  loading.value = true;
  error.value = null;
  
  // Validar que el ID existe
  if (!reservaId.value) {
    error.value = 'ID de reserva no especificado';
    loading.value = false;
    return;
  }
  
  try {
    const data = await loadReserva(reservaId.value);
    
    if (!data) {
      error.value = 'La reserva solicitada no existe';
      loading.value = false;
      return;
    }
    
    // Verificar que la reserva está en estado pendiente de pago
    if (data.estado !== 'pendiente' && data.estado !== 'pago_fallido' && data.estado !== 'pago_abandonado') {
      error.value = 'Esta reserva no está pendiente de pago';
      setTimeout(() => {
        router.push(`/reservas/${reservaId.value}`);
      }, 3000);
      return;
    }
    
    currentReserva.value = data;
    reservaEstado.value = data.estado;
    
    // Cargar datos relacionados si es necesario
    // ...
  } catch (err) {
    console.error('Error al cargar datos de la reserva:', err);
    
    if (err.response?.status === 404) {
      error.value = 'La reserva solicitada no existe o ha sido eliminada.';
    } else if (err.response?.status === 403) {
      error.value = 'No tienes permisos para acceder a esta reserva.';
      setTimeout(() => {
        router.push('/reservas');
      }, 3000);
    } else {
      error.value = 'No se pudo cargar la información de la reserva. Por favor, intenta nuevamente.';
    }
  } finally {
    loading.value = false;
  }
};

// Vigilar cambios en el ID para recargar datos
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    cargarDatosReserva();
  }
}, { immediate: false });

onMounted(() => {
  cargarDatosReserva();
});
</script>

<style scoped>
.checkout-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-container, .error-container, .payment-failed-container, .payment-abandoned-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  min-height: 400px;
}

.error-message, .payment-failed-message, .payment-abandoned-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.error-icon {
  font-size: 3rem;
  color: var(--color-error);
  margin-bottom: 1rem;
}

.warning-icon {
  font-size: 3rem;
  color: var(--color-warning);
  margin-bottom: 1rem;
}

.payment-details {
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 500px;
}

.payment-details h3 {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.detail-value {
  font-weight: 600;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
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
  text-decoration: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover {
  background-color: rgba(0, 180, 216, 0.1);
}

.btn-text {
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
}

.btn-text:hover {
  color: var(--color-text);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
