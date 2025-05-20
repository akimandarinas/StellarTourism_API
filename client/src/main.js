import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"

// Importar estilos globales
import "./styles/global.css"

// Crear la aplicación Vue
const app = createApp(App)

// Crear la instancia de Pinia
const pinia = createPinia()

// Usar plugins
app.use(pinia)
app.use(router)

// Montar la aplicación
app.mount("#app")

// Exportar la instancia de la aplicación para uso en componentes
export { app, pinia, router }
