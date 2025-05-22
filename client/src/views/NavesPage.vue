<template>
  <div class="naves-page">
    <div class="page-header">
      <h1>Naves Espaciales</h1>
      <p>Conoce nuestra flota de naves de última generación</p>
    </div>
    
    <div class="filters-bar">
      <div class="filter-buttons">
        <button 
          v-for="tipo in tiposNave" 
          :key="tipo.id"
          :class="['filter-button', { active: activeFilter === tipo.id }]"
          @click="filterByType(tipo.id)"
        >
          {{ tipo.nombre }}
        </button>
      </div>
      
      <div class="search-container">
        <div class="search-input">
          <SearchIcon class="search-icon" />
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar naves..." 
            @keyup.enter="searchShips"
          />
        </div>
      </div>
    </div>
    
    <div class="sort-container">
      <label for="sort-select">Ordenar por:</label>
      <select id="sort-select" v-model="sortBy" @change="sortShips" class="sort-select">
        <option value="name">Nombre</option>
        <option value="capacity-asc">Capacidad: menor a mayor</option>
        <option value="capacity-desc">Capacidad: mayor a menor</option>
        <option value="speed-asc">Velocidad: menor a mayor</option>
        <option value="speed-desc">Velocidad: mayor a menor</option>
      </select>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando naves...</p>
    </div>
    
    <div v-else-if="filteredShips.length === 0" class="no-results">
      <RocketOffIcon class="no-results-icon" />
      <h3>No se encontraron naves</h3>
      <p>Intenta cambiar los filtros o términos de búsqueda</p>
      <button class="reset-button" @click="resetFilters">Restablecer filtros</button>
    </div>
    
    <div v-else class="ships-grid">
      <div 
        v-for="nave in paginatedShips" 
        :key="nave.id" 
        class="ship-card"
        @click="navigateToDetail(nave.id)"
      >
        <div class="ship-image" :style="{ backgroundImage: `url(${nave.imagen})` }">
          <div class="ship-overlay">
            <span class="ship-type">{{ nave.tipo }}</span>
          </div>
        </div>
        <div class="ship-content">
          <h3>{{ nave.nombre }}</h3>
          <p class="ship-description">{{ nave.descripcion }}</p>
          
          <div class="ship-specs">
            <div class="spec-item">
              <UsersIcon class="icon-small" />
              <span>{{ nave.capacidad }} pasajeros</span>
            </div>
            <div class="spec-item">
              <span>{{ nave.velocidad }} km/h</span>
            </div>
            <div class="spec-item">
              <CompassIcon class="icon-small" />
              <span>{{ nave.rango }}</span>
            </div>
          </div>
          
          <div class="ship-actions">
            <button class="view-details-button">Ver detalles</button>
            <button class="reserve-button">Reservar</button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  SearchIcon, UsersIcon, CompassIcon, 
  RocketOffIcon, ChevronRightIcon 
} from '@/utils/lucide-adapter';

const router = useRouter();

// Estado
const searchQuery = ref('');
const activeFilter = ref(null);
const currentPage = ref(1);
const itemsPerPage = 6;
const loading = ref(false);
const sortBy = ref('name');

// Datos de ejemplo
const tiposNave = ref([
  { id: 'orbital', nombre: 'Orbitales' },
  { id: 'interplanetaria', nombre: 'Interplanetarias' },
  { id: 'exploración', nombre: 'Exploración' }
]);

