<template>
  <div class="reserva-card">
    <h3>Reserva ID: {{ reserva.id }}</h3>
    <p>Fecha: {{ reserva.fecha }}</p>
    <p>Hora: {{ reserva.hora }}</p>
    <p>Número de personas: {{ reserva.num_personas }}</p>
    <p>Estado: {{ reserva.estado }}</p>

    <!-- Add this button for pending reservations -->
    <div v-if="reserva.estado === 'pendiente'" class="reservation-actions">
      <button 
        class="btn-pending-payment"
        @click="$emit('payment', reserva.id)"
      >
        Pendiente de pago
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    reserva: {
      type: Object,
      required: true
    }
  },
  emits: ['payment']
}
</script>

<style scoped>
.reserva-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
}

.btn-pending-payment {
  background-color: #f59e0b;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pending-payment:hover {
  background-color: #d97706;
}

.reservation-actions {
  margin-top: 1rem;
}
</style>
