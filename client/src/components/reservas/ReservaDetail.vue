<template>
  <div class="reserva-detail">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner message="Cargando detalles de la reserva..." />
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchReserva" class="btn">Reintentar</button>
    </div>
    
    <div v-else class="reserva-content">
      <div class="reserva-header">
        <div class="reserva-title">
          <h2>Reserva #{{ reserva.ID }}</h2>
          <div class="reserva-status" :class="getStatusClass(reserva.ESTADO)">
            {{ getStatusText(reserva.ESTADO) }}
          </div>
        </div>
        
        <div class="reserva-actions">
          <button 
            v-if="canCancel(reserva)" 
            @click="showCancelConfirmation" 
            class="btn btn-danger"
          >
            Cancelar Reserva
          </button>
          
          <a 
            v-if="reserva.ESTADO === 'PENDIENTE'" 
            :href="`/checkout/${reserva.ID}`" 
            class="btn btn-primary"
          >
            Completar Pago
          </a>
          
          <button 
            @click="printReserva" 
            class="btn btn-outline"
          >
            <Printer size="16" />
            Imprimir
          </button>
        </div>
      </div>
      
      <div class="reserva-grid">
        <div class="reserva-main">
          <div class="card">
            <h3>Detalles del Viaje</h3>
            
            <div class="destination-header">
              <div class="destination-info">
                <h4>{{ reserva.DESTINO_NOMBRE }}</h4>
                <p>{{ reserva.RUTA_NOMBRE }}</p>
              </div>
              
              <div class="destination-image">
                <img :src="getDestinationImage()" alt="Imagen del destino" />
              </div>
            </div>
            
            <div class="travel-details">
              <div class="detail-item">
                <Calendar size="18" />
                <div>
                  <span class="detail-label">Fecha de despegue</span>
                  <span class="detail-value">{{ formatDate(reserva.FECHA_DESPEGUE, 'PPP') }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <Calendar size="18" />
                <div>
                  <span class="detail-label">Fecha de retorno</span>
                  <span class="detail-value">{{ formatDate(reserva.FECHA_RETORNO) }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <Ship size="18" />
                <div>
                  <span class="detail-label">Nave</span>
                  <span class="detail-value">{{ reserva.NAVE_NOMBRE }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <Users size="18" />
                <div>
                  <span class="detail-label">Pasajeros</span>
                  <span class="detail-value">{{ reserva.PASAJEROS }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <Shield size="18" />
                <div>
                  <span class="detail-label">Tipo de seguro</span>
                  <span class="detail-value">{{ getSeguroText(reserva.TIPO_SEGURO) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3>Pasajeros</h3>
            
            <div class="passengers-list">
              <div v-for="(pasajero, index) in pasajeros" :key="index" class="passenger-item">
                <div class="passenger-avatar">
                  <User size="24" />
                </div>
                
                <div class="passenger-info">
                  <div class="passenger-name">{{ pasajero.NOMBRE }}</div>
                  <div class="passenger-details">
                    <span>{{ pasajero.DOCUMENTO }}: {{ pasajero.NUMERO_DOCUMENTO }}</span>
                    <span>Asiento: {{ pasajero.PAS_ASIENTO }}</span>
                    <span>Clase: {{ getClaseText(pasajero.PAS_CLASE) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="actividades.length > 0" class="card">
            <h3>Actividades Reservadas</h3>
            
            <div class="activities-list">
              <div v-for="(actividad, index) in actividades" :key="index" class="activity-item">
                <div class="activity-icon">
                  <Rocket size="24" />
                </div>
                
                <div class="activity-info">
                  <div class="activity-name">{{ actividad.NOMBRE }}</div>
                  <div class="activity-description">{{ actividad.DESCRIPCION }}</div>
                </div>
                
                <div class="activity-details">
                  <div class="activity-quantity">{{ actividad.CANTIDAD }} {{ actividad.CANTIDAD > 1 ? 'personas' : 'persona' }}</div>
                  <div class="activity-price">{{ formatPrice(actividad.PRECIO) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="reserva-sidebar">
          <div class="card">
            <h3>Resumen de Pago</h3>
            
            <div class="payment-summary">
              <div class="summary-item">
                <span>Precio base</span>
                <span>{{ formatPrice(reserva.PRECIO_BASE) }}</span>
              </div>
              
              <div v-if="reserva.PRECIO_ACTIVIDADES" class="summary-item">
                <span>Actividades</span>
                <span>{{ formatPrice(reserva.PRECIO_ACTIVIDADES) }}</span>
              </div>
              
              <div v-if="reserva.PRECIO_SEGURO" class="summary-item">
                <span>Seguro</span>
                <span>{{ formatPrice(reserva.PRECIO_SEGURO) }}</span>
              </div>
              
              <div v-if="reserva.DESCUENTO" class="summary-item discount">
                <span>Descuento</span>
                <span>-{{ formatPrice(reserva.DESCUENTO) }}</span>
              </div>
              
              <div class="summary-total">
                <span>Total</span>
                <span>{{ formatPrice(reserva.PRECIO) }}</span>
              </div>
            </div>
            
            <div class="payment-status">
              <div class="status-label">Estado del pago:</div>
              <div class="status-value" :class="getPaymentStatusClass()">
                {{ getPaymentStatusText() }}
              </div>
            </div>
            
            <div v-if="pagos.length > 0" class="payment-history">
              <h4>Historial de pagos</h4>
              
              <div v-for="(pago, index) in pagos" :key="index" class="payment-item">
                <div class="payment-date">{{ formatDate(pago.FECHA) }}</div>
                <div class="payment-method">{{ getPaymentMethodText(pago.METODO_PAGO) }}</div>
                <div class="payment-amount">{{ formatPrice(pago.CANTIDAD) }}</div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3>Información de Contacto</h3>
            
            <div class="contact-info">
              <div class="contact-item">
                <Mail size="18" />
                <span>soporte@stellartourism.com</span>
              </div>
              
              <div class="contact-item">
                <Phone size="18" />
                <span>+34 900 123 456</span>
              </div>
              
              <div class="contact-item">
                <MessageSquare size="18" />
                <span>Chat en vivo</span>
              </div>
            </div>
            
            <div class="emergency-contact">
              <h4>Contacto de emergencia 24/7</h4>
              <div class="emergency-number">+34 900 789 012</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Diálogo de confirmación para cancelación -->
    <ConfirmationDialog
      ref="cancelDialog"
      title="Cancelar Reserva"
      :message="'¿Estás seguro de que deseas cancelar esta reserva?'"
      confirmText="Sí, cancelar reserva"
      cancelText="No, mantener reserva"
      type="danger"
      :loading="cancelling"
      @confirm="cancelReserva"
    >
      <div class="cancel-details">
        <p><strong>Destino:</strong> {{ reserva.DESTINO_NOMBRE }}</p>
        <p><strong>Fecha de salida:</strong> {{ formatDate(reserva.FECHA_DESPEGUE, 'PPP') }}</p>
        <p><strong>Política de cancelación:</strong> {{ getCancellationPolicy() }}</p>
        
        <div class="cancel-warning">
          <AlertTriangle size="18" />
          <span>Esta acción no se puede deshacer.</span>
        </div>
        
        <div class="cancel-reason">
          <label for="cancelReason">Motivo de cancelación (opcional):</label>
          <textarea id="cancelReason" v-model="cancelReason" rows="3" class="form-control"></textarea>
        </div>
      </div>
    </ConfirmationDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Calendar, Ship, Users, Shield, User, Rocket, Printer, Mail, Phone, MessageSquare, X, Loader2, AlertTriangle } from '@/utils/lucide-adapter';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { api } from '../../services/api';
import { formatDate, formatPrice } from '../../utils/format';
import ConfirmationDialog from '../common/ConfirmationDialog.vue';

const props = defineProps({
  reservaId: {
    type: [String, Number],
    required: true
  }
});

// Estado
const reserva = ref({});
const pasajeros = ref([]);
const actividades = ref([]);
const pagos = ref([]);
const loading = ref(true);
const error = ref(null);
const showCancelModal = ref(false);
const cancelling = ref(false);
const cancelReason = ref('');
const cancelDialog = ref(null);

// Datos de ejemplo para desarrollo
const mockReserva = {
  ID: 1,
  ID_USUARIO: 1,
  ID_DESTINO: 1,
  ID_NAVE: 1,
  ID_RUTA: 1,
  DESTINO_NOMBRE: 'Luna',
  NAVE_NOMBRE: 'Stellar Explorer',
  RUTA_NOMBRE: 'Tierra-Luna Directa',
  FECHA_DESPEGUE: '2025-07-15',
  FECHA_RETORNO: '2025-07-22',
  PASAJEROS: 2,
  ESTADO: 'CONFIRMADA',
  TIPO_SEGURO: 'PREMIUM',
  PRECIO_BASE: 1000000,
  PRECIO_ACTIVIDADES: 150000,
  PRECIO_SEGURO: 100000,
  DESCUENTO: 50000,
  PRECIO: 1200000
};

const mockPasajeros = [
  {
    ID: 1,
    ID_RESERVA: 1,
    NOMBRE: 'Juan Pérez',
    DOCUMENTO: 'DNI',
    NUMERO_DOCUMENTO: '12345678A',
    NACIMIENTO: '1985-05-15',
    PAS_ASIENTO: 'A12',
    PAS_CLASE: 'PRIMERA',
    PAS_PRECIO: 700000
  },
  {
    ID: 2,
    ID_RESERVA: 1,
    NOMBRE: 'María López',
    DOCUMENTO: 'PASAPORTE',
    NUMERO_DOCUMENTO: 'AB123456',
    NACIMIENTO: '1990-10-20',
    PAS_ASIENTO: 'A13',
    PAS_CLASE: 'PRIMERA',
    PAS_PRECIO: 700000
  }
];

const mockActividades = [
  {
    ID: 1,
    ID_RESERVA: 1,
    ID_ACTIVIDAD: 1,
    NOMBRE: 'Paseo Lunar',
    DESCRIPCION: 'Experimenta la gravedad lunar en un paseo por la superficie.',
    CANTIDAD: 2,
    PRECIO: 100000
  },
  {
    ID: 2,
    ID_RESERVA: 1,
    ID_ACTIVIDAD: 2,
    NOMBRE: 'Observatorio Estelar',
    DESCRIPCION: 'Observa las estrellas desde el observatorio lunar.',
    CANTIDAD: 1,
    PRECIO: 50000
  }
];

const mockPagos = [
  {
    ID: 1,
    ID_RESERVA: 1,
    CANTIDAD: 1200000,
    METODO_PAGO: 'TARJETA',
    ESTADO: 'COMPLETADO',
    ID_TRANSACION: 'TRX123456',
    FECHA: '2024-06-01'
  }
];

// Métodos
const fetchReserva = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // En un entorno real, esto sería una llamada a la API
    // const data = await api.reservas.getById(props.reservaId);
    
    // Simulamos una llamada a la API con un pequeño retraso
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    reserva.value = mockReserva;
    pasajeros.value = mockPasajeros;
    actividades.value = mockActividades;
    pagos.value = mockPagos;
  } catch (err) {
    console.error('Error fetching reserva:', err);
    error.value = 'No se pudo cargar la información de la reserva. Por favor, inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'PENDIENTE': return 'Pendiente';
    case 'CONFIRMADA': return 'Confirmada';
    case 'CANCELADA': return 'Cancelada';
    case 'COMPLETADA': return 'Completada';
    default: return status;
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'PENDIENTE': return 'status-pending';
    case 'CONFIRMADA': return 'status-confirmed';
    case 'CANCELADA': return 'status-cancelled';
    case 'COMPLETADA': return 'status-completed';
    default: return '';
  }
};

const getSeguroText = (tipo) => {
  switch (tipo) {
    case 'BASICO': return 'Básico';
    case 'ESTANDAR': return 'Estándar';
    case 'PREMIUM': return 'Premium';
    default: return tipo;
  }
};

const getClaseText = (clase) => {
  switch (clase) {
    case 'ECONOMICA': return 'Económica';
    case 'EJECUTIVA': return 'Ejecutiva';
    case 'PRIMERA': return 'Primera Clase';
    default: return clase;
  }
};

const getPaymentStatusText = () => {
  if (pagos.value.length === 0) {
    return 'Pendiente de pago';
  }
  
  const totalPagado = pagos.value.reduce((sum, pago) => sum + pago.CANTIDAD, 0);
  
  if (totalPagado >= reserva.value.PRECIO) {
    return 'Pagado completamente';
  } else {
    return 'Pago parcial';
  }
};

const getPaymentStatusClass = () => {
  if (pagos.value.length === 0) {
    return 'status-pending';
  }
  
  const totalPagado = pagos.value.reduce((sum, pago) => sum + pago.CANTIDAD, 0);
  
  if (totalPagado >= reserva.value.PRECIO) {
    return 'status-confirmed';
  } else {
    return 'status-partial';
  }
};

const getPaymentMethodText = (method) => {
  switch (method) {
    case 'TARJETA': return 'Tarjeta de crédito/débito';
    case 'PAYPAL': return 'PayPal';
    case 'TRANSFERENCIA': return 'Transferencia bancaria';
    case 'CRYPTO': return 'Criptomoneda';
    default: return method;
  }
};

const canCancel = (reserva) => {
  // Solo se pueden cancelar reservas pendientes o confirmadas
  if (reserva.ESTADO !== 'PENDIENTE' && reserva.ESTADO !== 'CONFIRMADA') {
    return false;
  }
  
  // Verificar si la fecha de salida es al menos 7 días en el futuro
  const departureDate = new Date(reserva.FECHA_DESPEGUE);
  const today = new Date();
  const diffTime = departureDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 7;
};

const getCancellationPolicy = () => {
  const departureDate = new Date(reserva.value.FECHA_DESPEGUE);
  const today = new Date();
  const diffTime = departureDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 30) {
    return 'Reembolso del 100%';
  } else if (diffDays >= 14) {
    return 'Reembolso del 75%';
  } else if (diffDays >= 7) {
    return 'Reembolso del 50%';
  } else {
    return 'Sin reembolso';
  }
};

const cancelReserva = async () => {
  cancelling.value = true;
  
  try {
    // En un entorno real, esto sería una llamada a la API
    // await api.reservas.update(reserva.value.ID, { ESTADO: 'CANCELADA' });
    
    // Simulamos una llamada a la API con un pequeño retraso
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Actualizar el estado de la reserva
    reserva.value.ESTADO = 'CANCELADA';
    
    // Cerrar el modal
    cancelDialog.value.close();
    
    // Mostrar notificación de éxito
    if (window.$notifications) {
      window.$notifications.success('Reserva cancelada', 'Tu reserva ha sido cancelada correctamente.');
    }
  } catch (err) {
    console.error('Error cancelling reserva:', err);
    error.value = 'No se pudo cancelar la reserva. Por favor, inténtalo de nuevo.';
    
    // Mostrar notificación de error
    if (window.$notifications) {
      window.$notifications.error('Error', 'No se pudo cancelar la reserva. Por favor, inténtalo de nuevo.');
    }
  } finally {
    cancelling.value = false;
  }
};

const printReserva = () => {
  window.print();
};

const getDestinationImage = () => {
  // En un entorno real, esto devolvería la URL de la imagen del destino
  return '/placeholder.svg?height=200&width=300';
};

const showCancelConfirmation = () => {
  cancelDialog.value.open();
};

// Ciclo de vida
onMounted(() => {
  fetchReserva();
});
</script>

<style scoped>
.reserva-detail {
  width: 100%;
}

.reserva-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.reserva-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.reserva-title h2 {
  font-size: 1.8rem;
  color: var(--color-primary);
  margin: 0;
}

.reserva-status {
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
}

.status-pending {
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-confirmed {
  background-color: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.status-cancelled {
  background-color: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.status-completed {
  background-color: rgba(23, 162, 184, 0.2);
  color: #17a2b8;
}

.status-partial {
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.reserva-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-danger {
  background-color: var(--color-error);
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover {
  background-color: rgba(0, 180, 216, 0.1);
}

.reserva-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-md);
}

.card h3 {
  font-size: 1.4rem;
  color: var(--color-primary);
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.card h4 {
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 1rem;
}

.destination-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.destination-info h4 {
  font-size: 1.2rem;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.destination-info p {
  color: var(--color-text-secondary);
}

.destination-image {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: var(--border-radius-sm);
}

.destination-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.travel-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.detail-item svg {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.detail-label {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 600;
}

.passengers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.passenger-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-sm);
}

.passenger-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 180, 216, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: var(--color-primary);
}

.passenger-info {
  flex-grow: 1;
}

.passenger-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.passenger-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-sm);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 180, 216, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.activity-info {
  flex-grow: 1;
}

.activity-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.activity-description {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.activity-details {
  text-align: right;
  min-width: 120px;
}

.activity-quantity {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.activity-price {
  font-weight: 600;
  color: var(--color-primary);
}

.payment-summary {
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.summary-item.discount {
  color: var(--color-success);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 1.1rem;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.payment-status {
  background-color: rgba(26, 26, 46, 0.5);
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  margin-bottom: 1.5rem;
}

.status-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.status-value {
  font-weight: 600;
}

.payment-history {
  margin-top: 1.5rem;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-date, .payment-method {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.payment-amount {
  font-weight: 600;
}

.contact-info {
  margin-bottom: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.contact-item svg {
  color: var(--color-primary);
}

.emergency-contact {
  background-color: rgba(220, 53, 69, 0.1);
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  text-align: center;
}

.emergency-number {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-error);
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.modal h3 {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.cancel-details {
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  margin: 1.5rem 0;
}

.cancel-details p {
  margin-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
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
  .reserva-grid {
    grid-template-columns: 1fr;
  }
  
  .reserva-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .reserva-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .travel-details {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .passenger-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media print {
  .reserva-actions, .modal-overlay {
    display: none;
  }
  
  .card {
    box-shadow: none;
    border: 1px solid #ddd;
    break-inside: avoid;
  }
  
  .reserva-grid {
    grid-template-columns: 1fr;
  }
}

.cancel-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-warning);
  margin-top: 1rem;
}

.cancel-reason {
  margin-top: 1rem;
}

.cancel-reason label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  resize: vertical;
}
</style>
