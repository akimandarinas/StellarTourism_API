<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" :aria-labelledby="titleId">
    &lt;!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="handleBackdropClick"></div>
    
    &lt;!-- Dialog -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div 
        class="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        ref="dialogContent"
        tabindex="-1"
        @keydown.esc="handleCancel"
      >
        <h2 :id="titleId" class="text-lg font-semibold mb-4">{{ title }}</h2>
        
        <div class="mb-6">
          <p>{{ message }}</p>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="handleCancel"
            ref="cancelButton"
          >
            {{ cancelText }}
          </button>
          <button 
            type="button"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useFocusTrap } from '@/accessibility/composables';

export default {
  name: 'ConfirmationDialog',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Confirmar acción'
    },
    message: {
      type: String,
      default: '¿Estás seguro de que deseas continuar?'
    },
    confirmText: {
      type: String,
      default: 'Confirmar'
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    },
    closeOnBackdropClick: {
      type: Boolean,
      default: true
    }
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const dialogContent = ref(null);
    const cancelButton = ref(null);
    const titleId = `dialog-title-${Math.random().toString(36).substring(2, 9)}`;
    
    // Guardar elementos activos anteriormente
    let previousActiveElement = null;
    
    // Manejar el foco cuando se abre el diálogo
    watch(() => props.isOpen, async (isOpen) => {
      if (isOpen) {
        // Guardar el elemento activo actual
        previousActiveElement = document.activeElement;
        
        // Esperar a que el DOM se actualice
        await nextTick();
        
        // Enfocar el botón de cancelar
        if (cancelButton.value) {
          cancelButton.value.focus();
        }
      } else if (previousActiveElement) {
        // Restaurar el foco al elemento anterior
        previousActiveElement.focus();
      }
    });
    
    // Manejar el atrapamiento de foco
    const handleTabKey = (e) => {
      if (!props.isOpen || !dialogContent.value) return;
      
      const focusableElements = dialogContent.value.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Si se presiona Shift+Tab y el foco está en el primer elemento, mover al último
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } 
      // Si se presiona Tab y el foco está en el último elemento, mover al primero
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    // Configurar los event listeners
    onMounted(() => {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          handleTabKey(e);
        }
      });
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleTabKey);
    });
    
    // Métodos para manejar acciones
    const handleConfirm = () => {
      emit('confirm');
    };
    
    const handleCancel = () => {
      emit('cancel');
    };
    
    const handleBackdropClick = () => {
      if (props.closeOnBackdropClick) {
        emit('cancel');
      }
    };
    
    return {
      dialogContent,
      cancelButton,
      titleId,
      handleConfirm,
      handleCancel,
      handleBackdropClick
    };
  }
}
</script>
