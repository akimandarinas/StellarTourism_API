<template>
  <div class="relative inline-block text-left">
    <!-- Trigger -->
    <div @click="toggle" class="inline-block">
      <slot name="trigger"></slot>
    </div>
    
    <!-- Dropdown Menu -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div 
          v-if="isOpen" 
          class="dropdown-container"
          @click.self="closeOnClickOutside ? close() : null"
        >
          <div 
            ref="dropdownRef"
            :class="[
              'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              className
            ]"
            :style="positionStyle"
            @click.stop
          >
            <slot></slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  position: {
    type: String,
    default: 'bottom-start',
    validator: (value) => ['top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end'].includes(value)
  },
  offset: {
    type: Number,
    default: 5
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true
  },
  closeOnEsc: {
    type: Boolean,
    default: true
  },
  className: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'open', 'close']);

const isOpen = ref(props.modelValue);
const triggerRef = ref(null);
const dropdownRef = ref(null);
const triggerRect = ref(null);

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue;
});

// Watch for internal changes to isOpen
watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue);
  if (newValue) {
    emit('open');
    nextTick(() => {
      updatePosition();
      document.addEventListener('click', handleOutsideClick);
      if (props.closeOnEsc) {
        document.addEventListener('keydown', handleEscKey);
      }
    });
  } else {
    emit('close');
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleEscKey);
  }
});

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

const handleOutsideClick = (event) => {
  if (props.closeOnClickOutside && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    close();
  }
};

const handleEscKey = (event) => {
  if (event.key === 'Escape') {
    close();
  }
};

const updatePosition = () => {
  if (!triggerRef.value || !dropdownRef.value) return;
  
  // Get the trigger element's bounding rect
  triggerRect.value = triggerRef.value.getBoundingClientRect();
};

const positionStyle = computed(() => {
  if (!triggerRect.value) return {};
  
  const { top, left, bottom, right, width, height } = triggerRect.value;
  const { innerWidth, innerHeight } = window;
  
  // Default position is bottom-start
  let style = {
    position: 'fixed',
    zIndex: 50
  };
  
  switch (props.position) {
    case 'top':
      style.bottom = `${innerHeight - top + props.offset}px`;
      style.left = `${left + width / 2}px`;
      style.transform = 'translateX(-50%)';
      break;
    case 'top-start':
      style.bottom = `${innerHeight - top + props.offset}px`;
      style.left = `${left}px`;
      break;
    case 'top-end':
      style.bottom = `${innerHeight - top + props.offset}px`;
      style.right = `${innerWidth - right}px`;
      break;
    case 'right':
      style.left = `${right + props.offset}px`;
      style.top = `${top + height / 2}px`;
      style.transform = 'translateY(-50%)';
      break;
    case 'right-start':
      style.left = `${right + props.offset}px`;
      style.top = `${top}px`;
      break;
    case 'right-end':
      style.left = `${right + props.offset}px`;
      style.bottom = `${innerHeight - bottom}px`;
      break;
    case 'bottom':
      style.top = `${bottom + props.offset}px`;
      style.left = `${left + width / 2}px`;
      style.transform = 'translateX(-50%)';
      break;
    case 'bottom-start':
      style.top = `${bottom + props.offset}px`;
      style.left = `${left}px`;
      break;
    case 'bottom-end':
      style.top = `${bottom + props.offset}px`;
      style.right = `${innerWidth - right}px`;
      break;
    case 'left':
      style.right = `${innerWidth - left + props.offset}px`;
      style.top = `${top + height / 2}px`;
      style.transform = 'translateY(-50%)';
      break;
    case 'left-start':
      style.right = `${innerWidth - left + props.offset}px`;
      style.top = `${top}px`;
      break;
    case 'left-end':
      style.right = `${innerWidth - left + props.offset}px`;
      style.bottom = `${innerHeight - bottom}px`;
      break;
    default:
      // Default to bottom-start
      style.top = `${bottom + props.offset}px`;
      style.left = `${left}px`;
  }
  
  return style;
});

onMounted(() => {
  // Find the trigger element (first child of the slot)
  nextTick(() => {
    const slotContent = document.querySelector('[data-v-dropdown-trigger]');
    if (slotContent) {
      triggerRef.value = slotContent;
    }
  });
  
  // Add resize listener to update position
  window.addEventListener('resize', updatePosition);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleEscKey);
  window.removeEventListener('resize', updatePosition);
});

// Expose methods to parent component
defineExpose({
  open,
  close,
  toggle
});
</script>

<style scoped>
.dropdown-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 40;
  pointer-events: auto;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
