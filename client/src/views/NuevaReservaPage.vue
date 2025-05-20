<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <!-- Alerta de recuperación de datos -->
      <div v-if="showRecoveryAlert" class="mb-6">
        <Alert variant="info">
          <div class="flex items-center justify-between">
            <div>
              <AlertCircleIcon class="h-5 w-5 mr-2 inline-block" />
              <span>Hemos recuperado tu reserva en progreso.</span>
            </div>
            <div class="flex gap-2">
              <Button size="sm" variant="outline" @click="descartarRecuperacion">
                Descartar
              </Button>
              <Button size="sm" @click="continuarReserva">
                Continuar
              </Button>
            </div>
          </div>
        </Alert>
      </div>

      <!-- Indicador de estado de guardado -->
      <ReservaEstadoGuardado
        :last-saved="lastSaved"
        :is-saving="guardandoFormulario"
        :has-error="errorGuardado"
        :can-save="formularioValido"
        :show-resume-button="false"
        @save="guardarBorrador"
        @clear="limpiarFormulario"
        @retry="guardarFormulario"
      />

      <div v-if="loading" class="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
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
            <BreadcrumbLink>Nueva Reserva</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <h1 class="text-3xl font-bold mb-8">Nueva Reserva</h1>
        
        <!-- Stepper -->
        <div class="mb-8">
          <Stepper 
            :steps="pasos" 
            :current-step="pasoActual" 
            :completed-steps="pasosCompletados"
            @step-click="intentarCambiarPaso"
          />
        </div>
        
        <!-- Paso 1: Selección de destino y nave -->
        <div v-if="pasoActual === 1">
          <Card>
            <CardHeader>
              <CardTitle>Selecciona tu destino y nave</CardTitle>
            </CardHeader>
            <CardContent>
              <form @submit.prevent="avanzarPaso">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <!-- Selección de destino -->
                  <div class="space-y-2">
                    <Label for="destino">Destino</Label>
                    <Select 
                      id="destino" 
                      v-model="formulario.destinoId"
                      :disabled="destinoPreseleccionado"
                      required
                      @change="verificarDisponibilidadDestino"
                    >
                      <option value="" disabled>Selecciona un destino</option>
                      <option 
                        v-for="destino in destinos" 
                        :key="destino.id" 
                        :value="destino.id"
                      >
                        {{ destino.nombre }}
                      </option>
                    </Select>
                    
                    <!-- Indicador de disponibilidad del destino -->
                    <DisponibilidadIndicator
                      v-if="formulario.destinoId"
                      :loading="verificandoDestino"
                      :disponible="disponibilidadDestino.disponible"
                      :mensaje="disponibilidadDestino.mensaje"
                      :plazas-disponibles="disponibilidadDestino.plazasDisponibles"
                      :ultima-actualizacion="disponibilidadDestino.timestamp"
                      @refresh="verificarDisponibilidadDestino"
                    />
                  </div>
                  
                  <!-- Selección de nave -->
                  <div class="space-y-2">
                    <Label for="nave">Nave</Label>
                    <Select 
                      id="nave" 
                      v-model="formulario.naveId"
                      :disabled="!formulario.destinoId || !disponibilidadDestino.disponible"
                      required
                      @change="verificarDisponibilidadFecha"
                    >
                      <option value="" disabled>Selecciona una nave</option>
                      <option 
                        v-for="nave in navesDisponibles" 
                        :key="nave.id" 
                        :value="nave.id"
                      >
                        {{ nave.nombre }}
                      </option>
                    </Select>
                  </div>
                  
                  <!-- Fecha de salida -->
                  <div class="space-y-2">
                    <Label for="fechaSalida">Fecha de salida</Label>
                    <Input 
                      id="fechaSalida" 
                      type="date" 
                      v-model="formulario.fechaSalida"
                      :min="fechaMinima"
                      :disabled="!formulario.naveId || !disponibilidadDestino.disponible"
                      required
                      @change="verificarDisponibilidadFecha"
                    />
                    
                    <!-- Indicador de disponibilidad de fecha -->
                    <DisponibilidadIndicator
                      v-if="formulario.destinoId && formulario.naveId && formulario.fechaSalida"
                      :loading="verificandoFecha"
                      :disponible="disponibilidadFecha.disponible"
                      :mensaje="disponibilidadFecha.mensaje"
                      :plazas-disponibles="disponibilidadFecha.plazasDisponibles"
                      :ultima-actualizacion="disponibilidadFecha.timestamp"
                      @refresh="verificarDisponibilidadFecha"
                    />
                  </div>
                  
                  <!-- Número de pasajeros -->
                  <div class="space-y-2">
                    <Label for="pasajeros">Número de pasajeros</Label>
                    <Input 
                      id="pasajeros" 
                      type="number" 
                      v-model="formulario.cantidadPasajeros"
                      min="1"
                      max="10"
                      :disabled="!formulario.fechaSalida || !disponibilidadFecha.disponible"
                      required
                      @change="handlePasajerosChange"
                    />
                    
                    <!-- Advertencia si hay pocos asientos disponibles -->
                    <div 
                      v-if="disponibilidadFecha.disponible && disponibilidadFecha.plazasDisponibles && formulario.cantidadPasajeros > 0"
                      class="text-sm mt-1"
                      :class="{ 'text-warning': asientosLimitados, 'text-success': !asientosLimitados }"
                    >
                      <AlertTriangleIcon v-if="asientosLimitados" class="h-4 w-4 inline-block mr-1" />
                      <CheckCircleIcon v-else class="h-4 w-4 inline-block mr-1" />
                      {{ mensajeDisponibilidadAsientos }}
                    </div>
                  </div>
                </div>
                
                <!-- Información del destino seleccionado -->
                <div v-if="destinoSeleccionado" class="mb-6">
                  <Card>
                    <CardContent class="p-4">
                      <div class="flex items-start">
                        <img 
                          :src="destinoSeleccionado.imagen || '/placeholder.svg?height=100&width=100&query=planeta'" 
                          :alt="destinoSeleccionado.nombre"
                          class="w-24 h-24 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <h3 class="text-lg font-semibold">{{ destinoSeleccionado.nombre }}</h3>
                          <p class="text-sm text-gray-500 mb-2">{{ destinoSeleccionado.tipo }}</p>
                          <p class="text-sm">{{ destinoSeleccionado.descripcionCorta }}</p>
                          <div class="mt-2 flex items-center">
                            <span class="text-primary font-semibold">{{ formatPrice(destinoSeleccionado.precio) }}</span>
                            <span class="text-sm text-gray-500 ml-1">por persona</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <!-- Información de la nave seleccionada -->
                <div v-if="naveSeleccionada" class="mb-6">
                  <Card>
                    <CardContent class="p-4">
                      <div class="flex items-start">
                        <img 
                          :src="naveSeleccionada.imagen || '/placeholder.svg?height=100&width=100&query=nave+espacial'" 
                          :alt="naveSeleccionada.nombre"
                          class="w-24 h-24 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <h3 class="text-lg font-semibold">{{ naveSeleccionada.nombre }}</h3>
                          <p class="text-sm text-gray-500 mb-2">{{ naveSeleccionada.tipo }}</p>
                          <p class="text-sm">{{ naveSeleccionada.descripcionCorta }}</p>
                          <div class="mt-2 flex items-center">
                            <span class="text-sm text-gray-500">Capacidad: {{ naveSeleccionada.capacidad }} pasajeros</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div class="flex justify-end">
                  <Button 
                    type="submit" 
                    :disabled="!puedeAvanzarPaso1"
                  >
                    Continuar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <!-- Paso 2: Selección de cabina y asientos -->
        <div v-else-if="pasoActual === 2">
          <Card>
            <CardHeader>
              <CardTitle>Selecciona tu cabina y asientos</CardTitle>
            </CardHeader>
            <CardContent>
              <form @submit.prevent="avanzarPaso">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <!-- Selección de tipo de cabina -->
                  <div class="space-y-2">
                    <Label for="tipoCabina">Tipo de cabina</Label>
                    <Select 
                      id="tipoCabina" 
                      v-model="formulario.tipoCabina"
                      required
                      @change="handleCabinaChange"
                    >
                      <option value="" disabled>Selecciona un tipo de cabina</option>
                      <option 
                        v-for="cabina in tiposCabina" 
                        :key="cabina.id" 
                        :value="cabina.id"
                      >
                        {{ cabina.nombre }} - {{ formatPrice(cabina.precio) }}
                      </option>
                    </Select>
                  </div>
                </div>
                
                <!-- Selector de asientos con disponibilidad en tiempo real -->
                <div class="mb-6">
                  <h3 class="text-lg font-medium mb-4">Selección de asientos</h3>
                  <div v-if="verificandoAsientos" class="flex justify-center py-8">
                    <LoadingSpinner />
                    <span class="ml-2">Verificando disponibilidad de asientos...</span>
                  </div>
                  <div v-else-if="!formulario.tipoCabina" class="text-center py-8 text-gray-500">
                    Selecciona un tipo de cabina para ver los asientos disponibles
                  </div>
                  <div v-else>
                    <SeatSelector 
                      :cantidad-pasajeros="formulario.cantidadPasajeros" 
                      :nave-id="formulario.naveId"
                      :fecha-salida="formulario.fechaSalida"
                      :tipo-cabina="formulario.tipoCabina"
                      :asientos-disponibles="asientosDisponibles"
                      v-model="formulario.asientos"
                      @update:asientos="handleAsientosChange"
                      @refresh-disponibilidad="verificarDisponibilidadAsientos"
                    />
                    
                    <!-- Mensaje de asientos seleccionados -->
                    <div class="mt-4 text-sm" :class="{ 'text-error': asientosInsuficientes, 'text-success': !asientosInsuficientes && formulario.asientos.length > 0 }">
                      <AlertTriangleIcon v-if="asientosInsuficientes" class="h-4 w-4 inline-block mr-1" />
                      <CheckCircleIcon v-else-if="formulario.asientos.length > 0" class="h-4 w-4 inline-block mr-1" />
                      {{ mensajeAsientosSeleccionados }}
                    </div>
                    
                    <!-- Tiempo restante para completar la selección -->
                    <div v-if="tiempoReservaAsientos > 0" class="mt-2 text-sm text-warning">
                      <ClockIcon class="h-4 w-4 inline-block mr-1" />
                      Tienes {{ formatTiempoRestante }} para completar tu reserva
                    </div>
                  </div>
                </div>
                
                <div class="flex justify-between">
                  <Button type="button" variant="outline" @click="retrocederPaso">
                    Atrás
                  </Button>
                  <Button 
                    type="submit" 
                    :disabled="!puedeAvanzarPaso2"
                  >
                    Continuar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <!-- Resto de pasos (3, 4, 5) se mantienen igual que en el código original -->
        <!-- ... -->
        
        <!-- Diálogo de confirmación para abandonar -->
        <Dialog v-model:open="mostrarDialogoAbandonar">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Abandonar reserva?</DialogTitle>
              <DialogDescription>
                Si abandonas ahora, perderás los cambios no guardados. ¿Quieres guardar tu progreso como borrador antes de salir?
              </DialogDescription>
            </DialogHeader>
            <div class="flex justify-end gap-2 mt-4">
              <Button variant="outline" @click="abandonarSinGuardar">
                Abandonar sin guardar
              </Button>
              <Button variant="default" @click="guardarYAbandonar">
                Guardar y salir
              </Button>
              <Button variant="secondary" @click="mostrarDialogoAbandonar = false">
                Continuar reserva
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <!-- Diálogo de disponibilidad cambiada -->
        <Dialog v-model:open="mostrarDialogoDisponibilidadCambiada">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disponibilidad actualizada</DialogTitle>
              <DialogDescription>
                {{ mensajeDisponibilidadCambiada }}
              </DialogDescription>
            </DialogHeader>
            <div class="flex justify-end gap-2 mt-4">
              <Button variant="outline" @click="mostrarDialogoDisponibilidadCambiada = false">
                Entendido
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format, addDays, differenceInSeconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CalendarIcon, 
  UsersIcon, 
  BedIcon,
  SeatIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from 'lucide-vue-next';

