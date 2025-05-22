<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
      
      <div v-else class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div class="bg-primary p-6 text-white">
            <h1 class="text-2xl font-bold">Mi Perfil</h1>
          </div>
          
          <div class="p-6">
            <div class="flex flex-col md:flex-row gap-8">
              <div class="md:w-1/3">
                <div class="aspect-square rounded-full overflow-hidden bg-gray-200 mb-4">
                  <img 
                    v-if="usuarioFoto" 
                    :src="usuarioFoto" 
                    alt="Foto de perfil"
                    class="w-full h-full object-cover" 
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                    <span class="text-4xl text-gray-400">{{ iniciales }}</span>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <Button variant="outline" class="w-full" @click="mostrarCambiarFoto = true">
                    Cambiar foto
                  </Button>
                  
                  <Button variant="ghost" class="w-full text-destructive hover:text-destructive" @click="mostrarEliminarCuenta = true">
                    Eliminar cuenta
                  </Button>
                </div>
              </div>
              
              <div class="md:w-2/3">
                <Tabs defaultValue="personal" class="w-full">
                  <TabsList class="mb-4">
                    <TabsTrigger value="personal">Datos personales</TabsTrigger>
                    <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
                    <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="personal">
                    <form @submit.prevent="guardarDatosPersonales">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label for="nombre">Nombre</Label>
                          <Input id="nombre" v-model="formData.nombre" required />
                        </div>
                        
                        <div>
                          <Label for="apellido">Apellido</Label>
                          <Input id="apellido" v-model="formData.apellido" required />
                        </div>
                        
                        <div>
                          <Label for="email">Email</Label>
                          <Input id="email" type="email" v-model="formData.email" disabled />
                          <p class="text-xs text-gray-500 mt-1">El email no se puede cambiar</p>
                        </div>
                        
                        <div>
                          <Label for="telefono">Teléfono</Label>
                          <Input id="telefono" v-model="formData.telefono" />
                        </div>
                      </div>
                      
                      <div class="border-t pt-6">
                        <Button type="submit" :disabled="guardandoDatosPersonales">
                          {{ guardandoDatosPersonales ? 'Guardando...' : 'Guardar cambios' }}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="seguridad">
                    <form @submit.prevent="cambiarPassword">
                      <div class="space-y-4">
                        <div>
                          <Label for="currentPassword">Contraseña actual</Label>
                          <Input id="currentPassword" type="password" v-model="passwordData.currentPassword" required />
                        </div>
                        
                        <div>
                          <Label for="newPassword">Nueva contraseña</Label>
                          <Input id="newPassword" type="password" v-model="passwordData.newPassword" required />
                        </div>
                        
                        <div>
                          <Label for="confirmPassword">Confirmar nueva contraseña</Label>
                          <Input id="confirmPassword" type="password" v-model="passwordData.confirmPassword" required />
                          <p v-if="passwordError" class="text-red-500 text-sm mt-1">{{ passwordError }}</p>
                        </div>
                      </div>
                      
                      <div class="mt-6">
                        <Button type="submit" :disabled="cambiandoPassword">
                          {{ cambiandoPassword ? 'Cambiando...' : 'Cambiar contraseña' }}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="preferencias">
                    <div class="space-y-4">
                      <div>
                        <Label class="text-base">Notificaciones</Label>
                        <div class="mt-2 space-y-2">
                          <div class="flex items-center justify-between">
                            <div>
                              <p class="font-medium">Correos promocionales</p>
                              <p class="text-sm text-gray-500">Recibe ofertas y novedades</p>
                            </div>
                            <Switch v-model="preferencias.emailPromocional" />
                          </div>
                          
                          <div class="flex items-center justify-between">
                            <div>
                              <p class="font-medium">Notificaciones de reserva</p>
                              <p class="text-sm text-gray-500">Actualizaciones sobre tus reservas</p>
                            </div>
                            <Switch v-model="preferencias.notificacionesReserva" />
                          </div>
                          
                          <div class="flex items-center justify-between">
                            <div>
                              <p class="font-medium">Recordatorios de viaje</p>
                              <p class="text-sm text-gray-500">Recordatorios antes de tu viaje</p>
                            </div>
                            <Switch v-model="preferencias.recordatoriosViaje" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label class="text-base">Preferencias de viaje</Label>
                        <div class="mt-2 space-y-2">
                          <div>
                            <Label for="tipoAsiento">Tipo de asiento preferido</Label>
                            <Select id="tipoAsiento" v-model="preferencias.tipoAsiento">
                              <option value="economico">Económico</option>
                              <option value="premium">Premium</option>
                              <option value="business">Business</option>
                              <option value="primera">Primera clase</option>
                            </Select>
                          </div>
                          
                          <div>
                            <Label for="comidaPreferida">Comida preferida</Label>
                            <Select id="comidaPreferida" v-model="preferencias.comidaPreferida">
                              <option value="estandar">Estándar</option>
                              <option value="vegetariana">Vegetariana</option>
                              <option value="vegana">Vegana</option>
                              <option value="sinGluten">Sin gluten</option>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <div class="border-t pt-6">
                        <Button @click="guardarPreferencias" :disabled="guardandoPreferencias">
                          {{ guardandoPreferencias ? 'Guardando...' : 'Guardar preferencias' }}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Estadísticas del usuario -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold">{{ estadisticas.totalReservas }}</div>
              <p class="text-sm text-gray-500">Total de reservas realizadas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Destinos</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold">{{ estadisticas.destinosVisitados }}</div>
              <p class="text-sm text-gray-500">Destinos visitados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Reseñas</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold">{{ estadisticas.totalResenas }}</div>
              <p class="text-sm text-gray-500">Reseñas publicadas</p>
            </CardContent>
          </Card>
        </div>
        
        <!-- Actividad reciente -->
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="actividades.length === 0" class="text-center py-4">
              <p class="text-gray-500">No hay actividad reciente</p>
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="(actividad, index) in actividades" 
                :key="index"
                class="flex items-start pb-4"
                :class="{ 'border-b border-gray-100': index < actividades.length - 1 }"
              >
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <component :is="obtenerIconoActividad(actividad.tipo)" class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p class="font-medium">{{ actividad.titulo }}</p>
                  <p class="text-sm text-gray-500">{{ actividad.descripcion }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ formatDate(actividad.fecha) }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Sección de configuración -->
        <section class="mt-8">
          <h2 class="text-xl font-semibold mb-4">Configuración</h2>
          <ThemeSettings />
          <!-- Otras configuraciones del perfil -->
        </section>
      </div>
      
      <!-- Modal para cambiar foto -->
      <Modal 
        v-if="mostrarCambiarFoto" 
        title="Cambiar foto de perfil" 
        @close="mostrarCambiarFoto = false"
      >
        <div class="space-y-4">
          <div class="flex justify-center">
            <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              <img 
                v-if="nuevaFoto || usuarioFoto" 
                :src="nuevaFoto || usuarioFoto" 
                alt="Foto de perfil"
                class="w-full h-full object-cover" 
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                <span class="text-4xl text-gray-400">{{ iniciales }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex justify-center">
            <label class="cursor-pointer">
              <span class="btn-primary inline-block">Seleccionar imagen</span>
              <input 
                type="file" 
                accept="image/*" 
                class="hidden" 
                @change="seleccionarFoto"
              />
            </label>
          </div>
          
          <div class="flex justify-end gap-4 mt-6">
            <Button variant="outline" @click="mostrarCambiarFoto = false">
              Cancelar
            </Button>
            <Button @click="guardarFoto" :disabled="guardandoFoto">
              {{ guardandoFoto ? 'Guardando...' : 'Guardar' }}
            </Button>
          </div>
        </div>
      </Modal>
      
      <!-- Modal para eliminar cuenta -->
      <AlertDialog v-if="mostrarEliminarCuenta">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y todos tus datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" @click="mostrarEliminarCuenta = false">
            Cancelar
          </Button>
          <Button variant="destructive" @click="eliminarCuenta" :disabled="eliminandoCuenta">
            {{ eliminandoCuenta ? 'Eliminando...' : 'Eliminar cuenta' }}
          </Button>
        </AlertDialogFooter>
      </AlertDialog>
    </div>
  </MainLayout>
</template>

<script setup>
// Añadir el import del componente ThemeSettings
import ThemeSettings from '../components/common/ThemeSettings.vue';
import { ref, computed, onMounted } from 'vue';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, CreditCardIcon, MessageSquareIcon, UserIcon } from '@/utils/lucide-adapter';
import MainLayout from '../layouts/MainLayout.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import Button from '../components/ui/Button.vue';
import Input from '../components/ui/Input.vue';
import Label from '../components/ui/Label.vue';
import Switch from '../components/ui/Switch.vue';
import Select from '../components/ui/Select.vue';
import Modal from '../components/ui/Modal.vue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { AlertDialog, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '../components/ui/alert-dialog';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';
import { useAuthStore } from '../stores/auth';

