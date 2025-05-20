import { createRouter as _createRouter, createMemoryHistory } from "vue-router"
import type { RouteRecordRaw, Router } from "vue-router"
import { isSSR, isClient } from "../utils/ssr-safe"

// Importaciones de vistas
const HomePage = () => import("../views/HomePage.vue")
const DestinosPage = () => import("../views/DestinosPage.vue")
const NavesPage = () => import("../views/NavesPage.vue")
const NotFoundPage = () => import("../views/NotFoundPage.vue")
const DetalleDestinoPage = () => import("../views/DetalleDestinoPage.vue")
const ReservasPage = () => import("../views/ReservasPage.vue")
const DetalleReservaPage = () => import("../views/DetalleReservaPage.vue")
const PerfilPage = () => import("../views/PerfilPage.vue")
const LoginPage = () => import("../views/LoginPage.vue")
const RegisterPage = () => import("../views/RegisterPage.vue")
const CheckoutPage = () => import("../views/CheckoutPage.vue")

// Definición de rutas para Vue Router
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/destinos",
    name: "destinos",
    component: DestinosPage,
    meta: { requiresAuth: false, title: "Destinos - Stellar Tourism" },
  },
  {
    path: "/destinos/:id",
    name: "destino-detalle",
    component: DetalleDestinoPage,
    meta: { requiresAuth: false, title: "Detalle de Destino - Stellar Tourism" },
    props: true,
  },
  {
    path: "/naves",
    name: "naves",
    component: NavesPage,
    meta: { requiresAuth: false, title: "Naves - Stellar Tourism" },
  },
  {
    path: "/reservas",
    name: "reservas",
    component: ReservasPage,
    meta: { requiresAuth: true, title: "Mis Reservas - Stellar Tourism" },
  },
  {
    path: "/reservas/:id",
    name: "reserva-detalle",
    component: DetalleReservaPage,
    meta: { requiresAuth: true, title: "Detalle de Reserva - Stellar Tourism" },
    props: true,
  },
  {
    path: "/perfil",
    name: "perfil",
    component: PerfilPage,
    meta: { requiresAuth: true, title: "Mi Perfil - Stellar Tourism" },
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { requiresAuth: false, title: "Iniciar Sesión - Stellar Tourism", guest: true },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterPage,
    meta: { requiresAuth: false, title: "Registro - Stellar Tourism", guest: true },
  },
  {
    path: "/checkout/:id",
    name: "checkout",
    component: CheckoutPage,
    meta: { requiresAuth: true, title: "Checkout - Stellar Tourism" },
    props: true,
  },
  // Ruta de fallback para Vue Router
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundPage,
    meta: { title: "Página no encontrada - Stellar Tourism" },
  },
]

// Función para crear el router
export async function createRouter(): Promise<Router> {
  // Usar createMemoryHistory en SSR y createWebHistory en el cliente
  let history

  if (isClient()) {
    // Importación dinámica para evitar que se ejecute en SSR
    const { createWebHistory } = await import("vue-router")
    history = createWebHistory()
  } else {
    history = createMemoryHistory()
  }

  const router = _createRouter({
    history,
    routes,
    // Configuración para manejar correctamente el scroll
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      }
      if (to.hash) {
        return { el: to.hash, behavior: "smooth" }
      }
      return { top: 0, behavior: "smooth" }
    },
  })

  // Configurar navegación guards solo en el cliente
  if (isClient()) {
    setupNavigationGuards(router)
  }

  return router
}

// Configurar navegación guards
function setupNavigationGuards(router: Router) {
  // No configurar guards en SSR
  if (isSSR()) return

  // Navegación guard para autenticación
  router.beforeEach(async (to, from, next) => {
    // Actualizar el título de la página
    if (to.meta.title && isClient()) {
      document.title = to.meta.title as string
    }

    // Mostrar indicador de carga
    if (isClient()) {
      document.body.classList.add("page-loading")
    }

    // Verificar autenticación
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const isGuestOnly = to.matched.some((record) => record.meta.guest)

    // Importar dinámicamente el store de autenticación
    const { useAuthStore } = await import("../stores/index")
    const authStore = useAuthStore()

    // Esperar a que la autenticación esté inicializada
    if (!authStore.authInitialized) {
      // Esperar a que se inicialice la autenticación (máximo 2 segundos)
      await new Promise<void>((resolve) => {
        const checkAuth = () => {
          if (authStore.authInitialized) {
            resolve()
          } else {
            setTimeout(checkAuth, 100)
          }
        }
        setTimeout(() => resolve(), 2000) // Timeout de seguridad
        checkAuth()
      })
    }

    const isAuthenticated = authStore.isAuthenticated

    if (requiresAuth && !isAuthenticated) {
      // Guardar la ruta a la que se intentaba acceder
      const redirectPath = to.fullPath
      next({
        path: "/login",
        query: { redirect: redirectPath },
      })
    } else if (isGuestOnly && isAuthenticated) {
      // Redirigir a la página principal si el usuario ya está autenticado
      next("/destinos")
    } else {
      next()
    }
  })

  // Quitar indicador de carga después de la navegación
  router.afterEach(() => {
    // Pequeño retraso para asegurar que la transición ha comenzado
    if (isClient()) {
      setTimeout(() => {
        document.body.classList.remove("page-loading")
      }, 100)
    }
  })

  // Manejar errores de navegación
  router.onError((error) => {
    console.error("Error de navegación:", error)
    if (isClient()) {
      document.body.classList.remove("page-loading")
    }
  })
}

// Exportar una instancia del router para uso en componentes
// Esta instancia solo se utilizará en el cliente
let routerInstance: Router | null = null

export async function getRouter(): Promise<Router> {
  if (!routerInstance && isClient()) {
    routerInstance = await createRouter()
  }
  return routerInstance || createClientProxy(() => createRouter())
}

// Función auxiliar para crear un proxy seguro para SSR
function createClientProxy<T>(factory: () => Promise<T>): T {
  if (isClient()) {
    return {} as T // Esto se reemplazará con la instancia real
  }

  // En SSR, devolver un proxy que no hace nada
  return new Proxy({} as T, {
    get() {
      return createClientProxy(() => Promise.resolve({} as T))
    },
    apply() {
      return createClientProxy(() => Promise.resolve({} as T))
    },
  })
}

// No exportamos el router directamente para evitar inicializaciones en SSR
// export default getRouter()