import MainLayout from '../layouts/MainLayout.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import Button from '../components/ui/Button.vue';
import Badge from '../components/ui/Badge.vue';
import Input from '../components/ui/Input.vue';
import Label from '../components/ui/Label.vue';
import Select from '../components/ui/Select.vue';
import Checkbox from '../components/ui/Checkbox.vue';
import Separator from '../components/ui/Separator.vue';
import Stepper from '../components/ui/Stepper.vue';
import SeatSelector from '../components/reservas/SeatSelector.vue';
import Alert from '../components/ui/Alert.vue';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '../components/ui/breadcrumb';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import ReservaEstadoGuardado from '../components/reservas/ReservaEstadoGuardado.vue';
import DisponibilidadIndicator from '../components/reservas/DisponibilidadIndicator.vue';

import { useDestinos } from '../composables/useDestinos';
import { useNaves } from '../composables/useNaves';
import { useReservas } from '../composables/useReservas';
import { useToast } from '../composables/useToast';
import { formatPrice } from '../utils/format';
import { 
  saveFormData, 
  loadFormData, 
  clearFormData, 
  hasFormData, 
  getLastStep,
  useFormPersistence
} from '../services/reservas/reserva-form-persistence';
import {
  verificarDisponibilidadFecha as checkDisponibilidadFecha,
  verificarDisponibilidadAsientos as checkDisponibilidadAsientos,
  crearReservaTemporal,
  actualizarReservaTemporal,
  liberarReservaTemporal,
  simularVerificacionDisponibilidad
} from '../services/reservas/disponibilidad-service';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// Pasos del formulario
const pasos = [
  { id: 1, title: 'Destino y nave' },
  { id: 2, title: 'Cabina y asientos' },
  { id: 3, title: 'Pasajeros' },
  { id: 4, title: 'Actividades' },
  { id: 5, title: 'Confirmación' }
];
const pasoActual = ref(1);
const pasosCompletados = ref([]);

