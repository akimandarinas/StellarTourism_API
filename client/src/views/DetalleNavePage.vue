<template>
  <div v-if="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Cargando información de la nave...</p>
  </div>
  
  <div v-else-if="error" class="error-container">
    <div class="error-message">
      <p>{{ error }}</p>
    </div>
    <div class="mt-8">
      <a href="/naves" class="btn-primary">
        Volver a naves
      </a>
    </div>
  </div>
  
  <div v-else-if="nave" class="nave-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-image-container">
        <img 
          :src="nave.imagenPrincipal || '/placeholder.svg?height=600&width=1600&query=nave+espacial'" 
          :alt="nave.nombre"
          class="hero-image"
        />
        <div class="hero-overlay">
          <div class="container">
            <div class="hero-content">
              <div class="badge" :class="badgeClass">
                {{ nave.tipo }}
              </div>
              <h1 class="hero-title">{{ nave.nombre }}</h1>
              <p class="hero-subtitle">{{ nave.fabricante }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Main Content -->
    <div class="container content-container">
      <!-- Breadcrumbs -->
      <div class="breadcrumb">
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><span>/</span></li>
          <li><a href="/naves">Naves</a></li>
          <li><span>/</span></li>
          <li><span>{{ nave.nombre }}</span></li>
        </ul>
      </div>
      
      <!-- Información principal y modelo 3D -->
      <div class="info-grid">
        <!-- Información principal -->
        <div class="info-card">
          <div class="card-content">
            <!-- Características principales -->
            <div class="features-grid">
              <div class="feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
                <div>
                  <div class="feature-label">Velocidad máxima</div>
                  <div class="feature-value">{{ nave.velocidadMaxima }} km/s</div>
                </div>
              </div>
              
              <div class="feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <div>
                  <div class="feature-label">Capacidad</div>
                  <div class="feature-value">{{ nave.capacidad }} pasajeros</div>
                </div>
              </div>
              
              <div class="feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                <div>
                  <div class="feature-label">Tipo de propulsión</div>
                  <div class="feature-value">{{ nave.tipoPropulsion }}</div>
                </div>
              </div>
              
              <div class="feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <div>
                  <div class="feature-label">Año de fabricación</div>
                  <div class="feature-value">{{ nave.anoFabricacion }}</div>
                </div>
              </div>
            </div>
            
            <!-- Descripción -->
            <div class="description-section">
              <h2 class="section-title">Descripción</h2>
              <div class="description-content">
                <p>{{ nave.descripcion }}</p>
              </div>
            </div>
            
            <!-- Características -->
            <div class="features-section">
              <h2 class="section-title">Características</h2>
              <div class="features-list">
                <div 
                  v-for="(caracteristica, index) in nave.caracteristicas" 
                  :key="index"
                  class="feature-check"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="check-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>{{ caracteristica }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Imagen principal -->
        <div class="image-card">
          <div class="card-content">
            <div class="image-container">
              <img 
                :src="nave.imagenPrincipal || '/placeholder.svg?height=400&width=600&query=nave+espacial+futurista'" 
                :alt="nave.nombre"
                class="nave-image"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tabs de información adicional -->
      <div class="tabs-container">
        <div class="tabs">
          <div class="tab-list">
            <button 
              v-for="tab in tabs" 
              :key="tab.id" 
              @click="activeTab = tab.id" 
              :class="['tab-button', { active: activeTab === tab.id }]"
            >
              {{ tab.label }}
            </button>
          </div>
          
          <div class="tab-content">
            <!-- Especificaciones -->
            <div v-if="activeTab === 'especificaciones'" class="tab-panel">
              <div class="specs-grid">
                <div>
                  <h3 class="panel-title">Especificaciones Técnicas</h3>
                  <div class="specs-list">
                    <div class="spec-item">
                      <div class="spec-label">Longitud</div>
                      <div class="spec-value">{{ nave.longitud }} metros</div>
                    </div>
                    
                    <div class="spec-item">
                      <div class="spec-label">Altura</div>
                      <div class="spec-value">{{ nave.altura }} metros</div>
                    </div>
                    
                    <div class="spec-item">
                      <div class="spec-label">Peso</div>
                      <div class="spec-value">{{ nave.peso }} toneladas</div>
                    </div>
                    
                    <div class="spec-item">
                      <div class="spec-label">Autonomía</div>
                      <div class="spec-value">{{ nave.autonomia }} días</div>
                    </div>
                    
                    <div class="spec-item">
                      <div class="spec-label">Alcance máximo</div>
                      <div class="spec-value">{{ formatearDistancia(nave.alcanceMaximo) }}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 class="panel-title">Sistemas y Equipamiento</h3>
                  <div class="specs-list">
                    <div class="spec-item">
                      <div class="spec-label">Sistema de propulsión</div>
                      <div class="spec-value">{{ nave.sistemaPropulsion }}</div>
                    </div>
                    
                    <div class="spec-item">
                      <div class="spec-label">Sistema de navegación</div>
                      <div class="spec-value">{{ nave.sistemaNavegacion }}</div>
                    </div>
                    
                    <div class="spec-item">
                      <div class="spec-label">Sistema de soporte vital</div>
                      <div class="spec-value">{{ nave.sistemaSoporteVital }}</div>
                    </div>
                    
                    <div class="spec-item">
                      <div class="spec-label">Comunicaciones</div>
                      <div class="spec-value">{{ nave.comunicaciones }}</div>
                    </div>
                    
                    <div class="spec-item">
                      <div class="spec-label">Escudos</div>
                      <div class="spec-value">{{ nave.escudos }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Destinos -->
            <div v-if="activeTab === 'destinos'" class="tab-panel">
              <div v-if="loadingDestinos" class="loading-container-small">
                <div class="loading-spinner small"></div>
                <span>Cargando destinos...</span>
              </div>
              <div v-else-if="!destinosDisponibles.length" class="empty-state">
                <p>No hay destinos disponibles para esta nave.</p>
              </div>
              <div v-else class="destinos-grid">
                <div v-for="destino in destinosDisponibles" :key="destino.id" class="destino-card">
                  <img 
                    :src="destino.imagen || '/placeholder.svg?height=200&width=300&query=destino+espacial'" 
                    :alt="destino.nombre"
                    class="destino-image"
                  />
                  <div class="destino-content">
                    <h3 class="destino-title">{{ destino.nombre }}</h3>
                    <p class="destino-description">{{ destino.descripcion }}</p>
                    <a :href="`/destinos/${destino.id}`" class="destino-link">Ver detalles</a>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Seguridad -->
            <div v-if="activeTab === 'seguridad'" class="tab-panel">
              <div class="security-grid">
                <div>
                  <h3 class="panel-title">Sistemas de Seguridad</h3>
                  <div class="security-content">
                    <p>{{ nave.seguridadInfo || 'Información no disponible.' }}</p>
                    
                    <ul class="security-list">
                      <li>Sistemas redundantes de soporte vital</li>
                      <li>Escudos de radiación avanzados</li>
                      <li>Protocolos de emergencia automatizados</li>
                      <li>Cápsulas de escape individuales</li>
                      <li>Sistema de detección y extinción de incendios</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 class="panel-title">Confort y Comodidades</h3>
                  <div class="security-content">
                    <p>{{ nave.confortInfo || 'Información no disponible.' }}</p>
                    
                    <ul class="security-list">
                      <li>Cabinas privadas con gravedad artificial</li>
                      <li>Áreas comunes de recreación</li>
                      <li>Servicio de comidas gourmet</li>
                      <li>Observatorio panorámico</li>
                      <li>Gimnasio y spa espacial</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Naves relacionadas -->
      <div v-if="navesRelacionadas.length > 0" class="related-section">
        <h2 class="section-title">Naves similares</h2>
        <div class="related-grid">
          <div 
            v-for="naveRel in navesRelacionadas" 
            :key="naveRel.id" 
            class="related-card"
          >
            <img 
              :src="naveRel.imagenPrincipal || '/placeholder.svg?height=200&width=300&query=nave+espacial'" 
              :alt="naveRel.nombre"
              class="related-image"
            />
            <div class="related-content">
              <h3 class="related-title">{{ naveRel.nombre }}</h3>
              <p class="related-type">{{ naveRel.tipo }}</p>
              <a :href="`/naves/${naveRel.id}`" class="related-link">Ver detalles</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// Definir props para recibir el ID de la nave desde Astro
const props = defineProps({
  naveId: {
    type: [String, Number],
    required: true
  }
});

// Datos para las pestañas
const tabs = [
  { id: 'especificaciones', label: 'Especificaciones' },
  { id: 'destinos', label: 'Destinos disponibles' },
  { id: 'seguridad', label: 'Seguridad y Confort' }
];
const activeTab = ref('especificaciones');

// Estados
const loading = ref(true);
const error = ref(null);
const nave = ref(null);
const loadingDestinos = ref(false);
const destinosDisponibles = ref([]);
const navesRelacionadas = ref([]);

// Cargar datos de la nave
const cargarNave = async (id) => {
  loading.value = true;
  error.value = null;
  
  try {
    // Cargar datos simulados según el ID
    nave.value = obtenerNavePorId(id);
    
    // Cargar destinos disponibles y naves relacionadas
    cargarDestinosDisponibles(id);
    cargarNavesRelacionadas(id);
  } catch (err) {
    console.error('Error al cargar nave:', err);
    error.value = 'No se pudo cargar la información de la nave. Por favor, intenta nuevamente.';
  } finally {
    loading.value = false;
  }
};

// Cargar destinos disponibles para la nave
const cargarDestinosDisponibles = async (id) => {
  loadingDestinos.value = true;
  try {
    // Datos simulados
    destinosDisponibles.value = obtenerDestinosPorNaveId(id);
  } catch (err) {
    console.error('Error al cargar destinos:', err);
  } finally {
    loadingDestinos.value = false;
  }
};

// Cargar naves relacionadas
const cargarNavesRelacionadas = async (id) => {
  try {
    // Datos simulados
    navesRelacionadas.value = obtenerNavesRelacionadas(id);
  } catch (err) {
    console.error('Error al cargar naves relacionadas:', err);
  }
};

// Datos simulados para diferentes naves
const obtenerNavePorId = (id) => {
  const naves = {
    '1': {
      id: 1,
      nombre: "Aurora Estelar",
      tipo: "Crucero",
      fabricante: "Stellar Industries",
      velocidadMaxima: 25000,
      capacidad: 500,
      tipoPropulsion: "Antimateria",
      anoFabricacion: 2150,
      descripcion: "El Aurora Estelar es un crucero de lujo diseñado para viajes interplanetarios. Con capacidad para 500 pasajeros, ofrece todas las comodidades para un viaje espacial inolvidable.",
      caracteristicas: [
        "Gravedad artificial",
        "Observatorio panorámico",
        "Suites de lujo",
        "Restaurantes gourmet",
        "Spa espacial",
        "Simuladores de realidad virtual"
      ],
      imagenPrincipal: "/images/naves/aurora-estelar-cruiser.png",
      longitud: 350,
      altura: 120,
      peso: 45000,
      autonomia: 90,
      alcanceMaximo: 15000000,
      sistemaPropulsion: "Reactor de fusión de antimateria",
      sistemaNavegacion: "IA de navegación estelar",
      sistemaSoporteVital: "Sistema ecológico cerrado",
      comunicaciones: "Red cuántica interestelar",
      escudos: "Escudo de plasma multicapa",
      seguridadInfo: "El Aurora Estelar cuenta con los sistemas de seguridad más avanzados, incluyendo escudos de radiación, sistemas redundantes de soporte vital y protocolos de emergencia automatizados.",
      confortInfo: "Diseñado para ofrecer la máxima comodidad, el Aurora Estelar cuenta con cabinas privadas con gravedad artificial, áreas comunes de recreación y servicios de primera clase."
    },
    '2': {
      id: 2,
      nombre: "Halcón Lunar",
      tipo: "Transporte",
      fabricante: "Lunar Dynamics",
      velocidadMaxima: 18000,
      capacidad: 120,
      tipoPropulsion: "Iónica",
      anoFabricacion: 2145,
      descripcion: "El Halcón Lunar es una nave de transporte rápida y eficiente, especializada en viajes entre la Tierra y la Luna. Su diseño aerodinámico y su sistema de propulsión iónica la convierten en una de las naves más eficientes de su clase.",
      caracteristicas: [
        "Despegue y aterrizaje vertical",
        "Cabinas modulares",
        "Sistema de navegación automatizado",
        "Área de carga expandible",
        "Escudos térmicos avanzados",
        "Consumo eficiente de combustible"
      ],
      imagenPrincipal: "/images/naves/halcon-lunar-shuttle.png",
      longitud: 120,
      altura: 45,
      peso: 18000,
      autonomia: 30,
      alcanceMaximo: 500000,
      sistemaPropulsion: "Motor iónico de alta eficiencia",
      sistemaNavegacion: "Sistema de navegación lunar automatizado",
      sistemaSoporteVital: "Sistema de reciclaje atmosférico",
      comunicaciones: "Red de comunicación orbital",
      escudos: "Escudo térmico multicapa",
      seguridadInfo: "El Halcón Lunar está equipado con sistemas de seguridad redundantes, incluyendo módulos de escape individuales y sistemas de detección de fallos predictivos.",
      confortInfo: "Aunque es principalmente una nave de transporte, el Halcón Lunar ofrece comodidades básicas para sus pasajeros, incluyendo asientos ergonómicos y sistemas de entretenimiento personal."
    },
    '3': {
      id: 3,
      nombre: "Voyager Marciano",
      tipo: "Explorador",
      fabricante: "Mars Exploration Corp",
      velocidadMaxima: 22000,
      capacidad: 80,
      tipoPropulsion: "Nuclear",
      anoFabricacion: 2148,
      descripcion: "El Voyager Marciano es una nave de exploración diseñada específicamente para misiones en Marte. Equipada con laboratorios científicos avanzados y sistemas de soporte vital de larga duración, es ideal para misiones de investigación prolongadas.",
      caracteristicas: [
        "Laboratorios científicos integrados",
        "Vehículos de exploración superficial",
        "Sistemas de análisis atmosférico",
        "Drones de reconocimiento",
        "Módulos habitacionales expandibles",
        "Invernaderos para cultivos"
      ],
      imagenPrincipal: "/images/naves/voyager-marciano-cruiser.png",
      longitud: 180,
      altura: 60,
      peso: 25000,
      autonomia: 365,
      alcanceMaximo: 8000000,
      sistemaPropulsion: "Reactor nuclear de fisión",
      sistemaNavegacion: "Sistema de navegación interplanetaria",
      sistemaSoporteVital: "Ecosistema cerrado autosostenible",
      comunicaciones: "Red de comunicación interplanetaria",
      escudos: "Escudo de radiación avanzado",
      seguridadInfo: "El Voyager Marciano cuenta con sistemas de seguridad diseñados para entornos hostiles, incluyendo protección contra radiación y tormentas solares, así como sistemas médicos avanzados.",
      confortInfo: "Para misiones de larga duración, el Voyager Marciano ofrece espacios habitacionales confortables, áreas de recreación y sistemas de realidad virtual para combatir el aislamiento."
    },
    '4': {
      id: 4,
      nombre: "Nexus Orbital",
      tipo: "Estación",
      fabricante: "Orbital Habitats Inc",
      velocidadMaxima: 8000,
      capacidad: 2000,
      tipoPropulsion: "Propulsores de posicionamiento",
      anoFabricacion: 2140,
      descripcion: "El Nexus Orbital es una estación espacial modular diseñada para orbitar la Tierra. Funciona como centro de investigación, turismo espacial y punto de transferencia para viajes interplanetarios.",
      caracteristicas: [
        "Estructura modular expandible",
        "Anillo de gravedad artificial",
        "Puertos de acoplamiento múltiples",
        "Observatorios astronómicos",
        "Centros comerciales y de entretenimiento",
        "Hoteles espaciales de lujo"
      ],
      imagenPrincipal: "/images/naves/nexus-orbital-station.png",
      longitud: 500,
      altura: 500,
      peso: 120000,
      autonomia: "Indefinida (con reabastecimiento)",
      alcanceMaximo: "Órbita terrestre",
      sistemaPropulsion: "Propulsores de mantenimiento orbital",
      sistemaNavegacion: "Sistema de estabilización orbital",
      sistemaSoporteVital: "Sistema ecológico regenerativo",
      comunicaciones: "Centro de comunicaciones global",
      escudos: "Sistema de detección y desvío de desechos espaciales",
      seguridadInfo: "El Nexus Orbital cuenta con múltiples capas de seguridad, incluyendo compartimentos estancos, sistemas contra incendios avanzados y cápsulas de escape para todos los habitantes.",
      confortInfo: "Como destino turístico y residencial, el Nexus Orbital ofrece todas las comodidades de una ciudad terrestre, incluyendo restaurantes, tiendas, instalaciones deportivas y centros culturales."
    },
    '5': {
      id: 5,
      nombre: "Solar Explorer",
      tipo: "Investigación",
      fabricante: "SolarTech Research",
      velocidadMaxima: 30000,
      capacidad: 40,
      tipoPropulsion: "Vela solar",
      anoFabricacion: 2152,
      descripcion: "El Solar Explorer es una nave de investigación especializada en el estudio del Sol y otros fenómenos estelares. Su innovador sistema de propulsión de vela solar le permite acercarse más al Sol que cualquier otra nave.",
      caracteristicas: [
        "Vela solar desplegable",
        "Escudos térmicos extremos",
        "Instrumentos de análisis solar",
        "Telescopios de alta resolución",
        "Laboratorios de física estelar",
        "Sistemas de refrigeración criogénicos"
      ],
      imagenPrincipal: "/images/naves/solar-explorer-research.png",
      longitud: 150,
      altura: 40,
      peso: 15000,
      autonomia: 180,
      alcanceMaximo: 2000000,
      sistemaPropulsion: "Vela solar de grafeno",
      sistemaNavegacion: "Sistema de navegación estelar",
      sistemaSoporteVital: "Sistema de soporte vital reforzado",
      comunicaciones: "Comunicaciones resistentes a interferencias solares",
      escudos: "Escudo térmico de cerámica avanzada",
      seguridadInfo: "El Solar Explorer está equipado con sistemas de seguridad diseñados para condiciones extremas, incluyendo refugios contra radiación y sistemas de evacuación rápida.",
      confortInfo: "Debido a su naturaleza especializada, el Solar Explorer ofrece comodidades básicas pero funcionales para su tripulación científica, con énfasis en la eficiencia y la seguridad."
    },
    '6': {
      id: 6,
      nombre: "Artemisa Lunar",
      tipo: "Base",
      fabricante: "Lunar Habitats Consortium",
      velocidadMaxima: "N/A (Estacionaria)",
      capacidad: 300,
      tipoPropulsion: "N/A",
      anoFabricacion: 2135,
      descripcion: "La Artemisa Lunar es una base permanente en la superficie lunar, diseñada para investigación científica, minería y turismo. Su estructura modular permite la expansión continua según las necesidades.",
      caracteristicas: [
        "Domos habitacionales",
        "Laboratorios científicos",
        "Instalaciones mineras",
        "Invernaderos lunares",
        "Centro de visitantes",
        "Vehículos de exploración lunar"
      ],
      imagenPrincipal: "/images/naves/artemisa-lunar-base.png",
      longitud: 800,
      altura: 50,
      peso: "N/A (Estructura permanente)",
      autonomia: "Indefinida (con reabastecimiento)",
      alcanceMaximo: "N/A (Estacionaria)",
      sistemaPropulsion: "N/A",
      sistemaNavegacion: "Sistema de posicionamiento lunar",
      sistemaSoporteVital: "Sistema de soporte vital cerrado con producción local",
      comunicaciones: "Red de comunicación Tierra-Luna",
      escudos: "Protección contra radiación y micrometeoritos",
      seguridadInfo: "La Artemisa Lunar cuenta con múltiples capas de seguridad, incluyendo refugios presurizados, sistemas de detección de fugas y protocolos de emergencia para eventos solares.",
      confortInfo: "Como asentamiento permanente, la Artemisa Lunar ofrece comodidades diseñadas para estancias prolongadas, incluyendo áreas recreativas, espacios comunitarios y alojamientos personalizables."
    },
'7': {
  id: 7,
  nombre: "Crucero Estelar",
  tipo: "Crucero de Lujo",
  fabricante: "Stellar Luxury Lines",
  velocidadMaxima: 25000,
  capacidad: 60,
  tipoPropulsion: "Iónica de alta eficiencia",
  anoFabricacion: 2048,
  descripcion: "El Crucero Estelar es nuestra nave de lujo más exclusiva, diseñada para viajes de placer con todas las comodidades imaginables. Su diseño elegante y sus interiores de primera clase ofrecen una experiencia incomparable.",
  caracteristicas: [
    "Suites de lujo con vistas panorámicas",
    "Restaurante gourmet con menú de degustación",
    "Spa espacial con tratamientos anti-gravedad",
    "Salón de observación con techo transparente",
    "Bar de cócteles moleculares",
    "Servicio de mayordomo personal",
  ],
  imagenPrincipal: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eea7728b-18e0-4b08-8e12-128b50fbe0e2-xZASfQCe9tuHSpxcGQOGI1aNj05qsP.png",
  longitud: 150,
  altura: 35,
  peso: 9800,
  autonomia: 90,
  alcanceMaximo: 500000,
  sistemaPropulsion: "Propulsores iónicos de última generación",
  sistemaNavegacion: "LuxNav Premium",
  sistemaSoporteVital: "Atmosphere Plus",
  comunicaciones: "Red de comunicación cuántica",
  escudos: "Escudo de partículas avanzado",
  seguridadInfo: "El Crucero Estelar cuenta con los sistemas de seguridad más avanzados, incluyendo múltiples capas de protección y sistemas de emergencia redundantes.",
  confortInfo: "Diseñado para el máximo lujo, cada suite cuenta con vistas panorámicas, control ambiental personalizado y servicio de mayordomo privado."
},
'8': {
  id: 8,
  nombre: "Defensor Espacial",
  tipo: "Nave de Escolta",
  fabricante: "Orbital Defense Systems",
  velocidadMaxima: 50000,
  capacidad: 25,
  tipoPropulsion: "Plasma comprimido",
  anoFabricacion: 2046,
  descripcion: "El Defensor Espacial es una nave de escolta que proporciona seguridad adicional para nuestras rutas más aventuradas. Equipada con sistemas de detección avanzados y capacidad de respuesta rápida.",
  caracteristicas: [
    "Sistemas de detección de largo alcance",
    "Capacidad de respuesta rápida",
    "Alojamiento seguro para pasajeros VIP",
    "Sala de control táctico",
    "Sistemas de comunicación de emergencia",
    "Módulos de escape individuales",
  ],
  imagenPrincipal: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8778798-fRteSwuh3yAfsk85nOtVyq3lwjJreq.png",
  longitud: 85,
  altura: 22,
  peso: 7500,
  autonomia: 120,
  alcanceMaximo: 1000000,
  sistemaPropulsion: "Motores de plasma de alta densidad",
  sistemaNavegacion: "TacticalNav 3.0",
  sistemaSoporteVital: "Military-grade Life Support",
  comunicaciones: "Red de comunicación encriptada",
  escudos: "Escudo de defensa multicapa",
  seguridadInfo: "El Defensor Espacial está diseñado para proporcionar la máxima seguridad en rutas espaciales de alto riesgo, con capacidad para detectar y neutralizar amenazas a gran distancia.",
  confortInfo: "Aunque su diseño prioriza la funcionalidad, el Defensor ofrece alojamiento confortable para su tripulación y pasajeros, con áreas comunes bien equipadas."
},
'9': {
  id: 9,
  nombre: "Estación Comercial Nexus",
  tipo: "Estación Comercial",
  fabricante: "Interstellar Commerce Ltd.",
  velocidadMaxima: 5000,
  capacidad: 800,
  tipoPropulsion: "Posicionamiento iónico",
  anoFabricacion: 2043,
  descripcion: "La Estación Comercial Nexus es un centro de negocios y entretenimiento flotante, donde se pueden realizar transacciones comerciales, disfrutar de compras duty-free y experimentar la vida en el espacio.",
  caracteristicas: [
    "Centro comercial con tiendas duty-free",
    "Zona de negocios con salas de conferencias",
    "Restaurantes de diversas especialidades",
    "Casino espacial",
    "Hotel con diferentes categorías de habitaciones",
    "Centro de entretenimiento y ocio",
  ],
  imagenPrincipal: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bb155376-b4ec-492e-b057-614eedacff24-6vMOPBQJ7xYEu9TLIf75qX4WPfPipq.png",
  longitud: 600,
  altura: 400,
  peso: 50000,
  autonomia: 3650,
  alcanceMaximo: 450000,
  sistemaPropulsion: "Sistema de posicionamiento orbital",
  sistemaNavegacion: "CommercialNav Enterprise",
  sistemaSoporteVital: "EcoSystem Commercial",
  comunicaciones: "Centro de comunicaciones comerciales",
  escudos: "Sistema de protección comercial",
  seguridadInfo: "La Estación Comercial Nexus cuenta con avanzados sistemas de seguridad y vigilancia, garantizando un entorno seguro para todas las actividades comerciales y de ocio.",
  confortInfo: "Diseñada para largas estancias, la estación ofrece alojamiento de diversas categorías, desde habitaciones estándar hasta suites de lujo con vistas al espacio."
}
  };
  
  return naves[id] || naves['1']; // Devolver la nave correspondiente o la primera como fallback
};

// Datos simulados para destinos disponibles según la nave
const obtenerDestinosPorNaveId = (id) => {
  const destinosPorNave = {
    '1': [
      {
        id: 1,
        nombre: "Luna",
        descripcion: "El satélite natural de la Tierra, primer destino de la exploración espacial humana.",
        imagen: "/images/luna-base.png"
      },
      {
        id: 2,
        nombre: "Marte",
        descripcion: "El planeta rojo, hogar de las primeras colonias humanas fuera de la Tierra.",
        imagen: "/images/marte.png"
      },
      {
        id: 3,
        nombre: "Estación Orbital Internacional",
        descripcion: "La mayor estación espacial en órbita terrestre, centro de investigación y turismo.",
        imagen: "/images/estacion-orbital.png"
      }
    ],
    '2': [
      {
        id: 1,
        nombre: "Luna",
        descripcion: "El satélite natural de la Tierra, primer destino de la exploración espacial humana.",
        imagen: "/images/luna-base.png"
      },
      {
        id: 4,
        nombre: "Estación Lunar Gateway",
        descripcion: "Estación espacial en órbita lunar que sirve como punto de transferencia.",
        imagen: "/placeholder.svg?height=200&width=300&query=estacion+lunar+gateway"
      }
    ],
    '3': [
      {
        id: 2,
        nombre: "Marte",
        descripcion: "El planeta rojo, hogar de las primeras colonias humanas fuera de la Tierra.",
        imagen: "/images/marte.png"
      },
      {
        id: 5,
        nombre: "Fobos",
        descripcion: "La luna más grande de Marte, base de operaciones para exploración marciana.",
        imagen: "/placeholder.svg?height=200&width=300&query=fobos+luna+marte"
      },
      {
        id: 6,
        nombre: "Deimos",
        descripcion: "La luna más pequeña de Marte, estación de investigación científica.",
        imagen: "/placeholder.svg?height=200&width=300&query=deimos+luna+marte"
      }
    ],
    '4': [
      {
        id: 3,
        nombre: "Estación Orbital Internacional",
        descripcion: "La mayor estación espacial en órbita terrestre, centro de investigación y turismo.",
        imagen: "/images/estacion-orbital.png"
      },
      {
        id: 7,
        nombre: "Órbita Terrestre Baja",
        descripcion: "Destino para turismo orbital y experiencias de gravedad cero.",
        imagen: "/placeholder.svg?height=200&width=300&query=orbita+terrestre+baja"
      },
      {
        id: 8,
        nombre: "Órbita Geoestacionaria",
        descripcion: "Ubicación estratégica para comunicaciones y observación terrestre.",
        imagen: "/placeholder.svg?height=200&width=300&query=orbita+geoestacionaria"
      }
    ],
    '5': [
      {
        id: 9,
        nombre: "Órbita Solar",
        descripcion: "Misiones científicas para estudiar el Sol y la heliosfera.",
        imagen: "/placeholder.svg?height=200&width=300&query=orbita+solar+nave"
      },
      {
        id: 10,
        nombre: "Mercurio",
        descripcion: "El planeta más cercano al Sol, destino para investigación extrema.",
        imagen: "/placeholder.svg?height=200&width=300&query=mercurio+planeta"
      },
      {
        id: 11,
        nombre: "Venus",
        descripcion: "El planeta más caliente del sistema solar, misiones atmosféricas.",
        imagen: "/placeholder.svg?height=200&width=300&query=venus+planeta"
      }
    ],
    '6': [
      {
        id: 1,
        nombre: "Luna",
        descripcion: "El satélite natural de la Tierra, primer destino de la exploración espacial humana.",
        imagen: "/images/luna-base.png"
      },
      {
        id: 12,
        nombre: "Cráter Shackleton",
        descripcion: "Cráter lunar con depósitos permanentes de hielo, ideal para extracción de recursos.",
        imagen: "/placeholder.svg?height=200&width=300&query=crater+shackleton+luna"
      },
      {
        id: 13,
        nombre: "Mare Tranquillitatis",
        descripcion: "Mar de la Tranquilidad, sitio del primer alunizaje humano.",
        imagen: "/placeholder.svg?height=200&width=300&query=mare+tranquillitatis+luna"
      }
    ],
    '7': [
      {
        id: 1,
        nombre: "Luna",
        descripcion: "El satélite natural de la Tierra, primer destino de la exploración espacial humana.",
        imagen: "/images/luna-base.png"
      },
      {
        id: 2,
        nombre: "Marte",
        descripcion: "El planeta rojo, hogar de las primeras colonias humanas fuera de la Tierra.",
        imagen: "/images/marte.png"
      },
      {
        id: 3,
        nombre: "Estación Orbital Internacional",
        descripcion: "La mayor estación espacial en órbita terrestre, centro de investigación y turismo.",
        imagen: "/images/estacion-orbital.png"
      }
    ],
    '8': [
      {
        id: 2,
        nombre: "Marte",
        descripcion: "El planeta rojo, hogar de las primeras colonias humanas fuera de la Tierra.",
        imagen: "/images/marte.png"
      },
      {
        id: 11,
        nombre: "Venus",
        descripcion: "El planeta más caliente del sistema solar, misiones atmosféricas.",
        imagen: "/placeholder.svg?height=200&width=300&query=venus+planeta"
      },
      {
        id: 9,
        nombre: "Órbita Solar",
        descripcion: "Misiones científicas para estudiar el Sol y la heliosfera.",
        imagen: "/placeholder.svg?height=200&width=300&query=orbita+solar+nave"
      }
    ],
    '9': [
      {
        id: 1,
        nombre: "Luna",
        descripcion: "El satélite natural de la Tierra, primer destino de la exploración espacial humana.",
        imagen: "/images/luna-base.png"
      },
      {
        id: 3,
        nombre: "Estación Orbital Internacional",
        descripcion: "La mayor estación espacial en órbita terrestre, centro de investigación y turismo.",
        imagen: "/images/estacion-orbital.png"
      }
    ]
  };
  
  return destinosPorNave[id] || destinosPorNave['1']; // Devolver los destinos correspondientes o los primeros como fallback
};

// Datos simulados para naves relacionadas
const obtenerNavesRelacionadas = (id) => {
  const navesRelacionadasPorId = {
    '1': [
      {
        id: 2,
        nombre: "Halcón Lunar",
        tipo: "Transporte",
        imagenPrincipal: "/images/naves/halcon-lunar-shuttle.png"
      },
      {
        id: 3,
        nombre: "Voyager Marciano",
        tipo: "Explorador",
        imagenPrincipal: "/images/naves/voyager-marciano-cruiser.png"
      },
      {
        id: 4,
        nombre: "Nexus Orbital",
        tipo: "Estación",
        imagenPrincipal: "/images/naves/nexus-orbital-station.png"
      }
    ],
    '2': [
      {
        id: 1,
        nombre: "Aurora Estelar",
        tipo: "Crucero",
        imagenPrincipal: "/images/naves/aurora-estelar-cruiser.png"
      },
      {
        id: 6,
        nombre: "Artemisa Lunar",
        tipo: "Base",
        imagenPrincipal: "/images/naves/artemisa-lunar-base.png"
      }
    ],
    '3': [
      {
        id: 1,
        nombre: "Aurora Estelar",
        tipo: "Crucero",
        imagenPrincipal: "/images/naves/aurora-estelar-cruiser.png"
      },
      {
        id: 5,
        nombre: "Solar Explorer",
        tipo: "Investigación",
        imagenPrincipal: "/images/naves/solar-explorer-research.png"
      }
    ],
    '4': [
      {
        id: 1,
        nombre: "Aurora Estelar",
        tipo: "Crucero",
        imagenPrincipal: "/images/naves/aurora-estelar-cruiser.png"
      },
      {
        id: 2,
        nombre: "Halcón Lunar",
        tipo: "Transporte",
        imagenPrincipal: "/images/naves/halcon-lunar-shuttle.png"
      },
      {
        id: 5,
        nombre: "Solar Explorer",
        tipo: "Investigación",
        imagenPrincipal: "/images/naves/solar-explorer-research.png"
      }
    ],
    '5': [
      {
        id: 3,
        nombre: "Voyager Marciano",
        tipo: "Explorador",
        imagenPrincipal: "/images/naves/voyager-marciano-cruiser.png"
      },
      {
        id: 4,
        nombre: "Nexus Orbital",
        tipo: "Estación",
        imagenPrincipal: "/images/naves/nexus-orbital-station.png"
      }
    ],
    '6': [
      {
        id: 2,
        nombre: "Halcón Lunar",
        tipo: "Transporte",
        imagenPrincipal: "/images/naves/halcon-lunar-shuttle.png"
      },
      {
        id: 4,
        nombre: "Nexus Orbital",
        tipo: "Estación",
        imagenPrincipal: "/images/naves/nexus-orbital-station.png"
      }
    ],
    '7': [
      {
        id: 1,
        nombre: "Aurora Estelar",
        tipo: "Crucero",
        imagenPrincipal: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aurora-estelar-cruiser-RQ8yt03mV9GFflJm8wrfYK83vB6ImU.png"
      },
      {
        id: 4,
        nombre: "Nexus Orbital",
        tipo: "Estación",
        imagenPrincipal: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nexus-orbital-station-5RJo0cfI0NUItzyPF6fCwYa04RduiQ.png"
      }
    ],
    '8': [
      {
        id: 3,
        nombre: "Voyager Marciano",
        tipo: "Explorador",
        imagenPrincipal: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/voyager-marciano-cruiser.png-1lRnc8nBmVPVlMp40AuMoMTn0DErpu.jpeg"
      },
      {
        id: 5,
        nombre: "Solar Explorer",
        tipo: "Investigación",
        imagenPrincipal: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/solar-explorer-research-T31AK5CsKfqxRlxZo9uHODArM3ZrGQ.png"
      }
    ],
    '9': [
      {
        id: 4,
        nombre: "Nexus Orbital",
        tipo: "Estación",
        imagenPrincipal: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nexus-orbital-station-5RJo0cfI0NUItzyPF6fCwYa04RduiQ.png"
      },
      {
        id: 7,
        nombre: "Crucero Estelar",
        tipo: "Crucero de Lujo",
        imagenPrincipal: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eea7728b-18e0-4b08-8e12-128b50fbe0e2-xZASfQCe9tuHSpxcGQOGI1aNj05qsP.png"
      }
    ]
  };
  
  return navesRelacionadasPorId[id] || navesRelacionadasPorId['1']; // Devolver las naves relacionadas correspondientes o las primeras como fallback
};

const badgeClass = computed(() => {
  if (!nave.value?.tipo) return 'badge-default';
  
  const tipoMap = {
    'crucero': 'badge-primary',
    'transporte': 'badge-secondary',
    'explorador': 'badge-outline',
    'carguero': 'badge-destructive',
    'investigación': 'badge-primary',
    'estación': 'badge-secondary',
    'base': 'badge-outline',
    'crucero de lujo': 'badge-primary',
    'nave de escolta': 'badge-secondary',
    'estación comercial': 'badge-outline'
  };
  
  return tipoMap[nave.value.tipo.toLowerCase()] || 'badge-default';
});

const formatearDistancia = (distancia) => {
  if (!distancia || distancia === 'N/A') return 'No disponible';
  
  if (typeof distancia === 'string') return distancia;
  
  if (distancia < 1000) {
    return `${distancia} km`;
  } else if (distancia < 1000000) {
    return `${(distancia / 1000).toFixed(1)} mil km`;
  } else {
    return `${(distancia / 1000000).toFixed(1)} millones km`;
  }
};

// Observar cambios en el ID de la nave para cargar los datos correspondientes
watch(() => props.naveId, (newId) => {
  if (newId) {
    cargarNave(newId);
  }
}, { immediate: true });

onMounted(() => {
  // Cargar la nave al montar el componente
  if (props.naveId) {
    cargarNave(props.naveId);
  }
});
</script>

<style scoped>
.nave-page {
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero-section {
  position: relative;
  height: 60vh;
  min-height: 400px;
  max-height: 600px;
  margin-bottom: 2rem;
}

.hero-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: flex-end;
  padding-bottom: 3rem;
}

.hero-content {
  max-width: 800px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  line-height: 1.2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
}

.content-container {
  padding: 2rem 1rem;
}

.breadcrumb {
  margin-bottom: 2rem;
}

.breadcrumb ul {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
}

.breadcrumb li {
  display: flex;
  align-items: center;
}

.breadcrumb a {
  color: var(--color-primary-light);
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb a:hover {
  color: var(--color-secondary);
}

.breadcrumb span {
  margin: 0 0.5rem;
  color: var(--color-text-secondary);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-card, .image-card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
}

.card-content {
  padding: 1.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  align-items: center;
}

.feature-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-primary-light);
  margin-right: 0.75rem;
}

.feature-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.feature-value {
  font-weight: 500;
  color: var(--color-text);
}

.description-section, .features-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
  position: relative;
  padding-bottom: 0.5rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
}

