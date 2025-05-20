<template>
  <div class="card" :class="{ 'card-hover': hover }">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  hover: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.card {
  background-color: var(--color-surface, #ffffff);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-border, rgba(229, 231, 235, 0.5));
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border, rgba(229, 231, 235, 0.5));
}

.card-content {
  padding: 1.5rem;
}

.card-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-border, rgba(229, 231, 235, 0.5));
}

/* Tema oscuro */
:root.dark .card {
  background-color: var(--color-surface, #1f2937);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
}

:root.dark .card-header,
:root.dark .card-footer {
  border-color: rgba(255, 255, 255, 0.1);
}

:root.dark .card-hover:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
}
</style>
