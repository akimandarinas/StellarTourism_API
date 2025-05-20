<template>
  <div
    :class="[
      'relative w-full rounded-lg border p-4',
      variantClass,
      className
    ]"
    role="alert"
  >
    <div class="flex items-start gap-4">
      <slot name="icon">
        <div v-if="variant !== 'default'" class="mt-0.5">
          <!-- Success Icon -->
          <svg v-if="variant === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          
          <!-- Warning Icon -->
          <svg v-else-if="variant === 'warning'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          
          <!-- Error Icon -->
          <svg v-else-if="variant === 'destructive'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          
          <!-- Info Icon -->
          <svg v-else-if="variant === 'info'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
      </slot>
      
      <div class="flex-1 space-y-1">
        <!-- Title -->
        <h5 v-if="$slots.title || title" class="font-medium leading-none tracking-tight">
          <slot name="title">{{ title }}</slot>
        </h5>
        
        <!-- Description -->
        <div v-if="$slots.description || description" class="text-sm opacity-90">
          <slot name="description">{{ description }}</slot>
        </div>
        
        <!-- Default slot for content -->
        <slot></slot>
      </div>
      
      <!-- Close button -->
      <button 
        v-if="dismissible"
        @click="dismiss"
        class="absolute right-2 top-2 rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span class="sr-only">Cerrar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'destructive', 'success', 'warning', 'info'].includes(value)
  },
  className: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['dismiss']);
const isVisible = ref(true);

const variantClass = computed(() => {
  return {
    'default': 'bg-background text-foreground',
    'destructive': 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
    'success': 'border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-500',
    'warning': 'border-yellow-500/50 text-yellow-700 dark:border-yellow-500 [&>svg]:text-yellow-500',
    'info': 'border-blue-500/50 text-blue-700 dark:border-blue-500 [&>svg]:text-blue-500'
  }[props.variant];
});

const dismiss = () => {
  isVisible.value = false;
  emit('dismiss');
};
</script>
