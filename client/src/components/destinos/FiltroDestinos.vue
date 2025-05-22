<template>
  <div class="filtro-destinos" :class="{ 'filtros-abiertos': mostrarFiltros }">
    <div class="filtro-header">
      <h2 class="filtro-titulo">Filtrar destinos</h2>
      
      <!-- Botón para mostrar/ocultar filtros en móvil -->
      <button 
        class="toggle-filtros-btn"
        @click="toggleFiltros"
        :aria-expanded="mostrarFiltros"
        aria-controls="filtros-panel"
      >
        <FilterIcon v-if="!mostrarFiltros" class="toggle-icon" aria-hidden="true" />
        <XIcon v-else class="toggle-icon" aria-hidden="true" />
        <span>{{ mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros' }}</span>
      </button>
    </div>
    
    <div id="filtros-panel" class="filtro-panel" :class="{ 'panel-visible': mostrarFiltros }">
      <!-- Búsqueda -->
      <div class="filtro-grupo">
        <label for="busqueda" class="filtro-label">Buscar</label>
        <div class="input-busqueda">
          <input 
            id="busqueda"
            v-model="filtrosLocales.busqueda"
            type="text"
            placeholder="Nombre o descripción..."
            class="filtro-input"
          />
          <SearchIcon class="busqueda-icon" aria-hidden="true" />
        </div>
      </div>
      
      <!-- Tipo de destino -->
      <div class="filtro-grupo">
        <label class="filtro-label">Tipo de destino</label>
        <div class="opciones-grupo">
          <label v-for="tipo in tiposDestino" :key="tipo" class="opcion-checkbox">
            <input 
              type="checkbox"
              :value="tipo"
              v-model="filtrosLocales.tipos"
              class="checkbox-input"
            />
            <span class="checkbox-label">{{ tipo }}</span>
          </label>
        </div>
      </div>
      
      <!-- Rango de precios -->
      <div class="filtro-grupo">
        <label for="precio-min" class="filtro-label">Precio</label>
        <div class="rango-inputs">
          <div class="rango-input-grupo">
            <span class="rango-label">Mín:</span>
            <input 
              id="precio-min"
              v-model.number="filtrosLocales.precioMin"
              type="number"
              min="0"
              step="1000"
              class="filtro-input rango-input"
            />
          </div>
          <div class="rango-input-grupo">
            <span class="rango-label">Máx:</span>
            <input 
              id="precio-max"
              v-model.number="filtrosLocales.precioMax"
              type="number"
              min="0"
              step="1000"
              class="filtro-input rango-input"
            />
          </div>
        </div>
        <div class="rango-slider">
          <input 
            type="range"
            v-model.number="filtrosLocales.precioMax"
            :min="precioMinimo"
            :max="precioMaximo"
            step="1000"
            class="slider-input"
          />
          <div class="rango-valores">
            <span>{{ formatearPrecio(precioMinimo) }}</span>
            <span>{{ formatearPrecio(precioMaximo) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Duración del viaje -->
      <div class="filtro-grupo">
        <label for="duracion-min" class="filtro-label">Duración (días)</label>
        <div class="rango-inputs">
          <div class="rango-input-grupo">
            <span class="rango-label">Mín:</span>
            <input 
              id="duracion-min"
              v-model.number="filtrosLocales.duracionMin"
              type="number"
              min="0"
              class="filtro-input rango-input"
            />
          </div>
          <div class="rango-input-grupo">
            <span class="rango-label">Máx:</span>
            <input 
              id="duracion-max"
              v-model.number="filtrosLocales.duracionMax"
              type="number"
              min="0"
              class="filtro-input rango-input"
            />
          </div>
        </div>
      </div>
      
      <!-- Ordenar por -->
      <div class="filtro-grupo">
        <label for="ordenar-por" class="filtro-label">Ordenar por</label>
        <select 
          id="ordenar-por"
          v-model="filtrosLocales.ordenarPor"
          class="filtro-select"
        >
          <option value="nombre">Nombre</option>
          <option value="precio">Precio</option>
          <option value="duracion">Duración</option>
          <option value="popularidad">Popularidad</option>
          <option value="distancia">Distancia</option>
        </select>
      </div>
      
      <!-- Dirección de ordenamiento -->
      <div class="filtro-grupo">
        <label class="filtro-label">Dirección</label>
        <div class="radio-grupo">
          <label class="opcion-radio">
            <input 
              type="radio"
              value="asc"
              v-model="filtrosLocales.ordenarDireccion"
              class="radio-input"
            />
            <span class="radio-label">Ascendente</span>
          </label>
          <label class="opcion-radio">
            <input 
              type="radio"
              value="desc"
              v-model="filtrosLocales.ordenarDireccion"
              class="radio-input"
            />
            <span class="radio-label">Descendente</span>
          </label>
        </div>
      </div>
      
      <!-- Botones de acción -->
      <div class="filtro-acciones">
        <button 
          @click="aplicarFiltros"
          class="btn-aplicar"
          :disabled="!hayFiltrosModificados"
        >
          Aplicar filtros
        </button>
        <button 
          @click="resetearFiltros"
          class="btn-resetear"
          :disabled="!hayFiltrosAplicados"
        >
          Resetear
        </button>
      </div>
    </div>
    
    <!-- Chips de filtros aplicados -->
    <div v-if="hayFiltrosAplicados" class="filtros-aplicados">
      <div class="filtros-aplicados-header">
        <h3 class="filtros-aplicados-titulo">Filtros aplicados:</h3>
        <button @click="resetearFiltros" class="btn-limpiar-todos">
          Limpiar todos
        </button>
      </div>
      <div class="filtros-chips">
        <div 
          v-for="(chip, index) in filtrosChips" 
          :key="index"
          class="filtro-chip"
        >
          <span class="chip-texto">{{ chip.texto }}</span>
          <button 
            @click="quitarFiltro(chip.tipo, chip.valor)"
            class="chip-quitar"
            :aria-label="`Quitar filtro ${chip.texto}`"
          >
            <XIcon class="quitar-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { FilterIcon, XIcon, SearchIcon } from '@/utils/lucide-adapter';
import { useMobile } from '../../composables/useMobile';

// Detectar si estamos en el cliente o en el servidor
const isClient = typeof window !== 'undefined';

export default {
  name: 'FiltroDestinos',
  
  components: {
    FilterIcon,
    XIcon,
    SearchIcon
  },
  
  props: {
    filtros: {
      type: Object,
      default: () => ({})
    },
    precioMinimo: {
      type: Number,
      default: 0
    },
    precioMaximo: {
      type: Number,
      default: 10000
    },
    tiposDestino: {
      type: Array,
      default: () => ['Planeta', 'Luna', 'Estación', 'Asteroide']
    }
  },
  
  emits: ['filtrar', 'reset'],
  
  setup(props, { emit }) {
    // Estado para mostrar/ocultar filtros en móvil
    const mostrarFiltros = ref(false);
    
    // Crear un objeto isMobile seguro para SSR
    const mobileState = { isMobile: ref(false) };
    
    // Solo usar useMobile en el cliente
    const mobileHook = isClient ? useMobile() : null;
    if (mobileHook && mobileHook.isMobile) {
      mobileState.isMobile = mobileHook.isMobile;
    }
    
    // Inicializar filtros locales con valores por defecto
    const filtrosLocales = reactive({
      busqueda: '',
      tipos: [],
      precioMin: props.precioMinimo,
      precioMax: props.precioMaximo,
      duracionMin: 0,
      duracionMax: 100,
      ordenarPor: 'nombre',
      ordenarDireccion: 'asc'
    });
    
    // Actualizar filtros locales cuando cambien los props
    // Usar un try-catch para manejar posibles errores durante SSR
    try {
      watch(() => props.filtros, (nuevosFiltros) => {
        if (nuevosFiltros) {
          Object.assign(filtrosLocales, {
            ...filtrosLocales,
            ...nuevosFiltros
          });
        }
      }, { deep: true, immediate: false }); // Cambiar a immediate: false para evitar errores en SSR
    } catch (error) {
      console.error('Error en el watcher de filtros:', error);
    }
    
    // Verificar si hay filtros aplicados
    const hayFiltrosAplicados = computed(() => {
      return filtrosLocales.busqueda !== '' ||
        filtrosLocales.tipos.length > 0 ||
        filtrosLocales.precioMin !== props.precioMinimo ||
        filtrosLocales.precioMax !== props.precioMaximo ||
        filtrosLocales.duracionMin !== 0 ||
        filtrosLocales.duracionMax !== 100 ||
        filtrosLocales.ordenarPor !== 'nombre' ||
        filtrosLocales.ordenarDireccion !== 'asc';
    });
    
    // Verificar si hay filtros modificados (diferentes a los props)
    const hayFiltrosModificados = computed(() => {
      try {
        return JSON.stringify(filtrosLocales) !== JSON.stringify(props.filtros);
      } catch (error) {
        console.error('Error al comparar filtros:', error);
        return false;
      }
    });
    
    // Generar chips para filtros aplicados
    const filtrosChips = computed(() => {
      const chips = [];
      
      if (filtrosLocales.busqueda) {
        chips.push({
          tipo: 'busqueda',
          valor: filtrosLocales.busqueda,
          texto: `Búsqueda: ${filtrosLocales.busqueda}`
        });
      }
      
      filtrosLocales.tipos.forEach(tipo => {
        chips.push({
          tipo: 'tipo',
          valor: tipo,
          texto: `Tipo: ${tipo}`
        });
      });
      
      if (filtrosLocales.precioMin !== props.precioMinimo) {
        chips.push({
          tipo: 'precioMin',
          valor: filtrosLocales.precioMin,
          texto: `Precio mínimo: ${formatearPrecio(filtrosLocales.precioMin)}`
        });
      }
      
      if (filtrosLocales.precioMax !== props.precioMaximo) {
        chips.push({
          tipo: 'precioMax',
          valor: filtrosLocales.precioMax,
          texto: `Precio máximo: ${formatearPrecio(filtrosLocales.precioMax)}`
        });
      }
      
      if (filtrosLocales.duracionMin > 0) {
        chips.push({
          tipo: 'duracionMin',
          valor: filtrosLocales.duracionMin,
          texto: `Duración mínima: ${filtrosLocales.duracionMin} días`
        });
      }
      
      if (filtrosLocales.duracionMax < 100) {
        chips.push({
          tipo: 'duracionMax',
          valor: filtrosLocales.duracionMax,
          texto: `Duración máxima: ${filtrosLocales.duracionMax} días`
        });
      }
      
      if (filtrosLocales.ordenarPor !== 'nombre' || filtrosLocales.ordenarDireccion !== 'asc') {
        const ordenTexto = {
          nombre: 'Nombre',
          precio: 'Precio',
          duracion: 'Duración',
          popularidad: 'Popularidad',
          distancia: 'Distancia'
        };
        
        const direccionTexto = {
          asc: 'ascendente',
          desc: 'descendente'
        };
        
        chips.push({
          tipo: 'orden',
          valor: `${filtrosLocales.ordenarPor}-${filtrosLocales.ordenarDireccion}`,
          texto: `Ordenar por: ${ordenTexto[filtrosLocales.ordenarPor]} ${direccionTexto[filtrosLocales.ordenarDireccion]}`
        });
      }
      
      return chips;
    });
    
    // Métodos
    const aplicarFiltros = () => {
      emit('filtrar', { ...filtrosLocales });
      
      // Cerrar panel de filtros en móvil después de aplicar
      if (mobileState.isMobile.value) {
        mostrarFiltros.value = false;
      }
    };
    
    const resetearFiltros = () => {
      // Resetear a valores por defecto
      Object.assign(filtrosLocales, {
        busqueda: '',
        tipos: [],
        precioMin: props.precioMinimo,
        precioMax: props.precioMaximo,
        duracionMin: 0,
        duracionMax: 100,
        ordenarPor: 'nombre',
        ordenarDireccion: 'asc'
      });
      
      emit('reset');
      
      // Cerrar panel de filtros en móvil después de resetear
      if (mobileState.isMobile.value) {
        mostrarFiltros.value = false;
      }
    };
    
    const quitarFiltro = (tipo, valor) => {
      if (tipo === 'busqueda') {
        filtrosLocales.busqueda = '';
      } else if (tipo === 'tipo') {
        filtrosLocales.tipos = filtrosLocales.tipos.filter(t => t !== valor);
      } else if (tipo === 'precioMin') {
        filtrosLocales.precioMin = props.precioMinimo;
      } else if (tipo === 'precioMax') {
        filtrosLocales.precioMax = props.precioMaximo;
      } else if (tipo === 'duracionMin') {
        filtrosLocales.duracionMin = 0;
      } else if (tipo === 'duracionMax') {
        filtrosLocales.duracionMax = 100;
      } else if (tipo === 'orden') {
        filtrosLocales.ordenarPor = 'nombre';
        filtrosLocales.ordenarDireccion = 'asc';
      }
      
      aplicarFiltros();
    };
    
    const toggleFiltros = () => {
      mostrarFiltros.value = !mostrarFiltros.value;
    };
    
    const formatearPrecio = (precio) => {
      try {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR'
        }).format(precio);
      } catch (error) {
        console.error('Error al formatear precio:', error);
        return `${precio} €`;
      }
    };
    
    // Inicializar filtros y mostrar por defecto en escritorio solo en el cliente
    onMounted(() => {
      // Actualizar filtros locales con los props iniciales
      if (props.filtros) {
        Object.assign(filtrosLocales, {
          ...filtrosLocales,
          ...props.filtros
        });
      }
      
      // Mostrar filtros por defecto en escritorio
      mostrarFiltros.value = !mobileState.isMobile.value;
    });
    
    return {
      filtrosLocales,
      hayFiltrosAplicados,
      hayFiltrosModificados,
      filtrosChips,
      aplicarFiltros,
      resetearFiltros,
      quitarFiltro,
      mostrarFiltros,
      toggleFiltros,
      formatearPrecio
    };
  }
};
</script>

<style scoped>
.filtro-destinos {
  background-color: var(--color-surface, #ffffff);
  border-radius: var(--border-radius-md, 0.5rem);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
}

.filtro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filtro-titulo {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text, #333333);
  margin: 0;
}

.toggle-filtros-btn {
  display: none;
  align-items: center;
  background: none;
  border: none;
  color: var(--color-primary, #3b82f6);
  cursor: pointer;
  font-weight: 500;
}

.toggle-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.filtro-panel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.filtro-grupo {
  margin-bottom: 1.5rem;
}

.filtro-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text, #333333);
}

.filtro-input,
.filtro-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--border-radius-sm, 0.25rem);
  background-color: var(--color-background, #ffffff);
  color: var(--color-text, #333333);
  font-size: 1rem;
}

.filtro-input:focus,
.filtro-select:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.input-busqueda {
  position: relative;
}

.busqueda-icon {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-secondary, #6b7280);
}

.opciones-grupo {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.opcion-checkbox,
.opcion-radio {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-input,
.radio-input {
  margin-right: 0.5rem;
}

.checkbox-label,
.radio-label {
  color: var(--color-text, #333333);
}

.rango-inputs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.rango-input-grupo {
  flex: 1;
  display: flex;
  align-items: center;
}

.rango-label {
  margin-right: 0.5rem;
  color: var(--color-text-secondary, #6b7280);
  font-size: 0.875rem;
}

.rango-input {
  flex: 1;
}

.rango-slider {
  margin-bottom: 0.5rem;
}

.slider-input {
  width: 100%;
  margin-bottom: 0.5rem;
}

.rango-valores {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-secondary, #6b7280);
}

.radio-grupo {
  display: flex;
  gap: 1rem;
}

.filtro-acciones {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-aplicar,
.btn-resetear {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-sm, 0.25rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-aplicar {
  background-color: var(--color-primary, #3b82f6);
  color: white;
  border: none;
}

.btn-aplicar:hover:not(:disabled) {
  background-color: var(--color-primary-dark, #2563eb);
}

.btn-resetear {
  background-color: transparent;
  color: var(--color-text, #333333);
  border: 1px solid var(--color-border, #e5e7eb);
}

.btn-resetear:hover:not(:disabled) {
  background-color: var(--color-background-secondary, #f3f4f6);
}

.btn-aplicar:disabled,
.btn-resetear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filtros-aplicados {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.filtros-aplicados-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filtros-aplicados-titulo {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.btn-limpiar-todos {
  background: none;
  border: none;
  color: var(--color-primary, #3b82f6);
  cursor: pointer;
  font-size: 0.875rem;
}

.filtros-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filtro-chip {
  display: flex;
  align-items: center;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.chip-texto {
  margin-right: 0.5rem;
}

.chip-quitar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary, #6b7280);
  padding: 0.25rem;
  border-radius: 50%;
}

.quitar-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.chip-quitar:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

/* Media queries para diseño responsive */
@media (max-width: 768px) {
  .filtro-destinos {
    padding: 1rem;
  }
  
  .toggle-filtros-btn {
    display: flex;
  }
  
  .filtro-panel {
    display: none;
    grid-template-columns: 1fr;
  }
  
  .panel-visible {
    display: grid;
  }
  
  .filtros-abiertos {
    position: relative;
    z-index: 20;
  }
  
  .filtro-acciones {
    position: sticky;
    bottom: 0;
    background-color: var(--color-surface, #ffffff);
    padding: 1rem 0;
    margin-bottom: -1rem;
    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .opciones-grupo {
    grid-template-columns: 1fr;
  }
  
  .rango-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .filtros-chips {
    gap: 0.25rem;
  }
  
  .filtro-chip {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  .filtros-aplicados-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .btn-aplicar,
  .btn-resetear {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}

/* Ajustes para pantallas táctiles */
@media (hover: none) {
  .opcion-checkbox,
  .opcion-radio,
  .btn-aplicar,
  .btn-resetear,
  .btn-limpiar-todos,
  .chip-quitar {
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
  }
  
  .filtro-input,
  .filtro-select {
    padding: 0.875rem;
  }
}
</style>
