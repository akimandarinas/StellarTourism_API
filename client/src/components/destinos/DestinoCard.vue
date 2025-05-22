<template>
  <div 
    class="destino-card"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
    tabindex="0"
    :aria-label="`Destino ${destino?.nombre || 'sin nombre'}. Haz clic para ver detalles.`"
    role="button"
  >
    <!-- Contenedor con altura fija -->
    <div class="destino-image">
      <img 
        :src="imageSrc"
        :alt="getImageAlt"
        class="w-full h-full object-cover transition-transform duration-300"
        loading="lazy"
        @error="handleImageError"
      />
      <div class="categoria-badge">
        {{ destino?.categoria || 'Destino' }}
      </div>
    </div>
    
    <div class="destino-content">
      <!-- Título con truncamiento -->
      <h3 class="destino-title">{{ destino?.nombre || 'Destino sin nombre' }}</h3>
      
      <p class="destino-description">
        {{ truncatedDescription }}
        <button 
          v-if="isDescriptionTruncated" 
          class="read-more-btn"
          @click.stop="showFullDescription"
          aria-expanded="false"
        >
          Leer más
        </button>
      </p>
      
      <div class="destino-meta">
        <div class="meta-item">
          <Planet class="meta-icon" aria-hidden="true" />
          <span class="meta-text">
            <span class="sr-only">Distancia:</span>
            {{ formattedDistance }}
          </span>
        </div>
        <div class="meta-item">
          <Calendar class="meta-icon" aria-hidden="true" />
          <span class="meta-text">
            <span class="sr-only">Duración:</span>
            {{ destino?.duracion || '?' }} días
          </span>
        </div>
      </div>
      
      <div class="destino-footer">
        <div class="precio">
          <span class="sr-only">Precio:</span>
          {{ formattedPrice }}
        </div>
        <div 
          class="rating" 
          :aria-label="`Valoración: ${destino?.rating || 0} de 5 estrellas`"
          role="img"
        >
          <div class="stars">
            <span 
              v-for="i in 5" 
              :key="i" 
              :class="[
                'star', 
                i <= Math.round(destino?.rating || 0) ? 'star-filled' : 'star-empty'
              ]" 
              aria-hidden="true"
            >
              <Star class="star-icon" />
            </span>
          </div>
          <span class="reviews">({{ destino?.numResenas || 0 }})</span>
        </div>
      </div>
    </div>
    
    <Modal 
      v-model="showDescriptionModal" 
      :title="destino?.nombre || 'Descripción del destino'"
    >
      <div :id="`desc-${destinoId}`" class="text-base">
        {{ destino?.descripcion || 'Sin descripción disponible' }}
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { Planet, Star, Calendar } from '@/utils/lucide-adapter';
import Modal from '../ui/Modal.vue';
import { formatPrice } from '../../utils/format';
import { computed, ref } from 'vue';
import { getDestinationPlaceholder } from '../../utils/placeholder-utils';
import { getDestinoImagePath } from '../../utils/image-paths';

const props = defineProps({
  destino: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

const showDescriptionModal = ref(false);
    
const destinoId = ref(`destino-${Math.random().toString(36).substring(2, 11)}`);
    
const imageError = ref(false);
    
//Texto alternativo detallado para la imagen
const getImageAlt = computed(() => {
  if (!props.destino) return 'Imagen de destino espacial';
      
  return `Imagen de ${props.destino.nombre || 'destino espacial'}, ${props.destino.categoria || 'destino'} espacial`;
});
    
const imageSrc = computed(() => {
  if (imageError.value) {
    return '/images/placeholder.svg';
  }
      
  if (props.destino?.imagen) {
    return props.destino.imagen;
  }
      
  return getDestinoImagePath(props.destino?.nombre);
});
    
const truncatedDescription = computed(() => {
  const text = props.destino?.descripcion || 'Sin descripción disponible';
  const maxLength = 70; // Reducido para evitar desbordamiento
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
});
    
const isDescriptionTruncated = computed(() => {
  const text = props.destino?.descripcion || '';
  return text.length > 70;
});
    
const formattedDistance = computed(() => {
  const distancia = props.destino?.distanciaTierra;
  if (distancia === null || distancia === undefined) return 'Distancia desconocida';
  return new Intl.NumberFormat('es-ES').format(distancia) + ' km';
});
    
const formattedPrice = computed(() => {
  return formatPrice(props.destino?.precio) || 'Precio no disponible';
});
    
const showFullDescription = (event) => {
  event.preventDefault();
  event.stopPropagation();
  showDescriptionModal.value = true;
};
    
const handleImageError = (event) => {
  console.log("Error al cargar la imagen:", event.target.src);
  imageError.value = true;
};
</script>

<style scoped>
.destino-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface, white);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  max-width: 100%;
  cursor: pointer;
}

.destino-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.destino-card:focus {
  outline: 2px solid var(--color-primary, #7209b7);
  outline-offset: 2px;
}

.destino-image {
  position: relative;
  height: 180px;
  width: 100%;
  overflow: hidden;
}

.destino-card:hover .destino-image img {
  transform: scale(1.05);
}

.categoria-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background-color: var(--color-primary, #7209b7);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  z-index: 10;
}

.destino-content {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  flex: 1;
  min-height: 0; /* Importante para que flex funcione correctamente */
}

.destino-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text, #1a1a2e);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.destino-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #4a4a5a);
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  height: 2.8em; /* 2 líneas exactas */
}

.read-more-btn {
  color: var(--color-primary, #7209b7);
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: underline;
  background: none;
  border: none;
  padding: 0;
  margin-left: 0.25rem;
  cursor: pointer;
}

.destino-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  margin-top: auto; /* Empuja hacia abajo */
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  color: var(--color-text-secondary, #9ca3af);
}

.meta-text {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #9ca3af);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.destino-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
  margin-top: auto; /* Empuja hacia abajo */
}

.precio {
  font-weight: 600;
  color: var(--color-primary, #7209b7);
  font-size: 1rem;
}

.rating {
  display: flex;
  align-items: center;
}

.stars {
  display: flex;
}

.star {
  display: inline-flex;
}

.star-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.star-filled {
  color: var(--color-warning, #f59e0b);
}

.star-empty {
  color: var(--color-text-secondary, #9ca3af);
}

.reviews {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #9ca3af);
  margin-left: 0.25rem;
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

@media (max-width: 480px) {
  .destino-meta {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .destino-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .rating {
    width: 100%;
  }
}
</style>
