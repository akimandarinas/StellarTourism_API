<template>
  <nav aria-label="Migas de pan" class="breadcrumb-container">
    <ol class="breadcrumb-list">
      <li 
        v-for="(item, index) in breadcrumbs" 
        :key="index" 
        class="breadcrumb-item"
        :class="{ 'breadcrumb-item-active': index === breadcrumbs.length - 1 }"
      >
        <template v-if="index === breadcrumbs.length - 1">
          <span 
            class="breadcrumb-text current" 
            aria-current="page"
          >
            {{ item.label }}
          </span>
        </template>
        <template v-else>
          <router-link 
            :to="item.path" 
            class="breadcrumb-link"
          >
            {{ item.label }}
          </router-link>
          <span class="breadcrumb-separator" aria-hidden="true">
            <ChevronRightIcon class="h-4 w-4" />
          </span>
        </template>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronRightIcon } from '@/utils/lucide-adapter';

// Props
const props = defineProps({
  // Rutas personalizadas para sobrescribir las generadas automáticamente
  customRoutes: {
    type: Array,
    default: () => []
  },
  // Si es true, no mostrará la ruta actual en las migas de pan
  hideCurrentPage: {
    type: Boolean,
    default: false
  },
  // Etiqueta personalizada para la página de inicio
  homeLabel: {
    type: String,
    default: 'Inicio'
  },
  // Mapeo de rutas a etiquetas personalizadas
  routeLabels: {
    type: Object,
    default: () => ({})
  }
});

// Composables
const route = useRoute();
const router = useRouter();

// Estado
const dynamicParams = ref({});

// Mapeo de rutas a etiquetas
const defaultRouteLabels = {
  '': props.homeLabel,
  'destinos': 'Destinos',
  'naves': 'Naves',
  'perfil': 'Mi Perfil',
  'reservas': 'Mis Reservas',
  'checkout': 'Pago',
  'sobre-nosotros': 'Sobre Nosotros',
  'contacto': 'Contacto',
  'login': 'Iniciar Sesión',
  'register': 'Registro',
  'recuperar-contrasena': 'Recuperar Contraseña',
  'seguridad': 'Seguridad',
  'nueva': 'Nueva Reserva',
  'editar': 'Editar Reserva',
  'pago': {
    'completado': 'Pago Completado',
    'cancelado': 'Pago Cancelado'
  }
};

// Combinar etiquetas predeterminadas con personalizadas
const routeLabels = computed(() => {
  return { ...defaultRouteLabels, ...props.routeLabels };
});

// Obtener etiqueta para una ruta
const getRouteLabel = (pathSegment, parentPath = '') => {
  // Si es un parámetro dinámico (comienza con :)
  if (pathSegment.startsWith(':')) {
    const paramName = pathSegment.substring(1);
    const paramValue = route.params[paramName];
    
    // Si tenemos un valor dinámico para este parámetro, usarlo
    if (dynamicParams.value[paramName]) {
      return dynamicParams.value[paramName];
    }
    
    // Si no, usar el valor del parámetro o un placeholder
    return paramValue || `[${paramName}]`;
  }
  
  // Buscar en el mapeo de rutas anidadas
  if (parentPath && routeLabels.value[parentPath] && typeof routeLabels.value[parentPath] === 'object') {
    if (routeLabels.value[parentPath][pathSegment]) {
      return routeLabels.value[parentPath][pathSegment];
    }
  }
  
  // Buscar en el mapeo de rutas planas
  if (routeLabels.value[pathSegment]) {
    return routeLabels.value[pathSegment];
  }
  
  // Si no se encuentra, capitalizar el segmento de ruta
  return pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1).replace(/-/g, ' ');
};