// Estado
const loading = ref(true);
const loadingActividades = ref(false);
const enviandoReserva = ref(false);
const destinos = ref([]);
const naves = ref([]);
const actividades = ref([]);
const tiposCabina = ref([
  { id: 'estandar', nombre: 'Estándar', precio: 0 },
  { id: 'premium', nombre: 'Premium', precio: 5000 },
  { id: 'suite', nombre: 'Suite', precio: 15000 },
  { id: 'lujo', nombre: 'Gran Lujo', precio: 30000 }
]);

// Estado de disponibilidad
const verificandoDestino = ref(false);
const verificandoFecha = ref(false);
const verificandoAsientos = ref(false);
const disponibilidadDestino = ref({ disponible: null, mensaje: '', plazasDisponibles: null, timestamp: null });
const disponibilidadFecha = ref({ disponible: null, mensaje: '', plazasDisponibles: null, timestamp: null });
const asientosDisponibles = ref([]);

// Estado de reserva temporal
const reservaTemporalId = ref(null);
const tiempoReservaAsientos = ref(0);
const timerReservaAsientos = ref(null);

// Estado de guardado
const guardandoFormulario = ref(false);
const errorGuardado = ref(false);
const lastSaved = ref(null);
const showRecoveryAlert = ref(false);

// Diálogos
const mostrarDialogoAbandonar = ref(false);
const mostrarDialogoDisponibilidadCambiada = ref(false);
const mensajeDisponibilidadCambiada = ref('');

