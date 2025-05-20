<template>
  <div class="reservas-page">
    <div class="page-header">
      <h1>Mis Reservas</h1>
      <p>Gestiona tus viajes espaciales</p>
    </div>
    
    <div v-if="!isLoggedIn" class="login-prompt">
      <div class="login-content">
        <LockIcon class="login-icon" />
        <h2>Acceso Restringido</h2>
        <p>Debes iniciar sesión para ver tus reservas</p>
        <router-link to="/login" class="login-button">Iniciar Sesión</router-link>
      </div>
    </div>
    
    <template v-else>
      <div class="filters-bar">
        <div class="filter-tabs">
          <button 
            v-for="tab in statusTabs" 
            :key="tab.value"
            :class="['tab-button', { active: activeTab === tab.value }]"
            @click="filterByStatus(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="search-container">
          <div class="search-input">
            <SearchIcon class="search-icon" />
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Buscar reservas..." 
              @keyup.enter="searchReservations"
            />
          </div>
        </div>
      </div>
      
      <div class="sort-container">
        <label for="sort-select">Ordenar por:</label>
        <select id="sort-select" v-model="sortBy" @change="sortReservations" class="sort-select">
          <option value="date-desc">Fecha: más reciente primero</option>
          <option value="date-asc">Fecha: más antigua primero</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="price-asc">Precio: menor a mayor</option>
        </select>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando reservas...</p>
      </div>
      
      <div v-else-if="filteredReservations.length === 0" class="no-results">
        <CalendarOffIcon class="no-results-icon" />
        <h3>No se encontraron reservas</h3>
        <p v-if="activeTab !== 'all'">Prueba a cambiar el filtro de estado</p>
        <p v-else>Aún no tienes reservas</p>
        <router-link to="/destinos" class="explore-button">Explorar destinos</router-link>
      </div>
      
      <div v-else class="reservations-list">
        <div 
          v-for="reserva in paginatedReservations" 
          :key="reserva.id" 
          class="reservation-card"
        >
          <div class="reservation-header">
            <div class="reservation-id">
              <span class="label">Reserva #</span>
              <span class="value">{{ reserva.id }}</span>
            </div>
            <div :class="['reservation-status', reserva.estado.toLowerCase()]">
              {{ reserva.estado }}
            </div>
          </div>
          
          <div class="reservation-content">
            <div class="reservation-destination">
              <div class="destination-image" :style="{ backgroundImage: `url(${reserva.imagen})` }"></div>
              <div class="destination-info">
                <h3>{{ reserva.destino }}</h3>
                <div class="destination-meta">
                  <span class="destination-ship">
                    <RocketIcon class="icon-small" />
                    {{ reserva.nave }}
                  </span>
                  <span class="destination-passengers">
                    <UsersIcon class="icon-small" />
                    {{ reserva.pasajeros }} pasajeros
                  </span>
                </div>
              </div>
            </div>
            
            <div class="reservation-details">
              <div class="detail-group">
                <div class="detail-item">
                  <span class="label">Fecha de salida</span>
                  <span class="value">{{ formatDate(reserva.fechaSalida) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Fecha de regreso</span>
                  <span class="value">{{ formatDate(reserva.fechaRegreso) }}</span>
                </div>
              </div>
              
              <div class="detail-group">
                <div class="detail-item">
                  <span class="label">Duración</span>
                  <span class="value">{{ reserva.duracion }} días</span>
                </div>
                <div class="detail-item">
                  <span class="label">Precio total</span>
                  <span class="value price">{{ formatPrice(reserva.precio) }}</span>
                </div>
              </div>
            </div>
            
            <div class="reservation-actions">
              <router-link :to="`/reservas/${reserva.id}`" class="view-button">
                Ver detalles
              </router-link>
              
              <button 
                v-if="reserva.estado === 'Pendiente' || reserva.estado === 'Confirmada'"
                class="cancel-button"
                @click="showCancelModal(reserva)"
              >
                Cancelar reserva
              </button>
              
              <button 
                v-if="reserva.estado === 'Completada'"
                class="review-button"
                @click="showReviewModal(reserva)"
              >
                Dejar reseña
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="pagination">
        <button 
          class="pagination-button" 
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <ChevronLeftIcon />
        </button>
        
        <button 
          v-for="page in totalPages" 
          :key="page"
          :class="['page-number', { active: page === currentPage }]"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        
        <button 
          class="pagination-button" 
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </template>
    
    <!-- Modal de cancelación -->
    <div v-if="showCancel" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Cancelar Reserva</h3>
          <button class="close-button" @click="closeModal">
            <XIcon />
          </button>
        </div>
        <div class="modal-content">
          <p>¿Estás seguro de que deseas cancelar la reserva para <strong>{{ selectedReservation?.destino }}</strong>?</p>
          <p class="warning">Esta acción no se puede deshacer.</p>
          
          <div class="cancellation-policy">
            <h4>Política de cancelación:</h4>
            <ul>
              <li>Cancelación con más de 30 días de antelación: reembolso del 90%</li>
              <li>Cancelación entre 15-30 días: reembolso del 50%</li>
              <li>Cancelación con menos de 15 días: sin reembolso</li>
            </ul>
            
            <div class="refund-info">
              <p>Reembolso estimado: <strong>{{ calculateRefund(selectedReservation) }}</strong></p>
            </div>
          </div>
          
          <div class="cancellation-reason">
            <label for="cancel-reason">Motivo de la cancelación (opcional):</label>
            <textarea 
              id="cancel-reason" 
              v-model="cancellationReason" 
              rows="3" 
              placeholder="Indica el motivo de la cancelación..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="secondary-button" @click="closeModal">Volver</button>
          <button class="danger-button" @click="confirmCancellation">Confirmar Cancelación</button>
        </div>
      </div>
    </div>
    
    <!-- Modal de reseña -->
    <div v-if="showReview" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Dejar Reseña</h3>
          <button class="close-button" @click="closeModal">
            <XIcon />
          </button>
        </div>
        <div class="modal-content">
          <p>Comparte tu experiencia en <strong>{{ selectedReservation?.destino }}</strong></p>
          
          <div class="rating-container">
            <label>Puntuación:</label>
            <div class="star-rating">
              <button 
                v-for="star in 5" 
                :key="star"
                :class="['star-button', { active: star <= reviewRating }]"
                @click="reviewRating = star"
              >
                <StarIcon />
              </button>
            </div>
          </div>
          
          <div class="review-text">
            <label for="review-content">Tu reseña:</label>
            <textarea 
              id="review-content" 
              v-model="reviewContent" 
              rows="5" 
              placeholder="Comparte tu experiencia con otros viajeros..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="secondary-button" @click="closeModal">Cancelar</button>
          <button 
            class="primary-button" 
            @click="submitReview"
            :disabled="reviewRating === 0 || !reviewContent.trim()"
          >
            Enviar Reseña
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  SearchIcon, RocketIcon, UsersIcon, LockIcon, 
  CalendarOffIcon, ChevronLeftIcon, ChevronRightIcon,
  XIcon, StarIcon
} from 'lucide-vue-next';

const router = useRouter();

// Estado
const isLoggedIn = ref(true); // Cambiar a false para probar el prompt de inicio de sesión
const searchQuery = ref('');
const activeTab = ref('all');
const currentPage = ref(1);
const itemsPerPage = 5;
const loading = ref(false);
const sortBy = ref('date-desc');

// Estado para modales
const showCancel = ref(false);
const showReview = ref(false);
const selectedReservation = ref(null);
const cancellationReason = ref('');
const reviewRating = ref(0);
const reviewContent = ref('');

// Datos de ejemplo
const statusTabs = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Confirmadas', value: 'confirmada' },
  { label: 'Completadas', value: 'completada' },
  { label: 'Canceladas', value: 'cancelada' }
];

