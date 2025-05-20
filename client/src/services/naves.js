import { handleError } from "../utils/error-handler"

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
]

// Datos de ejemplo para destinos disponibles por nave
const destinosDisponiblesPorNave = {
  1: [1, 2], // Luna y Estación Espacial
  2: [1], // Solo Luna
  3: [3, 4], // Marte y Venus
  4: [1, 2, 5], // Luna, Estación Espacial y Júpiter
  5: [5, 6], // Júpiter y Saturno
  6: [1], // Solo Luna
}

// Datos de ejemplo para naves relacionadas
const navesRelacionadasPorNave = {
  1: [2, 4], // Halcón Lunar y Nexus Orbital
  2: [1, 6], // Aurora Estelar y Artemisa Lunar
  3: [5], // Solar Explorer
  4: [1, 2], // Aurora Estelar y Halcón Lunar
  5: [3], // Voyager Marciano
  6: [2], // Halcón Lunar
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