// Formulario
const formulario = ref({
  destinoId: '',
  naveId: '',
  fechaSalida: '',
  cantidadPasajeros: 1,
  tipoCabina: '',
  asientos: [],
  pasajeros: [],
  actividades: [],
  pasoActual: 1
});

// Configurar persistencia del formulario
const { 
  saveForm: guardarFormulario, 
  restoreForm: restaurarFormulario, 
  clearForm: limpiarFormulario,
  isDirty
} = useFormPersistence(formulario, {
  autoSaveDelay: 3000,
  confirmOnLeave: true,
  excludeFields: ['asientosDisponibles']
});

// Precios
const precioBase = ref(0);
const precioCabina = ref(0);
const precioActividades = ref(0);
const impuestosPorcentaje = ref(21);

// Composables
const { cargarDestinos, cargarActividades } = useDestinos();
const { cargarNaves } = useNaves();
const { crearReserva } = useReservas();

// Computed
const fechaMinima = computed(() => {
  const hoy = new Date();
  return format(hoy, 'yyyy-MM-dd');
});

const destinoPreseleccionado = computed(() => {
  return !!route.query.destino;
});

const destinoSeleccionado = computed(() => {
  if (!formulario.value.destinoId) return null;
  return destinos.value.find(d => d.id === formulario.value.destinoId);
});

const naveSeleccionada = computed(() => {
  if (!formulario.value.naveId) return null;
  return naves.value.find(n => n.id === formulario.value.naveId);
});

const navesDisponibles = computed(() => {
  if (!formulario.value.destinoId) return [];
  // Aquí podríamos filtrar las naves por destino si fuera necesario
  return naves.value;
});

const tipoCabinaSeleccionada = computed(() => {
  if (!formulario.value.tipoCabina) return null;
  return tiposCabina.value.find(c => c.id === formulario.value.tipoCabina);
});

const actividadesSeleccionadas = computed(() => {
  return actividades.value.filter(a => formulario.value.actividades.includes(a.id));
});

const subtotal = computed(() => {
  const precioPorPersona = precioBase.value + precioCabina.value;
  return precioPorPersona * formulario.value.cantidadPasajeros;
});

const impuestos = computed(() => {
  return (subtotal.value + precioActividades.value) * (impuestosPorcentaje.value / 100);
});

const total = computed(() => {
  return subtotal.value + precioActividades.value + impuestos.value;
});

const fechaRegreso = computed(() => {
  if (!formulario.value.fechaSalida || !destinoSeleccionado.value?.duracion) return null;
  
  const fechaSalida = new Date(formulario.value.fechaSalida);
  return addDays(fechaSalida, destinoSeleccionado.value.duracion);
});

// Validaciones para avanzar entre pasos
const puedeAvanzarPaso1 = computed(() => {
  return (
    formulario.value.destinoId && 
    formulario.value.naveId && 
    formulario.value.fechaSalida && 
    formulario.value.cantidadPasajeros > 0 &&
    disponibilidadDestino.value.disponible &&
    disponibilidadFecha.value.disponible
  );
});

const asientosInsuficientes = computed(() => {
  return formulario.value.asientos.length < formulario.value.cantidadPasajeros;
});