const reservas = ref([
  {
    id: 'R-1001',
    destino: 'Luna',
    nave: 'Orion',
    estado: 'Confirmada',
    fechaSalida: new Date(2024, 5, 15),
    fechaRegreso: new Date(2024, 5, 18),
    duracion: 3,
    pasajeros: 2,
    precio: 30000,
    imagen: '/placeholder.svg?height=300&width=500&query=moon+surface'
  },
  {
    id: 'R-1002',
    destino: 'Marte',
    nave: 'Starship',
    estado: 'Pendiente',
    fechaSalida: new Date(2024, 7, 20),
    fechaRegreso: new Date(2024, 7, 27),
    duracion: 7,
    pasajeros: 3,
    precio: 105000,
    imagen: '/placeholder.svg?height=300&width=500&query=mars+surface'
  },
  {
    id: 'R-1003',
    destino: 'Estación Espacial',
    nave: 'Lunar Shuttle',
    estado: 'Completada',
    fechaSalida: new Date(2024, 2, 5),
    fechaRegreso: new Date(2024, 2, 10),
    duracion: 5,
    pasajeros: 2,
    precio: 24000,
    imagen: '/placeholder.svg?height=300&width=500&query=space+station'
  },
  {
    id: 'R-1004',
    destino: 'Europa',
    nave: 'Voyager X',
    estado: 'Cancelada',
    fechaSalida: new Date(2024, 4, 10),
    fechaRegreso: new Date(2024, 4, 20),
    duracion: 10,
    pasajeros: 1,
    precio: 50000,
    imagen: '/placeholder.svg?height=300&width=500&query=europa+moon'
  },
  {
    id: 'R-1005',
    destino: 'Venus',
    nave: 'Explorer I',
    estado: 'Confirmada',
    fechaSalida: new Date(2024, 8, 12),
    fechaRegreso: new Date(2024, 8, 18),
    duracion: 6,
    pasajeros: 2,
    precio: 60000,
    imagen: '/placeholder.svg?height=300&width=500&query=venus+planet'
  },
  {
    id: 'R-1006',
    destino: 'Titán',
    nave: 'Mars Pioneer',
    estado: 'Pendiente',
    fechaSalida: new Date(2024, 9, 5),
    fechaRegreso: new Date(2024, 9, 17),
    duracion: 12,
    pasajeros: 4,
    precio: 240000,
    imagen: '/placeholder.svg?height=300&width=500&query=titan+moon'
  },
  {
    id: 'R-1007',
    destino: 'Ceres',
    nave: 'Asteroid Miner',
    estado: 'Confirmada',
    fechaSalida: new Date(2024, 10, 15),
    fechaRegreso: new Date(2024, 10, 24),
    duracion: 9,
    pasajeros: 2,
    precio: 90000,
    imagen: '/placeholder.svg?height=300&width=500&query=ceres+asteroid'
  }
]);

