/**
 * Servicio optimizado para la carga de recursos
 * Implementa técnicas de priorización, carga perezosa y precarga inteligente
 */

// Constantes para prioridades de carga
const PRIORITY = {
  CRITICAL: 1, // Recursos críticos para la primera renderización
  HIGH: 2, // Recursos importantes pero no críticos
  MEDIUM: 3, // Recursos que pueden cargarse después
  LOW: 4, // Recursos que pueden cargarse cuando haya tiempo libre
  LAZY: 5, // Recursos que solo se cargan cuando son visibles
}

// Mapa para rastrear recursos ya cargados o en proceso de carga
const resourceCache = new Map()
const loadingPromises = new Map()

/**
 * Carga un recurso con la prioridad especificada
 * @param {string} url - URL del recurso a cargar
 * @param {string} type - Tipo de recurso ('image', 'script', 'style', 'font', 'data')
 * @param {number} priority - Prioridad de carga (usar constantes PRIORITY)
 * @returns {Promise} - Promesa que se resuelve cuando el recurso está cargado
 */
export function loadResource(url, type = "image", priority = PRIORITY.MEDIUM) {
  // Si ya está en caché, devolver el recurso cacheado
  if (resourceCache.has(url)) {
    return Promise.resolve(resourceCache.get(url))
  }

  // Si ya está cargando, devolver la promesa existente
  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)
  }

  // Crear una nueva promesa para cargar el recurso
  const loadPromise = new Promise((resolve, reject) => {
    // Implementar diferentes estrategias según el tipo de recurso
    switch (type) {
      case "image":
        loadImage(url, priority).then(resolve).catch(reject)
        break
      case "script":
        loadScript(url, priority).then(resolve).catch(reject)
        break
      case "style":
        loadStyle(url, priority).then(resolve).catch(reject)
        break
      case "font":
        loadFont(url, priority).then(resolve).catch(reject)
        break
      case "data":
        loadData(url, priority).then(resolve).catch(reject)
        break
      default:
        loadGeneric(url, priority).then(resolve).catch(reject)
    }
  })

  // Guardar la promesa en el mapa de promesas en carga
  loadingPromises.set(url, loadPromise)

  // Cuando se complete, guardar en caché y eliminar del mapa de promesas
  loadPromise
    .then((resource) => {
      resourceCache.set(url, resource)
      loadingPromises.delete(url)
      return resource
    })
    .catch((error) => {
      loadingPromises.delete(url)
      throw error
    })

  return loadPromise
}

/**
 * Carga una imagen con la prioridad especificada
 */
