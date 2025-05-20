// Utilidad para mejorar la visibilidad del foco en elementos interactivos
// Inspirado en la especificación :focus-visible

// Detectar si el usuario está navegando con teclado
let usingKeyboard = false

function handleKeyDown(event) {
  if (event.key === "Tab") {
    usingKeyboard = true

    // Añadir clase al body para estilos globales
    document.body.classList.add("user-is-tabbing")
  }
}

function handleMouseDown() {
  usingKeyboard = false

  // Quitar clase del body
  document.body.classList.remove("user-is-tabbing")
}

// Inicializar los event listeners
export function initFocusVisiblePolyfill() {
  document.addEventListener("keydown", handleKeyDown)
  document.addEventListener("mousedown", handleMouseDown)

  // Añadir estilos globales
  const style = document.createElement("style")
  style.innerHTML = `
    .user-is-tabbing *:focus {
      outline: 2px solid #4f46e5 !important;
      outline-offset: 2px !important;
    }
    
    .user-is-tabbing *:focus:not(:focus-visible) {
      outline: none !important;
    }
    
    .user-is-tabbing *:focus-visible {
      outline: 2px solid #4f46e5 !important;
      outline-offset: 2px !important;
    }
  `
  document.head.appendChild(style)
}

// Limpiar los event listeners
export function cleanupFocusVisiblePolyfill() {
  document.removeEventListener("keydown", handleKeyDown)
  document.removeEventListener("mousedown", handleMouseDown)
}

// Comprobar si el usuario está navegando con teclado
export function isUsingKeyboard() {
  return usingKeyboard
}
