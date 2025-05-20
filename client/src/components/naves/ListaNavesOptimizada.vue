<template>
  <div class="naves-container">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
    </div>
    
    <div v-else-if="error" class="error-container">
      <ErrorNotification :message="error" @retry="cargarNaves" />
    </div>
    
    <div v-else>
      <div class="naves-header">
        <h2 class="naves-title">{{ title || 'Naves Espaciales' }}</h2>
        <div class="naves-filters">
          <input
            v-model="filtro"
            type="text"
            placeholder="Buscar naves..."
            class="search-input"
          />
        </div>
      </div>
      
      <VirtualList
        :items="navesFiltradas"
        :item-height="320"
        class="naves-list"
      >
        <template #default="{ item: nave }">
          <div class="nave-card">
            <div class="nave-image">
              <OptimizedImage
                :src="nave.imagen"
                :alt="nave.nombre"
                loading="lazy"
              />
              <AccessibleImage :src="nave.imagen" :alt="nave.nombre" />
            </div>
            <div class="nave-content">
              <h3 class="nave-name">{{ nave.nombre }}</h3>
              <div class="nave-meta">
                <span class="nave-type">{{ nave.tipo }}</span>
                <span class="nave-capacity">
                  Capacidad: {{ nave.capacidad }} pasajeros
                </span>
              </div>
              <p class="nave-description">{{ truncateText(nave.descripcion, 100) }}</p>
              <div class="nave-footer">
                <router-link
                  :to="{ name: 'DetalleNave', params: { id: nave.id }}"
                  class="btn btn-outline"
                >
                  Ver detalles
                </router-link>
              </div>
            </div>
          </div>
        </template>
        
        <template #empty>
          <div class="empty-state">
            <p>No se encontraron naves espaciales</p>
          </div>
        </template>
      </VirtualList>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { AccessibleImage } from '@/accessibility/components';
import { useNaves } from '@/composables/useNaves';
import { useToast } from '@/composables/useToast';
import VirtualList from '@/components/common/VirtualList.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ErrorNotification from '@/components/common/ErrorNotification.vue';
import OptimizedImage from '@/components/common/OptimizedImage.vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  limit: {
    type: Number,
    default: 0
  }
});

const { obtenerNaves } = useNaves();
const { showToast } = useToast();

const naves = ref([]);
const loading = ref(true);
const error = ref(null);
const filtro = ref('');

const navesFiltradas = computed(() => {
  let resultado = [...naves.value];
  
  if (filtro.value) {
    const terminoBusqueda = filtro.value.toLowerCase();
    resultado = resultado.filter(nave => 
      nave.nombre.toLowerCase().includes(terminoBusqueda) ||
      nave.tipo.toLowerCase().includes(terminoBusqueda) ||
      nave.descripcion.toLowerCase().includes(terminoBusqueda)
    );
  }
  
  if (props.limit > 0) {
    resultado = resultado.slice(0, props.limit);
  }
  
  return resultado;
});

const cargarNaves = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    naves.value = await obtenerNaves();
  } catch (err) {
    error.value = 'Error al cargar las naves. Por favor, intente nuevamente.';
    console.error('Error al cargar naves:', err);
    showToast('Error al cargar naves', 'error');
  } finally {
    loading.value = false;
  }
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

onMounted(() => {
  cargarNaves();
});
</script>

<style scoped>
.naves-container {
  padding: 1rem;
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.naves-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.naves-title {
  font-size: 1.75rem;
  color: var(--color-primary);
}

.search-input {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  border: 1px solid #2a2a4a;
  background-color: #151525;
  color: var(--color-text);
  width: 100%;
  max-width: 300px;
}

.naves-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.nave-card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nave-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.nave-image {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.nave-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.nave-card:hover .nave-image img {
  transform: scale(1.05);
}

.nave-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.nave-name {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
}

.nave-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.nave-type {
  background-color: rgba(0, 180, 216, 0.2);
  color: #4cc9f0;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.nave-description {
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
  flex-grow: 1;
}

.nave-footer {
  margin-top: auto;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .naves-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-input {
    max-width: 100%;
  }
}
</style>
