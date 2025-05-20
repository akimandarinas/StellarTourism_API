<template>
  <div 
    :class="[containerClass, 'adaptive-image-container']" 
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
        :fetchpriority="fetchPriority"
        ref="image"
      />
    </transition>
    
    <img 
      v-if="!fadeIn"
      v-show="!loading && loaded"
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
      :fetchpriority="fetchPriority"
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
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';

export default {
  name: 'AdaptiveImage',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
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
  setup(props, { emit }) {
    const loading = ref(true);
    const loaded = ref(false);
    const error = ref(false);
    const container = ref(null);
    const image = ref(null);
    
    // Optimizar la URL de la imagen
    const optimizedSrc = computed(() => {
      if (!props.src) return '';
      
      // Si la URL ya es de un servicio de optimización o es una URL de datos, devolverla tal cual
      if (props.src.startsWith('data:') || props.src.includes('imagedelivery.net') || props.format === 'original') {
        return props.src;
      }
      
      // Construir URL optimizada
      try {
        const url = new URL(props.src, window.location.origin);
        
        // Si es una URL externa, devolver la original
        if (url.origin !== window.location.origin && !props.src.startsWith('/')) {
          return props.src;
        }
        
        // Para imágenes locales, podemos aplicar optimización
        const params = new URLSearchParams();
        
        if (props.width) params.append('w', props.width);
        if (props.height) params.append('h', props.height);
        if (props.quality && props.quality !== 80) params.append('q', props.quality);
        if (props.format && props.format !== 'auto') params.append('f', props.format);
        
        // Si hay parámetros, añadirlos a la URL
        const paramsString = params.toString();
        if (paramsString) {
          return `${props.src}${props.src.includes('?') ? '&' : '?'}${paramsString}`;
        }
      } catch (e) {
        console.warn('Error al optimizar la URL de la imagen:', e);
      }
      
      return props.src;
    });
    
    // Generar srcset para imágenes responsivas
    const srcSet = computed(() => {
      if (!props.src || props.src.startsWith('data:') || props.format === 'original') {
        return '';
      }
      
      try {
        return props.breakpoints
          .map(width => {
            const optimizedUrl = `${props.src}${props.src.includes('?') ? '&' : '?'}w=${width}&q=${props.quality}${props.format !== 'auto' ? `&f=${props.format}` : ''}`;
            return `${optimizedUrl} ${width}w`;
          })
          .join(', ');
      } catch (e) {
        console.warn('Error al generar srcset:', e);
        return '';
      }
    });
    
    // Generar el atributo sizes
    const sizeAttribute = computed(() => {
      if (typeof props.sizes === 'string') {
        return props.sizes;
      }
      
      if (typeof props.sizes === 'object') {
        return Object.entries(props.sizes)
          .sort((a, b) => b[0] - a[0]) // Ordenar de mayor a menor breakpoint
          .map(([breakpoint, size]) => `(min-width: ${breakpoint}px) ${size}`)
          .concat(['100vw']) // Valor por defecto
          .join(', ');
      }
      
      return '100vw';
    });
    
    // Manejar la carga de la imagen
    const onImageLoad = () => {
      loading.value = false;
      loaded.value = true;
      error.value = false;
      emit('load');
    };
    
    // Manejar errores de carga
    const onImageError = (e) => {
      loading.value = false;
      error.value = true;
      console.error('Error al cargar la imagen:', e);
      emit('error', e);
    };
    
    // Observar cambios en la fuente de la imagen
    watch(() => props.src, () => {
      loading.value = true;
      loaded.value = false;
      error.value = false;
    });
    
    // Inicializar
    onMounted(() => {
      // Si la imagen ya está en caché, puede que el evento load no se dispare
      if (image.value && image.value.complete) {
        onImageLoad();
      }
    });
    
    return {
      loading,
      loaded,
      error,
      container,
      image,
      optimizedSrc,
      srcSet,
      sizeAttribute,
      onImageLoad,
      onImageError
    };
  }
};
</script>

<style scoped>
.adaptive-image-container {
  position: relative;
  overflow: hidden;
}

.adaptive-image {
  display: block;
  width: 100%;
  height: auto;
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
