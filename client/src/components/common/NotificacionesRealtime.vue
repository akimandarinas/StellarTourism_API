<template>
  <div class="notificaciones-container" aria-live="polite">
    <slot :notificaciones="notificacionesNoLeidas" :total="cantidadNoLeidas"></slot>
    <!-- Indicador de notificaciones -->
    <div 
      v-if="hasUnreadNotifications" 
      class="notificaciones-badge"
      :class="{ 'pulse': newNotificationReceived }"
      @click="toggleNotificacionesPanel"
      role="button"
      aria-label="Abrir panel de notificaciones"
      tabindex="0"
      @keydown.enter="toggleNotificacionesPanel"
      @keydown.space.prevent="toggleNotificacionesPanel"
    >
      <BellIcon size="20" />
      <span class="badge-count">{{ unreadCount }}</span>
    </div>
    
    <!-- Panel de notificaciones -->
    <div 
      v-if="showNotificacionesPanel" 
      class="notificaciones-panel"
      role="dialog"
      aria-labelledby="notificaciones-titulo"
      ref="panelRef"
    >
      <div class="panel-header">
        <h3 id="notificaciones-titulo" class="panel-title">Notificaciones</h3>
        <div class="panel-actions">
          <button 
            v-if="hasUnreadNotifications" 
            @click="markAllAsRead"
            class="action-button"
            aria-label="Marcar todas como leídas"
          >
            <CheckIcon size="16" />
            <span class="action-text">Marcar todas como leídas</span>
          </button>
          <button 
            @click="toggleNotificacionesPanel"
            class="close-button"
            aria-label="Cerrar panel de notificaciones"
          >
            <XIcon size="16" />
          </button>
        </div>
      </div>
      
      <div class="panel-content">
        <div v-if="loading" class="loading-state">
          <LoadingSpinner size="sm" />
          <p>Cargando notificaciones...</p>
        </div>
        
        <div v-else-if="error" class="error-state">
          <AlertTriangleIcon size="24" class="error-icon" />
          <p>{{ error }}</p>
          <button @click="loadNotificaciones" class="retry-button">
            Reintentar
          </button>
        </div>
        
        <div v-else-if="notificaciones.length === 0" class="empty-state">
          <BellOffIcon size="24" class="empty-icon" />
          <p>No tienes notificaciones</p>
        </div>
        
        <div v-else class="notificaciones-list">
          <div 
            v-for="notificacion in notificaciones" 
            :key="notificacion.id"
            class="notificacion-item"
            :class="{ 'unread': !notificacion.leida }"
            @click="handleNotificacionClick(notificacion)"
          >
            <div class="notificacion-icon" :class="`icon-${notificacion.tipo}`">
              <component :is="getNotificacionIcon(notificacion.tipo)" size="18" />
            </div>
            <div class="notificacion-content">
              <div class="notificacion-header">
                <h4 class="notificacion-title">{{ notificacion.titulo }}</h4>
                <span class="notificacion-time">{{ formatTimeAgo(notificacion.fecha) }}</span>
              </div>
              <p class="notificacion-message">{{ notificacion.mensaje }}</p>
              <div v-if="notificacion.accion" class="notificacion-action">
                <button 
                  @click.stop="executeAction(notificacion)"
                  class="action-link"
                >
                  {{ getActionText(notificacion.accion) }}
                </button>
              </div>
            </div>
            <button 
              v-if="!notificacion.leida"
              @click.stop="markAsRead(notificacion.id)"
              class="mark-read-button"
              aria-label="Marcar como leída"
            >
              <CircleIcon size="14" />
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="notificaciones.length > 0" class="panel-footer">
        <button 
          v-if="hasMoreNotificaciones" 
          @click="loadMoreNotificaciones"
          class="load-more-button"
          :disabled="loadingMore"
        >
          <span v-if="loadingMore">
            <LoaderIcon size="14" class="animate-spin mr-1" />
            Cargando...
          </span>
          <span v-else>
            Ver más
          </span>
        </button>
        <button 
          @click="clearAllNotificaciones"
          class="clear-all-button"
        >
          Borrar todas
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  BellIcon, BellOffIcon, CheckIcon, XIcon, AlertTriangleIcon,
  InfoIcon, AlertCircleIcon, CheckCircleIcon, CircleIcon,
  LoaderIcon, CreditCardIcon, MapPinIcon, CalendarIcon
} from '@/utils/lucide-adapter';
import LoadingSpinner from './LoadingSpinner.vue';
import { useAuth } from '../../composables/useAuth';
import { useToast } from '../../composables/useToast';
import { formatTimeAgo } from '../../utils/format';
import { useClickOutside } from '../../composables/useClickOutside';
import { useAccessibility } from '@/accessibility/composables';
import { useNotificacionesStore } from '../../stores/notificaciones';

const router = useRouter();
const { user, isAuthenticated } = useAuth();
const toast = useToast();
const panelRef = ref(null);
const notificacionesStore = useNotificacionesStore();

// Computed properties
const notificacionesNoLeidas = computed(() => notificacionesStore.notificacionesNoLeidas);
const cantidadNoLeidas = computed(() => notificacionesStore.cantidadNoLeidas);
const notificaciones = computed(() => notificacionesStore.notificaciones);
const loading = computed(() => notificacionesStore.loading);
const loadingMore = computed(() => notificacionesStore.loadingMore);
const error = computed(() => notificacionesStore.error);
const showNotificacionesPanel = computed(() => notificacionesStore.showNotificacionesPanel);
const newNotificationReceived = computed(() => notificacionesStore.newNotificationReceived);
const hasMoreNotificaciones = computed(() => notificacionesStore.hasMoreNotificaciones);

