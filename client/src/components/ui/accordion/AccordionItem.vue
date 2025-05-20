<template>
  <div 
    class="accordion-item"
    :class="{ 'expanded': isExpanded }"
  >
    <!-- Encabezado del acordeón -->
    <h3 class="accordion-header">
      <button 
        class="accordion-trigger"
        :id="`accordion-header-${itemId}`"
        :aria-expanded="isExpanded ? 'true' : 'false'"
        :aria-controls="`accordion-panel-${itemId}`"
        @click="toggle"
      >
        <slot name="trigger">{{ title }}</slot>
        <span class="accordion-icon" aria-hidden="true">
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
            :style="{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>
    </h3>
    
    <!-- Contenido del acordeón -->
    <div 
      class="accordion-content"
      :id="`accordion-panel-${itemId}`"
      role="region"
      :aria-labelledby="`accordion-header-${itemId}`"
      :hidden="!isExpanded"
    >
      <div class="accordion-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted } from 'vue';

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

// Generar un ID único para este item
const itemId = `item-${Math.random().toString(36).substring(2, 9)}`;

// Obtener el contexto del acordeón
const accordion = inject('accordion');

// Verificar si este item está expandido
const isExpanded = computed(() => {
  return accordion.isExpanded(props.value);
});

// Alternar el estado de este item
const toggle = () => {
  if (!props.disabled) {
    accordion.toggleItem(props.value);
  }
};

// Registrar este item al montar
onMounted(() => {
  // Si es necesario, se puede implementar lógica adicional aquí
});
</script>

<style scoped>
.accordion-item {
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-header {
  margin: 0;
}

.accordion-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  text-align: left;
  font-weight: 500;
  cursor: pointer;
  color: var(--color-text, #1f2937);
}

.accordion-trigger:hover {
  background-color: var(--color-background-hover, #f3f4f6);
}

.accordion-icon {
  transition: transform 0.2s ease;
}

.accordion-content {
  overflow: hidden;
}

.accordion-body {
  padding: 1rem;
}

/* Accesibilidad */
.accordion-trigger:focus-visible {
  outline: 2px solid var(--color-primary, #3b82f6);
  outline-offset: -2px;
}
</style>
