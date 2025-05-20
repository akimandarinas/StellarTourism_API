<template>
  <div class="tabs-container">
    <!-- Lista de pestañas -->
    <div 
      class="tabs-list" 
      role="tablist"
      :aria-label="ariaLabel"
      :aria-orientation="vertical ? 'vertical' : 'horizontal'"
    >
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id || index"
        class="tab"
        :class="{ 'active': activeTab === index }"
        role="tab"
        :id="`tab-${tabsId}-${index}`"
        :aria-selected="activeTab === index ? 'true' : 'false'"
        :aria-controls="`panel-${tabsId}-${index}`"
        :tabindex="activeTab === index ? 0 : -1"
        @click="activateTab(index)"
        @keydown="handleTabKeyDown($event, index)"
      >
        <slot :name="`tab-${index}`">{{ tab.label }}</slot>
      </button>
    </div>
    
    <!-- Paneles de contenido -->
    <div class="tabs-panels">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.id || index"
        class="tab-panel"
        :class="{ 'active': activeTab === index }"
        role="tabpanel"
        :id="`panel-${tabsId}-${index}`"
        :aria-labelledby="`tab-${tabsId}-${index}`"
        :hidden="activeTab !== index"
        tabindex="0"
      >
        <slot :name="`panel-${index}`">{{ tab.content }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide, computed } from 'vue';

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  defaultTab: {
    type: Number,
    default: 0
  },
  vertical: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: 'Pestañas'
  }
});

const emit = defineEmits(['tab-change']);

// Generar un ID único para este conjunto de pestañas
const tabsId = ref(`tabs-${Math.random().toString(36).substring(2, 9)}`);

// Pestaña activa
const activeTab = ref(props.defaultTab);

// Activar una pestaña
const activateTab = (index) => {
  if (index >= 0 && index < props.tabs.length) {
    activeTab.value = index;
    emit('tab-change', index);
  }
};

// Manejar eventos de teclado para navegación accesible
const handleTabKeyDown = (event, index) => {
  let newIndex = index;
  
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      newIndex = (index + 1) % props.tabs.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      newIndex = (index - 1 + props.tabs.length) % props.tabs.length;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = props.tabs.length - 1;
      break;
  }
  
  if (newIndex !== index) {
    activateTab(newIndex);
    
    // Enfocar la nueva pestaña
    setTimeout(() => {
      document.getElementById(`tab-${tabsId.value}-${newIndex}`)?.focus();
    }, 10);
  }
};

// Proporcionar el estado de las pestañas a los componentes hijos
provide('tabs', {
  activeTab,
  activateTab
});

// Inicializar
onMounted(() => {
  // Asegurar que la pestaña activa esté dentro de los límites
  if (activeTab.value < 0 || activeTab.value >= props.tabs.length) {
    activeTab.value = 0;
  }
});
</script>

<style scoped>
.tabs-container {
  width: 100%;
}

.tabs-list {
  display: flex;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  margin-bottom: 1rem;
}

.tabs-list.vertical {
  flex-direction: column;
  border-bottom: none;
  border-right: 1px solid var(--color-border, #e5e7eb);
  margin-right: 1rem;
  margin-bottom: 0;
}

.tab {
  padding: 0.75rem 1rem;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  background: none;
  border: none;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
  transition: all 0.2s ease;
}

.tab:hover {
  color: var(--color-text, #1f2937);
}

.tab.active {
  color: var(--color-primary, #3b82f6);
  border-bottom-color: var(--color-primary, #3b82f6);
}

.tabs-list.vertical .tab {
  border-bottom: none;
  border-right: 2px solid transparent;
}

.tabs-list.vertical .tab.active {
  border-right-color: var(--color-primary, #3b82f6);
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}

/* Accesibilidad */
.tab:focus-visible {
  outline: 2px solid var(--color-primary, #3b82f6);
  outline-offset: -2px;
}
</style>