.description-content {
  line-height: 1.6;
  color: var(--color-text);
}

.features-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.feature-check {
  display: flex;
  align-items: center;
}

.check-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-secondary);
  margin-right: 0.5rem;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--border-radius-sm);
}

.nave-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.tabs-container {
  margin-bottom: 3rem;
}

.tabs {
  width: 100%;
}

.tab-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.75rem;
  text-align: center;
  background-color: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all 0.3s ease;
  cursor: pointer;
}

.tab-button.active {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 10px rgba(114, 9, 183, 0.3);
}

.tab-button:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-primary-light);
}

.tab-panel {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
}

.specs-grid, .security-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-primary-light);
}

.specs-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.spec-item:last-child {
  border-bottom: none;
}

.spec-label {
  font-weight: 500;
  color: var(--color-text);
}

.spec-value {
  color: var(--color-text-secondary);
}

.security-content {
  line-height: 1.6;
}

.security-list {
  margin-top: 1rem;
  padding-left: 1.5rem;
}

.security-list li {
  margin-bottom: 0.5rem;
  position: relative;
}

.security-list li::before {
  content: '•';
  color: var(--color-secondary);
  position: absolute;
  left: -1rem;
}

.destinos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.destino-card {
  background-color: var(--color-background-secondary);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--color-border);
}

