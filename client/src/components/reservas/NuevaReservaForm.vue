<template>
  <div class="nueva-reserva-form">
    <div class="form-container bg-white p-6 rounded-lg shadow-md">
      <div v-if="currentStep === 1" class="step-container">
        <h2 class="text-xl font-semibold mb-4">Paso 1: Selecciona tu destino</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div 
            v-for="destino in destinos" 
            :key="destino.id"
            class="destino-card p-4 border rounded-lg cursor-pointer transition-all"
            :class="{ 'border-purple-500 bg-purple-50': formData.destino === destino.id }"
            @click="selectDestino(destino.id)"
          >
            <div class="flex items-center">
              <div class="w-16 h-16 rounded-full overflow-hidden mr-4">
                <img :src="destino.imagen" :alt="destino.nombre" class="w-full h-full object-cover">
              </div>
              <div>
                <h3 class="font-medium text-gray-900">{{ destino.nombre }}</h3>
                <p class="text-sm text-gray-500">{{ destino.descripcionCorta }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button 
            @click="nextStep" 
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            :disabled="!formData.destino"
          >
            Continuar
          </button>
        </div>
      </div>
      
      <div v-else-if="currentStep === 2" class="step-container">
        <h2 class="text-xl font-semibold mb-4">Paso 2: Selecciona fechas y pasajeros</h2>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de salida</label>
          <input 
            type="date" 
            v-model="formData.fechaSalida"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            :min="minDate"
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Número de pasajeros</label>
          <div class="flex items-center">
            <button 
              @click="decrementPasajeros" 
              class="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-100"
              :disabled="formData.pasajeros <= 1"
            >
              -
            </button>
            <input 
              type="number" 
              v-model="formData.pasajeros"
              class="w-16 px-3 py-1 border-t border-b border-gray-300 text-center"
              min="1" 
              max="10"
              readonly
            >
            <button 
              @click="incrementPasajeros" 
              class="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-100"
              :disabled="formData.pasajeros >= 10"
            >
              +
            </button>
          </div>
        </div>
        
        <div class="flex justify-between mt-6">
          <button 
            @click="prevStep" 
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Atrás
          </button>
          <button 
            @click="nextStep" 
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            :disabled="!formData.fechaSalida"
          >
            Continuar
          </button>
        </div>
      </div>
      
      <div v-else-if="currentStep === 3" class="step-container">
        <h2 class="text-xl font-semibold mb-4">Paso 3: Selecciona tu nave</h2>
        
        <div class="grid grid-cols-1 gap-4 mb-6">
          <div 
            v-for="nave in naves" 
            :key="nave.id"
            class="nave-card p-4 border rounded-lg cursor-pointer transition-all"
            :class="{ 'border-purple-500 bg-purple-50': formData.nave === nave.id }"
            @click="selectNave(nave.id)"
          >
            <div class="flex items-center">
              <div class="w-16 h-16 rounded-full overflow-hidden mr-4">
                <img :src="nave.imagen" :alt="nave.nombre" class="w-full h-full object-cover">
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ nave.nombre }}</h3>
                <p class="text-sm text-gray-500">{{ nave.descripcion }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">Capacidad</p>
                <p class="font-medium">{{ nave.capacidad }} pasajeros</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-between mt-6">
          <button 
            @click="prevStep" 
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Atrás
          </button>
          <button 
            @click="nextStep" 
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            :disabled="!formData.nave"
          >
            Continuar
          </button>
        </div>
      </div>
      
      <div v-else-if="currentStep === 4" class="step-container">
        <h2 class="text-xl font-semibold mb-4">Paso 4: Resumen de tu reserva</h2>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <div class="mb-4">
            <h3 class="font-medium text-gray-900 mb-2">Destino</h3>
            <p>{{ getDestinoNombre(formData.destino) }}</p>
          </div>
          
          <div class="mb-4">
            <h3 class="font-medium text-gray-900 mb-2">Fecha de salida</h3>
            <p>{{ formatDate(formData.fechaSalida) }}</p>
          </div>
          
          <div class="mb-4">
            <h3 class="font-medium text-gray-900 mb-2">Pasajeros</h3>
            <p>{{ formData.pasajeros }}</p>
          </div>
          
          <div class="mb-4">
            <h3 class="font-medium text-gray-900 mb-2">Nave</h3>
            <p>{{ getNaveNombre(formData.nave) }}</p>
          </div>
          
          <div class="border-t border-gray-200 pt-4 mt-4">
            <div class="flex justify-between">
              <h3 class="font-medium text-gray-900">Precio total estimado</h3>
              <p class="font-bold text-purple-600">{{ formatPrice(calcularPrecioTotal()) }}</p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-between mt-6">
          <button 
            @click="prevStep" 
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Atrás
          </button>
          <button 
            @click="submitReserva" 
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Procesando...' : 'Confirmar reserva' }}
          </button>
        </div>
      </div>
      
      <div v-else-if="currentStep === 5" class="step-container text-center py-8">
        <div class="text-green-500 text-5xl mb-4">✓</div>
        <h2 class="text-2xl font-bold mb-2">¡Reserva creada con éxito!</h2>
        <p class="text-gray-600 mb-6">Tu número de reserva es: <span class="font-medium">{{ reservaId }}</span></p>
        
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            :href="`/reservas/${reservaId}`" 
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-center"
          >
            Ver detalles de la reserva
          </a>
          <a 
            href="/reservas" 
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-center"
          >
            Volver a mis reservas
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SeatSelector from './SeatSelector.vue';
import { useToast } from '@/composables/useToast';
import { useReservas } from '@/composables/useReservas';

export default {
  name: 'NuevaReservaForm',
  components: {
    SeatSelector
  },
  
  data() {
    return {
      currentStep: 1,
      isSubmitting: false,
      reservaId: null,
      formData: {
        destino: null,
        fechaSalida: null,
        pasajeros: 1,
        nave: null
      },
      destinos: [
        {
          id: 1,
          nombre: 'Luna - Base Artemisa',
          descripcionCorta: 'Visita la primera colonia lunar permanente',
          imagen: '/images/luna-base.png',
          precioBase: 1500000
        },
        {
          id: 2,
          nombre: 'Marte - Colonia Ares',
          descripcionCorta: 'Explora el planeta rojo y sus asentamientos',
          imagen: '/images/marte.png',
          precioBase: 3500000
        },
        {
          id: 3,
          nombre: 'Estación Orbital Internacional',
          descripcionCorta: 'Experimenta la vida en órbita terrestre',
          imagen: '/images/estacion-orbital.png',
          precioBase: 950000
        },
        {
          id: 4,
          nombre: 'Venus - Estación Científica',
          descripcionCorta: 'Visita los laboratorios en las nubes de Venus',
          imagen: '/images/venus-clouds.png',
          precioBase: 2800000
        }
      ],
      naves: [
        {
          id: 1,
          nombre: 'Aurora Estelar',
          descripcion: 'Nave de lujo con todas las comodidades',
          capacidad: 50,
          imagen: '/images/naves/aurora-estelar-cruiser.png',
          factorPrecio: 1.5
        },
        {
          id: 2,
          nombre: 'Halcón Lunar',
          descripcion: 'Transporte rápido y eficiente',
          capacidad: 30,
          imagen: '/images/naves/halcon-lunar-shuttle.png',
          factorPrecio: 1.2
        },
        {
          id: 3,
          nombre: 'Voyager Marciano',
          descripcion: 'Especializada en viajes interplanetarios',
          capacidad: 40,
          imagen: '/images/naves/voyager-marciano-cruiser.png',
          factorPrecio: 1.3
        }
      ]
    };
  },
  
  computed: {
    minDate() {
      const today = new Date();
      today.setDate(today.getDate() + 30); // Mínimo 30 días de antelación
      return today.toISOString().split('T')[0];
    }
  },
  
  methods: {
    nextStep() {
      if (this.currentStep < 5) {
        this.currentStep++;
      }
    },
    
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    
    selectDestino(id) {
      this.formData.destino = id;
    },
    
    selectNave(id) {
      this.formData.nave = id;
    },
    
    incrementPasajeros() {
      if (this.formData.pasajeros < 10) {
        this.formData.pasajeros++;
      }
    },
    
    decrementPasajeros() {
      if (this.formData.pasajeros > 1) {
        this.formData.pasajeros--;
      }
    },
    
    getDestinoNombre(id) {
      const destino = this.destinos.find(d => d.id === id);
      return destino ? destino.nombre : '';
    },
    
    getNaveNombre(id) {
      const nave = this.naves.find(n => n.id === id);
      return nave ? nave.nombre : '';
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR' 
      }).format(price);
    },
    
    calcularPrecioTotal() {
      if (!this.formData.destino || !this.formData.nave) {
        return 0;
      }
      
      const destino = this.destinos.find(d => d.id === this.formData.destino);
      const nave = this.naves.find(n => n.id === this.formData.nave);
      
      if (!destino || !nave) {
        return 0;
      }
      
      // Precio base por destino * factor de la nave * número de pasajeros
      return destino.precioBase * nave.factorPrecio * this.formData.pasajeros;
    },
    
    async submitReserva() {
      this.isSubmitting = true;
      
      try {
        // Simulamos una llamada a la API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generamos un ID de reserva aleatorio
        this.reservaId = 'RES-' + Math.floor(100000 + Math.random() * 900000);
        
        // Avanzamos al paso de confirmación
        this.currentStep = 5;
      } catch (error) {
        console.error('Error al crear la reserva:', error);
        alert('Ha ocurrido un error al procesar tu reserva. Por favor, inténtalo de nuevo.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.nueva-reserva-form {
  margin-bottom: 3rem;
}

.step-container {
  min-height: 400px;
}

input[type="date"] {
  color-scheme: light;
}

.booking-wizard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Stepper styles */
.stepper-container {
  margin-bottom: 2rem;
  overflow-x: auto;
}

.stepper {
  display: flex;
  justify-content: space-between;
  width: 100%;
  min-width: 600px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 1.5rem;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: #e5e7eb;
  z-index: 1;
}

.step.completed:not(:last-child)::after {
  background-color: #7c3aed;
}

.step-number {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: #f3f4f6;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  z-index: 2;
  color: #6b7280;
}

.step.active .step-number {
  background-color: #7c3aed;
  border-color: #7c3aed;
  color: white;
}

.step.completed .step-number {
  background-color: #7c3aed;
  border-color: #7c3aed;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.step.active .step-label {
  color: #7c3aed;
  font-weight: 600;
}

.step.completed .step-label {
  color: #7c3aed;
}

.step.clickable {
  cursor: pointer;
}

.check-icon {
  font-size: 1.25rem;
}

/* Step content styles */
.step-panel {
  min-height: 400px;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
  text-align: center;
}

/* Destination selection styles */
.search-filter {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.destination-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.destination-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.destination-card.selected {
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.3);
}

.destination-image {
  height: 180px;
  position: relative;
  overflow: hidden;
}

.destination-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.destination-price {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.destination-info {
  padding: 1rem;
}

.destination-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.destination-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.destination-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.detail {
  font-size: 0.75rem;
  color: #4b5563;
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.destination-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: flex;
}

.star {
  color: #d1d5db;
  font-size: 1rem;
}

.star.filled {
  color: #fbbf24;
}

.rating-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
}

/* Ship selection styles */
.selected-destination-summary {
  margin-bottom: 1.5rem;
}

.selected-destination-summary h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: #f9fafb;
}

.summary-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.25rem;
}

.summary-details h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.summary-details p {
  font-size: 0.875rem;
  color: #6b7280;
}

.ships-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.ship-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.ship-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.ship-card.selected {
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.3);
}

