<template>
  <div class="ships-list">
    <div class="ships-container">
      <div class="ships-filters">
        <h2 class="filters-title">Filtros</h2>
        
        <div class="filter-group">
          <h3>Tipo de Nave</h3>
          <div class="filter-options" role="group" aria-label="Filtrar por tipo de nave">
            <label class="filter-option">
              <input 
                type="checkbox" 
                v-model="filters.types" 
                value="Orbital"
                @change="applyFilters"
              />
              <span class="filter-text">Lanzadera Orbital</span>
            </label>
            <label class="filter-option">
              <input 
                type="checkbox" 
                v-model="filters.types" 
                value="Interplanetaria"
                @change="applyFilters"
              />
              <span class="filter-text">Crucero Interplanetario</span>
            </label>
            <label class="filter-option">
              <input 
                type="checkbox" 
                v-model="filters.types" 
                value="Exploración"
                @change="applyFilters"
              />
              <span class="filter-text">Nave de Exploración</span>
            </label>
          </div>
        </div>
        
        <div class="filter-group">
          <h3>Capacidad</h3>
          <div class="filter-options" role="group" aria-label="Filtrar por capacidad de pasajeros">
            <label class="filter-option">
              <input 
                type="checkbox" 
                v-model="filters.capacity" 
                value="small"
                @change="applyFilters"
              />
              <span class="filter-text">Pequeña (hasta 50 pasajeros)</span>
            </label>
            <label class="filter-option">
              <input 
                type="checkbox" 
                v-model="filters.capacity" 
                value="medium"
                @change="applyFilters"
              />
              <span class="filter-text">Mediana (50-150 pasajeros)</span>
            </label>
            <label class="filter-option">
              <input 
                type="checkbox" 
                v-model="filters.capacity" 
                value="large"
                @change="applyFilters"
              />
              <span class="filter-text">Grande (más de 150 pasajeros)</span>
            </label>
          </div>
        </div>
        
        <div class="filter-group">
          <h3>Rango</h3>
          <div class="filter-options" role="group" aria-label="Filtrar por rango de la nave">
            <label class="filter-option">
              <input 
                type="checkbox" 
                v-model="filters.range" 
                value="earth"
                @change="applyFilters"
              />
              <span class="filter-text">Órbita Terrestre</span>
            </label>
            <label class="filter-option">
              <input 
                type="checkbox" 
                v-model="filters.range" 
                value="moon"
                @change="applyFilters"
              />
              <span class="filter-text">Luna</span>
            </label>
            <label class="filter-option">
              <input 
                type="checkbox" 
                v-model="filters.range" 
                value="mars"
                @change="applyFilters"
              />
              <span class="filter-text">Marte</span>
            </label>
            <label class="filter-option">
              <input 
                type="checkbox" 
                v-model="filters.range" 
                value="outer"
                @change="applyFilters"
              />
              <span class="filter-text">Sistema Solar Exterior</span>
            </label>
          </div>
        </div>
        
        <div class="filter-group">
          <h3>Ordenar por</h3>
          <div class="filter-options" role="radiogroup" aria-label="Ordenar naves por">
            <label class="filter-option">
              <input 
                type="radio" 
                v-model="sortBy" 
                value="name"
                name="sortBy"
                @change="applyFilters"
              />
              <span class="filter-text">Nombre</span>
            </label>
            <label class="filter-option">
              <input 
                type="radio" 
                v-model="sortBy" 
                value="capacity"
                name="sortBy"
                @change="applyFilters"
              />
              <span class="filter-text">Capacidad</span>
            </label>
            <label class="filter-option">
              <input 
                type="radio" 
                v-model="sortBy" 
                value="speed"
                name="sortBy"
                @change="applyFilters"
              />
              <span class="filter-text">Velocidad</span>
            </label>
          </div>
          
          <div class="filter-options" role="radiogroup" aria-label="Orden">
            <label class="filter-option">
              <input 
                type="radio" 
                v-model="sortOrder" 
                value="asc"
                name="sortOrder"
                @change="applyFilters"
              />
              <span class="filter-text">Ascendente</span>
            </label>
            <label class="filter-option">
              <input 
                type="radio" 
                v-model="sortOrder" 
                value="desc"
                name="sortOrder"
                @change="applyFilters"
              />
              <span class="filter-text">Descendente</span>
            </label>
          </div>
        </div>
        
        <button 
          class="btn btn-outline filter-reset" 
          @click="resetFilters"
          aria-label="Restablecer todos los filtros"
        >
          <RefreshCwIcon size="16" class="mr-2" />
          Restablecer Filtros
        </button>
        
        <div class="filter-summary" aria-live="polite">
          <p>{{ filteredShips.length }} naves encontradas</p>
        </div>
      </div>
      
      <div class="ships-content">
        <div class="ships-header">
          <h1>Nuestras Naves Espaciales</h1>
          <div class="ships-search">
            <div class="search-input">
              <SearchIcon size="18" class="search-icon" />
              <input 
                type="text" 
                v-model="searchQuery" 
                @input="applyFilters"
                placeholder="Buscar naves..." 
                aria-label="Buscar naves por nombre"
              />
              <button 
                v-if="searchQuery" 
                @click="clearSearch" 
                class="clear-search"
                aria-label="Borrar búsqueda"
              >
                <XIcon size="16" />
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="loading" class="loading-container" aria-live="polite" aria-busy="true">
          <div class="loading-spinner"></div>
          <p>Cargando naves...</p>
        </div>
        
        <div v-else-if="error" class="error-container" aria-live="assertive">
          <AlertTriangleIcon size="24" class="error-icon" />
          <p>{{ error }}</p>
          <button @click="fetchShips" class="btn">Reintentar</button>
        </div>
        
        <div v-else>
          <!-- Usar VirtualList para listas largas -->
          <VirtualList
            v-if="filteredShips.length > 0"
            :items="filteredShips"
            :item-height="400"
            :height="700"
            :buffer="3"
            :key-extractor="item => item.ID"
            @end-reached="loadMoreShips"
            class="ships-virtual-list"
            aria-label="Lista de naves espaciales"
          >
            <template v-slot="{ item }">
              <div 
                class="ship-card"
                :id="`ship-${item.ID}`"
                tabindex="0"
                @click="navigateToShipDetail(item.ID)"
                @keydown.enter="navigateToShipDetail(item.ID)"
                @keydown.space.prevent="navigateToShipDetail(item.ID)"
                role="article"
                aria-labelledby="`ship-title-${item.ID}`"
              >
                <div class="ship-image" :style="{ backgroundColor: getShipColor(item) }">
                  <img 
                    v-if="item.IMAGEN"
                    :src="item.IMAGEN"
                    :alt="`Imagen de la nave ${item.NOMBRE}`"
                    loading="lazy"
                    class="ship-img"
                  />
                  <div class="ship-badge">{{ item.TIPO }}</div>
                  <div class="ship-capacity">{{ item.CAPACIDAD }} pasajeros</div>
                </div>
                <div class="ship-content">
                  <h3 :id="`ship-title-${item.ID}`" class="ship-title">{{ item.NOMBRE }}</h3>
                  <p class="ship-description">{{ truncateText(item.DESCRIPCION, 120) }}</p>
                  <div class="ship-specs">
                    <div class="spec-item">
                      <span class="spec-label">Velocidad:</span>
                      <span class="spec-value">{{ formatNumber(item.VELOCIDAD) }} km/s</span>
                    </div>
                    <div class="spec-item">
                      <span class="spec-label">Propulsión:</span>
                      <span class="spec-value">{{ item.PROPULSION }}</span>
                    </div>
                    <div class="spec-item">
                      <span class="spec-label">Rango:</span>
                      <span class="spec-value">{{ item.RANGO }}</span>
                    </div>
                  </div>
                  <div class="ship-footer">
                    <button 
                      class="btn btn-outline"
                      @click.stop="navigateToShipDetail(item.ID)"
                      aria-label="Ver detalles de la nave"
                    >
                      <EyeIcon size="16" class="mr-2" />
                      Ver detalles
                    </button>
                    <button 
                      class="btn btn-primary"
                      @click.stop="navigateToReservation(item.ID)"
                      aria-label="Reservar esta nave"
                    >
                      <RocketIcon size="16" class="mr-2" />
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            </template>
            
            <template v-slot:loading>
              <div class="loading-more" aria-live="polite">
                <div class="loading-spinner small"></div>
                <span>Cargando más naves...</span>
              </div>
            </template>
            
            <template v-slot:empty>
              <div class="no-results" aria-live="polite">
                <SearchXIcon size="48" class="no-results-icon" />
                <p>No se encontraron naves que coincidan con los filtros seleccionados.</p>
                <button @click="resetFilters" class="btn">Restablecer Filtros</button>
              </div>
            </template>
          </VirtualList>
          
          <div v-else class="no-results" aria-live="polite">
            <SearchXIcon size="48" class="no-results-icon" />
            <p>No se encontraron naves que coincidan con los filtros seleccionados.</p>
            <button @click="resetFilters" class="btn">Restablecer Filtros</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  RefreshCwIcon, SearchIcon, XIcon, AlertTriangleIcon, 
  EyeIcon, RocketIcon, SearchXIcon 
} from '@/utils/lucide-adapter';
import { formatNumber, formatPrice } from '../../utils/format';
import VirtualList from '../common/VirtualList.vue';
import { useNavesStore } from '../../stores/naves';
import { storeToRefs } from 'pinia';
import { useLazyLoad } from '../../composables/useLazyLoad';
import { useAnalytics } from '../../composables/useAnalytics';

