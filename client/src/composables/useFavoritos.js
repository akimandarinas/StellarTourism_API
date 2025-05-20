"use client"

import { ref } from "vue"
import { useAuthStore } from "../stores/auth"
import { useToast } from "./useToast"
import { api } from "../services/api"
import { useRouter } from "vue-router"

export function useFavoritos() {
  const authStore = useAuthStore()
  const toast = useToast()
  const router = useRouter()

  const favoritos = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Cargar favoritos del usuario
  const cargarFavoritos = async () => {
    if (!authStore.isAuthenticated) {
      favoritos.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const data = await api.favoritos.getByUser(authStore.user.uid)
      favoritos.value = data
      return data
    } catch (err) {
      console.error("Error al cargar favoritos:", err)
      error.value = "No se pudieron cargar los favoritos"
      throw err
    } finally {
      loading.value = false
    }
  }

  // Verificar si un destino está en favoritos
  const esFavorito = (destinoId) => {
    return favoritos.value.some((fav) => fav.destinoId === destinoId)
  }

  // Alternar favorito (añadir/quitar)
  const toggleFavorito = async (destino) => {
    if (!authStore.isAuthenticated) {
      toast.info(
        "Inicia sesión para guardar favoritos",
        "Necesitas iniciar sesión para guardar destinos en favoritos",
        {
          action: {
            label: "Iniciar sesión",
            onClick: () => router.push(`/login?redirect=/destinos/${destino.id}`),
          },
        },
      )
      return
    }

    try {
      const esFav = esFavorito(destino.id)

      if (esFav) {
        // Quitar de favoritos
        await api.favoritos.remove(authStore.user.uid, destino.id)
        favoritos.value = favoritos.value.filter((fav) => fav.destinoId !== destino.id)
        toast.success("Eliminado de favoritos", `${destino.nombre} ha sido eliminado de tus favoritos`)
      } else {
        // Añadir a favoritos
        const nuevoFavorito = await api.favoritos.add(authStore.user.uid, {
          destinoId: destino.id,
          nombre: destino.nombre,
          imagen: destino.imagen,
          fechaCreacion: new Date(),
        })
        favoritos.value.push(nuevoFavorito)
        toast.success("Añadido a favoritos", `${destino.nombre} ha sido añadido a tus favoritos`)
      }
    } catch (err) {
      console.error("Error al modificar favorito:", err)
      toast.error("Error", "No se pudo modificar el favorito. Por favor, intenta nuevamente.")
    }
  }

  return {
    favoritos,
    loading,
    error,
    cargarFavoritos,
    esFavorito,
    toggleFavorito,
  }
}
