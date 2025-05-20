<template>
  <div class="actividades-list">
    <h3 class="text-xl font-bold mb-4">Actividades Disponibles</h3>
    
    <div v-if="loading" class="flex justify-center my-8" aria-live="polite" aria-busy="true">
      <div class="loader" role="status">
        <span class="sr-only">Cargando actividades...</span>
      </div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert" aria-live="assertive">
      {{ error }}
    </div>
    
    <div v-else>
      <!-- Filtros -->
      <div class="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtros de categoría">
        <button 
          @click="filtroCategoria = 'todas'"
          :class="[
            'px-3 py-1 text-sm rounded-md transition-colors keyboard-focus',
            filtroCategoria === 'todas' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          ]"
          :aria-pressed="filtroCategoria === 'todas'"
        >
          Todas
        </button>
        <button 
          v-for="categoria in categorias" 
          :key="categoria"
          @click="filtroCategoria = categoria"
          :class="[
            'px-3 py-1 text-sm rounded-md transition-colors keyboard-focus',
            filtroCategoria === categoria 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          ]"
          :aria-pressed="filtroCategoria === categoria"
        >
          {{ categoria }}
        </button>
      </div>
      
      <!-- Lista de actividades virtualizada -->
      <div class="mb-6">
        <VirtualList
          :items="actividadesFiltradas"
          :item-height="320"
          :visible-items="6"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          v-slot="{ item: actividad }"
        >
          <div 
            :key="actividad.ID"
            class="bg-white rounded-lg shadow-md overflow-hidden"
            :aria-label="`Actividad: ${actividad.NOMBRE}`"
          >
            <div class="h-40 bg-gray-300 relative">
              <img 
                v-if="actividad.IMAGEN"
                :src="actividad.IMAGEN"
                :alt="actividad.NOMBRE"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
                Sin imagen
              </div>
              <div class="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded text-xs">
                {{ actividad.CATEGORIA }}
              </div>
            </div>
            
            <div class="p-4">
              <h4 class="font-bold text-lg mb-1">{{ actividad.NOMBRE }}</h4>
              <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ actividad.DESCRIPCION }}</p>
              
              <div class="flex justify-between items-center mb-3">
                <div class="text-indigo-600 font-bold">
                  {{ formatCurrency(actividad.PRECIO) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ actividad.DURACION }} min
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center" role="group" aria-label="Ajustar cantidad">
                  <button 
                    @click="decrementarCantidad(actividad)"
                    :disabled="!actividadesSeleccionadas[actividad.ID] || actividadesSeleccionadas[actividad.ID] <= 0"
                    class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 keyboard-focus"
                    aria-label="Disminuir cantidad"
                  >
                    -
                  </button>
                  <span class="mx-2 w-6 text-center" aria-live="polite">
                    {{ actividadesSeleccionadas[actividad.ID] || 0 }}
                  </span>
                  <button 
                    @click="incrementarCantidad(actividad)"
                    class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 keyboard-focus"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
                
                <button 
                  v-if="!actividadesSeleccionadas[actividad.ID] || actividadesSeleccionadas[actividad.ID] <= 0"
                  @click="agregarActividad(actividad)"
                  class="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm keyboard-focus"
                >
                  Agregar
                </button>
                <button 
                  v-else
                  @click="eliminarActividad(actividad)"
                  class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm keyboard-focus"
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        </VirtualList>
      </div>
      
      <!-- Resumen de actividades seleccionadas -->
      <div class="bg-gray-100 rounded-lg p-4 mb-6">
        <h4 class="font-bold text-lg mb-3">Actividades Seleccionadas</h4>
        
        <div v-if="hayActividadesSeleccionadas">
          <div 
            v-for="(cantidad, actividadId) in actividadesSeleccionadas" 
            :key="actividadId"
            v-show="cantidad > 0"
            class="flex justify-between items-center py-2 border-b border-gray-300 last:border-0"
          >
            <div>
              <span class="font-medium">{{ getActividadNombre(actividadId) }}</span>
              <span class="text-gray-600 text-sm ml-2">x{{ cantidad }}</span>
            </div>
            <div class="font-medium">
              {{ formatCurrency(getActividadPrecio(actividadId) * cantidad) }}
            </div>
          </div>
          
          <div class="flex justify-between items-center pt-3 mt-2 border-t border-gray-400">
            <div class="font-bold">Total Actividades:</div>
            <div class="font-bold text-indigo-600">
              {{ formatCurrency(totalActividades) }}
            </div>
          </div>
        </div>
        
        <div v-else class="text-gray-500 text-center py-2">
          No has seleccionado ninguna actividad
        </div>
      </div>
      
      <div class="flex justify-end">
        <button 
          @click="confirmarSeleccion"
          :disabled="!hayActividadesSeleccionadas"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed keyboard-focus"
          aria-label="Confirmar selección de actividades"
        >
          Confirmar Actividades
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import VirtualList from '../common/VirtualList.vue';
import { computed, ref, watch } from 'vue';

