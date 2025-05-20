<template>
  <section class="hero-section">
    <div v-if="isMounted" class="stars-container">
      <div v-for="i in 100" :key="i" class="star" :style="getRandomStarStyle()"></div>
    </div>
    
    <div class="hero-content">
      <h1 class="hero-title">Explora el Universo</h1>
      <p class="hero-subtitle">Viajes espaciales turísticos al alcance de todos. Descubre destinos fascinantes más allá de la Tierra.</p>
      
      <div class="hero-cta">
        <a href="/destinos" class="btn-primary">Explorar Destinos</a>
        <a href="/naves" class="btn-secondary">Ver Naves</a>
      </div>
      
      <div class="hero-stats">
        <div class="stat">
          <span class="stat-value">15+</span>
          <span class="stat-label">Destinos</span>
        </div>
        <div class="stat">
          <span class="stat-value">10k+</span>
          <span class="stat-label">Viajeros</span>
        </div>
        <div class="stat">
          <span class="stat-value">99%</span>
          <span class="stat-label">Satisfacción</span>
        </div>
      </div>
    </div>
    
    <div class="hero-image">
      <div class="planet"></div>
      <div class="spaceship"></div>
    </div>
    
    <div class="scroll-indicator">
      <span class="scroll-text">Desplázate para descubrir</span>
      <div class="scroll-arrow">↓</div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Variable para controlar si estamos en el cliente
const isMounted = ref(false);

// Función para generar estilos aleatorios para las estrellas
const getRandomStarStyle = () => {
  const size = Math.random() * 3 + 1;
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const animationDelay = Math.random() * 5;
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${animationDelay}s`
  };
};

// Animación de la nave espacial
let spaceshipInterval = null;

onMounted(() => {
  // Indicar que estamos en el cliente
  isMounted.value = true;
  
  // Animar la nave espacial
  const spaceship = document.querySelector('.spaceship');
  if (spaceship) {
    let position = 0;
    let direction = 1;
    
    spaceshipInterval = setInterval(() => {
      position += 0.2 * direction;
      
      if (position > 10) {
        direction = -1;
      } else if (position < -10) {
        direction = 1;
      }
      
      spaceship.style.transform = `translateY(${position}px) rotate(-15deg)`;
    }, 50);
  }
});

onUnmounted(() => {
  // Limpiar el intervalo al desmontar el componente
  if (spaceshipInterval) {
    clearInterval(spaceshipInterval);
  }
});
</script>

<style scoped>
.hero-section {
  position: relative;
  height: 100vh;
  min-height: 600px;
  max-height: 900px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #0a0a14;
  color: #f5f5f7;
}

.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.star {
  position: absolute;
  background-color: #fff;
  border-radius: 50%;
  animation: twinkle 5s infinite alternate;
}

@keyframes twinkle {
  0% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.hero-content {
  position: relative;
  z-index: 3;
  max-width: 700px;
  padding: 0 2rem;
  text-align: center;
  animation: fadeIn 1s ease-out;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #7209b7, #4cc9f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(114, 9, 183, 0.5);
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: #a0a0a7;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-cta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
  align-items: center;
}

.btn-primary {
  background: linear-gradient(90deg, #7209b7, #4cc9f0);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(114, 9, 183, 0.3);
}

.btn-primary::before {
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

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(114, 9, 183, 0.5);
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-secondary {
  background: transparent;
  color: #f5f5f7;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #4cc9f0;
}

.stat-label {
  font-size: 0.875rem;
  color: #a0a0a7;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.planet {
  position: absolute;
  bottom: -150px;
  right: -150px;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4cc9f0, #3a0ca3);
  box-shadow: 0 0 50px rgba(76, 201, 240, 0.3);
  opacity: 0.6;
}

.spaceship {
  position: absolute;
  top: 30%;
  left: 15%;
  width: 60px;
  height: 30px;
  background: linear-gradient(90deg, #f72585, #7209b7);
  clip-path: polygon(0% 50%, 20% 0%, 100% 30%, 100% 70%, 20% 100%);
  transform: rotate(-15deg);
  box-shadow: 0 0 20px rgba(247, 37, 133, 0.5);
}

.scroll-indicator {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  animation: bounce 2s infinite;
  background-color: rgba(10, 10, 20, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(76, 201, 240, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.scroll-text {
  font-size: 0.875rem;
  color: #a0a0a7;
  margin-bottom: 0.25rem;
}

.scroll-arrow {
  font-size: 1.25rem;
  color: #4cc9f0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0) translateX(-50%);
  }
  40% {
    transform: translateY(-10px) translateX(-50%);
  }
  60% {
    transform: translateY(-5px) translateX(-50%);
  }
}

@media (min-width: 768px) {
  .hero-cta {
    flex-direction: row;
    justify-content: center;
  }
  
  .hero-title {
    font-size: 5rem;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
  }
  
  .scroll-indicator {
    bottom: 2rem;
  }
}

@media (max-height: 700px) {
  .scroll-indicator {
    bottom: 0.5rem;
  }
}
</style>
