<template>
  <div class="notifications-provider">
    <slot></slot>
    
    <!-- Contenedor de notificaciones -->
    <div class="notifications-container">
      <transition-group name="notification">
        <div
          v-for="notification in visibleNotifications"
          :key="notification.id"
          :class="[
            'notification',
            `notification-${notification.position}`,
            `notification-${notification.type}`
          ]"
        >
          <Toast
            :title="notification.title"
            :description="notification.message"
            :variant="notification.type"
            :position="notification.position"
            :duration="notification.duration"
            :closable="true"
            @close="removeNotification(notification.id)"
          />
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { computed, provide, onMounted } from 'vue';
import { useToast, toasts } from '../composables/useToast';
import Toast from '../components/ui/Toast.vue';

// Máximo número de notificaciones visibles a la vez
const MAX_VISIBLE = 5;

// Obtener el servicio de notificaciones
const toast = useToast();

// Calcular notificaciones visibles (limitadas por MAX_VISIBLE)
const visibleNotifications = computed(() => {
  return toasts.value.slice(0, MAX_VISIBLE);
});

// Agrupar notificaciones por posición
const notificationsByPosition = computed(() => {
  const grouped = {
    'top-left': [],
    'top-right': [],
    'bottom-left': [],
    'bottom-right': [],
    'top-center': [],
    'bottom-center': []
  };
  
  visibleNotifications.value.forEach(notification => {
    const position = notification.position || 'top-right';
    if (grouped[position]) {
      grouped[position].push(notification);
    } else {
      grouped['top-right'].push(notification);
    }
  });
  
  return grouped;
});

// Eliminar una notificación
const removeNotification = (id) => {
  toast.remove(id);
};

// Proporcionar contexto de notificaciones a componentes hijos
provide('notifications', {
  add: toast.add,
  remove: toast.remove,
  success: toast.success,
  error: toast.error,
  warning: toast.warning,
  info: toast.info,
  clear: toast.clear,
  notifications: toasts
});

// Exponer métodos globalmente para uso en JavaScript no Vue
if (typeof window !== 'undefined') {
  window.$toast = {
    success: (title, message, options) => toast.success(title, message, options),
    error: (title, message, options) => toast.error(title, message, options),
    warning: (title, message, options) => toast.warning(title, message, options),
    info: (title, message, options) => toast.info(title, message, options)
  };
}
</script>

<style scoped>
.notifications-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
}

.notification {
  position: absolute;
  max-width: 420px;
  width: calc(100% - 2rem);
  margin: 1rem;
  pointer-events: auto;
}

.notification-top-left {
  top: 0;
  left: 0;
}

.notification-top-right {
  top: 0;
  right: 0;
}

.notification-bottom-left {
  bottom: 0;
  left: 0;
}

.notification-bottom-right {
  bottom: 0;
  right: 0;
}

.notification-top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.notification-bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.notification-top-left.notification-enter-from,
.notification-top-left.notification-leave-to,
.notification-top-right.notification-enter-from,
.notification-top-right.notification-leave-to,
.notification-top-center.notification-enter-from,
.notification-top-center.notification-leave-to {
  transform: translateY(-30px);
}
</style>
