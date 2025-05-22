<template>
  <div class="reservas-list">
    <!-- Error Boundary -->
    <ErrorBoundary v-if="error" :error="error" @retry="fetchReservas">
      <template #default>
        <p class="text-red-500">{{ error.message }}</p>
        <button 
          @click="fetchReservas" 
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
    <div v-else-if="!reservas.length" class="py-8 text-center">
      <p class="text-gray-500">No tienes reservas</p>
      <a 
        href="/destinos" 
        class="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
      >
        Explorar destinos
      </a>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Virtualización condicional basada en la cantidad de elementos -->
      <VirtualList
        v-if="shouldUseVirtualization"
        :items="reservas"
        :item-height="200"
        class="space-y-4"
        :buffer="3"
        @end-reached="handleEndReached"
      >
        <template #default="{ item }">
          <ReservaCard 
            :reserva="item" 
            :key="item.id"
          />
        </template>
      </VirtualList>

      <!-- Renderizado normal para pocos elementos -->
      <div v-else class="space-y-4">
        <ReservaCard 
          v-for="reserva in reservas" 
          :key="reserva.id" 
          :reserva="reserva"
          :data-testid="`reserva-card-${reserva.id}`"
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
import { useReservasStoreOptimized } from '@/composables/useStore'
import { useCache } from '@/composables/useCache'
import ReservaCard from '@/components/reservas/ReservaCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import Pagination from '@/components/ui/Pagination.vue'
import VirtualList from '@/components/common/VirtualList.vue'

export default {
  name: 'ReservasList',
  
  components: {
    ReservaCard,
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
      default: 10
    },
    useVirtualization: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:page'],
  
  setup(props, { emit }) {
    const { 
      reservas, 
      loading, 
      error, 
      totalItems, 
      fetchReservas,
      currentPage,
      setPage
    } = useReservasStoreOptimized()
    
    const cache = useCache()
    
    // Calcular el número total de páginas
    const totalPages = computed(() => 
      Math.ceil(totalItems.value / props.perPage)
    )

    const shouldUseVirtualization = computed(() => {
      // Usar virtualización si hay muchos elementos o si se especifica explícitamente
      return props.useVirtualization || reservas.value.length > 15 || (totalItems.value && totalItems.value > 20);
    });
    
    // Manejar cambio de página
    const handlePageChange = (page) => {
      setPage(page)
      emit('update:page', page)
    }

    const handleEndReached = async () => {
      if (currentPage.value < totalPages.value && !loading.value) {
        const nextPage = currentPage.value + 1;
        await fetchReservas({
          ...props.filtros,
          page: nextPage,
          perPage: props.perPage
        });
      }
    };

    // Añadir una función para gestionar la caché de reservas
    const getCachedReservas = (page, filtros) => {
      const cacheKey = `reservas_page_${page}_${JSON.stringify(filtros)}`;
      return cache.get(cacheKey);
    };

    const setCachedReservas = (page, filtros, data) => {
      const cacheKey = `reservas_page_${page}_${JSON.stringify(filtros)}`;
      cache.set(cacheKey, data, 5 * 60 * 1000); // 5 minutos de caché
    };
    
    // Cargar reservas cuando cambian los filtros o la página
    watch(
      [() => props.filtros, currentPage],
      async () => {
        // Intentar obtener de caché primero
        const cachedData = getCachedReservas(currentPage.value, props.filtros);
        
        if (cachedData) {
          // Si hay datos en caché, usarlos inmediatamente
          // y actualizar en segundo plano
          setTimeout(() => {
            fetchReservas({
              ...props.filtros,
              page: currentPage.value,
              perPage: props.perPage,
              background: true
            });
          }, 100);
        } else {
          // Si no hay caché, cargar normalmente
          await fetchReservas({
            ...props.filtros,
            page: currentPage.value,
            perPage: props.perPage
          });
        }
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      // Limpiar cualquier recurso o suscripción si es necesario
    });
    
    return {
      reservas,
      loading,
      error,
      totalPages,
      currentPage,
      fetchReservas,
      handlePageChange,
      shouldUseVirtualization,
      handleEndReached
    }
  }
}
</script>
