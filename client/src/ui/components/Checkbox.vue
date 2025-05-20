<template>
  <div class="flex items-center">
    <input
      type="checkbox"
      :id="id"
      :name="name"
      :checked="modelValue"
      @change="updateValue"
      class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      :disabled="disabled"
      :aria-describedby="description ? `${id}-description` : undefined"
    />
    <label :for="id" class="ml-2 block text-sm text-gray-900" v-if="label">
      {{ label }}
    </label>
    <p :id="`${id}-description`" class="text-sm text-gray-500 ml-6" v-if="description">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  emit('update:modelValue', event.target.checked);
};
</script>

<script>
// Exportación nombrada para compatibilidad con importaciones destructuradas
export const Checkbox = {
  name: 'Checkbox',
  inheritAttrs: false
};
</script>