// Router
const router = useRouter();

// Stores y composables
const navesStore = useNavesStore();
const { naves: storeNaves, loading: storeLoading, error: storeError } = storeToRefs(navesStore);
const { trackEvent } = useAnalytics();

// Estado
const filters = reactive({
  types: [],
  capacity: [],
  range: []
});
const searchQuery = ref('');
const sortBy = ref('name');
const sortOrder = ref('asc');
const ships = ref([]);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(12);
const loadingMore = ref(false);

// Composable para lazy loading
const { loadMore, hasMore } = useLazyLoad({
  fetchFunction: async (page) => {
    return await navesStore.fetchNaves({
      page,
      limit: itemsPerPage.value
    });
  },
  initialPage: currentPage.value,
  itemsPerPage: itemsPerPage.value
});

// Métodos para filtrado
const getCapacityCategory = (capacity) => {
  if (capacity <= 50) return 'small';
  if (capacity <= 150) return 'medium';
  return 'large';
};

const getRangeCategory = (range) => {
  if (!range) return '';
  const rangeLower = range.toLowerCase();
  if (rangeLower.includes('órbita') || rangeLower.includes('orbita')) return 'earth';
  if (rangeLower.includes('luna')) return 'moon';
  if (rangeLower.includes('marte')) return 'mars';
  return 'outer';
};

