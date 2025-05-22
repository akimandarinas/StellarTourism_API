<template>
  <div class="seat-selector">
    <div class="seat-map">
      <div class="seat-rows">
        <div v-for="row in seatRows" :key="row" class="seat-row">
          <div class="row-label">{{ row }}</div>
          <div v-for="seat in seatsPerRow" :key="`${row}${seat}`" class="seat-container">
            <button
              :class="[
                'seat',
                { 
                  'available': isSeatAvailable(`${row}${seat}`),
                  'unavailable': !isSeatAvailable(`${row}${seat}`),
                  'selected': isSelected(`${row}${seat}`)
                }
              ]"
              :disabled="!isSeatAvailable(`${row}${seat}`)"
              @click="toggleSeat(`${row}${seat}`)"
            >
              {{ seat }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="seat-legend">
      <div class="legend-item">
        <div class="legend-seat available"></div>
        <span>Disponible</span>
      </div>
      <div class="legend-item">
        <div class="legend-seat unavailable"></div>
        <span>No disponible</span>
      </div>
      <div class="legend-item">
        <div class="legend-seat selected"></div>
        <span>Seleccionado</span>
      </div>
    </div>
    
    <div class="selected-seats">
      <p>Asientos seleccionados: {{ seleccionados.join(', ') || 'Ninguno' }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'SeatSelector',
  
  props: {
    disponibles: {
      type: Array,
      default: () => []
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
    const seatRows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seatsPerRow = 6;
    
    const asientosDisponibles = computed(() => {
      if (props.disponibles.length > 0) {
        return props.disponibles;
      }
      
      const disponibles = [];
      seatRows.forEach(row => {
        for (let i = 1; i <= seatsPerRow; i++) {
          // 80% de probabilidad de que un asiento esté disponible
          if (Math.random() < 0.8) {
            disponibles.push(`${row}${i}`);
          }
        }
      });
      
      return disponibles;
    });
    
    //Lista local de asientos seleccionados
    const asientosSeleccionados = ref([...props.seleccionados]);
    
    //Verificar si un asiento está disponible
    const isSeatAvailable = (seatId) => {
      return asientosDisponibles.value.includes(seatId);
    };
    
    //Verificar si un asiento está seleccionado
    const isSelected = (seatId) => {
      return asientosSeleccionados.value.includes(seatId);
    };
    
    //Alternar selección de asiento
    const toggleSeat = (seatId) => {
      if (isSelected(seatId)) {
        asientosSeleccionados.value = asientosSeleccionados.value.filter(id => id !== seatId);
      } else {
        if (asientosSeleccionados.value.length >= props.maxSeleccionables) {
          asientosSeleccionados.value.shift();
        }
        
        // Seleccionar asiento
        asientosSeleccionados.value.push(seatId);
      }
      
      emit('update:seleccionados', asientosSeleccionados.value);
    };
    
    watch(() => props.seleccionados, (newValue) => {
      asientosSeleccionados.value = [...newValue];
    });
    
    return {
      seatRows,
      seatsPerRow,
      isSeatAvailable,
      isSelected,
      toggleSeat
    };
  }
};
</script>

<style scoped>
.seat-selector {
  margin-bottom: 2rem;
}

.seat-map {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.seat-rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.row-label {
  width: 1.5rem;
  text-align: center;
  font-weight: 600;
  color: #4b5563;
}

.seat-container {
  padding: 0.25rem;
}

.seat {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.seat.available {
  background-color: #d1fae5;
  color: #065f46;
}

.seat.available:hover {
  background-color: #a7f3d0;
}

.seat.unavailable {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.seat.selected {
  background-color: #7c3aed;
  color: white;
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-seat {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
}

.legend-seat.available {
  background-color: #d1fae5;
}

.legend-seat.unavailable {
  background-color: #f3f4f6;
}

.legend-seat.selected {
  background-color: #7c3aed;
}

.selected-seats {
  text-align: center;
  font-size: 0.875rem;
  color: #4b5563;
}
</style>
