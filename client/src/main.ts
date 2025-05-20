import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import { getRouter } from "./router"

// Función para determinar si estamos en el cliente
function isClient() {
  return typeof window !== "undefined"
}

// Solo inicializar la aplicación en el cliente
if (isClient()) {
  // Inicializar la aplicación de forma asíncrona
  async function initApp() {
    const app = createApp(App)
    const pinia = createPinia()
    const router = await getRouter()

    app.use(pinia)

    if (router) {
      app.use(router)
    }

    // Montar la aplicación cuando el DOM esté listo
    document.addEventListener("DOMContentLoaded", () => {
      const mountPoint = document.getElementById("app")
      if (mountPoint) {
        app.mount(mountPoint)
      } else {
        console.error("No se encontró el punto de montaje #app")
      }
    })
  }

  // Iniciar la aplicación
  initApp().catch(console.error)
}

// Exportar componentes para SSR (si es necesario)
export { App }
