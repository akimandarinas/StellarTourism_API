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
        <!-- Breadcrumbs -->
        <Breadcrumb class="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink to="/reservas">Mis Reservas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>Reserva #{{ reservaId }}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
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
        
        <!-- Tarjeta de estado -->
        <Card class="mb-8">
          <CardContent class="p-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div class="text-sm text-gray-500 mb-1">Estado de la reserva</div>
                <div class="flex items-center">
                  <Badge :variant="estadoBadgeVariant">{{ estadoReserva }}</Badge>
                  <span v-if="reserva.fechaConfirmacion" class="ml-2 text-sm text-gray-500">
                    Confirmada el {{ formatDate(reserva.fechaConfirmacion) }}
                  </span>
                </div>
              </div>
              
              <div class="mt-4 md:mt-0">
                <div class="text-sm text-gray-500 mb-1">Código de reserva</div>
                <div class="flex items-center">
                  <span class="font-mono font-medium">{{ reserva.codigo }}</span>
                  <Button variant="ghost" size="sm" class="ml-2" @click="copiarCodigo">
                    <ClipboardIcon class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <!-- Información principal -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <!-- Detalles del viaje -->
          <div class="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Viaje</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Destino -->
                  <div class="space-y-2">
                    <div class="text-sm text-gray-500">Destino</div>
                    <div class="flex items-center">
                      <img 
                        :src="reserva.destino?.imagen || '/placeholder.svg?height=40&width=40&query=planeta'" 
                        alt="Destino" 
                        class="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                      <div>
                        <div class="font-medium">{{ reserva.destino?.nombre }}</div>
                        <div class="text-sm text-gray-500">{{ reserva.destino?.tipo }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Nave -->
                  <div class="space-y-2">
                    <div class="text-sm text-gray-500">Nave</div>
                    <div class="flex items-center">
                      <img 
                        :src="reserva.nave?.imagen || '/placeholder.svg?height=40&width=40&query=nave+espacial'" 
                        alt="Nave" 
                        class="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                      <div>
                        <div class="font-medium">{{ reserva.nave?.nombre }}</div>
                        <div class="text-sm text-gray-500">{{ reserva.nave?.tipo }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Fecha de salida -->
                  <div class="space-y-2">
                    <div class="text-sm text-gray-500">Fecha de salida</div>
                    <div class="flex items-center">
                      <CalendarIcon class="h-5 w-5 mr-2 text-primary" />
                      <div class="font-medium">{{ formatDate(reserva.fechaSalida) }}</div>
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ diasHastaSalida > 0 ? `Faltan ${diasHastaSalida} días` : 'Viaje completado' }}
                    </div>
                  </div>
                  
                  <!-- Fecha de regreso -->
                  <div class="space-y-2">
                    <div class="text-sm text-gray-500">Fecha de regreso</div>
                    <div class="flex items-center">
                      <CalendarIcon class="h-5 w-5 mr-2 text-primary" />
                      <div class="font-medium">{{ formatDate(reserva.fechaRegreso) }}</div>
                    </div>
                  </div>
                  
                  <!-- Pasajeros -->
                  <div class="space-y-2">
                    <div class="text-sm text-gray-500">Pasajeros</div>
                    <div class="flex items-center">
                      <UsersIcon class="h-5 w-5 mr-2 text-primary" />
                      <div class="font-medium">{{ reserva.cantidadPasajeros }} personas</div>
                    </div>
                  </div>
                  
                  <!-- Tipo de cabina -->
                  <div class="space-y-2">
                    <div class="text-sm text-gray-500">Tipo de cabina</div>
                    <div class="flex items-center">
                      <BedIcon class="h-5 w-5 mr-2 text-primary" />
                      <div class="font-medium">{{ reserva.tipoCabina }}</div>
                    </div>
                  </div>
                </div>
                
                <!-- Actividades incluidas -->
                <div class="mt-8">
                  <h3 class="text-lg font-medium mb-4">Actividades incluidas</h3>
                  <div v-if="!reserva.actividades?.length" class="text-gray-500">
                    No hay actividades incluidas en esta reserva.
                  </div>
                  <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      v-for="actividad in reserva.actividades" 
                      :key="actividad.id"
                      class="flex items-start p-3 bg-gray-50 rounded-lg"
                    >
                      <img 
                        :src="actividad.imagen || '/placeholder.svg?height=40&width=40&query=actividad+espacial'" 
                        alt="Actividad" 
                        class="w-10 h-10 rounded mr-3 object-cover"
                      />
                      <div>
                        <div class="font-medium">{{ actividad.nombre }}</div>
                        <div class="text-sm text-gray-500">{{ actividad.duracion }} horas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <!-- Resumen de pago -->
          <div class="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div class="flex justify-between">
                    <span>Precio base</span>
                    <span>{{ formatPrice(reserva.precioBase) }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span>Pasajeros</span>
                    <span>x {{ reserva.cantidadPasajeros }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span>Subtotal</span>
                    <span>{{ formatPrice(reserva.subtotal) }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span>Actividades</span>
                    <span>{{ formatPrice(reserva.precioActividades) }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span>Impuestos</span>
                    <span>{{ formatPrice(reserva.impuestos) }}</span>
                  </div>
                  
                  <Separator />
                  
                  <div class="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{{ formatPrice(reserva.total) }}</span>
                  </div>
                  
                  <div class="pt-4">
                    <div class="text-sm text-gray-500 mb-2">Estado del pago</div>
                    <div class="flex items-center">
                      <Badge :variant="pagoBadgeVariant">{{ estadoPago }}</Badge>
                    </div>
                  </div>
                  
                  <div v-if="reserva.estado === 'pendiente'" class="pt-4">
                    <Button class="w-full" @click="irAPagar">
                      Completar pago
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <!-- Documentos de viaje -->
            <Card class="mt-6">
              <CardHeader>
                <CardTitle>Documentos de Viaje</CardTitle>
              </CardHeader>
              <CardContent>
                <div v-if="reserva.estado !== 'confirmada'" class="text-gray-500">
                  Los documentos estarán disponibles una vez confirmada la reserva.
                </div>
                <div v-else class="space-y-4">
                  <Button variant="outline" class="w-full flex items-center justify-center" @click="descargarBillete">
                    <FileTextIcon class="mr-2 h-4 w-4" />
                    Descargar billete
                  </Button>
                  
                  <Button variant="outline" class="w-full flex items-center justify-center" @click="descargarItinerario">
                    <MapIcon class="mr-2 h-4 w-4" />
                    Descargar itinerario
                  </Button>
                  
                  <Button variant="outline" class="w-full flex items-center justify-center" @click="descargarSeguro">
                    <ShieldIcon class="mr-2 h-4 w-4" />
                    Póliza de seguro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <!-- Pasajeros -->
        <Card class="mb-8">
          <CardHeader>
            <CardTitle>Pasajeros</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="!reserva.pasajeros?.length" class="text-gray-500">
              No hay información de pasajeros disponible.
            </div>
            <div v-else>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Fecha de nacimiento</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Asiento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="pasajero in reserva.pasajeros" :key="pasajero.id">
                    <TableCell>
                      <div class="font-medium">{{ pasajero.nombre }}</div>
                    </TableCell>
                    <TableCell>{{ pasajero.tipoDocumento }}: {{ pasajero.numeroDocumento }}</TableCell>
                    <TableCell>{{ formatDate(pasajero.fechaNacimiento) }}</TableCell>
                    <TableCell>{{ pasajero.email || '-' }}</TableCell>
                    <TableCell>
                      <Badge>{{ pasajero.asiento || 'No asignado' }}</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <!-- Historial de la reserva -->
        <Card>
          <CardHeader>
            <CardTitle>Historial de la Reserva</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="!reserva.historial?.length" class="text-gray-500">
              No hay historial disponible para esta reserva.
            </div>
            <div v-else>
              <div class="space-y-6">
                <div 
                  v-for="(evento, index) in reserva.historial" 
                  :key="index"
                  class="flex"
                >
                  <div class="mr-4 flex flex-col items-center">
                    <div class="rounded-full h-10 w-10 flex items-center justify-center bg-primary text-white">
                      <CheckIcon v-if="evento.tipo === 'confirmacion'" class="h-5 w-5" />
                      <CreditCardIcon v-else-if="evento.tipo === 'pago'" class="h-5 w-5" />
                      <AlertCircleIcon v-else-if="evento.tipo === 'cancelacion'" class="h-5 w-5" />
                      <ClockIcon v-else class="h-5 w-5" />
                    </div>
                    <div v-if="index < reserva.historial.length - 1" class="h-full w-px bg-gray-200 my-2"></div>
                  </div>
                  
                  <div class="pb-6">
                    <div class="text-sm text-gray-500">{{ formatDateTime(evento.fecha) }}</div>
                    <div class="font-medium mt-1">{{ evento.titulo }}</div>
                    <div class="text-gray-600 mt-1">{{ evento.descripcion }}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CalendarIcon, 
  UsersIcon, 
  BedIcon, 
  ClipboardIcon, 
  FileTextIcon, 
  MapIcon, 
  ShieldIcon,
  CheckIcon,
  CreditCardIcon,
  AlertCircleIcon,
  ClockIcon
} from 'lucide-vue-next';

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
