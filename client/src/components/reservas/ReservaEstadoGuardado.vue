<template>
  <div class="reserva-estado-guardado" :class="{ 'is-saving': isSaving, 'has-error': hasError }">
    <!-- Indicador de estado -->
    <div class="estado-container">
      <div v-if="isSaving" class="estado-saving">
        <LoadingSpinner size="sm" />
        <span>Guardando...</span>
      </div>
      <div v-else-if="hasError" class="estado-error">
        <AlertCircleIcon size="16" />
        <span>Error al guardar</span>
        <button @click="retry" class="btn-retry">Reintentar</button>
      </div>
      <div v-else-if="lastSaved" class="estado-saved">
        <CheckCircleIcon size="16" />
        <span>Guardado {{ formatLastSaved }}</span>
      </div>
    </div>

    <div class="acciones-container">
      <button 
        v-if="showSaveButton" 
        @click="saveAsDraft" 
        class="btn-save-draft"
        :disabled="isSaving || !canSave"
      >
        <span>Guardar borrador</span>
      </button>
      
      <button 
        v-if="showResumeButton" 
        @click="$emit('resume')" 
        class="btn-resume"
      >
        <span>Continuar reserva</span>
      </button>
      
      <button 
        v-if="showClearButton" 
        @click="confirmClear" 
        class="btn-clear"
        :disabled="isSaving"
      >
        <TrashIcon size="16" />
        <span>Descartar borrador</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircleIcon, AlertCircleIcon, TrashIcon } from '@/utils/lucide-adapter';
import LoadingSpinner from '../common/LoadingSpinner.vue';

const props = defineProps({
  lastSaved: {
    type: Number,
    default: null
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  hasError: {
    type: Boolean,
    default: false
  },
  canSave: {
    type: Boolean,
    default: true
  },
  showSaveButton: {
    type: Boolean,
    default: true
  },
  showResumeButton: {
    type: Boolean,
    default: false
  },
  showClearButton: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['save', 'clear', 'retry', 'resume']);

const formatLastSaved = computed(() => {
  if (!props.lastSaved) return '';
  
  return formatDistanceToNow(props.lastSaved, {
    addSuffix: true,
    locale: es
  });
});

const saveAsDraft = () => {
  if (props.canSave && !props.isSaving) {
    emit('save');
  }
};

const confirmClear = () => {
  if (confirm('¿Estás seguro de que quieres descartar este borrador? Esta acción no se puede deshacer.')) {
    emit('clear');
  }
};

const retry = () => {
  emit('retry');
};
</script>

<style scoped>
.reserva-estado-guardado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: var(--color-background-secondary, #f8f9fa);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.reserva-estado-guardado.is-saving {
  background-color: var(--color-info-light, #e6f7ff);
}

.reserva-estado-guardado.has-error {
  background-color: var(--color-error-light, #fff2f0);
}

.estado-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.estado-saving, .estado-error, .estado-saved {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.estado-saving {
  color: var(--color-info, #1890ff);
}

.estado-error {
  color: var(--color-error, #ff4d4f);
}

.estado-saved {
  color: var(--color-success, #52c41a);
}

.acciones-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-save-draft, .btn-clear, .btn-resume, .btn-retry {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-save-draft {
  background-color: var(--color-primary-light, #e6f7ff);
  color: var(--color-primary, #1890ff);
}

.btn-save-draft:hover:not(:disabled) {
  background-color: var(--color-primary-lighter, #bae7ff);
}

.btn-resume {
  background-color: var(--color-success-light, #f6ffed);
  color: var(--color-success, #52c41a);
}

.btn-resume:hover {
  background-color: var(--color-success-lighter, #d9f7be);
}

.btn-clear {
  background-color: transparent;
  color: var(--color-text-secondary, #8c8c8c);
}

.btn-clear:hover:not(:disabled) {
  background-color: var(--color-background, #f0f0f0);
  color: var(--color-error, #ff4d4f);
}

.btn-retry {
  background-color: var(--color-error-light, #fff2f0);
  color: var(--color-error, #ff4d4f);
  margin-left: 0.5rem;
}

.btn-retry:hover {
  background-color: var(--color-error-lighter, #ffccc7);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .reserva-estado-guardado {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .acciones-container {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
