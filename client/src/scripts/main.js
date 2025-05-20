// Asegurar que el script principal sea compatible con Astro

// Verificar si estamos en el navegador antes de acceder a window
const isBrowser = typeof window !== "undefined"

// Función principal que se ejecuta en el cliente
function initializeClientSide() {
  if (!isBrowser) return

  // Código que depende del navegador
  console.log("Script principal inicializado")

  // Inicializar funcionalidades
  setupScrollAnimations()
  setupMobileMenu()
  checkWebGLSupport()
}

// Configurar animaciones de scroll
function setupScrollAnimations() {
  if (!isBrowser) return

  const elements = document.querySelectorAll(".animate-on-scroll")

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated")
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 },
  )

  elements.forEach((el) => observer.observe(el))
}

// Configurar menú móvil
function setupMobileMenu() {
  if (!isBrowser) return

  const menuButton = document.querySelector(".mobile-menu-button")
  const mobileMenu = document.querySelector(".nav-links")

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("active")
    })
  }
}

// Comprobar soporte de WebGL para visualizaciones 3D
function checkWebGLSupport() {
  if (!isBrowser) return
  const canvas = document.createElement("canvas")
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

  if (!gl) {
    console.warn("WebGL no soportado. Las visualizaciones 3D pueden no funcionar correctamente.")

    // Añadir clase al body para aplicar estilos alternativos
    document.body.classList.add("no-webgl")

    // Mostrar advertencia en visualizaciones 3D
    const visualizaciones3D = document.querySelectorAll(".visualizacion-3d")
    visualizaciones3D.forEach((el) => {
      const warning = document.createElement("div")
      warning.className = "webgl-warning"
      warning.textContent = "Tu navegador no soporta WebGL. La visualización 3D no está disponible."
      el.appendChild(warning)
    })
  }
}

// Inicializar cuando el DOM esté listo
if (isBrowser) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeClientSide)
  } else {
    initializeClientSide()
  }
}

// Exportar funciones para uso en otros scripts
export { setupScrollAnimations, setupMobileMenu, checkWebGLSupport }
