import { computed } from "vue"
import { useCarritoStore } from "../stores/carrito"

export function useCarrito() {
  const carritoStore = useCarritoStore()

  return {
    items: computed(() => carritoStore.items),
    cantidadItems: computed(() => carritoStore.cantidadItems),
    total: computed(() => carritoStore.total),
    agregarItem: carritoStore.agregarItem,
    eliminarItem: carritoStore.eliminarItem,
    actualizarCantidad: carritoStore.actualizarCantidad,
    vaciarCarrito: carritoStore.vaciarCarrito,
  }
}
