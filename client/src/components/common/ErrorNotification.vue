<template>
  <div 
    v-if="show"
    class="error-notification bg-red-50 border-l-4 border-red-500 p-4 mb-4"
    role="alert"
    aria-live="assertive"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0">
        &lt;!-- Icono de error -->
        <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 v-if="title" class="text-sm font-medium text-red-800">{{ title }}</h3>
        <div class="mt-1 text-sm text-red-700">
          <p v-if="typeof message === 'string'">{{ message }}</p>
          <ul v-else-if="Array.isArray(message)" class="list-disc pl-5 space-y-1">
            <li v-for="(item, index) in message" :key="index">{{ item }}</li>
          </ul>
        </div>
        <div v-if="retry" class="mt-3">
          <button 
            type="button"
            class="text-sm font-medium text-red-800 hover:text-red-900 focus:outline-none focus:underline"
            @click="$emit('retry')"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
      <div class="ml-auto pl-3">
        <div class="-mx-1.5 -my-1.5">
          <button
            type="button"
            class="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            @click="$emit('close')"
            aria-label="Cerrar notificación"
          >
            <span class="sr-only">Cerrar</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorNotification',
  props: {
    show: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: 'Error'
    },
    message: {
      type: [String, Array],
      required: true
    },
    retry: {
      type: Boolean,
      default: false
    },
    autoClose: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  emits: ['close', 'retry'],
  mounted() {
    if (this.autoClose && this.show) {
      this.startAutoCloseTimer();
    }
  },
  watch: {
    show(newVal) {
      if (newVal && this.autoClose) {
        this.startAutoCloseTimer();
      }
    }
  },
  beforeUnmount() {
    this.clearAutoCloseTimer();
  },
  methods: {
    startAutoCloseTimer() {
      this.clearAutoCloseTimer();
      this.timer = setTimeout(() => {
        this.$emit('close');
      }, this.duration);
    },
    clearAutoCloseTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  }
}
</script>
