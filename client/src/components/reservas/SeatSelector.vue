<template>
  <div class="seat-selector">
    <div class="seat-legend">
      <div class="legend-item">
        <div class="seat-example available"></div>
        <span>Disponible</span>
      </div>
      <div class="legend-item">
        <div class="seat-example selected"></div>
        <span>Seleccionado</span>
      </div>
      <div class="legend-item">
        <div class="seat-example premium"></div>
        <span>Premium</span>
      </div>
    </div>
    
    <div class="seat-map">
      <div class="seat-container">
        <div class="seat-grid">
          <div 
            v-for="asiento in disponibles" 
            :key="asiento.id"
            class="seat"
            :class="{
              'selected': isSelected(asiento.id),
              'premium': asiento.clase === 'premium'
            }"
            @click="toggleSeat(asiento)"
            :aria-label="`Asiento ${asiento.numero} ${asiento.clase === 'premium' ? 'premium' : 'estándar'}`"
            :aria-selected="isSelected(asiento.id)"
            role="checkbox"
            :aria-checked="isSelected(asiento.id)"
            tabindex="0"
            @keydown.space.prevent="toggleSeat(asiento)"
          >
            {{ asiento.numero }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="selected-seats">
      <h4>Asientos seleccionados: {{ seleccionados.length }}/{{ maxSeleccionables }}</h4>
      <div v-if="seleccionados.length > 0" class="selected-list">
        <div 
          v-for="asientoId in seleccionados" 
          :key="asientoId"
          class="selected-item"
        >
          {{ getAsientoNumero(asientoId) }}
          <button 
            type="button"
            class="remove-seat"
            @click="removeSeat(asientoId)"
            aria-label="Eliminar asiento"
          >
            ×
          </button>
        </div>
      </div>
      <p v-else class="no-selected">No has seleccionado ningún asiento</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'SeatSelector',
  props: {
    disponibles: {
      type: Array,
      required: true
    },
    seleccionados: {
      type: Array,
      default: () => []
    },
    maxSeleccionables: {
      type: Number,
      default: 1
    }
  },
  emits: ['update:seleccionados'],
  setup(props, { emit }) {
    // Verificar si un asiento está seleccionado
    const isSelected = (asientoId) => {
      return props.seleccionados.includes(asientoId);
    };
    
    // Obtener el número de asiento por ID
    const getAsientoNumero = (asientoId) => {
      const asiento = props.disponibles.find(a => a.id === asientoId);
      return asiento ? asiento.numero : '';
    };
    
    // Alternar selección de asiento
    const toggleSeat = (asiento) => {
      const currentSeleccionados = [...props.seleccionados];
      const index = currentSeleccionados.indexOf(asiento.id);
      
      if (index === -1) {
        // Si no está seleccionado y no hemos alcanzado el máximo, añadirlo
        if (currentSeleccionados.length < props.maxSeleccionables) {
          currentSeleccionados.push(asiento.id);
        }
      } else {
        // Si ya está seleccionado, quitarlo
        currentSeleccionados.splice(index, 1);
      }
      
      emit('update:seleccionados', currentSeleccionados);
    };
    
    // Eliminar un asiento seleccionado
    const removeSeat = (asientoId) => {
      const currentSeleccionados = [...props.seleccionados];
      const index = currentSeleccionados.indexOf(asientoId);
      
      if (index !== -1) {
        currentSeleccionados.splice(index, 1);
        emit('update:seleccionados', currentSeleccionados);
      }
    };
    
    return {
      isSelected,
      getAsientoNumero,
      toggleSeat,
      removeSeat
    };
  }
};
</script>

<style scoped>
.seat-selector {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.seat-example {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.seat-example.available {
  background-color: var(--color-background-light);
  border: 1px solid var(--color-border);
}

.seat-example.selected {
  background-color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.seat-example.premium {
  background-color: var(--color-warning);
  border: 1px solid var(--color-warning);
}

.seat-map {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.seat-container {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 100%;
  overflow-x: auto;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(10, 40px);
  gap: 0.5rem;
}

.seat {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-light);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.seat:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.seat.selected {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.seat.premium {
  background-color: var(--color-warning);
  color: var(--color-text-dark);
  border-color: var(--color-warning);
}

.seat.premium.selected {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.selected-seats {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.selected-seats h4 {
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.remove-seat {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
}

.no-selected {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .seat-grid {
    grid-template-columns: repeat(5, 40px);
  }
  
  .seat-legend {
    flex-wrap: wrap;
  }
}
</style>
