<template>
  <nav 
    class="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0"
    role="navigation"
    aria-label="Paginación"
  >
    <div class="hidden md:-mt-px md:flex">
      <button
        v-if="showFirstLast"
        @click="onPageChange(1)"
        :disabled="currentPage === 1"
        class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
        :class="{ 'cursor-not-allowed opacity-50': currentPage === 1 }"
        aria-label="Primera página"
        :aria-disabled="currentPage === 1 ? 'true' : 'false'"
        :tabindex="currentPage === 1 ? -1 : 0"
      >
        <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          <path fill-rule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Primera
      </button>
      
      <button
        @click="onPageChange(currentPage - 1)"
        :disabled="currentPage === 1"
        class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
        :class="{ 'cursor-not-allowed opacity-50': currentPage === 1 }"
        aria-label="Página anterior"
        :aria-disabled="currentPage === 1 ? 'true' : 'false'"
        :tabindex="currentPage === 1 ? -1 : 0"
      >
        <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Anterior
      </button>
      
      <template v-for="(page, index) in visiblePageNumbers" :key="`page-${index}`">
        <button
          v-if="page !== '...'"
          @click="onPageChange(page)"
          @keydown="handleKeyDown($event, page)"
          class="inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium"
          :class="[
            currentPage === page 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          ]"
          :aria-label="`Página ${page}`"
          :aria-current="currentPage === page ? 'page' : undefined"
          :tabindex="0"
        >
          {{ page }}
        </button>
        <span
          v-else
          class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500"
          aria-hidden="true"
        >
          ...
        </span>
      </template>
      
      <button
        @click="onPageChange(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
        :class="{ 'cursor-not-allowed opacity-50': currentPage === totalPages }"
        aria-label="Página siguiente"
        :aria-disabled="currentPage === totalPages ? 'true' : 'false'"
        :tabindex="currentPage === totalPages ? -1 : 0"
      >
        Siguiente
        <svg class="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <button
        v-if="showFirstLast"
        @click="onPageChange(totalPages)"
        :disabled="currentPage === totalPages"
        class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
        :class="{ 'cursor-not-allowed opacity-50': currentPage === totalPages }"
        aria-label="Última página"
        :aria-disabled="currentPage === totalPages ? 'true' : 'false'"
        :tabindex="currentPage === totalPages ? -1 : 0"
      >
        Última
        <svg class="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          <path fill-rule="evenodd" d="M12.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L16.586 10l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    
    <!-- Mobile pagination -->
    <div class="flex w-full items-center justify-between md:hidden">
      <button
        @click="onPageChange(currentPage - 1)"
        :disabled="currentPage === 1"
        class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        :class="{ 'cursor-not-allowed opacity-50': currentPage === 1 }"
        aria-label="Página anterior"
        :aria-disabled="currentPage === 1 ? 'true' : 'false'"
        :tabindex="currentPage === 1 ? -1 : 0"
      >
        Anterior
      </button>
      <p class="text-sm text-gray-700" aria-live="polite">
        Página <span class="font-medium">{{ currentPage }}</span> de <span class="font-medium">{{ totalPages }}</span>
      </p>
      <button
        @click="onPageChange(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        :class="{ 'cursor-not-allowed opacity-50': currentPage === totalPages }"
        aria-label="Página siguiente"
        :aria-disabled="currentPage === totalPages ? 'true' : 'false'"
        :tabindex="currentPage === totalPages ? -1 : 0"
      >
        Siguiente
      </button>
    </div>
    
    <!-- Anunciador para lectores de pantalla -->
    <div class="sr-only" aria-live="polite" ref="announcer">
      {{ announcement }}
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  maxVisiblePages: {
    type: Number,
    default: 5
  },
  showFirstLast: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['page-change']);

// Estado para anuncios a lectores de pantalla
const announcement = ref('');
const announcer = ref(null);

// Anunciar cambios de página para lectores de pantalla
const announce = (message) => {
  announcement.value = message;
  
  // Limpiar después de un tiempo para asegurar que se anuncie nuevamente
  setTimeout(() => {
    announcement.value = '';
  }, 3000);
};

// Observar cambios en la página actual
watch(() => props.currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage) {
    announce(`Página ${newPage} de ${props.totalPages}`);
  }
});

// Manejar cambio de página
const onPageChange = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page);
  }
};

// Manejar eventos de teclado para navegación accesible
const handleKeyDown = (event, page) => {
  // Permitir navegación con teclas de flecha
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      if (props.currentPage > 1) {
        onPageChange(props.currentPage - 1);
      }
      break;
    case 'ArrowRight':
      event.preventDefault();
      if (props.currentPage < props.totalPages) {
        onPageChange(props.currentPage + 1);
      }
      break;
    case 'Home':
      event.preventDefault();
      onPageChange(1);
      break;
    case 'End':
      event.preventDefault();
      onPageChange(props.totalPages);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      onPageChange(page);
      break;
  }
};

// Calcular números de página visibles
const visiblePageNumbers = computed(() => {
  if (props.totalPages <= props.maxVisiblePages) {
    return Array.from({ length: props.totalPages }, (_, i) => i + 1);
  }

  const halfVisiblePages = Math.floor(props.maxVisiblePages / 2);
  let startPage = Math.max(props.currentPage - halfVisiblePages, 1);
  let endPage = Math.min(startPage + props.maxVisiblePages - 1, props.totalPages);

  if (endPage - startPage + 1 < props.maxVisiblePages) {
    startPage = Math.max(endPage - props.maxVisiblePages + 1, 1);
  }

  const pages = [];

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < props.totalPages) {
    if (endPage < props.totalPages - 1) {
      pages.push('...');
    }
    pages.push(props.totalPages);
  }

  return pages;
});
</script>

<style scoped>
/* Estilos de enfoque para accesibilidad */
button:focus-visible {
  outline: 2px solid var(--color-primary, #3b82f6);
  outline-offset: 2px;
}

/* Clase para lectores de pantalla */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
