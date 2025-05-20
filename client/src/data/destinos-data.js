// Datos detallados de los destinos espaciales
export const destinos = [
  {
    id: 1,
    nombre: "Luna - Base Artemisa",
    subtitulo: "Primera colonia humana permanente",
    descripcion:
      "Visita la primera colonia humana permanente en la Luna y experimenta la vida en gravedad reducida con vistas impresionantes de la Tierra.",
    descripcionLarga: `La Base Artemisa, establecida en 2035, es la primera colonia humana permanente en la Luna. Situada en el borde del cráter Shackleton en el polo sur lunar, aprovecha los depósitos de hielo para la producción de agua, oxígeno y combustible.

    La base cuenta con módulos residenciales, laboratorios científicos, instalaciones de producción y un observatorio astronómico. Los visitantes pueden experimentar la vida en gravedad lunar (1/6 de la terrestre) y disfrutar de vistas espectaculares de la Tierra desde la superficie lunar.
    
    Durante tu estancia, podrás participar en excursiones a la superficie, visitar sitios históricos como los lugares de aterrizaje del Apollo, y experimentar la vida cotidiana de los colonos lunares.`,
    imagen: "/images/luna-base.png",
    imagenPanoramica: "/images/lunar-base-artemisa-panorama.png",
    galeria: [
      {
        url: "/images/lunar-module-interior.png",
        titulo: "Interior del módulo residencial",
        descripcion: "Espacios habitables diseñados para el confort en gravedad reducida",
      },
      {
        url: "/images/earth-from-moon.png",
        titulo: "Vista de la Tierra desde la Luna",
        descripcion: "Espectacular panorámica de nuestro planeta azul desde la superficie lunar",
      },
      {
        url: "/images/lunar-rover-exploration.png",
        titulo: "Exploración en rover lunar",
        descripcion: "Excursiones guiadas por la superficie lunar en vehículos especializados",
      },
    ],
    precio: 1200000,
    duracion: 14,
    distancia: 384400,
    puntuacion: 4.8,
    numResenas: 124,
    caracteristicas: [
      { nombre: "Gravedad", valor: "1/6 de la terrestre (1.62 m/s²)" },
      { nombre: "Temperatura", valor: "-173°C a 127°C" },
      { nombre: "Presión atmosférica", valor: "Vacío (instalaciones presurizadas)" },
      { nombre: "Radiación", valor: "Alta (protección en instalaciones)" },
      { nombre: "Comunicaciones", valor: "Retraso de 1.3 segundos con la Tierra" },
    ],
    actividades: [
      {
        nombre: "Caminata lunar",
        descripcion: "Experimenta la sensación de caminar en la superficie lunar con un traje espacial especializado.",
        duracion: "3 horas",
        precio: 150000,
        dificultad: "Media",
      },
      {
        nombre: "Observatorio astronómico",
        descripcion:
          "Observa las estrellas y galaxias desde el observatorio lunar, sin la interferencia de la atmósfera terrestre.",
        duracion: "2 horas",
        precio: 50000,
        dificultad: "Baja",
      },
      {
        nombre: "Excursión al sitio de aterrizaje del Apollo 11",
        descripcion: "Visita el histórico lugar donde los humanos pisaron por primera vez la Luna en 1969.",
        duracion: "6 horas",
        precio: 200000,
        dificultad: "Alta",
      },
    ],
    precauciones: [
      "Exposición a radiación cósmica",
      "Adaptación a la gravedad reducida",
      "Riesgo de descompresión",
      "Posibles tormentas solares",
      "Polvo lunar abrasivo",
    ],
    requisitos: [
      "Certificado médico de aptitud espacial",
      "Entrenamiento básico de 2 semanas en la Tierra",
      "Edad mínima: 18 años",
      "Seguro médico espacial",
      "Firma de exención de responsabilidad",
    ],
    tipo: "planetario",
    disponible: true,
    destacado: true,
  },
  {
    id: 2,
    nombre: "Marte - Colonia Olympus",
    subtitulo: "Aventura en el planeta rojo",
    descripcion:
      "Experimenta la vida en el planeta rojo en la colonia más grande de Marte, situada cerca del imponente Monte Olympus.",
    descripcionLarga: `La Colonia Olympus, fundada en 2042, es el asentamiento humano más grande en Marte. Ubicada en las laderas del Monte Olympus (la montaña más alta del Sistema Solar), la colonia aprovecha la protección natural de la montaña contra la radiación y las tormentas de polvo.

    La colonia está formada por una red de domos interconectados que albergan zonas residenciales, agrícolas, industriales y recreativas. Los visitantes pueden experimentar la vida en gravedad marciana (38% de la terrestre) y explorar los paisajes alienígenas del planeta rojo.
    
    Durante tu estancia, podrás visitar los laboratorios de terraformación, participar en expediciones a formaciones geológicas únicas, y experimentar cómo es la vida de los pioneros marcianos.`,
    imagen: "/images/marte.png",
    imagenPanoramica: "/images/mars-olympus-mons-panorama.png",
    galeria: [
      {
        url: "/images/mars-colony-dome-interior.png",
        titulo: "Interior del domo principal",
        descripcion: "Espacios verdes y zonas comunes bajo el domo principal de la colonia",
      },
      {
        url: "/images/valles-marte.png",
        titulo: "Valles Marineris",
        descripcion: "El sistema de cañones más grande del Sistema Solar",
      },
      {
        url: "/images/olympus-mons-vista.png",
        titulo: "Vista del Monte Olympus",
        descripcion: "Impresionante panorámica del volcán más grande del Sistema Solar",
      },
    ],
    precio: 3500000,
    duracion: 180,
    distancia: 54600000,
    puntuacion: 4.5,
    numResenas: 87,
    caracteristicas: [
      { nombre: "Gravedad", valor: "38% de la terrestre (3.71 m/s²)" },
      { nombre: "Temperatura", valor: "-120°C a 20°C" },
      { nombre: "Presión atmosférica", valor: "0.6% de la terrestre (instalaciones presurizadas)" },
      { nombre: "Radiación", valor: "Alta (protección en instalaciones)" },
      { nombre: "Comunicaciones", valor: "Retraso de 4 a 24 minutos con la Tierra" },
    ],
    actividades: [
      {
        nombre: "Exploración de cañones marcianos",
        descripcion: "Visita el Valles Marineris, el sistema de cañones más grande del Sistema Solar.",
        duracion: "2 días",
        precio: 300000,
        dificultad: "Alta",
      },
      {
        nombre: "Laboratorio de terraformación",
        descripcion: "Observa y participa en experimentos destinados a hacer Marte habitable para los humanos.",
        duracion: "4 horas",
        precio: 100000,
        dificultad: "Baja",
      },
      {
        nombre: "Ascenso al Monte Olympus",
        descripcion: "Expedición a la base del volcán más grande del Sistema Solar.",
        duracion: "3 días",
        precio: 450000,
        dificultad: "Extrema",
      },
    ],
    precauciones: [
      "Exposición prolongada a gravedad reducida",
      "Radiación solar y cósmica",
      "Tormentas de polvo globales",
      "Temperaturas extremas",
      "Aislamiento psicológico",
    ],
    requisitos: [
      "Certificado médico de aptitud para viajes interplanetarios",
      "Entrenamiento avanzado de 1 mes en la Tierra",
      "Evaluación psicológica para misiones de larga duración",
      "Edad mínima: 21 años",
      "Seguro médico interplanetario premium",
    ],
    tipo: "planetario",
    disponible: true,
    destacado: true,
  },
  {
    id: 3,
    nombre: "Estación Espacial Internacional",
    subtitulo: "El clásico del turismo espacial",
    descripcion:
      "Alójate en la legendaria estación que inició la era del turismo espacial y disfruta de vistas incomparables de nuestro planeta.",
    descripcionLarga: `La Estación Espacial Internacional (EEI), ampliada y renovada desde su configuración original, es el destino clásico del turismo espacial. Orbitando a 400 km sobre la Tierra, la estación completa una vuelta al planeta cada 90 minutos, ofreciendo 16 amaneceres y atardeceres diarios.

    La sección turística de la EEI cuenta con módulos habitacionales con ventanas panorámicas, restaurante, gimnasio adaptado a la microgravedad y espacios recreativos. Los visitantes experimentan la vida en ingravidez y disfrutan de vistas incomparables de la Tierra.
    
    Durante tu estancia, podrás realizar actividades extravehiculares supervisadas, participar en experimentos científicos, y aprender sobre la historia de la exploración espacial de primera mano.`,
    imagen: "/images/estacion-orbital.png",
    imagenPanoramica: "/images/earth-view.png",
    galeria: [
      {
        url: "/images/international-space-station.png",
        titulo: "Módulo Cúpula",
        descripcion: "Observatorio con ventanas panorámicas para contemplar la Tierra",
      },
      {
        url: "/images/earth-view.png",
        titulo: "Vista de la Tierra",
        descripcion: "Impresionante vista de nuestro planeta desde la estación",
      },
      {
        url: "/images/estacion-orbital.png",
        titulo: "Recreación en gravedad cero",
        descripcion: "Actividades lúdicas aprovechando la ingravidez",
      },
    ],
    precio: 850000,
    duracion: 10,
    distancia: 400,
    puntuacion: 4.7,
    numResenas: 215,
    caracteristicas: [
      { nombre: "Gravedad", valor: "Microgravedad (ingravidez)" },
      { nombre: "Temperatura", valor: "Controlada (18°C a 24°C)" },
      { nombre: "Presión atmosférica", valor: "1 atmósfera (como en la Tierra)" },
      { nombre: "Radiación", valor: "Moderada (protección en la estación)" },
      { nombre: "Comunicaciones", valor: "Tiempo real con la Tierra" },
    ],
    actividades: [
      {
        nombre: "Paseo espacial",
        descripcion: "Experiencia extravehicular supervisada por astronautas profesionales.",
        duracion: "2 horas",
        precio: 250000,
        dificultad: "Alta",
      },
      {
        nombre: "Fotografía orbital",
        descripcion: "Sesión de fotografía desde el módulo Cúpula con equipo profesional.",
        duracion: "1 hora",
        precio: 30000,
        dificultad: "Baja",
      },
      {
        nombre: "Experimentos en microgravedad",
        descripcion: "Participa en experimentos científicos reales en condiciones de ingravidez.",
        duracion: "3 horas",
        precio: 50000,
        dificultad: "Media",
      },
    ],
    precauciones: [
      "Adaptación a la ingravidez",
      "Posible cinetosis espacial",
      "Pérdida de densidad ósea y masa muscular",
      "Exposición a radiación",
      "Riesgo de impacto de micrometeoritos",
    ],
    requisitos: [
      "Certificado médico de aptitud espacial",
      "Entrenamiento básico de 1 semana en la Tierra",
      "Edad mínima: 18 años",
      "Seguro médico espacial",
      "Altura máxima: 190 cm",
    ],
    tipo: "orbital",
    disponible: true,
    destacado: true,
  },
  {
    id: 4,
    nombre: "Venus - Observatorio Atmosférico",
    subtitulo: "Ciencia en las nubes de Venus",
    descripcion:
      "Observa el planeta más caliente del sistema solar desde una estación orbital segura y estudia su fascinante atmósfera.",
    descripcionLarga: `El Observatorio Atmosférico de Venus, inaugurado en 2048, es una estación científica orbital que permite estudiar de cerca el planeta más caliente del Sistema Solar sin los peligros de su superficie. Orbitando a 250 km sobre las nubes venusianas, ofrece vistas impresionantes del "planeta hermano" de la Tierra.

    La estación cuenta con laboratorios atmosféricos, telescopios, módulos habitacionales y una plataforma de lanzamiento para sondas atmosféricas. Los visitantes pueden participar en estudios científicos reales y experimentar la observación planetaria profesional.
    
    Durante tu estancia, podrás controlar sondas atmosféricas remotas, analizar muestras de las nubes venusianas, y aprender sobre los extremos climáticos que hacen de Venus un laboratorio natural único.`,
    imagen: "/images/venus-clouds.png",
    imagenPanoramica: "/images/venus-panorama.png",
    galeria: [
      {
        url: "/images/venus-station.png",
        titulo: "Estación Atmosférica",
        descripcion: "Vista exterior del Observatorio Atmosférico en órbita venusiana",
      },
      {
        url: "/images/venus-laboratory.png",
        titulo: "Laboratorio de nubes",
        descripcion: "Instalaciones para el análisis de la atmósfera venusiana",
      },
      {
        url: "/images/sonda.png", 
        titulo: "Despliegue de sondas",
        descripcion: "Lanzamiento de sondas atmosféricas hacia las nubes de Venus",
      },
    ],
    precio: 1800000,
    duracion: 21,
    distancia: 41400000,
    puntuacion: 4.2,
    numResenas: 53,
    caracteristicas: [
      { nombre: "Gravedad (estación)", valor: "Artificial (1g en zonas habitables)" },
      { nombre: "Temperatura (Venus)", valor: "462°C en superficie" },
      { nombre: "Presión atmosférica (Venus)", valor: "92 veces la terrestre" },
      { nombre: "Composición atmosférica", valor: "96% CO₂, nubes de ácido sulfúrico" },
      { nombre: "Comunicaciones", valor: "Retraso de 2 a 15 minutos con la Tierra" },
    ],
    actividades: [
      {
        nombre: "Control de sondas atmosféricas",
        descripcion: "Pilota sondas robóticas a través de las nubes de Venus y recolecta datos científicos.",
        duracion: "4 horas",
        precio: 120000,
        dificultad: "Media",
      },
      {
        nombre: "Análisis atmosférico",
        descripcion: "Participa en el análisis de muestras atmosféricas con científicos residentes.",
        duracion: "3 horas",
        precio: 80000,
        dificultad: "Baja",
      },
      {
        nombre: "Observación del efecto invernadero extremo",
        descripcion: "Estudio del fenómeno climático más extremo del Sistema Solar.",
        duracion: "2 horas",
        precio: 60000,
        dificultad: "Baja",
      },
    ],
    precauciones: [
      "Exposición a radiación solar intensa",
      "Posibles erupciones solares",
      "Adaptación a la gravedad artificial",
      "Aislamiento en estación orbital",
      "Riesgo de fallos en sistemas de soporte vital",
    ],
    requisitos: [
      "Certificado médico de aptitud espacial",
      "Entrenamiento básico de 10 días en la Tierra",
      "Conocimientos científicos básicos",
      "Edad mínima: 18 años",
      "Seguro médico interplanetario",
    ],
    tipo: "orbital",
    disponible: true,
    destacado: false,
  },
  {
    id: 5,
    nombre: "Júpiter - Crucero de las Lunas",
    subtitulo: "Expedición a las lunas galileanas",
    descripcion:
      "Visita las lunas más fascinantes del gigante gaseoso: Europa, Ganímedes, Calisto e Ío en un crucero espacial de lujo.",
    descripcionLarga: `El Crucero de las Lunas de Júpiter es una expedición de lujo que te lleva a explorar las cuatro lunas galileanas: Ío con sus volcanes activos, Europa con su océano subsuperficial, Ganímedes, la luna más grande del Sistema Solar, y Calisto con su antigua superficie craterizada.

    La nave crucero "Galileo Luxury" cuenta con habitaciones con ventanas panorámicas, restaurantes, observatorios, spa, gimnasio y lanzaderas para visitar las lunas. El viaje incluye órbitas cercanas a cada luna y descensos en lanzaderas a las superficies de Ganímedes y Calisto.
    
    Durante el crucero, disfrutarás de conferencias de expertos, observaciones astronómicas privilegiadas, y la oportunidad de ver de cerca el gigante gaseoso y sus fascinantes satélites.`,
    imagen: "/images/jupiter-moons.png",
    imagenPanoramica: "/images/jupiter.png", 
    galeria: [
      {
        url: "/images/europa.png", 
        titulo: "Superficie helada de Europa",
        descripcion: "Vistas de la corteza de hielo que cubre el océano de Europa",
      },
      {
        url: "/images/io.png", 
        titulo: "Actividad volcánica en Ío",
        descripcion: "Observación de las erupciones volcánicas más potentes del Sistema Solar",
      },
      {
        url: "/images/lunar-rover-exploration.png", 
        titulo: "Descenso en Ganímedes",
        descripcion: "Experiencia de visita a la superficie de la luna más grande del Sistema Solar",
      },
    ],
    precio: 4200000,
    duracion: 90,
    distancia: 628730000,
    puntuacion: 4.9,
    numResenas: 42,
    caracteristicas: [
      { nombre: "Gravedad (nave)", valor: "Artificial (1g en zonas habitables)" },
      { nombre: "Radiación", valor: "Extrema (protección en la nave)" },
      { nombre: "Campo magnético de Júpiter", valor: "14 veces más fuerte que el terrestre" },
      { nombre: "Temperatura (lunas)", valor: "De -220°C a -110°C según la luna" },
      { nombre: "Comunicaciones", valor: "Retraso de 33 a 53 minutos con la Tierra" },
    ],
    actividades: [
      {
        nombre: "Descenso a Ganímedes",
        descripcion: "Visita a la superficie de la luna más grande del Sistema Solar en una lanzadera especializada.",
        duracion: "8 horas",
        precio: 500000,
        dificultad: "Alta",
      },
      {
        nombre: "Observación de volcanes en Ío",
        descripcion: "Contempla las erupciones volcánicas más potentes del Sistema Solar desde una distancia segura.",
        duracion: "4 horas",
        precio: 200000,
        dificultad: "Baja",
      },
      {
        nombre: "Estudio del océano de Europa",
        descripcion:
          "Participa en investigaciones sobre el océano subsuperficial de Europa y su potencial para albergar vida.",
        duracion: "6 horas",
        precio: 300000,
        dificultad: "Media",
      },
    ],
    precauciones: [
      "Exposición a radiación extrema",
      "Viaje espacial de larga duración",
      "Cinturón de radiación de Júpiter",
      "Temperaturas extremadamente bajas",
      "Gran distancia de asistencia médica terrestre",
    ],
    requisitos: [
      "Certificado médico de aptitud para viajes interplanetarios",
      "Entrenamiento avanzado de 3 semanas en la Tierra",
      "Evaluación psicológica para misiones de larga duración",
      "Edad mínima: 25 años",
      "Seguro médico interplanetario premium plus",
    ],
    tipo: "orbital",
    disponible: true,
    destacado: false,
  },
  {
    id: 6,
    nombre: "Saturno - Anillos Majestuosos",
    subtitulo: "La joya del Sistema Solar",
    descripcion:
      "Contempla los espectaculares anillos de Saturno y visita Titán, su luna más grande con lagos de metano líquido.",
    descripcionLarga: `La expedición "Anillos Majestuosos" te lleva a explorar el planeta más hermoso del Sistema Solar: Saturno, con sus impresionantes anillos y su fascinante sistema de lunas. El viaje se centra especialmente en Titán, la única luna del Sistema Solar con una atmósfera densa y lagos de hidrocarburos líquidos.

    La nave "Cassini II" está equipada con habitaciones de lujo, observatorios panorámicos, laboratorios científicos y lanzaderas especializadas para descender a Titán. El viaje incluye navegación entre los anillos de Saturno, ofreciendo vistas que ningún humano había contemplado hasta hace poco.
    
    Durante la expedición, podrás observar las tormentas en la atmósfera de Saturno, estudiar la composición de sus anillos, y explorar la superficie alienígena de Titán con sus lagos de metano y etano líquidos.`,
    imagen: "/images/saturn-rings.png",
    imagenPanoramica: "/images/saturn.png", // Imagen alternativa
    galeria: [
      {
        url: "/images/saturn-rings.png", // Imagen alternativa
        titulo: "Navegación entre anillos",
        descripcion: "Experiencia única de atravesar las regiones menos densas de los anillos",
      },
      {
        url: "/images/titan-lakes.png", // Imagen alternativa
        titulo: "Lagos de metano en Titán",
        descripcion: "Vistas de los únicos lagos de hidrocarburos líquidos fuera de la Tierra",
      },
      {
        url: "/images/encefalo.png", // Imagen alternativa
        titulo: "Géiseres de Encélado",
        descripcion: "Observación de las erupciones de agua que alimentan los anillos de Saturno",
      },
    ],
    precio: 5100000,
    duracion: 120,
    distancia: 1275000000,
    puntuacion: 4.8,
    numResenas: 35,
    caracteristicas: [
      { nombre: "Gravedad (nave)", valor: "Artificial (1g en zonas habitables)" },
      { nombre: "Temperatura (Saturno)", valor: "-178°C en la capa superior de nubes" },
      { nombre: "Temperatura (Titán)", valor: "-179°C en superficie" },
      { nombre: "Presión atmosférica (Titán)", valor: "1.5 veces la terrestre" },
      { nombre: "Comunicaciones", valor: "Retraso de 68 a 84 minutos con la Tierra" },
    ],
    actividades: [
      {
        nombre: "Descenso a Titán",
        descripcion: "Visita la superficie de la única luna con atmósfera densa y lagos de hidrocarburos.",
        duracion: "10 horas",
        precio: 600000,
        dificultad: "Extrema",
      },
      {
        nombre: "Navegación entre anillos",
        descripcion: "Experiencia única de atravesar las regiones menos densas de los anillos de Saturno.",
        duracion: "5 horas",
        precio: 400000,
        dificultad: "Media",
      },
      {
        nombre: "Observación de géiseres en Encélado",
        descripcion: "Contempla las erupciones de agua que alimentan los anillos de Saturno.",
        duracion: "4 horas",
        precio: 300000,
        dificultad: "Baja",
      },
    ],
    precauciones: [
      "Viaje espacial de muy larga duración",
      "Exposición a radiación cósmica",
      "Temperaturas extremadamente bajas",
      "Atmósfera tóxica de Titán",
      "Gran distancia de asistencia médica",
    ],
    requisitos: [
      "Certificado médico de aptitud para viajes interplanetarios de larga duración",
      "Entrenamiento avanzado de 1 mes en la Tierra",
      "Evaluación psicológica exhaustiva",
      "Edad mínima: 30 años",
      "Seguro médico interplanetario élite",
    ],
    tipo: "orbital",
    disponible: true,
    destacado: false,
  },
]