function loadImage(url, priority) {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve(img)
    }

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`))
    }

    // Aplicar estrategias según prioridad
    if (priority <= PRIORITY.CRITICAL) {
      // Para recursos críticos, cargar inmediatamente
      img.src = url
    } else if (priority <= PRIORITY.HIGH) {
      // Para recursos de alta prioridad, usar requestAnimationFrame
      requestAnimationFrame(() => {
        img.src = url
      })
    } else if (priority <= PRIORITY.MEDIUM) {
      // Para recursos de prioridad media, usar setTimeout
      setTimeout(() => {
        img.src = url
      }, 100)
    } else if (priority <= PRIORITY.LOW) {
      // Para recursos de baja prioridad, usar requestIdleCallback o fallback
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => {
          img.src = url
        })
      } else {
        setTimeout(() => {
          img.src = url
        }, 200)
      }
    } else {
      // Para recursos lazy, usar IntersectionObserver
      if ("IntersectionObserver" in window) {
        const placeholderDiv = document.createElement("div")
        placeholderDiv.style.height = "1px"
        placeholderDiv.style.width = "1px"
        placeholderDiv.style.position = "absolute"
        placeholderDiv.style.visibility = "hidden"
        document.body.appendChild(placeholderDiv)

        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            img.src = url
            observer.disconnect()
            document.body.removeChild(placeholderDiv)
          }
        })

        observer.observe(placeholderDiv)
      } else {
        // Fallback para navegadores sin IntersectionObserver
        setTimeout(() => {
          img.src = url
        }, 300)
      }
    }
  })
}

/**
 * Carga un script con la prioridad especificada
 */
function loadScript(url, priority) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = url

    script.onload = () => {
      resolve(script)
    }

    script.onerror = () => {
      reject(new Error(`Failed to load script: ${url}`))
    }

    // Aplicar estrategias según prioridad
    if (priority <= PRIORITY.HIGH) {
      // Para scripts críticos o de alta prioridad
      document.head.appendChild(script)
    } else {
      // Para scripts de menor prioridad, usar defer
      script.defer = true
      document.head.appendChild(script)
    }
  })
}

/**
 * Carga una hoja de estilos con la prioridad especificada
 */
function loadStyle(url, priority) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = url

    link.onload = () => {
      resolve(link)
    }

    link.onerror = () => {
      reject(new Error(`Failed to load stylesheet: ${url}`))
    }

    // Aplicar estrategias según prioridad
    if (priority <= PRIORITY.CRITICAL) {
      // Para estilos críticos, cargar con alta prioridad
      link.setAttribute("importance", "high")
    } else if (priority <= PRIORITY.MEDIUM) {
      // Para estilos de prioridad media
      link.setAttribute("importance", "auto")
    } else {
      // Para estilos de baja prioridad
      link.setAttribute("importance", "low")
      link.setAttribute("media", "print")
      link.onload = () => {
        link.media = "all"
        resolve(link)
      }
    }

    document.head.appendChild(link)
  })
}

/**
 * Carga una fuente con la prioridad especificada
 */
function loadFont(url, priority) {
  return new Promise((resolve, reject) => {
    const fontFace = new FontFace("CustomFont", `url(${url})`)

    fontFace
      .load()
      .then((loadedFace) => {
        document.fonts.add(loadedFace)
        resolve(loadedFace)
      })
      .catch((error) => {
        reject(new Error(`Failed to load font: ${url}`))
      })
  })
}

/**
 * Carga datos con la prioridad especificada
 */
function loadData(url, priority) {
  return new Promise((resolve, reject) => {
    // Implementar diferentes estrategias según la prioridad
    if (priority <= PRIORITY.HIGH) {
      // Para datos críticos o de alta prioridad, usar fetch normal
      fetch(url)
        .then((response) => response.json())
        .then(resolve)
        .catch(reject)
    } else {
      // Para datos de menor prioridad, usar setTimeout
      setTimeout(() => {
        fetch(url)
          .then((response) => response.json())
          .then(resolve)
          .catch(reject)
      }, priority * 50) // Retrasar según prioridad
    }
  })
}

/**
 * Carga genérica para otros tipos de recursos
 */
function loadGeneric(url, priority) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => response.blob())
      .then(resolve)
      .catch(reject)
  })
}

/**
 * Precarga un conjunto de recursos
 * @param {Array} resources - Array de objetos {url, type, priority}
 * @returns {Promise} - Promesa que se resuelve cuando todos los recursos están cargados
 */
export function preloadResources(resources) {
  // Ordenar recursos por prioridad
  const sortedResources = [...resources].sort(
    (a, b) => (a.priority || PRIORITY.MEDIUM) - (b.priority || PRIORITY.MEDIUM),
  )

  // Cargar recursos en orden de prioridad
  return Promise.all(sortedResources.map((resource) => loadResource(resource.url, resource.type, resource.priority)))
}

/**
 * Limpia la caché de recursos
 * @param {string} [pattern] - Patrón opcional para limpiar solo recursos específicos
 */
export function clearResourceCache(pattern) {
  if (!pattern) {
    resourceCache.clear()
    return
  }

  const regex = new RegExp(pattern)
  for (const url of resourceCache.keys()) {
    if (regex.test(url)) {
      resourceCache.delete(url)
    }
  }
}

// Exportar constantes de prioridad
export { PRIORITY }