const hasUnreadNotifications = computed(() => {
  return cantidadNoLeidas.value > 0;
});

const unreadCount = computed(() => {
  return cantidadNoLeidas.value;
});

// Métodos
const loadNotificaciones = () => {
  notificacionesStore.cargarNotificaciones();
};

const loadMoreNotificaciones = () => {
  notificacionesStore.cargarMasNotificaciones();
};

const markAsRead = (id) => {
  notificacionesStore.marcarComoLeida(id);
};

const markAllAsRead = () => {
  notificacionesStore.marcarTodasComoLeidas();
};

const clearAllNotificaciones = () => {
  notificacionesStore.eliminarTodasNotificaciones();
};

const handleNotificacionClick = (notificacion) => {
  // Marcar como leída si no lo está
  if (!notificacion.leida) {
    markAsRead(notificacion.id);
  }
  
  // Ejecutar acción si existe
  if (notificacion.accion) {
    executeAction(notificacion);
  }
};

const executeAction = (notificacion) => {
  const { accion } = notificacion;
  
  if (!accion) return;
  
  switch (accion.tipo) {
    case 'ver_reserva':
      router.push(`/reservas/${accion.params.id}`);
      break;
    case 'pagar':
      router.push(`/checkout/${accion.params.id}`);
      break;
    case 'ver_itinerario':
      router.push(`/itinerario/${accion.params.id}`);
      break;
    case 'ver_oferta':
      router.push(`/ofertas/${accion.params.id}`);
      break;
    default:
      console.warn(`Tipo de acción desconocido: ${accion.tipo}`);
  }
  
  // Cerrar panel después de ejecutar la acción
  notificacionesStore.cerrarPanel();
};

const getActionText = (accion) => {
  if (!accion) return '';
  
  switch (accion.tipo) {
    case 'ver_reserva':
      return 'Ver reserva';
    case 'pagar':
      return 'Completar pago';
    case 'ver_itinerario':
      return 'Ver itinerario';
    case 'ver_oferta':
      return 'Ver oferta';
    default:
      return 'Ver detalles';
  }
};

const getNotificacionIcon = (tipo) => {
  switch (tipo) {
    case 'info':
      return InfoIcon;
    case 'alerta':
      return AlertTriangleIcon;
    case 'error':
      return AlertCircleIcon;
    case 'success':
      return CheckCircleIcon;
    case 'reserva':
      return CalendarIcon;
    case 'pago':
      return CreditCardIcon;
    case 'promocion':
      return MapPinIcon;
    default:
      return BellIcon;
  }
};

const toggleNotificacionesPanel = () => {
  notificacionesStore.togglePanel();
};

// Configurar detección de clics fuera del panel
useClickOutside(panelRef, () => {
  if (showNotificacionesPanel.value) {
    notificacionesStore.cerrarPanel();
  }
});

// Ciclo de vida
const loadNotificacionesIfAuthenticated = () => {
  if (isAuthenticated.value) {
    loadNotificaciones();
  }
};

onMounted(() => {
  loadNotificacionesIfAuthenticated();
  
  // Configurar WebSocket
  notificacionesStore.inicializarNotificaciones();
});

onUnmounted(() => {
  // Limpiar suscripciones cuando el componente se desmonta
  notificacionesStore.limpiarNotificaciones();
});
</script>

<style scoped>
.notificaciones-container {
  position: relative;
}

.notificaciones-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.notificaciones-badge:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.badge-count {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--color-error);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--color-primary-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0);
  }
}

.notificaciones-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  max-height: 500px;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-top: 0.5rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.error-icon, .empty-icon {
  margin-bottom: 1rem;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-sm);
  background-color: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.retry-button:hover {
  background-color: var(--color-primary-dark);
}

.notificaciones-list {
  display: flex;
  flex-direction: column;
}

.notificacion-item {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.3s ease;
  position: relative;
}

.notificacion-item:last-child {
  border-bottom: none;
}

.notificacion-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.notificacion-item.unread {
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.notificacion-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.icon-info {
  background-color: rgba(var(--color-info-rgb), 0.1);
  color: var(--color-info);
}

.icon-alerta {
  background-color: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
}

.icon-error {
  background-color: rgba(var(--color-error-rgb), 0.1);
  color: var(--color-error);
}

.icon-success {
  background-color: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.icon-reserva {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.icon-pago {
  background-color: rgba(255, 165, 0, 0.1);
  color: orange;
}

.icon-promocion {
  background-color: rgba(128, 0, 128, 0.1);
  color: purple;
}

.notificacion-content {
  flex: 1;
  min-width: 0;
}

.notificacion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
}

.notificacion-title {
  font-weight: 600;
  margin: 0;
  font-size: 0.875rem;
}

.notificacion-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  margin-left: 0.5rem;
}

.notificacion-message {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notificacion-action {
  margin-top: 0.5rem;
}

.action-link {
  font-size: 0.75rem;
  color: var(--color-primary);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
}

.mark-read-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  color: var(--color-primary);
  cursor: pointer;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border);
}

.load-more-button, .clear-all-button {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-button {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.load-more-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.05);
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-all-button {
  background-color: transparent;
  border: none;
  color: var(--color-text-secondary);
}

.clear-all-button:hover {
  color: var(--color-error);
}

@media (max-width: 480px) {
  .notificaciones-panel {
    width: 300px;
    right: -100px;
  }
  
  .action-text {
    display: none;
  }
}
</style>