const mensajeAsientosSeleccionados = computed(() => {
  if (formulario.value.asientos.length === 0) {
    return 'No has seleccionado ningún asiento';
  } else if (asientosInsuficientes.value) {
    return `Has seleccionado ${formulario.value.asientos.length} de ${formulario.value.cantidadPasajeros} asientos necesarios`;
  } else {
    return `Has seleccionado ${formulario.value.asientos.length} asientos`;
  }
});

const puedeAvanzarPaso2 = computed(() => {
  return (
    formulario.value.tipoCabina && 
    formulario.value.asientos.length === parseInt(formulario.value.cantidadPasajeros)
  );
});

const asientosLimitados = computed(() => {
  if (!disponibilidadFecha.value.plazasDisponibles || !formulario.value.cantidadPasajeros) {
    return false;
  }
  return disponibilidadFecha.value.plazasDisponibles < formulario.value.cantidadPasajeros * 2;
});

const mensajeDisponibilidadAsientos = computed(() => {
  if (!disponibilidadFecha.value.plazasDisponibles) {
    return '';
  }
  
  if (asientosLimitados.value) {
    return `¡Quedan solo ${disponibilidadFecha.value.plazasDisponibles} plazas disponibles!`;
  } else {
    return `${disponibilidadFecha.value.plazasDisponibles} plazas disponibles`;
  }
});

const formatTiempoRestante = computed(() => {
  if (tiempoReservaAsientos.value <= 0) return '';
  
  const minutos = Math.floor(tiempoReservaAsientos.value / 60);
  const segundos = tiempoReservaAsientos.value % 60;
  
  return `${minutos}:${segundos.toString().padStart(2, '0')}`;
});

const formularioValido = computed(() => {
  // Validación básica para habilitar el guardado
  return formulario.value.destinoId && formulario.value.naveId;
});

// Métodos
const cargarDatos = async () => {
  loading.value = true;
  try {
    // Cargar destinos
    const destinosData = await cargarDestinos();
    destinos.value = destinosData;
    
    // Cargar naves
    const navesData = await cargarNaves();
    naves.value = navesData;
    
    // Si hay un destino preseleccionado, establecerlo
    if (route.query.destino) {
      formulario.value.destinoId = route.query.destino;
      await verificarDisponibilidadDestino();
    }
    
    // Verificar si hay datos guardados
    if (hasFormData()) {
      showRecoveryAlert.value = true;
    }
  } catch (err) {
    console.error('Error al cargar datos:', err);
    toast.error('Error', 'No se pudieron cargar los datos necesarios. Por favor, intenta nuevamente.');
  } finally {
    loading.value = false;
  }
};

const cargarActividadesDestino = async () => {
  if (!formulario.value.destinoId) return;
  
  loadingActividades.value = true;
  try {
    const actividadesData = await cargarActividades(formulario.value.destinoId);
    actividades.value = actividadesData;
  } catch (err) {
    console.error('Error al cargar actividades:', err);
    toast.error('Error', 'No se pudieron cargar las actividades. Por favor, intenta nuevamente.');
  } finally {
    loadingActividades.value = false;
  }
};

// Verificar disponibilidad del destino
const verificarDisponibilidadDestino = async () => {
  if (!formulario.value.destinoId) return;
  
  verificandoDestino.value = true;
  try {
    // En un entorno real, esto llamaría a la API
    const resultado = await simularVerificacionDisponibilidad({
      destinoId: formulario.value.destinoId
    });
    
    disponibilidadDestino.value = {
      ...resultado,
      timestamp: Date.now()
    };
    
    // Si el destino no está disponible, mostrar mensaje
    if (!resultado.disponible) {
      toast.warning('Disponibilidad', resultado.mensaje);
    }
  } catch (err) {
    console.error('Error al verificar disponibilidad del destino:', err);
    disponibilidadDestino.value = {
      disponible: false,
      mensaje: 'Error al verificar disponibilidad',
      timestamp: Date.now()
    };
  } finally {
    verificandoDestino.value = false;
  }
};

// Verificar disponibilidad de fecha
const verificarDisponibilidadFecha = async () => {
  if (!formulario.value.destinoId || !formulario.value.naveId || !formulario.value.fechaSalida) return;
  
  verificandoFecha.value = true;
  try {
    // En un entorno real, esto llamaría a la API
    const resultado = await simularVerificacionDisponibilidad({
      destinoId: formulario.value.destinoId,
      naveId: formulario.value.naveId,
      fecha: formulario.value.fechaSalida
    });
    
    // Comparar con el estado anterior para detectar cambios
    const disponibilidadAnterior = disponibilidadFecha.value.disponible;
    
    disponibilidadFecha.value = {
      ...resultado,
      timestamp: Date.now()
    };
    
    // Si la disponibilidad cambió y no es la primera verificación
    if (disponibilidadAnterior !== null && disponibilidadAnterior !== resultado.disponible) {
      mensajeDisponibilidadCambiada.value = resultado.disponible
        ? 'La fecha seleccionada ahora está disponible.'
        : 'La fecha seleccionada ya no está disponible. Por favor, selecciona otra fecha.';
      
      mostrarDialogoDisponibilidadCambiada.value = true;
    }
    
    // Si la fecha no está disponible, limpiar selección de asientos
    if (!resultado.disponible) {
      formulario.value.asientos = [];
      liberarReservaTemporalSiExiste();
    }
  } catch (err) {
    console.error('Error al verificar disponibilidad de fecha:', err);
    disponibilidadFecha.value = {
      disponible: false,
      mensaje: 'Error al verificar disponibilidad',
      timestamp: Date.now()
    };
  } finally {
    verificandoFecha.value = false;
  }
};

