// Importaciones básicas
import { createMemoryHistory } from "vue-router"

// Definición de rutas
const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("./views/HomePage.vue"),
  },
  {
    path: "/destinos",
    name: "destinos",
    component: () => import("./views/DestinosPage.vue"),
    meta: { requiresAuth: false, title: "Destinos - Stellar Tourism" },
  },
  {
    path: "/destinos/:id",
    name: "destino-detalle",
    component: () => import("./views/DetalleDestinoPage.vue"),
    meta: { requiresAuth: false, title: "Detalle de Destino - Stellar Tourism" },
    props: true,
  },
  {
    path: "/naves",
    name: "naves",
    component: () => import("./views/NavesPage.vue"),
    meta: { requiresAuth: false, title: "Naves - Stellar Tourism" },
  },
  {
    path: "/reservas",
    name: "reservas",
    component: () => import("./views/ReservasPage.vue"),
    meta: { requiresAuth: true, title: "Mis Reservas - Stellar Tourism" },
  },
  {
    path: "/reservas/:id",
    name: "reserva-detalle",
    component: () => import("./views/DetalleReservaPage.vue"),
    meta: { requiresAuth: true, title: "Detalle de Reserva - Stellar Tourism" },
    props: true,
  },
  {
    path: "/perfil",
    name: "perfil",
    component: () => import("./views/PerfilPage.vue"),
    meta: { requiresAuth: true, title: "Mi Perfil - Stellar Tourism" },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("./views/LoginPage.vue"),
    meta: { requiresAuth: false, title: "Iniciar Sesión - Stellar Tourism", guest: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("./views/RegisterPage.vue"),
    meta: { requiresAuth: false, title: "Registro - Stellar Tourism", guest: true },
  },
  {
    path: "/checkout/:id",
    name: "checkout",
    component: () => import("./views/CheckoutPage.vue"),
    meta: { requiresAuth: true, title: "Checkout - Stellar Tourism" },
    props: true,
  },
  // Ruta de fallback para Vue Router
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("./views/NotFoundPage.vue"),
    meta: { title: "Página no encontrada - Stellar Tourism" },
  },
]

// Función para determinar si estamos en el cliente
function isClient() {
  return typeof window !== "undefined"
}

// Función para crear el router
export async function createRouter() {
  // Importamos dinámicamente vue-router solo en el cliente
  if (isClient()) {
    const { createRouter, createWebHistory } = await import("vue-router")

    return createRouter({
      history: createWebHistory(),
      routes,
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
  } else {
    // En el servidor, usamos un router con memoria
    const { createRouter } = await import("vue-router")

    return createRouter({
      history: createMemoryHistory(),
      routes,
    })
  }
}

// Exportamos una función para obtener el router
let routerInstance = null

export async function getRouter() {
  if (!routerInstance && isClient()) {
    routerInstance = await createRouter()

    // Configurar navegación guards solo en el cliente
    if (isClient() && routerInstance) {
      setupNavigationGuards(routerInstance)
    }
  }

  return routerInstance
}

// Configurar navegación guards
function setupNavigationGuards(router) {
  // Navegación guard para autenticación
  router.beforeEach(async (to, from, next) => {
    // Actualizar el título de la página
    if (to.meta.title) {
      document.title = to.meta.title
    }

    // Mostrar indicador de carga
    document.body.classList.add("page-loading")

    // Verificar autenticación
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const isGuestOnly = to.matched.some((record) => record.meta.guest)

    // Importar dinámicamente el store de autenticación
    const { useAuthStore } = await import("./stores/index")
    const authStore = useAuthStore()

    // Esperar a que la autenticación esté inicializada
    if (!authStore.authInitialized) {
      // Esperar a que se inicialice la autenticación (máximo 2 segundos)
      await new Promise((resolve) => {
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
    setTimeout(() => {
      document.body.classList.remove("page-loading")
    }, 100)
  })

  // Manejar errores de navegación
  router.onError((error) => {
    console.error("Error de navegación:", error)
    document.body.classList.remove("page-loading")
  })
}

export default {
  routes,
  createRouter,
  getRouter,
}
