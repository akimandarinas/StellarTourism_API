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
      <div v-for="destination in limitedDestinations" :key="destination.ID" class="destination-card">
        <div class="destination-image">
          <img
            :src="destination.IMAGEN || '/placeholder.svg?height=300&width=400&query=destino+espacial'"
            :alt="`Imagen de ${destination.NOMBRE}`"
            class="w-full h-full object-cover transition-transform duration-300"
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
          <a :href="`/destinos/${destination.ID}`" class="btn-destino">
            Ver Detalles
            <span class="btn-arrow">→</span>
          </a>
        </div>
      </div>
    </div>
    
    <div class="view-all-link">
      <a href="/destinos" class="btn-outline">Ver Todos los Destinos</a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

// Estado
const destinations = ref([]);
const loading = ref(true);
const error = ref(null);

// Computar solo los primeros 3 destinos
const limitedDestinations = computed(() => {
  return destinations.value.slice(0, 3);
});

// Datos de ejemplo para desarrollo
const mockDestinations = [
  {
    ID: 1,
    NOMBRE: 'Luna',
    DESCRIPCION: 'Nuestro satélite natural, un destino clásico para los viajeros espaciales. Disfruta de vistas impresionantes de la Tierra y experimenta la baja gravedad.',
    TIPO: 'Satélite',
    DURACION_VIAJE: 3,
    PRECIO_BASE: 500000,
    IMAGEN: '/images/luna-base.png'
  },
  {
    ID: 2,
    NOMBRE: 'Marte',
    DESCRIPCION: 'El planeta rojo te espera. Explora sus vastos cañones, montañas y los polos helados en una aventura inolvidable.',
    TIPO: 'Planeta',
    DURACION_VIAJE: 210,
    PRECIO_BASE: 1200000,
    IMAGEN: '/images/marte.png'
  },
  {
    ID: 3,
    NOMBRE: 'Estación Espacial Internacional',
    DESCRIPCION: 'Experimenta la vida en órbita en esta maravilla de la ingeniería humana. Vive como un astronauta profesional.',
    TIPO: 'Estación',
    DURACION_VIAJE: 7,
    PRECIO_BASE: 350000,
    IMAGEN: '/images/international-space-station.png'
  },
  {
    ID: 4,
    NOMBRE: 'Venus',
    DESCRIPCION: 'Visita nuestro observatorio atmosférico en Venus y maravíllate con las vistas de sus densas nubes y atmósfera.',
    TIPO: 'Planeta',
    DURACION_VIAJE: 150,
    PRECIO_BASE: 1800000,
    IMAGEN: '/images/venus-clouds.png'
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
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.destination-card {
  background-color: rgba(26, 26, 46, 0.8);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(114, 9, 183, 0.2);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  position: relative;
}

.destination-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(114, 9, 183, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.destination-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3), 
              0 0 15px rgba(114, 9, 183, 0.3);
}

.destination-card:hover::before {
  opacity: 1;
}

.destination-card:hover img {
  transform: scale(1.1);
}

.destination-image {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.destination-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.destination-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(90deg, #7209b7, #4cc9f0);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(114, 9, 183, 0.3);
}

.destination-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.destination-title {
  font-size: 1.5rem;
  background: linear-gradient(90deg, #f72585, #7209b7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.destination-description {
  color: #a0a0a7;
  margin-bottom: 1rem;
  flex-grow: 1;
  line-height: 1.6;
}

.destination-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #d1d1d8;
}

.meta-icon {
  font-size: 1.2rem;
}

.btn-destino {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: transparent;
  color: #4cc9f0;
  border: 1px solid rgba(76, 201, 240, 0.3);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.btn-destino:hover {
  background: rgba(76, 201, 240, 0.1);
  border-color: rgba(76, 201, 240, 0.6);
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.btn-destino:hover .btn-arrow {
  transform: translateX(5px);
}

.view-all-link {
  text-align: center;
  margin-top: 2rem;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  background: transparent;
  color: #7209b7;
  border: 2px solid #7209b7;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-outline::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
              transparent, 
              rgba(114, 9, 183, 0.2), 
              transparent);
  transition: left 0.7s ease;
}

.btn-outline:hover {
  background: rgba(114, 9, 183, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(114, 9, 183, 0.2);
}

.btn-outline:hover::before {
  left: 100%;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(114, 9, 183, 0.1);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(114, 9, 183, 0.3);
  border-radius: 50%;
  border-top-color: #7209b7;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .destinations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .destinations-grid {
    grid-template-columns: 1fr;
  }
}
</style>