// Verificar disponibilidad de asientos
const verificarDisponibilidadAsientos = async () => {
  if (!formulario.value.naveId || !formulario.value.fechaSalida || !formulario.value.tipoCabina) return;
  
  verificandoAsientos.value = true;
  try {
    // En un entorno real, esto llamaría a la API
    const resultado = await simularVerificacionDisponibilidad({
      naveId: formulario.value.naveId,
      fecha: formulario.value.fechaSalida,
      tipoCabina: formulario.value.tipoCabina
    });
    
    // Actualizar lista de asientos disponibles
    asientosDisponibles.value = resultado.asientos || [];
    
    // Si no hay asientos disponibles, mostrar mensaje
    if (asientosDisponibles.value.length === 0) {
      toast.warning('Disponibilidad', 'No hay asientos disponibles para la selección actual');
    }
    
    // Crear o actualizar reserva temporal
    if (resultado.disponible && asientosDisponibles.value.length > 0) {
      await crearOActualizarReservaTemporal();
    }
  } catch (err) {
    console.error('Error al verificar disponibilidad de asientos:', err);
    asientosDisponibles.value = [];
    toast.error('Error', 'No se pudo verificar la disponibilidad de asientos');
  } finally {
    verificandoAsientos.value = false;
  }
};

// Crear o actualizar reserva temporal
const crearOActualizarReservaTemporal = async () => {
  try {
    if (reservaTemporalId.value) {
      // Actualizar reserva existente
      await actualizarReservaTemporal(reservaTemporalId.value, {
        destinoId: formulario.value.destinoId,
        naveId: formulario.value.naveId,
        fechaSalida: formulario.value.fechaSalida,
        tipoCabina: formulario.value.tipoCabina,
        cantidadPasajeros: formulario.value.cantidadPasajeros,
        asientos: formulario.value.asientos
      });
    } else {
      // Crear nueva reserva temporal
      const resultado = await crearReservaTemporal({
        destinoId: formulario.value.destinoId,
        naveId: formulario.value.naveId,
        fechaSalida: formulario.value.fechaSalida,
        tipoCabina: formulario.value.tipoCabina,
        cantidadPasajeros: formulario.value.cantidadPasajeros,
        asientos: formulario.value.asientos
      });
      
      reservaTemporalId.value = resultado.id;
      
      // Iniciar temporizador para la reserva temporal
      iniciarTemporizadorReserva(resultado.tiempoExpiracion || 600); // 10 minutos por defecto
    }
  } catch (err) {
    console.error('Error al gestionar reserva temporal:', err);
  }
};

// Iniciar temporizador para la reserva temporal
const iniciarTemporizadorReserva = (tiempoTotal) => {
  // Limpiar temporizador existente si hay
  if (timerReservaAsientos.value) {
    clearInterval(timerReservaAsientos.value);
  }
  
  tiempoReservaAsientos.value = tiempoTotal;
  
  timerReservaAsientos.value = setInterval(() => {
    if (tiempoReservaAsientos.value <= 0) {
      clearInterval(timerReservaAsientos.value);
      liberarReservaTemporalSiExiste();
      
      // Notificar al usuario
      toast.warning('Tiempo expirado', 'El tiempo para completar tu selección ha expirado. Por favor, vuelve a intentarlo.');
      
      // Recargar disponibilidad
      verificarDisponibilidadAsientos();
    } else {
      tiempoReservaAsientos.value--;
    }
  }, 1000);
};

// Liberar reserva temporal si existe
const liberarReservaTemporalSiExiste = async () => {
  if (reservaTemporalId.value) {
    try {
      await liberarReservaTemporal(reservaTemporalId.value);
    } catch (err) {
      console.error('Error al liberar reserva temporal:', err);
    } finally {
      reservaTemporalId.value = null;
      
      if (timerReservaAsientos.value) {
        clearInterval(timerReservaAsientos.value);
        tiempoReservaAsientos.value = 0;
      }
    }
  }
};

