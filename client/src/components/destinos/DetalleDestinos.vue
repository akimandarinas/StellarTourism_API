<template>
  <div class="destination-detail">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
    </div>
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchDestination" class="btn">Reintentar</button>
    </div>
    <div v-else-if="destino" class="destino-content">
      &lt;!-- Breadcrumb -->
      <Breadcrumb class="mb-6">
        <BreadcrumbItem to="/">Inicio</BreadcrumbItem>
        <BreadcrumbItem to="/destinos">Destinos</BreadcrumbItem>
        <BreadcrumbItem :to="`/destinos/${destino.id}`" :aria-current="true">{{ destino.nombre }}</BreadcrumbItem>
      </Breadcrumb>
      
      <div class="destination-header">
        <div class="destination-title">
          <h1>{{ destino.nombre }}</h1>
          <div class="destination-type">{{ destino.tipo }}</div>
        </div>
        <div class="destination-actions">
          <button 
            class="btn btn-primary"
            @click="navigateToReserva"
            aria-label="Reservar viaje a este destino"
          >
            <RocketIcon size="18" class="mr-2" />
            Reservar Ahora
          </button>
          <button 
            class="btn btn-outline"
            @click="toggleFavorito"
            :aria-label="isFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'"
            :aria-pressed="isFavorito"
          >
            <HeartIcon v-if="isFavorito" size="18" class="mr-2 text-red-500" />
            <HeartIcon v-else size="18" class="mr-2" />
            {{ isFavorito ? 'En Favoritos' : 'Añadir a Favoritos' }}
          </button>
        </div>
      </div>
      
      <div class="destination-main">
        <div class="destination-gallery">
          <div class="main-image">
            <AdaptiveImage
              :src="mainImageSrc"
              :alt="`Vista principal de ${destino.nombre}`"
              :sizes="{
                1200: '66vw',
                768: '100vw'
              }"
              class="w-full h-full"
              image-class="object-cover"
              loading="eager"
              :priority="true"
            >
              <template #placeholder>
                <div class="image-placeholder" :style="{ backgroundColor: getRandomColor() }">
                  <div class="image-overlay">
                    <h2>{{ destino.nombre }}</h2>
                    <p>{{ destino.tipo }}</p>
                  </div>
                </div>
              </template>
            </AdaptiveImage>
          </div>
          
          <div class="thumbnail-images">
            <div 
              v-for="(imagen, index) in destino.imagenes || generatePlaceholderImages()" 
              :key="index"
              class="thumbnail"
              @click="selectThumbnail(index)"
              :class="{ 'active': selectedThumbnail === index }"
              :aria-label="`Ver imagen ${index + 1} de ${destino.nombre}`"
              tabindex="0"
              @keydown.enter="selectThumbnail(index)"
              @keydown.space.prevent="selectThumbnail(index)"
              role="button"
            >
              <AdaptiveImage
                :src="imagen.url || `/placeholder.svg?height=100&width=100&query=${destino.nombre}+${index+1}`"
                :alt="`Vista ${index+1} de ${destino.nombre}`"
                :sizes="{
                  1200: '10vw',
                  768: '20vw'
                }"
                class="w-full h-full"
                image-class="object-cover"
                loading="lazy"
              >
                <template #placeholder>
                  <div class="thumbnail-placeholder" :style="{ backgroundColor: getRandomColor() }"></div>
                </template>
              </AdaptiveImage>
            </div>
          </div>
        </div>
        
        <div class="destination-sidebar">
          <div class="info-card">
            <h3>Información General</h3>
            <div class="info-list">
              <div class="info-item">
                <div class="info-icon distance-icon">
                  <RocketIcon size="24" />
                </div>
                <div class="info-content">
                  <h4>Distancia desde la Tierra</h4>
                  <p>{{ formatNumber(destino.distancia_tierra) }}</p>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon time-icon">
                  <ClockIcon size="24" />
                </div>
                <div class="info-content">
                  <h4>Tiempo de Viaje</h4>
                  <p>{{ destino.tiempo_viaje }}</p>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon gravity-icon">
                  <GlobeIcon size="24" />
                </div>
                <div class="info-content">
                  <h4>Gravedad</h4>
                  <p>{{ destino.gravedad }} G</p>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon atmosphere-icon">
                  <CloudIcon size="24" />
                </div>
                <div class="info-content">
                  <h4>Atmósfera</h4>
                  <p>{{ destino.atmosfera }}</p>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon temperature-icon">
                  <ThermometerIcon size="24" />
                </div>
                <div class="info-content">
                  <h4>Temperatura</h4>
                  <p>{{ destino.temperatura }}°C</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="booking-card">
            <h3>Próximos Viajes</h3>
            <div v-if="proximosViajes.length > 0" class="trip-list">
              <div 
                v-for="viaje in proximosViajes" 
                :key="viaje.id" 
                class="trip-item"
              >
                <div class="trip-date">{{ formatDate(viaje.fecha) }}</div>
                <div class="trip-ship">{{ viaje.nave }}</div>
                <div class="trip-price">{{ formatPrice(viaje.precio) }}</div>
                <button 
                  class="btn btn-sm"
                  @click="seleccionarViaje(viaje)"
                  :aria-label="`Reservar viaje a ${destino.nombre} el ${formatDate(viaje.fecha)} en la nave ${viaje.nave}`"
                >
                  Reservar
                </button>
              </div>
            </div>
            <div v-else class="no-trips">
              <p>No hay viajes programados próximamente.</p>
              <button 
                class="btn btn-outline btn-sm mt-2"
                @click="solicitarViaje"
                aria-label="Solicitar información sobre futuros viajes a este destino"
              >
                Solicitar información
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="destination-tabs">
        <Tabs>
          <TabList class="tab-list">
            <Tab>Descripción</Tab>
            <Tab>Características</Tab>
            <Tab>Historia</Tab>
            <Tab>Actividades</Tab>
            <Tab>Reseñas</Tab>
          </TabList>
          
          <TabPanel>
            <div class="tab-content">
              <h2>Acerca de {{ destino.nombre }}</h2>
              <div class="destino-descripcion" v-html="sanitizedDescripcion"></div>
              
              <div v-if="destino.descubrimiento" class="discovery-info">
                <h3>Descubrimiento</h3>
                <p>{{ destino.descubrimiento }}</p>
              </div>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div class="tab-content">
              <h2>Características de {{ destino.nombre }}</h2>
              
              <div class="caracteristicas-grid">
                <div class="caracteristica-item">
                  <h3>Composición</h3>
                  <p>{{ destino.composicion || 'Información no disponible' }}</p>
                </div>
                
                <div class="caracteristica-item">
                  <h3>Diámetro</h3>
                  <p>{{ destino.diametro ? `${formatNumber(destino.diametro)} km` : 'Información no disponible' }}</p>
                </div>
                
                <div class="caracteristica-item">
                  <h3>Órbita</h3>
                  <p>{{ destino.orbita || 'Información no disponible' }}</p>
                </div>
                
                <div class="caracteristica-item">
                  <h3>Rotación</h3>
                  <p>{{ destino.rotacion || 'Información no disponible' }}</p>
                </div>
                
                <div class="caracteristica-item">
                  <h3>Satélites</h3>
                  <p>{{ destino.satelites || 'Ninguno conocido' }}</p>
                </div>
                
                <div class="caracteristica-item">
                  <h3>Condiciones de superficie</h3>
                  <p>{{ destino.condiciones_superficie || 'Información no disponible' }}</p>
                </div>
              </div>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div class="tab-content">
              <h2>Historia de {{ destino.nombre }}</h2>
              <Timeline>
                <TimelineItem v-for="(evento, index) in destino.historia || []" :key="index">
                  <template #title>{{ evento.fecha }}</template>
                  <template #content>
                    <h3>{{ evento.titulo }}</h3>
                    <p>{{ evento.descripcion }}</p>
                  </template>
                </TimelineItem>
                
                <TimelineItem v-if="!destino.historia || destino.historia.length === 0">
                  <template #title>Información no disponible</template>
                  <template #content>
                    <p>No hay información histórica disponible para este destino.</p>
                  </template>
                </TimelineItem>
              </Timeline>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div class="tab-content">
              <h2>Actividades en {{ destino.nombre }}</h2>
              
              <div v-if="destino.actividades && destino.actividades.length > 0" class="actividades-grid">
                <div 
                  v-for="actividad in destino.actividades" 
                  :key="actividad.id"
                  class="actividad-card"
                >
                  <div class="actividad-imagen">
                    <img 
                      :src="actividad.imagen || `/placeholder.svg?height=150&width=250&query=actividad+espacial+${actividad.nombre}`" 
                      :alt="actividad.nombre"
                      loading="lazy"
                    />
                  </div>
                  <div class="actividad-content">
                    <h3>{{ actividad.nombre }}</h3>
                    <p>{{ actividad.descripcion }}</p>
                    <div class="actividad-meta">
                      <span class="actividad-duracion">
                        <ClockIcon size="16" />
                        {{ actividad.duracion }} minutos
                      </span>
                      <span class="actividad-precio">
                        {{ formatPrice(actividad.precio) }}
                      </span>
                    </div>
                    <button 
                      class="btn btn-sm"
                      @click="agregarActividad(actividad)"
                      :aria-label="`Añadir actividad ${actividad.nombre} a tu reserva`"
                    >
                      Añadir a la reserva
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-else class="no-actividades">
                <p>No hay actividades disponibles para este destino.</p>
              </div>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div class="tab-content">
              <h2>Reseñas de {{ destino.nombre }}</h2>
              
              <div class="resenas-header">
                <div class="rating-summary">
                  <div class="rating-average">
                    <span class="rating-number">{{ destino.rating || 0 }}</span>
                    <div class="rating-stars">
                      <Rating :value="destino.rating || 0" readonly />
                    </div>
                    <span class="rating-count">{{ destino.numResenas || 0 }} reseñas</span>
                  </div>
                  
                  <div class="rating-distribution">
                    <div 
                      v-for="i in 5" 
                      :key="i"
                      class="rating-bar"
                    >
                      <span class="rating-label">{{ 6 - i }} estrellas</span>
                      <div class="rating-bar-container">
                        <div 
                          class="rating-bar-fill" 
                          :style="{ width: `${getDistribucionPorcentaje(6 - i)}%` }"
                        ></div>
                      </div>
                      <span class="rating-percentage">{{ getDistribucionPorcentaje(6 - i) }}%</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  class="btn btn-primary"
                  @click="mostrarFormularioResena"
                  aria-label="Escribir una reseña sobre este destino"
                >
                  Escribir reseña
                </button>
              </div>
              
              <div v-if="destino.resenas && destino.resenas.length > 0" class="resenas-list">
                <div 
                  v-for="resena in destino.resenas" 
                  :key="resena.id"
                  class="resena-item"
                >
                  <div class="resena-header">
                    <div class="resena-author">
                      <div class="author-avatar">
                        <img 
                          :src="resena.avatar || '/placeholder-user.jpg'" 
                          :alt="resena.autor"
                          loading="lazy"
                        />
                      </div>
                      <div class="author-info">
                        <h3>{{ resena.autor }}</h3>
                        <div class="resena-meta">
                          <span class="resena-date">{{ formatDate(resena.fecha) }}</span>
                          <span class="resena-trip">Viajó en {{ formatDate(resena.fecha_viaje, { month: 'long', year: 'numeric' }) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="resena-rating">
                      <Rating :value="resena.rating" readonly size="sm" />
                    </div>
                  </div>
                  
                  <div class="resena-content">
                    <h4>{{ resena.titulo }}</h4>
                    <p>{{ resena.comentario }}</p>
                    
                    <div v-if="resena.imagenes && resena.imagenes.length > 0" class="resena-imagenes">
                      <div 
                        v-for="(imagen, index) in resena.imagenes" 
                        :key="index"
                        class="resena-imagen"
                        @click="abrirGaleria(resena.imagenes, index)"
                      >
                        <img 
                          :src="imagen.thumbnail || imagen.url" 
                          :alt="`Imagen ${index + 1} de la reseña de ${resena.autor}`"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div class="resena-footer">
                    <button 
                      class="btn-text"
                      @click="toggleResenaUtil(resena)"
                      :aria-pressed="resena.marcadoUtil"
                      :aria-label="`Marcar como útil la reseña de ${resena.autor}`"
                    >
                      <ThumbsUpIcon size="16" :class="{ 'text-primary': resena.marcadoUtil }" />
                      Útil ({{ resena.utilidad || 0 }})
                    </button>
                    
                    <button 
                      class="btn-text"
                      @click="responderResena(resena)"
                      aria-label="Responder a esta reseña"
                    >
                      <MessageSquareIcon size="16" />
                      Responder
                    </button>
                  </div>
                  
                  <div v-if="resena.respuestas && resena.respuestas.length > 0" class="resena-respuestas">
                    <div 
                      v-for="respuesta in resena.respuestas" 
                      :key="respuesta.id"
                      class="resena-respuesta"
                    >
                      <div class="respuesta-header">
                        <div class="respuesta-author">
                          <div class="author-avatar small">
                            <img 
                              :src="respuesta.avatar || '/placeholder-user.jpg'" 
                              :alt="respuesta.autor"
                              loading="lazy"
                            />
                          </div>
                          <div class="author-info">
                            <h4>{{ respuesta.autor }}</h4>
                            <span class="respuesta-date">{{ formatDate(respuesta.fecha) }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div class="respuesta-content">
                        <p>{{ respuesta.comentario }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="no-resenas">
                <p>No hay reseñas disponibles para este destino.</p>
                <p>¡Sé el primero en compartir tu experiencia!</p>
              </div>
              
              <div v-if="destino.resenas && destino.resenas.length > 0" class="resenas-pagination">
                <Pagination 
                  :total-pages="totalPaginasResenas" 
                  :current-page="paginaActualResenas"
                  @page-change="cambiarPaginaResenas"
                />
              </div>
            </div>
          </TabPanel>
        </Tabs>
      </div>
      
      <div class="destination-related">
        <h2>Destinos relacionados</h2>
        
        <div v-if="destinosRelacionados.length > 0" class="related-grid">
          <DestinoCard 
            v-for="destino in destinosRelacionados" 
            :key="destino.id"
            :destino="destino"
            @click="navegarADestino(destino.id)"
          />
        </div>
        
        <div v-else class="no-related">
          <p>No hay destinos relacionados disponibles.</p>
        </div>
      </div>
    </div>
    
    &lt;!-- Modales -->
    <Modal 
      v-model="showDescriptionModal" 
      :title="destino?.nombre || 'Descripción del destino'"
    >
      <div :id="`desc-${destinoId}`" class="text-base">
        {{ destino?.descripcion || 'Sin descripción disponible' }}
      </div>
    </Modal>
    
    <Modal
      v-model="showReviewModal"
      title="Escribir una reseña"
    >
      <ResenasForm 
        :destino-id="destino?.id"
        @submit-success="onReviewSubmitted"
        @cancel="showReviewModal = false"
      />
    </Modal>
    
    <LightboxGallery
      v-model="showGallery"
      :images="galeriaImagenes"
      :start-index="galeriaIndiceInicial"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  RocketIcon, ClockIcon, GlobeIcon, CloudIcon, ThermometerIcon, 
  HeartIcon, ThumbsUpIcon, MessageSquareIcon 
} from 'lucide-vue-next';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import AdaptiveImage from '../common/AdaptiveImage.vue';
import Breadcrumb from '../common/Breadcrumb.vue';
import BreadcrumbItem from '../common/BreadcrumbItem.vue';
import { Tabs, TabList, Tab, TabPanel } from '../ui/tabs';
import Timeline from '../ui/Timeline.vue';
import TimelineItem from '../ui/TimelineItem.vue';
import Rating from '../ui/Rating.vue';
import Pagination from '../ui/Pagination.vue';
import Modal from '../ui/Modal.vue';
import DestinoCard from './DestinoCard.vue';
import ResenasForm from '../resenas/ResenasForm.vue';
import LightboxGallery from '../common/LightboxGallery.vue';
import { useDestinos } from '../../composables/useDestinos';
import { useFavoritos } from '../../composables/useFavoritos';
import { formatPrice, formatNumber, formatDate } from '../../utils/format';
import { sanitizeHtml } from '../../utils/security';
import { useAnalytics } from '../../composables/useAnalytics';
import { AccessibleImage } from '@/accessibility/components'

// Router y Route
const route = useRoute();
const router = useRouter();

// Composables
const { obtenerDestino, obtenerDestinosRelacionados } = useDestinos();
const { esFavorito, toggleFavorito: toggleFavoritoAction } = useFavoritos();
const { trackEvent } = useAnalytics();

// Estado
const destino = ref(null);
const loading = ref(true);
const error = ref(null);
const selectedThumbnail = ref(0);
const thumbnailColors = ref([]);
const destinoId = ref(`destino-${Math.random().toString(36).substring(2, 11)}`);
const showDescriptionModal = ref(false);
const showReviewModal = ref(false);
const destinosRelacionados = ref([]);
const proximosViajes = ref([]);
const paginaActualResenas = ref(1);
const totalPaginasResenas = ref(1);
const showGallery = ref(false);
const galeriaImagenes = ref([]);
const galeriaIndiceInicial = ref(0);

// Computed
const sanitizedDescripcion = computed(() => {
  if (!destino.value || !destino.value.descripcion) return '';
  return sanitizeHtml(destino.value.descripcion);
});

const mainImageSrc = computed(() => {
  if (!destino.value || !destino.value.nombre) {
    return '/placeholder.svg?height=400&width=600&query=destino+espacial';
  }
  
  if (destino.value.imagenes && destino.value.imagenes.length > 0) {
    return destino.value.imagenes[selectedThumbnail.value].url;
  }
  
  return `/placeholder.svg?height=400&width=600&query=${destino.value.nombre}+${selectedThumbnail.value + 1}`;
});

const isFavorito = computed(() => {
  if (!destino.value) return false;
  return esFavorito(destino.value.id);
});

// Métodos
const fetchDestination = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const id = route.params.id;
    if (!id) {
      error.value = 'ID de destino no proporcionado';
      loading.value = false;
      return;
    }
    
    const resultado = await obtenerDestino(id);
    if (resultado.success) {
      destino.value = resultado.data;
      
      // Generar colores aleatorios para thumbnails
      thumbnailColors.value = Array.from(
        { length: destino.value.imagenes?.length || 5 }, 
        () => getRandomColor()
      );
      
      // Cargar destinos relacionados
      cargarDestinosRelacionados();
      
      // Cargar próximos viajes
      cargarProximosViajes();
      
      // Registrar vista en analytics
      trackEvent('view_item', {
        item_id: destino.value.id,
        item_name: destino.value.nombre,
        item_category: destino.value.categoria
      });
    } else {
      error.value = resultado.error || 'Error al cargar el destino';
    }
  } catch (err) {
    console.error('Error al cargar destino:', err);
    error.value = 'Error al cargar el destino. Por favor, inténtelo de nuevo.';
  } finally {
    loading.value = false;
  }
};

const cargarDestinosRelacionados = async () => {
  if (!destino.value) return;
  
  try {
    const resultado = await obtenerDestinosRelacionados(destino.value.id, destino.value.categoria);
    if (resultado.success) {
      destinosRelacionados.value = resultado.data.slice(0, 3); // Limitar a 3 destinos relacionados
    }
  } catch (err) {
    console.error('Error al cargar destinos relacionados:', err);
    // No mostrar error al usuario para no interrumpir la experiencia
  }
};

const cargarProximosViajes = async () => {
  if (!destino.value) return;
  
  try {
    // Simulación de carga de próximos viajes
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Datos de ejemplo
    proximosViajes.value = [
      {
        id: 1,
        fecha: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días en el futuro
        nave: 'Stellar Explorer',
        precio: 250000
      },
      {
        id: 2,
        fecha: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días en el futuro
        nave: 'Cosmic Voyager',
        precio: 280000
      },
      {
        id: 3,
        fecha: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días en el futuro
        nave: 'Galactic Cruiser',
        precio: 320000
      }
    ];
  } catch (err) {
    console.error('Error al cargar próximos viajes:', err);
    proximosViajes.value = [];
  }
};

const getRandomColor = () => {
  const colors = [
    '#3a0ca3', // Púrpura oscuro
    '#4361ee', // Azul
    '#4cc9f0', // Azul claro
    '#7209b7', // Púrpura
    '#f72585', // Rosa
    '#480ca8', // Púrpura oscuro
    '#4895ef', // Azul medio
    '#560bad'  // Púrpura intenso
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const selectThumbnail = (index) => {
  selectedThumbnail.value = index;
};

const generatePlaceholderImages = () => {
  return Array.from({ length: 5 }, (_, i) => ({
    url: `/placeholder.svg?height=100&width=100&query=${destino.value?.nombre || 'destino'}+${i+1}`
  }));
};

const toggleFavorito = async () => {
  if (!destino.value) return;
  
  try {
    await toggleFavoritoAction(destino.value);
    
    // Registrar evento en analytics
    trackEvent(isFavorito.value ? 'add_to_favorites' : 'remove_from_favorites', {
      item_id: destino.value.id,
      item_name: destino.value.nombre
    });
  } catch (err) {
    console.error('Error al cambiar estado de favorito:', err);
    // Mostrar notificación de error
    if (window.$toast) {
      window.$toast.error('No se pudo actualizar favoritos. Inténtalo de nuevo.');
    }
  }
};

const navigateToReserva = () => {
  if (!destino.value) return;
  
  router.push({
    path: '/reservas/nueva',
    query: { destino: destino.value.id }
  });
  
  // Registrar evento en analytics
  trackEvent('begin_checkout', {
    item_id: destino.value.id,
    item_name: destino.value.nombre,
    value: destino.value.precio
  });
};

const seleccionarViaje = (viaje) => {
  if (!destino.value) return;
  
  router.push({
    path: '/reservas/nueva',
    query: { 
      destino: destino.value.id,
      fecha: viaje.fecha.toISOString().split('T')[0],
      nave: viaje.nave
    }
  });
  
  // Registrar evento en analytics
  trackEvent('select_item', {
    item_id: viaje.id,
    item_name: `Viaje a ${destino.value.nombre}`,
    item_category: 'viaje',
    value: viaje.precio
  });
};

const solicitarViaje = () => {
  // Implementar lógica para solicitar información
  if (window.$toast) {
    window.$toast.success('Solicitud enviada. Te contactaremos pronto.');
  }
  
  // Registrar evento en analytics
  trackEvent('generate_lead', {
    item_id: destino.value?.id,
    item_name: destino.value?.nombre
  });
};

const getDistribucionPorcentaje = (estrellas) => {
  if (!destino.value || !destino.value.distribucionRating) return 0;
  
  const total = destino.value.numResenas || 0;
  if (total === 0) return 0;
  
  const cantidad = destino.value.distribucionRating[estrellas] || 0;
  return Math.round((cantidad / total) * 100);
};

const mostrarFormularioResena = () => {
  showReviewModal.value = true;
};

const onReviewSubmitted = async () => {
  showReviewModal.value = false;
  
  // Recargar destino para obtener la nueva reseña
  await fetchDestination();
  
  if (window.$toast) {
    window.$toast.success('¡Gracias por tu reseña!');
  }
};

const toggleResenaUtil = async (resena) => {
  try {
    // Implementar lógica para marcar como útil
    resena.marcadoUtil = !resena.marcadoUtil;
    resena.utilidad = resena.marcadoUtil ? (resena.utilidad || 0) + 1 : (resena.utilidad || 1) - 1;
    
    // Registrar evento en analytics
    trackEvent('review_interaction', {
      review_id: resena.id,
      action: resena.marcadoUtil ? 'mark_helpful' : 'unmark_helpful'
    });
  } catch (err) {
    console.error('Error al marcar reseña como útil:', err);
    if (window.$toast) {
      window.$toast.error('No se pudo actualizar. Inténtalo de nuevo.');
    }
  }
};

const responderResena = (resena) => {
  // Implementar lógica para responder a la reseña
  if (window.$toast) {
    window.$toast.info('Función de respuesta en desarrollo.');
  }
};

const cambiarPaginaResenas = (pagina) => {
  paginaActualResenas.value = pagina;
  // Implementar lógica para cargar reseñas de la página seleccionada
};

const agregarActividad = (actividad) => {
  // Implementar lógica para añadir actividad a la reserva
  if (window.$toast) {
    window.$toast.success(`Actividad "${actividad.nombre}" añadida a tu reserva.`);
  }
  
  // Registrar evento en analytics
  trackEvent('add_to_cart', {
    item_id: actividad.id,
    item_name: actividad.nombre,
    item_category: 'actividad',
    value: actividad.precio
  });
};

const navegarADestino = (id) => {
  router.push(`/destinos/${id}`);
};

const abrirGaleria = (imagenes, indiceInicial) => {
  galeriaImagenes.value = imagenes.map(img => ({
    src: img.url,
    thumbnail: img.thumbnail,
    alt: img.descripcion || 'Imagen de reseña'
  }));
  galeriaIndiceInicial.value = indiceInicial;
  showGallery.value = true;
};

// Lifecycle hooks
onMounted(() => {
  fetchDestination();
});

// Observar cambios en la ruta para recargar el destino si cambia el ID
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    fetchDestination();
  }
});
</script>

