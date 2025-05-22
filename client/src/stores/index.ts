import { createPinia } from "pinia"
import { createPiniaPersistencePlugin } from "../plugins/pinia-persistence"

// Store para el estado compartido - pendiente de implementar
// export { default as useSharedStore } from "./shared"

// Crear la instancia de Pinia
const pinia = createPinia()

// Añadir el plugin de persistencia
pinia.use(
  createPiniaPersistencePlugin({
    key: "stellar-tourism",
    paths: ["auth.user", "ui.theme"], // Solo persistir estas partes del estado
  }),
)

export default pinia
