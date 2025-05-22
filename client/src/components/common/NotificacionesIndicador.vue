<template>
  <div class="notificaciones-indicador">
    <Button 
      variant="ghost" 
      size="icon" 
      @click="toggleDropdown"
      class="relative"
    >
      <BellIcon class="h-5 w-5" />
      <span 
        v-if="cantidadNoLeidas > 0" 
        class="notificacion-badge"
      >
        {{ cantidadNoLeidas > 9 ? '9+' : cantidadNoLeidas }}
      </span>
    </Button>
    
    <div 
      v-if="dropdownOpen" 
      class="notificaciones-dropdown"
      ref="dropdownRef"
    >
      <div class="dropdown-header">
        <h3 class="dropdown-title">Notificaciones</h3>
        <Button variant="ghost" size="sm" @click="cargarNotificaciones">
          <RefreshCwIcon class="h-4 w-4" />
        </Button>
      </div>
      
      <div class="dropdown-content">
        <NotificacionesRealtime />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { BellIcon, RefreshCwIcon } from '@/utils/lucide-adapter';
import Button from '../ui/Button.vue';
import NotificacionesRealtime from './NotificacionesRealtime.vue';
import { useNotificaciones } from '../../composables/useNotificaciones';
import { useAuth } from '../../composables/useAuth';

// Composables
const { cantidadNoLeidas, cargarNotificaciones } = useNotificaciones();
const { isAuthenticated } = useAuth();

// Estado
const dropdownOpen = ref(false);
const dropdownRef = ref(null);

// Métodos
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  cargarNotificaciones();
  
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notificaciones-indicador {
  position: relative;
}

.notificacion-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: var(--color-destructive);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.notificaciones-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  max-height: 480px;
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.dropdown-title {
  font-size: 1rem;
  font-weight: 600;
}

.dropdown-content {
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 640px) {
  .notificaciones-dropdown {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    width: 100%;
    max-height: calc(100vh - 60px);
    border-radius: 0;
  }
}
</style>