<style scoped>
.destination-detail {
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.error-container {
  text-align: center;
  padding: 2rem;
  background-color: rgba(230, 57, 70, 0.1);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-error);
  color: var(--color-error);
}

.destination-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.destination-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.destination-title h1 {
  font-size: 3rem;
  color: var(--color-primary);
  margin: 0;
}

.destination-type {
  background-color: var(--color-secondary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}

.destination-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover {
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-text {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.btn-text:hover {
  color: var(--color-primary);
}

.destination-main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.destination-gallery {
  width: 100%;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  color: white;
}

.image-overlay h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.thumbnail-images {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) rgba(var(--color-primary-rgb), 0.1);
}

.thumbnail-images::-webkit-scrollbar {
  height: 6px;
}

.thumbnail-images::-webkit-scrollbar-track {
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 10px;
}

.thumbnail-images::-webkit-scrollbar-thumb {
  background-color: var(--color-primary);
  border-radius: 10px;
}

.thumbnail {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  position: relative;
}

.thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.thumbnail.active {
  border: 2px solid var(--color-primary);
  transform: scale(1.05);
}

.thumbnail:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
}

.destination-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card, .booking-card {
  background-color: rgba(26, 26, 46, 0.7);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.info-card h3, .booking-card h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  gap: 1rem;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary);
}

