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
            :key="ship.id" 
            class="ship-slide"
          >
            <div class="ship-card">
              <div class="ship-image">
                <img :src="ship.imagen" :alt="ship.nombre" class="ship-img" @error="handleImageError" />
                <div class="ship-badge">{{ ship.tipo }}</div>
              </div>
              <div class="ship-content">
                <h3 class="ship-title">{{ ship.nombre }}</h3>
                <p class="ship-description">{{ truncateText(ship.descripcion, 120) }}</p>
                <div class="ship-specs">
                  <div class="spec-item">
                    <span class="spec-label">Capacidad:</span>
                    <span class="spec-value">{{ ship.capacidad }} pasajeros</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Velocidad:</span>
                    <span class="spec-value">{{ ship.velocidad }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Autonomía:</span>
                    <span class="spec-value">{{ ship.autonomia }}</span>
                  </div>
                </div>
                <a :href="`/naves/${ship.id}`" class="btn-ship">
                  Ver Detalles
                  <span class="btn-arrow">→</span>
                </a>
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
      <a href="/naves" class="btn-outline">Ver Todas las Naves</a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { DEFAULT_FALLBACK_IMAGE } from '../../utils/image-utils';

// Estado
const ships = ref([]);
const loading = ref(true);
const error = ref(null);
const currentSlide = ref(0);
const sliderContainer = ref(null);
const slidesToShow = ref(1);

// Datos de ejemplo para desarrollo con URLs de imágenes actualizadas
const mockShips = [
  {
    id: 1,
    nombre: "Aurora Estelar",
    descripcion: "Nuestra nave insignia, diseñada para viajes interplanetarios de larga duración con todas las comodidades que puedas imaginar.",
    tipo: "Crucero Espacial",
    capacidad: 200,
    velocidad: "30,000 km/h",
    autonomia: "500 días",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aurora-estelar-cruiser-RQ8yt03mV9GFflJm8wrfYK83vB6ImU.png"
  },
  {
    id: 2,
    nombre: "Halcón Lunar",
    descripcion: "Perfecta para viajes cortos a la Luna, esta nave compacta ofrece una experiencia rápida y cómoda para turistas espaciales.",
    tipo: "Transporte",
    capacidad: 50,
    velocidad: "15,000 km/h",
    autonomia: "10 días",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/halcon-lunar-shuttle-QTNlppBIVLAihLCoKfG0xXzkPzD2xa.png"
  },
  {
    id: 3,
    nombre: "Voyager Marciano",
    descripcion: "Especializada en viajes a Marte, esta nave cuenta con sistemas avanzados de soporte vital y entretenimiento para el largo viaje.",
    tipo: "Explorador",
    capacidad: 100,
    velocidad: "25,000 km/h",
    autonomia: "300 días",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/voyager-marciano-cruiser.png-1lRnc8nBmVPVlMp40AuMoMTn0DErpu.jpeg"
  },
  {
    id: 4,
    nombre: "Nexus Orbital",
    descripcion: "Diseñada para órbitas terrestres, ofrece vistas espectaculares de nuestro planeta y la experiencia de ingravidez.",
    tipo: "Orbital",
    capacidad: 30,
    velocidad: "8,000 km/h",
    autonomia: "15 días",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nexus-orbital-station-5RJo0cfI0NUItzyPF6fCwYa04RduiQ.png"
  }
];

// Métodos
const fetchShips = async () => {
  loading.value = true;
  error.value = null;
  
  try {
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

// Función para manejar errores de carga de imágenes
const handleImageError = (event) => {
  console.log("Error al cargar imagen, usando imagen de respaldo");
  event.target.src = DEFAULT_FALLBACK_IMAGE;
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
  border-radius: 16px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
}

.slider-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.ship-slide {
  min-width: 100%;
  padding: 0 1rem;
}

.ship-card {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(15, 15, 26, 0.9));
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(76, 201, 240, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
}

.ship-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(76, 201, 240, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ship-card:hover::before {
  opacity: 1;
}

.ship-image {
  height: 300px;
  position: relative;
  overflow: hidden;
}

.ship-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.ship-card:hover .ship-img {
  transform: scale(1.05);
}

.ship-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(90deg, #4cc9f0, #4361ee);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(76, 201, 240, 0.4);
}

.ship-content {
  padding: 2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.ship-title {
  font-size: 2rem;
  background: linear-gradient(90deg, #4cc9f0, #4361ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  text-shadow: 0 0 15px rgba(76, 201, 240, 0.3);
}

.ship-description {
  color: #a0a0a7;
  margin-bottom: 1.5rem;
  line-height: 1.7;
  font-size: 1.1rem;
}

.ship-specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(76, 201, 240, 0.1);
}

.spec-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.spec-label {
  font-size: 0.9rem;
  color: #a0a0a7;
  margin-bottom: 0.5rem;
}

.spec-value {
  font-weight: 600;
  color: #f5f5f7;
  font-size: 1.1rem;
}

.btn-ship {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(90deg, #4cc9f0, #4361ee);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  align-self: flex-start;
  margin-top: auto;
  box-shadow: 0 4px 15px rgba(76, 201, 240, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-ship::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
              transparent, 
              rgba(255, 255, 255, 0.2), 
              transparent);
  transition: left 0.7s ease;
}

.btn-ship:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(76, 201, 240, 0.5);
}

.btn-ship:hover::before {
  left: 100%;
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.btn-ship:hover .btn-arrow {
  transform: translateX(5px);
}

.slider-arrow {
  background: linear-gradient(135deg, #4cc9f0, #4361ee);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  z-index: 2;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 201, 240, 0.3);
}

.slider-arrow:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(76, 201, 240, 0.5);
}

.slider-arrow:disabled {
  background: linear-gradient(135deg, #a0a0a7, #6e6e78);
  cursor: not-allowed;
  transform: scale(1);
  box-shadow: none;
}

.slider-prev {
  margin-right: 1.5rem;
}

.slider-next {
  margin-left: 1.5rem;
}

.arrow-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.slider-dots {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.slider-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(76, 201, 240, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider-dot.active {
  background: linear-gradient(135deg, #4cc9f0, #4361ee);
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(76, 201, 240, 0.5);
}

.view-all-link {
  text-align: center;
  margin-top: 2rem;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  background: transparent;
  color: #4cc9f0;
  border: 2px solid #4cc9f0;
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
              rgba(76, 201, 240, 0.2), 
              transparent);
  transition: left 0.7s ease;
}

.btn-outline:hover {
  background: rgba(76, 201, 240, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(76, 201, 240, 0.2);
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
  background: rgba(26, 26, 46, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(76, 201, 240, 0.1);
  backdrop-filter: blur(10px);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(76, 201, 240, 0.3);
  border-radius: 50%;
  border-top-color: #4cc9f0;
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
    width: 40px;
    height: 40px;
  }
  
  .ship-title {
    font-size: 1.5rem;
  }
  
  .ship-description {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .ship-specs {
    grid-template-columns: 1fr;
  }
  
  .slider-prev {
    margin-right: 0.5rem;
  }
  
  .slider-next {
    margin-left: 0.5rem;
  }
  
  .ship-content {
    padding: 1.5rem;
  }
}
</style>
