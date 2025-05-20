<template>
  <div>
    <h1>Detalle del Destino</h1>
    <p>Nombre: {{ destino.nombre }}</p>
    <p>Descripción: {{ destino.descripcion }}</p>
    <p>Distancia: {{ formatearDistancia(destino.distancia) }}</p>
    <p>Tiempo Estimado: {{ formatearTiempo(destino.tiempo) }}</p>
  </div>
</template>

<script>
export default {
  props: {
    destino: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatearDistancia(distancia) {
      return `${distancia} millones de km`;
    },
    formatearTiempo(tiempo) {
      return `${tiempo} días`;
    }
  }
}
</script>

<style scoped>
/* Estilos específicos para este componente */
</style>
