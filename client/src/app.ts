import { createApp as createVueApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import { getRouter } from "./router"

// Determinar si estamos en el cliente
function isClient() {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

// Función para crear la aplicación Vue
export async function createApp() {
  const app = createVueApp(App)
  const pinia = createPinia()

  app.use(pinia)

  if (isClient()) {
    try {
      const router = await getRouter()
      if (router) {
        app.use(router)
      }
    } catch (error) {
      console.error("Error al inicializar el router:", error)
    }
  }

  if (isClient()) {
    try {
      const { registerDirectives } = await import("./directives")
      registerDirectives(app)
    } catch (error) {
      console.error("Error registering directives:", error)
    }
  }

  // Configurar manejo de errores global
  app.config.errorHandler = (err, instance, info) => {
    console.error("Vue Error:", err)
    console.error("Component:", instance)
    console.error("Info:", info)

    if (isClient()) {
      import("./utils/error-handling")
        .then(({ logError }) => {
          logError(err, { component: instance?.$options?.name, info })
        })
        .catch(console.error)
    }
  }

  return { app, pinia }
}

export async function mountApp() {
  if (isClient()) {
    const { app } = await createApp()
    app.mount("#app")
  }
}

// Montar la aplicación automáticamente
if (isClient()) {
  // Usar setTimeout para asegurarnos de que se ejecute después de que el DOM esté listo
  setTimeout(() => {
    mountApp().catch(console.error)
  }, 0)
}