// Generar migas de pan basadas en la ruta actual
const generateBreadcrumbs = () => {
  // Si hay rutas personalizadas, usarlas
  if (props.customRoutes.length > 0) {
    return props.customRoutes;
  }
  
  const breadcrumbs = [];
  const pathSegments = route.path.split('/').filter(segment => segment);
  
  // Agregar inicio
  breadcrumbs.push({
    path: '/',
    label: props.homeLabel
  });
  
  // Construir rutas incrementalmente
  let currentPath = '';
  
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    
    // Verificar si es un parámetro dinámico en la definición de ruta
    const routeRecord = router.getRoutes().find(r => {
      const routePathSegments = r.path.split('/').filter(s => s);
      return routePathSegments[i] && (routePathSegments[i] === segment || routePathSegments[i].startsWith(':'));
    });
    
    if (routeRecord && routeRecord.path.split('/').filter(s => s)[i]?.startsWith(':')) {
      // Es un parámetro dinámico
      currentPath += `/${segment}`;
      
      // Si es la última parte y hideCurrentPage es true, no agregar
      if (i === pathSegments.length - 1 && props.hideCurrentPage) {
        continue;
      }
      
      const paramName = routeRecord.path.split('/').filter(s => s)[i].substring(1);
      
      // Intentar obtener una etiqueta más descriptiva
      let label = dynamicParams.value[paramName] || segment;
      
      // Si es un ID numérico, intentar hacerlo más descriptivo
      if (/^\d+$/.test(segment)) {
        const routeName = routeRecord.name;
        if (routeName?.includes('destino')) {
          label = `Destino ${segment}`;
        } else if (routeName?.includes('nave')) {
          label = `Nave ${segment}`;
        } else if (routeName?.includes('reserva')) {
          label = `Reserva ${segment}`;
        } else if (routeName?.includes('checkout')) {
          label = `Pago ${segment}`;
        }
      }
      
      breadcrumbs.push({
        path: currentPath,
        label
      });
    } else {
      // Es un segmento normal
      currentPath += `/${segment}`;
      
      // Si es la última parte y hideCurrentPage es true, no agregar
      if (i === pathSegments.length - 1 && props.hideCurrentPage) {
        continue;
      }
      
      // Determinar la etiqueta para este segmento
      const parentSegment = i > 0 ? pathSegments[i - 1] : '';
      const label = getRouteLabel(segment, parentSegment);
      
      breadcrumbs.push({
        path: currentPath,
        label
      });
    }
  }
  
  return breadcrumbs;
};

// Breadcrumbs computados
const breadcrumbs = computed(() => {
  return generateBreadcrumbs();
});

// Actualizar parámetros dinámicos
const updateDynamicParams = async () => {
  // Obtener nombre de destino para un ID
  if (route.params.id && route.path.includes('/destinos/')) {
    try {
      // Intentar obtener el nombre del destino desde el store si está disponible
      const destinosStore = window.$nuxt?.$store?.state?.destinos;
      if (destinosStore?.destinoActual?.nombre) {
        dynamicParams.value.id = destinosStore.destinoActual.nombre;
      } else {
        dynamicParams.value.id = `Destino ${route.params.id}`;
      }
    } catch (error) {
      console.error('Error al obtener detalles del destino:', error);
      dynamicParams.value.id = `Destino ${route.params.id}`;
    }
  }
  
  // Obtener nombre de nave para un ID
  if (route.params.id && route.path.includes('/naves/')) {
    try {
      // Intentar obtener el nombre de la nave desde el store si está disponible
      const navesStore = window.$nuxt?.$store?.state?.naves;
      if (navesStore?.naveActual?.nombre) {
        dynamicParams.value.id = navesStore.naveActual.nombre;
      } else {
        dynamicParams.value.id = `Nave ${route.params.id}`;
      }
    } catch (error) {
      console.error('Error al obtener detalles de la nave:', error);
      dynamicParams.value.id = `Nave ${route.params.id}`;
    }
  }
  
  // Obtener detalles de reserva para un ID
  if (route.params.id && route.path.includes('/reservas/')) {
    try {
      // Intentar obtener información de la reserva desde el store si está disponible
      const reservasStore = window.$nuxt?.$store?.state?.reservas;
      if (reservasStore?.reservaActual?.codigo) {
        dynamicParams.value.id = `Reserva ${reservasStore.reservaActual.codigo}`;
      } else {
        dynamicParams.value.id = `Reserva ${route.params.id}`;
      }
    } catch (error) {
      console.error('Error al obtener detalles de la reserva:', error);
      dynamicParams.value.id = `Reserva ${route.params.id}`;
    }
  }
  
  // Obtener detalles de checkout
  if (route.params.id && route.path.includes('/checkout/')) {
    dynamicParams.value.id = `Pago de Reserva ${route.params.id}`;
  }
};

// Observar cambios en la ruta
watch(
  () => route.path,
  () => {
    updateDynamicParams();
  }
);

// Inicializar
onMounted(() => {
  updateDynamicParams();
});

const breadcrumbItems = computed(() => {
  return breadcrumbs.value.map(crumb => ({
    name: crumb.label,
    path: crumb.path,
    external: false // Assuming all links are internal initially
  }));
});
</script>

<style scoped>
.breadcrumb-container {
  padding: 0.75rem 0;
  margin-bottom: 1rem;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover,
.breadcrumb-link:focus {
  color: var(--color-primary);
  outline: none;
}

.breadcrumb-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

.breadcrumb-text {
  color: var(--color-text-primary);
}

.breadcrumb-text.current {
  font-weight: 500;
  color: var(--color-primary);
}

.breadcrumb-separator {
  display: flex;
  align-items: center;
  color: var(--color-text-tertiary);
  margin: 0 0.5rem;
}

.breadcrumb-item-active {
  font-weight: 500;
}

@media (max-width: 640px) {
  .breadcrumb-container {
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
  }
}
</style>
