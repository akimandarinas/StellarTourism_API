<template>
  <div class="reserva-detalle">
    <!-- Loading State -->
    <div v-if="loading" class="py-8 flex justify-center items-center">
      <LoadingSpinner size="lg" />
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="py-8 text-center">
      <p class="text-red-500">{{ error.message }}</p>
      <button 
        @click="cargarReserva" 
        class="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
      >
        Reintentar
      </button>
    </div>
    
    <!-- Content -->
    <div v-else-if="reserva" class="reserva-content">
      <!-- Header -->
      <div class="reserva-header">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">Reserva #{{ reserva.id }}</h1>
          <Badge :variant="estadoBadgeVariant">
            {{ formatearEstado(reserva.estado) }}
          </Badge>
        </div>
        <p class="text-gray-500">Creada el {{ formatDate(reserva.fechaCreacion) }}</p>
      </div>
      
      <!-- Información principal -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <!-- Destino -->
        <div class="reserva-card">
          <h2 class="card-title">Destino</h2>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded overflow-hidden">
              <img 
                v-if="reserva.destino?.imagen" 
                :src="reserva.destino.imagen" 
                :alt="reserva.destino?.nombre"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
                <PlanetIcon class="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-lg">{{ reserva.destino?.nombre }}</h3>
              <p class="text-gray-600">{{ reserva.destino?.descripcion }}</p>
            </div>
          </div>
        </div>
        
        <!-- Nave -->
        <div class="reserva-card">
          <h2 class="card-title">Nave Espacial</h2>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded overflow-hidden">
              <img 
                v-if="reserva.nave?.imagen" 
                :src="reserva.nave.imagen" 
                :alt="reserva.nave?.nombre"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
                <RocketIcon class="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-lg">{{ reserva.nave?.nombre }}</h3>
              <p class="text-gray-600">{{ reserva.nave?.descripcion }}</p>
            </div>
          </div>
        </div>
        
        <!-- Fechas -->
        <div class="reserva-card">
          <h2 class="card-title">Fechas</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Salida</p>
              <p class="font-medium">{{ formatDate(reserva.fechaViaje) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Regreso</p>
              <p class="font-medium">{{ formatDate(reserva.fechaRegreso) }}</p>
            </div>
          </div>
        </div>
        
        <!-- Precio -->
        <div class="reserva-card">
          <h2 class="card-title">Precio</h2>
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-500">Total</p>
              <p class="text-xl font-bold text-primary">{{ formatPrice(reserva.precio) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Estado de pago</p>
              <Badge :variant="reserva.pagado ? 'success' : 'warning'">
                {{ reserva.pagado ? 'Pagado' : 'Pendiente' }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pasajeros -->
      <div class="reserva-section mt-8">
        <h2 class="section-title">Pasajeros</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="(pasajero, index) in reserva.pasajeros" 
            :key="index"
            class="pasajero-card"
          >
            <h3 class="font-medium">Pasajero {{ index + 1 }}</h3>
            <div class="mt-2 space-y-1">
              <p><span class="text-gray-500">Nombre:</span> {{ pasajero.nombre }} {{ pasajero.apellidos }}</p>
              <p><span class="text-gray-500">Documento:</span> {{ pasajero.tipoDocumento.toUpperCase() }}: {{ pasajero.documento }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Acciones -->
      <div class="reserva-actions mt-8">
        <div class="flex flex-wrap gap-4 justify-end">
          <button 
            v-if="puedeSerCancelada"
            @click="confirmarCancelacion"
            class="btn-danger"
          >
            Cancelar Reserva
          </button>
          
          <button 
            v-if="!reserva.pagado && reserva.estado !== 'CANCELADA'"
            @click="irAPago"
            class="btn-primary"
          >
            Proceder al Pago
          </button>
          
          <button 
            @click="descargarComprobante"
            class="btn-secondary"
          >
            Descargar Comprobante
          </button>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="py-8 text-center">
      <p class="text-gray-500">No se encontró la reserva</p>
      <a 
        href="/reservas" 
        class="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
      >
        Volver a Mis Reservas
      </a>
    </div>
    
    <!-- Modal de Cancelación -->
    <Modal 
      v-if="showCancelModal"
      title="Cancelar Reserva"
      @close="showCancelModal = false"
    >
      <div class="p-4">
        <p class="mb-4">¿Estás seguro de que deseas cancelar esta reserva?</p>
        
        <div class="mb-4">
          <label for="motivoCancelacion" class="block text-sm font-medium text-gray-700 mb-1">Motivo de cancelación</label>
          <textarea
            id="motivoCancelacion"
            v-model="motivoCancelacion"
            rows="3"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Indica el motivo de la cancelación (opcional)"
          ></textarea>
        </div>
        
        <div class="flex justify-end gap-4">
          <button 
            @click="showCancelModal = false"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          
          <button 
            @click="cancelarReserva"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            :disabled="cancelLoading"
          >
            {{ cancelLoading ? 'Procesando...' : 'Confirmar Cancelación' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useReservas } from '@/composables/useReservas';
import { useToast } from '@/composables/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import Badge from '@/components/ui/Badge.vue';
import Modal from '@/components/ui/Modal.vue';
import { Planet as PlanetIcon, Rocket as RocketIcon } from '@/utils/lucide-adapter';

export default {
  name: 'ReservaDetalle',
  
  components: {
    LoadingSpinner,
    Badge,
    Modal,
    PlanetIcon,
    RocketIcon
  },
  
  setup() {
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();
    const { cargarReserva, cancelarReserva: cancelarReservaAction } = useReservas();
    
    // Estado
    const reserva = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const showCancelModal = ref(false);
    const motivoCancelacion = ref('');
    const cancelLoading = ref(false);
    
    // Computed
    const estadoBadgeVariant = computed(() => {
      if (!reserva.value) return 'default';
      
      switch (reserva.value.estado) {
        case 'CONFIRMADA':
          return 'success';
        case 'PENDIENTE':
          return 'warning';
        case 'CANCELADA':
          return 'danger';
        default:
          return 'default';
      }
    });
    
    const puedeSerCancelada = computed(() => {
      if (!reserva.value) return false;
      
      // Solo se pueden cancelar reservas confirmadas o pendientes
      return ['CONFIRMADA', 'PENDIENTE'].includes(reserva.value.estado);
    });
    
    // Métodos
    const cargarDatosReserva = async () => {
      const id = route.params.id;
      if (!id) {
        error.value = new Error('ID de reserva no proporcionado');
        loading.value = false;
        return;
      }
      
      loading.value = true;
      error.value = null;
      
      try {
        const data = await cargarReserva(id);
        reserva.value = data;
      } catch (err) {
        error.value = err;
        console.error('Error al cargar reserva:', err);
      } finally {
        loading.value = false;
      }
    };
    
    const confirmarCancelacion = () => {
      showCancelModal.value = true;
    };
    
    const cancelarReserva = async () => {
      if (!reserva.value) return;
      
      cancelLoading.value = true;
      
      try {
        const resultado = await cancelarReservaAction(reserva.value.id, motivoCancelacion.value);
        
        if (resultado) {
          showCancelModal.value = false;
          toast.success('Reserva cancelada', {
            description: 'Tu reserva ha sido cancelada correctamente'
          });
          
          // Actualizar estado de la reserva
          reserva.value = {
            ...reserva.value,
            estado: 'CANCELADA',
            motivoCancelacion: motivoCancelacion.value
          };
        } else {
          throw new Error('No se pudo cancelar la reserva');
        }
      } catch (err) {
        console.error('Error al cancelar reserva:', err);
        toast.error('Error al cancelar la reserva', {
          description: err.message || 'Ocurrió un error al cancelar tu reserva'
        });
      } finally {
        cancelLoading.value = false;
      }
    };
    
    const irAPago = () => {
      if (!reserva.value) return;
      
      router.push(`/checkout/${reserva.value.id}`);
    };
    
    const descargarComprobante = () => {
      if (!reserva.value) return;
      
      toast.info('Descargando comprobante', {
        description: 'Tu comprobante se está generando'
      });
      
      // En un entorno real, aquí se generaría y descargaría el PDF
      setTimeout(() => {
        toast.success('Comprobante descargado', {
          description: 'El comprobante se ha descargado correctamente'
        });
      }, 2000);
    };
    
    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };
    
    const formatPrice = (price) => {
      if (!price) return '€0.00';
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
    };
    
    const formatearEstado = (estado) => {
      if (!estado) return 'Desconocido';
      
      switch (estado) {
        case 'CONFIRMADA':
          return 'Confirmada';
        case 'PENDIENTE':
          return 'Pendiente';
        case 'CANCELADA':
          return 'Cancelada';
        default:
          return estado;
      }
    };
    
    // Ciclo de vida
    onMounted(() => {
      cargarDatosReserva();
    });
    
    return {
      reserva,
      loading,
      error,
      showCancelModal,
      motivoCancelacion,
      cancelLoading,
      estadoBadgeVariant,
      puedeSerCancelada,
      cargarReserva: cargarDatosReserva,
      confirmarCancelacion,
      cancelarReserva,
      irAPago,
      descargarComprobante,
      formatDate,
      formatPrice,
      formatearEstado
    };
  }
}
</script>

<style scoped>
.reserva-detalle {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.reserva-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.reserva-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  height: 100%;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.reserva-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #374151;
}

.pasajero-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.btn-primary {
  background-color: #7c3aed;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: #6d28d9;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.text-primary {
  color: #7c3aed;
}
</style>
