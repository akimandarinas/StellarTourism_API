<template>
  <div class="ships-preview">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando naves...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchShips" class="btn">Reintentar</button>
    </div>
    
    <div v-else class="ships-slider">
      <button 
        class="slider-arrow slider-prev" 
        @click="prevSlide" 
        :disabled="currentSlide === 0"
        aria-label="Nave anterior"
      >
        <span class="arrow-icon">&#10094;</span>
      </button>
      
      <div class="slider-container" ref="sliderContainer">
        <div 
          class="slider-track" 
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
        >
          <div 
            v-for="ship in ships" 
            :key="ship.ID" 
            class="ship-slide"
          >
            <div class="ship-card">
              <div class="ship-image" :style="{ backgroundImage: `url(${ship.IMAGEN || '/placeholder.svg?height=400&width=600'})` }">
                <div class="ship-badge">{{ ship.TIPO }}</div>
              </div>
              <div class="ship-content">
                <h3 class="ship-title">{{ ship.NOMBRE }}</h3>
                <p class="ship-description">{{ truncateText(ship.DESCRIPCION, 120) }}</p>
                <div class="ship-specs">
                  <div class="spec-item">
                    <span class="spec-label">Capacidad:</span>
                    <span class="spec-value">{{ ship.CAPACIDAD }} pasajeros</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Velocidad:</span>
                    <span class="spec-value">{{ ship.VELOCIDAD }} km/s</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Autonomía:</span>
                    <span class="spec-value">{{ ship.AUTONOMIA }} días</span>
                  </div>
                </div>
                <a :href="`/naves/${ship.ID}`" class="btn">Ver Detalles</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        class="slider-arrow slider-next" 
        @click="nextSlide" 
        :disabled="currentSlide >= ships.length - slidesToShow"
        aria-label="Nave siguiente"
      >
        <span class="arrow-icon">&#10095;</span>
      </button>
    </div>
    
    <div class="slider-dots">
      <button 
        v-for="(_, index) in Math.ceil(ships.length / slidesToShow)" 
        :key="index"
        class="slider-dot"
        :class="{ active: Math.floor(currentSlide / slidesToShow) === index }"
        @click="goToSlide(index * slidesToShow)"
        :aria-label="`Ir a la nave ${index + 1}`"
      ></button>
    </div>
    
    <div class="view-all-link">
      <a href="/naves" class="btn btn-outline">Ver Todas las Naves</a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { api } from '../../services/api';
import { AccessibleImage } from '@/accessibility/components';

// Estado
const ships = ref([]);
const loading = ref(true);
const error = ref(null);
const currentSlide = ref(0);
const sliderContainer = ref(null);
const slidesToShow = ref(1);

 
const mockShips = [
  {
    ID: 1,
    NOMBRE: 'Surora Estelar',
    DESCRIPCION: 'Nuestra nave insignia, diseñada para viajes interplanetarios de larga duración con todas las comodidades que puedas imaginar.',
    TIPO: 'Crucero Espacial',
    CAPACIDAD: 200,
    VELOCIDAD: 30,
    AUTONOMIA: 500,
    IMAGEN: '/placeholder.svg?height=400&width=600'
  },
  {
    ID: 2,
    NOMBRE: 'Lunar Shuttle',
    DESCRIPCION: 'Perfecta para viajes cortos a la Luna, esta nave compacta ofrece una experiencia rápida y cómoda para turistas espaciales.',
    TIPO: 'Transporte',
    CAPACIDAD: 50,
    VELOCIDAD: 15,
    AUTONOMIA: 10,
    IMAGEN: '/placeholder.svg?height=400&width=600&text=Lunar+Shuttle'
  },
  {
    ID: 3,
    NOMBRE: 'Red Planet Pioneer',
    DESCRIPCION: 'Especializada en viajes a Marte, esta nave cuenta con sistemas avanzados de soporte vital y entretenimiento para el largo viaje.',
    TIPO: 'Explorador',
    CAPACIDAD: 100,
    VELOCIDAD: 25,
    AUTONOMIA: 300,
    IMAGEN: '/placeholder.svg?height=400&width=600&text=Red+Planet+Pioneer'
  },
  {
    ID: 4,
    NOMBRE: 'Orbital Experience',
    DESCRIPCION: 'Diseñada para órbitas terrestres, ofrece vistas espectaculares de nuestro planeta y la experiencia de ingravidez.',
    TIPO: 'Orbital',
    CAPACIDAD: 30,
    VELOCIDAD: 8,
    AUTONOMIA: 15,
    IMAGEN: '/placeholder.svg?height=400&width=600&text=Orbital+Experience'
  }
];

// Métodos
const fetchShips = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // En un entorno real, esto sería una llamada a la API
    // const data = await api.naves.getAll();
    
    // Simulamos una llamada a la API con un pequeño retraso
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ships.value = mockShips;
  } catch (err) {
    console.error('Error fetching ships:', err);
    error.value = 'No se pudieron cargar las naves. Por favor, inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const updateSlidesToShow = () => {
  if (window.innerWidth >= 1200) {
    slidesToShow.value = 1;
  } else if (window.innerWidth >= 768) {
    slidesToShow.value = 1;
  } else {
    slidesToShow.value = 1;
  }
};

const nextSlide = () => {
  if (currentSlide.value < ships.value.length - slidesToShow.value) {
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

const goToSlide = (index) => {
  currentSlide.value = index;
};

// Ciclo de vida
onMounted(() => {
  fetchShips();
  updateSlidesToShow();
  
  window.addEventListener('resize', updateSlidesToShow);
  
  // Limpiar event listener al desmontar
  return () => {
    window.removeEventListener('resize', updateSlidesToShow);
  };
});

// Vigilar cambios en slidesToShow para ajustar currentSlide si es necesario
watch(slidesToShow, () => {
  if (currentSlide.value > ships.value.length - slidesToShow.value) {
    currentSlide.value = Math.max(0, ships.value.length - slidesToShow.value);
  }
});
</script>

<style scoped>
.ships-preview {
  width: 100%;
  position: relative;
}

.ships-slider {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.slider-container {
  width: 100%;
  overflow: hidden;
}

.slider-track {
  display: flex;
  transition: transform 0.5s ease;
}

.ship-slide {
  min-width: 100%;
  padding: 0 1rem;
}

.ship-card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-md);
}

.ship-image {
  height: 250px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.ship-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: var(--color-secondary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
}

.ship-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.ship-title {
  font-size: 1.8rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.ship-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.ship-specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.spec-item {
  display: flex;
  flex-direction: column;
}

.spec-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.spec-value {
  font-weight: 600;
}

.slider-arrow {
  background-color: var(--color-primary);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  z-index: 2;
  transition: background-color 0.3s ease;
}

.slider-arrow:hover {
  background-color: var(--color-primary-dark);
}

.slider-arrow:disabled {
  background-color: var(--color-text-muted);
  cursor: not-allowed;
}

.slider-prev {
  margin-right: 1rem;
}

.slider-next {
  margin-left: 1rem;
}

.arrow-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.slider-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.slider-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-text-muted);
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.slider-dot.active {
  background-color: var(--color-primary);
}

.view-all-link {
  text-align: center;
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
  .ship-specs {
    grid-template-columns: 1fr 1fr;
  }
  
  .slider-arrow {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 576px) {
  .ship-specs {
    grid-template-columns: 1fr;
  }
}
</style>
