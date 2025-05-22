<template>
  <div class="optimized-image-container" :style="containerStyle">
    <div v-if="loading" class="image-loader">
      <div class="spinner"></div>
    </div>
    <img
      ref="imageRef"
      :src="currentSrc"
      :alt="alt"
      :style="imageStyle"
      class="optimized-image"
      :class="{ 'image-loaded': !loading, 'image-error': hasError }"
      @load="handleImageLoaded"
      @error="handleImageError"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  fallbackSrc: {
    type: String,
    default: '/client/public/images/placeholder.svg'
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: 'auto'
  },
  objectFit: {
    type: String,
    default: 'cover'
  },
  borderRadius: {
    type: String,
    default: '0'
  }
});

const imageRef = ref(null);
const loading = ref(true);
const hasError = ref(false);
const currentSrc = ref(props.src);

const containerStyle = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.borderRadius
}));

const imageStyle = computed(() => ({
  objectFit: props.objectFit,
  opacity: loading.value ? 0 : 1
}));

const handleImageLoaded = () => {
  loading.value = false;
};

const handleImageError = () => {
  if (currentSrc.value !== props.fallbackSrc) {
    currentSrc.value = props.fallbackSrc;
    hasError.value = true;
  } else {
    loading.value = false;
    hasError.value = true;
    console.error(`Failed to load image: ${props.src} and fallback: ${props.fallbackSrc}`);
  }
};

onMounted(() => {
  // Si la imagen ya está en caché, el evento load puede no dispararse
  if (imageRef.value && imageRef.value.complete) {
    loading.value = false;
  }
});
</script>

<style scoped>
.optimized-image-container {
  position: relative;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.1);
}

.optimized-image {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease, transform 0.5s ease;
}

.image-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.05);
  z-index: 1;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(124, 58, 237, 0.3);
  border-radius: 50%;
  border-top-color: #7c3aed;
  animation: spin 1s linear infinite;
}

.image-loaded {
  opacity: 1;
}

.image-error {
  opacity: 0.7;
  filter: grayscale(50%);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
