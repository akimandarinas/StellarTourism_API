<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading && !reserva" class="flex justify-center items-center min-h-[60vh]">
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
        <!-- Page Header -->
        <div class="detalle-reserva-page">
          <div class="page-header">
            <h1>Detalles de Reserva</h1>
            <p>Información completa de tu reserva</p>
          </div>
          
          <!-- Reserva Detalle Component -->
          <ReservaDetalle :reserva="reserva" :puedeModificar="puedeModificar" :puedeCancelar="puedeCancelar" @modificar="modificarReserva" @cancelar="confirmarCancelacion" />
        </div>
        
        <!-- Modal de cancelación -->
        <Modal
          v-if="showCancelModal"
          title="Cancelar reserva"
          @close="showCancelModal = false"
        >
          <p class="mb-4">¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.</p>
          
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="font-medium">Destino:</span>
                <span class="ml-1">{{ reserva?.destino?.nombre }}</span>
              </div>
              <div>
                <span class="font-medium">Fecha:</span>
                <span class="ml-1">{{ formatDate(reserva?.fechaSalida) }}</span>
              </div>
              <div>
                <span class="font-medium">Pasajeros:</span>
                <span class="ml-1">{{ reserva?.cantidadPasajeros }}</span>
              </div>
              <div>
                <span class="font-medium">Total:</span>
                <span class="ml-1">{{ formatPrice(reserva?.total) }}</span>
              </div>
            </div>
            
            <div class="mt-2 text-sm">
              <span class="font-medium">Política de cancelación:</span>
              <span class="ml-1">{{ obtenerPoliticaCancelacion() }}</span>
            </div>
          </div>
          
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
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import ReservaDetalle from '@/components/reservas/ReservaDetalle.vue';

import MainLayout from '../layouts/MainLayout.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import Alert from '../components/ui/Alert.vue';
import Button from '../components/ui/Button.vue';
import Badge from '../components/ui/Badge.vue';
import Modal from '../components/ui/Modal.vue';
import Separator from '../components/ui/Separator.vue';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '../components/ui/breadcrumb';

import { useReservas } from '../composables/useReservas';
import { useToast } from '../composables/useToast';
import { formatPrice } from '../utils/format';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const reservaId = computed(() => route.params.id);

// Estado
const reserva = ref(null);
const loading = ref(true);
const error = ref(null);
const showCancelModal = ref(false);
const cancelando = ref(false);

// Composables
const { cargarReserva, cancelarReserva: cancelarReservaService } = useReservas();

// Computed
const estadoReserva = computed(() => {
  if (!reserva.value) return '';
  
  const estadoMap = {
    'pendiente': 'Pendiente de pago',
    'confirmada': 'Confirmada',
    'cancelada': 'Cancelada',
    'completada': 'Completada'
  };
  
  return estadoMap[reserva.value.estado] || reserva.value.estado;
});

const estadoBadgeVariant = computed(() => {
  if (!reserva.value) return 'default';
  
  const variantMap = {
    'pendiente': 'warning',
    'confirmada': 'success',
    'cancelada': 'destructive',
    'completada': 'default'
  };
  
  return variantMap[reserva.value.estado] || 'default';
});

const estadoPago = computed(() => {
  if (!reserva.value) return '';
  
  const estadoMap = {
    'pendiente': 'Pendiente',
    'pagado': 'Pagado',
    'reembolsado': 'Reembolsado',
    'parcial': 'Pago parcial'
  };
  
  return estadoMap[reserva.value.estadoPago] || reserva.value.estadoPago;
});

const pagoBadgeVariant = computed(() => {
  if (!reserva.value) return 'default';
  
  const variantMap = {
    'pendiente': 'warning',
    'pagado': 'success',
    'reembolsado': 'default',
    'parcial': 'secondary'
  };
  
  return variantMap[reserva.value.estadoPago] || 'default';
});

const diasHastaSalida = computed(() => {
  if (!reserva.value?.fechaSalida) return 0;
  
  const fechaSalida = new Date(reserva.value.fechaSalida);
  const hoy = new Date();
  
  return Math.max(0, differenceInDays(fechaSalida, hoy));
});

const puedeModificar = computed(() => {
  if (!reserva.value) return false;
  
  // Solo se puede modificar si faltan más de 7 días para el viaje y está confirmada
  return diasHastaSalida.value > 7 && reserva.value.estado === 'confirmada';
});

const puedeCancelar = computed(() => {
  if (!reserva.value) return false;
  
  // Solo se puede cancelar si el estado es "confirmada" o "pendiente"
  return ['confirmada', 'pendiente'].includes(reserva.value.estado);
});

// Métodos
const cargarDatos = async () => {
  loading.value = true;
  error.value = null;

  try {
    const data = await cargarReserva(reservaId.value);
    reserva.value = data;
  } catch (err) {
    console.error('Error al cargar reserva:', err);
    error.value = 'No se pudo cargar la información de la reserva. Por favor, intenta nuevamente.';
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return 'No disponible';
  return format(new Date(date), 'PPP', { locale: es });
};

const formatDateTime = (date) => {
  if (!date) return 'No disponible';
  return format(new Date(date), 'PPP p', { locale: es });
};

const copiarCodigo = () => {
  if (!reserva.value?.codigo) return;
  
  navigator.clipboard.writeText(reserva.value.codigo)
    .then(() => {
      toast.success('Código copiado', 'El código de reserva ha sido copiado al portapapeles');
    })
    .catch(err => {
      console.error('Error al copiar código:', err);
      toast.error('Error', 'No se pudo copiar el código');
    });
};

const modificarReserva = () => {
  router.push(`/reservas/editar/${reservaId.value}`);
};

const confirmarCancelacion = () => {
  showCancelModal.value = true;
};

const cancelarReserva = async () => {
  cancelando.value = true;
  try {
    await cancelarReservaService(reservaId.value, 'Cancelada por el usuario');
    
    // Actualizar estado de la reserva
    reserva.value.estado = 'cancelada';
    
    toast.success('Reserva cancelada', 'Tu reserva ha sido cancelada correctamente');
    
    showCancelModal.value = false;
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    toast.error('Error', 'No se pudo cancelar la reserva. Por favor, intenta nuevamente.');
  } finally {
    cancelando.value = false;
  }
};

const irAPagar = () => {
  router.push(`/checkout/${reservaId.value}`);
};

const obtenerPoliticaCancelacion = () => {
  if (!reserva.value) return '';
  
  if (diasHastaSalida.value >= 30) {
    return 'Reembolso del 100%';
  } else if (diasHastaSalida.value >= 14) {
    return 'Reembolso del 75%';
  } else if (diasHastaSalida.value >= 7) {
    return 'Reembolso del 50%';
  } else {
    return 'Sin reembolso';
  }
};

const descargarBillete = () => {
  toast.info('Descarga iniciada', 'Tu billete se está descargando');
  // Aquí implementaríamos la lógica para descargar el billete
};

const descargarItinerario = () => {
  toast.info('Descarga iniciada', 'Tu itinerario se está descargando');
  // Aquí implementaríamos la lógica para descargar el itinerario
};

const descargarSeguro = () => {
  toast.info('Descarga iniciada', 'Tu póliza de seguro se está descargando');
  // Aquí implementaríamos la lógica para descargar la póliza de seguro
};

// Lifecycle hooks
onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
.detalle-reserva-page {
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 3rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  font-weight: 500;
  border-radius: var(--border-radius);
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}
</style>
