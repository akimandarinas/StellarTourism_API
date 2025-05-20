<template>
  <div class="destino-detalle" :class="{ 'loading': loading }">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
    </div>
    
    <div v-else-if="error" class="error-container">
      <ErrorNotification :message="error" @retry="cargarDestino" />
    </div>
    
    <div v-else-if="destino" class="destino-content">
      <header class="destino-header">
        <h1 class="destino-title">{{ destino.nombre }}</h1>
        <div class="destino-meta">
          <span class="destino-tipo">{{ destino.tipo }}</span>
          <Rating :value="destino.calificacion" readonly />
        </div>
      </header>
      
      <div class="destino-gallery">
        <OptimizedImage 
          :src="destino.imagen_principal" 
          :alt="destino.nombre"
          class="destino-main-image" 
        />
      </div>
      
      <div class="destino-info">
        <div class="info-section">
          <h2>Descripción</h2>
          <p>{{ destino.descripcion }}</p>
        </div>
        
        <div class="info-section">
          <h2>Características</h2>
          <ul class="caracteristicas-list">
            <li v-for="(valor, clave) in destino.caracteristicas" :key="clave">
              <strong>{{ formatearClave(clave) }}:</strong> {{ valor }}
            </li>
          </ul>
        </div>
        
        <div class="info-section">
          <h2>Ubicación</h2>
          <p>{{ destino.ubicacion.sistema }} - {{ destino.ubicacion.coordenadas }}</p>
        </div>
      </div>
      
      <div class="destino-actions">
        <router-link 
          :to="{ name: 'NuevaReserva', params: { destinoId: destino.id }}" 
          class="btn btn-primary"
        >
          Reservar ahora
        </router-link>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <p>No se encontró información del destino</p>
      <router-link to="/destinos" class="btn btn-outline">
        Ver todos los destinos
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDestinos } from '@/composables/useDestinos';
import { useReservas } from '@/composables/useReservas';
import { useToast } from '@/composables/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ErrorNotification from '@/components/common/ErrorNotification.vue';
import OptimizedImage from '@/components/common/OptimizedImage.vue';
import Rating from '@/components/ui/Rating.vue';
import { AccessibleImage, AccessibleVideo } from '@/accessibility/components';

const route = useRoute();
const { obtenerDestino } = useDestinos();

const destino = ref(null);
const loading = ref(true);
const error = ref(null);

const cargarDestino = async () => {
  const id = route.params.id;
  if (!id) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    destino.value = await obtenerDestino(id);
  } catch (err) {
    error.value = 'Error al cargar el destino. Por favor, intente nuevamente.';
    console.error('Error al cargar destino:', err);
  } finally {
    loading.value = false;
  }
};

const formatearClave = (clave) => {
  return clave
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

onMounted(() => {
  cargarDestino();
});
</script>

<style scoped>
.destino-detalle {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-container {
  padding: 2rem;
  text-align: center;
}

.destino-header {
  margin-bottom: 2rem;
}

.destino-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
}

.destino-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.destino-tipo {
  background-color: rgba(114, 9, 183, 0.2);
  color: #a56eff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.destino-gallery {
  margin-bottom: 2rem;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.destino-main-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: cover;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.caracteristicas-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.caracteristicas-list li {
  padding: 0.75rem;
  background-color: var(--color-surface);
  border-radius: var(--border-radius);
}

.destino-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}
</style>
