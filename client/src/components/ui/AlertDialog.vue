<template>
  <div>
    <div @click="open" class="inline-block">
      <slot name="trigger"></slot>
    </div>
    
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="isOpen" 
          class="fixed inset-0 z-50" 
          @click="handleBackdropClick"
        >
          <div class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"></div>
          
          <div 
            class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
            @click.stop
            ref="dialogRef"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="descriptionId"
            tabindex="-1"
          >
            <!-- Header -->
            <div v-if="$slots.header || $slots.title" class="flex flex-col space-y-1.5 text-center sm:text-left">
              <slot name="header">
                <!-- Title -->
                <h2 v-if="$slots.title" class="text-lg font-semibold leading-none tracking-tight" :id="titleId">
                  <slot name="title"></slot>
                </h2>
                <!-- Description -->
                <p v-if="$slots.description" class="text-sm text-muted-foreground" :id="descriptionId">
                  <slot name="description"></slot>
                </p>
              </slot>
            </div>
            
            <!-- Content -->
            <slot></slot>
            
            <!-- Footer -->
            <div v-if="$slots.footer" class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <slot name="footer"></slot>
            </div>
            
            <!-- Close button -->
            <button 
              v-if="showCloseButton"
              @click="close" 
              class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              ref="closeButtonRef"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              <span class="sr-only">Cerrar</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { ref, watch, nextTick, computed } from 'vue';
import { useFocusTrap } from '@/accessibility/composables'

export default {
  name: 'AlertDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    closeOnBackdropClick: {
      type: Boolean,
      default: true
    },
    showCloseButton: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const isOpen = ref(props.modelValue);
    const dialogRef = ref(null);
    const closeButtonRef = ref(null);
    const previousActiveElement = ref(null);
    const titleId = ref(`alert-dialog-title-${Math.random().toString(36).substring(2, 15)}`);
    const descriptionId = ref(`alert-dialog-description-${Math.random().toString(36).substring(2, 15)}`);

    watch(() => props.modelValue, (newVal) => {
      isOpen.value = newVal;
    });

    watch(isOpen, (newVal) => {
      emit('update:modelValue', newVal);
    });

    const trapFocus = () => {
      const focusableElements = dialogRef.value.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      dialogRef.value.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      });
    };

    const handleOpen = () => {
      previousActiveElement.value = document.activeElement;
      
      nextTick(() => {
        // Enfocar el primer elemento focusable o el botón de cerrar
        const focusTarget = closeButtonRef.value || dialogRef.value.querySelector('button, [tabindex="0"]');
        if (focusTarget) {
          focusTarget.focus();
        } else {
          dialogRef.value.focus();
        }
        
        trapFocus();
      });
    };

    const handleClose = () => {
      // Devolver el foco al elemento anterior
      if (previousActiveElement.value) {
        previousActiveElement.value.focus();
      }
    };

    const open = () => {
      isOpen.value = true;
      nextTick(() => {
        handleOpen();
      });
    };

    const close = () => {
      isOpen.value = false;
      handleClose();
    };

    const handleBackdropClick = () => {
      if (props.closeOnBackdropClick) {
        close();
      }
    };

    return {
      isOpen,
      dialogRef,
      closeButtonRef,
      titleId,
      descriptionId,
      open,
      close,
      handleBackdropClick
    };
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
