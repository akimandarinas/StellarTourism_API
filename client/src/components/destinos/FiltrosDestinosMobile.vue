<template>
  <div class="filtros-destinos-mobile">
    <!-- Botón para abrir panel de filtros -->
    <button 
      @click="abrirPanelFiltros" 
      class="btn-abrir-filtros"
      :class="{ 'tiene-filtros': hayFiltrosAplicados }"
      aria-label="Abrir filtros"
    >
      <FilterIcon size="18" />
      <span>Filtros</span>
      <span v-if="contadorFiltros > 0" class="contador-filtros">{{ contadorFiltros }}</span>
    </button>
    
    <!-- Panel de filtros (modal) -->
    <div 
      v-if="panelAbierto" 
      class="panel-filtros-overlay"
      @click="cerrarPanelFiltros"
    >
      <div 
        class="panel-filtros"
        @click.stop
        ref="panelFiltros"
      >
        <!-- Cabecera del panel -->
        <div class="panel-cabecera">
          <h2 class="panel-titulo">Filtros</h2>
          <button 
            @click="cerrarPanelFiltros" 
            class="btn-cerrar"
            aria-label="Cerrar panel de filtros"
          >
            <XIcon size="20" />
          </button>
        </div>
        
        <!-- Contenido del panel (acordeón) -->
        <div class="panel-contenido">
          <!-- Búsqueda -->
          <div class="filtro-seccion">
            <div 
              class="filtro-cabecera" 
              @click="toggleSeccion('busqueda')"
            >
              <h3 class="filtro-titulo">Búsqueda</h3>
              <ChevronDownIcon 
                size="18" 
                class="icono-acordeon"
                :class="{ 'icono-rotado': seccionesAbiertas.busqueda }"
              />
            </div>
            
            <div 
              v-show="seccionesAbiertas.busqueda" 
              class="filtro-contenido"
            >
              <div class="campo-busqueda">
                <input 
                  v-model="filtrosLocales.busqueda" 
                  type="text" 
                  placeholder="Buscar destinos..."
                  class="input-busqueda"
                />
                <SearchIcon size="18" class="icono-busqueda" />
              </div>
            </div>
          </div>
          
          <!-- Tipo de destino -->
          <div class="filtro-seccion">
            <div 
              class="filtro-cabecera" 
              @click="toggleSeccion('tipos')"
            >
              <h3 class="filtro-titulo">Tipo de destino</h3>
              <ChevronDownIcon 
                size="18" 
                class="icono-acordeon"
                :class="{ 'icono-rotado': seccionesAbiertas.tipos }"
              />
            </div>
            
            <div 
              v-show="seccionesAbiertas.tipos" 
              class="filtro-contenido"
            >
              <div class="opciones-lista">
                <label 
                  v-for="tipo in tiposDestino" 
                  :key="tipo" 
                  class="opcion-checkbox"
                >
                  <input 
                    type="checkbox" 
                    :value="tipo" 
                    v-model="filtrosLocales.tipos"
                  />
                  <span class="checkbox-texto">{{ tipo }}</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Rango de precios -->
          <div class="filtro-seccion">
            <div 
              class="filtro-cabecera" 
              @click="toggleSeccion('precios')"
            >
              <h3 class="filtro-titulo">Rango de precios</h3>
              <ChevronDownIcon 
                size="18" 
                class="icono-acordeon"
                :class="{ 'icono-rotado': seccionesAbiertas.precios }"
              />
            </div>
            
            <div 
              v-show="seccionesAbiertas.precios" 
              class="filtro-contenido"
            >
              <div class="rango-slider">
                <div class="rango-valores">
                  <span>{{ formatearPrecio(filtrosLocales.precioMin) }}</span>
                  <span>{{ formatearPrecio(filtrosLocales.precioMax) }}</span>
                </div>
                
                <input 
                  type="range" 
                  v-model.number="filtrosLocales.precioMin" 
                  :min="precioMinimo" 
                  :max="filtrosLocales.precioMax"
                  class="slider-input"
                />
                
                <input 
                  type="range" 
                  v-model.number="filtrosLocales.precioMax" 
                  :min="filtrosLocales.precioMin" 
                  :max="precioMaximo"
                  class="slider-input"
                />
              </div>
            </div>
          </div>
          
          <!-- Duración -->
          <div class="filtro-seccion">
            <div 
              class="filtro-cabecera" 
              @click="toggleSeccion('duracion')"
            >
              <h3 class="filtro-titulo">Duración (días)</h3>
              <ChevronDownIcon 
                size="18" 
                class="icono-acordeon"
                :class="{ 'icono-rotado': seccionesAbiertas.duracion }"
              />
            </div>
            
            <div 
              v-show="seccionesAbiertas.duracion" 
              class="filtro-contenido"
            >
              <div class="rango-inputs">
                <div class="input-grupo">
                  <label for="duracion-min">Mínimo</label>
                  <input 
                    id="duracion-min"
                    v-model.number="filtrosLocales.duracionMin" 
                    type="number" 
                    min="0"
                    class="input-numero"
                  />
                </div>
                
                <div class="input-grupo">
                  <label for="duracion-max">Máximo</label>
                  <input 
                    id="duracion-max"
                    v-model.number="filtrosLocales.duracionMax" 
                    type="number" 
                    min="0"
                    class="input-numero"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Ordenar por -->
          <div class="filtro-seccion">
            <div 
              class="filtro-cabecera" 
              @click="toggleSeccion('ordenar')"
            >
              <h3 class="filtro-titulo">Ordenar por</h3>
              <ChevronDownIcon 
                size="18" 
                class="icono-acordeon"
                :class="{ 'icono-rotado': seccionesAbiertas.ordenar }"
              />
            </div>
            
            <div 
              v-show="seccionesAbiertas.ordenar" 
              class="filtro-contenido"
            >
              <div class="opciones-lista">
                <label 
                  v-for="opcion in opcionesOrdenamiento" 
                  :key="opcion.valor" 
                  class="opcion-radio"
                >
                  <input 
                    type="radio" 
                    :value="opcion.valor" 
                    v-model="filtrosLocales.ordenarPor"
                  />
                  <span class="radio-texto">{{ opcion.texto }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="panel-acciones">
          <button 
            @click="limpiarFiltros" 
            class="btn-limpiar"
            :disabled="!hayFiltrosAplicados"
          >
            Limpiar filtros
          </button>
          
          <button 
            @click="aplicarFiltros" 
            class="btn-aplicar"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
    
    <!-- Chips de filtros aplicados (visible en la página) -->
    <div v-if="hayFiltrosAplicados" class="filtros-aplicados">
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
          <XIcon size="14" />
        </button>
      </div>
      
      <button 
        @click="limpiarFiltros" 
        class="chip-limpiar-todos"
      >
        Limpiar todos
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { 
  FilterIcon, 
  XIcon, 
  ChevronDownIcon, 
  SearchIcon 
} from 'lucide-vue-next';

export default {
  name: 'FiltrosDestinosMobile',
  
  components: {
    FilterIcon,
    XIcon,
    ChevronDownIcon,
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
  
  emits: ['filtrar', 'limpiar'],
  
  setup(props, { emit }) {
    // Estado del panel
    const panelAbierto = ref(false);
    const panelFiltros = ref(null);
    
    // Secciones abiertas en el acordeón
    const seccionesAbiertas = reactive({
      busqueda: true,
      tipos: false,
      precios: false,
      duracion: false,
      ordenar: false
    });
    
    // Filtros locales
    const filtrosLocales = reactive({
      busqueda: '',
      tipos: [],
      precioMin: props.precioMinimo,
      precioMax: props.precioMaximo,
      duracionMin: 0,
      duracionMax: 100,
      ordenarPor: 'relevancia'
    });
    
    // Opciones de ordenamiento
    const opcionesOrdenamiento = [
      { valor: 'relevancia', texto: 'Relevancia' },
      { valor: 'precio-asc', texto: 'Precio: menor a mayor' },
      { valor: 'precio-desc', texto: 'Precio: mayor a menor' },
      { valor: 'duracion-asc', texto: 'Duración: menor a mayor' },
      { valor: 'duracion-desc', texto: 'Duración: mayor a mayor' },
      { valor: 'distancia-asc', texto: 'Distancia: más cercanos' },
      { valor: 'popularidad-desc', texto: 'Más populares' }
    ];
    
    // Sincronizar filtros locales con props
    watch(() => props.filtros, (nuevosFiltros) => {
      Object.assign(filtrosLocales, {
        busqueda: nuevosFiltros.busqueda || '',
        tipos: nuevosFiltros.tipos || [],
        precioMin: nuevosFiltros.precioMin !== undefined ? nuevosFiltros.precioMin : props.precioMinimo,
        precioMax: nuevosFiltros.precioMax !== undefined ? nuevosFiltros.precioMax : props.precioMaximo,
        duracionMin: nuevosFiltros.duracionMin || 0,
        duracionMax: nuevosFiltros.duracionMax || 100,
        ordenarPor: nuevosFiltros.ordenarPor || 'relevancia'
      });
    }, { deep: true, immediate: true });
    
    // Verificar si hay filtros aplicados
    const hayFiltrosAplicados = computed(() => {
      return filtrosLocales.busqueda !== '' ||
        filtrosLocales.tipos.length > 0 ||
        filtrosLocales.precioMin !== props.precioMinimo ||
        filtrosLocales.precioMax !== props.precioMaximo ||
        filtrosLocales.duracionMin !== 0 ||
        filtrosLocales.duracionMax !== 100 ||
        filtrosLocales.ordenarPor !== 'relevancia';
    });
    
    // Contador de filtros aplicados
    const contadorFiltros = computed(() => {
      let contador = 0;
      
      if (filtrosLocales.busqueda) contador++;
      contador += filtrosLocales.tipos.length;
      if (filtrosLocales.precioMin !== props.precioMinimo) contador++;
      if (filtrosLocales.precioMax !== props.precioMaximo) contador++;
      if (filtrosLocales.duracionMin > 0) contador++;
      if (filtrosLocales.duracionMax < 100) contador++;
      if (filtrosLocales.ordenarPor !== 'relevancia') contador++;
      
      return contador;
    });
    
    // Generar chips para filtros aplicados
    const filtrosChips = computed(() => {
      const chips = [];
      
      if (filtrosLocales.busqueda) {
        chips.push({
          tipo: 'busqueda',
          valor: filtrosLocales.busqueda,
          texto: `"${filtrosLocales.busqueda}"`
        });
      }
      
      filtrosLocales.tipos.forEach(tipo => {
        chips.push({
          tipo: 'tipo',
          valor: tipo,
          texto: tipo
        });
      });
      
      if (filtrosLocales.precioMin !== props.precioMinimo) {
        chips.push({
          tipo: 'precioMin',
          valor: filtrosLocales.precioMin,
          texto: `Desde ${formatearPrecio(filtrosLocales.precioMin)}`
        });
      }
      
      if (filtrosLocales.precioMax !== props.precioMaximo) {
        chips.push({
          tipo: 'precioMax',
          valor: filtrosLocales.precioMax,
          texto: `Hasta ${formatearPrecio(filtrosLocales.precioMax)}`
        });
      }
      
      if (filtrosLocales.duracionMin > 0) {
        chips.push({
          tipo: 'duracionMin',
          valor: filtrosLocales.duracionMin,
          texto: `Mín. ${filtrosLocales.duracionMin} días`
        });
      }
      
      if (filtrosLocales.duracionMax < 100) {
        chips.push({
          tipo: 'duracionMax',
          valor: filtrosLocales.duracionMax,
          texto: `Máx. ${filtrosLocales.duracionMax} días`
        });
      }
      
      if (filtrosLocales.ordenarPor !== 'relevancia') {
        const opcion = opcionesOrdenamiento.find(o => o.valor === filtrosLocales.ordenarPor);
        if (opcion) {
          chips.push({
            tipo: 'ordenarPor',
            valor: filtrosLocales.ordenarPor,
            texto: `Orden: ${opcion.texto}`
          });
        }
      }
      
      return chips;
    });
    
    // Métodos
    const abrirPanelFiltros = () => {
      panelAbierto.value = true;
      document.body.classList.add('overflow-hidden');
      
      // Abrir primera sección si no hay ninguna abierta
      const haySeccionAbierta = Object.values(seccionesAbiertas).some(v => v);
      
      if (!haySeccionAbierta) {
        seccionesAbiertas.busqueda = true;
      }
      
      // Focus en el panel para accesibilidad
      nextTick(() => {
        if (panelFiltros.value) {
          panelFiltros.value.focus();
        }
      });
    };
    
    const cerrarPanelFiltros = () => {
      panelAbierto.value = false;
      document.body.classList.remove('overflow-hidden');
    };
    
    const toggleSeccion = (seccion) => {
      seccionesAbiertas[seccion] = !seccionesAbiertas[seccion];
    };
    
    const aplicarFiltros = () => {
      emit('filtrar', { ...filtrosLocales });
      cerrarPanelFiltros();
    };
    
    const limpiarFiltros = () => {
      // Resetear a valores por defecto
      Object.assign(filtrosLocales, {
        busqueda: '',
        tipos: [],
        precioMin: props.precioMinimo,
        precioMax: props.precioMaximo,
        duracionMin: 0,
        duracionMax: 100,
        ordenarPor: 'relevancia'
      });
      
      emit('limpiar');
      cerrarPanelFiltros();
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
      } else if (tipo === 'ordenarPor') {
        filtrosLocales.ordenarPor = 'relevancia';
      }
      
      emit('filtrar', { ...filtrosLocales });
    };
    
    const formatearPrecio = (precio) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(precio);
    };
    
    // Manejar clic fuera del panel para cerrar
    const handleClickFuera = (event) => {
      if (panelAbierto.value && panelFiltros.value && !panelFiltros.value.contains(event.target)) {
        cerrarPanelFiltros();
      }
    };
    
    // Manejar tecla Escape para cerrar
    const handleKeyDown = (event) => {
      if (panelAbierto.value && event.key === 'Escape') {
        cerrarPanelFiltros();
      }
    };
    
    // Ciclo de vida
    onMounted(() => {
      document.addEventListener('keydown', handleKeyDown);
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
    });
    
    return {
      panelAbierto,
      panelFiltros,
      seccionesAbiertas,
      filtrosLocales,
      hayFiltrosAplicados,
      contadorFiltros,
      filtrosChips,
      opcionesOrdenamiento,
      abrirPanelFiltros,
      cerrarPanelFiltros,
      toggleSeccion,
      aplicarFiltros,
      limpiarFiltros,
      quitarFiltro,
      formatearPrecio
    };
  }
};
</script>

