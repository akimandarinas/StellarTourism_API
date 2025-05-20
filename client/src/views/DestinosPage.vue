<template>
  <div class="destinos-page">
    <section class="hero">
      <div class="stars-overlay"></div>
      <div class="hero-content">
        <h1 class="glow-text">Destinos Espaciales</h1>
        <p>Explora los destinos más fascinantes del Sistema Solar</p>
      </div>
    </section>

    <section class="destinos-grid">
      <div 
        v-for="destino in destinos" 
        :key="destino.id"
        class="destino-card"
      >
        <div class="destino-image">
          <img :src="destino.imagen" :alt="destino.nombre" />
          <div class="destino-badge">{{ getBadgeText(destino.id) }}</div>
        </div>
        <div class="destino-content">
          <h2>{{ destino.nombre }}</h2>
          <p class="destino-subtitle">{{ destino.subtitulo }}</p>
          <div class="destino-meta">
            <div class="destino-rating">
              <span class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= Math.round(destino.puntuacion) }">★</span>
              </span>
              <span class="rating-value">{{ destino.puntuacion.toFixed(1) }}</span>
            </div>
            <div class="destino-price">{{ formatPrice(destino.precio) }}</div>
          </div>
          <p class="destino-description">{{ truncateText(destino.descripcion, 120) }}</p>
          <a :href="`/destinos/${destino.id}`" class="destino-link">
            <span>Ver detalles</span>
            <span class="arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

// Datos de ejemplo para los destinos
const destinosData = [
  {
    id: 1,
    nombre: "Luna - Base Artemisa",
    subtitulo: "Primera colonia humana permanente",
    descripcion: "Visita la primera colonia humana permanente en la Luna y experimenta la vida en gravedad reducida con vistas impresionantes de la Tierra.",
    imagen: "/images/luna-base.png",
    precio: 1200000,
    puntuacion: 4.8
  },
  {
    id: 2,
    nombre: "Marte - Colonia Olympus",
    subtitulo: "Aventura en el planeta rojo",
    descripcion: "Experimenta la vida en el planeta rojo en la colonia más grande de Marte, situada cerca del imponente Monte Olympus.",
    imagen: "/images/marte.png",
    precio: 3500000,
    puntuacion: 4.5
  },
  {
    id: 3,
    nombre: "Estación Espacial Internacional",
    subtitulo: "El clásico del turismo espacial",
    descripcion: "Alójate en la legendaria estación que inició la era del turismo espacial y disfruta de vistas incomparables de nuestro planeta.",
    imagen: "/images/estacion-orbital.png",
    precio: 850000,
    puntuacion: 4.7
  },
  {
    id: 4,
    nombre: "Venus - Observatorio Atmosférico",
    subtitulo: "Ciencia en las nubes de Venus",
    descripcion: "Observa el planeta más caliente del sistema solar desde una estación orbital segura y estudia su fascinante atmósfera.",
    imagen: "/images/venus-clouds.png",
    precio: 1800000,
    puntuacion: 4.2
  },
  {
    id: 5,
    nombre: "Júpiter - Crucero de las Lunas",
    subtitulo: "Expedición a las lunas galileanas",
    descripcion: "Visita las lunas más fascinantes del gigante gaseoso: Europa, Ganímedes, Calisto e Ío en un crucero espacial de lujo.",
    imagen: "/images/jupiter-moons.png",
    precio: 4200000,
    puntuacion: 4.9
  },
  {
    id: 6,
    nombre: "Saturno - Anillos Majestuosos",
    subtitulo: "La joya del Sistema Solar",
    descripcion: "Contempla los espectaculares anillos de Saturno y visita Titán, su luna más grande con lagos de metano líquido.",
    imagen: "/images/saturn-rings.png",
    precio: 5100000,
    puntuacion: 4.8
  }
];

export default {
  name: "DestinosPage",
  setup() {
    const destinos = ref([]);

    const cargarDestinos = async () => {
      // Simulamos una carga de datos
      await new Promise(resolve => setTimeout(resolve, 300));
      destinos.value = destinosData;
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(price);
    };

    const truncateText = (text, maxLength) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    const getBadgeText = (id) => {
      const badges = {
        1: "Popular",
        2: "Aventura",
        3: "Clásico",
        4: "Científico",
        5: "Expedición",
        6: "Premium"
      };
      return badges[id] || "Destacado";
    };

    onMounted(() => {
      cargarDestinos();
    });

    return {
      destinos,
      formatPrice,
      truncateText,
      getBadgeText
    };
  }
}
</script>

<style scoped>
.destinos-page {
  font-family: 'Inter', system-ui, sans-serif;
  color: #e1e1e6;
  background-color: #0f0f1a;
  min-height: 100vh;
}

.hero {
  background-image: url('/images/stars-bg.png');
  background-size: cover;
  background-position: center;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.stars-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(15, 15, 26, 0.7) 0%, rgba(15, 15, 26, 0.9) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 1rem;
  animation: fadeIn 1.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.glow-text {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(120, 120, 255, 0.3);
}

.hero p {
  font-size: 1.25rem;
  margin: 0;
  opacity: 0.9;
}

.destinos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

.destino-card {
  background: #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
              box-shadow 0.4s ease;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.destino-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(78, 78, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
}

.destino-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.destino-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.destino-card:hover .destino-image img {
  transform: scale(1.08);
}

.destino-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(78, 78, 255, 0.8);
  color: white;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  transition: transform 0.3s ease, background 0.3s ease;
}

.destino-card:hover .destino-badge {
  transform: translateY(-2px);
  background: rgba(78, 78, 255, 0.9);
}

.destino-content {
  padding: 1.75rem;
}

.destino-content h2 {
  margin-top: 0;
  margin-bottom: 0.25rem;
  font-size: 1.5rem;
  color: #ffffff;
  font-weight: 700;
}

.destino-subtitle {
  color: #a0a0b8;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.destino-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.destino-rating {
  display: flex;
  align-items: center;
}

.stars {
  display: inline-flex;
  margin-right: 0.5rem;
}

.star {
  color: #4a4a6a;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.star.filled {
  color: #ffcb45;
}

.destino-card:hover .star.filled {
  color: #ffd700;
}

.rating-value {
  font-weight: bold;
  color: #d0d0e0;
}

.destino-price {
  font-weight: 700;
  color: #7e7eff;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.destino-card:hover .destino-price {
  color: #9e9eff;
}

.destino-description {
  margin-bottom: 1.75rem;
  line-height: 1.6;
  color: #b0b0c0;
  font-size: 0.95rem;
}

.destino-link {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #4e4eff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(78, 78, 255, 0.3);
}

.destino-link .arrow {
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.destino-link:hover {
  background: #6060ff;
  box-shadow: 0 6px 15px rgba(78, 78, 255, 0.4);
}

.destino-link:hover .arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .destinos-grid {
    grid-template-columns: 1fr;
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero p {
    font-size: 1rem;
  }
  
  .destino-content h2 {
    font-size: 1.25rem;
  }
}
</style>