.destino-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.destino-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.destino-content {
  padding: 1rem;
}

.destino-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.destino-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.destino-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  color: white;
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(114, 9, 183, 0.3);
}

.destino-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(114, 9, 183, 0.5);
}

.related-section {
  margin-top: 3rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.related-card {
  background-color: var(--color-background-secondary);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--color-border);
}

.related-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.related-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.related-content {
  padding: 1rem;
}

.related-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text);
}

.related-type {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
}

.related-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  color: white;
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(114, 9, 183, 0.3);
}

.related-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(114, 9, 183, 0.5);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.badge-default {
  background-color: rgba(124, 58, 237, 0.2);
  color: #a78bfa;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.badge-primary {
  background-color: rgba(114, 9, 183, 0.2);
  color: #9d4edd;
  border: 1px solid rgba(114, 9, 183, 0.3);
}

.badge-secondary {
  background-color: rgba(76, 201, 240, 0.2);
  color: #4cc9f0;
  border: 1px solid rgba(76, 201, 240, 0.3);
}

.badge-outline {
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-text-secondary);
}

.badge-destructive {
  background-color: rgba(247, 37, 133, 0.2);
  color: #f72585;
  border: 1px solid rgba(247, 37, 133, 0.3);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-background);
  padding: 2rem;
}

.loading-container-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(114, 9, 183, 0.3);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-spinner.small {
  width: 30px;
  height: 30px;
  border-width: 3px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-background);
  padding: 2rem;
  text-align: center;
}

.error-message {
  background-color: rgba(247, 37, 133, 0.1);
  border: 1px solid rgba(247, 37, 133, 0.3);
  color: #f72585;
  padding: 1rem;
  border-radius: var(--border-radius-md);
  margin-bottom: 1rem;
  max-width: 500px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  color: white;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(114, 9, 183, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(114, 9, 183, 0.5);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
}

@media (max-width: 992px) {
  .info-grid, .specs-grid, .security-grid, .destinos-grid, .related-grid {
    grid-template-columns: 1fr;
  }
  
  .features-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-section {
    height: 50vh;
  }
  
  .tab-list {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