.ship-image {
  height: 180px;
  position: relative;
  overflow: hidden;
}

.ship-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ship-class {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.ship-info {
  padding: 1rem;
}

.ship-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1f2937;
}

.ship-model {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.ship-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.ship-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  font-size: 0.75rem;
  color: #4b5563;
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.feature-tag.more {
  background-color: #e5e7eb;
}

/* Date and seats selection styles */
.date-seats-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.date-selection h3,
.passengers-selection h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.date-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.number-input {
  display: flex;
  align-items: center;
}

.number-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  font-size: 1.25rem;
  cursor: pointer;
}

.number-btn:first-child {
  border-radius: 0.375rem 0 0 0.375rem;
}

.number-btn:last-child {
  border-radius: 0 0.375rem 0.375rem 0;
}

.number-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.number-field {
  width: 4rem;
  height: 2.5rem;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 0.875rem;
}

.field-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.availability-checking {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.availability-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.availability-status.available {
  background-color: #ecfdf5;
  color: #065f46;
}

.availability-status.unavailable {
  background-color: #fef2f2;
  color: #b91c1c;
}

.availability-icon {
  font-weight: bold;
}

.seat-selection {
  margin-top: 2rem;
}

.seat-selection h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.selection-instruction {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

/* Passenger information styles */
.passengers-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.passenger-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.passenger-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.full-width {
  grid-column: span 2;
}

/* Confirmation styles */
.reservation-summary {
  margin-bottom: 2rem;
}

.summary-section {
  margin-bottom: 1.5rem;
}

.summary-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.summary-details-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.summary-detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}

.passengers-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.passenger-summary-item {
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 0.375rem;
}

.passenger-summary-item h4 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.passenger-summary-item p {
  font-size: 0.75rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

.price-summary {
  margin-top: 2rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.price-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.price-total {
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 1.125rem;
  color: #1f2937;
}

.terms-conditions {
  margin-bottom: 2rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.checkbox-container a {
  color: #7c3aed;
  text-decoration: underline;
}

/* Success panel styles */
.success-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  background-color: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.success-message {
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.reservation-number {
  font-size: 1rem;
  color: #1f2937;
  margin-bottom: 2rem;
}

.success-actions {
  display: flex;
  gap: 1rem;
}

/* Button styles */
.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background-color: #e5e7eb;
}

.btn-next {
  padding: 0.75rem 1.5rem;
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-next:hover:not(:disabled) {
  background-color: #6d28d9;
}

.btn-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-confirm {
  padding: 0.75rem 1.5rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #059669;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-view-reservation {
  padding: 0.75rem 1.5rem;
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view-reservation:hover {
  background-color: #6d28d9;
}

.btn-go-home {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-go-home:hover {
  background-color: #e5e7eb;
}

/* Loading styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e5e7eb;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-spinner.small {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
  margin-bottom: 0;
}

.loading-spinner.small.white {
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: white;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty state styles */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.modal-body h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.modal-body p {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-accept {
  padding: 0.5rem 1rem;
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-accept:hover {
  background-color: #6d28d9;
}

/* Responsive styles */
@media (max-width: 768px) {
  .booking-wizard {
    padding: 1rem;
  }
  
  .date-seats-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .passengers-form {
    grid-template-columns: 1fr;
  }
  
  .summary-details-list {
    grid-template-columns: 1fr;
  }
  
  .passengers-summary {
    grid-template-columns: 1fr;
  }
  
  .success-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