<style scoped>
.filtros-destinos-mobile {
  width: 100%;
  margin-bottom: 1rem;
}

/* Botón para abrir filtros */
.btn-abrir-filtros {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-text);
  font-weight: 500;
  width: 100%;
  transition: background-color 0.2s;
  position: relative;
}

.btn-abrir-filtros:hover {
  background-color: var(--color-background-tertiary);
}

.btn-abrir-filtros.tiene-filtros {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary-dark);
}

.contador-filtros {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background-color: var(--color-primary);
  color: white;
  border-radius: 9999px;
  min-width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Panel de filtros */
.panel-filtros-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

.panel-filtros {
  background-color: var(--color-background);
  border-radius: 1rem 1rem 0 0;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
  outline: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Cabecera del panel */
.panel-cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background-color: var(--color-background);
  z-index: 1;
  border-radius: 1rem 1rem 0 0;
}

.panel-titulo {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.btn-cerrar {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cerrar:hover {
  background-color: var(--color-background-secondary);
}

/* Contenido del panel */
.panel-contenido {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1rem;
  -webkit-overflow-scrolling: touch;
}

/* Secciones de filtros (acordeón) */
.filtro-seccion {
  border-bottom: 1px solid var(--color-border);
}

.filtro-cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  cursor: pointer;
}

.filtro-titulo {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.icono-acordeon {
  transition: transform 0.2s;
}

.icono-rotado {
  transform: rotate(180deg);
}

.filtro-contenido {
  padding: 0 0 1rem 0;
  animation: expandContent 0.2s ease-out;
}

@keyframes expandContent {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 500px; }
}

/* Campos de búsqueda */
.campo-busqueda {
  position: relative;
}

.input-busqueda {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
}

.icono-busqueda {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
}

/* Opciones de lista (checkbox/radio) */
.opciones-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.opcion-checkbox,
.opcion-radio {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-texto,
.radio-texto {
  font-size: 0.875rem;
}

/* Rango slider */
.rango-slider {
  padding: 0 0.5rem;
}

.rango-valores {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.slider-input {
  width: 100%;
  margin: 0.5rem 0;
}

/* Rango inputs */
.rango-inputs {
  display: flex;
  gap: 1rem;
}

.input-grupo {
  flex: 1;
}

.input-grupo label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.input-numero {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
}

/* Botones de acción */
.panel-acciones {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--color-border);
  position: sticky;
  bottom: 0;
  background-color: var(--color-background);
  z-index: 1;
}

.btn-limpiar,
.btn-aplicar {
  flex: 1;
  padding: 0.875rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-limpiar {
  background-color: var(--color-background-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-limpiar:hover:not(:disabled) {
  background-color: var(--color-background-tertiary);
}

.btn-aplicar {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.btn-aplicar:hover {
  background-color: var(--color-primary-dark);
}

.btn-limpiar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Chips de filtros aplicados */
.filtros-aplicados {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.filtro-chip {
  display: flex;
  align-items: center;
  background-color: var(--color-primary-light);
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  color: var(--color-primary-dark);
}

.chip-texto {
  margin-right: 0.25rem;
}

.chip-quitar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-primary-dark);
  padding: 0.25rem;
  border-radius: 50%;
}

.chip-limpiar-todos {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  text-decoration: underline;
}

/* Estilos para pantallas más grandes */
@media (min-width: 768px) {
  .panel-filtros {
    max-width: 480px;
    border-radius: 1rem;
    margin: 2rem;
    max-height: calc(100vh - 4rem);
  }
  
  .panel-cabecera {
    border-radius: 1rem 1rem 0 0;
  }
  
  .panel-filtros-overlay {
    align-items: center;
  }
}
</style>
