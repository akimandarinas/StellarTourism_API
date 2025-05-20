<template>
  <Teleport to="body">
    <transition
      name="dialog-fade"
      @before-enter="beforeEnter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @after-leave="afterLeave"
    >
      <div
        v-if="modelValue"
        class="dialog-overlay"
        :class="{ 'dialog-overlay-dark': variant === 'dark' }"
        @click="handleOverlayClick"
        aria-hidden="true"
      ></div>
    </transition>
    
    <transition
      name="dialog-slide"
      @before-enter="beforeEnter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @after-leave="afterLeave"
    >
      <div
        v-if="modelValue"
        class="dialog-container"
        :class="[
          `dialog-${size}`,
          `dialog-${position}`,
          { 'dialog-fullscreen-mobile': fullscreenOnMobile }
        ]"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        ref="dialogRef"
      >
        <div class="dialog-content">
          <div class="dialog-header">
            <h2 :id="titleId" class="dialog-title">
              <slot name="title">{{ title }}</slot>
            </h2>
            <button
              v-if="showCloseButton"
              @click="close"
              class="dialog-close"
              aria-label="Cerrar diálogo"
              ref="closeButtonRef"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div :id="descriptionId" class="dialog-body">
            <slot></slot>
          </div>
          
          <div v-if="$slots.footer" class="dialog-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useAccessibility } from '@/accessibility/composables';
import { useFocusTrap } from '@/accessibility/composables';
import { useKeyboard } from '../../composables/useKeyboard';
import { generateId } from '../../utils/id';

export default {
  name: 'AccessibleDialog',
  inheritAttrs: false,
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
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
    },
    position: {
      type: String,
      default: 'center',
      validator: (value) => ['center', 'top', 'right', 'bottom', 'left'].includes(value)
    },
    variant: {
      type: String,
      default: 'light',
      validator: (value) => ['light', 'dark'].includes(value)
    },
    closeOnEsc: {
      type: Boolean,
      default: true
    },
    closeOnOverlayClick: {
      type: Boolean,
      default: true
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    fullscreenOnMobile: {
      type: Boolean,
      default: false
    },
    preventScroll: {
      type: Boolean,
      default: true
    },
    initialFocus: {
      type: String,
      default: null
    },
    returnFocus: {
      type: Boolean,
      default: true
    }
  },
  
  emits: ['update:modelValue', 'open', 'close'],
  
  setup(props, { emit }) {
    // Referencias
    const dialogRef = ref(null);
    const closeButtonRef = ref(null);
    const previousActiveElement = ref(null);
    
    // IDs únicos para accesibilidad
    const titleId = ref(`dialog-title-${generateId()}`);
    const descriptionId = ref(`dialog-description-${generateId()}`);
    
    // Composables
    const { trapFocus, releaseFocus } = useFocusTrap();
    const { announce } = useAccessibility();
    const { onKeyDown } = useKeyboard();
    
    // Cerrar el diálogo
    const close = () => {
      emit('update:modelValue', false);
      emit('close');
    };
    
    // Manejar clic en el overlay
    const handleOverlayClick = () => {
      if (props.closeOnOverlayClick) {
        close();
      }
    };
    
    // Manejar tecla Escape
    const handleEscKey = (event) => {
      if (props.closeOnEsc && props.modelValue && event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };
    
    // Prevenir scroll del body cuando el diálogo está abierto
    const preventBodyScroll = (prevent) => {
      if (!props.preventScroll) return;
      
      const body = document.body;
      if (prevent) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        body.style.overflow = 'hidden';
        body.style.paddingRight = `${scrollbarWidth}px`;
      } else {
        body.style.overflow = '';
        body.style.paddingRight = '';
      }
    };
    
    // Enfocar el elemento inicial cuando se abre el diálogo
    const focusInitialElement = () => {
      nextTick(() => {
        if (!dialogRef.value) return;
        
        let elementToFocus;
        
        if (props.initialFocus) {
          elementToFocus = dialogRef.value.querySelector(props.initialFocus);
        }
        
        if (!elementToFocus && closeButtonRef.value) {
          elementToFocus = closeButtonRef.value;
        }
        
        if (!elementToFocus) {
          elementToFocus = dialogRef.value;
          dialogRef.value.setAttribute('tabindex', '-1');
        }
        
        if (elementToFocus) {
          elementToFocus.focus();
        }
      });
    };
    
    // Restaurar el foco cuando se cierra el diálogo
    const restoreFocus = () => {
      if (props.returnFocus && previousActiveElement.value) {
        previousActiveElement.value.focus();
      }
    };
    
    // Hooks de transición
    const beforeEnter = () => {
      previousActiveElement.value = document.activeElement;
      preventBodyScroll(true);
    };
    
    const afterEnter = () => {
      trapFocus(dialogRef.value);
      focusInitialElement();
      emit('open');
      
      // Anunciar apertura del diálogo a lectores de pantalla
      const dialogTitle = props.title || 'Diálogo';
      announce(`Diálogo abierto: ${dialogTitle}`);
    };
    
    const beforeLeave = () => {
      releaseFocus();
    };
    
    const afterLeave = () => {
      preventBodyScroll(false);
      restoreFocus();
      
      // Anunciar cierre del diálogo a lectores de pantalla
      announce('Diálogo cerrado');
    };
    
    // Observar cambios en modelValue
    watch(() => props.modelValue, (isOpen) => {
      if (isOpen) {
        nextTick(() => {
          onKeyDown(handleEscKey);
        });
      } else {
        // Limpiar event listeners
      }
    });
    
    // Limpiar al desmontar
    onBeforeUnmount(() => {
      preventBodyScroll(false);
    });
    
    return {
      dialogRef,
      closeButtonRef,
      titleId,
      descriptionId,
      close,
      handleOverlayClick,
      beforeEnter,
      afterEnter,
      beforeLeave,
      afterLeave
    };
  }
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
  backdrop-filter: blur(4px);
}

