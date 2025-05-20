"use client"

import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useToast } from "../composables/useToast"

export const useCarritoStore = defineStore("carrito", () => {
  const toast = useToast()

  // Estado
  const items = ref([])

  // Getters
  const cantidadItems = computed(() => {
    return items.value.length
  })

  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  })

  // Acciones
  function agregarItem(item) {
    // Verificar si el item ya existe en el carrito
    const existingItem = items.value.find((i) => i.id === item.id && i.tipo === item.tipo)

    if (existingItem) {
      existingItem.cantidad += item.cantidad || 1
    } else {
      items.value.push({
        ...item,
        cantidad: item.cantidad || 1,
      })
    }

    toast.success("Añadido al carrito", `${item.nombre} ha sido añadido al carrito`)
  }

  function eliminarItem(id, tipo) {
    const index = items.value.findIndex((i) => i.id === id && i.tipo === tipo)

    if (index !== -1) {
      const itemEliminado = items.value[index]
      items.value.splice(index, 1)
      toast.info("Eliminado del carrito", `${itemEliminado.nombre} ha sido eliminado del carrito`)
    }
  }

  function actualizarCantidad(id, tipo, cantidad) {
    const item = items.value.find((i) => i.id === id && i.tipo === tipo)

    if (item) {
      item.cantidad = cantidad
    }
  }

  function vaciarCarrito() {
    items.value = []
    toast.info("Carrito vacío", "Se han eliminado todos los items del carrito")
  }

  return {
    items,
    cantidadItems,
    total,
    agregarItem,
    eliminarItem,
    actualizarCantidad,
    vaciarCarrito,
  }
})
