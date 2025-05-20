<template>
  <div 
    ref="container"
    class="virtual-list-container"
    :style="{ height: `${containerHeight}px`, position: 'relative', overflow: 'auto' }"
    @scroll="handleScroll"
    role="list"
  >
    <div 
      class="virtual-list-content"
      :style="{ height: `${totalHeight}px` }"
    >
      <div
        class="virtual-list-items"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <slot 
          v-for="item in visibleItems" 
          :key="getItemKey(item.item)" 
          :item="item.item"
          :index="item.index"
        ></slot>
      </div>
    </div>
    
    <!-- Indicador de fin alcanzado -->
    <div v-if="showEndReached && endReached" class="virtual-list-end-message">
      <slot name="end-message">
        {{ endMessage }}
      </slot>
    </div>
    
    <!-- Indicador de carga -->
    <div v-if="loading" class="virtual-list-loading">
      <slot name="loading">
        <div class="virtual-list-loading-spinner"></div>
      </slot>
    </div>
  </div>
</template>

<script>
import { defineProps, defineEmits, ref, computed, onMounted, onBeforeUnmount, watch, nextTick, onUnmounted } from 'vue';

export default {
  name: 'VirtualList',
  props: {
    items: {
      type: Array,
      required: true,
      default: () => []
    },
    itemHeight: {
      type: Number,
      required: true,
      validator: (value) => {
        if (!value || value <= 0) {
          console.error('La propiedad itemHeight debe ser un número positivo en VirtualList');
          return false;
        }
        return true;
      }
    },
    containerHeight: {
      type: [Number, String],
      default: 400
    },
    visibleItems: {
      type: Number,
      default: 10
    },
    buffer: {
      type: Number,
      default: 5
    },
    keyField: {
      type: String,
      default: 'id'
    },
    loading: {
      type: Boolean,
      default: false
    },
    endReached: {
      type: Boolean,
      default: false
    },
    showEndReached: {
      type: Boolean,
      default: true
    },
    endMessage: {
      type: String,
      default: 'No hay más elementos para mostrar'
    }
  },
  emits: ['scroll', 'end-reached'],
  setup(props, { emit }) {
    const container = ref(null);
    const scrollTop = ref(0);
    const lastScrollTop = ref(0);
    const scrollDirection = ref('down');
    const isScrolling = ref(false);
    const scrollTimeout = ref(null);
    const startIndex = ref(0);
    const endIndex = ref(props.visibleItems + 2 * props.buffer);
    const visibleCount = ref(props.visibleItems);
    const containerRef = ref(null)
    
    // Altura total de la lista
    const totalHeight = computed(() => props.items.length * props.itemHeight);
    
    // Calcular el offset Y para posicionar los elementos visibles
    const offsetY = computed(() => startIndex.value * props.itemHeight);

    // Añadir una caché para los elementos visibles
    const itemsCache = new Map()

    // Optimizar el componente VirtualList para mejorar el rendimiento

    // Añadir memoización para cálculos costosos
    const visibleItems = computed(() => {
      const { items } = props
      // Usar una clave de caché basada en los parámetros relevantes
      const cacheKey = `${startIndex.value}-${endIndex.value}-${items.length}`
      
      // Verificar si ya tenemos este cálculo en caché
      if (itemsCache.has(cacheKey)) {
        return itemsCache.get(cacheKey)
      }
      
      // Calcular los elementos visibles
      const result = items.slice(startIndex.value, endIndex.value).map((item, index) => ({
        item,
        index: startIndex.value + index
      }))
      
      // Guardar en caché (limitar el tamaño de la caché)
      itemsCache.set(cacheKey, result)
      if (itemsCache.size > 20) {
        // Eliminar la entrada más antigua
        const firstKey = itemsCache.keys().next().value
        itemsCache.delete(firstKey)
      }
      
      return result
    })
    
    // Función para obtener la clave única de cada elemento
    const getItemKey = (item) => {
      return item[props.keyField] || props.items.indexOf(item);
    };
    
    let resizeObserver = null

    // Función de throttle para limitar la frecuencia de ejecución
    function throttle(fn, delay) {
      let lastCall = 0
      return function(...args) {
        const now = Date.now()
        if (now - lastCall >= delay) {
          lastCall = now
          return fn(...args)
        }
      }
    }

    // Optimizar el manejo del scroll con throttling
    const handleScroll = throttle((event) => {
      if (!containerRef.value) return;
      
      const currentScrollTop = containerRef.value.scrollTop;
      
      // Evitar cálculos si el scroll no ha cambiado significativamente
      if (Math.abs(currentScrollTop - scrollTop.value) < props.itemHeight / 2) {
        return;
      }
      
      scrollTop.value = currentScrollTop;
      
      // Determinar dirección del scroll
      scrollDirection.value = currentScrollTop > lastScrollTop.value ? 'down' : 'up';
      lastScrollTop.value = currentScrollTop;
      
      // Calcular índices visibles
      startIndex.value = Math.max(0, Math.floor(currentScrollTop / props.itemHeight) - (scrollDirection.value === 'up' ? props.buffer : 0));
      endIndex.value = Math.min(
        props.items.length,
        startIndex.value + visibleCount.value + props.buffer * (scrollDirection.value === 'down' ? 2 : 1)
      );
      
      // Emitir evento cuando se acerca al final
      if (
        currentScrollTop + containerRef.value.clientHeight >=
        containerRef.value.scrollHeight - props.itemHeight * 2
      ) {
        emit('end-reached');
      }
      
      // Limpiar el estado de scroll después de un tiempo
      if (scrollTimeout.value) {
        clearTimeout(scrollTimeout.value);
      }
      
      scrollTimeout.value = setTimeout(() => {
        isScrolling.value = false;
      }, 150);
      
    }, 16); // Limitar a aproximadamente 60fps

    // Optimizar el cálculo de elementos visibles
    const calculateVisibleItems = () => {
      if (!containerRef.value) return
      
      const height = containerRef.value.clientHeight
      visibleCount.value = Math.ceil(height / props.itemHeight) + 1 // +1 para evitar parpadeos
    }

    // Usar ResizeObserver para detectar cambios de tamaño de manera más eficiente
    onMounted(() => {
      // Asignar la referencia del contenedor
      containerRef.value = container.value;
      
      if (!containerRef.value) {
        console.warn('VirtualList: No se pudo obtener la referencia del contenedor');
        return;
      }
      
      calculateVisibleItems();
      containerRef.value.addEventListener('scroll', handleScroll);
      
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(throttle(() => {
          calculateVisibleItems();
        }, 100));
        
        resizeObserver.observe(containerRef.value);
      } else {
        // Fallback para navegadores que no soportan ResizeObserver
        window.addEventListener('resize', throttle(() => {
          calculateVisibleItems();
        }, 100));
      }
      
      // Verificar si hay imágenes cargadas para ajustar el scroll inicial
      nextTick(() => {
        if (props.items.length > 0 && containerRef.value) {
          handleScroll();
        }
      });
    })
    
    // Método para desplazarse a un elemento específico
    const scrollToItem = (index, behavior = 'auto') => {
      if (!container.value) return;
      
      const top = index * props.itemHeight;
      container.value.scrollTo({
        top,
        behavior
      });
    };
    
    // Método para desplazarse a una posición específica
    const scrollToPosition = (position, behavior = 'auto') => {
      if (!container.value) return;
      
      container.value.scrollTo({
        top: position,
        behavior
      });
    };
    
    // Observar cambios en los items para resetear el scroll si es necesario
    watch(() => props.items.length, (newLength, oldLength) => {
      if (container.value) {
        // Si los items cambian drásticamente, puede ser necesario ajustar el scroll
        if (startIndex.value >= newLength && oldLength > 0) {
          nextTick(() => {
            scrollToPosition(0, 'auto');
          });
        }
      }
    });
    
    // Añadir una función para limpiar la caché periódicamente
    const cleanCache = () => {
      if (itemsCache.size > 50) {
        // Mantener solo las 20 entradas más recientes
        const entries = Array.from(itemsCache.entries());
        const toKeep = entries.slice(-20);
        
        itemsCache.clear();
        toKeep.forEach(([key, value]) => {
          itemsCache.set(key, value);
        });
      }
    };

    // Llamar a cleanCache después de cada actualización de visibleItems
    watch(visibleItems, () => {
      cleanCache();
    });
    
    // Limpiar event listeners y observer
    onBeforeUnmount(() => {
      // Limpiar event listeners
      if (containerRef.value) {
        containerRef.value.removeEventListener('scroll', handleScroll);
      }
      
      // Limpiar ResizeObserver
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      } else {
        window.removeEventListener('resize', calculateVisibleItems);
      }
      
      // Limpiar timeout si existe
      if (scrollTimeout.value) {
        clearTimeout(scrollTimeout.value);
        scrollTimeout.value = null;
      }
      
      // Limpiar caché
      itemsCache.clear();
    });
    
    // Limpiar timeout al desmontar
    onUnmounted(() => {
      if (scrollTimeout.value) {
        clearTimeout(scrollTimeout.value);
      }
    });
    
    return {
      container,
      totalHeight,
      offsetY,
      visibleItems,
      handleScroll,
      getItemKey,
      scrollToItem,
      scrollToPosition,
      containerRef
    };
  }
};
</script>

<style scoped>
.virtual-list-container {
  -webkit-overflow-scrolling: touch; /* Para mejor desplazamiento en iOS */
}

.virtual-list-content {
  position: relative;
  width: 100%;
}

.virtual-list-items {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.virtual-list-end-message {
  padding: 1rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.virtual-list-loading {
  padding: 1rem;
  text-align: center;
}

.virtual-list-loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
