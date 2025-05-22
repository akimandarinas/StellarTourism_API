<template>
  <div 
    ref="containerRef" 
    class="virtual-list-container"
    @scroll="handleScroll"
  >
    <div 
      class="virtual-list-content" 
      :style="{ height: `${totalHeight}px` }"
    >
      <div 
        v-for="item in visibleItems" 
        :key="getItemKey(item)"
        class="virtual-list-item"
        :style="{ 
          transform: `translateY(${item.__virtualPosition}px)`,
          height: `${itemHeight}px`
        }"
      >
        <slot :item="item"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useThrottleFn } from '@/composables/useThrottleFn';

export default {
  name: 'VirtualList',
  
  props: {
    items: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 50
    },
    buffer: {
      type: Number,
      default: 5
    },
    keyField: {
      type: String,
      default: 'id'
    }
  },
  
  emits: ['end-reached'],
  
  setup(props, { emit }) {
    const containerRef = ref(null);
    const scrollTop = ref(0);
    const containerHeight = ref(0);
    
    // Calcular la altura total de la lista
    const totalHeight = computed(() => props.items.length * props.itemHeight);
    
    // Calcular los elementos visibles basados en la posición de desplazamiento
    const visibleItems = computed(() => {
      if (!containerRef.value) return [];
      
      const startIndex = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer);
      const endIndex = Math.min(
        props.items.length - 1,
        Math.ceil((scrollTop.value + containerHeight.value) / props.itemHeight) + props.buffer
      );
      
      return props.items.slice(startIndex, endIndex + 1).map((item, index) => {
        return {
          ...item,
          __virtualPosition: (startIndex + index) * props.itemHeight
        };
      });
    });
    
    // Función para obtener la clave única de un elemento
    const getItemKey = (item) => {
      return item[props.keyField] || item.__virtualPosition;
    };
    
    // Manejar el evento de desplazamiento
    const handleScroll = useThrottleFn(() => {
      if (!containerRef.value) return;
      
      scrollTop.value = containerRef.value.scrollTop;
      
      // Detectar cuando se llega al final de la lista
      const scrollBottom = scrollTop.value + containerHeight.value;
      const threshold = totalHeight.value - containerHeight.value * 0.2; // 20% antes del final
      
      if (scrollBottom >= threshold) {
        emit('end-reached');
      }
    }, 100);
    
    // Inicializar y limpiar
    onMounted(() => {
      if (containerRef.value) {
        containerHeight.value = containerRef.value.clientHeight;
        
        // Observador de cambios de tamaño
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            containerHeight.value = entry.contentRect.height;
          }
        });
        
        resizeObserver.observe(containerRef.value);
        
        // Limpiar observador al desmontar
        onBeforeUnmount(() => {
          resizeObserver.disconnect();
        });
      }
    });
    
    // Observar cambios en los elementos
    watch(
      () => props.items.length,
      () => {
        // Verificar si estamos cerca del final después de que se agreguen elementos
        handleScroll();
      }
    );
    
    return {
      containerRef,
      totalHeight,
      visibleItems,
      getItemKey,
      handleScroll
    };
  }
}
</script>

<style scoped>
.virtual-list-container {
  overflow-y: auto;
  position: relative;
  height: 100%;
  width: 100%;
}

.virtual-list-content {
  position: relative;
}

.virtual-list-item {
  position: absolute;
  left: 0;
  right: 0;
}
</style>
