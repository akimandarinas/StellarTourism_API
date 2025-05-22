<template>
  <div class="reservas-page">
    <div class="page-header">
      <h1>Mis Reservas</h1>
      <p>Gestiona tus viajes espaciales</p>
    </div>
    
    <div class="actions-bar">
      <a href="/reservas/nueva" class="btn-nueva-reserva">
        <span class="icon">+</span>
        <span>Nueva Reserva</span>
      </a>
      
      <div class="filters">
        <select v-model="filtroEstado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="confirmada">Confirmadas</option>
          <option value="completada">Completadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
        
        <input 
          type="text" 
          v-model="busqueda" 
          placeholder="Buscar reserva..." 
          class="search-input"
        />
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando tus reservas...</p>
    </div>
    
    <div v-else-if="reservasFiltradas.length === 0" class="empty-state">
      <div class="empty-icon">🚀</div>
      <h2>No tienes reservas</h2>
      <p v-if="filtroEstado || busqueda">No se encontraron reservas que coincidan con tu búsqueda.</p>
      <p v-else>¡Comienza tu aventura espacial creando una nueva reserva!</p>
      <a href="/reservas/nueva" class="btn-empty-action">Crear mi primera reserva</a>
    </div>
    
    <div v-else class="reservas-list">
      <div v-for="reserva in reservasFiltradas" :key="reserva.id" class="reserva-card">
        <div class="reserva-header">
          <div class="reserva-destino">
            <h3>{{ reserva.destino }}</h3>
            <span class="reserva-id">ID: {{ reserva.id }}</span>
          </div>
          <div class="reserva-estado" :class="'estado-' + reserva.estado.toLowerCase()">
            {{ formatEstado(reserva.estado) }}
          </div>
        </div>
        
        <div class="reserva-details">
          <div class="detail-item">
            <span class="detail-label">Fecha de viaje:</span>
            <span class="detail-value">{{ formatDate(reserva.fechaViaje) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Nave:</span>
            <span class="detail-value">{{ reserva.nave }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Pasajeros:</span>
            <span class="detail-value">{{ reserva.pasajeros }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Precio total:</span>
            <span class="detail-value precio">{{ formatPrice(reserva.precio) }}</span>
          </div>
        </div>
        
        <div class="reserva-actions">
          <a :href="`/reservas/${reserva.id}`" class="btn-ver">Ver detalles</a>
          
          <button 
            v-if="reserva.estado.toLowerCase() === 'pendiente'" 
            class="btn-pagar"
            @click="procesarPago(reserva.id)"
          >
            Pendiente de pago
          </button>
          
          <button 
            v-if="puedeModificar(reserva)" 
            class="btn-modificar"
            @click="modificarReserva(reserva.id)"
          >
            Modificar
          </button>
          
          <button 
            v-if="puedeCancelar(reserva)" 
            class="btn-cancelar"
            @click="confirmarCancelacion(reserva.id)"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmación de cancelación -->
    <div v-if="showCancelModal" class="modal-overlay" @click="closeCancelModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirmar cancelación</h3>
          <button class="modal-close" @click="closeCancelModal">×</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas cancelar esta reserva?</p>
          <p class="warning-text">Esta acción no se puede deshacer y podrían aplicarse cargos por cancelación según la política de cancelación.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeCancelModal">No, mantener reserva</button>
          <button class="btn-danger" @click="cancelarReserva">Sí, cancelar reserva</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'ReservasPage',
  
  setup() {
    const reservas = ref([]);
    const loading = ref(true);
    const filtroEstado = ref('');
    const busqueda = ref('');
    const showCancelModal = ref(false);
    const reservaIdACancelar = ref(null);
    
    const cargarReservas = async () => {
      loading.value = true;
      try {
        // En un entorno real, esto sería una llamada a la API
        // Por ahora, usamos datos de ejemplo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        reservas.value = [
          {
            id: 'RES-123456',
            destino: 'Luna - Base Artemisa',
            nave: 'Aurora Estelar',
            fechaViaje: '2025-08-15',
            pasajeros: 2,
            precio: 3000000,
            estado: 'PENDIENTE'
          },
          {
            id: 'RES-789012',
            destino: 'Marte - Colonia Ares',
            nave: 'Voyager Marciano',
            fechaViaje: '2025-09-20',
            pasajeros: 3,
            precio: 10500000,
            estado: 'CONFIRMADA'
          },
          {
            id: 'RES-345678',
            destino: 'Estación Orbital Internacional',
            nave: 'Halcón Lunar',
            fechaViaje: '2025-07-05',
            pasajeros: 1,
            precio: 950000,
            estado: 'COMPLETADA'
          },
          {
            id: 'RES-901234',
            destino: 'Venus - Estación Afrodita',
            nave: 'Nexus Orbital',
            fechaViaje: '2025-10-10',
            pasajeros: 2,
            precio: 8400000,
            estado: 'CANCELADA'
          }
        ];
      } catch (error) {
        console.error('Error al cargar reservas:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const reservasFiltradas = computed(() => {
      let resultado = reservas.value;
      
      //Filtrar por estado
      if (filtroEstado.value) {
        resultado = resultado.filter(r => 
          r.estado.toLowerCase() === filtroEstado.value.toLowerCase()
        );
      }
      
      //Filtrar por búsqueda
      if (busqueda.value) {
        const termino = busqueda.value.toLowerCase();
        resultado = resultado.filter(r => 
          r.id.toLowerCase().includes(termino) ||
          r.destino.toLowerCase().includes(termino) ||
          r.nave.toLowerCase().includes(termino)
        );
      }
      
      return resultado;
    });
    
    // Métodos
    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    };
    
    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR' 
      }).format(price);
    };
    
    const formatEstado = (estado) => {
      const estados = {
        'PENDIENTE': 'Pendiente de pago',
        'CONFIRMADA': 'Confirmada',
        'COMPLETADA': 'Completada',
        'CANCELADA': 'Cancelada'
      };
      
      return estados[estado] || estado;
    };
    
    const procesarPago = (reservaId) => {
      window.location.href = `/reservas/${reservaId}/pago`;
    };
    
    const modificarReserva = (reservaId) => {
      window.location.href = `/reservas/${reservaId}/editar`;
    };
    
    const confirmarCancelacion = (reservaId) => {
      reservaIdACancelar.value = reservaId;
      showCancelModal.value = true;
    };
    
    const closeCancelModal = () => {
      showCancelModal.value = false;
      reservaIdACancelar.value = null;
    };
    
    const cancelarReserva = async () => {
      try {
        // En un entorno real, esto sería una llamada a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const reserva = reservas.value.find(r => r.id === reservaIdACancelar.value);
        if (reserva) {
          reserva.estado = 'CANCELADA';
        }
        
        closeCancelModal();
        
        alert('Reserva cancelada con éxito');
      } catch (error) {
        console.error('Error al cancelar reserva:', error);
      }
    };
    
    const puedeModificar = (reserva) => {
      return ['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado);
    };
    
    const puedeCancelar = (reserva) => {
      return ['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado);
    };
    
    onMounted(() => {
      cargarReservas();
    });
    
    return {
      reservas,
      loading,
      filtroEstado,
      busqueda,
      showCancelModal,
      reservasFiltradas,
      formatDate,
      formatPrice,
      formatEstado,
      procesarPago,
      modificarReserva,
      confirmarCancelacion,
      closeCancelModal,
      cancelarReserva,
      puedeModificar,
      puedeCancelar
    };
  }
};
</script>

<style scoped>
.reservas-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 1.125rem;
  color: #6b7280;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-nueva-reserva {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #7c3aed;
  color: white;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-nueva-reserva:hover {
  background-color: #6d28d9;
}

.btn-nueva-reserva .icon {
  font-size: 1.25rem;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select,
.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.filter-select {
  min-width: 150px;
}

.search-input {
  min-width: 200px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.btn-empty-action {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #7c3aed;
  color: white;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-empty-action:hover {
  background-color: #6d28d9;
}

.reservas-list {
  display: grid;
  gap: 1.5rem;
}

.reserva-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.reserva-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.reserva-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.reserva-destino h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.reserva-id {
  font-size: 0.75rem;
  color: #6b7280;
}

.reserva-estado {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.estado-pendiente {
  background-color: #fef3c7;
  color: #92400e;
}

.estado-confirmada {
  background-color: #dbeafe;
  color: #1e40af;
}

.estado-completada {
  background-color: #d1fae5;
  color: #065f46;
}

.estado-cancelada {
  background-color: #fee2e2;
  color: #b91c1c;
}

.reserva-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}

.detail-value.precio {
  font-weight: 600;
  color: #7c3aed;
}

.reserva-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.btn-ver,
.btn-pagar,
.btn-modificar,
.btn-cancelar {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ver {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  text-decoration: none;
}

.btn-ver:hover {
  background-color: #e5e7eb;
}

.btn-pagar {
  background-color: #7c3aed;
  color: white;
  border: none;
}

.btn-pagar:hover {
  background-color: #6d28d9;
}

.btn-modificar {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.btn-modificar:hover {
  background-color: #bfdbfe;
}

.btn-cancelar {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.btn-cancelar:hover {
  background-color: #fecaca;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin-bottom: 1rem;
  color: #4b5563;
}

.warning-text {
  color: #b91c1c;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-danger {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background-color: #dc2626;
}

/* Responsive styles */
@media (max-width: 768px) {
  .reservas-page {
    padding: 1rem;
  }
  
  .actions-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filters {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .reserva-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .reserva-details {
    grid-template-columns: 1fr;
  }
  
  .reserva-actions {
    flex-wrap: wrap;
  }
}
</style>
