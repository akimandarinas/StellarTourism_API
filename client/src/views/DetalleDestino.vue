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
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getDestinoById, getDestinosRelacionados } from '../data/destinos-data';
import { 
  RocketIcon, CalendarIcon, StarIcon, ClockIcon, 
  TagIcon, AlertCircleIcon, CheckCircleIcon 
} from '@/utils/lucide-adapter';

export default {
  name: 'DetalleDestinoPage',
  components: {
    RocketIcon,
    CalendarIcon,
    StarIcon,
    ClockIcon,
    TagIcon,
    AlertCircleIcon,
    CheckCircleIcon
  },
  setup() {
    const route = useRoute();
    const destino = ref(null);
    const destinosRelacionados = ref([]);
    const loading = ref(true);

    const descriptionParagraphs = computed(() => {
      if (!destino.value || !destino.value.descripcionLarga) return [];
      return destino.value.descripcionLarga.split('\n\n').map(p => p.trim());
    });

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(price);
    };

    const formatDistance = (distance) => {
      if (distance >= 1000000) {
        return `${(distance / 1000000).toFixed(1)} millones km`;
      } else {
        return `${distance.toLocaleString('es-ES')} km`;
      }
    };

    const formatTipo = (tipo) => {
      const tipos = {
        'orbital': 'Destino Orbital',
        'planetario': 'Destino Planetario',
        'sistema': 'Sistema Planetario'
      };
      return tipos[tipo] || tipo;
    };

    const truncateText = (text, maxLength) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    const cargarDestino = async () => {
      loading.value = true;
      const id = parseInt(route.params.id);
      
      // Simulamos una carga de datos
      await new Promise(resolve => setTimeout(resolve, 300));
      
      destino.value = getDestinoById(id);
      destinosRelacionados.value = getDestinosRelacionados(id);
      
      loading.value = false;
    };

    onMounted(() => {
      cargarDestino();
    });

    return {
      destino,
      destinosRelacionados,
      loading,
      descriptionParagraphs,
      formatPrice,
      formatDistance,
      formatTipo,
      truncateText
    };
  }
};
</script>

<style scoped>
.detalle-destino {
  font-family: 'Inter', system-ui, sans-serif;
  color: #333;
  background-color: #f8f9fa;
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
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
}

.info-card h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #666;
}

.info-card p {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.info-card .price {
  color: #e74c3c;
}

/* Description */
.description {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.description h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #2c3e50;
}

.description-content p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

/* Gallery */
.gallery {
  margin-bottom: 2rem;
}

.gallery h2 {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #2c3e50;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.gallery-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
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
}

.gallery-caption p {
  margin: 0;
  font-size: 0.875rem;
}

/* Características */
.caracteristicas {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.caracteristicas h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #2c3e50;
}

.caracteristicas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.caracteristica-item {
  text-align: center;
}

.caracteristica-item h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #666;
}

.caracteristica-item p {
  margin: 0;
  font-weight: 600;
  color: #2c3e50;
}

/* Actividades */
.actividades {
  margin-bottom: 2rem;
}

.actividades h2 {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #2c3e50;
}

.actividades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.actividad-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.actividad-card h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  color: #2c3e50;
}

.actividad-descripcion {
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.actividad-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

/* Two Columns */
.two-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.precauciones, .requisitos {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.precauciones h2, .requisitos h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #2c3e50;
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
}

.list-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.precauciones .list-icon {
  color: #e74c3c;
}

.requisitos .list-icon {
  color: #2ecc71;
}

/* Reserva */
.reserva {
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  padding: 3rem 2rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 2rem;
}

.reserva h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.reserva p {
  margin-bottom: 2rem;
  font-size: 1.25rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.reserva-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.3s, transform 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background-color: #e74c3c;
  color: white;
}

.btn-primary:hover {
  background-color: #c0392b;
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Destinos relacionados */
.destinos-relacionados {
  margin-bottom: 2rem;
}

.destinos-relacionados h2 {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  color: #2c3e50;
}

.destinos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.destino-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.destino-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.destino-image {
  height: 180px;
}

.destino-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.destino-content {
  padding: 1.5rem;
}

.destino-content h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  color: #2c3e50;
}

.destino-content p {
  margin-bottom: 1.5rem;
  line-height: 1.5;
  color: #666;
}

.destino-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.destino-link:hover {
  background: #2980b9;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
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
