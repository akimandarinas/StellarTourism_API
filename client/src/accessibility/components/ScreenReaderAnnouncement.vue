<template>
  <div 
    aria-live="polite" 
    aria-atomic="true" 
    class="sr-only"
    ref="announcer"
  >
    {{ message }}
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'ScreenReaderAnnouncement',
  props: {
    message: {
      type: String,
      default: ''
    },
    priority: {
      type: String,
      default: 'polite',
      validator: (value) => ['polite', 'assertive', 'off'].includes(value)
    }
  },
  setup(props) {
    const announcer = ref(null);
    
    // Actualizar el atributo aria-live cuando cambia la prioridad
    watch(() => props.priority, (newPriority) => {
      if (announcer.value) {
        announcer.value.setAttribute('aria-live', newPriority);
      }
    });
    
    return {
      announcer
    };
  }
};
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
