<template>
  <div 
    class="destino-image"
    :class="{ 'rounded': rounded, 'loading': loading }"
    :style="containerStyle"
  >
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <img
      :src="imageSrc"
      :alt="alt"
      class="image"
      :class="{ 'loaded': !loading }"
      @load="handleImageLoaded"
      @error="handleImageError"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getDestinoImagePath } from '../../utils/image-paths';

const props = defineProps({
  destino: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'Imagen de destino'
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: '100%'
  },
  rounded: {
    type: Boolean,
    default: true
  },
  objectFit: {
    type: String,
    default: 'cover'
  }
});

const loading = ref(true);
const error = ref(false);
const retryCount = ref(0);
const MAX_RETRIES = 2;

// Usar solo imágenes locales con manejo de errores mejorado
const imageSrc = computed(() => {
  if (error.value) {
    // Si hay error, intentamos usar una imagen alternativa
    if (props.destino && (props.destino.toLowerCase() === 'europa' || props.destino.toLowerCase() === 'ceres')) {
      // Para Europa y Ceres, usamos imágenes alternativas específicas
      return props.destino.toLowerCase() === 'europa' 
        ? '/images/jupiter-moons.png' 
        : '/images/marte.png';
    }
    return '/images/placeholder.svg';
  }
  return getDestinoImagePath(props.destino);
});

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}));

function handleImageLoaded() {
  loading.value = false;
}

function handleImageError() {
  // Si ya hemos intentado cargar la imagen alternativa y sigue fallando
  if (error.value || retryCount.value >= MAX_RETRIES) {
    loading.value = false;
    error.value = true;
    console.log("Error al cargar la imagen después de intentos:", getDestinoImagePath(props.destino));
    return;
  }
  
  // Marcar como error e incrementar contador de intentos
  error.value = true;
  retryCount.value++;
  loading.value = true;
  
  console.log(`Intento ${retryCount.value}: Error al cargar la imagen:`, getDestinoImagePath(props.destino));
}

// Reiniciar estado cuando cambia el destino
watch(() => props.destino, () => {
  loading.value = true;
  error.value = false;
  retryCount.value = 0;
});

onMounted(() => {
  // Precargar la imagen
  const img = new Image();
  img.src = getDestinoImagePath(props.destino);
  
  // Si la imagen ya está en caché, marcarla como cargada
  if (img.complete) {
    if (img.naturalWidth === 0) {
      handleImageError();
    } else {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.destino-image {
  position: relative;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.1);
}

.rounded {
  border-radius: 0.5rem;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: v-bind('objectFit');
  transition: opacity 0.3s ease, transform 0.5s ease;
  opacity: 0;
}

.image.loaded {
  opacity: 1;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-primary, #7209b7);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
