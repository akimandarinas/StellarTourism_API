<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 flex w-72 flex-col',
      'border-r bg-background transition-transform',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      'md:relative md:translate-x-0',
      className
    ]"
  >
    <div class="flex h-14 items-center border-b px-4">
      <slot name="header">
        <h2 class="text-lg font-semibold">Sidebar</h2>
      </slot>
      <button
        @click="$emit('update:isOpen', false)"
        class="ml-auto rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        <span class="sr-only">Cerrar</span>
      </button>
    </div>
    <div class="flex-1 overflow-auto py-4">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="border-t p-4">
      <slot name="footer"></slot>
    </div>
  </aside>
  
  <!-- Overlay para móviles -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
      @click="$emit('update:isOpen', false)"
    ></div>
  </Transition>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});

defineEmits(['update:isOpen']);
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
