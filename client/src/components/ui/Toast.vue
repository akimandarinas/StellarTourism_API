<template>
  <div 
    v-if="visible"
    class="toast-container"
    :class="positionClass"
  >
    <transition name="toast-fade">
    <div 
      v-if="visible" 
      :class="[
        'toast',
        variantClass,
        className,
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]'
      ]"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="flex flex-col gap-1">
        <div v-if="title" class="text-sm font-semibold">{{ title }}</div>
        <div v-if="description" class="text-sm opacity-90">{{ description }}</div>
      </div>
      
      <button 
        v-if="closable"
        class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        @click="close"
        aria-label="Cerrar notificación"
      >
        <span class="sr-only">Close</span>
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
          class="h-4 w-4"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </transition>
  </div>
</template>

<script>
export default {
  name: 'Toast',
  props: {
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
    position: {
      type: String,
      default: 'bottom-right',
      validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'].includes(value)
    },
    duration: {
      type: Number,
      default: 5000
    },
    closable: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: true,
      timeout: null
    }
  },
  computed: {
    variantClass() {
      return {
        'default': 'border bg-background text-foreground',
        'destructive': 'destructive group border-destructive bg-destructive text-destructive-foreground',
        'success': 'border-green-500 bg-green-100 text-green-800',
        'warning': 'border-yellow-500 bg-yellow-100 text-yellow-800',
        'info': 'border-blue-500 bg-blue-100 text-blue-800'
      }[this.variant]
    },
    positionClass() {
      return {
        'top-left': 'top-0 left-0',
        'top-right': 'top-0 right-0',
        'bottom-left': 'bottom-0 left-0',
        'bottom-right': 'bottom-0 right-0',
        'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
        'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2'
      }[this.position]
    }
  },
  mounted() {
    if (this.duration > 0) {
      this.timeout = setTimeout(() => {
        this.close()
      }, this.duration)
    }
  },
  beforeUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  },
  methods: {
    close() {
      this.visible = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  margin: 1rem;
  max-width: 420px;
  width: 100%;
}

.toast {
  animation: toast-in 0.3s ease-in-out;
}

@keyframes toast-in {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s;
}

.toast-fade-enter,
.toast-fade-leave-to {
  opacity: 0;
}
</style>
