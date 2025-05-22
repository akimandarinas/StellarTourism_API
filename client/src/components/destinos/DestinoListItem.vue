<template>
  <div 
    class="destino-list-item bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex flex-col md:flex-row">
      <!-- Imagen del destino -->
      <div class="destino-image md:w-1/4">
        <img 
          :src="destino.imagen || '/placeholder.svg?height=200&width=300&query=destino+espacial'" 
          :alt="destino.nombre"
          class="w-full h-48 md:h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <!-- Contenido del destino -->
      <div class="p-4 md:p-6 flex-1 flex flex-col">
        <div class="flex flex-col md:flex-row justify-between">
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ destino.nombre }}</h3>
            
            <div class="flex items-center mb-2">
              <Badge :variant="categoriaBadgeVariant">
                {{ destino.categoria }}
              </Badge>
              
              <div class="ml-4 flex items-center">
                <Rating :value="destino.rating || 0" readonly size="sm" />
                <span class="text-sm text-gray-500 ml-2">
                  ({{ destino.numResenas || 0 }} reseñas)
                </span>
              </div>
            </div>
          </div>
          
          <div class="mt-2 md:mt-0 text-right">
            <div class="text-2xl font-bold text-primary">
              {{ formatPrice(destino.precio) }}
            </div>
            <div class="text-sm text-gray-500">por persona</div>
          </div>
        </div>
        
        <p class="text-gray-600 my-4 line-clamp-2">{{ destino.descripcion }}</p>
        
        <div class="mt-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="flex items-center">
            <RocketIcon class="h-4 w-4 text-gray-500 mr-2" />
            <span class="text-sm">{{ formatearDistancia(destino.distanciaTierra) }}</span>
          </div>
          
          <div class="flex items-center">
            <CalendarIcon class="h-4 w-4 text-gray-500 mr-2" />
            <span class="text-sm">{{ destino.duracion }} días</span>
          </div>
          
          <div class="flex items-center">
            <ThermometerIcon class="h-4 w-4 text-gray-500 mr-2" />
            <span class="text-sm">{{ destino.temperatura }}°C</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RocketIcon, CalendarIcon, ThermometerIcon } from '@/utils/lucide-adapter';
import Badge from '../ui/Badge.vue';
import Rating from '../ui/Rating.vue';
import { formatPrice } from '../../utils/format';
import { formatearDistancia } from '../../utils/formato';

// Props
const props = defineProps({
  destino: {
    type: Object,
    required: true
  }
});

// Emits
defineEmits(['click']);

// Computed
const categoriaBadgeVariant = computed(() => {
  const categoriaMap = {
    'planeta': 'primary',
    'luna': 'info',
    'estacion': 'outline',
    'asteroide': 'warning'
  };
  
  return categoriaMap[props.destino.categoria?.toLowerCase()] || 'default';
});
</script>

<style scoped>
.destino-list-item {
  transition: transform 0.2s;
}

.destino-list-item:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .destino-image {
    height: 200px;
  }
}
</style>