// Naves filtradas y ordenadas
const filteredShips = computed(() => {
  // Primero filtrar
  let result = ships.value.filter(ship => {
    // Filtrar por búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const matchesName = ship.NOMBRE.toLowerCase().includes(query);
      const matchesDescription = ship.DESCRIPCION?.toLowerCase().includes(query);
      const matchesType = ship.TIPO?.toLowerCase().includes(query);
      
      if (!matchesName && !matchesDescription && !matchesType) {
        return false;
      }
    }
    
    // Filtrar por tipo
    if (filters.types.length > 0 && !filters.types.includes(ship.TIPO)) {
      return false;
    }
    
    // Filtrar por capacidad
    if (filters.capacity.length > 0 && !filters.capacity.includes(getCapacityCategory(ship.CAPACIDAD))) {
      return false;
    }
    
    // Filtrar por rango
    if (filters.range.length > 0 && !filters.range.includes(getRangeCategory(ship.RANGO))) {
      return false;
    }
    
    return true;
  });
  
  // Luego ordenar
  result.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy.value) {
      case 'name':
        valueA = a.NOMBRE;
        valueB = b.NOMBRE;
        break;
      case 'capacity':
        valueA = a.CAPACIDAD;
        valueB = b.CAPACIDAD;
        break;
      case 'speed':
        valueA = a.VELOCIDAD;
        valueB = b.VELOCIDAD;
        break;
      default:
        valueA = a.NOMBRE;
        valueB = b.NOMBRE;
    }
    
    // Comparar valores
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortOrder.value === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    } else {
      return sortOrder.value === 'asc' 
        ? valueA - valueB 
        : valueB - valueA;
    }
  });
  
  return result;
});

