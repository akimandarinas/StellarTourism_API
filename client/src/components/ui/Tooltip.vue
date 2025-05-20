<template>
  <div class="tooltip-container">
    <div 
      ref="triggerRef"
      class="tooltip-trigger"
      @mouseenter="show"
      @mouseleave="hide"
      @focus="show"
      @blur="hide"
      @keydown.escape="hide"
    >
      <slot></slot>
    </div>
    
    <Transition name="tooltip">
      <div 
        v-if="isVisible"
        ref="tooltipRef"
        role="tooltip"
        :id="tooltipId"
        class="tooltip"
        :class="[
          `tooltip-${position}`,
          className
        ]"
      >
        {{ content }}
        <slot name="content"></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
  },
  delay: {
    type: Number,
    default: 200
  },
  className: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  }
});

const isVisible = ref(false);
const triggerRef = ref(null);
const tooltipRef = ref(null);
const tooltipId = ref(props.id || `tooltip-${Math.random().toString(36).substring(2, 9)}`);
let showTimeout = null;
let hideTimeout = null;

// Mostrar el tooltip
const show = () => {
  clearTimeout(hideTimeout);
  
  if (!isVisible.value) {
    showTimeout = setTimeout(() => {
      isVisible.value = true;
      
      // Añadir aria-describedby al trigger
      if (triggerRef.value) {
        triggerRef.value.setAttribute('aria-describedby', tooltipId.value);
      }
    }, props.delay);
  }
};

// Ocultar el tooltip
const hide = () => {
  clearTimeout(showTimeout);
  
  if (isVisible.value) {
    hideTimeout = setTimeout(() => {
      isVisible.value = false;
      
      // Eliminar aria-describedby del trigger
      if (triggerRef.value) {
        triggerRef.value.removeAttribute('aria-describedby');
      }
    }, props.delay);
  }
};

// Posicionar el tooltip
const positionTooltip = () => {
  if (!isVisible.value || !triggerRef.value || !tooltipRef.value) return;
  
  const trigger = triggerRef.value.getBoundingClientRect();
  const tooltip = tooltipRef.value;
  
  // Posicionar según la propiedad position
  switch (props.position) {
    case 'top':
      tooltip.style.bottom = `${window.innerHeight - trigger.top + 8}px`;
      tooltip.style.left = `${trigger.left + trigger.width / 2}px`;
      tooltip.style.transform = 'translateX(-50%)';
      break;
    case 'right':
      tooltip.style.top = `${trigger.top + trigger.height / 2}px`;
      tooltip.style.left = `${trigger.right + 8}px`;
      tooltip.style.transform = 'translateY(-50%)';
      break;
    case 'bottom':
      tooltip.style.top = `${trigger.bottom + 8}px`;
      tooltip.style.left = `${trigger.left + trigger.width / 2}px`;
      tooltip.style.transform = 'translateX(-50%)';
      break;
    case 'left':
      tooltip.style.top = `${trigger.top + trigger.height / 2}px`;
      tooltip.style.right = `${window.innerWidth - trigger.left + 8}px`;
      tooltip.style.transform = 'translateY(-50%)';
      break;
  }
};

// Observar cambios en la visibilidad para posicionar el tooltip
watch(isVisible, (value) => {
  if (value) {
    // Posicionar después de que el tooltip sea visible
    setTimeout(positionTooltip, 0);
  }
});

// Configurar eventos al montar
onMounted(() => {
  window.addEventListener('resize', positionTooltip);
  window.addEventListener('scroll', positionTooltip);
});

// Limpiar eventos al desmontar
onBeforeUnmount(() => {
  window.removeEventListener('resize', positionTooltip);
  window.removeEventListener('scroll', positionTooltip);
  
  clearTimeout(showTimeout);
  clearTimeout(hideTimeout);
});
</script>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: fixed;
  z-index: 9999;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: white;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 0.25rem;
  pointer-events: none;
  max-width: 250px;
  text-align: center;
}

/* Animaciones */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>
