import { createRouter, createWebHistory } from "vue-router"

// Importar componentes de página
import HomePage from "../views/HomePage.vue"
import DestinosPage from "../views/DestinosPage.vue"
import DetalleDestinoPage from "../views/DetalleDestinoPage.vue"
import NavesPage from "../views/NavesPage.vue"
import DetalleNavePage from "../views/DetalleNavePage.vue"
import LoginPage from "../views/LoginPage.vue"
import RegisterPage from "../views/RegisterPage.vue"
import PerfilPage from "../views/PerfilPage.vue"
import ReservasPage from "../views/ReservasPage.vue"
import DetalleReservaPage from "../views/DetalleReservaPage.vue"
import NotFoundPage from "../views/NotFoundPage.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/destinos",
    name: "Destinos",
    component: DestinosPage,
  },
  {
    path: "/destinos/:id",
    name: "DetalleDestino",
    component: DetalleDestinoPage,
  },
  {
    path: "/naves",
    name: "Naves",
    component: NavesPage,
  },
  {
    path: "/naves/:id",
    name: "DetalleNave",
    component: DetalleNavePage,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterPage,
  },
  {
    path: "/perfil",
    name: "Perfil",
    component: PerfilPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/reservas",
    name: "Reservas",
    component: ReservasPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/reservas/:id",
    name: "DetalleReserva",
    component: DetalleReservaPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/reservas/nueva",
    name: "NuevaReserva",
    component: () => import("../views/NuevaReservaPage.vue"),
    meta: { requiresAuth: true, title: "Nueva Reserva - Stellar Tourism" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Protección de rutas
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isAuthenticated = localStorage.getItem("user") !== null // Simplificado para este ejemplo

  if (requiresAuth && !isAuthenticated) {
    next("/login")
  } else {
    next()
  }
})

export default router
