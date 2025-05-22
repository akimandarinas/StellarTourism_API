<template>
  <div v-if="destino" class="detalle-destino">
    <!-- Hero Section -->
    <section class="hero-section" :style="{ backgroundImage: `url(${destino.imagenPanoramica || '/images/placeholder.svg?height=600&width=1600&query=espacio+' + encodeURIComponent(destino.nombre)})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>{{ destino.nombre }}</h1>
        <p>{{ destino.subtitulo }}</p>
        <div class="hero-meta">
          <div class="meta-item">
            <RocketIcon class="meta-icon" />
            <span>{{ formatDistance(destino.distancia) }}</span>
          </div>
          <div class="meta-item">
            <CalendarIcon class="meta-icon" />
            <span>{{ destino.duracion }} días</span>
          </div>
          <div class="meta-item">
            <StarIcon class="meta-icon" />
            <span>{{ destino.puntuacion.toFixed(1) }} ({{ destino.numResenas }} reseñas)</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="content-container">
      <!-- Quick Info -->
      <section class="quick-info">
        <div class="info-card">
          <h3>Precio</h3>
          <p class="price">{{ formatPrice(destino.precio) }}</p>
        </div>
        <div class="info-card">
          <h3>Duración</h3>
          <p>{{ destino.duracion }} días</p>
        </div>
        <div class="info-card">
          <h3>Distancia</h3>
          <p>{{ formatDistance(destino.distancia) }}</p>
        </div>
        <div class="info-card">
          <h3>Tipo</h3>
          <p>{{ formatTipo(destino.tipo) }}</p>
        </div>
      </section>

      <!-- Description -->
      <section class="description">
        <h2>Sobre este destino</h2>
        <div class="description-content">
          <p v-for="(paragraph, index) in descriptionParagraphs" :key="index">
            {{ paragraph }}
          </p>
        </div>
      </section>

      <!-- Gallery -->
      <section class="gallery">
        <h2>Galería</h2>
        <div class="gallery-grid">
          <div v-for="(image, index) in destino.galeria" :key="index" class="gallery-item">
            <img :src="image.url" :alt="image.titulo" />
            <div class="gallery-caption">
              <h4>{{ image.titulo }}</h4>
              <p>{{ image.descripcion }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Características -->
      <section class="caracteristicas">
        <h2>Características técnicas</h2>
        <div class="caracteristicas-grid">
          <div v-for="(caracteristica, index) in destino.caracteristicas" :key="index" class="caracteristica-item">
            <h4>{{ caracteristica.nombre }}</h4>
            <p>{{ caracteristica.valor }}</p>
          </div>
        </div>
      </section>

      <!-- Actividades -->
      <section class="actividades">
        <h2>Actividades disponibles</h2>
        <div class="actividades-grid">
          <div v-for="(actividad, index) in destino.actividades" :key="index" class="actividad-card">
            <h3>{{ actividad.nombre }}</h3>
            <p class="actividad-descripcion">{{ actividad.descripcion }}</p>
            <div class="actividad-meta">
              <div class="meta-item">
                <ClockIcon class="meta-icon" />
                <span>{{ actividad.duracion }}</span>
              </div>
              <div class="meta-item">
                <TagIcon class="meta-icon" />
                <span>{{ formatPrice(actividad.precio) }}</span>
              </div>
              <div class="meta-item">
                <span>Dificultad: {{ actividad.dificultad }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Precauciones y Requisitos -->
      <div class="two-columns">
        <section class="precauciones">
          <h2>Precauciones</h2>
          <ul class="list-items">
            <li v-for="(precaucion, index) in destino.precauciones" :key="index">
              <AlertCircleIcon class="list-icon" />
              <span>{{ precaucion }}</span>
            </li>
          </ul>
        </section>

        <section class="requisitos">
          <h2>Requisitos</h2>
          <ul class="list-items">
            <li v-for="(requisito, index) in destino.requisitos" :key="index">
              <CheckCircleIcon class="list-icon" />
              <span>{{ requisito }}</span>
            </li>
          </ul>
        </section>
      </div>

      <!-- Reserva -->
      <section class="reserva">
        <h2>¿Listo para la aventura?</h2>
        <p>Reserva ahora tu viaje a {{ destino.nombre }} y prepárate para una experiencia inolvidable.</p>
        <div class="reserva-actions">
          <a href="#" class="btn btn-primary">Reservar ahora</a>
          <a href="#" class="btn btn-secondary">Añadir a favoritos</a>
        </div>
      </section>

      <!-- Destinos relacionados -->
      <section class="destinos-relacionados">
        <h2>Destinos relacionados</h2>
        <div class="destinos-grid">
          <div v-for="relacionado in destinosRelacionados" :key="relacionado.id" class="destino-card">
            <div class="destino-image">
              <img :src="relacionado.imagen" :alt="relacionado.nombre" />
            </div>
            <div class="destino-content">
              <h3>{{ relacionado.nombre }}</h3>
              <p>{{ truncateText(relacionado.descripcion, 100) }}</p>
              <a :href="`/destinos/${relacionado.id}`" class="destino-link">Ver detalles</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
  <div v-else class="loading-container">
    <div class="loading-spinner"></div>
    <p>Cargando información del destino...</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
  props: {
    destinoId: {
      type: [String, Number],
      default: null
    },
    RocketIcon: {
      type: Object,
      required: true
    },
    CalendarIcon: {
      type: Object,
      required: true
    },
    StarIcon: {
      type: Object,
      required: true
    },
    ClockIcon: {
      type: Object,
      required: true
    },
    TagIcon: {
      type: Object,
      required: true
    },
    AlertCircleIcon: {
      type: Object,
      required: true
    },
    CheckCircleIcon: {
      type: Object,
      required: true
    },
  },
  setup(props) {
    const destino = ref(null);
    const route = useRoute();

    onMounted(async () => {
      try {
        const response = await fetch(`http://localhost:3000/destinos/${props.destinoId || route.params.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        destino.value = await response.json();
      } catch (error) {
        console.error("Could not fetch destino:", error);
      }
    });

    return {
      destino,
    };
  },
};
</script>

<style scoped>
.detalle-destino {
  font-family: 'Inter', system-ui, sans-serif;
  color: #e0e0e0;
  background-color: #0f0f1a;
}

/* Hero Section */
.hero-section {
  height: 500px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  padding: 0 1rem;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  color: #ffffff;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6;
  }
  to {
    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0073e6, 0 0 40px #0073e6;
  }
}

.hero-content p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.hero-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #4dabf7;
}

/* Content Container */
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Quick Info */
.quick-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: -3rem;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
}

.info-card {
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 115, 230, 0.2);
}

.info-card h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #a0a0a0;
}

.info-card p {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
}

.info-card .price {
  color: #ff6b6b;
}

/* Description */
.description {
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.2);
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.description h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #ffffff;
  position: relative;
  padding-bottom: 0.5rem;
}

.description h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4dabf7, #228be6);
  border-radius: 3px;
}

.description-content p {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #d0d0d0;
}

/* Gallery */
.gallery {
  margin-bottom: 2rem;
}

.gallery h2 {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #ffffff;
  position: relative;
  padding-bottom: 0.5rem;
}

.gallery h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4dabf7, #228be6);
  border-radius: 3px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0,0,0,0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 115, 230, 0.3);
}

.gallery-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 1rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-caption {
  transform: translateY(0);
}

.gallery-caption h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #ffffff;
}

.gallery-caption p {
  margin: 0;
  font-size: 0.875rem;
  color: #d0d0d0;
}

/* Características */
.caracteristicas {
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.2);
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.caracteristicas h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #ffffff;
  position: relative;
  padding-bottom: 0.5rem;
}

.caracteristicas h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4dabf7, #228be6);
  border-radius: 3px;
}

.caracteristicas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.caracteristica-item {
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease, background 0.3s ease;
}

.caracteristica-item:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.1);
}

.caracteristica-item h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #a0a0a0;
}

.caracteristica-item p {
  margin: 0;
  font-weight: 600;
  color: #ffffff;
}

/* Actividades */
.actividades {
  margin-bottom: 2rem;
}

.actividades h2 {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #ffffff;
  position: relative;
  padding-bottom: 0.5rem;
}

.actividades h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4dabf7, #228be6);
  border-radius: 3px;
}

.actividades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.actividad-card {
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.actividad-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 115, 230, 0.2);
}

.actividad-card h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  color: #ffffff;
}

.actividad-descripcion {
  margin-bottom: 1.5rem;
  line-height: 1.5;
  color: #d0d0d0;
}

.actividad-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 6px;
}

/* Two Columns */
.two-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.precauciones, .requisitos {
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.precauciones h2, .requisitos h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #ffffff;
  position: relative;
  padding-bottom: 0.5rem;
}

.precauciones h2::after, .requisitos h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4dabf7, #228be6);
  border-radius: 3px;
}

.list-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-items li {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease, background 0.3s ease;
}

.list-items li:hover {
  transform: translateX(5px);
  background: rgba(255, 255, 255, 0.1);
}

.list-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.precauciones .list-icon {
  color: #ff6b6b;
}

.requisitos .list-icon {
  color: #51cf66;
}

/* Reserva */
.reserva {
  background: linear-gradient(135deg, #1971c2, #0c2461);
  color: white;
  padding: 3rem 2rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.reserva::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/images/stars-bg.png') repeat;
  opacity: 0.2;
  z-index: 0;
}

.reserva h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 2rem;
  position: relative;
  z-index: 1;
}

.reserva p {
  margin-bottom: 2rem;
  font-size: 1.25rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
}

.reserva-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.btn:hover {
  transform: translateY(-3px);
}

.btn:hover::after {
  transform: translateX(0);
}

.btn-primary {
  background-color: #e74c3c;
  color: white;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
}

.btn-primary:hover {
  background-color: #c0392b;
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.6);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Destinos relacionados */
.destinos-relacionados {
  margin-bottom: 2rem;
}

.destinos-relacionados h2 {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #ffffff;
  position: relative;
  padding-bottom: 0.5rem;
}

.destinos-relacionados h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4dabf7, #228be6);
  border-radius: 3px;
}

.destinos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.destino-card {
  background: #1a1a2e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0,0,0,0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.destino-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 15px 30px rgba(0, 115, 230, 0.3);
}

.destino-image {
  height: 180px;
  overflow: hidden;
}

.destino-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.destino-card:hover .destino-image img {
  transform: scale(1.1);
}

.destino-content {
  padding: 1.5rem;
}

.destino-content h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  color: #ffffff;
}

.destino-content p {
  margin-bottom: 1.5rem;
  line-height: 1.5;
  color: #a0a0a0;
}

.destino-link {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #1971c2;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.destino-link::after {
  content: '→';
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.destino-link:hover {
  background: #1864ab;
}

.destino-link:hover::after {
  transform: translateX(3px);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background-color: #0f0f1a;
  color: #ffffff;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-top: 5px solid #4dabf7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  box-shadow: 0 0 15px rgba(77, 171, 247, 0.5);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-content p {
    font-size: 1.25rem;
  }
  
  .hero-meta {
    flex-direction: column;
    gap: 1rem;
  }
  
  .quick-info {
    margin-top: -2rem;
  }
  
  .two-columns {
    grid-template-columns: 1fr;
  }
  
  .reserva-actions {
    flex-direction: column;
  }
}
</style>
