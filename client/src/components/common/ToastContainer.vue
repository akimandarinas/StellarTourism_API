<template>
  <div class="fixed top-0 right-0 p-4 z-50 flex flex-col gap-2 max-w-md w-full">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="toast-item"
        :class="toastClasses(toast)"
      >
        <div class="flex items-start">
          <!-- Iconos simplificados en lugar de heroicons -->
          <div v-if="toast.type" class="mr-3 flex-shrink-0">
            <div v-if="toast.type === 'success'" class="h-5 w-5 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div v-else-if="toast.type === 'error'" class="h-5 w-5 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div v-else-if="toast.type === 'warning'" class="h-5 w-5 text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div v-else-if="toast.type === 'info'" class="h-5 w-5 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
          </div>
          
          <!-- Contenido -->
          <div class="flex-1">
            <h4 v-if="toast.title" class="font-medium">{{ toast.title }}</h4>
            <p class="text-sm">{{ toast.description }}</p>
          </div>
          
          <!-- Botón cerrar -->
          <button 
            @click="removeToast(toast.id)" 
            class="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <!-- Barra de progreso -->
        <div 
          v-if="toast.duration" 
          class="toast-progress"
          :style="{ animationDuration: `${toast.duration}ms` }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useToast } from '../../composables/useToast';

const { toasts, remove: removeToast } = useToast();

// Clases según el tipo de toast
const toastClasses = computed(() => (toast) => {
  const baseClasses = 'rounded-lg shadow-md p-4 relative overflow-hidden';
  
  const typeClasses = {
    success: 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50',
    error: 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-50',
    warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-50',
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-50',
    default: 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-50'
  };
  
  return `${baseClasses} ${typeClasses[toast.type] || typeClasses.default}`;
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.3);
  width: 100%;
  animation: progress-bar linear forwards;
  transform-origin: left;
}

@keyframes progress-bar {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style>