const naves = ref([
  {
    id: 1,
    nombre: 'Orion',
    tipo: 'Orbital',
    descripcion: 'Nave de exploración lunar diseñada para misiones de corta duración.',
    capacidad: 6,
    velocidad: 28000,
    rango: 'Órbita Terrestre - Luna',
    imagen: '/placeholder.svg?height=300&width=500&query=space+capsule'
  },
  {
    id: 2,
    nombre: 'Starship',
    tipo: 'Interplanetaria',
    descripcion: 'Nave de gran capacidad para viajes interplanetarios de larga duración.',
    capacidad: 100,
    velocidad: 35000,
    rango: 'Sistema Solar Completo',
    imagen: '/placeholder.svg?height=300&width=500&query=starship+spacecraft'
  },
  {
    id: 3,
    nombre: 'Explorer I',
    tipo: 'Exploración',
    descripcion: 'Nave especializada en exploración científica con laboratorios avanzados.',
    capacidad: 12,
    velocidad: 30000,
    rango: 'Sistema Solar Interior',
    imagen: '/placeholder.svg?height=300&width=500&query=exploration+spacecraft'
  },
  {
    id: 4,
    nombre: 'Lunar Shuttle',
    tipo: 'Orbital',
    descripcion: 'Transporte rápido y eficiente entre la Tierra y la Luna.',
    capacidad: 20,
    velocidad: 25000,
    rango: 'Tierra - Luna',
    imagen: '/placeholder.svg?height=300&width=500&query=lunar+shuttle'
  },
  {
    id: 5,
    nombre: 'Mars Pioneer',
    tipo: 'Interplanetaria',
    descripcion: 'Diseñada específicamente para viajes a Marte con sistemas de soporte vital avanzados.',
    capacidad: 50,
    velocidad: 32000,
    rango: 'Tierra - Marte',
    imagen: '/placeholder.svg?height=300&width=500&query=mars+spacecraft'
  },
  {
    id: 6,
    nombre: 'Voyager X',
    tipo: 'Exploración',
    descripcion: 'Nave de exploración de largo alcance con tecnología de propulsión avanzada.',
    capacidad: 8,
    velocidad: 40000,
    rango: 'Sistema Solar Completo',
    imagen: '/placeholder.svg?height=300&width=500&query=voyager+spacecraft'
  },
  {
    id: 7,
    nombre: 'Space Cruiser',
    tipo: 'Interplanetaria',
    descripcion: 'Crucero espacial de lujo para viajes turísticos por el sistema solar.',
    capacidad: 150,
    velocidad: 28000,
    rango: 'Sistema Solar Interior',
    imagen: '/placeholder.svg?height=300&width=500&query=space+cruiser'
  },
  {
    id: 8,
    nombre: 'Asteroid Miner',
    tipo: 'Exploración',
    descripcion: 'Nave especializada en la exploración y minería de asteroides.',
    capacidad: 15,
    velocidad: 26000,
    rango: 'Cinturón de Asteroides',
    imagen: '/placeholder.svg?height=300&width=500&query=asteroid+mining+ship'
  },
  {
    id: 9,
    nombre: 'Europa Submersible',
    tipo: 'Exploración',
    descripcion: 'Nave diseñada para explorar los océanos subterráneos de Europa, luna de Júpiter.',
    capacidad: 10,
    velocidad: 38000,
    rango: 'Júpiter y sus lunas',
    imagen: '/placeholder.svg?height=300&width=500&query=europa+submersible'
  }
]);

// Naves filtradas
const filteredShips = computed(() => {
  let result = [...naves.value];
  
  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(nave => 
      nave.nombre.toLowerCase().includes(query) ||
      nave.tipo.toLowerCase().includes(query) ||
      nave.descripcion.toLowerCase().includes(query)
    );
  }
  
  // Filtrar por tipo
  if (activeFilter.value) {
    result = result.filter(nave => 
      nave.tipo.toLowerCase() === activeFilter.value
    );
  }
  
  // Ordenar
  switch (sortBy.value) {
    case 'capacity-asc':
      result.sort((a, b) => a.capacidad - b.capacidad);
      break;
    case 'capacity-desc':
      result.sort((a, b) => b.capacidad - a.capacidad);
      break;
    case 'speed-asc':
      result.sort((a, b) => a.velocidad - b.velocidad);
      break;
    case 'speed-desc':
      result.sort((a, b) => b.velocidad - a.velocidad);
      break;
    case 'name':
    default:
      result.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
  }
  
  return result;
});

// Paginación
const paginatedShips = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredShips.value.slice(start, end);
});

const totalPages = computed(() => 
  Math.ceil(filteredShips.value.length / itemsPerPage)
);

// Métodos
function searchShips() {
  currentPage.value = 1;
  // Aquí podrías implementar una búsqueda en el servidor
}

function filterByType(type) {
  activeFilter.value = activeFilter.value === type ? null : type;
  currentPage.value = 1;
}

function sortShips() {
  currentPage.value = 1;
}

function resetFilters() {
  searchQuery.value = '';
  activeFilter.value = null;
  sortBy.value = 'name';
  currentPage.value = 1;
}

function changePage(page) {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToDetail(id) {
  router.push(`/naves/${id}`);
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
.naves-page {
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

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-button {
  padding: 0.5rem 1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  color: var(--color-text);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-button.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.search-container {
  flex: 1;
  max-width: 400px;
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

.reset-button {
  background: none;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-button:hover {
  background-color: var(--color-primary);
  color: white;
}

.ships-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.ship-card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.ship-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.ship-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.ship-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.ship-type {
  background-color: var(--color-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
}

.ship-content {
  padding: 1.5rem;
}

.ship-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.ship-description {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ship-specs {
  background-color: var(--color-background);
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  margin-bottom: 1.5rem;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.spec-item:last-child {
  margin-bottom: 0;
}

.icon-small {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
}

.ship-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.view-details-button, .reserve-button {
  padding: 0.75rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.view-details-button {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.view-details-button:hover {
  background-color: var(--color-primary);
  color: white;
}

.reserve-button {
  background-color: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: white;
}

.reserve-button:hover {
  background-color: var(--color-primary-dark);
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

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    max-width: none;
  }
  
  .ships-grid {
    grid-template-columns: 1fr;
  }
}
</style>