const actualizarPrecio = () => {
  // Actualizar precio base
  if (destinoSeleccionado.value) {
    precioBase.value = destinoSeleccionado.value.precio || 0;
  }
  
  // Actualizar precio de cabina
  if (tipoCabinaSeleccionada.value) {
    precioCabina.value = tipoCabinaSeleccionada.value.precio || 0;
  }
  
  // Actualizar precio de actividades
  precioActividades.value = actividadesSeleccionadas.value.reduce((total, act) => total + act.precio, 0);
};

const handlePasajerosChange = () => {
  // Validar número de pasajeros
  if (formulario.value.cantidadPasajeros < 1) {
    formulario.value.cantidadPasajeros = 1;
  } else if (formulario.value.cantidadPasajeros > 10) {
    formulario.value.cantidadPasajeros = 10;
  }
  
  // Limpiar asientos seleccionados si cambia el número de pasajeros
  formulario.value.asientos = [];
  
  // Recalcular precio
  actualizarPrecio();
  
  // Guardar formulario
  guardarFormulario();
};

const handleCabinaChange = () => {
  // Limpiar asientos seleccionados si cambia la cabina
  formulario.value.asientos = [];
  
  // Verificar disponibilidad de asientos para la nueva cabina
  verificarDisponibilidadAsientos();
  
  // Actualizar precio
  actualizarPrecio();
  
  // Guardar formulario
  guardarFormulario();
};

const handleAsientosChange = (asientos) => {
  formulario.value.asientos = asientos;
  
  // Actualizar reserva temporal
  if (reservaTemporalId.value) {
    actualizarReservaTemporal(reservaTemporalId.value, {
      asientos: asientos
    }).catch(err => {
      console.error('Error al actualizar asientos en reserva temporal:', err);
    });
  }
  
  // Guardar formulario
  guardarFormulario();
};

const avanzarPaso = async () => {
  // Validar paso actual
  let puedeAvanzar = true;
  
  if (pasoActual.value === 1 && !puedeAvanzarPaso1.value) {
    puedeAvanzar = false;
  } else if (pasoActual.value === 2 && !puedeAvanzarPaso2.value) {
    puedeAvanzar = false;
  }
  
  if (!puedeAvanzar) {
    toast.error('Error', 'Por favor, completa todos los campos requeridos');
    return;
  }
  
  // Marcar paso como completado
  if (!pasosCompletados.value.includes(pasoActual.value)) {
    pasosCompletados.value.push(pasoActual.value);
  }
  
  // Inicializar datos del siguiente paso si es necesario
  if (pasoActual.value === 1) {
    // Inicializar pasajeros si es necesario
    if (formulario.value.pasajeros.length !== formulario.value.cantidadPasajeros) {
      formulario.value.pasajeros = Array.from({ length: formulario.value.cantidadPasajeros }, () => ({
        nombre: '',
        fechaNacimiento: '',
        tipoDocumento: '',
        numeroDocumento: '',
        email: '',
        telefono: ''
      }));
    }
  } else if (pasoActual.value === 2) {
    // Cargar actividades para el paso 3
    await cargarActividadesDestino();
  }
  
  // Avanzar al siguiente paso
  pasoActual.value++;
  formulario.value.pasoActual = pasoActual.value;
  
  // Guardar formulario
  guardarFormulario();
  
  // Scroll al inicio
  window.scrollTo(0, 0);
};

const retrocederPaso = () => {
  if (pasoActual.value > 1) {
    pasoActual.value--;
    formulario.value.pasoActual = pasoActual.value;
    
    // Guardar formulario
    guardarFormulario();
    
    // Scroll al inicio
    window.scrollTo(0, 0);
  }
};

const intentarCambiarPaso = (paso) => {
  // Solo permitir cambiar a pasos completados o al siguiente paso
  if (pasosCompletados.value.includes(paso) || paso === pasoActual.value + 1) {
    pasoActual.value = paso;
    formulario.value.pasoActual = paso;
    
    // Guardar formulario
    guardarFormulario();
    
    // Scroll al inicio
    window.scrollTo(0, 0);
  } else {
    toast.info('Información', 'Debes completar los pasos anteriores primero');
  }
};

