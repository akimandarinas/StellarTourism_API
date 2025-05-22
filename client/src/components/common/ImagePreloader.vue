<template>
  <div style="display: none;">
    <!-- Este componente no renderiza nada visible -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import imageService from '../../services/image-service';

onMounted(() => {
  // Precargar todas las imágenes al montar el componente
  imageService.preloadAllImages()
    .then(() => {
      console.log('Todas las imágenes precargadas correctamente');
    })
    .catch((failedUrls) => {
      console.warn('Algunas imágenes no se pudieron precargar:', failedUrls);
    });
});
</script>
