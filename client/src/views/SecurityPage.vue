<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Seguridad de la cuenta</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Menú lateral -->
      <div class="md:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <nav class="space-y-1">
            <button 
              v-for="(item, index) in menuItems" 
              :key="index"
              @click="activeSection = item.id"
              class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md"
              :class="activeSection === item.id ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              <component :is="item.icon" class="h-5 w-5 mr-3" />
              {{ item.name }}
            </button>
          </nav>
        </div>
      </div>
      
      <!-- Contenido principal -->
      <div class="md:col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <!-- Sesiones activas -->
          <div v-if="activeSection === 'sessions'" class="p-6">
            <SessionsManager />
          </div>
          
          <!-- Cambiar contraseña -->
          <div v-else-if="activeSection === 'password'" class="p-6">
            <h2 class="text-xl font-semibold mb-4">Cambiar contraseña</h2>
            
            <form @submit.prevent="changePassword" class="space-y-4">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contraseña actual
                </label>
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nueva contraseña
                </label>
                <input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirmar nueva contraseña
                </label>
                <input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div v-if="passwordError" class="text-red-500 text-sm">
                {{ passwordError }}
              </div>
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  :disabled="passwordLoading"
                >
                  <div v-if="passwordLoading" class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </div>
                  <span v-else>Cambiar contraseña</span>
                </button>
              </div>
            </form>
          </div>
          
          <!-- Verificación en dos pasos -->
          <div v-else-if="activeSection === '2fa'" class="p-6">
            <h2 class="text-xl font-semibold mb-4">Verificación en dos pasos</h2>
            
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
              <div class="flex">
                <AlertTriangleIcon class="h-5 w-5 text-yellow-400 mr-3" />
                <div>
                  <p class="text-sm text-yellow-700 dark:text-yellow-400">
                    La verificación en dos pasos añade una capa adicional de seguridad a tu cuenta.
                  </p>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between py-4 border-b">
              <div>
                <h3 class="font-medium">Verificación por SMS</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Recibe un código por SMS para verificar tu identidad
                </p>
              </div>
              <div>
                <button
                  @click="toggle2FA('sms')"
                  class="relative inline-flex h-6 w-11 items-center rounded-full"
                  :class="twoFactorMethods.sms ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                    :class="twoFactorMethods.sms ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>
            
            <div class="flex items-center justify-between py-4 border-b">
              <div>
                <h3 class="font-medium">Aplicación de autenticación</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Usa una aplicación como Google Authenticator o Authy
                </p>
              </div>
              <div>
                <button
                  @click="toggle2FA('app')"
                  class="relative inline-flex h-6 w-11 items-center rounded-full"
                  :class="twoFactorMethods.app ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                    :class="twoFactorMethods.app ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>
            
            <div class="flex items-center justify-between py-4">
              <div>
                <h3 class="font-medium">Códigos de respaldo</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Genera códigos de respaldo para usar en caso de emergencia
                </p>
              </div>
              <div>
                <button
                  @click="generateBackupCodes"
                  class="px-3 py-1 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  :disabled="!twoFactorMethods.sms && !twoFactorMethods.app"
                >
                  Generar códigos
                </button>
              </div>
            </div>
          </div>
          
          <!-- Actividad de la cuenta -->
          <div v-else-if="activeSection === 'activity'" class="p-6">
            <h2 class="text-xl font-semibold mb-4">Actividad de la cuenta</h2>
            
            <div v-if="loadingActivity" class="flex justify-center my-8">
              <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
            
            <div v-else-if="accountActivity.length === 0" class="text-center py-8 text-gray-500">
              No hay actividad reciente
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="(activity, index) in accountActivity" :key="index" class="flex items-start space-x-3 py-3 border-b border-gray-200 dark:border-gray-700">
                <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
               
                </div>
                
                <div>
                  <div class="font-medium">{{ getActivityTitle(activity) }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(activity.timestamp) }}
                  </div>
                  <div v-if="activity.details" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ activity.details }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import SessionsManager from '../components/auth/SessionsManager.vue'
import { 
  KeyIcon, 
  ShieldIcon,  
  UsersIcon, 
  AlertTriangleIcon,
  LogInIcon,
  LogOutIcon,
  UserIcon,
  SettingsIcon,
  LockIcon
} from '@/utils/lucide-adapter'

// Store
const authStore = useAuthStore()

// Estado
const activeSection = ref('sessions')
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordError = ref('')
const passwordLoading = ref(false)
const twoFactorMethods = ref({
  sms: false,
  app: false
})
const accountActivity = ref([])
const loadingActivity = ref(false)

// Menú de navegación
const menuItems = [
  { id: 'sessions', name: 'Sesiones activas', icon: UsersIcon },
  { id: 'password', name: 'Cambiar contraseña', icon: KeyIcon },
  { id: '2fa', name: 'Verificación en dos pasos', icon: ShieldIcon },
  { id: 'activity', name: 'Actividad de la cuenta', icon: KeyIcon }
]

// Métodos
const changePassword = async () => {
  passwordError.value = ''
  
  // Validar que las contraseñas coincidan
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Las contraseñas no coinciden'
    return
  }
  
  // Validar longitud mínima
  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }
  
  passwordLoading.value = true
  
  try {
    // Implementar cambio de contraseña
    const result = await authStore.updatePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    
    if (result) {
      // Limpiar formulario
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      
      // Mostrar mensaje de éxito
      alert('Contraseña actualizada correctamente')
    } else {
      passwordError.value = authStore.error || 'Error al cambiar la contraseña'
    }
  } catch (error) {
    passwordError.value = error.message || 'Error al cambiar la contraseña'
  } finally {
    passwordLoading.value = false
  }
}

const toggle2FA = (method) => {
  twoFactorMethods.value[method] = !twoFactorMethods.value[method]
  
  // Aquí iría la lógica para activar/desactivar 2FA en el servidor
}

const generateBackupCodes = () => {
  // Aquí iría la lógica para generar códigos de respaldo
  alert('Funcionalidad en desarrollo')
}

const fetchAccountActivity = async () => {
  loadingActivity.value = true
  
  try {
    // Aquí iría la lógica para obtener la actividad de la cuenta
    // Simulamos datos para el ejemplo
    setTimeout(() => {
      accountActivity.value = [
        { type: 'login', timestamp: new Date(Date.now() - 3600000), details: 'Chrome en Windows' },
        { type: 'password_change', timestamp: new Date(Date.now() - 86400000) },
        { type: 'login', timestamp: new Date(Date.now() - 172800000), details: 'Firefox en MacOS' },
        { type: 'profile_update', timestamp: new Date(Date.now() - 604800000) },
        { type: 'logout', timestamp: new Date(Date.now() - 1209600000) }
      ]
      loadingActivity.value = false
    }, 1000)
  } catch (error) {
    console.error('Error al obtener actividad de la cuenta:', error)
    loadingActivity.value = false
  }
}



const getActivityTitle = (activity) => {
  switch (activity.type) {
    case 'login': return 'Inicio de sesión'
    case 'logout': return 'Cierre de sesión'
    case 'password_change': return 'Cambio de contraseña'
    case 'profile_update': return 'Actualización de perfil'
    case 'settings_change': return 'Cambio de configuración'
    default: return 'Actividad desconocida'
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// Ciclo de vida
onMounted(() => {
  // Cargar sesiones activas
  authStore.fetchActiveSessions()
  
  // Cargar actividad de la cuenta
  fetchAccountActivity()
})
</script>
