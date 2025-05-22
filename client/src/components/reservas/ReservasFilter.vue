<template>
  <div class="reservas-filter">
    <h3 class="filter-title">Filtros</h3>
    
    <!-- Estado de la reserva -->
    <div class="filter-group">
      <label class="filter-label">Estado</label>
      <div class="filter-options">
        <button 
          v-for="estado in estados" 
          :key="estado.value"
          @click="toggleEstado(estado.value)"
          :class="['filter-button', { active: filtros.estados.includes(estado.value) }]"
          :aria-pressed="filtros.estados.includes(estado.value)"
        >
          {{ estado.label }}
        </button>
      </div>
    </div>
    
    <!-- Rango de fechas -->
    <div class="filter-group">
      <label class="filter-label" for="fecha-desde">Desde</label>
      <input 
        type="date" 
        id="fecha-desde"
        v-model="filtros.fechaDesde"
        class="filter-input"
        @change="aplicarFiltros"
      />
    </div>
    
    <div class="filter-group">
      <label class="filter-label" for="fecha-hasta">Hasta</label>
      <input 
        type="date" 
        id="fecha-hasta"
        v-model="filtros.fechaHasta"
        class="filter-input"
        @change="aplicarFiltros"
      />
    </div>
    
    <!-- Destino -->
    <div class="filter-group">
      <label class="filter-label" for="destino">Destino</label>
      <select 
        id="destino"
        v-model="filtros.destino"
        class="filter-select"
        @change="aplicarFiltros"
      >
        <option value="">Todos los destinos</option>
        <option v-for="destino in destinos" :key="destino.id" :value="destino.id">
          {{ destino.nombre }}
        </option>
      </select>
    </div>
    
    <!-- Ordenar por -->
    <div class="filter-group">
      <label class="filter-label" for="ordenar">Ordenar por</label>
      <select 
        id="ordenar"
        v-model="filtros.ordenarPor"
        class="filter-select"
        @change="aplicarFiltros"
      >
        <option value="fecha_desc">Fecha (más reciente)</option>
        <option value="fecha_asc">Fecha (más antigua)</option>
        <option value="precio_desc">Precio (mayor a menor)</option>
        <option value="precio_asc">Precio (menor a mayor)</option>
      </select>
    </div>
    
    <!-- Botones de acción -->
    <div class="filter-actions">
      <button 
        @click="limpiarFiltros"
        class="filter-button-secondary"
        type="button"
      >
        Limpiar filtros
      </button>
      
      <button 
        @click="aplicarFiltros"
        class="filter-button-primary"
        type="button"
      >
        Aplicar filtros
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue';
import { useDestinos } from '@/composables/useDestinos';

export default {
  name: 'ReservasFilter',
  
  props: {
    initialFiltros: {
      type: Object,
      default: () => ({})
    }
  },
  
  emits: ['update:filtros'],
  
  setup(props, { emit }) {
    // Estados disponibles para filtrar
    const estados = [
      { value: 'pendiente', label: 'Pendientes' },
      { value: 'confirmada', label: 'Confirmadas' },
      { value: 'cancelada', label: 'Canceladas' }
    ];
    
    // Detectar si estamos en Astro
    const isAstro = typeof window !== 'undefined' && window.location.pathname.includes('/reservas');
    
    // Obtener destinos para el filtro con modo Astro activado
    const { destinos, loading: loadingDestinos, error: destinosError } = useDestinos({
      isAstro: true,
      cargarAutomaticamente: true
    });
    
    // Estado de los filtros
    const filtros = reactive({
      estados: [],
      fechaDesde: '',
      fechaHasta: '',
      destino: '',
      ordenarPor: 'fecha_desc'
    });
    
    // Inicializar filtros con valores iniciales si existen
    onMounted(() => {
      if (props.initialFiltros) {
        Object.assign(filtros, props.initialFiltros);
      }
    });
    
    // Métodos para manejar los filtros
    const toggleEstado = (estado) => {
      const index = filtros.estados.indexOf(estado);
      if (index === -1) {
        filtros.estados.push(estado);
      } else {
        filtros.estados.splice(index, 1);
      }
      aplicarFiltros();
    };
    
    const aplicarFiltros = () => {
      emit('update:filtros', { ...filtros });
    };
    
    const limpiarFiltros = () => {
      filtros.estados = [];
      filtros.fechaDesde = '';
      filtros.fechaHasta = '';
      filtros.destino = '';
      filtros.ordenarPor = 'fecha_desc';
      aplicarFiltros();
    };
    
    // Observar cambios en los filtros iniciales
    watch(
      () => props.initialFiltros,
      (newFiltros) => {
        if (newFiltros) {
          Object.assign(filtros, newFiltros);
        }
      },
      { deep: true }
    );
    
    return {
      estados,
      destinos,
      filtros,
      toggleEstado,
      aplicarFiltros,
      limpiarFiltros
    };
  }
}
</script>

<style scoped>
.reservas-filter {
  background-color: var(--color-surface, #ffffff);
  border-radius: var(--border-radius, 0.5rem);
  padding: 1.5rem;
}

.filter-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary, #1a1a2e);
}

.filter-group {
  margin-bottom: 1.25rem;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary, #4a5568);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-button {
  background-color: transparent;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button.active {
  background-color: var(--color-primary, #7c3aed);
  color: white;
  border-color: var(--color-primary, #7c3aed);
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: var(--color-background, #f9fafb);
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.filter-button-primary,
.filter-button-secondary {
  padding: 0.625rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.filter-button-primary {
  background-color: var(--color-primary, #7c3aed);
  color: white;
  border: none;
}

.filter-button-primary:hover {
  background-color: var(--color-primary-dark, #6d28d9);
}

.filter-button-secondary {
  background-color: transparent;
  border: 1px solid var(--color-border, #e2e8f0);
  color: var(--color-text-secondary, #4a5568);
}

.filter-button-secondary:hover {
  background-color: var(--color-background-hover, #f1f5f9);
}

@media (max-width: 768px) {
  .filter-actions {
    flex-direction: column;
  }
}
</style>
