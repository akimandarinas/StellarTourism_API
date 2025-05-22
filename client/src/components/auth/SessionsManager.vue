<template>
  <div class="sessions-manager">
    <h2 class="text-xl font-semibold mb-4">Sesiones activas</h2>
    
    <Alert v-if="error" variant="error" class="mb-4" role="alert">
      {{ error }}
    </Alert>
    
    <div v-if="loading" class="flex justify-center my-8" role="status" aria-label="Cargando sesiones activas">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="sessions.length === 0" class="text-center py-8 text-gray-500">
      No hay sesiones activas
    </div>
    
    <div v-else class="space-y-4">
      <!-- Lista de sesiones -->
      <ul aria-label="Lista de sesiones activas">
        <li v-for="session in sessions" :key="session.id" class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-3">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <!-- Icono según dispositivo -->
              <div class="bg-primary/10 text-primary p-2 rounded-full" aria-hidden="true">
                <ComputerIcon v-if="isDesktop(session)" class="h-5 w-5" />
                <SmartphoneIcon v-else-if="isMobile(session)" class="h-5 w-5" />
                <TabletIcon v-else class="h-5 w-5" />
              </div>
              
              <div>
                <div class="font-medium flex items-center">
                  {{ getDeviceDescription(session) }}
                  <span v-if="session.isCurrent" class="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    Actual
                  </span>
                </div>
                
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  Última actividad: {{ formatDate(session.lastActiveAt) }}
                </div>
                
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  IP: {{ session.deviceInfo.ip }}
                  <span v-if="session.deviceInfo.location" class="ml-1">
                    ({{ session.deviceInfo.location }})
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              v-if="!session.isCurrent || allowCloseCurrent"
              @click="closeSession(session.id)"
              class="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-1"
              :disabled="closingSession === session.id"
              :aria-label="'Cerrar sesión en ' + getDeviceDescription(session)"
              aria-live="polite"
            >
              <XIcon v-if="closingSession !== session.id" class="h-5 w-5" aria-hidden="true" />
              <div v-else class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
            </button>
          </div>
        </li>
      </ul>
      
      <!-- Acciones -->
      <div class="flex justify-end space-x-4 mt-6">
        <Button 
          @click="closeOtherSessions"
          variant="secondary"
          :disabled="loading || closingAll || sessions.length <= 1"
          aria-live="polite"
        >
          <span v-if="closingOthers" class="flex items-center">
            <LoaderIcon class="animate-spin mr-2 h-4 w-4" />
            Cerrando...
          </span>
          <span v-else>Cerrar otras sesiones</span>
        </Button>
        
        <Button 
          v-if="allowCloseCurrent"
          @click="confirmCloseAllSessions"
          variant="danger"
          :disabled="loading || closingAll"
          aria-live="polite"
        >
          <span v-if="closingAll" class="flex items-center">
            <LoaderIcon class="animate-spin mr-2 h-4 w-4" />
            Cerrando...
          </span>
          <span v-else>Cerrar todas las sesiones</span>
        </Button>
      </div>
    </div>
    
    <ConfirmationDialog
      v-if="showConfirmDialog"
      title="Cerrar todas las sesiones"
      message="¿Estás seguro de que deseas cerrar todas las sesiones? Esta acción cerrará tu sesión actual y tendrás que iniciar sesión nuevamente."
      confirmText="Cerrar todas"
      cancelText="Cancelar"
      :loading="closingAll"
      @confirm="closeAllSessions"
      @cancel="showConfirmDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { ComputerIcon, SmartphoneIcon, TabletIcon, XIcon, LoaderIcon } from '@/utils/lucide-adapter'
import Button from '../ui/Button.vue'
import Alert from '../ui/Alert.vue'
import ConfirmationDialog from '../common/ConfirmationDialog.vue'

const props = defineProps({
  allowCloseCurrent: {
    type: Boolean,
    default: true
  }
})

//Store
const authStore = useAuthStore()

//Estado
const loading = ref(false)
const closingSession = ref(null)
const closingAll = ref(false)
const closingOthers = ref(false)
const error = ref('')
const showConfirmDialog = ref(false)

const sessions = computed(() => authStore.activeSessions)

const fetchSessions = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.fetchActiveSessions()
  } catch (err) {
    console.error('Error al cargar sesiones:', err)
    error.value = 'No se pudieron cargar las sesiones activas. Por favor, intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

const closeSession = async (sessionId) => {
  closingSession.value = sessionId
  error.value = ''
  
  try {
    await authStore.closeSession(sessionId)
    
    // Anunciar para lectores de pantalla
    announceMessage('Sesión cerrada correctamente')
  } catch (err) {
    console.error('Error al cerrar sesión:', err)
    error.value = 'No se pudo cerrar la sesión. Por favor, intenta nuevamente.'
  } finally {
    closingSession.value = null
  }
}

const closeOtherSessions = async () => {
  closingOthers.value = true
  error.value = ''
  
  try {
    await authStore.logoutOtherSessions()
    
    // Anunciar para lectores de pantalla
    announceMessage('Otras sesiones cerradas correctamente')
  } catch (err) {
    console.error('Error al cerrar otras sesiones:', err)
    error.value = 'No se pudieron cerrar las otras sesiones. Por favor, intenta nuevamente.'
  } finally {
    closingOthers.value = false
  }
}

const confirmCloseAllSessions = () => {
  showConfirmDialog.value = true
}

const closeAllSessions = async () => {
  closingAll.value = true
  error.value = ''
  showConfirmDialog.value = false
  
  try {
    await authStore.logoutAllSessions()
    
    // No es necesario anunciar aquí ya que el usuario será redirigido
  } catch (err) {
    console.error('Error al cerrar todas las sesiones:', err)
    error.value = 'No se pudieron cerrar todas las sesiones. Por favor, intenta nuevamente.'
    closingAll.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  
  return date.toLocaleDateString()
}

const isDesktop = (session) => {
  return session.deviceInfo.os.includes('Windows') || 
         session.deviceInfo.os.includes('Mac') || 
         session.deviceInfo.os.includes('Linux')
}

const isMobile = (session) => {
  return session.deviceInfo.os.includes('Android') || 
         session.deviceInfo.os.includes('iOS')
}

const getDeviceDescription = (session) => {
  return `${session.deviceInfo.browser} en ${session.deviceInfo.os}`
}

const announceMessage = (message) => {
  const announcer = document.createElement('div')
  announcer.setAttribute('aria-live', 'polite')
  announcer.setAttribute('class', 'sr-only')
  announcer.textContent = message
  
  document.body.appendChild(announcer)
  
  setTimeout(() => {
    document.body.removeChild(announcer)
  }, 3000)
}

onMounted(() => {
  fetchSessions()
})
</script>

<style scoped>
.sessions-manager {
  width: 100%;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