const { user, updateProfile, updatePassword, deleteAccount, reauthenticate } = useAuth();
const toast = useToast();

// Estado
const loading = ref(true);
// Stores
const authStore = useAuthStore();

// Computed para acceder al estado del store de manera segura
const usuarioNombre = computed(() => authStore.user?.displayName?.split(' ')[0] || '');
const usuarioApellido = computed(() => authStore.user?.displayName?.split(' ').slice(1).join(' ') || '');
const usuarioEmail = computed(() => authStore.user?.email || '');
const usuarioTelefono = computed(() => authStore.userProfile?.telefono || '');
const usuarioFoto = computed(() => authStore.user?.photoURL || null);

// Estado del formulario
const formData = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: ''
});

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const preferencias = ref({
  emailPromocional: true,
  notificacionesReserva: true,
  recordatoriosViaje: true,
  tipoAsiento: 'economico',
  comidaPreferida: 'estandar'
});

const estadisticas = ref({
  totalReservas: 0,
  destinosVisitados: 0,
  totalResenas: 0
});

const actividades = ref([]);
const passwordError = ref('');
const nuevaFoto = ref(null);

// Estados de carga
const guardandoDatosPersonales = ref(false);
const cambiandoPassword = ref(false);
const guardandoPreferencias = ref(false);
const guardandoFoto = ref(false);
const eliminandoCuenta = ref(false);

