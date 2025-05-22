import { ref } from 'vue';

/**
 * Hook para acceder a los stores
 * @param {string} storeName - Nombre del store
 * @returns {Object} Store con métodos
 */
export function useStore(storeName) {
  // Implementación básica
  return {
    fetchDestinos: async (options) => {
      // Simulación de datos
      return {
        items: [],
        total: 0
      };
    },
    fetchReservas: async (options) => {
      // Simulación de datos
      return {
        items: [],
        total: 0
      };
    },
    getCached: (key) => null,
    setCache: (key, data) => {}
  };
}

/**
 * Hook optimizado para acceder al store de destinos
 * @returns {Object} Store de destinos con métodos optimizados
 */
export function useDestinosStoreOptimized() {
  const store = useStore('destinos');
  const destinos = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const totalItems = ref(0);
  const currentPage = ref(1);
  
  // Cargar destinos con opciones de caché y paginación
  const fetchDestinos = async (options = {}) => {
    const { 
      page = 1, 
      perPage = 12, 
      filtros = {}, 
      preload = false,
      useCache = true 
    } = options;
    
    // Si es precarga, no mostrar loading
    if (!preload) {
      loading.value = true;
    }
    
    try {
      // Implementar lógica de caché y paginación
      const cacheKey = `destinos_${page}_${perPage}_${JSON.stringify(filtros)}`;
      
      let data;
      if (useCache) {
        // Intentar obtener de caché
        data = store.getCached(cacheKey);
      }
      
      if (!data) {
        // Si no está en caché o no se usa caché, cargar desde API
        data = await store.fetchDestinos({ page, perPage, ...filtros });
        
        // Guardar en caché
        if (useCache) {
          store.setCache(cacheKey, data);
        }
      }
      
      // Si no es precarga, actualizar el estado
      if (!preload) {
        destinos.value = data.items || [];
        totalItems.value = data.total || 0;
        currentPage.value = page;
      }
      
      return data;
    } catch (err) {
      if (!preload) {
        error.value = err;
      }
      console.error('Error al cargar destinos:', err);
      return { items: [], total: 0 };
    } finally {
      if (!preload) {
        loading.value = false;
      }
    }
  };
  
  // Establecer página actual
  const setPage = (page) => {
    currentPage.value = page;
  };
  
  return {
    destinos,
    loading,
    error,
    totalItems,
    currentPage,
    fetchDestinos,
    setPage
  };
}

/**
 * Hook optimizado para acceder al store de reservas
 * @returns {Object} Store de reservas con métodos optimizados
 */
export function useReservasStoreOptimized() {
  const store = useStore('reservas');
  const reservas = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const totalItems = ref(0);
  const currentPage = ref(1);
  
  // Cargar reservas con opciones de caché y paginación
  const fetchReservas = async (options = {}) => {
    const { 
      page = 1, 
      perPage = 10, 
      filtros = {}, 
      preload = false,
      useCache = true 
    } = options;
    
    // Si es precarga, no mostrar loading
    if (!preload) {
      loading.value = true;
    }
    
    try {
      // Implementar lógica de caché y paginación
      const cacheKey = `reservas_${page}_${perPage}_${JSON.stringify(filtros)}`;
      
      let data;
      if (useCache) {
        // Intentar obtener de caché
        data = store.getCached(cacheKey);
      }
      
      if (!data) {
        // Si no está en caché o no se usa caché, cargar desde API
        data = await store.fetchReservas({ page, perPage, ...filtros });
        
        // Guardar en caché
        if (useCache) {
          store.setCache(cacheKey, data);
        }
      }
      
      // Si no es precarga, actualizar el estado
      if (!preload) {
        reservas.value = data.items || [];
        totalItems.value = data.total || 0;
        currentPage.value = page;
      }
      
      return data;
    } catch (err) {
      if (!preload) {
        error.value = err;
      }
      console.error('Error al cargar reservas:', err);
      return { items: [], total: 0 };
    } finally {
      if (!preload) {
        loading.value = false;
      }
    }
  };
  
  // Establecer página actual
  const setPage = (page) => {
    currentPage.value = page;
  };
  
  return {
    reservas,
    loading,
    error,
    totalItems,
    currentPage,
    fetchReservas,
    setPage
  };
}