.dialog-overlay-dark {
  background-color: rgba(0, 0, 0, 0.75);
}

.dialog-container {
  position: fixed;
  z-index: 51;
  background-color: var(--color-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
}

/* Posiciones */
.dialog-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.dialog-top {
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.dialog-right {
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--border-radius-lg) 0 0 var(--border-radius-lg);
}

.dialog-bottom {
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.dialog-left {
  top: 0;
  left: 0;
  bottom: 0;
  border-radius: 0 var(--border-radius-lg) var(--border-radius-lg) 0;
}

/* Tamaños */
.dialog-sm {
  width: 300px;
}

.dialog-md {
  width: 500px;
}

.dialog-lg {
  width: 800px;
}

.dialog-xl {
  width: 1100px;
}

.dialog-full {
  width: calc(100vw - 2rem);
  height: calc(100vh - 2rem);
}

.dialog-content {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.dialog-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.dialog-close:hover {
  background-color: var(--color-background-hover);
  color: var(--color-text);
}

.dialog-close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.dialog-body {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
}

.dialog-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Animaciones */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-slide-enter-active,
.dialog-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.dialog-slide-enter-from,
.dialog-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}

/* Posiciones específicas para animaciones */
.dialog-right.dialog-slide-enter-from,
.dialog-right.dialog-slide-leave-to {
  transform: translateX(100%);
}

.dialog-left.dialog-slide-enter-from,
.dialog-left.dialog-slide-leave-to {
  transform: translateX(-100%);
}

.dialog-top.dialog-slide-enter-from,
.dialog-top.dialog-slide-leave-to {
  transform: translate(-50%, -100%);
}

.dialog-bottom.dialog-slide-enter-from,
.dialog-bottom.dialog-slide-leave-to {
  transform: translate(-50%, 100%);
}

/* Responsive */
@media (max-width: 640px) {
  .dialog-sm,
  .dialog-md,
  .dialog-lg,
  .dialog-xl {
    width: calc(100vw - 2rem);
  }
  
  .dialog-fullscreen-mobile {
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transform: none;
    border-radius: 0;
  }
  
  .dialog-fullscreen-mobile.dialog-slide-enter-from,
  .dialog-fullscreen-mobile.dialog-slide-leave-to {
    transform: translateY(100%);
  }
}
</style>