// Reservas filtradas
const filteredReservations = computed(() => {
  let result = [...reservas.value];
  
  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(reserva => 
      reserva.destino.toLowerCase().includes(query) ||
      reserva.nave.toLowerCase().includes(query) ||
      reserva.id.toLowerCase().includes(query)
    );
  }
  
  // Filtrar por estado
  if (activeTab.value !== 'all') {
    result = result.filter(reserva => 
      reserva.estado.toLowerCase() === activeTab.value
    );
  }
  
  // Ordenar
  switch (sortBy.value) {
    case 'date-asc':
      result.sort((a, b) => a.fechaSalida - b.fechaSalida);
      break;
    case 'date-desc':
      result.sort((a, b) => b.fechaSalida - a.fechaSalida);
      break;
    case 'price-asc':
      result.sort((a, b) => a.precio - b.precio);
      break;
    case 'price-desc':
      result.sort((a, b) => b.precio - a.precio);
      break;
  }
  
  return result;
});

// Paginación
const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredReservations.value.slice(start, end);
});

const totalPages = computed(() => 
  Math.ceil(filteredReservations.value.length / itemsPerPage)
);

// Métodos
function searchReservations() {
  currentPage.value = 1;
}

function filterByStatus(status) {
  activeTab.value = status;
  currentPage.value = 1;
}

function sortReservations() {
  currentPage.value = 1;
}

