import { handleError } from '@/utils/error-handler'

// Datos de ejemplo para desarrollo
const navesData = [
  {
    id: 1,
    nombre: "Aurora Estelar",
    tipo: "Crucero",
    fabricante: "Stellar Dynamics Corp.",
    imagenPrincipal: "/images/naves/aurora-estelar-cruiser.png",
    descripcion:
      "El Aurora Estelar es nuestro crucero orbital de lujo, diseñado para ofrecer la máxima comodidad en viajes alrededor de la Tierra y la Luna. Con amplias suites panorámicas y tecnología de gravedad artificial, proporciona una experiencia inigualable.",
    velocidadMaxima: 28000,
    capacidad: 120,
    tipoPropulsion: "Iónica avanzada",
    anoFabricacion: 2042,
    longitud: 185,
    altura: 45,
    peso: 12500,
    autonomia: 60,
    alcanceMaximo: 384400, // Distancia Tierra-Luna
    sistemaPropulsion: "Propulsores iónicos de xenón",
    sistemaNavegacion: "QuantumNav 5.0",
    sistemaSoporteVital: "BioSphere Plus",
    comunicaciones: "Red cuántica encriptada",
    escudos: "Escudo magnético de doble capa",
    seguridadInfo:
      "El Aurora Estelar cuenta con los sistemas de seguridad más avanzados, incluyendo escudos de radiación de última generación y sistemas redundantes para todas las funciones críticas.",
    confortInfo:
      "Diseñado para el máximo confort, el Aurora Estelar ofrece suites de lujo, restaurantes gourmet, spa espacial, y un observatorio panorámico de 360 grados.",
    caracteristicas: [
      "Suites panorámicas con vistas al espacio",
      "Restaurante gourmet con chef de 3 estrellas Michelin",
      "Spa espacial con piscina de gravedad controlada",
      "Observatorio astronómico de última generación",
      "Simulador de paseos espaciales",
      "Entretenimiento inmersivo en realidad virtual",
    ],
    precio: 75000,
    disponibilidad: true,
  },
  {
    id: 2,
    nombre: "Halcón Lunar",
    tipo: "Transporte",
    fabricante: "Orbital Transport Systems",
    imagenPrincipal: "/images/naves/halcon-lunar-shuttle.png",
    descripcion:
      "El Halcón Lunar es nuestra lanzadera de transporte rápido entre la Tierra y la Luna. Eficiente y confortable, es la opción ideal para viajeros que buscan practicidad sin renunciar a la comodidad.",
    velocidadMaxima: 32000,
    capacidad: 80,
    tipoPropulsion: "Metano líquido",
    anoFabricacion: 2040,
    longitud: 120,
    altura: 30,
    peso: 8500,
    autonomia: 15,
    alcanceMaximo: 384400,
    sistemaPropulsion: "Motores Raptor de metano criogénico",
    sistemaNavegacion: "OrbitalPath 4.2",
    sistemaSoporteVital: "LifeSupport Standard",
    comunicaciones: "Red satelital de banda ancha",
    escudos: "Escudo térmico cerámico",
    seguridadInfo:
      "El Halcón Lunar está equipado con sistemas de seguridad redundantes y cápsulas de escape individuales para cada sección de pasajeros.",
    confortInfo:
      "Aunque diseñado principalmente para transporte eficiente, el Halcón Lunar ofrece asientos reclinables, entretenimiento personal y servicio de comidas de calidad.",
    caracteristicas: [
      "Viaje rápido Tierra-Luna en menos de 24 horas",
      "Asientos reclinables con espacio personal",
      "Sistema de entretenimiento individual",
      "Servicio de comidas preparadas por chefs",
      "Ventanas panorámicas en cada sección",
      "Wi-Fi espacial de alta velocidad",
    ],
    precio: 35000,
    disponibilidad: true,
  },
  {
    id: 3,
    nombre: "Voyager Marciano",
    tipo: "Crucero",
    fabricante: "Interplanetary Voyages Inc.",
    imagenPrincipal: "/images/naves/voyager-marciano-cruiser.png",
    descripcion:
      "El Voyager Marciano es nuestro crucero interplanetario insignia, diseñado para los largos viajes entre la Tierra y Marte. Con tecnología de hibernación y amplios espacios comunes, hace que el viaje sea tan placentero como el destino.",
    velocidadMaxima: 45000,
    capacidad: 200,
    tipoPropulsion: "Nuclear-térmica",
    anoFabricacion: 2045,
    longitud: 320,
    altura: 75,
    peso: 28000,
    autonomia: 300,
    alcanceMaximo: 78000000, // Distancia Tierra-Marte promedio
    sistemaPropulsion: "Reactor de fusión VASIMR",
    sistemaNavegacion: "DeepSpace Navigator",
    sistemaSoporteVital: "EcoSphere Closed-Loop",
    comunicaciones: "Red láser interplanetaria",
    escudos: "Escudo multicapa contra radiación cósmica",
    seguridadInfo:
      "Para los largos viajes interplanetarios, el Voyager Marciano incorpora sistemas médicos avanzados, monitoreo constante de radiación y protocolos de emergencia específicos para el espacio profundo.",
    confortInfo:
      "El Voyager Marciano redefine el confort en viajes interplanetarios con sus amplios espacios comunes, jardines hidropónicos, y suites diseñadas para largas estancias.",
    caracteristicas: [
      "Suites espaciosas con sistemas de hibernación opcional",
      "Jardines hidropónicos con vegetación real",
      "Centro médico avanzado con cirugía robótica",
      "Biblioteca y centro de aprendizaje digital",
      "Gimnasio con equipamiento anti-atrofia muscular",
      "Laboratorios científicos para pasajeros",
    ],
    precio: 250000,
    disponibilidad: true,
  },
  {
    id: 4,
    nombre: "Nexus Orbital",
    tipo: "Estación",
    fabricante: "Global Space Consortium",
    imagenPrincipal: "/images/naves/nexus-orbital-station.png",
    descripcion:
      "El Nexus Orbital no es una nave convencional, sino una estación espacial móvil que sirve como hub para múltiples destinos. Ideal para quienes desean una experiencia espacial completa antes de continuar su viaje.",
    velocidadMaxima: 7800,
    capacidad: 500,
    tipoPropulsion: "Iónica de baja potencia",
    anoFabricacion: 2038,
    longitud: 450,
    altura: 450,
    peso: 35000,
    autonomia: 1825, // 5 años
    alcanceMaximo: 420000, // Órbita terrestre alta
    sistemaPropulsion: "Propulsores de posicionamiento iónico",
    sistemaNavegacion: "OrbitalStabilization AI",
    sistemaSoporteVital: "Biosphere Complete",
    comunicaciones: "Centro de comunicaciones multiespectrales",
    escudos: "Sistema de detección y desvío de micrometeoritos",
    seguridadInfo:
      "Como estación permanente, el Nexus Orbital cuenta con los más avanzados sistemas de seguridad, incluyendo compartimentos estancos, sistemas contra incendios en vacío y protocolos de evacuación completos.",
    confortInfo:
      "El Nexus Orbital ofrece todas las comodidades de una ciudad espacial: restaurantes, tiendas, entretenimiento, e incluso un hotel de cinco estrellas con vistas inigualables.",
    caracteristicas: [
      "Múltiples restaurantes y opciones gastronómicas",
      "Centro comercial con tiendas duty-free",
      "Hotel espacial de cinco estrellas",
      "Centro de conferencias y eventos",
      "Observatorio astronómico profesional",
      "Puerto espacial con conexiones a múltiples destinos",
    ],
    precio: 15000, // Por semana de estancia
    disponibilidad: true,
  },
  {
    id: 5,
    nombre: "Solar Explorer",
    tipo: "Explorador",
    fabricante: "Scientific Frontier Ltd.",
    imagenPrincipal: "/images/naves/solar-explorer-research.png",
    descripcion:
      "El Solar Explorer es nuestra nave de investigación científica, diseñada para expediciones especiales a destinos únicos como órbitas solares cercanas o los anillos de Saturno. Una experiencia exclusiva para entusiastas de la ciencia.",
    velocidadMaxima: 60000,
    capacidad: 30,
    tipoPropulsion: "Vela solar + Iónica",
    anoFabricacion: 2047,
    longitud: 95,
    altura: 25,
    peso: 5200,
    autonomia: 180,
    alcanceMaximo: 1500000000, // Puede llegar hasta Saturno
    sistemaPropulsion: "Vela solar de grafeno + Propulsores iónicos",
    sistemaNavegacion: "AstroPath Scientific",
    sistemaSoporteVital: "CompactLife Advanced",
    comunicaciones: "Array de comunicación de espacio profundo",
    escudos: "Escudo térmico para aproximación solar",
    seguridadInfo:
      "El Solar Explorer está equipado con sistemas especializados para proteger a los pasajeros durante aproximaciones solares y otras condiciones extremas del espacio profundo.",
    confortInfo:
      "Aunque más compacto que nuestros cruceros, el Solar Explorer ofrece cabinas confortables y espacios comunes diseñados para fomentar la colaboración científica y la observación espacial.",
    caracteristicas: [
      "Laboratorios científicos completamente equipados",
      "Telescopios y sensores de última generación",
      "Módulo de observación con cúpula transparente",
      "Trajes espaciales para actividades extravehiculares",
      "Biblioteca científica digital completa",
      "Programa de conferencias con científicos a bordo",
    ],
    precio: 180000,
    disponibilidad: false, // Expediciones limitadas
  },
  {
    id: 6,
    nombre: "Artemisa Lunar",
    tipo: "Base Móvil",
    fabricante: "Lunar Habitats Corporation",
    imagenPrincipal: "/images/naves/artemisa-lunar-base.png",
    descripcion:
      "La Artemisa Lunar es una base móvil diseñada para explorar la superficie lunar. Combina la movilidad de un vehículo con las comodidades de una base, permitiendo expediciones extendidas a diferentes regiones lunares.",
    velocidadMaxima: 30, // km/h en superficie lunar
    capacidad: 12,
    tipoPropulsion: "Eléctrica + Cohetes de posicionamiento",
    anoFabricacion: 2044,
    longitud: 25,
    altura: 8,
    peso: 3800,
    autonomia: 45,
    alcanceMaximo: 1000, // km en superficie lunar
    sistemaPropulsion: "Motores eléctricos de alto torque",
    sistemaNavegacion: "LunarTerrain Mapping System",
    sistemaSoporteVital: "Regenerative Life Support",
    comunicaciones: "Red lunar de comunicaciones",
    escudos: "Protección contra radiación y polvo lunar",
    seguridadInfo:
      "La Artemisa Lunar está diseñada para las duras condiciones de la superficie lunar, con protección contra radiación, micrometeoroitos y las extremas variaciones de temperatura.",
    confortInfo:
      "A pesar de su tamaño compacto, la Artemisa ofrece espacios habitables confortables, con áreas privadas para cada tripulante y espacios comunes para trabajo y recreación.",
    caracteristicas: [
      "Laboratorio geológico para análisis in-situ",
      "Escotilla para paseos lunares con trajes especializados",
      "Sistema de navegación topográfica lunar",
      "Paneles solares desplegables de alta eficiencia",
      "Invernadero experimental para cultivos lunares",
      "Drones de exploración controlables por pasajeros",
    ],
    precio: 120000,
    disponibilidad: true,
  },
  {
    id: 7,
    nombre: "Crucero Estelar",
    tipo: "Crucero de Lujo",
    fabricante: "Stellar Luxury Lines",
    imagenPrincipal: "/images/naves/eea7728b-18e0-4b08-8e12-128b50fbe0e2.png",
    descripcion:
      "El Crucero Estelar es nuestra nave de lujo más exclusiva, diseñada para viajes de placer con todas las comodidades imaginables. Su diseño elegante y sus interiores de primera clase ofrecen una experiencia incomparable.",
    velocidadMaxima: 25000,
    capacidad: 60,
    tipoPropulsion: "Iónica de alta eficiencia",
    anoFabricacion: 2048,
    longitud: 150,
    altura: 35,
    peso: 9800,
    autonomia: 90,
    alcanceMaximo: 500000, // Órbita lunar extendida
    sistemaPropulsion: "Propulsores iónicos de última generación",
    sistemaNavegacion: "LuxNav Premium",
    sistemaSoporteVital: "Atmosphere Plus",
    comunicaciones: "Red de comunicación cuántica",
    escudos: "Escudo de partículas avanzado",
    seguridadInfo:
      "El Crucero Estelar cuenta con los sistemas de seguridad más avanzados, incluyendo múltiples capas de protección y sistemas de emergencia redundantes.",
    confortInfo:
      "Diseñado para el máximo lujo, cada suite cuenta con vistas panorámicas, control ambiental personalizado y servicio de mayordomo privado.",
    caracteristicas: [
      "Suites de lujo con vistas panorámicas",
      "Restaurante gourmet con menú de degustación",
      "Spa espacial con tratamientos anti-gravedad",
      "Salón de observación con techo transparente",
      "Bar de cócteles moleculares",
      "Servicio de mayordomo personal",
    ],
    precio: 95000,
    disponibilidad: true,
  },
  {
    id: 8,
    nombre: "Defensor Espacial",
    tipo: "Nave de Escolta",
    fabricante: "Orbital Defense Systems",
    imagenPrincipal: "/images/naves/8778798.png",
    descripcion:
      "El Defensor Espacial es una nave de escolta que proporciona seguridad adicional para nuestras rutas más aventuradas. Equipada con sistemas de detección avanzados y capacidad de respuesta rápida.",
    velocidadMaxima: 50000,
    capacidad: 25,
    tipoPropulsion: "Plasma comprimido",
    anoFabricacion: 2046,
    longitud: 85,
    altura: 22,
    peso: 7500,
    autonomia: 120,
    alcanceMaximo: 1000000, // Sistema solar interior
    sistemaPropulsion: "Motores de plasma de alta densidad",
    sistemaNavegacion: "TacticalNav 3.0",
    sistemaSoporteVital: "Military-grade Life Support",
    comunicaciones: "Red de comunicación encriptada",
    escudos: "Escudo de defensa multicapa",
    seguridadInfo:
      "El Defensor Espacial está diseñado para proporcionar la máxima seguridad en rutas espaciales de alto riesgo, con capacidad para detectar y neutralizar amenazas a gran distancia.",
    confortInfo:
      "Aunque su diseño prioriza la funcionalidad, el Defensor ofrece alojamiento confortable para su tripulación y pasajeros, con áreas comunes bien equipadas.",
    caracteristicas: [
      "Sistemas de detección de largo alcance",
      "Capacidad de respuesta rápida",
      "Alojamiento seguro para pasajeros VIP",
      "Sala de control táctico",
      "Sistemas de comunicación de emergencia",
      "Módulos de escape individuales",
    ],
    precio: 150000,
    disponibilidad: true,
  },
  {
    id: 9,
    nombre: "Estación Comercial Nexus",
    tipo: "Estación Comercial",
    fabricante: "Interstellar Commerce Ltd.",
    imagenPrincipal: "/images/naves/bb155376-b4ec-492e-b057-614eedacff24.png",
    descripcion:
      "La Estación Comercial Nexus es un centro de negocios y entretenimiento flotante, donde se pueden realizar transacciones comerciales, disfrutar de compras duty-free y experimentar la vida en el espacio.",
    velocidadMaxima: 5000,
    capacidad: 800,
    tipoPropulsion: "Posicionamiento iónico",
    anoFabricacion: 2043,
    longitud: 600,
    altura: 400,
    peso: 50000,
    autonomia: 3650, // 10 años
    alcanceMaximo: 450000, // Órbita terrestre alta
    sistemaPropulsion: "Sistema de posicionamiento orbital",
    sistemaNavegacion: "CommercialNav Enterprise",
    sistemaSoporteVital: "EcoSystem Commercial",
    comunicaciones: "Centro de comunicaciones comerciales",
    escudos: "Sistema de protección comercial",
    seguridadInfo:
      "La Estación Comercial Nexus cuenta con avanzados sistemas de seguridad y vigilancia, garantizando un entorno seguro para todas las actividades comerciales y de ocio.",
    confortInfo:
      "Diseñada para largas estancias, la estación ofrece alojamiento de diversas categorías, desde habitaciones estándar hasta suites de lujo con vistas al espacio.",
    caracteristicas: [
      "Centro comercial con tiendas duty-free",
      "Zona de negocios con salas de conferencias",
      "Restaurantes de diversas especialidades",
      "Casino espacial",
      "Hotel con diferentes categorías de habitaciones",
      "Centro de entretenimiento y ocio",
    ],
    precio: 10000, // Por semana
    disponibilidad: true,
  },
]

