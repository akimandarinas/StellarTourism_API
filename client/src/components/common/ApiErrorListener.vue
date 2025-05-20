<template>
  <!-- Componente sin renderizado, solo para lógica -->
</template>

<script>
import { useToast } from '@/composables/useToast';
import { onMounted, onUnmounted } from 'vue';

export default {
  name: 'ApiErrorListener',
  setup() {
    const toast = useToast();

    // Manejador de eventos de error de API
    const handleApiError = (event) => {
      const { title, message } = event.detail;
      toast.error(title, message);
    };

    // Registrar y limpiar el listener de eventos
    onMounted(() => {
      window.addEventListener('api-error', handleApiError);
    });

    onUnmounted(() => {
      window.removeEventListener('api-error', handleApiError);
    });

    return {};
  }
}
</script>
