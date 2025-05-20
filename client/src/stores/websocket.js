import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useAuthStore } from "./auth"

export const useWebSocketStore = defineStore("websocket", () => {
  const authStore = useAuthStore()

  // Estado
  const socket = ref(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectTimeout = ref(null)
  const subscribers = ref(new Map())
  const pendingMessages = ref([])

  // Getters
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const userId = computed(() => authStore.user?.id)

  // Acciones
  function connect() {
    if (socket.value || !isAuthenticated.value) return

    try {
      const wsUrl = import.meta.env.VITE_WS_URL || "wss://api.stellartourism.com/ws"

      socket.value = new WebSocket(`${wsUrl}?token=${authStore.token}`)

      socket.value.onopen = () => {
        console.log("WebSocket conectado")
        isConnected.value = true
        reconnectAttempts.value = 0

        // Enviar mensajes pendientes
        if (pendingMessages.value.length > 0) {
          pendingMessages.value.forEach((msg) => {
            sendMessage(msg.event, msg.data)
          })
          pendingMessages.value = []
        }

        // Suscribirse a canal de usuario
        if (userId.value) {
          sendMessage("subscribe", { channel: `user:${userId.value}` })
        }
      }

      socket.value.onclose = (event) => {
        console.log("WebSocket desconectado", event)
        isConnected.value = false
        socket.value = null

        // Intentar reconectar
        if (reconnectAttempts.value < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value), 30000)
          console.log(`Intentando reconectar en ${delay}ms...`)

          reconnectTimeout.value = setTimeout(() => {
            reconnectAttempts.value++
            connect()
          }, delay)
        }
      }

      socket.value.onerror = (error) => {
        console.error("Error en WebSocket:", error)
      }

      socket.value.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error("Error al procesar mensaje de WebSocket:", error)
        }
      }
    } catch (error) {
      console.error("Error al conectar WebSocket:", error)
    }
  }

  function disconnect() {
    if (reconnectTimeout.value) {
      clearTimeout(reconnectTimeout.value)
      reconnectTimeout.value = null
    }

    if (socket.value) {
      socket.value.close()
      socket.value = null
    }

    isConnected.value = false
    reconnectAttempts.value = 0
  }

  function sendMessage(event, data = {}) {
    const message = { event, data }

    if (isConnected.value && socket.value) {
      socket.value.send(JSON.stringify(message))
    } else {
      // Guardar mensaje para enviarlo cuando se conecte
      pendingMessages.value.push(message)

      // Intentar conectar si no está conectado
      if (!socket.value) {
        connect()
      }
    }
  }

  function handleMessage(message) {
    const { event, data } = message

    // Notificar a los suscriptores
    if (subscribers.value.has(event)) {
      subscribers.value.get(event).forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error en callback para evento ${event}:`, error)
        }
      })
    }
  }

  function subscribe(event, callback) {
    if (!subscribers.value.has(event)) {
      subscribers.value.set(event, [])
    }

    subscribers.value.get(event).push(callback)

    // Devolver función para cancelar suscripción
    return () => {
      unsubscribe(event, callback)
    }
  }

  function unsubscribe(event, callback) {
    if (subscribers.value.has(event)) {
      const callbacks = subscribers.value.get(event)
      const index = callbacks.indexOf(callback)

      if (index !== -1) {
        callbacks.splice(index, 1)
      }

      if (callbacks.length === 0) {
        subscribers.value.delete(event)
      }
    }
  }

  // Inicializar
  function init() {
    // Conectar si el usuario está autenticado
    if (isAuthenticated.value) {
      connect()
    }

    // Limpiar al cerrar la ventana
    window.addEventListener("beforeunload", disconnect)
  }

  // Limpiar
  function cleanup() {
    disconnect()
    window.removeEventListener("beforeunload", disconnect)
  }

  return {
    isConnected,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    init,
    cleanup,
  }
})