// Datos de ejemplo para destinos disponibles por nave
const destinosDisponiblesPorNave = {
  1: [1, 2], // Luna y Estación Espacial
  2: [1], // Solo Luna
  3: [3, 4], // Marte y Venus
  4: [1, 2, 5], // Luna, Estación Espacial y Júpiter
  5: [5, 6], // Júpiter y Saturno
  6: [1], // Solo Luna
  7: [1, 2, 3], // Luna, Estación Espacial y Marte
  8: [3, 4, 5], // Marte, Venus y Júpiter
  9: [1, 2], // Luna y Estación Espacial
}

// Datos de ejemplo para naves relacionadas
const navesRelacionadasPorNave = {
  1: [2, 4, 7], // Halcón Lunar, Nexus Orbital y Crucero Estelar
  2: [1, 6], // Aurora Estelar y Artemisa Lunar
  3: [5, 8], // Solar Explorer y Defensor Espacial
  4: [1, 2, 9], // Aurora Estelar, Halcón Lunar y Estación Comercial Nexus
  5: [3, 8], // Voyager Marciano y Defensor Espacial
  6: [2], // Halcón Lunar
  7: [1, 4], // Aurora Estelar y Nexus Orbital
  8: [3, 5], // Voyager Marciano y Solar Explorer
  9: [4, 7], // Nexus Orbital y Crucero Estelar
}

