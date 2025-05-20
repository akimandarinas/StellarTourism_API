<template>
  <div class="overflow-x-auto">
    <table 
      class="min-w-full divide-y divide-gray-200"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby"
    >
      <caption v-if="caption" class="sr-only">{{ caption }}</caption>
      <slot></slot>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Table',
  props: {
    caption: {
      type: String,
      default: ''
    },
    ariaLabel: {
      type: String,
      default: ''
    },
    ariaDescribedby: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
/* Estilos para mejorar la accesibilidad de la tabla */
table {
  border-collapse: collapse;
  width: 100%;
}

/* Asegurar que los bordes sean visibles para usuarios con baja visión */
table, th, td {
  border: 1px solid #e5e7eb;
}

/* Mejorar el espaciado para facilitar la lectura */
th, td {
  padding: 0.75rem 1rem;
  text-align: left;
}

/* Destacar las filas al pasar el ratón para mejorar la navegación visual */
tbody tr:hover {
  background-color: #f9fafb;
}
</style>
