<template>
  <div class="pago-cancelado-page">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner message="Actualizando estado de la reserva..." />
    </div>
    
    <div v-else class="cancel-container">
      <div class="cancel-icon">
        <XCircle size="64" />
      </div>
      <h1>Pago Cancelado</h1>
      <p class="cancel-message">
        El proceso de pago ha sido cancelado. No se ha realizado ningún cargo a tu método de pago.
      </p>
      
      <div class="info-box">
        <AlertTriangle class="info-icon" />
        <div class="info-content">
          <h3>¿Tuviste problemas con el pago?</h3>
          <p>Si experimentaste algún problema durante el proceso de pago, puedes intentarlo nuevamente o contactar con nuestro equipo de soporte.</p>
        </div>
      </div>
      
      <div class="actions">
        <button @click="retryPayment" class="btn btn-primary" :disabled="processingPayment">
          {{ processingPayment ? 'Procesando...' : 'Intentar Nuevamente' }}
        </button>
        <router-link :to="reservaId ? `/reservas/${reservaId}` : '/reservas'" class="btn btn-outline">
          Ver Detalles de la Reserva
        </router-link>
        <router-link to="/reservas" class="btn btn-text">
          Ver Mis Reservas
        </router-link>
        <router-link to="/contacto" class="btn btn-text">
          Contactar Soporte
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { XCircle, AlertTriangle } from '@/utils/lucide-adapter';
import { useToast } from '../composables/useToast';
import { pagosService } from '../services/pagos';
import { useReservas } from '../composables/useReservas';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';

const route = useRoute();
const router = useRouter();
const { showToast } = useToast();

const loading = ref(true);
const processingPayment = ref(false);
const reservaId = ref(null);
const toastShown = ref(false);
const reservaEstadoActualizado = ref(false); // Flag to track if reserva status has been updated

// Función para reintentar el pago
async function retryPayment() {
  if (processingPayment.value || !reservaId.value) return;
  
  processingPayment.value = true;
  
  try {
    // Cargar los detalles de la reserva
    const { loadReserva } = useReservas();
    const reserva = await loadReserva(reservaId.value);
    
    // Crear una nueva sesión de checkout
    const sessionResponse = await pagosService.createCheckoutSession({
      reservaId: reservaId.value,
      amount: reserva.precio_total
    });
    
    // Redirigir al checkout de Stripe
    await pagosService.redirectToCheckout(sessionResponse.sessionId);
  } catch (error) {
    console.error('Error al reintentar el pago:', error);
    showToast({
      title: 'Error',
      description: 'No se pudo iniciar el proceso de pago. Por favor, inténtalo nuevamente.',
      type: 'error'
    });
    processingPayment.value = false;
  }
}

onMounted(async () => {
  // Obtener el ID de la reserva desde los query params
  reservaId.value = route.query.reserva_id;

  if (reservaId.value) {
    try {
      // Actualizar el estado de la reserva a "PAGO_ABANDONADO" si está en "PENDIENTE"
      const { loadReserva, updateReservaStatus } = useReservas();
      const reserva = await loadReserva(reservaId.value);
      
      // Only update the status if it hasn't been updated yet
      if (reserva && reserva.estado === 'PENDIENTE' && !reservaEstadoActualizado.value) {
        await updateReservaStatus(reservaId.value, 'PAGO_ABANDONADO');
        reservaEstadoActualizado.value = true; // Set the flag to true after updating
      }
    } catch (error) {
      console.error('Error al actualizar el estado de la reserva:', error);
    }
  }
  
  loading.value = false;

  if (!toastShown.value) {
    showToast({
      title: 'Pago cancelado',
      description: 'El proceso de pago ha sido cancelado',
      type: 'warning',
    });
    toastShown.value = true;
  }
});
</script>

<style scoped>
.pago-cancelado-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  min-height: 400px;
}

.cancel-container {
  max-width: 800px;
  width: 100%;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  padding: 3rem;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.cancel-icon {
  width: 120px;
  height: 120px;
  background-color: var(--color-error);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

h1 {
  font-size: 2.5rem;
  color: var(--color-error);
  margin-bottom: 1.5rem;
}

.cancel-message {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.info-box {
  display: flex;
  align-items: flex-start;
  background-color: rgba(255, 193, 7, 0.1);
  border-left: 4px solid var(--color-warning);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  text-align: left;
}

.info-icon {
  color: var(--color-warning);
  margin-right: 1rem;
  flex-shrink: 0;
}

.info-content h3 {
  font-size: 1.2rem;
  color: var(--color-warning);
  margin-bottom: 0.5rem;
}

.info-content p {
  color: var(--color-text-secondary);
  margin: 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.btn {
  padding: 1rem 2rem;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
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

.btn-primary:disabled {
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

.btn-text {
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
}

.btn-text:hover {
  color: var(--color-text);
}

@media (max-width: 768px) {
  .cancel-container {
    padding: 2rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .cancel-message {
    font-size: 1rem;
  }
  
  .info-box {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .info-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>