// Servicio para obtener datos de naves
export const navesService = {
  // Obtener todas las naves
  async getNaves() {
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await api.get('/naves');
      // return response.data;

      // Simulamos un retraso para emular una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 800))
      return navesData
    } catch (error) {
      return handleError(error, "Error al obtener las naves")
    }
  },

  // Obtener una nave específica por ID
  async getNave(id) {
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await api.get(`/naves/${id}`);
      // return response.data;

      // Simulamos un retraso para emular una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 600))
      const naveId = Number.parseInt(id)
      const nave = navesData.find((n) => n.id === naveId)

      if (!nave) {
        throw new Error("Nave no encontrada")
      }

      return nave
    } catch (error) {
      return handleError(error, "Error al obtener la nave")
    }
  },

  // Obtener destinos disponibles para una nave
  async getDestinosDisponibles(naveId) {
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await api.get(`/naves/${naveId}/destinos`);
      // return response.data;

      // Simulamos un retraso para emular una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 700))

      const id = Number.parseInt(naveId)
      const destinosIds = destinosDisponiblesPorNave[id] || []

      // Aquí normalmente obtendríamos los datos completos de los destinos
      // Para este ejemplo, creamos objetos simples
      return destinosIds.map((destinoId) => ({
        id: destinoId,
        nombre: `Destino ${destinoId}`,
        imagen: `/images/destinos/destino-${destinoId}.jpg`,
        descripcion: `Descripción del destino ${destinoId}`,
      }))
    } catch (error) {
      return handleError(error, "Error al obtener los destinos disponibles")
    }
  },

  // Obtener naves relacionadas
  async getNavesRelacionadas(naveId) {
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await api.get(`/naves/${naveId}/relacionadas`);
      // return response.data;

      // Simulamos un retraso para emular una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 500))

      const id = Number.parseInt(naveId)
      const relacionadasIds = navesRelacionadasPorNave[id] || []

      // Obtenemos los datos completos de las naves relacionadas
      return navesData.filter((nave) => relacionadasIds.includes(nave.id))
    } catch (error) {
      return handleError(error, "Error al obtener las naves relacionadas")
    }
  },
}