.distance-icon {
  background-color: rgba(0, 180, 216, 0.2);
}

.time-icon {
  background-color: rgba(114, 9, 183, 0.2);
}

.gravity-icon {
  background-color: rgba(247, 37, 133, 0.2);
}

.atmosphere-icon {
  background-color: rgba(67, 97, 238, 0.2);
}

.temperature-icon {
  background-color: rgba(58, 12, 163, 0.2);
}

.info-content h4 {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.info-content p {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--color-text);
  margin: 0;
}

.trip-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.trip-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius);
}

.trip-date {
  font-weight: bold;
  color: var(--color-primary);
}

.trip-ship {
  color: var(--color-text);
}

.trip-price {
  font-weight: bold;
}

.no-trips {
  text-align: center;
  padding: 1.5rem;
  color: var(--color-text-secondary);
}

.destination-tabs {
  margin: 3rem 0;
}

.tab-list {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 2rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.tab-list::-webkit-scrollbar {
  display: none;
}

.tab-content {
  padding: 1rem 0;
}

.tab-content h2 {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.tab-content h3 {
  font-size: 1.5rem;
  color: var(--color-text);
  margin: 1.5rem 0 1rem;
}

.destino-descripcion {
  line-height: 1.8;
  color: var(--color-text);
}

.discovery-info {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius);
}

.caracteristicas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.caracteristica-item {
  padding: 1.5rem;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius);
}