// Cargar naves
const fetchShips = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await navesStore.fetchNaves({
      page: currentPage.value,
      limit: itemsPerPage.value
    });
    
    ships.value = [...storeNaves.value];
    
    // Registrar evento en analytics
    trackEvent('view_item_list', {
      item_list_id: 'ships',
      item_list_name: 'Naves Espaciales'
    });
  } catch (err) {
    console.error('Error fetching ships:', err);
    error.value = 'No se pudieron cargar las naves. Por favor, inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

// Cargar más naves
const loadMoreShips = async () => {
  if (loadingMore.value || !hasMore.value) return;
  
  loadingMore.value = true;
  
  try {
    const newItems = await loadMore();
    if (newItems && newItems.length > 0) {
      ships.value = [...ships.value, ...newItems];
    }
  } catch (err) {
    console.error('Error al cargar más naves:', err);
  } finally {
    loadingMore.value = false;
  }
};

// Aplicar filtros
const applyFilters = () => {
  // Registrar evento en analytics
  trackEvent('search', {
    search_term: searchQuery.value,
    filters: JSON.stringify({
      types: filters.types,
      capacity: filters.capacity,
      range: filters.range,
      sort: `${sortBy.value}_${sortOrder.value}`
    })
  });
};

// Resetear filtros
const resetFilters = () => {
  filters.types = [];
  filters.capacity = [];
  filters.range = [];
  searchQuery.value = '';
  sortBy.value = 'name';
  sortOrder.value = 'asc';
  
  // Registrar evento en analytics
  trackEvent('clear_filters', {
    item_list_id: 'ships'
  });
};

// Limpiar búsqueda
const clearSearch = () => {
  searchQuery.value = '';
  applyFilters();
};

// Truncar texto
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Generar color para la nave
const getShipColor = (ship) => {
  // Generar un color basado en el tipo de nave para consistencia
  const typeColors = {
    'Orbital': '#3a0ca3',
    'Interplanetaria': '#4361ee',
    'Exploración': '#7209b7'
  };
  
  return typeColors[ship.TIPO] || '#4cc9f0';
};

// Navegación
const navigateToShipDetail = (id) => {
  router.push(`/naves/${id}`);
  
  // Registrar evento en analytics
  trackEvent('select_item', {
    item_list_id: 'ships',
    item_list_name: 'Naves Espaciales',
    items: [{
      item_id: id,
      item_name: ships.value.find(s => s.ID === id)?.NOMBRE || 'Nave'
    }]
  });
};

const navigateToReservation = (id) => {
  router.push({
    path: '/reservas/nueva',
    query: { nave: id }
  });
  
  // Registrar evento en analytics
  trackEvent('begin_checkout', {
    items: [{
      item_id: id,
      item_name: ships.value.find(s => s.ID === id)?.NOMBRE || 'Nave'
    }]
  });
};

// Lifecycle hooks
onMounted(() => {
  fetchShips();
});

// Watch para cambios en el store
watch([storeLoading, storeError], () => {
  loading.value = storeLoading.value;
  error.value = storeError.value;
});
</script>

<style scoped>
.ships-list {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.ships-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

.ships-filters {
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.filters-title {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group h3 {
  font-size: 1.2rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.filter-option input {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
}

.filter-text {
  font-size: 0.95rem;
}

.filter-reset {
  width: 100%;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-summary {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.ships-content {
  width: 100%;
}

.ships-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.ships-header h1 {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin: 0;
}

.ships-search {
  width: 300px;
}

.search-input {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
}

.search-input input {
  width: 100%;
  padding: 0.75rem 2.5rem;
  border-radius: var(--border-radius);
  background-color: rgba(26, 26, 46, 0.5);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 1rem;
}

.search-input input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.clear-search:hover {
  color: var(--color-text);
}

.ships-virtual-list {
  width: 100%;
  margin-bottom: 2rem;
}

.ship-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgba(26, 26, 46, 0.7);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 2rem;
  cursor: pointer;
}

.ship-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.ship-card:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  transform: translateY(-5px);
}

.ship-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.ship-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ship-card:hover .ship-img {
  transform: scale(1.05);
}

.ship-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 1;
}

.ship-capacity {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 1;
}

.ship-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.ship-title {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.ship-description {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.ship-specs {
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.spec-label {
  color: var(--color-text-secondary);
}

.spec-value {
  font-weight: bold;
}

.ship-footer {
  margin-top: auto;
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
  border: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  flex: 1;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  flex: 1;
}

.btn-outline:hover {
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 180, 216, 0.3);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  gap: 0.5rem;
}

.error-container {
  text-align: center;
  padding: 2rem;
  background-color: rgba(230, 57, 70, 0.1);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-error);
  color: var(--color-error);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  color: var(--color-error);
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-results-icon {
  color: var(--color-text-secondary);
  opacity: 0.5;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 992px) {
  .ships-container {
    grid-template-columns: 1fr;
  }
  
  .ships-filters {
    position: static;
    margin-bottom: 2rem;
  }
  
  .ships-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .ships-search {
    width: 100%;
  }
}
</style>