function changePage(page) {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatDate(date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function formatPrice(price) {
  return `$${price.toLocaleString()}`;
}

function showCancelModal(reservation) {
  selectedReservation.value = reservation;
  showCancel.value = true;
}

function showReviewModal(reservation) {
  selectedReservation.value = reservation;
  showReview.value = true;
}

function closeModal() {
  showCancel.value = false;
  showReview.value = false;
  selectedReservation.value = null;
  cancellationReason.value = '';
  reviewRating.value = 0;
  reviewContent.value = '';
}

function calculateRefund(reservation) {
  if (!reservation) return '$0';
  
  const today = new Date();
  const departureDate = new Date(reservation.fechaSalida);
  const daysUntilDeparture = Math.ceil((departureDate - today) / (1000 * 60 * 60 * 24));
  
  let refundPercentage = 0;
  if (daysUntilDeparture > 30) {
    refundPercentage = 0.9;
  } else if (daysUntilDeparture >= 15) {
    refundPercentage = 0.5;
  }
  
  const refundAmount = reservation.precio * refundPercentage;
  return formatPrice(refundAmount);
}

function confirmCancellation() {
  // Aquí iría la lógica para cancelar la reserva
  console.log('Cancelando reserva:', selectedReservation.value.id);
  console.log('Motivo:', cancellationReason.value);
  
  // Actualizar el estado de la reserva en el array
  const index = reservas.value.findIndex(r => r.id === selectedReservation.value.id);
  if (index !== -1) {
    reservas.value[index].estado = 'Cancelada';
  }
  
  closeModal();
}

function submitReview() {
  // Aquí iría la lógica para enviar la reseña
  console.log('Enviando reseña para:', selectedReservation.value.destino);
  console.log('Puntuación:', reviewRating.value);
  console.log('Contenido:', reviewContent.value);
  
  closeModal();
}

// Simulación de carga de datos
onMounted(() => {
  loading.value = true;
  
  // Simular carga de datos
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});
</script>

<style scoped>
.reservas-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.page-header p {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
}

.login-prompt {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.login-content {
  max-width: 400px;
  margin: 0 auto;
}

.login-icon {
  width: 64px;
  height: 64px;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.login-prompt h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.login-prompt p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.login-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--border-radius-sm);
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: var(--color-primary-dark);
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tab-button {
  padding: 0.5rem 1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  color: var(--color-text);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tab-button.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.search-container {
  flex: 1;
  max-width: 300px;
}

.search-input {
  display: flex;
  align-items: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: 0.5rem 1rem;
}

.search-icon {
  color: var(--color-text-secondary);
  margin-right: 0.5rem;
}

.search-input input {
  flex: 1;
  border: none;
  padding: 0.25rem 0;
  font-size: 0.875rem;
  background: transparent;
  color: var(--color-text);
}

.search-input input:focus {
  outline: none;
}

.sort-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-results {
  text-align: center;
  padding: 3rem;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
}

.no-results-icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.no-results h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.no-results p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.explore-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--border-radius-sm);
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.explore-button:hover {
  background-color: var(--color-primary-dark);
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.reservation-card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
}

.reservation-id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.value {
  font-weight: 600;
  color: var(--color-text);
}

.reservation-status {
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
}

.reservation-status.pendiente {
  background-color: #f59e0b;
  color: white;
}

.reservation-status.confirmada {
  background-color: var(--color-primary);
  color: white;
}

.reservation-status.completada {
  background-color: var(--color-success);
  color: white;
}

.reservation-status.cancelada {
  background-color: var(--color-error);
  color: white;
}

.reservation-content {
  padding: 1.5rem;
}

.reservation-destination {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.destination-image {
  width: 120px;
  height: 80px;
  background-size: cover;
  background-position: center;
  border-radius: var(--border-radius-sm);
}

.destination-info {
  flex: 1;
}

.destination-info h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.destination-meta {
  display: flex;
  gap: 1.5rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.destination-ship, .destination-passengers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.reservation-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background-color: var(--color-background);
  border-radius: var(--border-radius-sm);
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.price {
  color: var(--color-primary);
  font-weight: 700;
}

.reservation-actions {
  display: flex;
  gap: 1rem;
}

.view-button, .cancel-button, .review-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.view-button {
  background-color: var(--color-primary);
  color: white;
  text-decoration: none;
}

.view-button:hover {
  background-color: var(--color-primary-dark);
}

.cancel-button {
  background-color: transparent;
  border: 1px solid var(--color-error);
  color: var(--color-error);
}

.cancel-button:hover {
  background-color: var(--color-error);
  color: white;
}

.review-button {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.review-button:hover {
  background-color: var(--color-primary);
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.pagination-button, .page-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover, .page-number:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-number.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  font-size: 1.5rem;
  color: var(--color-text);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.3s;
}

.close-button:hover {
  color: var(--color-text);
}

.modal-content {
  padding: 1.5rem;
}

.warning {
  color: var(--color-error);
  font-weight: 500;
  margin-top: 0.5rem;
}

.cancellation-policy {
  background-color: var(--color-background);
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  margin: 1.5rem 0;
}

.cancellation-policy h4 {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.cancellation-policy ul {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.cancellation-policy li {
  margin-bottom: 0.25rem;
  color: var(--color-text-secondary);
}

.refund-info {
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.cancellation-reason, .review-text {
  margin-top: 1.5rem;
}

.cancellation-reason label, .review-text label, .rating-container label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text);
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.rating-container {
  margin-bottom: 1.5rem;
}

.star-rating {
  display: flex;
  gap: 0.25rem;
}

.star-button {
  background: none;
  border: none;
  color: #d1d5db;
  cursor: pointer;
  transition: color 0.3s;
  padding: 0;
}

.star-button.active {
  color: #f59e0b;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.secondary-button, .danger-button, .primary-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.secondary-button {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.secondary-button:hover {
  border-color: var(--color-text);
}

.danger-button {
  background-color: var(--color-error);
  color: white;
  border: none;
}

.danger-button:hover {
  background-color: #dc2626;
}

.primary-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.primary-button:hover {
  background-color: var(--color-primary-dark);
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    max-width: none;
  }
  
  .reservation-destination {
    flex-direction: column;
    gap: 1rem;
  }
  
  .destination-image {
    width: 100%;
    height: 150px;
  }
  
  .reservation-details {
    grid-template-columns: 1fr;
  }
  
  .reservation-actions {
    flex-direction: column;
  }
}
</style>
