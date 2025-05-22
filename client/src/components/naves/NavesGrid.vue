<template>
  <div class="naves-grid-container">
    <div class="naves-grid">
      <div v-for="nave in naves" :key="nave.id" class="nave-card">
        <div class="nave-image-container">
          <img 
            :src="nave.imagen" 
            :alt="nave.nombre" 
            class="nave-image" 
            loading="lazy"
            @error="handleImageError" 
          />
        </div>
        <div class="nave-content">
          <h3 class="nave-title">{{ nave.nombre }}</h3>
          <div class="nave-badges">
            <span class="nave-badge">{{ nave.tipo }}</span>
            <span class="nave-badge">{{ nave.capacidad }} pasajeros</span>
          </div>
          <p class="nave-description">{{ nave.descripcion }}</p>
          <div class="nave-specs">
            <div class="nave-spec">
              <span class="spec-label">Velocidad</span>
              <span class="spec-value">{{ nave.velocidad }}</span>
            </div>
            <div class="nave-spec">
              <span class="spec-label">Autonomía</span>
              <span class="spec-value">{{ nave.autonomia }}</span>
            </div>
          </div>
          <a :href="`/naves/${nave.id}`" class="nave-button">
            Ver Detalles
            <span class="button-arrow">→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// URL de imagen de respaldo
const fallbackImageUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aurora-estelar-cruiser-RQ8yt03mV9GFflJm8wrfYK83vB6ImU.png";

// Datos de ejemplo para las naves con imágenes únicas
const naves = [
  {
    id: 1,
    nombre: "Aurora Estelar",
    tipo: "Crucero Orbital",
    capacidad: 120,
    velocidad: "28,000 km/h",
    autonomia: "30 días",
    descripcion: "Crucero de lujo diseñado para viajes orbitales alrededor de la Tierra y la Luna, con amplias vistas panorámicas y comodidades de primera clase.",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aurora-estelar-cruiser-RQ8yt03mV9GFflJm8wrfYK83vB6ImU.png"
  },
  {
    id: 2,
    nombre: "Halcón Lunar",
    tipo: "Lanzadera Lunar",
    capacidad: 8,
    velocidad: "40,000 km/h",
    autonomia: "14 días",
    descripcion: "Nave compacta y veloz especializada en viajes Tierra-Luna, ideal para expediciones cortas a la superficie lunar.",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/halcon-lunar-shuttle-QTNlppBIVLAihLCoKfG0xXzkPzD2xa.png"
  },
  {
    id: 3,
    nombre: "Voyager Marciano",
    tipo: "Crucero Interplanetario",
    capacidad: 80,
    velocidad: "120,000 km/h",
    autonomia: "180 días",
    descripcion: "Nave de largo alcance equipada para viajes a Marte, con sistemas de gravedad artificial y módulos de hibernación para los pasajeros.",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/voyager-marciano-cruiser.png-1lRnc8nBmVPVlMp40AuMoMTn0DErpu.jpeg"
  },
  {
    id: 4,
    nombre: "Estación Orbital Nexus",
    tipo: "Estación Espacial",
    capacidad: 250,
    velocidad: "27,600 km/h",
    autonomia: "Permanente",
    descripcion: "Estación espacial de última generación que sirve como punto de partida para expediciones más largas y como destino turístico por sí misma.",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nexus-orbital-station-5RJo0cfI0NUItzyPF6fCwYa04RduiQ.png"
  },
  {
    id: 5,
    nombre: "Explorador Solar",
    tipo: "Nave de Investigación",
    capacidad: 15,
    velocidad: "150,000 km/h",
    autonomia: "90 días",
    descripcion: "Nave científica que permite a los turistas participar en expediciones de investigación solar con equipamiento de observación avanzado.",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/solar-explorer-research-T31AK5CsKfqxRlxZo9uHODArM3ZrGQ.png"
  },
  {
    id: 6,
    nombre: "Artemisa Lunar",
    tipo: "Base Lunar Móvil",
    capacidad: 30,
    velocidad: "5,000 km/h",
    autonomia: "60 días",
    descripcion: "Base móvil que permite explorar diferentes regiones de la Luna, equipada con vehículos de superficie y módulos habitacionales.",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/artemisa-lunar-base.png-yinGoQ8HIqYQ3U9FfA2B8ZlER5CH6n.webp"
  },
  {
    id: 7,
    nombre: "Crucero Estelar",
    tipo: "Crucero de Lujo",
    capacidad: 60,
    velocidad: "25,000 km/h",
    autonomia: "90 días",
    descripcion: "Nave de lujo exclusiva para viajes de placer con todas las comodidades imaginables y un diseño elegante de primera clase.",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eea7728b-18e0-4b08-8e12-128b50fbe0e2-xZASfQCe9tuHSpxcGQOGI1aNj05qsP.png"
  },
  {
    id: 8,
    nombre: "Defensor Espacial",
    tipo: "Nave de Escolta",
    capacidad: 25,
    velocidad: "50,000 km/h",
    autonomia: "120 días",
    descripcion: "Nave de escolta que proporciona seguridad adicional para nuestras rutas más aventuradas con sistemas de detección avanzados.",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8778798-fRteSwuh3yAfsk85nOtVyq3lwjJreq.png"
  },
  {
    id: 9,
    nombre: "Estación Comercial Nexus",
    tipo: "Estación Comercial",
    capacidad: 800,
    velocidad: "5,000 km/h",
    autonomia: "10 años",
    descripcion: "Centro de negocios y entretenimiento flotante para transacciones comerciales, compras duty-free y experiencias de vida en el espacio.",
    imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bb155376-b4ec-492e-b057-614eedacff24-6vMOPBQJ7xYEu9TLIf75qX4WPfPipq.png"
  }
];

// Función para manejar errores de carga de imágenes
const handleImageError = (event) => {
  console.log("Error al cargar imagen, usando imagen de respaldo");
  // Usar una imagen de respaldo genérica
  event.target.src = fallbackImageUrl;
};
</script>

<style scoped>
.naves-grid-container {
  width: 100%;
}

.naves-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.nave-card {
  background-color: #1a1a2e;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(124, 58, 237, 0.1);
}

.nave-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 30px rgba(124, 58, 237, 0.3);
}

.nave-image-container {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.nave-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.nave-card:hover .nave-image {
  transform: scale(1.1);
}

.nave-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.nave-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #f3f4f6;
  background: linear-gradient(to right, #a78bfa, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nave-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.nave-badge {
  background-color: rgba(124, 58, 237, 0.2);
  color: #a78bfa;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.nave-description {
  color: #9ca3af;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.nave-specs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.nave-spec {
  display: flex;
  flex-direction: column;
}

.spec-label {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.25rem;
}

.spec-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e5e7eb;
}

.nave-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #7c3aed, #6d28d9);
  color: white;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  align-self: flex-start;
}

.nave-button:hover {
  background: linear-gradient(to right, #8b5cf6, #7c3aed);
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.5);
}

.button-arrow {
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.nave-button:hover .button-arrow {
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .naves-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .naves-grid {
    grid-template-columns: 1fr;
  }
  
  .nave-image-container {
    height: 180px;
  }
  
  .nave-content {
    padding: 1.25rem;
  }
  
  .nave-title {
    font-size: 1.25rem;
  }
}
</style>
