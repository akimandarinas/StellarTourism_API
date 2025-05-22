<template>
  <div class="pago-completado-page">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner message="Verificando el estado del pago..." />
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <AlertCircle class="error-icon" />
        <p>{{ error }}</p>
      </div>
      <router-link :to="`/reservas/${reservaId}`" class="btn btn-primary">
        Ver Detalles de la Reserva
      </router-link>
    </div>
    
    <div v-else class="success-container">
      <div class="success-icon">
        <CheckCircle size="64" />
      </div>
      <h1>¡Pago Completado con Éxito!</h1>
      <p class="success-message">
        Tu reserva ha sido confirmada y procesada correctamente. Hemos enviado un correo electrónico con los detalles de tu viaje.
      </p>
      
      <div v-if="reservaInfo" class="reservation-details">
        <h2>Detalles de la Reserva</h2>
        <div class="detail-item">
          <span class="detail-label">Número de reserva:</span>
          <span class="detail-value">{{ reservaInfo.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Destino:</span>
          <span class="detail-value">{{ reservaInfo.destino }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Fecha de salida:</span>
          <span class="detail-value">{{ formatDate(reservaInfo.fechaSalida) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Importe pagado:</span>
          <span class="detail-value">{{ formatPrice(reservaInfo.importe) }}</span>
        </div>
      </div>
      
      <div class="actions">
        <router-link to="/reservas" class="btn btn-primary">Ver Mis Reservas</router-link>
        <router-link :to="reservaInfo ? `/reservas/${reservaInfo.id}` : '/reservas'" class="btn btn-outline">
          Ver Detalles de la Reserva
        </router-link>
        <router-link to="/" class="btn btn-text">Volver al Inicio</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CheckCircle, AlertCircle } from '@/utils/lucide-adapter';
import { useToast } from '../composables/useToast';
import { pagosService } from '../services/pagos';
import { useReservas } from '../composables/useReservas';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import { formatDate, formatPrice } from '../utils/format';

const route = useRoute();
const router = useRouter();
const { showToast } = useToast();

const loading = ref(true);
const error = ref(null);
const reservaInfo = ref(null);
const sessionId = ref(null);
const reservaId = ref(null);

// Cargar los detalles de la reserva (se declara fuera del onMounted para evitar el error de hooks condicionales)
const { loadReserva } = useReservas();

onMounted(async () => {
  // Obtener información de la reserva desde los query params
  sessionId.value = route.query.session_id;
  reservaId.value = route.query.reserva_id;
  
  if (!sessionId.value || !reservaId.value) {
    error.value = 'Información de pago incompleta. No se pudo verificar el estado del pago.';
    loading.value = false;
    return;
  }
  
  try {
    // Verificar el estado del pago
    const paymentStatus = await pagosService.checkPaymentStatus(reservaId.value);
    
    if (paymentStatus.status === 'success' && 
        paymentStatus.payment && 
        paymentStatus.payment.status === 'COMPLETADO') {
      
      // Cargar los detalles de la reserva
      const reserva = await loadReserva(reservaId.value);
      
      reservaInfo.value = {
        id: reserva.id,
        destino: reserva.destino,
        fechaSalida: reserva.fecha_salida,
        importe: paymentStatus.payment.amount
      };
      
      showToast({
        title: 'Pago completado',
        description: 'Tu pago ha sido procesado correctamente',
        type: 'success',
      });
    } else {
      // El pago no está completado
      error.value = 'No se pudo confirmar el pago. Por favor, contacta con soporte si crees que esto es un error.';
    }
  } catch (err) {
    console.error('Error al verificar el estado del pago:', err);
    error.value = 'Error al verificar el estado del pago. Por favor, contacta con soporte.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.pago-completado-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  min-height: 400px;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  color: var(--color-error);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-container {
  max-width: 800px;
  width: 100%;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  padding: 3rem;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.success-icon {
  width: 120px;
  height: 120px;
  background-color: var(--color-success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

h1 {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.success-message {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.reservation-details {
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  margin-bottom: 2.5rem;
  text-align: left;
}

.reservation-details h2 {
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

.btn-primary:hover {
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

@media (max-width: 768px) {
  .success-container {
    padding: 2rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .success-message {
    font-size: 1rem;
  }
}
</style>
