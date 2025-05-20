<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
      
      <div v-else-if="error" class="text-center my-12">
        <Alert variant="destructive">
          <p>{{ error }}</p>
        </Alert>
        <div class="mt-8">
          <router-link to="/reservas" class="btn-primary">
            Volver a mis reservas
          </router-link>
        </div>
      </div>
      
      <div v-else>
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold">Detalles de la Reserva</h1>
          <div class="flex gap-4">
            <Button v-if="puedeModificar" variant="outline" @click="modificarReserva">
              Modificar
            </Button>
            <Button v-if="puedeCancelar" variant="destructive" @click="confirmarCancelacion">
              Cancelar
            </Button>
          </div>
        </div>
        
        <ReservaDetail :reserva="reserva" />
      </div>
      
      <Modal
        v-if="showCancelModal"
        title="Cancelar reserva"
        @close="showCancelModal = false"
      >
        <p class="mb-4">¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.</p>
        <div class="flex justify-end gap-4">
          <Button variant="outline" @click="showCancelModal = false">
            Cancelar
          </Button>
          <Button variant="destructive" @click="cancelarReserva" :disabled="cancelando">
            {{ cancelando ? 'Procesando...' : 'Confirmar cancelación' }}
          </Button>
        </div>
      </Modal>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import ReservaDetail from '../components/reservas/ReservaDetail.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import Alert from '../components/ui/Alert.vue';
import Button from '../components/ui/Button.vue';
import Modal from '../components/ui/Modal.vue';
import { useToast } from '../composables/useToast';
import { fetchReserva, cancelarReservaAPI } from '../services/api';

const { toast } = useToast();
const route = useRoute();
const router = useRouter();
const reservaId = ref(null); // Initialize with null
const routeReservaId = computed(() => route.params.id);

// Use a watch to update reservaId when route.params.id changes
watch(routeReservaId, (newId) => {
  reservaId.value = newId;
});

const reserva = ref(null);
const loading = ref(true);
const error = ref(null);
const showCancelModal = ref(false);
const cancelando = ref(false);

// Funciones para cargar datos relacionados
const fetchDestino = async (destinoId) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/destinos/${destinoId}`);
  if (!response.ok) throw new Error(`Error al cargar destino: ${response.status}`);
  return response.json();
};

const fetchNave = async (naveId) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/naves/${naveId}`);
  if (!response.ok) throw new Error(`Error al cargar nave: ${response.status}`);
  return response.json();
};

// Determinar si la reserva puede ser modificada o cancelada
const puedeModificar = computed(() => {
  if (!reserva.value) return false;
  
  // Solo se puede modificar si faltan más de 7 días para el viaje
  const fechaViaje = new Date(reserva.value.fecha_viaje);
  const hoy = new Date();
  const diasDiferencia = Math.floor((fechaViaje - hoy) / (1000 * 60 * 60 * 24));
  
  return diasDiferencia > 7 && reserva.value.estado === 'confirmada';
});

const puedeCancelar = computed(() => {
  if (!reserva.value) return false;
  
  // Solo se puede cancelar si el estado es "confirmada" o "pendiente"
  return ['confirmada', 'pendiente'].includes(reserva.value.estado);
});

const cargarReserva = async () => {
  loading.value = true;
  error.value = null;

  // Validar que el ID existe
  if (!reservaId.value) {
    error.value = 'ID de reserva no especificado';
    loading.value = false;
    return;
  }

  try {
    // Obtener el ID de la reserva
    const id = reservaId.value;
    
    // Cargar la reserva
    const data = await fetchReserva(id);
    
    if (!data) {
      error.value = 'La reserva solicitada no existe';
      loading.value = false;
      return;
    }
    
    reserva.value = data;
    
    // Si necesitamos cargar datos relacionados, hacerlo en paralelo
    if (data.destino_id && data.nave_id) {
      try {
        // Usar Promise.all para cargar datos relacionados en paralelo
        const [destinoData, naveData] = await Promise.all([
          fetchDestino(data.destino_id),
          fetchNave(data.nave_id)
        ]);
        
        // Asignar datos relacionados
        reserva.value.detalleDestino = destinoData;
        reserva.value.detalleNave = naveData;
      } catch (relatedError) {
        console.error('Error al cargar datos relacionados:', relatedError);
        // No bloqueamos la carga principal si fallan los datos relacionados
      }
    }
  } catch (err) {
    console.error('Error al cargar reserva:', err);
    
    // Manejo de errores específico según el tipo de error
    if (err.response?.status === 404) {
      error.value = 'La reserva solicitada no existe o ha sido eliminada.';
    } else if (err.response?.status === 403) {
      error.value = 'No tienes permisos para ver esta reserva.';
      // Redirigir al usuario después de un breve retraso
      setTimeout(() => {
        router.push('/reservas');
      }, 3000);
    } else {
      error.value = 'No se pudo cargar la información de la reserva. Por favor, intenta nuevamente.';
    }
    
    // Implementar reintento automático para errores de red
    if (err.message?.includes('network') || err.code === 'ECONNABORTED') {
      setTimeout(() => {
        console.log('Reintentando cargar la reserva...');
        cargarReserva();
      }, 3000); // Reintentar después de 3 segundos
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (route.params.id) {
        reservaId.value = route.params.id;
        await cargarReserva();
    }
});

function modificarReserva() {
  router.push(`/reservas/editar/${reservaId.value}`);
}

function confirmarCancelacion() {
  showCancelModal.value = true;
}

async function cancelarReserva() {
  cancelando.value = true;
  try {
    await cancelarReservaAPI(reservaId.value);
    
    // Actualizar estado de la reserva
    reserva.value.estado = 'cancelada';
    
    toast({
      title: 'Reserva cancelada',
      description: 'Tu reserva ha sido cancelada correctamente.',
      variant: 'success'
    });
    
    showCancelModal.value = false;
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    toast({
      title: 'Error',
      description: 'No se pudo cancelar la reserva. Por favor, intenta nuevamente.',
      variant: 'destructive'
    });
  } finally {
    cancelando.value = false;
  }
}
</script>

<style scoped>
.btn-primary {
  @apply px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors;
}
</style>
