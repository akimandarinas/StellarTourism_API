<template>
  <div 
    :class="[containerClass, 'accessible-image-container']" 
    :style="containerStyle"
    ref="container"
  >
    <!-- Imagen con atributos de accesibilidad -->
    <img 
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      :alt="decorative ? '' : (alt || 'Imagen sin descripción alternativa')"
      :aria-hidden="decorative ? 'true' : undefined"
      :role="decorative ? 'presentation' : undefined"
      :width="width"
      :height="height"
      :loading="lazyLoad ? 'lazy' : 'eager'"
      :decoding="decoding"
      :class="[
        'accessible-image',
        { 'accessible-image-cover': objectFit === 'cover' },
        { 'accessible-image-contain': objectFit === 'contain' },
        imageClass
      ]"
      :style="imageStyle"
      @load="onImageLoad"
      @error="onImageError"
      v-bind="$attrs"
    />
    
    <!-- Indicador de carga -->
    <div v-if="loading && !error" class="loading-indicator" aria-hidden="true">
      <span class="sr-only">Cargando imagen</span>
    </div>
    
    <figcaption 
      v-if="caption" 
      class="accessible-image-caption"
      :id="captionId"
    >
      {{ caption }}
    </figcaption>
    
    <div 
      v-if="longDescription" 
      class="accessible-image-long-description"
      :id="longDescId"
    >
      <button 
        v-if="!showLongDescription" 
        @click="toggleLongDescription"
        class="accessible-image-long-description-toggle"
        :aria-expanded="showLongDescription ? 'true' : 'false'"
        :aria-controls="longDescId"
      >
        Ver descripción detallada
      </button>
      <div 
        v-show="showLongDescription" 
        class="accessible-image-long-description-content"
      >
        <p>{{ longDescription }}</p>
        <button 
          v-if="showLongDescription" 
          @click="toggleLongDescription"
          class="accessible-image-long-description-toggle"
          aria-expanded="true"
          :aria-controls="longDescId"
        >
          Ocultar descripción
        </button>
      </div>
    </div>
    
    <div 
      v-if="error" 
      class="accessible-image-error"
      role="alert"
    >
      <slot name="error">
        <div class="accessible-image-error-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="accessible-image-error-icon" aria-hidden="true">
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
import { generateId } from '../utils/aria';

export default {
  name: 'AccessibleImage',
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: '',
      validator: (value) => {
        if (value === '') {
          console.warn('AccessibleImage: El atributo alt está vacío. Si la imagen es decorativa, use decorative=true');
          return true;
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
    lazyLoad: {
      type: Boolean,
      default: true
    },
    decoding: {
      type: String,
      default: 'async',
      validator: (value) => ['sync', 'async', 'auto'].includes(value)
    },
    decorative: {
      type: Boolean,
      default: false
    },
    caption: {
      type: String,
      default: ''
    },
    longDescription: {
      type: String,
      default: ''
    },
    objectFit: {
      type: String,
      default: 'cover',
      validator: (value) => ['cover', 'contain', 'fill', 'none', 'scale-down'].includes(value)
    },
    imageClass: {
      type: String,
      default: ''
    },
    containerClass: {
      type: String,
      default: ''
    },
    imageStyle: {
      type: Object,
      default: () => ({})
    },
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    srcset: {
      type: String,
      default: ''
    },
    sizes: {
      type: String,
      default: ''
    }
  },
  
  emits: ['load', 'error'],
  
  setup(props, { emit }) {
    const error = ref(false);
    const loading = ref(true);
    const loaded = ref(false);
    const showLongDescription = ref(false);
    
    const captionId = ref(generateId('img-caption'));
    const longDescId = ref(generateId('img-desc'));
    
    const toggleLongDescription = () => {
      showLongDescription.value = !showLongDescription.value;
    };
    
    const onImageLoad = (event) => {
      loading.value = false;
      loaded.value = true;
      emit('load', event);
    };
    
    // Manejar error de carga
    const onImageError = (event) => {
      loading.value = false;
      error.value = true;
      emit('error', event);
    };
    
    // Validar accesibilidad
    onMounted(() => {
      // Validar alt text
      if (!props.decorative && (!props.alt || props.alt.trim() === '')) {
        console.error(`AccessibleImage: Imagen no decorativa sin texto alternativo adecuado. Src: ${props.src}`);
      }
      
      // Validar dimensiones
      if (!props.width || !props.height) {
        console.warn(`AccessibleImage: Se recomienda proporcionar width y height para evitar cambios de diseño durante la carga. Src: ${props.src}`);
      }
      
      if (props.caption && props.longDescription && props.caption === props.longDescription) {
        console.warn('AccessibleImage: caption y longDescription son idénticos. Considere usar solo uno de ellos o proporcionar información diferente.');
      }
    });
    
    // Observar cambios en src para resetear 
    watch(() => props.src, () => {
      error.value = false;
      loading.value = true;
      loaded.value = false;
    });
    
    return {
      error,
      loading,
      loaded,
      captionId,
      longDescId,
      showLongDescription,
      toggleLongDescription,
      onImageLoad,
      onImageError
    };
  }
};
</script>

<style scoped>
.accessible-image-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.accessible-image {
  display: block;
  max-width: 100%;
  height: auto;
}

.accessible-image-cover {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.accessible-image-contain {
  object-fit: contain;
  width: 100%;
  height: 100%;
}

.accessible-image-caption {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #4a5568);
  text-align: center;
}

.accessible-image-long-description {
  margin-top: 0.5rem;
}

.accessible-image-long-description-toggle {
  background: none;
  border: none;
  color: var(--color-primary, #3182ce);
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  text-decoration: underline;
  border-radius: var(--border-radius-sm, 0.125rem);
}

.accessible-image-long-description-toggle:hover,
.accessible-image-long-description-toggle:focus {
  color: var(--color-primary-dark, #2c5282);
  background-color: var(--color-background-hover, #f7fafc);
}

.accessible-image-long-description-toggle:focus-visible {
  outline: 2px solid var(--color-primary, #3182ce);
  outline-offset: 2px;
}

.accessible-image-long-description-content {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: var(--color-background-alt, #f7fafc);
  border-radius: var(--border-radius-md, 0.375rem);
  font-size: 0.875rem;
}

.accessible-image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-alt, #f7fafc);
  color: var(--color-text-secondary, #4a5568);
  border-radius: var(--border-radius-md, 0.375rem);
}

.accessible-image-error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

.accessible-image-error-icon {
  margin-bottom: 0.5rem;
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.1);
}

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