export default {
  name: 'ActividadesList',
  components: {
    VirtualList
  },
  props: {
    destinoId: {
      type: [Number, String],
      required: true
    }
  },
  setup(props, { emit }) {
    const actividades = ref([]);
    const actividadesSeleccionadas = ref({});
    const filtroCategoria = ref('todas');
    const categorias = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Memoizar cálculos para evitar recálculos innecesarios
    const actividadesFiltradas = computed(() => {
      if (filtroCategoria.value === 'todas') {
        return actividades.value;
      }
      return actividades.value.filter(
        actividad => actividad.CATEGORIA === filtroCategoria.value
      );
    });

    const hayActividadesSeleccionadas = computed(() => {
      return Object.values(actividadesSeleccionadas.value).some(cantidad => cantidad > 0);
    });

    const totalActividades = computed(() => {
      let total = 0;
      for (const [actividadId, cantidad] of Object.entries(actividadesSeleccionadas.value)) {
        if (cantidad > 0) {
          const actividad = actividades.value.find(a => a.ID.toString() === actividadId);
          if (actividad) {
            total += actividad.PRECIO * cantidad;
          }
        }
      }
      return total;
    });

    const actividadesParaEmitir = computed(() => {
      const resultado = [];
      for (const [actividadId, cantidad] of Object.entries(actividadesSeleccionadas.value)) {
        if (cantidad > 0) {
          const actividad = actividades.value.find(a => a.ID.toString() === actividadId);
          if (actividad) {
            resultado.push({
              ID_ACTIVIDAD: actividad.ID,
              NOMBRE: actividad.NOMBRE,
              CANTIDAD: cantidad,
              PRECIO: actividad.PRECIO,
              PRECIO_TOTAL: actividad.PRECIO * cantidad
            });
          }
        }
      }
      return resultado;
    });

    // Métodos
    const fetchActividades = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        // En un entorno real, esto sería una llamada a la API
        // Simulamos la carga de actividades
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Actividades de muestra
        actividades.value = [
          {
            ID: 1,
            NOMBRE: 'Paseo Lunar',
            DESCRIPCION: 'Experimenta la gravedad lunar con un paseo guiado por la superficie de la Luna.',
            CATEGORIA: 'Aventura',
            PRECIO: 300,
            DURACION: 120,
            IMAGEN: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
          },
          {
            ID: 2,
            NOMBRE: 'Observatorio Estelar',
            DESCRIPCION: 'Visita al observatorio para contemplar las estrellas y galaxias desde una perspectiva única.',
            CATEGORIA: 'Educativa',
            PRECIO: 150,
            DURACION: 90,
            IMAGEN: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
          },
          {
            ID: 3,
            NOMBRE: 'Spa Antigravedad',
            DESCRIPCION: 'Relájate en nuestro spa con tratamientos especiales en condiciones de gravedad cero.',
            CATEGORIA: 'Bienestar',
            PRECIO: 250,
            DURACION: 60,
            IMAGEN: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
          },
          {
            ID: 4,
            NOMBRE: 'Cena Gourmet Espacial',
            DESCRIPCION: 'Disfruta de una experiencia gastronómica con ingredientes cultivados en el espacio.',
            CATEGORIA: 'Gastronomía',
            PRECIO: 200,
            DURACION: 120,
            IMAGEN: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
          },
          {
            ID: 5,
            NOMBRE: 'Simulador de Vuelo Espacial',
            DESCRIPCION: 'Aprende a pilotar una nave espacial con nuestros simuladores de última generación.',
            CATEGORIA: 'Educativa',
            PRECIO: 180,
            DURACION: 45,
            IMAGEN: 'https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
          },
          {
            ID: 6,
            NOMBRE: 'Excursión a Cráteres',
            DESCRIPCION: 'Explora los fascinantes cráteres lunares con un guía especializado.',
            CATEGORIA: 'Aventura',
            PRECIO: 280,
            DURACION: 180,
            IMAGEN: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
          }
        ];
        
        // Extraer categorías únicas
        categorias.value = [...new Set(actividades.value.map(a => a.CATEGORIA))];
      } catch (err) {
        console.error('Error al cargar actividades:', err);
        error.value = 'No se pudieron cargar las actividades. Inténtalo de nuevo.';
      } finally {
        loading.value = false;
      }
    };

    const agregarActividad = (actividad) => {
      actividadesSeleccionadas.value = {
        ...actividadesSeleccionadas.value,
        [actividad.ID]: 1
      };
    };

    const eliminarActividad = (actividad) => {
      actividadesSeleccionadas.value = {
        ...actividadesSeleccionadas.value,
        [actividad.ID]: 0
      };
    };

    const incrementarCantidad = (actividad) => {
      const cantidadActual = actividadesSeleccionadas.value[actividad.ID] || 0;
      actividadesSeleccionadas.value = {
        ...actividadesSeleccionadas.value,
        [actividad.ID]: cantidadActual + 1
      };
    };

    const decrementarCantidad = (actividad) => {
      const cantidadActual = actividadesSeleccionadas.value[actividad.ID] || 0;
      if (cantidadActual > 0) {
        actividadesSeleccionadas.value = {
          ...actividadesSeleccionadas.value,
          [actividad.ID]: cantidadActual - 1
        };
      }
    };

    const getActividadNombre = (actividadId) => {
      const actividad = actividades.value.find(a => a.ID.toString() === actividadId);
      return actividad ? actividad.NOMBRE : 'Actividad desconocida';
    };

    const getActividadPrecio = (actividadId) => {
      const actividad = actividades.value.find(a => a.ID.toString() === actividadId);
      return actividad ? actividad.PRECIO : 0;
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(value);
    };

    const confirmarSeleccion = () => {
      if (!hayActividadesSeleccionadas.value) {
        return;
      }
      
      emit('seleccion-confirmada', actividadesParaEmitir.value);
    };

    // Cargar actividades al montar el componente
    fetchActividades();

    return {
      actividades,
      actividadesSeleccionadas,
      filtroCategoria,
      categorias,
      loading,
      error,
      actividadesFiltradas,
      hayActividadesSeleccionadas,
      totalActividades,
      agregarActividad,
      eliminarActividad,
      incrementarCantidad,
      decrementarCantidad,
      getActividadNombre,
      getActividadPrecio,
      formatCurrency,
      confirmarSeleccion
    };
  }
}
</script>

<style scoped>
.loader {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4f46e5;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Mejoras de accesibilidad */
.keyboard-focus:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.2);
}

/* Clase para elementos con alto contraste */
.high-contrast {
  color: #000000;
}

.dark-mode .high-contrast {
  color: #ffffff;
}
</style>
