<template>
  <div class="lista-destinos">
    <!-- Error Boundary -->
    <ErrorBoundary v-if="error" :error="error" @retry="fetchDestinos">
      <template #default>
        <p class="text-red-500">{{ error.message }}</p>
        <button 
          @click="fetchDestinos" 
          class="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Reintentar
        </button>
      </template>
    </ErrorBoundary>

    <!-- Loading State -->
    <div v-else-if="loading" class="py-8 flex justify-center items-center">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!destinos.length" class="py-8 text-center">
      <p class="text-gray-500">No se encontraron destinos</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Virtualización condicional basada en la cantidad de elementos -->
      <!-- Aumentado item-height para dar más espacio -->
      <VirtualList
        v-if="shouldUseVirtualization"
        :items="destinos"
        :item-height="400"
        class="destinos-grid"
        :buffer="5"
        @end-reached="handleEndReached"
      >
        <template #default="{ item }">
          <div class="destino-card-wrapper">
            <DestinoCard 
              :destino="item" 
              :key="item.id"
            />
          </div>
        </template>
      </VirtualList>

      <!-- Renderizado normal para pocos elementos -->
      <div v-else class="destinos-grid">
        <DestinoCard 
          v-for="destino in destinos" 
          :key="destino.id"
          :destino="destino"
          :data-testid="`destino-card-${destino.id}`"
        />
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="mt-6 flex justify-center">
        <Pagination 
          :current-page="currentPage" 
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useDestinosStoreOptimized } from '@/composables/useStore'
import { useCache } from '@/composables/useCache'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import DestinoCard from '@/components/destinos/DestinoCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import Pagination from '@/components/ui/Pagination.vue'
import VirtualList from '@/components/common/VirtualList.vue'

export default {
  name: 'ListaDestinos',
  
  components: {
    DestinoCard,
    LoadingSpinner,
    ErrorBoundary,
    Pagination,
    VirtualList
  },
  
  props: {
    filtros: {
      type: Object,
      default: () => ({})
    },
    perPage: {
      type: Number,
      default: 12
    },
    useVirtualization: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:page'],
  
  setup(props, { emit }) {
    const lastItemRef = ref(null)
    const isClient = ref(typeof window !== 'undefined')
    
    // Inicializar con valores por defecto para evitar errores durante SSR
    const defaultStore = {
      destinos: ref([]),
      loading: ref(true),
      error: ref(null),
      totalItems: ref(0),
      fetchDestinos: async () => [],
      currentPage: ref(1),
      setPage: () => {}
    }
    
    // Solo usar el store real en el cliente
    const store = isClient.value 
      ? useDestinosStoreOptimized() 
      : defaultStore
    
    const { 
      destinos, 
      loading, 
      error, 
      totalItems, 
      fetchDestinos,
      currentPage,
      setPage
    } = store
    
    const cache = useCache ? useCache() : { has: () => false, set: () => {}, delete: () => {} }
    
    // Calcular el número total de páginas
    const totalPages = computed(() => 
      Math.ceil((totalItems?.value || 0) / props.perPage) || 1
    )
    
    // Manejar cambio de página
    const handlePageChange = (page) => {
      if (setPage) {
        setPage(page)
        emit('update:page', page)
      }
    }

    const shouldUseVirtualization = computed(() => {
      // Usar virtualización si hay muchos elementos o si se especifica explícitamente
      return props.useVirtualization || 
        (destinos?.value?.length > 15) || 
        (totalItems?.value && totalItems.value > 30);
    });
    
    // Cargar destinos cuando cambian los filtros o la página
    // Solo activar el watcher en el cliente
    if (isClient.value) {
      onMounted(() => {
        watch(
          [() => props.filtros, currentPage],
          async () => {
            try {
              if (fetchDestinos) {
                await fetchDestinos({
                  ...props.filtros,
                  page: currentPage?.value || 1,
                  perPage: props.perPage
                })
              }
            } catch (err) {
              console.error('Error al cargar destinos:', err)
            }
          },
          { immediate: true }
        )
      })
    }
    
    // Precarga de la siguiente página cuando se acerca al final
    const { observe, unobserve } = useIntersectionObserver
      ? useIntersectionObserver(
          async (entries, observer) => {
            if (!isClient.value) return
            
            const [entry] = entries;
            if (entry?.isIntersecting && 
                currentPage?.value < totalPages.value && 
                !loading?.value) {
              // Precargar la siguiente página solo si no estamos cargando actualmente
              const nextPage = (currentPage?.value || 0) + 1;
              
              // Usar un flag para evitar múltiples cargas
              const preloadingKey = `preloading_page_${nextPage}`;
              if (!cache.has(preloadingKey)) {
                cache.set(preloadingKey, true);
                
                try {
                  if (fetchDestinos) {
                    await fetchDestinos({
                      ...props.filtros,
                      page: nextPage,
                      perPage: props.perPage,
                      preload: true
                    });
                  }
                } finally {
                  // Limpiar el flag después de la carga
                  cache.delete(preloadingKey);
                }
              }
            }
          },
          { 
            threshold: 0.1,
            rootMargin: '200px 0px' // Cargar antes de que el elemento sea completamente visible
          }
        )
      : { observe: () => {}, unobserve: () => {} }
    
    // Configurar observador cuando cambia la lista
    // Solo en el cliente
    if (isClient.value) {
      watch(destinos, () => {
        if (!isClient.value) return
        
        if (lastItemRef.value) {
          unobserve(lastItemRef.value)
        }
        
        // Esperar a que se actualice el DOM
        setTimeout(() => {
          if (typeof document !== 'undefined') {
            const items = document.querySelectorAll('.destino-card-wrapper')
            if (items.length > 0) {
              lastItemRef.value = items[items.length - 1]
              observe(lastItemRef.value)
            }
          }
        }, 100)
      })
    }

    // Añadir un hook onBeforeUnmount para limpiar el observador
    onBeforeUnmount(() => {
      if (isClient.value && lastItemRef.value) {
        unobserve(lastItemRef.value);
        lastItemRef.value = null;
      }
    });
    
    const handleEndReached = async () => {
      if (!isClient.value) return
      
      if (currentPage?.value < totalPages.value && !loading?.value) {
        const nextPage = (currentPage?.value || 0) + 1;
        if (fetchDestinos) {
          await fetchDestinos({
            ...props.filtros,
            page: nextPage,
            perPage: props.perPage
          });
        }
      }
    };
    
    // Cargar datos iniciales en el cliente
    if (isClient.value) {
      onMounted(() => {
        if (fetchDestinos) {
          fetchDestinos({
            ...props.filtros,
            page: 1,
            perPage: props.perPage
          }).catch(err => {
            console.error('Error al cargar destinos iniciales:', err)
          })
        }
      })
    }
    
    return {
      destinos: destinos || ref([]),
      loading: loading || ref(false),
      error: error || ref(null),
      totalPages,
      currentPage: currentPage || ref(1),
      fetchDestinos: fetchDestinos || (async () => []),
      handlePageChange,
      shouldUseVirtualization,
      lastItemRef,
      handleEndReached,
      isClient
    }
  }
}
</script>

<style scoped>
.lista-destinos {
  width: 100%;
}

.destinos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
}

.destino-card-wrapper {
  height: 100%;
  min-height: 380px; /* Altura mínima para evitar saltos */
  display: flex;
  transition: transform 0.3s ease;
}

.destino-card-wrapper:hover {
  transform: translateY(-5px);
}

@media (max-width: 640px) {
  .destinos-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .destino-card-wrapper {
    min-height: 350px;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .destinos-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>