// Estados de modales
const mostrarCambiarFoto = ref(false);
const mostrarEliminarCuenta = ref(false);

// Computed
const iniciales = computed(() => {
  if (!usuarioNombre.value) return '?';
  return (usuarioNombre.value.charAt(0) + (usuarioApellido.value?.charAt(0) || '')).toUpperCase();
});

// Métodos
const cargarDatosUsuario = async () => {
  loading.value = true;
  try {
    if (!authStore.isAuthenticated) {
      throw new Error('Usuario no autenticado');
    }
    
    // Cargar perfil de usuario desde el store
    await authStore.loadUserProfile();
    
    // Inicializar formulario con datos del usuario
    formData.value = {
      nombre: usuarioNombre.value,
      apellido: usuarioApellido.value,
      email: usuarioEmail.value,
      telefono: usuarioTelefono.value
    };
    
    // Cargar estadísticas
    await cargarEstadisticas();
    
    // Cargar actividades recientes
    await cargarActividades();
    
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
    toast.error('No se pudieron cargar tus datos. Por favor, intenta nuevamente.');
  } finally {
    loading.value = false;
  }
};

const cargarEstadisticas = async () => {
  try {
    // Simular carga de estadísticas
    await new Promise(resolve => setTimeout(resolve, 300));
    
    estadisticas.value = {
      totalReservas: 5,
      destinosVisitados: 3,
      totalResenas: 2
    };
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
};

const cargarActividades = async () => {
  try {
    // Simular carga de actividades
    await new Promise(resolve => setTimeout(resolve, 200));
    
    actividades.value = [
      {
        tipo: 'reserva',
        titulo: 'Nueva reserva',
        descripcion: 'Has reservado un viaje a Marte',
        fecha: new Date(2023, 10, 15)
      },
      {
        tipo: 'resena',
        titulo: 'Reseña publicada',
        descripcion: 'Has publicado una reseña sobre tu viaje a la Luna',
        fecha: new Date(2023, 9, 28)
      },
      {
        tipo: 'perfil',
        titulo: 'Perfil actualizado',
        descripcion: 'Has actualizado tu información de perfil',
        fecha: new Date(2023, 9, 20)
      }
    ];
  } catch (error) {
    console.error('Error al cargar actividades:', error);
  }
};

const guardarDatosPersonales = async () => {
  guardandoDatosPersonales.value = true;
  try {
    // Actualizar perfil en Firebase
    await updateProfile({
      displayName: `${formData.value.nombre} ${formData.value.apellido}`,
      // No actualizamos photoURL aquí
    });
    
    toast.success('Datos personales actualizados correctamente');
  } catch (error) {
    console.error('Error al guardar datos personales:', error);
    toast.error('No se pudieron guardar los cambios. Por favor, intenta nuevamente.');
  } finally {
    guardandoDatosPersonales.value = false;
  }
};

const cambiarPassword = async () => {
  passwordError.value = '';
  
  // Validar que las contraseñas coincidan
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    passwordError.value = 'Las contraseñas no coinciden';
    return;
  }
  
  cambiandoPassword.value = true;
  try {
    // Reautenticar al usuario
    await reauthenticate(passwordData.value.currentPassword);
    
    // Cambiar contraseña
    await updatePassword(passwordData.value.newPassword);
    
    toast.success('Contraseña actualizada correctamente');
    
    // Limpiar formulario
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    
    if (error.code === 'auth/wrong-password') {
      passwordError.value = 'La contraseña actual es incorrecta';
    } else if (error.code === 'auth/weak-password') {
      passwordError.value = 'La nueva contraseña es demasiado débil';
    } else {
      passwordError.value = 'Error al cambiar la contraseña. Intenta nuevamente.';
    }
    
    toast.error(passwordError.value);
  } finally {
    cambiandoPassword.value = false;
  }
};

