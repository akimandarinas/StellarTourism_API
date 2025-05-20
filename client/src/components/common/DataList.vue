<template>
  <div class="data-list" :class="{ 'is-loading': loading }">
    <!-- Header con título y acciones -->
    <div v-if="title || $slots.actions" class="list-header">
      <h2 v-if="title" class="list-title">{{ title }}</h2>
      <div v-if="$slots.actions" class="list-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <!-- Filtros -->
    <div v-if="$slots.filters" class="list-filters">
      <slot name="filters"></slot>
    </div>
    
    <!-- Mensaje de carga -->
    <div v-if="loading" class="list-loading">
      <slot name="loading">
        <div class="loading-spinner"></div>
        <p>Cargando...</p>
      </slot>
    </div>
    
    <!-- Mensaje de error -->
    <div v-else-if="error" class="list-error">
      <slot name="error" :error="error">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p>{{ error }}</p>
        <button v-if="onRetry" @click="onRetry" class="retry-button">
          Reintentar
        </button>
      </slot>
    </div>
    
    <!-- Mensaje de lista vacía -->
    <div v-else-if="isEmpty" class="list-empty">
      <slot name="empty">
        <p>No hay elementos para mostrar</p>
      </slot>
    </div>
    
    <!-- Lista de elementos -->
    <div v-else class="list-content">
      <slot name="before-list"></slot>
      
      <ul v-if="!customLayout" class="list-items">
        <li v-for="(item, index) in items" :key="getItemKey(item, index)" class="list-item">
          <slot name="item" :item="item" :index="index">
            {{ item }}
          </slot>
        </li>
      </ul>
      
      <div v-else class="custom-layout">
        <slot :items="items"></slot>
      </div>
      
      <slot name="after-list"></slot>
    </div>
    
    <!-- Paginación -->
    <div v-if="showPagination && !loading && !isEmpty" class="list-pagination">
      <slot name="pagination" :pagination="pagination">
        <div class="pagination-controls">
          <button 
            @click="handlePageChange(1)" 
            :disabled="pagination.currentPage === 1"
            class="pagination-button"
          >
            &laquo;
          </button>
          
          <button 
            @click="handlePageChange(pagination.currentPage - 1)" 
            :disabled="pagination.currentPage === 1"
            class="pagination-button"
          >
            &lsaquo;
          </button>
          
          <span class="pagination-info">
            Página {{ pagination.currentPage }} de {{ pagination.totalPages }}
          </span>
          
          <button 
            @click="handlePageChange(pagination.currentPage + 1)" 
            :disabled="pagination.currentPage === pagination.totalPages"
            class="pagination-button"
          >
            &rsaquo;
          </button>
          
          <button 
            @click="handlePageChange(pagination.totalPages)" 
            :disabled="pagination.currentPage === pagination.totalPages"
            class="pagination-button"
          >
            &raquo;
          </button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
import { computed, defineProps, defineEmits } from 'vue';

export default {
  name: 'DataList',
  
  props: {
    // Datos
    items: {
      type: Array,
      default: () => []
    },
    
    // Estado
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: [String, Error, Object],
      default: null
    },
    
    // Configuración
    title: {
      type: String,
      default: ''
    },
    itemKey: {
      type: [String, Function],
      default: 'id'
    },
    customLayout: {
      type: Boolean,
      default: false
    },
    
    // Paginación
    pagination: {
      type: Object,
      default: () => ({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      })
    },
    showPagination: {
      type: Boolean,
      default: false
    },
    
    // Callbacks
    onPageChange: {
      type: Function,
      default: null
    },
    onRetry: {
      type: Function,
      default: null
    }
  },
  
  emits: ['page-change'],
  
  setup(props, { emit }) {
    // Verificar si la lista está vacía
    const isEmpty = computed(() => {
      return !props.loading && !props.error && (!props.items || props.items.length === 0);
    });
    
    // Obtener la clave única para un elemento
    const getItemKey = (item, index) => {
      if (typeof props.itemKey === 'function') {
        return props.itemKey(item, index);
      }
      
      return item[props.itemKey] || index;
    };
    
    // Manejar cambio de página
    const handlePageChange = (page) => {
      if (page < 1 || page > props.pagination.totalPages) {
        return;
      }
      
      emit('page-change', page);
      
      if (props.onPageChange) {
        props.onPageChange(page);
      }
    };
    
    return {
      isEmpty,
      getItemKey,
      handlePageChange
    };
  }
};
</script>

<style scoped>
.data-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
}

.list-filters {
  margin-bottom: 1rem;
}

.list-loading,
.list-error,
.list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(var(--color-primary-rgb), 0.3);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  color: var(--color-error);
  margin-bottom: 1rem;
}

.icon {
  width: 2rem;
  height: 2rem;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.retry-button:hover {
  background-color: var(--color-primary-dark);
}

.list-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-item {
  margin-bottom: 0.5rem;
}

.list-pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-button {
  padding: 0.25rem 0.5rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  cursor: pointer;
}

.pagination-button:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  margin: 0 0.5rem;
  font-size: 0.875rem;
}
</style>
