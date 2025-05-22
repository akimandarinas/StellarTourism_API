<template>
  <div 
    class="nave-card"
    @click="$emit('click')"
  >
    <div class="nave-image-container">
      <OptimizedImage 
        :src="nave.imagenPrincipal" 
        :alt="nave.nombre"
        :fallbackSrc="'/client/public/images/naves/aurora-estelar-cruiser.png'"
        height="200px"
        objectFit="cover"
        class="nave-image"
      />
      <div class="nave-overlay">
        <Badge :variant="tipoBadgeVariant" class="nave-badge">
          {{ nave.tipo }}
        </Badge>
      </div>
    </div>
    
    <div class="nave-content">
      <h3 class="nave-title">{{ nave.nombre }}</h3>
      <p class="nave-manufacturer">{{ nave.fabricante }}</p>
      
      <div class="nave-specs">
        <div class="nave-spec">
          <UsersIcon class="nave-spec-icon" />
          <span>{{ nave.capacidad }} pasajeros</span>
        </div>
        
        <div class="nave-spec">
          <RocketIcon class="nave-spec-icon" />
          <span>{{ formatVelocidad(nave.velocidadMaxima) }}</span>
        </div>
      </div>
      
      <p class="nave-description">{{ descripcionCorta }}</p>
      
      <div class="nave-footer">
        <div class="nave-price">
          <span class="nave-price-label">Desde</span>
          <span class="nave-price-value">{{ formatPrecio(nave.precio) }}</span>
        </div>
        
        <Button variant="outline" size="sm" class="nave-button">
          Ver detalles
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RocketIcon, UsersIcon } from '@/utils/lucide-adapter';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import OptimizedImage from '../ui/OptimizedImage.vue';

const props = defineProps({
  nave: {
    type: Object,
    required: true
  }
});

const tipoBadgeVariant = computed(() => {
  const tipoMap = {
    'crucero': 'primary',
    'transporte': 'secondary',
    'explorador': 'outline',
    'estación': 'default',
    'base móvil': 'destructive'
  };
  
  return tipoMap[props.nave.tipo.toLowerCase()] || 'default';
});

const descripcionCorta = computed(() => {
  if (!props.nave.descripcion) return '';
  return props.nave.descripcion.length > 120 
    ? props.nave.descripcion.substring(0, 120) + '...' 
    : props.nave.descripcion;
});

const formatVelocidad = (velocidad) => {
  return `${velocidad.toLocaleString()} km/h`;
};

const formatPrecio = (precio) => {
  return `$${precio.toLocaleString()}`;
};
</script>

<style scoped>
.nave-card {
  background-color: var(--color-background-card);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nave-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(76, 201, 240, 0.2);
}

.nave-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.nave-card:hover .nave-image-container :deep(.optimized-image) {
  transform: scale(1.05);
}

.nave-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.nave-badge {
  font-size: 0.75rem;
  font-weight: 500;
}

.nave-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.nave-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text-primary);
}

.nave-manufacturer {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.nave-specs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.nave-spec {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.nave-spec-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary);
}

.nave-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.nave-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.nave-price {
  display: flex;
  flex-direction: column;
}

.nave-price-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.nave-price-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary);
}

.nave-button {
  font-size: 0.875rem;
}
</style>
