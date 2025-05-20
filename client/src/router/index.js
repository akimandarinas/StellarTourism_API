import { createRouter, createWebHistory } from "vue-router"

// Importar componentes de página
const HomePage = () => import("../views/HomePage.vue")
const DestinosPage = () => import("../views/DestinosPage.vue")
const DetalleDestinoPage = () => import("../views/DetalleDestinoPage.vue")
const NavesPage = () => import("../views/NavesPage.vue")
const DetalleNavePage = () => import("../views/DetalleNavePage.vue")
const LoginPage = () => import("../views/LoginPage.vue")
const RegisterPage = () => import("../views/RegisterPage.vue")
const PerfilPage = () => import("../views/PerfilPage.vue")
const ReservasPage = () => import("../views/ReservasPage.vue")
const DetalleReservaPage = () => import("../views/DetalleReservaPage.vue")
const CheckoutPage = () => import("../views/CheckoutPage.vue")
const NotFoundPage = () => import("../views/NotFoundPage.vue")

// Crear instancia del router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePage,
      meta: { title: "Inicio - Stellar Tourism" },
    },
    {
      path: "/destinos",
      name: "destinos",
      component: DestinosPage,
      meta: { title: "Destinos - Stellar Tourism" },
    },
    {
      path: "/destinos/:id",
      name: "detalle-destino",
      component: DetalleDestinoPage,
      meta: { title: "Detalle de Destino - Stellar Tourism" },
    },
    {
      path: "/naves",
      name: "naves",
      component: NavesPage,
      meta: { title: "Naves - Stellar Tourism" },
    },
    {
      path: "/naves/:id",
      name: "detalle-nave",
      component: DetalleNavePage,
      meta: { title: "Detalle de Nave - Stellar Tourism" },
    },
    {
      path: "/login",
      name: "login",
      component: LoginPage,
      meta: { title: "Iniciar Sesión - Stellar Tourism" },
    },
    {
      path: "/register",
      name: "register",
      component: RegisterPage,
      meta: { title: "Registro - Stellar Tourism" },
    },
    {
      path: "/perfil",
      name: "perfil",
      component: PerfilPage,
      meta: { title: "Mi Perfil - Stellar Tourism", requiresAuth: true },
    },
    {
      path: "/reservas",
      name: "reservas",
      component: ReservasPage,
      meta: { title: "Mis Reservas - Stellar Tourism", requiresAuth: true },
    },
    {
      path: "/reservas/:id",
      name: "detalle-reserva",
      component: DetalleReservaPage,
      meta: { title: "Detalle de Reserva - Stellar Tourism", requiresAuth: true },
    },
    {
      path: "/checkout/:id",
      name: "checkout",
      component: CheckoutPage,
      meta: { title: "Checkout - Stellar Tourism", requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundPage,
      meta: { title: "Página no encontrada - Stellar Tourism" },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Guardia de navegación para títulos de página y autenticación
router.beforeEach((to, from, next) => {
  // Actualizar el título de la página
  document.title = to.meta.title || "Stellar Tourism"

  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    // Aquí iría la lógica para verificar si el usuario está autenticado
    // Por ahora, simplemente permitimos el acceso
    next()
  } else {
    next()
  }
})

export default router
