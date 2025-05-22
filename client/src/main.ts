import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import { getRouter } from "./router"

// Crear la instancia de Pinia primero
const pinia = createPinia()
window.__pinia = pinia

function isClient() {
  return typeof window !== "undefined"
}

if (isClient()) {
  // Inicializar la aplicación de forma asíncrona
  async function initApp() {
    const app = createApp(App)
    const router = await getRouter()

    // Usar Pinia antes que cualquier otro plugin
    app.use(pinia)

    if (router) {
      app.use(router)
    }

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

export { App, pinia }
