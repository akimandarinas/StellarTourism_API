<template>
  <div 
    :class="[containerClass, 'optimized-image-container']" 
    :style="containerStyle"
    ref="container"
  >
    <div 
      v-if="loading && placeholder" 
      class="adaptive-image-placeholder"
      :style="{ 
        backgroundColor: placeholderColor,
        aspectRatio: aspectRatio ? aspectRatio : 'auto'
      }"
    ></div>
    
    <div 
      v-if="loading && skeleton" 
      class="adaptive-image-skeleton"
      :style="{ 
        aspectRatio: aspectRatio ? aspectRatio : 'auto'
      }"
    ></div>
    
    <transition 
      name="fade" 
      v-if="fadeIn"
    >
      <img 
        v-show="!loading && loaded"
        v-if="shouldLoadImage"
        :src="optimizedSrc"
        :srcset="srcSet"
        :sizes="sizeAttribute"
        :alt="alt"
        :class="[imageClass, 'adaptive-image']"
        :style="imageStyle"
        @load="onImageLoad"
        @error="onImageError"
        :loading="lazyLoad ? 'lazy' : 'eager'"
        :decoding="decoding"
        :fetchpriority="currentFetchPriority"
        ref="image"
      />
    </transition>
    
    <img 
      v-if="!fadeIn"
      v-show="!loading && loaded"
      v-if="shouldLoadImage"
      :src="optimizedSrc"
      :srcset="srcSet"
      :sizes="sizeAttribute"
      :alt="alt"
      :class="[imageClass, 'adaptive-image']"
      :style="imageStyle"
      @load="onImageLoad"
      @error="onImageError"
      :loading="lazyLoad ? 'lazy' : 'eager'"
      :decoding="decoding"
      :fetchpriority="currentFetchPriority"
      ref="image"
    />
    
    <div 
      v-if="error" 
      class="adaptive-image-error"
      :style="{ 
        aspectRatio: aspectRatio ? aspectRatio : 'auto'
      }"
    >
      <slot name="error">
        <div class="adaptive-image-error-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="adaptive-image-error-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Error al cargar la imagen</span>
        </div>
      </slot>
    </div>
    
    <div 
      v-if="$slots.overlay" 
      class="adaptive-image-overlay"
    >
      <slot name="overlay"></slot>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '../../services/image/image-processor';

