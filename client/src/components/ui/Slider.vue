<template>
  <div
    class="relative flex w-full touch-none select-none items-center"
    :class="className"
  >
    <div 
      class="relative w-full h-2 rounded-full bg-secondary"
      role="presentation"
    >
      <div
        class="absolute h-full bg-primary rounded-full"
        :style="{ width: `${percentage}%` }"
        role="presentation"
      ></div>
      <div
        class="absolute h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        :style="{ left: `calc(${percentage}% - 10px)` }"
        @mousedown="startDrag"
        @touchstart="startDrag"
        role="presentation"
      ></div>
    </div>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="updateValue"
      class="sr-only"
      :disabled="disabled"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue"
      :aria-valuetext="valueText"
      :aria-label="ariaLabel || 'Slider'"
      :aria-orientation="orientation"
      :aria-disabled="disabled ? 'true' : 'false'"
      role="slider"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  },
  ariaLabel: {
    type: String,
    default: ''
  },
  valueText: {
    type: String,
    default: ''
  },
  orientation: {
    type: String,
    default: 'horizontal'
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'blur']);

const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100;
});

const updateValue = (event) => {
  emit('update:modelValue', Number(event.target.value));
};

const isDragging = ref(false);

const startDrag = (event) => {
  if (props.disabled) return;
  
  isDragging.value = true;
  
  const handleMove = (e) => {
    if (!isDragging.value) return;
    
    const container = event.target.parentElement;
    const rect = container.getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    
    let percentage = ((clientX - rect.left) / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    
    const value = props.min + (percentage / 100) * (props.max - props.min);
    const steppedValue = Math.round(value / props.step) * props.step;
    
    emit('update:modelValue', Number(steppedValue.toFixed(5)));
  };
  
  const stopDrag = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
    
    // Emit change event when dragging stops
    emit('change', props.modelValue);
    emit('blur');
  };
  
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('touchmove', handleMove);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
  
  // Trigger initial move
  handleMove(event);
};
</script>

<style scoped>
/* Estilos base mantenidos del componente original */
</style>
