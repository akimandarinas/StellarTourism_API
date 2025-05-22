import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"

import "./styles/global.css"

// Crear la instancia de Pinia
const pinia = createPinia()

// Crear la aplicación Vue
const app = createApp(App)

app.use(pinia)
app.use(router)

// Montar la aplicación
app.mount("#app")

export { app, pinia, router }
