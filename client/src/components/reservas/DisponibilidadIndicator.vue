<template>
  <div class="disponibilidad-indicator" :class="statusClass">
    <!-- Indicador de estado -->
    <div class="indicator-icon">
      <LoadingSpinner v-if="loading" size="sm" />
      <CheckCircleIcon v-else-if="disponible" size="16" />
      <XCircleIcon v-else-if="!disponible && !loading" size="16" />
      <AlertCircleIcon v-else size="16" />
    </div>
    
    <!-- Mensaje de estado -->
    <div class="indicator-message">
      <span v-if="loading">Verificando disponibilidad...</span>
      <span v-else-if="disponible">{{ mensaje || 'Disponible' }}</span>
      <span v-else-if="!disponible && !loading">{{ mensaje || 'No disponible' }}</span>
      <span v-else>{{ mensaje || 'Estado desconocido' }}</span>
    </div>
    
    <!-- Detalles adicionales -->
    <div v-if="showDetails && disponible" class="indicator-details">
      <span v-if="plazasDisponibles">{{ plazasDisponibles }} plazas disponibles</span>
      <span v-if="ultimaActualizacion">
        Actualizado {{ formatTimeAgo(ultimaActualizacion) }}
      </span>
    </div>
    
    <!-- Botón de actualización -->
    <button 
      v-if="showRefreshButton && !loading" 
      @click="$emit('refresh')" 
      class="btn-refresh"
      :disabled="refreshDisabled"
    >
      <RefreshCwIcon size="14" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon, RefreshCwIcon } from '@/utils/lucide-adapter';
import LoadingSpinner from '../common/LoadingSpinner.vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  disponible: {
    type: Boolean,
    default: null
  },
  mensaje: {
    type: String,
    default: ''
  },
  plazasDisponibles: {
    type: Number,
    default: null
  },
  ultimaActualizacion: {
    type: Number,
    default: null
  },
  showDetails: {
    type: Boolean,
    default: true
  },
  showRefreshButton: {
    type: Boolean,
    default: true
  },
  refreshDisabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['refresh']);

// Clase CSS basada en el estado
const statusClass = computed(() => {
  if (props.loading) return 'is-loading';
  if (props.disponible === true) return 'is-available';
  if (props.disponible === false) return 'is-unavailable';
  return 'is-unknown';
});

// Formatear tiempo desde la última actualización
const formatTimeAgo = (timestamp) => {
  return formatDistanceToNow(timestamp, {
    addSuffix: true,
    locale: es
  });
};
</script>

<style scoped>
.disponibilidad-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  transition: all 0.3s ease;
}

.is-loading {
  background-color: var(--color-info-light, #e6f7ff);
  color: var(--color-info, #1890ff);
}

.is-available {
  background-color: var(--color-success-light, #f6ffed);
  color: var(--color-success, #52c41a);
}

.is-unavailable {
  background-color: var(--color-error-light, #fff2f0);
  color: var(--color-error, #ff4d4f);
}

.is-unknown {
  background-color: var(--color-warning-light, #fffbe6);
  color: var(--color-warning, #faad14);
}

.indicator-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-message {
  flex: 1;
}

.indicator-details {
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
  opacity: 0.8;
}

.btn-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.btn-refresh:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .disponibilidad-indicator {
    flex-wrap: wrap;
  }
  
  .indicator-details {
    width: 100%;
    margin-top: 0.25rem;
    margin-left: 1.5rem;
  }
}
</style>