const guardarPreferencias = async () => {
  guardandoPreferencias.value = true;
  try {
    // Simular guardado de preferencias
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success('Preferencias guardadas correctamente');
  } catch (error) {
    console.error('Error al guardar preferencias:', error);
    toast.error('No se pudieron guardar las preferencias. Por favor, intenta nuevamente.');
  } finally {
    guardandoPreferencias.value = false;
  }
};

const seleccionarFoto = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    toast.error('Por favor, selecciona una imagen válida');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    nuevaFoto.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const guardarFoto = async () => {
  if (!nuevaFoto.value) {
    mostrarCambiarFoto.value = false;
    return;
  }
  
  guardandoFoto.value = true;
  try {
    // Actualizar foto en Firebase
    await updateProfile({
      photoURL: nuevaFoto.value
    });
    
    toast.success('Foto de perfil actualizada correctamente');
    mostrarCambiarFoto.value = false;
    nuevaFoto.value = null;
  } catch (error) {
    console.error('Error al guardar foto:', error);
    toast.error('No se pudo actualizar la foto de perfil. Por favor, intenta nuevamente.');
  } finally {
    guardandoFoto.value = false;
  }
};

const eliminarCuenta = async () => {
  eliminandoCuenta.value = true;
  try {
    await deleteAccount();
    toast.success('Cuenta eliminada correctamente');
    // La redirección se maneja en el servicio de autenticación
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    toast.error('No se pudo eliminar la cuenta. Por favor, intenta nuevamente.');
    mostrarEliminarCuenta.value = false;
  } finally {
    eliminandoCuenta.value = false;
  }
};

const obtenerIconoActividad = (tipo) => {
  const iconos = {
    'reserva': CalendarIcon,
    'resena': MessageSquareIcon,
    'perfil': UserIcon,
    'pago': CreditCardIcon
  };
  
  return iconos[tipo] || UserIcon;
};

const formatDate = (date) => {
  return format(new Date(date), 'PPP', { locale: es });
};

// Lifecycle hooks
onMounted(() => {
  cargarDatosUsuario();
});
</script>

<style scoped>
.btn-primary {
  @apply px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors;
}
</style>
