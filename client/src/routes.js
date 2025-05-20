import HomePage from "./views/HomePage.vue"

// Definición de rutas
const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/destinos",
    name: "destinos",
    component: () => import("./views/DestinosPage.vue"),
  },
  {
    path: "/naves",
    name: "naves",
    component: () => import("./views/NavesPage.vue"),
  },
  {
    path: "/reservas",
    name: "reservas",
    component: () => import("./views/ReservasPage.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("./views/NotFoundPage.vue"),
  },
]

export default routes
