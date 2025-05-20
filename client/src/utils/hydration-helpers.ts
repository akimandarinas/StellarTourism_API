// Utilidad para determinar si un componente debe hidratarse en el cliente
export const shouldHydrate = (id: string): boolean => {
  // Si estamos en el servidor, no hidratar
  if (typeof window === "undefined") {
    return false
  }

  // Verificar si el elemento existe en el DOM
  const element = document.getElementById(id)
  return !!element
}

// Utilidad para marcar un componente como hidratado
export const markAsHydrated = (id: string): void => {
  if (typeof window === "undefined") {
    return
  }

  const element = document.getElementById(id)
  if (element) {
    element.setAttribute("data-hydrated", "true")
  }
}

// Utilidad para verificar si un componente ya está hidratado
export const isHydrated = (id: string): boolean => {
  if (typeof window === "undefined") {
    return false
  }

  const element = document.getElementById(id)
  return element ? element.getAttribute("data-hydrated") === "true" : false
}
