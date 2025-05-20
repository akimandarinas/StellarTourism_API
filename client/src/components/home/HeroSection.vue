<template>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">Explora el Universo</h1>
      <p class="hero-subtitle">Viajes espaciales al alcance de todos</p>
      <div class="hero-cta">
        <a href="/destinos" class="btn btn-primary">Ver Destinos</a>
        <a href="/naves" class="btn btn-secondary">Nuestras Naves</a>
      </div>
    </div>
    <div class="hero-image">
      <div ref="starsContainer" class="stars"></div>
      <div class="planet"></div>
      <div ref="spaceshipElement" class="spaceship"></div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroSection',
  // Usar refs para acceder a los elementos del DOM
  data() {
    return {
      animationFrame: null,
      isMounted: false
    }
  },
  mounted() {
    this.isMounted = true
    
    // Animación de estrellas
    this.animateStars()
    
    // Animación de nave espacial
    this.animateSpaceship()
  },
  beforeUnmount() {
    // Limpiar animaciones al desmontar
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
  },
  methods: {
    animateStars() {
      // Verificar que estamos en el cliente y el componente está montado
      if (!this.isMounted || !this.$refs.starsContainer) return
      
      const stars = this.$refs.starsContainer
      
      // Crear estrellas dinámicamente
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div')
        star.classList.add('star')
        star.style.top = `${Math.random() * 100}%`
        star.style.left = `${Math.random() * 100}%`
        star.style.animationDelay = `${Math.random() * 5}s`
        stars.appendChild(star)
      }
    },
    
    animateSpaceship() {
      // Verificar que estamos en el cliente y el componente está montado
      if (!this.isMounted || !this.$refs.spaceshipElement) return
      
      const spaceship = this.$refs.spaceshipElement
      
      // Animación simple de la nave
      let position = 0
      const animate = () => {
        position += 0.2
        spaceship.style.transform = `translateX(${Math.sin(position) * 20}px) translateY(${Math.cos(position) * 10}px)`
        this.animationFrame = requestAnimationFrame(animate)
      }
      
      animate()
    }
  }
}
</script>

<style scoped>
.hero-section {
  position: relative;
  height: 80vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #0c0e2b 0%, #1a1b4b 100%);
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
  padding: 2rem;
  max-width: 800px;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #ffffff, #a0a0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 1s ease-out;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  animation: fadeInUp 1s ease-out 0.3s both;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  animation: fadeInUp 1s ease-out 0.6s both;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background-color: white;
  border-radius: 50%;
  animation: twinkle 5s infinite;
}

.planet {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4b6cb7, #182848);
  bottom: -50px;
  right: 10%;
  box-shadow: 0 0 50px rgba(75, 108, 183, 0.5);
}

.spaceship {
  position: absolute;
  width: 100px;
  height: 40px;
  background-image: url('/images/spaceship.svg');
  background-size: contain;
  background-repeat: no-repeat;
  top: 40%;
  left: 20%;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-cta {
    flex-direction: column;
  }
  
  .planet {
    width: 150px;
    height: 150px;
  }
}
</style>
