<template>
  <div class="destinations-preview">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando destinos...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchDestinations" class="btn">Reintentar</button>
    </div>
    
    <div v-else class="destinations-grid">
      <div v-for="destination in destinations" :key="destination.ID" class="destination-card">
        <div class="destination-image">
          <AccessibleImage
            :src="destination.IMAGEN || '/placeholder.svg?height=300&width=400&query=destino+espacial'"
            :alt="`Imagen de ${destination.NOMBRE}`"
            :sizes="{
              1200: '25vw',
              768: '50vw',
              0: '100vw'
            }"
            class="w-full h-full"
            image-class="object-cover transition-transform duration-300"
          />
          <div class="destination-badge">{{ destination.TIPO }}</div>
        </div>
        <div class="destination-content">
          <h3 class="destination-title">{{ destination.NOMBRE }}</h3>
          <p class="destination-description">{{ truncateText(destination.DESCRIPCION, 100) }}</p>
          <div class="destination-meta">
            <div class="meta-item">
              <span class="meta-icon">🚀</span>
              <span>{{ destination.DURACION_VIAJE }} días</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">💰</span>
              <span>{{ formatPrice(destination.PRECIO_BASE) }}</span>
            </div>
          </div>
          <a :href="`/destinos/${destination.ID}`" class="btn btn-sm">Ver Detalles</a>
        </div>
      </div>
    </div>
    
    <div class="view-all-link">
      <a href="/destinos" class="btn btn-outline">Ver Todos los Destinos</a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import { AccessibleImage } from '@/accessibility/components';

// Estado
const destinations = ref([]);
const loading = ref(true);
const error = ref(null);

// Datos de ejemplo para desarrollo
const mockDestinations = [
  {
    ID: 1,
    NOMBRE: 'Luna',
    DESCRIPCION: 'Nuestro satélite natural, un destino clásico para los viajeros espaciales. Disfruta de vistas impresionantes de la Tierra y experimenta la baja gravedad.',
    TIPO: 'Satélite',
    DURACION_VIAJE: 3,
    PRECIO_BASE: 500000,
    IMAGEN: '/placeholder.svg?height=300&width=400&query=Luna'
  },
  {
    ID: 2,
    NOMBRE: 'Marte',
    DESCRIPCION: 'El planeta rojo te espera. Explora sus vastos cañones, montañas y los polos helados en una aventura inolvidable.',
    TIPO: 'Planeta',
    DURACION_VIAJE: 210,
    PRECIO_BASE: 1200000,
    IMAGEN: '/placeholder.svg?height=300&width=400&query=Marte'
  },
  {
    ID: 3,
    NOMBRE: 'Estación Espacial Internacional',
    DESCRIPCION: 'Experimenta la vida en órbita en esta maravilla de la ingeniería humana. Vive como un astronauta profesional.',
    TIPO: 'Estación',
    DURACION_VIAJE: 7,
    PRECIO_BASE: 350000,
    IMAGEN: '/placeholder.svg?height=300&width=400&query=ISS'
  },
  {
    ID: 4,
    NOMBRE: 'Europa (Luna de Júpiter)',
    DESCRIPCION: 'Visita uno de los lugares más prometedores para encontrar vida extraterrestre. Su océano subterráneo guarda muchos secretos.',
    TIPO: 'Luna',
    DURACION_VIAJE: 365,
    PRECIO_BASE: 2500000,
    IMAGEN: '/placeholder.svg?height=300&width=400&query=Europa'
  }
];

// Métodos
const fetchDestinations = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // En un entorno real, esto sería una llamada a la API
    // const data = await api.destinos.getAll();
    
    // Simulamos una llamada a la API con un pequeño retraso
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    destinations.value = mockDestinations;
  } catch (err) {
    console.error('Error fetching destinations:', err);
    error.value = 'No se pudieron cargar los destinos. Por favor, inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

// Ciclo de vida
onMounted(() => {
  fetchDestinations();
});
</script>

<style scoped>
.destinations-preview {
  width: 100%;
}

.destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.destination-card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.destination-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.destination-card:hover :deep(img) {
  transform: scale(1.05);
}

.destination-image {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.destination-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: var(--color-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 10;
}

.destination-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.destination-title {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.destination-description {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  flex-grow: 1;
}

.destination-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.meta-icon {
  font-size: 1.2rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  align-self: flex-start;
}

.view-all-link {
  text-align: center;
  margin-top: 2rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 180, 216, 0.3);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .destinations-grid {
    grid-template-columns: 1fr;
  }
}
</style>
