<template>
  <Teleport to="body">
    <transition
      name="modal"
      @after-enter="onAfterEnter"
      @before-leave="onBeforeLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click="closeOnOverlayClick ? $emit('update:modelValue', false) : null"
        aria-hidden="true"
      >
        <div
          ref="modalRef"
          class="modal-container"
          :class="[size ? `modal-${size}` : '', className]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
          @click.stop
        >
          <div class="modal-header">
            <h2 :id="titleId" class="modal-title">
              <slot name="header">{{ title }}</slot>
            </h2>
            <button
              v-if="showCloseButton"
              class="modal-close"
              @click="$emit('update:modelValue', false)"
              aria-label="Cerrar modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div :id="descriptionId" class="modal-content">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useAccessibility } from '../../composables/useAccessibility';
import { useFocusTrap } from '@/accessibility/composables'

export default {
  name: 'Modal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: null,
      validator: (value) => ['sm', 'lg', 'xl', 'full'].includes(value)
    },
    closeOnOverlayClick: {
      type: Boolean,
      default: true
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: ''
    }
  },
  
  setup(props, { emit }) {
    const { generateId, useFocusTrap } = useAccessibility();
    
    const modalRef = ref(null);
    const titleId = ref(generateId('modal-title'));
    const descriptionId = ref(generateId('modal-description'));
    
    // Implementar trampa de foco
    const { activate, deactivate } = useFocusTrap({
      containerRef: modalRef,
      autoFocus: true,
      returnFocusOnDeactivate: true,
      escapeDeactivates: true,
      onDeactivate: () => emit('update:modelValue', false)
    });
    
    // Manejar eventos de teclado
    const handleKeyDown = (event) => {
      if (props.modelValue && event.key === 'Escape') {
        emit('update:modelValue', false);
      }
    };
    
    // Bloquear el scroll del body cuando el modal está abierto
    const blockBodyScroll = () => {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    };
    
    // Restaurar el scroll del body cuando el modal se cierra
    const unblockBodyScroll = () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
    
    // Eventos del ciclo de vida
    onMounted(() => {
      document.addEventListener('keydown', handleKeyDown);
      if (props.modelValue) {
        blockBodyScroll();
      }
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeyDown);
      unblockBodyScroll();
    });
    
    // Observar cambios en modelValue
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        blockBodyScroll();
        // Activar trampa de foco después de que el modal se muestre
        setTimeout(() => {
          activate();
        }, 0);
      } else {
        unblockBodyScroll();
        deactivate();
      }
    });
    
    // Eventos de transición
    const onAfterEnter = () => {
      emit('opened');
    };
    
    const onBeforeLeave = () => {
      emit('before-close');
    };
    
    const onAfterLeave = () => {
      emit('closed');
    };
    
    return {
      modalRef,
      titleId,
      descriptionId,
      onAfterEnter,
      onBeforeLeave,
      onAfterLeave
    };
  },
  
  emits: ['update:modelValue', 'opened', 'before-close', 'closed']
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Estilos de enfoque para mejorar accesibilidad */
:focus-visible {
  outline: 2px solid var(--color-primary, #3b82f6);
  outline-offset: 2px;
}
</style>
