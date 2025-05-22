<template>
  <div class="reservas-explorador">
    <div class="reservas-header">
      <div class="reservas-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          :class="['tab-button', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <a href="/reservas/nueva" class="nueva-reserva-button">
        <span class="plus-icon">+</span>
        Nueva Reserva
      </a>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando tus reservas...</p>
    </div>
    
    <div v-else-if="reservasFiltradas.length === 0" class="empty-state">
      <div class="empty-icon">🚀</div>
      <h3>No tienes reservas {{ activeTab !== 'todas' ? 'en este estado' : '' }}</h3>
      <p>¡Comienza tu aventura espacial creando una nueva reserva!</p>
      <a href="/reservas/nueva" class="cta-button-small">Crear mi primera reserva</a>
    </div>
    
    <div v-else class="reservas-grid">
      <div v-for="reserva in reservasFiltradas" :key="reserva.id" class="reserva-card">
        <div class="reserva-image-container">
          <img :src="getDestinoImagen(reserva.destino)" :alt="reserva.destino" class="reserva-imagen">
          <div class="reserva-estado" :class="'estado-' + reserva.estado.toLowerCase()">
            {{ formatEstado(reserva.estado) }}
          </div>
        </div>
        
        <div class="reserva-content">
          <h3 class="reserva-destino">{{ reserva.destino }}</h3>
          <div class="reserva-detalles">
            <div class="detalle">
              <span class="detalle-icono">🗓️</span>
              <span class="detalle-texto">{{ formatDate(reserva.fechaViaje) }}</span>
            </div>
            <div class="detalle">
              <span class="detalle-icono">🚀</span>
              <span class="detalle-texto">{{ reserva.nave }}</span>
            </div>
            <div class="detalle">
              <span class="detalle-icono">👥</span>
              <span class="detalle-texto">{{ reserva.pasajeros }} pasajeros</span>
            </div>
          </div>
          
          <div class="reserva-precio">
            <span class="precio-label">Precio total:</span>
            <span class="precio-valor">{{ formatPrice(reserva.precio) }}</span>
          </div>
          
          <div class="reserva-acciones">
            <a :href="`/reservas/${reserva.id}`" class="accion-button detalles">
              Ver detalles
            </a>
            
            <button 
              v-if="reserva.estado.toLowerCase() === 'pendiente'" 
              class="accion-button pago"
              @click="procesarPago(reserva.id)"
            >
              Pendiente de pago
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'ReservasExplorador',
  
  setup() {
    const loading = ref(true);
    const activeTab = ref('todas');
    const reservas = ref([]);
    
    const tabs = [
      { label: 'Todas', value: 'todas' },
      { label: 'Pendientes', value: 'pendiente' },
      { label: 'Confirmadas', value: 'confirmada' },
      { label: 'Completadas', value: 'completada' }
    ];
    
    const reservasFiltradas = computed(() => {
      if (activeTab.value === 'todas') {
        return reservas.value;
      }
      
      return reservas.value.filter(r => 
        r.estado.toLowerCase() === activeTab.value
      );
    });
    
    const cargarReservas = async () => {
      loading.value = true;
      
      try {
        
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
          }
        ];
      } catch (error) {
        console.error('Error al cargar reservas:', error);
      } finally {
        loading.value = false;
      }
    };
    
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
    
    const getDestinoImagen = (destino) => {
      if (destino.includes('Luna')) {
        return '/images/luna-base.png';
      } else if (destino.includes('Marte')) {
        return '/images/marte.png';
      } else if (destino.includes('Estación')) {
        return '/images/estacion-orbital.png';
      } else if (destino.includes('Venus')) {
        return '/images/venus-clouds.png';
      } else {
        return '/images/stars-bg.png';
      }
    };
    
    const procesarPago = (reservaId) => {
      // Aquí se redireccionaría a la página de pago
      window.location.href = `/reservas/${reservaId}/pago`;
    };
    
    onMounted(() => {
      cargarReservas();
    });
    
    return {
      loading,
      activeTab,
      tabs,
      reservas,
      reservasFiltradas,
      formatDate,
      formatPrice,
      formatEstado,
      getDestinoImagen,
      procesarPago
    };
  }
};
</script>

<style scoped>
.reservas-explorador {
  margin-bottom: 4rem;
}

.reservas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.reservas-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  background-color: white;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: #f9fafb;
}

.tab-button.active {
  background-color: #7c3aed;
  color: white;
  border-color: #7c3aed;
}

.nueva-reserva-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #7c3aed;
  color: white;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nueva-reserva-button:hover {
  background-color: #6d28d9;
}

.plus-icon {
  font-size: 1.25rem;
  font-weight: 600;
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

.empty-state h3 {
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

.cta-button-small {
  display: inline-block;
  background: linear-gradient(to right, #7c3aed, #6d28d9);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.cta-button-small:hover {
  transform: translateY(-2px);
}

.reservas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.reserva-card {
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.reserva-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.reserva-image-container {
  position: relative;
  height: 150px;
}

.reserva-imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reserva-estado {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
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

.reserva-content {
  padding: 1.5rem;
}

.reserva-destino {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.reserva-detalles {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detalle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detalle-icono {
  font-size: 1rem;
}

.detalle-texto {
  font-size: 0.875rem;
  color: #6b7280;
}

.reserva-precio {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.precio-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.precio-valor {
  font-size: 1rem;
  font-weight: 600;
  color: #7c3aed;
}

.reserva-acciones {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.accion-button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accion-button.detalles {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  text-decoration: none;
}

.accion-button.detalles:hover {
  background-color: #e5e7eb;
}

.accion-button.pago {
  background-color: #7c3aed;
  color: white;
  border: none;
}

.accion-button.pago:hover {
  background-color: #6d28d9;
}

@media (max-width: 768px) {
  .reservas-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .reservas-tabs {
    justify-content: center;
  }
  
  .nueva-reserva-button {
    justify-content: center;
  }
}
</style>