export default {
  name: 'OptimizedImage',
  props: {
    src: {
      type: String,
      required: true,
      validator: (value) => {
        if (!value) {
          console.error('La propiedad src es requerida en OptimizedImage');
          return false;
        }
        return true;
      }
    },
    alt: {
      type: String,
      required: true,
      validator: (value) => {
        if (!value) {
          console.error('La propiedad alt es requerida en OptimizedImage para accesibilidad');
          return false;
        }
        return true;
      }
    },
    width: {
      type: [Number, String],
      default: null
    },
    height: {
      type: [Number, String],
      default: null
    },
    aspectRatio: {
      type: String,
      default: null
    },
    containerClass: {
      type: String,
      default: ''
    },
    imageClass: {
      type: String,
      default: ''
    },
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    imageStyle: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: Boolean,
      default: true
    },
    placeholderColor: {
      type: String,
      default: '#f3f4f6'
    },
    skeleton: {
      type: Boolean,
      default: false
    },
    fadeIn: {
      type: Boolean,
      default: true
    },
    lazyLoad: {
      type: Boolean,
      default: true
    },
    sizes: {
      type: [String, Object],
      default: '100vw'
    },
    quality: {
      type: Number,
      default: 80
    },
    format: {
      type: String,
      default: 'auto',
      validator: (value) => ['auto', 'webp', 'avif', 'jpeg', 'png', 'original'].includes(value)
    },
    decoding: {
      type: String,
      default: 'async',
      validator: (value) => ['async', 'sync', 'auto'].includes(value)
    },
    fetchPriority: {
      type: String,
      default: 'auto',
      validator: (value) => ['high', 'low', 'auto'].includes(value)
    },
    breakpoints: {
      type: Array,
      default: () => [640, 768, 1024, 1280, 1536]
    }
  },
  emits: ['load', 'error'],
  setup(props, { emit }) {
    const loading = ref(true);
    const loaded = ref(false);
    const error = ref(false);
    const image = ref(null);
    const container = ref(null);
    const observer = ref(null);
    const isIntersecting = ref(false);
    const retryCount = ref(0);
    const maxRetries = 2;
    
    // Optimizar la URL de la imagen
    const optimizedSrc = computed(() => {
      return getOptimizedImageUrl(props.src, {
        width: props.width,
        height: props.height,
        quality: props.quality,
        format: props.format
      });
    });
    
    // Generar srcset para imágenes responsivas
    const srcSet = computed(() => {
      if (props.format === 'original' || !props.src) {
        return '';
      }
      
      return generateSrcSet(props.src, {
        breakpoints: props.breakpoints,
        quality: props.quality,
        format: props.format
      });
    });
    
    // Generar el atributo sizes
    const sizeAttribute = computed(() => {
      return generateSizes(props.sizes);
    });
    
    // Manejar la carga de la imagen
    const onImageLoad = () => {
      loading.value = false;
      loaded.value = true;
      emit('load');
    };
    
    // Manejar errores de carga
    const onImageError = (e) => {
      if (retryCount.value < maxRetries) {
        // Intentar cargar la imagen nuevamente después de un breve retraso
        retryCount.value++;
        setTimeout(() => {
          // Forzar recarga de la imagen
          if (image.value) {
            const currentSrc = image.value.src;
            image.value.src = '';
            image.value.src = currentSrc;
          }
        }, 1000 * retryCount.value); // Incrementar el tiempo de espera con cada reintento
      } else {
        // Después de los reintentos, marcar como error
        loading.value = false;
        error.value = true;
        emit('error', e);
      }
    };
    
    // Observar cambios en la fuente de la imagen
    watch(() => props.src, () => {
      if (props.src) {
        loading.value = true;
        loaded.value = false;
        error.value = false;
      }
    });
    
    // Añadir una referencia para el contenedor y el observer

    // Optimizar la carga de imágenes con IntersectionObserver
    onMounted(() => {
      // Si la imagen ya está en caché, puede que el evento load no se dispare
      if (image.value && image.value.complete && image.value.naturalWidth > 0) {
        onImageLoad();
      }
      
      // Usar IntersectionObserver para cargar la imagen solo cuando sea visible
      if ('IntersectionObserver' in window && props.lazyLoad) {
        // Crear el observer solo si el contenedor existe
        if (container.value) {
          observer.value = new IntersectionObserver((entries) => {
            const entry = entries[0];
            isIntersecting.value = entry.isIntersecting;
            
            if (entry.isIntersecting) {
              // Desconectar el observer una vez que la imagen es visible
              if (observer.value) {
                observer.value.disconnect();
                observer.value = null;
              }
            }
          }, {
            rootMargin: '200px 0px', // Cargar imágenes 200px antes de que sean visibles
            threshold: 0.01
          });
          
          observer.value.observe(container.value);
        } else {
          // Si no hay contenedor, marcar como visible inmediatamente
          isIntersecting.value = true;
        }
      } else {
        // Si no hay soporte para IntersectionObserver, marcar como visible inmediatamente
        isIntersecting.value = true;
      }
    });

    // Limpiar el observer cuando el componente se desmonta
    onBeforeUnmount(() => {
      // Limpiar el observer si existe
      if (observer.value) {
        observer.value.disconnect();
        observer.value = null;
      }
      
      // Limpiar referencias a elementos DOM
      container.value = null;
      image.value = null;
    });

    // Solo cargar la imagen cuando sea visible o si lazyLoad está desactivado
    const prioritizeLoading = () => {
      if (props.fetchPriority === 'auto' && isIntersecting.value) {
        return 'high';
      }
      return props.fetchPriority;
    };

    // Actualizar el computed para shouldLoadImage
    const shouldLoadImage = computed(() => {
      return !props.lazyLoad || isIntersecting.value;
    });
    
    // Añadir un nuevo computed para la prioridad de carga
    const currentFetchPriority = computed(() => {
      return prioritizeLoading();
    });
    
    return {
      loading,
      loaded,
      error,
      image,
      optimizedSrc,
      srcSet,
      sizeAttribute,
      onImageLoad,
      onImageError,
      container,
      shouldLoadImage,
      currentFetchPriority
    };
  }
};
</script>

<style scoped>
.optimized-image-container {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.adaptive-image {
  display: block;
  width: 100%;
  height: auto;
  object-position: center;
  transition: opacity 0.3s ease;
}

.adaptive-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.adaptive-image-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.adaptive-image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f9fafb;
  color: #6b7280;
}

.adaptive-image-error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

.adaptive-image-error-icon {
  margin-bottom: 0.5rem;
}

.adaptive-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
