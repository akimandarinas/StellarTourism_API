<template>
  <nav class="pagination" aria-label="Paginación">
    <ul class="pagination-list">
      <!-- Botón anterior -->
      <li class="pagination-item">
        <button
          @click="goToPreviousPage"
          class="pagination-button"
          :disabled="currentPage <= 1"
          :aria-disabled="currentPage <= 1"
          aria-label="Ir a la página anterior"
        >
          <ChevronLeftIcon class="pagination-icon" />
        </button>
      </li>
      
      <!-- Primera página -->
      <li v-if="showFirstPage" class="pagination-item">
        <button
          @click="goToPage(1)"
          class="pagination-button"
          :class="{ active: currentPage === 1 }"
          aria-label="Ir a la página 1"
        >
          1
        </button>
      </li>
      
      <!-- Elipsis izquierda -->
      <li v-if="showLeftEllipsis" class="pagination-item">
        <span class="pagination-ellipsis" aria-hidden="true">...</span>
      </li>
      
      <!-- Páginas centrales -->
      <li
        v-for="page in visiblePages"
        :key="page"
        class="pagination-item"
      >
        <button
          @click="goToPage(page)"
          class="pagination-button"
          :class="{ active: currentPage === page }"
          :aria-current="currentPage === page ? 'page' : undefined"
          :aria-label="`Ir a la página ${page}`"
        >
          {{ page }}
        </button>
      </li>
      
      <!-- Elipsis derecha -->
      <li v-if="showRightEllipsis" class="pagination-item">
        <span class="pagination-ellipsis" aria-hidden="true">...</span>
      </li>
      
      <!-- Última página -->
      <li v-if="showLastPage" class="pagination-item">
        <button
          @click="goToPage(totalPages)"
          class="pagination-button"
          :class="{ active: currentPage === totalPages }"
          :aria-label="`Ir a la página ${totalPages}`"
        >
          {{ totalPages }}
        </button>
      </li>
      
      <!-- Botón siguiente -->
      <li class="pagination-item">
        <button
          @click="goToNextPage"
          class="pagination-button"
          :disabled="currentPage >= totalPages"
          :aria-disabled="currentPage >= totalPages"
          aria-label="Ir a la página siguiente"
        >
          <ChevronRightIcon class="pagination-icon" />
        </button>
      </li>
    </ul>
  </nav>
</template>

<script>
import { computed } from 'vue';
import { ChevronRightIcon } from '@/utils/lucide-adapter';

export default {
  name: 'Pagination',
  
  components: {
    ChevronRightIcon
  },
  
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    siblingCount: {
      type: Number,
      default: 1
    }
  },
  
  emits: ['page-change'],
  
  setup(props, { emit }) {
    // Calcular las páginas visibles
    const visiblePages = computed(() => {
      const { currentPage, totalPages, siblingCount } = props;
      
      // Calcular el rango de páginas a mostrar
      const startPage = Math.max(1, currentPage - siblingCount);
      const endPage = Math.min(totalPages, currentPage + siblingCount);
      
      // Crear array de páginas
      const pages = [];
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    });
    
    // Determinar si mostrar la primera página
    const showFirstPage = computed(() => {
      return visiblePages.value[0] > 1;
    });
    
    // Determinar si mostrar la última página
    const showLastPage = computed(() => {
      return visiblePages.value[visiblePages.value.length - 1] < props.totalPages;
    });
    
    // Determinar si mostrar elipsis izquierda
    const showLeftEllipsis = computed(() => {
      return visiblePages.value[0] > 2;
    });
    
    // Determinar si mostrar elipsis derecha
    const showRightEllipsis = computed(() => {
      return visiblePages.value[visiblePages.value.length - 1] < props.totalPages - 1;
    });
    
    // Métodos para navegar entre páginas
    const goToPage = (page) => {
      if (page !== props.currentPage) {
        emit('page-change', page);
      }
    };
    
    const goToPreviousPage = () => {
      if (props.currentPage > 1) {
        goToPage(props.currentPage - 1);
      }
    };
    
    const goToNextPage = () => {
      if (props.currentPage < props.totalPages) {
        goToPage(props.currentPage + 1);
      }
    };
    
    return {
      visiblePages,
      showFirstPage,
      showLastPage,
      showLeftEllipsis,
      showRightEllipsis,
      goToPage,
      goToPreviousPage,
      goToNextPage
    };
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.pagination-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.25rem;
}

.pagination-item {
  display: flex;
}

.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0 0.75rem;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 0.375rem;
  background-color: white;
  color: var(--color-text-primary, #1a1a2e);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: var(--color-background-hover, #f1f5f9);
  border-color: var(--color-border-hover, #cbd5e1);
}

.pagination-button.active {
  background-color: var(--color-primary, #7c3aed);
  color: white;
  border-color: var(--color-primary, #7c3aed);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-icon {
  width: 1rem;
  height: 1rem;
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  color: var(--color-text-secondary, #4a5568);
}

@media (max-width: 640px) {
  .pagination-button {
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.5rem;
  }
  
  .pagination-ellipsis {
    min-width: 2rem;
    height: 2rem;
  }
}
</style>