.caracteristica-item h3 {
  color: var(--color-primary);
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.actividades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.actividad-card {
  display: flex;
  flex-direction: column;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.actividad-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.actividad-imagen {
  height: 150px;
  overflow: hidden;
}

.actividad-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.actividad-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.actividad-content h3 {
  font-size: 1.2rem;
  color: var(--color-primary);
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.actividad-content p {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  flex-grow: 1;
}

.actividad-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.actividad-duracion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
}

.actividad-precio {
  font-weight: bold;
  color: var(--color-primary);
}

.no-actividades {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.resenas-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.rating-summary {
  display: flex;
  gap: 2rem;
}

.rating-average {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rating-number {
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-primary);
}

.rating-stars {
  margin: 0.5rem 0;
}

.rating-count {
  color: var(--color-text-secondary);
}

.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 250px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-label {
  width: 100px;
  text-align: right;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.rating-bar-container {
  flex-grow: 1;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.rating-bar-fill {
  height: 100%;
  background-color: var(--color-primary);
}

.rating-percentage {
  width: 40px;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.resenas-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.resena-item {
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius);
  padding: 1.5rem;
}

.resena-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.resena-author {
  display: flex;
  gap: 1rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.author-avatar.small {
  width: 30px;
  height: 30px;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info h3 {
  font-size: 1.1rem;
  margin: 0 0 0.25rem;
}

.author-info h4 {
  font-size: 1rem;
  margin: 0 0 0.25rem;
}

.resena-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.resena-content {
  margin-bottom: 1rem;
}

.resena-content h4 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.resena-imagenes {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}

.resena-imagen {
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  cursor: pointer;
}

.resena-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.resena-imagen:hover img {
  transform: scale(1.1);
}

.resena-footer {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.resena-respuestas {
  margin-top: 1rem;
  padding-left: 2rem;
  border-left: 2px solid var(--color-border);
}

.resena-respuesta {
  padding: 1rem 0;
}

.respuesta-header {
  margin-bottom: 0.5rem;
}

.respuesta-date {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.no-resenas {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.resenas-pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.destination-related {
  margin-top: 3rem;
}

.destination-related h2 {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.no-related {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

@media (max-width: 992px) {
  .destination-main {
    grid-template-columns: 1fr;
  }
  
  .destination-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .destination-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .destination-title h1 {
    font-size: 2.5rem;
  }
  
  .destination-actions {
    width: 100%;
  }
  
  .rating-summary {
    flex-direction: column;
    gap: 1rem;
  }
  
  .resenas-header {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .destination-actions {
    flex-direction: column;
  }
  
  .destination-actions button {
    width: 100%;
  }
  
  .trip-item {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .trip-date, .trip-ship, .trip-price {
    width: 100%;
  }
  
  .caracteristicas-grid {
    grid-template-columns: 1fr;
  }
  
  .actividades-grid {
    grid-template-columns: 1fr;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .destination-title h1 {
    font-size: 2rem;
  }
  
  .main-image {
    height: 250px;
  }
  
  .thumbnail {
    width: 80px;
    height: 80px;
  }
  
  .tab-content h2 {
    font-size: 1.5rem;
  }
}

/* Mejoras de accesibilidad */
.btn:focus, 
.thumbnail:focus,
.resena-imagen:focus,
.btn-text:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.destino-content {
  animation: fadeIn 0.5s ease-in-out;
}
</style>