// Función para obtener un destino por ID
export function getDestinoById(id) {
  return destinos.find((destino) => destino.id === Number.parseInt(id)) || null
}

// Función para obtener destinos relacionados
export function getDestinosRelacionados(id, limit = 3) {
  const currentDestino = getDestinoById(id)
  if (!currentDestino) return []

  // Filtrar por tipo similar y excluir el destino actual
  return destinos
    .filter((destino) => destino.id !== Number.parseInt(id) && destino.tipo === currentDestino.tipo)
    .slice(0, limit)
}

// Función para obtener destinos destacados
export function getDestinosDestacados(limit = 3) {
  return destinos.filter((destino) => destino.destacado).slice(0, limit)
}

// Función para buscar destinos
export function buscarDestinos(query = "", filters = {}) {
  let results = [...destinos]

  // Filtrar por texto
  if (query) {
    const searchQuery = query.toLowerCase()
    results = results.filter(
      (destino) =>
        destino.nombre.toLowerCase().includes(searchQuery) || destino.descripcion.toLowerCase().includes(searchQuery),
    )
  }

  // Filtrar por tipo
  if (filters.tipo && filters.tipo !== "todos") {
    results = results.filter((destino) => destino.tipo === filters.tipo)
  }

  // Filtrar por precio máximo
  if (filters.precioMax) {
    results = results.filter((destino) => destino.precio <= filters.precioMax)
  }

  // Filtrar por duración máxima
  if (filters.duracionMax) {
    results = results.filter((destino) => destino.duracion <= filters.duracionMax)
  }

  // Ordenar resultados
  if (filters.ordenar) {
    switch (filters.ordenar) {
      case "precio-asc":
        results.sort((a, b) => a.precio - b.precio)
        break
      case "precio-desc":
        results.sort((a, b) => b.precio - a.precio)
        break
      case "duracion-asc":
        results.sort((a, b) => a.duracion - b.duracion)
        break
      case "duracion-desc":
        results.sort((a, b) => b.duracion - a.duracion)
        break
      case "puntuacion":
        results.sort((a, b) => b.puntuacion - a.puntuacion)
        break
      default:
        // Por defecto, ordenar por destacados primero
        results.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0))
        break
    }
  }

  return results
}
