# Arquitectura de StellarTourism

## Estructura del Proyecto

La aplicación sigue una arquitectura de "Separación por Propósito" para maximizar el rendimiento y la experiencia de usuario:

### Páginas Públicas (`src/`)
- Implementadas con Astro para mejor SEO
- Incluyen: landing page, listado de destinos, páginas informativas
- Optimizadas para visitantes no autenticados
- Enfoque en rendimiento inicial y SEO

### Aplicación Autenticada (`client/`)
- Implementada con Vue.js como SPA
- Incluye: dashboard de usuario, reservas, perfil, pagos
- Optimizada para experiencia interactiva después del login
- Enfoque en interactividad y experiencia de usuario rica

### Código Compartido (`shared/`)
- Utilidades, servicios y tipos compartidos entre ambos entornos
- Evita duplicación de código
- Mantiene consistencia entre entornos

### Backend (`api/`)
- API RESTful implementada en PHP
- Sirve a ambas partes de la aplicación
- Separación clara de responsabilidades

## Diagrama de Arquitectura

\`\`\`
stellar-tourism/
├── client/                # Aplicación cliente
│   ├── src/
│   │   ├── components/    # Componentes específicos de la aplicación
│   │   ├── views/         # Páginas de para usuarios autenticados
│   │   ├── stores/        # Estado global (Pinia)
│   │   ├── router/        # Configuración de rutas
│   │   ├── pages/         # Páginas públicas de Astro
│   │   ├── layouts/       # Layouts para páginas públicas
│   │   ├── components/    # Componentes específicos para páginas públicas
│   │   └── ...
│   └─ public/             # Punto de entrada del cliente 
│
├── shared/               # Código compartido entre ambos entornos
│   ├── services/         # Servicios API y configuración
│   ├── utils/            # Utilidades comunes
│   └── types/            # Definiciones de tipos
├── api/                  # Backend PHP
└── ...


## Reglas de Desarrollo

### 1. Páginas Públicas (`pages/`)

- **Propósito**: Contenido estático o con mínima interactividad, optimizado para SEO
- **Tecnología**: Astro con componentes Vue donde sea necesario

### 2. Aplicación Autenticada (`views/`)

- **Propósito**: Experiencia interactiva rica para usuarios autenticados
- **Tecnología**: Vue.js (SPA)
- **Ejemplos**: Dashboard, gestión de reservas, perfil de usuario
- **Importaciones**: Pueden importar de `shared/` pero no de `pages/`

### 3. Código Compartido (`shared/`)

- **Propósito**: Código reutilizable entre ambos entornos
- **Contenido**: Utilidades, servicios API, tipos, configuración

## Flujo de Datos

1. **Páginas Públicas**:
   - Renderizado en servidor con Astro
   - Datos precargados para SEO
   - Hidratación selectiva para interactividad

2. **Aplicación Autenticada**:
   - Carga inicial de la aplicación
   - Autenticación del usuario
   - Carga de datos según necesidad

3. **Comunicación con Backend**:
   - API RESTful compartida
   - Autenticación mediante tokens JWT
   - Caché optimizada para rendimiento


## Consideraciones de Rendimiento

- Páginas públicas optimizadas para Core Web Vitals
- Lazy loading de componentes pesados
- Caché optimizada para consultas frecuentes
