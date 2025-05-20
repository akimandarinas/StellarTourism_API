<template>
  <div class="accordion">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue';

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false
  },
  defaultValue: {
    type: [String, Array],
    default: () => []
  },
  collapsible: {
    type: Boolean,
    default: true
  }
});

// Convertir defaultValue a array si es string
const initialValue = Array.isArray(props.defaultValue) 
  ? props.defaultValue 
  : props.defaultValue ? [props.defaultValue] : [];

// Estado de los items expandidos
const expandedItems = ref(initialValue);

// Alternar un item
const toggleItem = (value) => {
  if (props.multiple) {
    // Modo múltiple: permite múltiples items abiertos
    const index = expandedItems.value.indexOf(value);
    
    if (index === -1) {
      expandedItems.value.push(value);
    } else {
      // Solo permitir cerrar si es collapsible o hay más de un item abierto
      if (props.collapsible || expandedItems.value.length > 1) {
        expandedItems.value.splice(index, 1);
      }
    }
  } else {
    // Modo único: solo un item abierto a la vez
    if (expandedItems.value.includes(value)) {
      // Solo permitir cerrar si es collapsible
      if (props.collapsible) {
        expandedItems.value = [];
      }
    } else {
      expandedItems.value = [value];
    }
  }
};

// Verificar si un item está expandido
const isExpanded = (value) => {
  return expandedItems.value.includes(value);
};

// Proporcionar el estado y métodos a los componentes hijos
provide('accordion', {
  expandedItems,
  toggleItem,
  isExpanded,
  multiple: props.multiple,
  collapsible: props.collapsible
});
</script>

<style scoped>
.accordion {
  width: 100%;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--border-radius-md, 0.375rem);
  overflow: hidden;
}
</style>