const confirmarReserva = async () => {
  if (enviandoReserva.value) return;
  
  enviandoReserva.value = true;
  
  try {
    // Crear objeto de reserva
    const reservaData = {
      destinoId: formulario.value.destinoId,
      naveId: formulario.value.naveId,
      fechaSalida: formulario.value.fechaSalida,
      fechaRegreso: fechaRegreso.value,
      numPasajeros: formulario.value.cantidadPasajeros,
      asientos: formulario.value.asientos,
      actividades: formulario.value.actividades.map(id => {
        const actividad = actividades.value.find(a => a.id === id);
        return {
          actividadId: id,
          cantidad: formulario.value.cantidadPasajeros,
          precioUnitario: actividad ? actividad.precio : 0
        };
      }),
      pasajeros: formulario.value.pasajeros,
      precioTotal: total.value
    };
    
    // Enviar reserva
    const reservaCreada = await crearReserva(reservaData);
    
    // Liberar reserva temporal
    await liberarReservaTemporalSiExiste();
    
    // Limpiar formulario guardado
    limpiarFormulario();
    
    // Mostrar mensaje de éxito
    toast.success('Reserva creada', 'Tu reserva ha sido creada correctamente');
    
    // Redirigir a la página de detalle de reserva
    router.push(`/reservas/${reservaCreada.id}`);
  } catch (err) {
    console.error('Error al crear reserva:', err);
    toast.error('Error', 'No se pudo crear la reserva. Por favor, intenta nuevamente.');
  } finally {
    enviandoReserva.value = false;
  }
};

// Métodos para gestionar la recuperación de datos
const continuarReserva = async () => {
  showRecoveryAlert.value = false;
  
  // Restaurar datos guardados
  const restaurado = restaurarFormulario();
  
  if (restaurado) {
    // Restaurar paso
    pasoActual.value = formulario.value.pasoActual || 1;
    
    // Marcar pasos anteriores como completados
    pasosCompletados.value = [];
    for (let i = 1; i < pasoActual.value; i++) {
      pasosCompletados.value.push(i);
    }
    
    // Verificar disponibilidad actual
    if (formulario.value.destinoId) {
      await verificarDisponibilidadDestino();
    }
    
    if (formulario.value.destinoId && formulario.value.naveId && formulario.value.fechaSalida) {
      await verificarDisponibilidadFecha();
    }
    
    if (formulario.value.naveId && formulario.value.fechaSalida && formulario.value.tipoCabina) {
      await verificarDisponibilidadAsientos();
    }
    
    // Actualizar precios
    actualizarPrecio();
    
    toast.success('Reserva recuperada', 'Se ha recuperado tu reserva en progreso');
  }
};

const descartarRecuperacion = () => {
  showRecoveryAlert.value = false;
  limpiarFormulario();
};

// Métodos para gestionar el guardado de borradores
const guardarBorrador = async () => {
  guardandoFormulario.value = true;
  errorGuardado.value = false;
  
  try {
    // Guardar formulario
    await guardarFormulario();
    lastSaved.value = Date.now();
    
    toast.success('Borrador guardado', 'Tu reserva ha sido guardada como borrador');
  } catch (err) {
    console.error('Error al guardar borrador:', err);
    errorGuardado.value = true;
    toast.error('Error', 'No se pudo guardar el borrador. Por favor, intenta nuevamente.');
  } finally {
    guardandoFormulario.value = false;
  }
};

// Métodos para gestionar el abandono de la reserva
const abandonarReserva = () => {
  if (isDirty.value) {
    mostrarDialogoAbandonar.value = true;
  } else {
    router.push('/reservas');
  }
};

const abandonarSinGuardar = async () => {
  mostrarDialogoAbandonar.value = false;
  
  // Liberar reserva temporal
  await liberarReservaTemporalSiExiste();
  
  // Limpiar formulario guardado
  limpiarFormulario();
  
  // Redirigir a la página de reservas
  router.push('/reservas');
};

const guardarYAbandonar = async () => {
  mostrarDialogoAbandonar.value = false;
  
  // Guardar borrador
  await guardarBorrador();
  
  // Liberar reserva temporal
  await liberarReservaTemporalSiExiste();
  
  // Redirigir a la página de reservas
  router.push('/reservas');
};

// Lifecycle hooks
onMounted(async () => {
  await cargarDatos();
});

onBeforeUnmount(() => {
  // Limpiar temporizadores
  if (timerReservaAsientos.value) {
    clearInterval(timerReservaAsientos.value);
  }
  
  // Liberar reserva temporal
  liberarReservaTemporalSiExiste();
});

// Observar cambios en el formulario para actualizar precios
watch(
  [
    () => formulario.value.destinoId,
    () => formulario.value.tipoCabina,
    () => formulario.value.actividades
  ],
  () => {
    actualizarPrecio();
  }
);

// Verificar disponibilidad periódicamente
const iniciarVerificacionPeriodica = () => {
  // Verificar cada 2 minutos
  const interval = setInterval(() => {
    if (formulario.value.destinoId && formulario.value.naveId && formulario.value.fechaSalida) {
      verificarDisponibilidadFecha();
    }
    
    if (formulario.value.naveId && formulario.value.fechaSalida && formulario.value.tipoCabina && pasoActual.value === 2) {
      verificarDisponibilidadAsientos();
    }
  }, 2 * 60 * 1000); // 2 minutos
  
  // Limpiar intervalo al desmontar
  onBeforeUnmount(() => {
    clearInterval(interval);
  });
};

iniciarVerificacionPeriodica();
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
