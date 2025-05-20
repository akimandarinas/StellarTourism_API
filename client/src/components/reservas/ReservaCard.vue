<template>
  <Card class="transition hover:translate-y-[-2px]">
    <template #header>
      <div class="flex justify-between items-center">
        <Badge :variant="estadoBadgeVariant">
          {{ formatearEstado(reserva.estado) }}
        </Badge>
        <span class="text-sm text-secondary-color">Reserva #{{ reserva.id }}</span>
      </div>
    </template>
    
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded overflow-hidden">
          <EnhancedAccessibleImage
            v-if="reserva.destino && reserva.destino.imagen"
            :src="reserva.destino.imagen"
            :alt="`Imagen de ${reserva.destino.nombre}`"
            class="reserva-imagen"
            :width="100"
            :height="100"
            lazy-load
          />
          <div v-else class="reserva-imagen-placeholder" aria-hidden="true">
            <span class="sr-only">No hay imagen disponible</span>
          </div>
        </div>
        <div class="flex flex-col">
          <h3 class="font-semibold text-default mb-1">{{ reserva.destino?.nombre }}</h3>
          <p class="text-sm text-secondary-color">{{ reserva.ruta?.nombre }}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="flex items-start gap-2">
          <CalendarIcon class="w-4 h-4 text-secondary-color mt-0.5" />
          <div class="flex flex-col">
            <span class="text-xs text-secondary-color">Fecha de salida</span>
            <span class="font-medium text-default">{{ formatDate(reserva.fechaSalida, 'PPP') }}</span>
          </div>
        </div>
        
        <div class="flex items-start gap-2">
          <UsersIcon class="w-4 h-4 text-secondary-color mt-0.5" />
          <div class="flex flex-col">
            <span class="text-xs text-secondary-color">Pasajeros</span>
            <span class="font-medium text-default">{{ reserva.cantidadPasajeros }}</span>
          </div>
        </div>
        
        <div class="flex items-start gap-2">
          <CreditCardIcon class="w-4 h-4 text-secondary-color mt-0.5" />
          <div class="flex flex-col">
            <span class="text-xs text-secondary-color">Total</span>
            <span class="font-medium text-default">{{ formatPrice(reserva.total) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-between gap-2 sm:flex-row flex-col">
        <router-link 
          :to="`/reservas/${reserva.id}`"
          class="ver-detalles-btn"
          v-bind="getInteractiveContentAttributes('Ver detalles de la reserva')"
        >
          Ver detalles
        </router-link>
        
        <button 
          v-if="puedeSerCancelada"
          @click="confirmarCancelacion"
          class="cancelar-btn"
          v-bind="getInteractiveContentAttributes('Cancelar reserva')"
        >
          Cancelar
        </button>
      </div>
    </template>
  </Card>
</template>

<script>
import EnhancedAccessibleImage from '@/components/common/EnhancedAccessibleImage.vue';
import { getImageAttributes, getInteractiveContentAttributes } from '@/utils/aria-content-utils';
import { Card, Badge, Button } from '@/components/ui';
import AdaptiveImage from '@/components/common/AdaptiveImage.vue'
import { Calendar as CalendarIcon, Users as UsersIcon, CreditCard as CreditCardIcon } from 'lucide-vue-next';

export default {
  components: {
    EnhancedAccessibleImage,
    Card,
    Badge,
    Button,
    AdaptiveImage,
    CalendarIcon,
    UsersIcon,
    CreditCardIcon
  },
  props: {
    reserva: {
      type: Object,
      required: true
    },
    puedeSerCancelada: {
      type: Boolean,
      default: false
    }
  },
  emits: ['ver', 'cancelar'],
  computed: {
    estadoBadgeVariant() {
      switch (this.reserva.estado) {
        case 'CONFIRMADA':
          return 'success'
        case 'PENDIENTE':
          return 'warning'
        case 'CANCELADA':
          return 'danger'
        default:
          return 'info'
      }
    }
  },
  methods: {
    formatDate(date, format) {
      return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    },
    formatPrice(price) {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price)
    },
    formatearEstado(estado) {
      switch (estado) {
        case 'CONFIRMADA':
          return 'Confirmada'
        case 'PENDIENTE':
          return 'Pendiente'
        case 'CANCELADA':
          return 'Cancelada'
        default:
          return 'Desconocido'
      }
    },
    confirmarCancelacion() {
      if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
        this.$emit('cancelar', this.reserva)
      }
    },
    formatearFechaISO(date) {
      return new Date(date).toISOString().slice(0, 10);
    },
    formatearFecha(date) {
      return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    },
    formatearPrecio(precio) {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);
    }
  }
}
</script>

<style scoped>
.reserva-imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reserva-imagen-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ver-detalles-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 0.25rem;
}

.cancelar-btn {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.estado-reserva {
  display: inline-block;
}

.estado-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.fecha-container,
.precio-container {
  margin-bottom: 0.5rem;
}

.fecha-label {
  font-weight: bold;
  margin-right: 0.5rem;
}
</style>
